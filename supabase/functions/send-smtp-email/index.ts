import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Professional email template
function buildOrderEmailHtml(type: "customer_order" | "admin_order" | "credit_delivered" | "order_timeout" | "order_failed", data: Record<string, any>): string {
  const brandColor = "#FF7A18";
  const bgColor = "#0F172A";
  const cardBg = "#1E293B";
  const textColor = "#E2E8F0";
  const mutedColor = "#94A3B8";
  const siteName = data.site_name || "FastTokenBuy";

  if (type === "admin_order") {
    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${bgColor};font-family:'Segoe UI',Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:40px 20px;">
  <div style="text-align:center;margin-bottom:30px;">
    <h1 style="color:${brandColor};font-size:24px;margin:0;">${siteName}</h1>
    <p style="color:${mutedColor};font-size:13px;margin:5px 0 0;">Admin Notification</p>
  </div>
  <div style="background:${cardBg};border-radius:16px;padding:30px;border:1px solid rgba(255,255,255,0.05);">
    <div style="text-align:center;margin-bottom:25px;">
      <div style="width:60px;height:60px;border-radius:50%;background:${brandColor}20;display:inline-flex;align-items:center;justify-content:center;">
        <span style="font-size:28px;">🔔</span>
      </div>
      <h2 style="color:${textColor};font-size:20px;margin:15px 0 5px;">নতুন অর্ডার এসেছে!</h2>
      <p style="color:${mutedColor};font-size:14px;margin:0;">New Order Received</p>
    </div>
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.05);color:${mutedColor};font-size:13px;">Order ID</td><td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.05);color:${textColor};font-size:14px;font-weight:600;text-align:right;font-family:monospace;">${data.order_id}</td></tr>
      <tr><td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.05);color:${mutedColor};font-size:13px;">Customer Email</td><td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.05);color:${textColor};font-size:14px;text-align:right;">${data.email}</td></tr>
      <tr><td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.05);color:${mutedColor};font-size:13px;">Credits</td><td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.05);color:${brandColor};font-size:14px;font-weight:600;text-align:right;">${data.credits}</td></tr>
      <tr><td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.05);color:${mutedColor};font-size:13px;">Amount</td><td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.05);color:${textColor};font-size:14px;font-weight:600;text-align:right;">৳${data.amount}</td></tr>
      <tr><td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.05);color:${mutedColor};font-size:13px;">Payment</td><td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.05);color:${textColor};font-size:14px;text-align:right;">${data.payment_method}</td></tr>
      <tr><td style="padding:12px 0;color:${mutedColor};font-size:13px;">Status</td><td style="padding:12px 0;text-align:right;"><span style="background:${brandColor}20;color:${brandColor};padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;">Pending</span></td></tr>
    </table>
  </div>
  <p style="text-align:center;color:${mutedColor};font-size:11px;margin-top:30px;">© ${new Date().getFullYear()} ${siteName}. Admin Panel Notification.</p>
</div>
</body></html>`;
  }

  if (type === "credit_delivered") {
    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${bgColor};font-family:'Segoe UI',Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:40px 20px;">
  <div style="text-align:center;margin-bottom:30px;">
    <h1 style="color:${brandColor};font-size:24px;margin:0;">${siteName}</h1>
    <p style="color:${mutedColor};font-size:13px;margin:5px 0 0;">Order Update</p>
  </div>
  <div style="background:${cardBg};border-radius:16px;padding:30px;border:1px solid rgba(255,255,255,0.05);">
    <div style="text-align:center;margin-bottom:25px;">
      <div style="width:60px;height:60px;border-radius:50%;background:#10B98120;display:inline-flex;align-items:center;justify-content:center;">
        <span style="font-size:28px;">🎉</span>
      </div>
      <h2 style="color:${textColor};font-size:20px;margin:15px 0 5px;">আপনার ক্রেডিট ডেলিভারি সম্পন্ন!</h2>
      <p style="color:${mutedColor};font-size:14px;margin:0;">Your credits have been delivered</p>
    </div>
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.05);color:${mutedColor};font-size:13px;">Order ID</td><td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.05);color:${textColor};font-size:14px;font-weight:600;text-align:right;font-family:monospace;">${data.order_id}</td></tr>
      <tr><td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.05);color:${mutedColor};font-size:13px;">Credits</td><td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.05);color:${brandColor};font-size:18px;font-weight:700;text-align:right;">${data.credits} Credits</td></tr>
      <tr><td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.05);color:${mutedColor};font-size:13px;">Amount Paid</td><td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.05);color:${textColor};font-size:14px;font-weight:600;text-align:right;">৳${data.amount}</td></tr>
      <tr><td style="padding:12px 0;color:${mutedColor};font-size:13px;">Status</td><td style="padding:12px 0;text-align:right;"><span style="background:#10B98120;color:#10B981;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;">✅ Completed</span></td></tr>
    </table>
    <div style="margin-top:25px;padding:15px;background:${brandColor}10;border-radius:12px;border:1px solid ${brandColor}30;">
      <p style="color:${textColor};font-size:13px;margin:0;text-align:center;">আপনার একাউন্টে ক্রেডিট যোগ করা হয়েছে। ধন্যবাদ!</p>
    </div>
  </div>
  <p style="text-align:center;color:${mutedColor};font-size:11px;margin-top:30px;">© ${new Date().getFullYear()} ${siteName}. Thank you for your purchase.</p>
</div>
</body></html>`;
  }

  // order_timeout & order_failed share similar layout
  if (type === "order_timeout" || type === "order_failed") {
    const isTimeout = type === "order_timeout";
    const isAdmin = data.is_admin;
    const emoji = isTimeout ? "⏰" : "❌";
    const statusColor = "#EF4444";
    const heading = isAdmin
      ? (isTimeout ? "অর্ডার টাইমআউট হয়েছে" : "অর্ডার ব্যর্থ হয়েছে")
      : (isTimeout ? "আপনার অর্ডার টাইম আউট হয়েছে" : "আপনার অর্ডার ব্যর্থ হয়েছে");
    const subheading = isAdmin
      ? (isTimeout ? "Order payment timed out" : "Order has been marked as failed")
      : (isTimeout ? "Your order expired due to payment timeout" : "Your order could not be completed");
    const statusLabel = isTimeout ? "⏰ Timed Out" : "❌ Failed";
    const footerMsg = isAdmin
      ? (isTimeout ? "এই অর্ডারটি ৩০ মিনিটের মধ্যে পেমেন্ট না করায় অটো ক্যান্সেল হয়েছে।" : "এই অর্ডারটি অ্যাডমিন দ্বারা ব্যর্থ চিহ্নিত করা হয়েছে।")
      : (isTimeout ? "নির্ধারিত সময়ের মধ্যে পেমেন্ট সম্পন্ন না হওয়ায় অর্ডারটি বাতিল হয়েছে। পুনরায় অর্ডার করতে আমাদের ওয়েবসাইট ভিজিট করুন।" : "আপনার অর্ডারটি সম্পন্ন করা সম্ভব হয়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন অথবা আমাদের সাথে যোগাযোগ করুন।");

    return \`<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:\${bgColor};font-family:'Segoe UI',Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:40px 20px;">
  <div style="text-align:center;margin-bottom:30px;">
    <h1 style="color:\${brandColor};font-size:24px;margin:0;">\${siteName}</h1>
    <p style="color:\${mutedColor};font-size:13px;margin:5px 0 0;">\${isAdmin ? 'Admin Alert' : 'Order Update'}</p>
  </div>
  <div style="background:\${cardBg};border-radius:16px;padding:30px;border:1px solid rgba(255,255,255,0.05);">
    <div style="text-align:center;margin-bottom:25px;">
      <div style="width:60px;height:60px;border-radius:50%;background:\${statusColor}20;display:inline-flex;align-items:center;justify-content:center;">
        <span style="font-size:28px;">\${emoji}</span>
      </div>
      <h2 style="color:\${textColor};font-size:20px;margin:15px 0 5px;">\${heading}</h2>
      <p style="color:\${mutedColor};font-size:14px;margin:0;">\${subheading}</p>
    </div>
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.05);color:\${mutedColor};font-size:13px;">Order ID</td><td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.05);color:\${textColor};font-size:14px;font-weight:600;text-align:right;font-family:monospace;">\${data.order_id}</td></tr>
      \${isAdmin ? \`<tr><td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.05);color:\${mutedColor};font-size:13px;">Customer</td><td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.05);color:\${textColor};font-size:14px;text-align:right;">\${data.email}</td></tr>\` : ''}
      <tr><td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.05);color:\${mutedColor};font-size:13px;">Credits</td><td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.05);color:\${brandColor};font-size:16px;font-weight:700;text-align:right;">\${data.credits}</td></tr>
      <tr><td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.05);color:\${mutedColor};font-size:13px;">Amount</td><td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.05);color:\${textColor};font-size:14px;font-weight:600;text-align:right;">৳\${data.amount}</td></tr>
      <tr><td style="padding:12px 0;color:\${mutedColor};font-size:13px;">Status</td><td style="padding:12px 0;text-align:right;"><span style="background:\${statusColor}20;color:\${statusColor};padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;">\${statusLabel}</span></td></tr>
    </table>
    <div style="margin-top:25px;padding:15px;background:\${statusColor}10;border-radius:12px;border:1px solid \${statusColor}30;">
      <p style="color:\${textColor};font-size:13px;margin:0;text-align:center;">\${footerMsg}</p>
    </div>
  </div>
  <p style="text-align:center;color:\${mutedColor};font-size:11px;margin-top:30px;">© \${new Date().getFullYear()} \${siteName}</p>
</div>
</body></html>\`;
  }

  // customer_order (default)
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${bgColor};font-family:'Segoe UI',Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:40px 20px;">
  <div style="text-align:center;margin-bottom:30px;">
    <h1 style="color:${brandColor};font-size:24px;margin:0;">${siteName}</h1>
    <p style="color:${mutedColor};font-size:13px;margin:5px 0 0;">Order Confirmation</p>
  </div>
  <div style="background:${cardBg};border-radius:16px;padding:30px;border:1px solid rgba(255,255,255,0.05);">
    <div style="text-align:center;margin-bottom:25px;">
      <div style="width:60px;height:60px;border-radius:50%;background:${brandColor}20;display:inline-flex;align-items:center;justify-content:center;">
        <span style="font-size:28px;">📦</span>
      </div>
      <h2 style="color:${textColor};font-size:20px;margin:15px 0 5px;">অর্ডার সফলভাবে জমা হয়েছে!</h2>
      <p style="color:${mutedColor};font-size:14px;margin:0;">Your order has been placed successfully</p>
    </div>
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.05);color:${mutedColor};font-size:13px;">Order ID</td><td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.05);color:${textColor};font-size:14px;font-weight:600;text-align:right;font-family:monospace;">${data.order_id}</td></tr>
      <tr><td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.05);color:${mutedColor};font-size:13px;">Credits</td><td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.05);color:${brandColor};font-size:16px;font-weight:700;text-align:right;">${data.credits}</td></tr>
      <tr><td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.05);color:${mutedColor};font-size:13px;">Amount</td><td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.05);color:${textColor};font-size:14px;font-weight:600;text-align:right;">৳${data.amount}</td></tr>
      <tr><td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.05);color:${mutedColor};font-size:13px;">Payment</td><td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.05);color:${textColor};font-size:14px;text-align:right;">${data.payment_method}</td></tr>
      <tr><td style="padding:12px 0;color:${mutedColor};font-size:13px;">Status</td><td style="padding:12px 0;text-align:right;"><span style="background:${brandColor}20;color:${brandColor};padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;">⏳ Processing</span></td></tr>
    </table>
    <div style="margin-top:25px;padding:15px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.05);">
      <p style="color:${mutedColor};font-size:12px;margin:0;text-align:center;">আপনার অর্ডারটি প্রক্রিয়াধীন আছে। শীঘ্রই ক্রেডিট ডেলিভারি করা হবে।</p>
    </div>
  </div>
  <p style="text-align:center;color:${mutedColor};font-size:11px;margin-top:30px;">© ${new Date().getFullYear()} ${siteName}. Thank you for your purchase.</p>
</div>
</body></html>`;
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

    // Fetch SMTP settings from site_settings
    const { data: settings } = await supabase
      .from('site_settings')
      .select('key, value')
      .like('key', 'smtp_%');

    if (!settings || settings.length === 0) {
      return new Response(JSON.stringify({ error: 'SMTP not configured' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const smtpConfig: Record<string, string> = {};
    settings.forEach((s: { key: string; value: string }) => {
      smtpConfig[s.key] = s.value;
    });

    const host = smtpConfig['smtp_host'];
    const port = parseInt(smtpConfig['smtp_port'] || '465');
    const username = smtpConfig['smtp_username'] || '';
    const password = smtpConfig['smtp_password'] || '';
    const encryption = smtpConfig['smtp_encryption'] || 'ssl';
    const fromEmail = smtpConfig['smtp_from_email'] || username;
    const fromName = smtpConfig['smtp_from_name'] || 'FastTokenBuy';
    const adminEmail = smtpConfig['smtp_admin_email'] || '';

    if (!host || !username || !password) {
      return new Response(JSON.stringify({ error: 'Incomplete SMTP configuration' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const tls = encryption === 'ssl';

    const client = new SMTPClient({
      connection: {
        hostname: host,
        port,
        tls,
        auth: { username, password },
      },
    });

    const siteName = fromName;

    // Build emails based on type
    const emails: Array<{ to: string; subject: string; html: string }> = [];

    if (type === 'order_submitted') {
      // Email to customer
      emails.push({
        to: data.email,
        subject: `✅ অর্ডার কনফার্ম — ${data.order_id} | ${siteName}`,
        html: buildOrderEmailHtml('customer_order', { ...data, site_name: siteName }),
      });
      // Email to admin
      if (adminEmail) {
        emails.push({
          to: adminEmail,
          subject: `🔔 নতুন অর্ডার — ${data.order_id} | ৳${data.amount}`,
          html: buildOrderEmailHtml('admin_order', { ...data, site_name: siteName }),
        });
      }
    } else if (type === 'credit_delivered') {
      // Email to customer when order completed
      emails.push({
        to: data.email,
        subject: `🎉 ক্রেডিট ডেলিভারি সম্পন্ন — ${data.order_id} | ${siteName}`,
        html: buildOrderEmailHtml('credit_delivered', { ...data, site_name: siteName }),
      });
    }

    for (const email of emails) {
      await client.send({
        from: `${fromName} <${fromEmail}>`,
        to: email.to,
        subject: email.subject,
        content: "auto",
        html: email.html,
      });
      console.log(`Email sent to: ${email.to}`);
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
