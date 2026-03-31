import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const VERIFY_URL = "https://pay.ajkerpay.xyz/api/payment/verify";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const AJKERPAY_API_KEY = Deno.env.get("AJKERPAY_API_KEY");
    const AJKERPAY_SECRET_KEY = Deno.env.get("AJKERPAY_SECRET_KEY");
    const AJKERPAY_BRAND_KEY = Deno.env.get("AJKERPAY_BRAND_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!AJKERPAY_API_KEY || !AJKERPAY_SECRET_KEY || !AJKERPAY_BRAND_KEY) {
      return new Response(
        JSON.stringify({ error: "AjkerPay API keys not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { transaction_id, order_id } = await req.json();

    if (!transaction_id) {
      return new Response(
        JSON.stringify({ error: "transaction_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify with AjkerPay
    const response = await fetch(VERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "API-KEY": AJKERPAY_API_KEY,
        "SECRET-KEY": AJKERPAY_SECRET_KEY,
        "BRAND-KEY": AJKERPAY_BRAND_KEY,
      },
      body: JSON.stringify({ transaction_id }),
    });

    const data = await response.json();

    // Update order status in DB if order_id provided
    if (order_id) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      
      const status = data.status === "COMPLETED" ? "completed" 
        : data.status === "PENDING" ? "processing" 
        : "failed";

      await supabase
        .from("orders")
        .update({ 
          status,
          transaction_id: transaction_id,
          payment_method: data.payment_method ? `ajkerpay-${data.payment_method}` : "ajkerpay",
        })
        .eq("order_id", order_id);
    }

    return new Response(
      JSON.stringify(data),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("AjkerPay verify error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
