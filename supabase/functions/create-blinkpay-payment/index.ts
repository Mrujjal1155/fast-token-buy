import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BLINKPAY_BASE = "https://adwtrqqrlniidweympiz.supabase.co/functions/v1";

const BodySchema = z.object({
  amount: z.number().positive(),
  order_id: z.string().min(1).max(100),
  token: z.string().default("USDT"),
  network: z.string().default("tron"),
  customer_email: z.string().email().optional(),
  return_url: z.string().url(),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const BLINKPAY_API_KEY = Deno.env.get('BLINKPAY_API_KEY');
    const BLINKPAY_API_SECRET = Deno.env.get('BLINKPAY_API_SECRET');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');

    if (!BLINKPAY_API_KEY || !BLINKPAY_API_SECRET) {
      throw new Error('BlinkPay credentials not configured');
    }

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { amount, order_id, token, network, customer_email, return_url } = parsed.data;

    // Convert BDT to USD (1 USD ≈ 130 BDT)
    const BDT_TO_USD_RATE = 130;
    const amountInUSD = parseFloat((amount / BDT_TO_USD_RATE).toFixed(2));

    // Ensure minimum $0.01
    const finalAmount = Math.max(amountInUSD, 0.01);

    console.log(`Converting: ৳${amount} BDT → $${finalAmount} USD (rate: 1 USD = ${BDT_TO_USD_RATE} BDT)`);

    // Build callback URL pointing to our webhook edge function
    const callback_url = `${SUPABASE_URL}/functions/v1/blinkpay-webhook`;

    const requestBody = {
      amount: finalAmount,
      token,
      network,
      order_id,
      customer_email,
      callback_url,
      return_url,
      metadata: { order_id },
    };

    console.log('BlinkPay create payment request:', JSON.stringify(requestBody));

    const response = await fetch(`${BLINKPAY_BASE}/gateway-create-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': BLINKPAY_API_KEY,
        'x-api-secret': BLINKPAY_API_SECRET,
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    console.log('BlinkPay API response:', JSON.stringify(data));

    if (!response.ok) {
      console.error('BlinkPay API error:', data);
      return new Response(JSON.stringify({ error: data.error || 'Failed to create payment' }), {
        status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Return payment_url and payment_id to the client
    return new Response(JSON.stringify({
      payment_url: data.payment_url,
      payment_id: data.payment_id || data.id,
      ...data,
    }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
