import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Eye, Package, Bell, CheckCircle, XCircle, Clock } from "lucide-react";

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
      { key: "email_tpl_order_subject", label: "Subject", type: "input", placeholder: "✅ অর্ডার কনফার্ম — {order_id}", defaultValue: "✅ অর্ডার কনফার্ম — {order_id} | {site_name}" },
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
      { key: "email_tpl_admin_subject", label: "Subject", type: "input", placeholder: "🔔 নতুন অর্ডার — {order_id}", defaultValue: "🔔 নতুন অর্ডার — {order_id} | ৳{amount}" },
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
      { key: "email_tpl_delivered_subject", label: "Subject", type: "input", placeholder: "🎉 ক্রেডিট ডেলিভারি সম্পন্ন — {order_id}", defaultValue: "🎉 ক্রেডিট ডেলিভারি সম্পন্ন — {order_id} | {site_name}" },
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
      { key: "email_tpl_timeout_subject", label: "Subject (Customer)", type: "input", placeholder: "⏰ অর্ডার টাইম আউট — {order_id}", defaultValue: "⏰ অর্ডার টাইম আউট — {order_id} | {site_name}" },
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
      { key: "email_tpl_failed_subject", label: "Subject (Customer)", type: "input", placeholder: "❌ অর্ডার ব্যর্থ — {order_id}", defaultValue: "❌ অর্ডার ব্যর্থ — {order_id} | {site_name}" },
      { key: "email_tpl_failed_heading", label: "Heading (Customer)", type: "input", placeholder: "আপনার অর্ডার ব্যর্থ হয়েছে", defaultValue: "আপনার অর্ডার ব্যর্থ হয়েছে" },
      { key: "email_tpl_failed_footer", label: "Footer Message (Customer)", type: "textarea", placeholder: "আপনার অর্ডারটি সম্পন্ন করা সম্ভব হয়নি...", defaultValue: "আপনার অর্ডারটি সম্পন্ন করা সম্ভব হয়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন অথবা আমাদের সাথে যোগাযোগ করুন।" },
    ],
  },
];

const AdminEmailTemplates = () => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>("order_submitted");
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
      // Set defaults for missing keys
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
    toast({ title: "ইমেইল টেমপ্লেট সেভ হয়েছে! ✅", variant: "success" });
  };

  const handlePreview = async (templateKey: string) => {
    // Open a simple preview modal showing what the email will look like
    toast({ title: "প্রিভিউ ফিচার শীঘ্রই আসছে 👀" });
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
          📝 এখানে প্রতিটি ইমেইলের <span className="text-cyan-400 font-medium">Subject, Heading, Footer</span> কাস্টমাইজ করতে পারবেন। 
          ভ্যারিয়েবল হিসেবে <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-xs">{"{order_id}"}</code> <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-xs">{"{credits}"}</code> <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-xs">{"{amount}"}</code> <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-xs">{"{site_name}"}</code> ব্যবহার করুন।
        </p>
      </div>

      {TEMPLATES.map((tpl) => (
        <div key={tpl.key} className="bg-card border border-border/30 rounded-2xl overflow-hidden">
          {/* Template Header */}
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

          {/* Template Fields */}
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Reset to defaults
                  const defaults: Record<string, string> = {};
                  tpl.fields.forEach((f) => { defaults[f.key] = f.defaultValue; });
                  setValues((v) => ({ ...v, ...defaults }));
                  toast({ title: "ডিফল্ট রিস্টোর হয়েছে" });
                }}
                className="text-xs"
              >
                🔄 Reset to Default
              </Button>
            </div>
          )}
        </div>
      ))}

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-gradient-to-r from-purple-600 via-purple-500 to-fuchsia-400 hover:from-purple-700 hover:via-purple-600 hover:to-fuchsia-500 text-white border-0 py-6 text-base font-semibold rounded-xl"
      >
        {saving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
        Save All Templates
      </Button>
    </div>
  );
};

export default AdminEmailTemplates;
