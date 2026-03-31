import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AJKERPAY_URL = "https://pay.ajkerpay.xyz/api/payment/create";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const AJKERPAY_API_KEY = Deno.env.get("AJKERPAY_API_KEY");
    const AJKERPAY_SECRET_KEY = Deno.env.get("AJKERPAY_SECRET_KEY");
    const AJKERPAY_BRAND_KEY = Deno.env.get("AJKERPAY_BRAND_KEY");

    console.log("AjkerPay keys present:", {
      API_KEY: !!AJKERPAY_API_KEY,
      SECRET_KEY: !!AJKERPAY_SECRET_KEY,
      BRAND_KEY: !!AJKERPAY_BRAND_KEY,
    });

    if (!AJKERPAY_API_KEY || !AJKERPAY_SECRET_KEY || !AJKERPAY_BRAND_KEY) {
      return new Response(
        JSON.stringify({ error: "AjkerPay API keys not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { amount, order_id, customer_email, customer_name, success_url, cancel_url } = await req.json();

    if (!amount || !order_id || !customer_email || !success_url || !cancel_url) {
      return new Response(
        JSON.stringify({ error: "Missing required fields", details: { amount: !!amount, order_id: !!order_id, customer_email: !!customer_email, success_url: !!success_url, cancel_url: !!cancel_url } }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload = {
      cus_name: customer_name || "Customer",
      cus_email: customer_email,
      amount: String(amount),
      success_url: success_url,
      cancel_url: cancel_url,
      metadata: { order_id },
    };

    console.log("AjkerPay request payload:", JSON.stringify(payload));

    const response = await fetch(AJKERPAY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "API-KEY": AJKERPAY_API_KEY,
        "SECRET-KEY": AJKERPAY_SECRET_KEY,
        "BRAND-KEY": AJKERPAY_BRAND_KEY,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log("AjkerPay response:", JSON.stringify(data));

    if ((data.status === true || data.status === 1) && data.payment_url) {
      return new Response(
        JSON.stringify({ payment_url: data.payment_url }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      return new Response(
        JSON.stringify({ error: data.message || "AjkerPay payment creation failed", ajkerpay_response: data }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("AjkerPay create payment error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
