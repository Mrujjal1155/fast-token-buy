import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BRAND = "#FF7A18";
const BG = "#0F172A";
const CARD = "#1E293B";
const TEXT = "#E2E8F0";
const MUTED = "#94A3B8";

function emailShell(siteName: string, subtitle: string, inner: string): string {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${BG};font-family:'Segoe UI',Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:40px 20px;">
  <div style="text-align:center;margin-bottom:30px;">
    <h1 style="color:${BRAND};font-size:24px;margin:0;">${siteName}</h1>
    <p style="color:${MUTED};font-size:13px;margin:5px 0 0;">${subtitle}</p>
  </div>
  <div style="background:${CARD};border-radius:16px;padding:30px;border:1px solid rgba(255,255,255,0.05);">
    ${inner}
  </div>
  <p style="text-align:center;color:${MUTED};font-size:11px;margin-top:30px;">&copy; ${year} ${siteName}</p>
</div>
</body></html>`;
}

function row(label: string, value: string, isLast = false): string {
  const border = isLast ? "" : "border-bottom:1px solid rgba(255,255,255,0.05);";
  return `<tr><td style="padding:12px 0;${border}color:${MUTED};font-size:13px;">${label}</td><td style="padding:12px 0;${border}color:${TEXT};font-size:14px;font-weight:600;text-align:right;">${value}</td></tr>`;
}

function badge(text: string, color: string): string {
  return `<span style="background:${color}20;color:${color};padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;">${text}</span>`;
}

function infoBox(msg: string, color: string): string {
  return `<div style="margin-top:25px;padding:15px;background:${color}10;border-radius:12px;border:1px solid ${color}30;"><p style="color:${TEXT};font-size:13px;margin:0;text-align:center;">${msg}</p></div>`;
}

function heroIcon(emoji: string, color: string): string {
  return `<div style="text-align:center;margin-bottom:25px;"><div style="width:60px;height:60px;border-radius:50%;background:${color}20;display:inline-flex;align-items:center;justify-content:center;"><span style="font-size:28px;">${emoji}</span></div>`;
}

function buildEmail(type: string, d: Record<string, any>): string {
  const sn = d.site_name || "FastTokenBuy";

  if (type === "admin_order") {
    const inner = heroIcon("🔔", BRAND) +
      `<h2 style="color:${TEXT};font-size:20px;margin:15px 0 5px;">নতুন অর্ডার এসেছে!</h2><p style="color:${MUTED};font-size:14px;margin:0;">New Order Received</p></div>` +
      `<table style="width:100%;border-collapse:collapse;">` +
      row("Order ID", `<span style="font-family:monospace;">${d.order_id}</span>`) +
      row("Customer", d.email) +
      row("Credits", `<span style="color:${BRAND}">${d.credits}</span>`) +
      row("Amount", "৳" + d.amount) +
      row("Payment", d.payment_method) +
      `<tr><td style="padding:12px 0;color:${MUTED};font-size:13px;">Status</td><td style="padding:12px 0;text-align:right;">${badge("⏳ Pending", BRAND)}</td></tr>` +
      `</table>`;
    return emailShell(sn, "Admin Notification", inner);
  }

  if (type === "credit_delivered") {
    const inner = heroIcon("🎉", "#10B981") +
      `<h2 style="color:${TEXT};font-size:20px;margin:15px 0 5px;">আপনার ক্রেডিট ডেলিভারি সম্পন্ন!</h2><p style="color:${MUTED};font-size:14px;margin:0;">Your credits have been delivered</p></div>` +
      `<table style="width:100%;border-collapse:collapse;">` +
      row("Order ID", `<span style="font-family:monospace;">${d.order_id}</span>`) +
      row("Credits", `<span style="color:${BRAND};font-size:18px;font-weight:700;">${d.credits} Credits</span>`) +
      row("Amount Paid", "৳" + d.amount) +
      `<tr><td style="padding:12px 0;color:${MUTED};font-size:13px;">Status</td><td style="padding:12px 0;text-align:right;">${badge("✅ Completed", "#10B981")}</td></tr>` +
      `</table>` +
      infoBox("আপনার একাউন্টে ক্রেডিট যোগ করা হয়েছে। ধন্যবাদ!", BRAND);
    return emailShell(sn, "Order Update", inner);
  }

  if (type === "order_timeout" || type === "order_failed") {
    const isTimeout = type === "order_timeout";
    const isAdmin = d.is_admin;
    const emoji = isTimeout ? "⏰" : "❌";
    const col = "#EF4444";
    const heading = isAdmin
      ? (isTimeout ? "অর্ডার টাইমআউট হয়েছে" : "অর্ডার ব্যর্থ হয়েছে")
      : (isTimeout ? "আপনার অর্ডার টাইম আউট হয়েছে" : "আপনার অর্ডার ব্যর্থ হয়েছে");
    const sub = isAdmin
      ? (isTimeout ? "Order payment timed out" : "Order marked as failed")
      : (isTimeout ? "Your order expired due to payment timeout" : "Your order could not be completed");
    const lbl = isTimeout ? "⏰ Timed Out" : "❌ Failed";
    const foot = isAdmin
      ? (isTimeout ? "এই অর্ডারটি ৩০ মিনিটের মধ্যে পেমেন্ট না করায় অটো ক্যান্সেল হয়েছে।" : "এই অর্ডারটি অ্যাডমিন দ্বারা ব্যর্থ চিহ্নিত করা হয়েছে।")
      : (isTimeout ? "নির্ধারিত সময়ের মধ্যে পেমেন্ট সম্পন্ন না হওয়ায় অর্ডারটি বাতিল হয়েছে। পুনরায় অর্ডার করতে আমাদের ওয়েবসাইট ভিজিট করুন।" : "আপনার অর্ডারটি সম্পন্ন করা সম্ভব হয়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন অথবা আমাদের সাথে যোগাযোগ করুন।");

    let rows = row("Order ID", `<span style="font-family:monospace;">${d.order_id}</span>`);
    if (isAdmin) rows += row("Customer", d.email);
    rows += row("Credits", `<span style="color:${BRAND};font-size:16px;font-weight:700;">${d.credits}</span>`);
    rows += row("Amount", "৳" + d.amount);

    const inner = heroIcon(emoji, col) +
      `<h2 style="color:${TEXT};font-size:20px;margin:15px 0 5px;">${heading}</h2><p style="color:${MUTED};font-size:14px;margin:0;">${sub}</p></div>` +
      `<table style="width:100%;border-collapse:collapse;">${rows}` +
      `<tr><td style="padding:12px 0;color:${MUTED};font-size:13px;">Status</td><td style="padding:12px 0;text-align:right;">${badge(lbl, col)}</td></tr></table>` +
      infoBox(foot, col);
    return emailShell(sn, isAdmin ? "Admin Alert" : "Order Update", inner);
  }

  // customer_order (default)
  const inner = heroIcon("📦", BRAND) +
    `<h2 style="color:${TEXT};font-size:20px;margin:15px 0 5px;">অর্ডার সফলভাবে জমা হয়েছে!</h2><p style="color:${MUTED};font-size:14px;margin:0;">Your order has been placed successfully</p></div>` +
    `<table style="width:100%;border-collapse:collapse;">` +
    row("Order ID", `<span style="font-family:monospace;">${d.order_id}</span>`) +
    row("Credits", `<span style="color:${BRAND};font-size:16px;font-weight:700;">${d.credits}</span>`) +
    row("Amount", "৳" + d.amount) +
    row("Payment", d.payment_method) +
    `<tr><td style="padding:12px 0;color:${MUTED};font-size:13px;">Status</td><td style="padding:12px 0;text-align:right;">${badge("⏳ Processing", BRAND)}</td></tr>` +
    `</table>` +
    infoBox("আপনার অর্ডারটি প্রক্রিয়াধীন আছে। শীঘ্রই ক্রেডিট ডেলিভারি করা হবে।", BRAND);
  return emailShell(sn, "Order Confirmation", inner);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { type, data } = await req.json();
    console.log(`Sending email: type=${type}`, JSON.stringify(data));

    const { data: settings } = await supabase
      .from('site_settings')
      .select('key, value')
      .like('key', 'smtp_%');

    if (!settings || settings.length === 0) {
      return new Response(JSON.stringify({ error: 'SMTP not configured' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const cfg: Record<string, string> = {};
    settings.forEach((s: { key: string; value: string }) => { cfg[s.key] = s.value; });

    const host = cfg['smtp_host'];
    const port = parseInt(cfg['smtp_port'] || '465');
    const username = cfg['smtp_username'] || '';
    const password = cfg['smtp_password'] || '';
    const encryption = cfg['smtp_encryption'] || 'ssl';
    const fromEmail = cfg['smtp_from_email'] || username;
    const fromName = cfg['smtp_from_name'] || 'FastTokenBuy';
    const adminEmail = cfg['smtp_admin_email'] || '';

    if (!host || !username || !password) {
      return new Response(JSON.stringify({ error: 'Incomplete SMTP configuration' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const client = new SMTPClient({
      connection: { hostname: host, port, tls: encryption === 'ssl', auth: { username, password } },
    });

    const sn = fromName;
    const emails: Array<{ to: string; subject: string; html: string }> = [];

    if (type === 'order_submitted') {
      emails.push({
        to: data.email,
        subject: `✅ অর্ডার কনফার্ম — ${data.order_id} | ${sn}`,
        html: buildEmail('customer_order', { ...data, site_name: sn }),
      });
      if (adminEmail) {
        emails.push({
          to: adminEmail,
          subject: `🔔 নতুন অর্ডার — ${data.order_id} | ৳${data.amount}`,
          html: buildEmail('admin_order', { ...data, site_name: sn }),
        });
      }
    } else if (type === 'credit_delivered') {
      emails.push({
        to: data.email,
        subject: `🎉 ক্রেডিট ডেলিভারি সম্পন্ন — ${data.order_id} | ${sn}`,
        html: buildEmail('credit_delivered', { ...data, site_name: sn }),
      });
    } else if (type === 'order_timeout') {
      emails.push({
        to: data.email,
        subject: `⏰ অর্ডার টাইম আউট — ${data.order_id} | ${sn}`,
        html: buildEmail('order_timeout', { ...data, site_name: sn }),
      });
      if (adminEmail) {
        emails.push({
          to: adminEmail,
          subject: `⏰ অর্ডার টাইমআউট — ${data.order_id} | ৳${data.amount}`,
          html: buildEmail('order_timeout', { ...data, site_name: sn, is_admin: true }),
        });
      }
    } else if (type === 'order_failed') {
      emails.push({
        to: data.email,
        subject: `❌ অর্ডার ব্যর্থ — ${data.order_id} | ${sn}`,
        html: buildEmail('order_failed', { ...data, site_name: sn }),
      });
      if (adminEmail) {
        emails.push({
          to: adminEmail,
          subject: `❌ অর্ডার ব্যর্থ — ${data.order_id} | ৳${data.amount}`,
          html: buildEmail('order_failed', { ...data, site_name: sn, is_admin: true }),
        });
      }
    }

    for (const em of emails) {
      await client.send({
        from: `${fromName} <${fromEmail}>`,
        to: em.to,
        subject: em.subject,
        content: "auto",
        html: em.html,
      });
      console.log(`Email sent to: ${em.to}`);
    }

    await client.close();

    return new Response(JSON.stringify({ success: true, sent: emails.length }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('SMTP Error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
