import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const NOWPAYBD_VERIFY_URL = "https://pay.nowpaybd.com/api/payment/verify";

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

    const { transaction_id, order_id } = await req.json();

    if (!transaction_id || !order_id) {
      return new Response(
        JSON.stringify({ error: "Missing transaction_id or order_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Idempotency check: skip if order already completed/failed
    const { data: existingOrder } = await supabase
      .from("orders")
      .select("status")
      .eq("order_id", order_id)
      .single();

    if (existingOrder && (existingOrder.status === "completed" || existingOrder.status === "failed")) {
      console.log(`Order ${order_id} already ${existingOrder.status}, skipping verification`);
      return new Response(
        JSON.stringify({ status: existingOrder.status, already_processed: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify with NowPayBD
    const verifyResponse = await fetch(NOWPAYBD_VERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "API-KEY": NOWPAYBD_API_KEY,
        "SECRET-KEY": NOWPAYBD_SECRET_KEY,
        "BRAND-KEY": NOWPAYBD_BRAND_KEY,
      },
      body: JSON.stringify({ transaction_id }),
    });

    const verifyData = await verifyResponse.json();
    console.log("NowPayBD verify response:", JSON.stringify(verifyData));

    // Update order in database
    const status = verifyData.status === "COMPLETED" ? "completed" : 
                   verifyData.status === "PENDING" ? "pending" : "failed";

    await supabase
      .from("orders")
      .update({
        status,
        transaction_id,
        admin_notes: `NowPayBD: ${verifyData.status} | Method: ${verifyData.payment_method || "N/A"}`,
      })
      .eq("order_id", order_id);

    return new Response(
      JSON.stringify({ status, verify_data: verifyData }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("NowPayBD verify error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
