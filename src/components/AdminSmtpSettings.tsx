import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Mail, Send, Loader2, Eye, EyeOff, Save, Settings, Globe } from "lucide-react";
import AdminEmailTemplates from "./AdminEmailTemplates";

const SMTP_KEYS = [
  "smtp_host",
  "smtp_port",
  "smtp_username",
  "smtp_password",
  "smtp_encryption",
  "smtp_from_email",
  "smtp_from_name",
  "smtp_admin_email",
];

const TRIMMABLE_SMTP_KEYS = new Set(
  SMTP_KEYS.filter((key) => key !== "smtp_password")
);

const normalizeSmtpSettings = (values: Record<string, string>) =>
  Object.fromEntries(
    Object.entries(values).map(([key, value]) => [
      key,
      TRIMMABLE_SMTP_KEYS.has(key) ? value.trim() : value,
    ])
  ) as Record<string, string>;

const getFunctionErrorMessage = async (error: unknown, fallback?: string) => {
  if (fallback) return fallback;

  if (!error || typeof error !== "object") {
    return "অজানা সমস্যা হয়েছে";
  }

  const functionError = error as { message?: string; context?: Response };

  if (functionError.context) {
    try {
      const payload = await functionError.context.clone().json();
      if (payload?.error && typeof payload.error === "string") {
        return payload.error;
      }
    } catch {
      try {
        const text = await functionError.context.clone().text();
        if (text) return text;
      } catch {
        // Ignore parse errors and fall back to the base message.
      }
    }
  }

  return functionError.message || "অজানা সমস্যা হয়েছে";
};

const AdminSmtpSettings = () => {
  const [settings, setSettings] = useState<Record<string, string>>({
    smtp_host: "",
    smtp_port: "465",
    smtp_username: "",
    smtp_password: "",
    smtp_encryption: "ssl",
    smtp_from_email: "",
    smtp_from_name: "FastTokenBuy",
    smtp_admin_email: "",
  });
  const [activeTab, setActiveTab] = useState<"smtp" | "templates">("smtp");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", SMTP_KEYS);

    if (data) {
      const map: Record<string, string> = {};
      data.forEach((s) => {
        map[s.key] = TRIMMABLE_SMTP_KEYS.has(s.key) ? s.value.trim() : s.value;
      });
      setSettings((prev) => ({ ...prev, ...map }));
    }
    setLoading(false);
  };

  const handleSave = async ({ silent = false }: { silent?: boolean } = {}) => {
    setSaving(true);
    const normalizedSettings = normalizeSmtpSettings(settings);
    setSettings((prev) => ({ ...prev, ...normalizedSettings }));

    try {
      for (const key of SMTP_KEYS) {
        const value = normalizedSettings[key] || "";
        const { data: existing, error: fetchError } = await supabase
          .from("site_settings")
          .select("id")
          .eq("key", key)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (existing) {
          const { error: updateError } = await supabase
            .from("site_settings")
            .update({ value, updated_at: new Date().toISOString() })
            .eq("key", key);

          if (updateError) throw updateError;
        } else {
          const { error: insertError } = await supabase.from("site_settings").insert({ key, value });
          if (insertError) throw insertError;
        }
      }

      if (!silent) {
        toast({ title: "SMTP সেটিংস সেভ হয়েছে!", variant: "success" });
      }

      return true;
    } catch (error) {
      const description = error instanceof Error ? error.message : "সেভ করা যায়নি";
      toast({
        title: "SMTP সেটিংস সেভ ব্যর্থ",
        description,
        variant: "destructive",
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    const normalizedSettings = normalizeSmtpSettings(settings);
    setSettings((prev) => ({ ...prev, ...normalizedSettings }));

    if (!normalizedSettings.smtp_host || !normalizedSettings.smtp_username || !normalizedSettings.smtp_password) {
      toast({ title: "প্রথমে SMTP সেটিংস পূরণ করুন", variant: "destructive" });
      return;
    }

    setTesting(true);
    try {
      const saved = await handleSave({ silent: true });
      if (!saved) return;

      const { data, error } = await supabase.functions.invoke("send-smtp-email", {
        body: {
          type: "order_submitted",
          data: {
            order_id: "TEST-ORDER-001",
            email: normalizedSettings.smtp_admin_email || normalizedSettings.smtp_username,
            credits: 100,
            amount: 850,
            payment_method: "Test Payment",
          },
        },
      });

      if (error || data?.error) {
        toast({
          title: "টেস্ট ইমেইল ব্যর্থ",
          description: await getFunctionErrorMessage(error, data?.error),
          variant: "destructive",
        });
        return;
      }

      toast({ title: "টেস্ট ইমেইল পাঠানো হয়েছে! ✉️", variant: "success" });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Mail className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-primary">Email Notification Settings</h2>
            <p className="text-sm text-muted-foreground">Configure SMTP for sending emails</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleTestEmail} disabled={testing}>
          {testing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
          Send Test Mail
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("smtp")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
            activeTab === "smtp"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary/50 text-muted-foreground hover:text-foreground"
          }`}
        >
          <Settings className="w-4 h-4" />
          SMTP Settings
        </button>
        <button
          onClick={() => setActiveTab("templates")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
            activeTab === "templates"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary/50 text-muted-foreground hover:text-foreground"
          }`}
        >
          <Globe className="w-4 h-4" />
          Email Templates
        </button>
      </div>

      {activeTab === "smtp" && (
        <div className="bg-card border border-border/30 rounded-2xl p-6 space-y-6">
          {/* Email Send Method */}
          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm">Email Send Method</Label>
            <Select defaultValue="smtp">
              <SelectTrigger className="bg-secondary/50 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="smtp">SMTP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* SMTP Configuration Header */}
          <h3 className="text-lg font-semibold text-cyan-400">SMTP Configuration</h3>

          {/* Host, Port, Encryption - 3 columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-2">
              <Label className="text-cyan-400 text-sm font-medium">Host</Label>
              <Input
                placeholder="e.g. smtp.gmail.com"
                value={settings.smtp_host}
                onChange={(e) => setSettings((s) => ({ ...s, smtp_host: e.target.value }))}
                className="bg-secondary/50 border-border/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-cyan-400 text-sm font-medium">Port</Label>
              <Input
                placeholder="465"
                value={settings.smtp_port}
                onChange={(e) => setSettings((s) => ({ ...s, smtp_port: e.target.value }))}
                className="bg-secondary/50 border-border/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-cyan-400 text-sm font-medium">Encryption</Label>
              <Select
                value={settings.smtp_encryption}
                onValueChange={(val) => setSettings((s) => ({ ...s, smtp_encryption: val }))}
              >
                <SelectTrigger className="bg-secondary/50 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ssl">SSL</SelectItem>
                  <SelectItem value="tls">TLS</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Username & Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="text-cyan-400 text-sm font-medium">Username</Label>
              <Input
                placeholder="your@email.com"
                value={settings.smtp_username}
                onChange={(e) => setSettings((s) => ({ ...s, smtp_username: e.target.value }))}
                className="bg-secondary/50 border-border/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-cyan-400 text-sm font-medium">Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="App password"
                  value={settings.smtp_password}
                  onChange={(e) => setSettings((s) => ({ ...s, smtp_password: e.target.value }))}
                  className="bg-secondary/50 border-border/50 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* From Name & From Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="text-cyan-400 text-sm font-medium">From Name</Label>
              <Input
                placeholder="FastTokenBuy"
                value={settings.smtp_from_name}
                onChange={(e) => setSettings((s) => ({ ...s, smtp_from_name: e.target.value }))}
                className="bg-secondary/50 border-border/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-cyan-400 text-sm font-medium">From Email</Label>
              <Input
                placeholder="noreply@yourdomain.com"
                value={settings.smtp_from_email}
                onChange={(e) => setSettings((s) => ({ ...s, smtp_from_email: e.target.value }))}
                className="bg-secondary/50 border-border/50"
              />
            </div>
          </div>

          {/* Admin Email */}
          <div className="space-y-2">
            <Label className="text-cyan-400 text-sm font-medium">Admin Email (নতুন অর্ডার নোটিফিকেশন)</Label>
            <Input
              placeholder="admin@yourdomain.com"
              value={settings.smtp_admin_email}
              onChange={(e) => setSettings((s) => ({ ...s, smtp_admin_email: e.target.value }))}
              className="bg-secondary/50 border-border/50"
            />
            <p className="text-xs text-muted-foreground">নতুন অর্ডার হলে এই ইমেইলে নোটিফিকেশন যাবে</p>
          </div>

          {/* Save Button - Purple Gradient */}
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-gradient-to-r from-purple-600 via-purple-500 to-fuchsia-400 hover:from-purple-700 hover:via-purple-600 hover:to-fuchsia-500 text-white border-0 py-6 text-base font-semibold rounded-xl"
          >
            {saving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
            Save Settings
          </Button>
        </div>
      )}

      {activeTab === "templates" && <AdminEmailTemplates />}
    </div>
  );
};

export default AdminSmtpSettings;
