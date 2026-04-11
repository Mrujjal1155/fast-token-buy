import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const NOWPAYBD_URL = "https://pay.nowpaybd.com/api/payment/create";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const NOWPAYBD_API_KEY = Deno.env.get("NOWPAYBD_API_KEY");
    const NOWPAYBD_SECRET_KEY = Deno.env.get("NOWPAYBD_SECRET_KEY");
    const NOWPAYBD_BRAND_KEY = Deno.env.get("NOWPAYBD_BRAND_KEY");

    if (!NOWPAYBD_API_KEY || !NOWPAYBD_SECRET_KEY || !NOWPAYBD_BRAND_KEY) {
      return new Response(
        JSON.stringify({ error: "NowPayBD API keys not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { amount, order_id, customer_email, customer_name, success_url, cancel_url } = await req.json();

    if (!amount || !order_id || !customer_email || !success_url || !cancel_url) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload = {
      cus_name: customer_name || "Customer",
      cus_email: customer_email,
      amount: String(amount),
      success_url,
      cancel_url,
      meta_data: JSON.stringify({ order_id }),
    };

    console.log("NowPayBD request:", JSON.stringify(payload));

    const response = await fetch(NOWPAYBD_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "API-KEY": NOWPAYBD_API_KEY,
        "SECRET-KEY": NOWPAYBD_SECRET_KEY,
        "BRAND-KEY": NOWPAYBD_BRAND_KEY,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log("NowPayBD response:", JSON.stringify(data));

    if ((data.status === true || data.status === 1) && data.payment_url) {
      return new Response(
        JSON.stringify({ payment_url: data.payment_url }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      return new Response(
        JSON.stringify({ error: data.message || "NowPayBD payment creation failed", response: data }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("NowPayBD create payment error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
