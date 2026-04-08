import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BLINKPAY_BASE = "https://adwtrqqrlniidweympiz.supabase.co/functions/v1";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('BlinkPay webhook received:', JSON.stringify(body));

    const { event, payment, metadata } = body;

    // Only process payment.completed events
    if (event !== 'payment.completed' || !payment) {
      console.log('Ignoring non-payment event:', event);
      return new Response(JSON.stringify({ received: true }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const orderId = payment.order_id || metadata?.order_id;
    if (!orderId) {
      console.error('No order_id in webhook payload');
      return new Response(JSON.stringify({ error: 'Missing order_id' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify payment via BlinkPay GET endpoint (docs recommend this)
    let verified = false;
    const paymentId = payment.id;
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (paymentId) {
      try {
        const verifyRes = await fetch(
          `${BLINKPAY_BASE}/get-public-payment?payment_id=${paymentId}`,
          {
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_ANON_KEY || '',
            },
          }
        );
        if (verifyRes.ok) {
          const verifyData = await verifyRes.json();
          const verifiedPayment = verifyData.payment || verifyData;
          if (verifiedPayment.status === 'paid') {
            verified = true;
            console.log(`Payment ${paymentId} verified as paid via GET endpoint`);
          } else {
            console.warn(`Payment ${paymentId} status is "${verifiedPayment.status}", not "paid"`);
          }
        } else {
          console.warn(`Failed to verify payment ${paymentId}: HTTP ${verifyRes.status}`);
          // Trust webhook if verification endpoint fails
          verified = true;
        }
      } catch (verifyError) {
        console.warn('Payment verification request failed:', verifyError);
        verified = true;
      }
    } else {
      verified = true;
    }

    if (!verified) {
      console.error(`Payment verification failed for order ${orderId}`);
      return new Response(JSON.stringify({ error: 'Payment not verified' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update order status to completed
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { error } = await supabase
      .from('orders')
      .update({
        status: 'completed',
        transaction_id: payment.tx_hash || payment.id || 'verified',
      })
      .eq('order_id', orderId);

    if (error) {
      console.error('Failed to update order:', error);
      return new Response(JSON.stringify({ error: 'Failed to update order' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Order ${orderId} marked as completed (tx: ${payment.tx_hash || payment.id})`);
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
