import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Save, Eye, Package, Bell, CheckCircle, XCircle, Clock, RotateCcw } from "lucide-react";

interface TemplateConfig {
  key: string;
  label: string;
  labelBn: string;
  icon: React.ReactNode;
  iconColor: string;
  fields: {
    key: string;
    label: string;
    type: "input" | "textarea";
    placeholder: string;
    defaultValue: string;
  }[];
}

const TEMPLATES: TemplateConfig[] = [
  {
    key: "order_submitted",
    label: "Order Confirmation",
    labelBn: "অর্ডার কনফার্মেশন (কাস্টমার)",
    icon: <Package className="w-5 h-5" />,
    iconColor: "text-orange-400",
    fields: [
      { key: "email_tpl_order_subject", label: "Subject", type: "input", placeholder: "Order Confirmed - {order_id}", defaultValue: "Order Confirmed - {order_id} | {site_name}" },
      { key: "email_tpl_order_heading", label: "Heading", type: "input", placeholder: "অর্ডার সফলভাবে জমা হয়েছে!", defaultValue: "অর্ডার সফলভাবে জমা হয়েছে!" },
      { key: "email_tpl_order_heading_en", label: "Sub-heading (EN)", type: "input", placeholder: "Your order has been placed successfully", defaultValue: "Your order has been placed successfully" },
      { key: "email_tpl_order_footer", label: "Footer Message", type: "textarea", placeholder: "আপনার অর্ডারটি প্রক্রিয়াধীন আছে...", defaultValue: "আপনার অর্ডারটি প্রক্রিয়াধীন আছে। শীঘ্রই ক্রেডিট ডেলিভারি করা হবে।" },
    ],
  },
  {
    key: "admin_order",
    label: "Admin Notification",
    labelBn: "অ্যাডমিন নোটিফিকেশন (নতুন অর্ডার)",
    icon: <Bell className="w-5 h-5" />,
    iconColor: "text-yellow-400",
    fields: [
      { key: "email_tpl_admin_subject", label: "Subject", type: "input", placeholder: "New Order - {order_id}", defaultValue: "New Order - {order_id} | BDT {amount}" },
      { key: "email_tpl_admin_heading", label: "Heading", type: "input", placeholder: "নতুন অর্ডার এসেছে!", defaultValue: "নতুন অর্ডার এসেছে!" },
      { key: "email_tpl_admin_heading_en", label: "Sub-heading (EN)", type: "input", placeholder: "New Order Received", defaultValue: "New Order Received" },
    ],
  },
  {
    key: "credit_delivered",
    label: "Credit Delivered",
    labelBn: "ক্রেডিট ডেলিভারি সম্পন্ন",
    icon: <CheckCircle className="w-5 h-5" />,
    iconColor: "text-green-400",
    fields: [
      { key: "email_tpl_delivered_subject", label: "Subject", type: "input", placeholder: "Credit Delivered - {order_id}", defaultValue: "Credit Delivered - {order_id} | {site_name}" },
      { key: "email_tpl_delivered_heading", label: "Heading", type: "input", placeholder: "আপনার ক্রেডিট ডেলিভারি সম্পন্ন!", defaultValue: "আপনার ক্রেডিট ডেলিভারি সম্পন্ন!" },
      { key: "email_tpl_delivered_heading_en", label: "Sub-heading (EN)", type: "input", placeholder: "Your credits have been delivered", defaultValue: "Your credits have been delivered" },
      { key: "email_tpl_delivered_footer", label: "Footer Message", type: "textarea", placeholder: "আপনার একাউন্টে ক্রেডিট যোগ করা হয়েছে...", defaultValue: "আপনার একাউন্টে ক্রেডিট যোগ করা হয়েছে। ধন্যবাদ!" },
    ],
  },
  {
    key: "order_timeout",
    label: "Order Timeout",
    labelBn: "অর্ডার টাইম আউট",
    icon: <Clock className="w-5 h-5" />,
    iconColor: "text-red-400",
    fields: [
      { key: "email_tpl_timeout_subject", label: "Subject (Customer)", type: "input", placeholder: "Order Timed Out - {order_id}", defaultValue: "Order Timed Out - {order_id} | {site_name}" },
      { key: "email_tpl_timeout_heading", label: "Heading (Customer)", type: "input", placeholder: "আপনার অর্ডার টাইম আউট হয়েছে", defaultValue: "আপনার অর্ডার টাইম আউট হয়েছে" },
      { key: "email_tpl_timeout_footer", label: "Footer Message (Customer)", type: "textarea", placeholder: "নির্ধারিত সময়ের মধ্যে পেমেন্ট সম্পন্ন না হওয়ায়...", defaultValue: "নির্ধারিত সময়ের মধ্যে পেমেন্ট সম্পন্ন না হওয়ায় অর্ডারটি বাতিল হয়েছে। পুনরায় অর্ডার করতে আমাদের ওয়েবসাইট ভিজিট করুন।" },
    ],
  },
  {
    key: "order_failed",
    label: "Order Failed",
    labelBn: "অর্ডার ব্যর্থ",
    icon: <XCircle className="w-5 h-5" />,
    iconColor: "text-red-500",
    fields: [
      { key: "email_tpl_failed_subject", label: "Subject (Customer)", type: "input", placeholder: "Order Failed - {order_id}", defaultValue: "Order Failed - {order_id} | {site_name}" },
      { key: "email_tpl_failed_heading", label: "Heading (Customer)", type: "input", placeholder: "আপনার অর্ডার ব্যর্থ হয়েছে", defaultValue: "আপনার অর্ডার ব্যর্থ হয়েছে" },
      { key: "email_tpl_failed_footer", label: "Footer Message (Customer)", type: "textarea", placeholder: "আপনার অর্ডারটি সম্পন্ন করা সম্ভব হয়নি...", defaultValue: "আপনার অর্ডারটি সম্পন্ন করা সম্ভব হয়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন অথবা আমাদের সাথে যোগাযোগ করুন।" },
    ],
  },
];

// Preview HTML generator (mirrors edge function logic)
function generatePreviewHtml(templateKey: string, values: Record<string, string>): string {
  const BRAND = "#FF7A18";
  const BG = "#0F172A";
  const CARD = "#1E293B";
  const TEXT = "#E2E8F0";
  const MUTED = "#94A3B8";
  const GREEN = "#10B981";
  const RED = "#EF4444";
  const sn = "FastTokenBuy";
  const year = new Date().getFullYear();

  const sampleData: Record<string, string> = {
    order_id: "ORD-A1B2C3D4",
    credits: "100",
    amount: "850",
    email: "customer@example.com",
    payment_method: "bKash",
    site_name: sn,
  };

  function rp(t: string) {
    return t
      .replace(/\{order_id\}/g, sampleData.order_id)
      .replace(/\{credits\}/g, sampleData.credits)
      .replace(/\{amount\}/g, sampleData.amount)
      .replace(/\{site_name\}/g, sampleData.site_name)
      .replace(/\{email\}/g, sampleData.email)
      .replace(/\{payment_method\}/g, sampleData.payment_method);
  }

  function rowHtml(label: string, value: string, isLast = false) {
    const border = isLast ? "" : `border-bottom:1px solid rgba(255,255,255,0.06);`;
    return `<tr><td style="padding:14px 0;${border}color:${MUTED};font-size:13px;width:40%;">${label}</td><td style="padding:14px 0;${border}color:${TEXT};font-size:14px;font-weight:600;text-align:right;">${value}</td></tr>`;
  }

  function badgeHtml(text: string, color: string) {
    return `<span style="background:${color}15;color:${color};padding:5px 14px;border-radius:20px;font-size:12px;font-weight:600;">${text}</span>`;
  }

  function infoBoxHtml(msg: string, color: string) {
    return `<div style="margin-top:25px;padding:16px 20px;background:${color}0A;border-radius:12px;border-left:3px solid ${color};"><p style="color:${TEXT};font-size:13px;margin:0;line-height:1.6;">${msg}</p></div>`;
  }

  const svgIcons: Record<string, string> = {
    order: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${BRAND}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
    admin: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${BRAND}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
    delivered: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${GREEN}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
    timeout: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${RED}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    failed: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${RED}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  };

  function iconBlock(type: string, color: string) {
    return `<div style="text-align:center;margin-bottom:25px;"><div style="width:64px;height:64px;border-radius:50%;background:${color}15;display:inline-flex;align-items:center;justify-content:center;">${svgIcons[type] || svgIcons.order}</div>`;
  }

  let inner = "";
  let subtitle = "Order Confirmation";

  if (templateKey === "order_submitted") {
    const heading = rp(values.email_tpl_order_heading || "অর্ডার সফলভাবে জমা হয়েছে!");
    const headingEn = rp(values.email_tpl_order_heading_en || "Your order has been placed successfully");
    const footer = rp(values.email_tpl_order_footer || "আপনার অর্ডারটি প্রক্রিয়াধীন আছে। শীঘ্রই ক্রেডিট ডেলিভারি করা হবে।");
    inner = iconBlock("order", BRAND) +
      `<h2 style="color:${TEXT};font-size:20px;margin:15px 0 5px;font-weight:700;">${heading}</h2><p style="color:${MUTED};font-size:14px;margin:0 0 20px;">${headingEn}</p></div>` +
      `<table style="width:100%;border-collapse:collapse;">` +
      rowHtml("Order ID", `<span style="font-family:monospace;color:${BRAND};">ORD-A1B2C3D4</span>`) +
      rowHtml("Credits", `<span style="color:${BRAND};font-size:16px;font-weight:700;">100</span>`) +
      rowHtml("Amount", `<span style="font-weight:700;">&#2547;850</span>`) +
      rowHtml("Payment", "bKash") +
      `<tr><td style="padding:14px 0;color:${MUTED};font-size:13px;">Status</td><td style="padding:14px 0;text-align:right;">${badgeHtml("Processing", BRAND)}</td></tr></table>` +
      infoBoxHtml(footer, BRAND);
  } else if (templateKey === "admin_order") {
    subtitle = "Admin Notification";
    const heading = rp(values.email_tpl_admin_heading || "নতুন অর্ডার এসেছে!");
    const headingEn = rp(values.email_tpl_admin_heading_en || "New Order Received");
    inner = iconBlock("admin", BRAND) +
      `<h2 style="color:${TEXT};font-size:20px;margin:15px 0 5px;font-weight:700;">${heading}</h2><p style="color:${MUTED};font-size:14px;margin:0 0 20px;">${headingEn}</p></div>` +
      `<table style="width:100%;border-collapse:collapse;">` +
      rowHtml("Order ID", `<span style="font-family:monospace;color:${BRAND};">ORD-A1B2C3D4</span>`) +
      rowHtml("Customer", "customer@example.com") +
      rowHtml("Credits", `<span style="color:${BRAND};font-weight:700;">100</span>`) +
      rowHtml("Amount", `<span style="font-weight:700;">&#2547;850</span>`) +
      rowHtml("Payment", "bKash") +
      `<tr><td style="padding:14px 0;color:${MUTED};font-size:13px;">Status</td><td style="padding:14px 0;text-align:right;">${badgeHtml("Pending", BRAND)}</td></tr></table>`;
  } else if (templateKey === "credit_delivered") {
    subtitle = "Order Update";
    const heading = rp(values.email_tpl_delivered_heading || "আপনার ক্রেডিট ডেলিভারি সম্পন্ন!");
    const headingEn = rp(values.email_tpl_delivered_heading_en || "Your credits have been delivered");
    const footer = rp(values.email_tpl_delivered_footer || "আপনার একাউন্টে ক্রেডিট যোগ করা হয়েছে। ধন্যবাদ!");
    inner = iconBlock("delivered", GREEN) +
      `<h2 style="color:${TEXT};font-size:20px;margin:15px 0 5px;font-weight:700;">${heading}</h2><p style="color:${MUTED};font-size:14px;margin:0 0 20px;">${headingEn}</p></div>` +
      `<table style="width:100%;border-collapse:collapse;">` +
      rowHtml("Order ID", `<span style="font-family:monospace;color:${BRAND};">ORD-A1B2C3D4</span>`) +
      rowHtml("Credits", `<span style="color:${GREEN};font-size:18px;font-weight:700;">100 Credits</span>`) +
      rowHtml("Amount Paid", `<span style="font-weight:700;">&#2547;850</span>`) +
      `<tr><td style="padding:14px 0;color:${MUTED};font-size:13px;">Status</td><td style="padding:14px 0;text-align:right;">${badgeHtml("Completed", GREEN)}</td></tr></table>` +
      infoBoxHtml(footer, GREEN);
  } else if (templateKey === "order_timeout") {
    subtitle = "Order Update";
    const heading = rp(values.email_tpl_timeout_heading || "আপনার অর্ডার টাইম আউট হয়েছে");
    const footer = rp(values.email_tpl_timeout_footer || "নির্ধারিত সময়ের মধ্যে পেমেন্ট সম্পন্ন না হওয়ায় অর্ডারটি বাতিল হয়েছে। পুনরায় অর্ডার করতে আমাদের ওয়েবসাইট ভিজিট করুন।");
    inner = iconBlock("timeout", RED) +
      `<h2 style="color:${TEXT};font-size:20px;margin:15px 0 5px;font-weight:700;">${heading}</h2><p style="color:${MUTED};font-size:14px;margin:0 0 20px;">Your order expired due to payment timeout</p></div>` +
      `<table style="width:100%;border-collapse:collapse;">` +
      rowHtml("Order ID", `<span style="font-family:monospace;color:${BRAND};">ORD-A1B2C3D4</span>`) +
      rowHtml("Credits", `<span style="color:${BRAND};font-size:16px;font-weight:700;">100</span>`) +
      rowHtml("Amount", `<span style="font-weight:700;">&#2547;850</span>`) +
      `<tr><td style="padding:14px 0;color:${MUTED};font-size:13px;">Status</td><td style="padding:14px 0;text-align:right;">${badgeHtml("Timed Out", RED)}</td></tr></table>` +
      infoBoxHtml(footer, RED);
  } else if (templateKey === "order_failed") {
    subtitle = "Order Update";
    const heading = rp(values.email_tpl_failed_heading || "আপনার অর্ডার ব্যর্থ হয়েছে");
    const footer = rp(values.email_tpl_failed_footer || "আপনার অর্ডারটি সম্পন্ন করা সম্ভব হয়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন অথবা আমাদের সাথে যোগাযোগ করুন।");
    inner = iconBlock("failed", RED) +
      `<h2 style="color:${TEXT};font-size:20px;margin:15px 0 5px;font-weight:700;">${heading}</h2><p style="color:${MUTED};font-size:14px;margin:0 0 20px;">Your order could not be completed</p></div>` +
      `<table style="width:100%;border-collapse:collapse;">` +
      rowHtml("Order ID", `<span style="font-family:monospace;color:${BRAND};">ORD-A1B2C3D4</span>`) +
      rowHtml("Credits", `<span style="color:${BRAND};font-size:16px;font-weight:700;">100</span>`) +
      rowHtml("Amount", `<span style="font-weight:700;">&#2547;850</span>`) +
      `<tr><td style="padding:14px 0;color:${MUTED};font-size:13px;">Status</td><td style="padding:14px 0;text-align:right;">${badgeHtml("Failed", RED)}</td></tr></table>` +
      infoBoxHtml(footer, RED);
  }

  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:${BG};font-family:'Segoe UI',Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:40px 20px;">
  <div style="text-align:center;margin-bottom:30px;">
    <h1 style="color:${BRAND};font-size:24px;margin:0;font-weight:700;">${sn}</h1>
    <p style="color:${MUTED};font-size:13px;margin:5px 0 0;">${subtitle}</p>
  </div>
  <div style="background:${CARD};border-radius:16px;padding:30px;border:1px solid rgba(255,255,255,0.08);">
    ${inner}
  </div>
  <p style="text-align:center;color:${MUTED};font-size:11px;margin-top:30px;">&copy; ${year} ${sn}. All rights reserved.</p>
</div></body></html>`;
}

const AdminEmailTemplates = () => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>("order_submitted");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchTemplateValues();
  }, []);

  const fetchTemplateValues = async () => {
    const allKeys = TEMPLATES.flatMap((t) => t.fields.map((f) => f.key));
    const { data } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", allKeys);

    if (data) {
      const map: Record<string, string> = {};
      data.forEach((s) => { map[s.key] = s.value; });
      const defaults: Record<string, string> = {};
      TEMPLATES.forEach((t) => {
        t.fields.forEach((f) => {
          defaults[f.key] = map[f.key] ?? f.defaultValue;
        });
      });
      setValues(defaults);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const allKeys = TEMPLATES.flatMap((t) => t.fields.map((f) => f.key));
    for (const key of allKeys) {
      const value = values[key] || "";
      const { data: existing } = await supabase
        .from("site_settings")
        .select("id")
        .eq("key", key)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("site_settings")
          .update({ value, updated_at: new Date().toISOString() })
          .eq("key", key);
      } else {
        await supabase.from("site_settings").insert({ key, value });
      }
    }
    setSaving(false);
    toast({ title: "Email templates saved successfully", variant: "success" });
  };

  const handlePreview = (templateKey: string, label: string) => {
    const html = generatePreviewHtml(templateKey, values);
    setPreviewHtml(html);
    setPreviewTitle(label);
    setPreviewOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="bg-card/50 border border-border/20 rounded-xl p-4">
        <p className="text-sm text-muted-foreground">
          Customize each email's <span className="text-cyan-400 font-medium">Subject, Heading, Footer</span>.
          Available variables: <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-xs">{"{order_id}"}</code> <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-xs">{"{credits}"}</code> <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-xs">{"{amount}"}</code> <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-xs">{"{site_name}"}</code>
        </p>
      </div>

      {TEMPLATES.map((tpl) => (
        <div key={tpl.key} className="bg-card border border-border/30 rounded-2xl overflow-hidden">
          <button
            onClick={() => setExpandedTemplate(expandedTemplate === tpl.key ? null : tpl.key)}
            className="w-full flex items-center gap-3 p-5 text-left hover:bg-secondary/30 transition-colors"
          >
            <div className={`w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center ${tpl.iconColor}`}>
              {tpl.icon}
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-foreground">{tpl.label}</h3>
              <p className="text-xs text-muted-foreground">{tpl.labelBn}</p>
            </div>
            <div className={`text-muted-foreground transition-transform ${expandedTemplate === tpl.key ? "rotate-180" : ""}`}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </button>

          {expandedTemplate === tpl.key && (
            <div className="px-5 pb-5 space-y-4 border-t border-border/20 pt-4">
              {tpl.fields.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <Label className="text-cyan-400 text-xs font-medium">{field.label}</Label>
                  {field.type === "input" ? (
                    <Input
                      value={values[field.key] || ""}
                      onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="bg-secondary/50 border-border/50 text-sm"
                    />
                  ) : (
                    <Textarea
                      value={values[field.key] || ""}
                      onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="bg-secondary/50 border-border/50 text-sm min-h-[80px]"
                    />
                  )}
                </div>
              ))}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePreview(tpl.key, tpl.label)}
                  className="text-xs"
                >
                  <Eye className="w-3.5 h-3.5 mr-1.5" />
                  Preview
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const defaults: Record<string, string> = {};
                    tpl.fields.forEach((f) => { defaults[f.key] = f.defaultValue; });
                    setValues((v) => ({ ...v, ...defaults }));
                    toast({ title: "Defaults restored" });
                  }}
                  className="text-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  Reset
                </Button>
              </div>
            </div>
          )}
        </div>
      ))}

      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-gradient-to-r from-purple-600 via-purple-500 to-fuchsia-400 hover:from-purple-700 hover:via-purple-600 hover:to-fuchsia-500 text-white border-0 py-6 text-base font-semibold rounded-xl"
      >
        {saving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
        Save All Templates
      </Button>

      {/* Email Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden p-0">
          <DialogHeader className="p-4 pb-2 border-b border-border/30">
            <DialogTitle className="text-base font-semibold">
              Preview: {previewTitle}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-auto" style={{ maxHeight: "70vh" }}>
            <iframe
              srcDoc={previewHtml}
              title="Email Preview"
              className="w-full border-0"
              style={{ height: "600px", minHeight: "500px" }}
              sandbox="allow-same-origin"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminEmailTemplates;
