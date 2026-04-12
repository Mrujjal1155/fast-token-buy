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
const GREEN = "#10B981";
const RED = "#EF4444";

function sanitizeConfigValue(value?: string): string {
  return typeof value === "string" ? value.trim() : "";
}

function replacePlaceholders(template: string, d: Record<string, any>): string {
  return template
    .replace(/\{order_id\}/g, d.order_id || "")
    .replace(/\{credits\}/g, String(d.credits || ""))
    .replace(/\{amount\}/g, String(d.amount || ""))
    .replace(/\{site_name\}/g, d.site_name || "FastTokenBuy")
    .replace(/\{email\}/g, d.email || "")
    .replace(/\{payment_method\}/g, d.payment_method || "");
}

function emailShell(siteName: string, subtitle: string, inner: string, logoUrl?: string): string {
  const year = new Date().getFullYear();
  const logoBlock = logoUrl
    ? `<img src="${logoUrl}" alt="${siteName}" style="max-width:180px;max-height:60px;margin-bottom:10px;" />`
    : `<h1 style="color:${BRAND};font-size:24px;margin:0;font-weight:700;">${siteName}</h1>`;
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${BG};font-family:'Segoe UI',Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:40px 20px;">
  <div style="text-align:center;margin-bottom:30px;">
    ${logoBlock}
    <p style="color:${MUTED};font-size:13px;margin:5px 0 0;">${subtitle}</p>
  </div>
  <div style="background:${CARD};border-radius:16px;padding:30px;border:1px solid rgba(255,255,255,0.08);">
    ${inner}
  </div>
  <p style="text-align:center;color:${MUTED};font-size:11px;margin-top:30px;">&copy; ${year} ${siteName}. All rights reserved.</p>
</div>
</body></html>`;
}

function row(label: string, value: string, isLast = false): string {
  const border = isLast ? "" : "border-bottom:1px solid rgba(255,255,255,0.06);";
  return `<tr><td style="padding:14px 0;${border}color:${MUTED};font-size:13px;width:40%;">${label}</td><td style="padding:14px 0;${border}color:${TEXT};font-size:14px;font-weight:600;text-align:right;">${value}</td></tr>`;
}

function badge(text: string, color: string): string {
  return `<span style="background:${color}15;color:${color};padding:5px 14px;border-radius:20px;font-size:12px;font-weight:600;letter-spacing:0.3px;">${text}</span>`;
}

function infoBox(msg: string, color: string): string {
  return `<div style="margin-top:25px;padding:16px 20px;background:${color}0A;border-radius:12px;border-left:3px solid ${color};"><p style="color:${TEXT};font-size:13px;margin:0;line-height:1.6;">${msg}</p></div>`;
}

function statusIcon(type: string): string {
  const configs: Record<string, { emoji: string; bg: string; color: string }> = {
    order: { emoji: "📦", bg: `${BRAND}22`, color: BRAND },
    admin: { emoji: "🔔", bg: `${BRAND}22`, color: BRAND },
    delivered: { emoji: "✅", bg: `${GREEN}22`, color: GREEN },
    timeout: { emoji: "⏰", bg: `${RED}22`, color: RED },
    failed: { emoji: "❌", bg: `${RED}22`, color: RED },
  };
  const c = configs[type] || configs.order;
  return `<div style="text-align:center;margin-bottom:25px;"><div style="width:72px;height:72px;border-radius:50%;background:${c.bg};display:inline-block;line-height:72px;font-size:32px;border:2px solid ${c.color}33;">${c.emoji}</div>`;
}

function buildEmail(type: string, d: Record<string, any>, tpl: Record<string, string>): string {
  const sn = d.site_name || "FastTokenBuy";
  const logo = d.logo_url || "";

  if (type === "admin_order") {
    const heading = replacePlaceholders(tpl.email_tpl_admin_heading || "নতুন অর্ডার এসেছে!", d);
    const headingEn = replacePlaceholders(tpl.email_tpl_admin_heading_en || "New Order Received", d);
    const inner = statusIcon("admin") +
      `<h2 style="color:${TEXT};font-size:20px;margin:15px 0 5px;font-weight:700;">${heading}</h2><p style="color:${MUTED};font-size:14px;margin:0 0 20px;">${headingEn}</p></div>` +
      `<table style="width:100%;border-collapse:collapse;">` +
      row("Order ID", `<span style="font-family:monospace;color:${BRAND};">${d.order_id}</span>`) +
      row("Customer", d.email) +
      row("Credits", `<span style="color:${BRAND};font-weight:700;">${d.credits}</span>`) +
      row("Amount", `<span style="font-weight:700;">&#2547;${d.amount}</span>`) +
      row("Payment", d.payment_method) +
      `<tr><td style="padding:14px 0;color:${MUTED};font-size:13px;">Status</td><td style="padding:14px 0;text-align:right;">${badge("Pending", BRAND)}</td></tr>` +
      `</table>`;
    return emailShell(sn, "Admin Notification", inner, logo);
  }

  if (type === "credit_delivered") {
    const heading = replacePlaceholders(tpl.email_tpl_delivered_heading || "আপনার ক্রেডিট ডেলিভারি সম্পন্ন!", d);
    const headingEn = replacePlaceholders(tpl.email_tpl_delivered_heading_en || "Your credits have been delivered", d);
    const footer = replacePlaceholders(tpl.email_tpl_delivered_footer || "আপনার একাউন্টে ক্রেডিট যোগ করা হয়েছে। ধন্যবাদ!", d);
    const inner = statusIcon("delivered") +
      `<h2 style="color:${TEXT};font-size:20px;margin:15px 0 5px;font-weight:700;">${heading}</h2><p style="color:${MUTED};font-size:14px;margin:0 0 20px;">${headingEn}</p></div>` +
      `<table style="width:100%;border-collapse:collapse;">` +
      row("Order ID", `<span style="font-family:monospace;color:${BRAND};">${d.order_id}</span>`) +
      row("Credits", `<span style="color:${GREEN};font-size:18px;font-weight:700;">${d.credits} Credits</span>`) +
      row("Amount Paid", `<span style="font-weight:700;">&#2547;${d.amount}</span>`) +
      `<tr><td style="padding:14px 0;color:${MUTED};font-size:13px;">Status</td><td style="padding:14px 0;text-align:right;">${badge("Completed", GREEN)}</td></tr>` +
      `</table>` +
      infoBox(footer, GREEN);
    return emailShell(sn, "Order Update", inner, logo);
  }

  if (type === "order_timeout" || type === "order_failed") {
    const isTimeout = type === "order_timeout";
    const isAdmin = d.is_admin;
    const iconType = isTimeout ? "timeout" : "failed";

    let heading: string, sub: string, foot: string;

    if (isTimeout) {
      heading = isAdmin
        ? replacePlaceholders(tpl.email_tpl_timeout_heading || "অর্ডার টাইমআউট হয়েছে", d)
        : replacePlaceholders(tpl.email_tpl_timeout_heading || "আপনার অর্ডার টাইম আউট হয়েছে", d);
      sub = isAdmin ? "Order payment timed out" : "Your order expired due to payment timeout";
      foot = isAdmin
        ? "এই অর্ডারটি ৩০ মিনিটের মধ্যে পেমেন্ট না করায় অটো ক্যান্সেল হয়েছে।"
        : replacePlaceholders(tpl.email_tpl_timeout_footer || "নির্ধারিত সময়ের মধ্যে পেমেন্ট সম্পন্ন না হওয়ায় অর্ডারটি বাতিল হয়েছে। পুনরায় অর্ডার করতে আমাদের ওয়েবসাইট ভিজিট করুন।", d);
    } else {
      heading = isAdmin
        ? replacePlaceholders(tpl.email_tpl_failed_heading || "অর্ডার ব্যর্থ হয়েছে", d)
        : replacePlaceholders(tpl.email_tpl_failed_heading || "আপনার অর্ডার ব্যর্থ হয়েছে", d);
      sub = isAdmin ? "Order marked as failed" : "Your order could not be completed";
      foot = isAdmin
        ? "এই অর্ডারটি অ্যাডমিন দ্বারা ব্যর্থ চিহ্নিত করা হয়েছে।"
        : replacePlaceholders(tpl.email_tpl_failed_footer || "আপনার অর্ডারটি সম্পন্ন করা সম্ভব হয়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন অথবা আমাদের সাথে যোগাযোগ করুন।", d);
    }

    const statusLabel = isTimeout ? "Timed Out" : "Failed";
    let rows = row("Order ID", `<span style="font-family:monospace;color:${BRAND};">${d.order_id}</span>`);
    if (isAdmin) rows += row("Customer", d.email);
    rows += row("Credits", `<span style="color:${BRAND};font-size:16px;font-weight:700;">${d.credits}</span>`);
    rows += row("Amount", `<span style="font-weight:700;">&#2547;${d.amount}</span>`);

    const inner = statusIcon(iconType) +
      `<h2 style="color:${TEXT};font-size:20px;margin:15px 0 5px;font-weight:700;">${heading}</h2><p style="color:${MUTED};font-size:14px;margin:0 0 20px;">${sub}</p></div>` +
      `<table style="width:100%;border-collapse:collapse;">${rows}` +
      `<tr><td style="padding:14px 0;color:${MUTED};font-size:13px;">Status</td><td style="padding:14px 0;text-align:right;">${badge(statusLabel, RED)}</td></tr></table>` +
      infoBox(foot, RED);
    return emailShell(sn, isAdmin ? "Admin Alert" : "Order Update", inner, logo);
  }

  // customer_order (default)
  const heading = replacePlaceholders(tpl.email_tpl_order_heading || "অর্ডার সফলভাবে জমা হয়েছে!", d);
  const headingEn = replacePlaceholders(tpl.email_tpl_order_heading_en || "Your order has been placed successfully", d);
  const footer = replacePlaceholders(tpl.email_tpl_order_footer || "আপনার অর্ডারটি প্রক্রিয়াধীন আছে। শীঘ্রই ক্রেডিট ডেলিভারি করা হবে।", d);
  const inner = statusIcon("order") +
    `<h2 style="color:${TEXT};font-size:20px;margin:15px 0 5px;font-weight:700;">${heading}</h2><p style="color:${MUTED};font-size:14px;margin:0 0 20px;">${headingEn}</p></div>` +
    `<table style="width:100%;border-collapse:collapse;">` +
    row("Order ID", `<span style="font-family:monospace;color:${BRAND};">${d.order_id}</span>`) +
    row("Credits", `<span style="color:${BRAND};font-size:16px;font-weight:700;">${d.credits}</span>`) +
    row("Amount", `<span style="font-weight:700;">&#2547;${d.amount}</span>`) +
    row("Payment", d.payment_method) +
    `<tr><td style="padding:14px 0;color:${MUTED};font-size:13px;">Status</td><td style="padding:14px 0;text-align:right;">${badge("Processing", BRAND)}</td></tr>` +
    `</table>` +
    infoBox(footer, BRAND);
  return emailShell(sn, "Order Confirmation", inner, logo);
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
      .or('key.like.smtp_%,key.eq.site_logo,key.like.email_tpl_%');

    if (!settings || settings.length === 0) {
      return new Response(JSON.stringify({ error: 'SMTP not configured' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const cfg: Record<string, string> = {};
    const tpl: Record<string, string> = {};
    settings.forEach((s: { key: string; value: string }) => {
      if (s.key.startsWith('email_tpl_')) {
        tpl[s.key] = s.value;
      } else {
        cfg[s.key] = s.value;
      }
    });
    const logoUrl = sanitizeConfigValue(cfg['site_logo']);

    const host = sanitizeConfigValue(cfg['smtp_host']);
    const parsedPort = Number.parseInt(sanitizeConfigValue(cfg['smtp_port']) || '465', 10);
    const port = Number.isFinite(parsedPort) ? parsedPort : 465;
    const username = sanitizeConfigValue(cfg['smtp_username']);
    const password = cfg['smtp_password'] || '';
    const encryption = sanitizeConfigValue(cfg['smtp_encryption']) || 'ssl';
    const fromEmail = sanitizeConfigValue(cfg['smtp_from_email']) || username;
    const fromName = sanitizeConfigValue(cfg['smtp_from_name']) || 'FastTokenBuy';
    const adminEmail = sanitizeConfigValue(cfg['smtp_admin_email']);

    if (!host || !username || !password) {
      return new Response(JSON.stringify({ error: 'Incomplete SMTP configuration' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const client = new SMTPClient({
      connection: { hostname: host, port, tls: encryption === 'ssl', auth: { username, password } },
      debug: {
        allowUnsecure: encryption === 'none',
        noStartTLS: encryption === 'none',
      },
    });

    const customerEmail = typeof data?.email === 'string' ? data.email.trim() : '';
    const sn = fromName;
    const emailData = {
      ...data,
      email: customerEmail,
      payment_method: typeof data?.payment_method === 'string' ? data.payment_method.trim() : data?.payment_method,
      site_name: sn,
      logo_url: logoUrl,
    };
    const emails: Array<{ to: string; subject: string; html: string }> = [];

    if (type === 'order_submitted') {
      const subjectTpl = tpl.email_tpl_order_subject || 'Order Confirmed - {order_id} | {site_name}';
      if (customerEmail) {
        emails.push({
          to: customerEmail,
          subject: replacePlaceholders(subjectTpl, emailData),
          html: buildEmail('customer_order', emailData, tpl),
        });
      }
      if (adminEmail) {
        const adminSubjectTpl = tpl.email_tpl_admin_subject || 'New Order - {order_id} | BDT {amount}';
        emails.push({
          to: adminEmail,
          subject: replacePlaceholders(adminSubjectTpl, emailData),
          html: buildEmail('admin_order', emailData, tpl),
        });
      }
    } else if (type === 'credit_delivered') {
      const subjectTpl = tpl.email_tpl_delivered_subject || 'Credit Delivered - {order_id} | {site_name}';
      if (customerEmail) {
        emails.push({
          to: customerEmail,
          subject: replacePlaceholders(subjectTpl, emailData),
          html: buildEmail('credit_delivered', emailData, tpl),
        });
      }
    } else if (type === 'order_timeout') {
      const subjectTpl = tpl.email_tpl_timeout_subject || 'Order Timed Out - {order_id} | {site_name}';
      if (customerEmail) {
        emails.push({
          to: customerEmail,
          subject: replacePlaceholders(subjectTpl, emailData),
          html: buildEmail('order_timeout', emailData, tpl),
        });
      }
      if (adminEmail) {
        emails.push({
          to: adminEmail,
          subject: replacePlaceholders('Order Timeout - {order_id} | BDT {amount}', emailData),
          html: buildEmail('order_timeout', { ...emailData, is_admin: true }, tpl),
        });
      }
    } else if (type === 'order_failed') {
      const subjectTpl = tpl.email_tpl_failed_subject || 'Order Failed - {order_id} | {site_name}';
      if (customerEmail) {
        emails.push({
          to: customerEmail,
          subject: replacePlaceholders(subjectTpl, emailData),
          html: buildEmail('order_failed', emailData, tpl),
        });
      }
      if (adminEmail) {
        emails.push({
          to: adminEmail,
          subject: replacePlaceholders('Order Failed - {order_id} | BDT {amount}', emailData),
          html: buildEmail('order_failed', { ...emailData, is_admin: true }, tpl),
        });
      }
    }

    if (emails.length === 0) {
      return new Response(JSON.stringify({ error: 'No valid email recipients found' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    for (const em of emails) {
      // Strip HTML tags for plain text fallback
      const plainText = em.html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
      await client.send({
        from: `${fromName} <${fromEmail}>`,
        to: em.to,
        subject: em.subject,
        content: plainText,
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
