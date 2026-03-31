import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('BlinkPay webhook received:', JSON.stringify(body));

    const { event, payment, metadata } = body;

    if (event !== 'payment.completed' || !payment) {
      return new Response(JSON.stringify({ received: true }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const orderId = metadata?.order_id || payment.order_id;
    if (!orderId) {
      console.error('No order_id in webhook payload');
      return new Response(JSON.stringify({ error: 'Missing order_id' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use service role to update order status
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { error } = await supabase
      .from('orders')
      .update({
        status: 'processing',
        transaction_id: payment.tx_hash || payment.id,
      })
      .eq('order_id', orderId);

    if (error) {
      console.error('Failed to update order:', error);
      return new Response(JSON.stringify({ error: 'Failed to update order' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Order ${orderId} marked as completed`);
    return new Response(JSON.stringify({ received: true }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
