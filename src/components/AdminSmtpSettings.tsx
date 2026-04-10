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
import { Mail, Send, Loader2, Eye, EyeOff, Save } from "lucide-react";

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
  const [logoUrl, setLogoUrl] = useState("");
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
      .or(`key.in.(${SMTP_KEYS.join(",")}),key.eq.site_logo`);

    if (data) {
      const map: Record<string, string> = {};
      data.forEach((s) => {
        if (s.key === "site_logo") {
          setLogoUrl(s.value);
        } else {
          map[s.key] = s.value;
        }
      });
      setSettings((prev) => ({ ...prev, ...map }));
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    for (const key of SMTP_KEYS) {
      const value = settings[key] || "";
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
        await supabase
          .from("site_settings")
          .insert({ key, value });
      }
    }
    setSaving(false);
    toast({ title: "SMTP সেটিংস সেভ হয়েছে!", variant: "success" });
  };

  const handleTestEmail = async () => {
    if (!settings.smtp_host || !settings.smtp_username || !settings.smtp_password) {
      toast({ title: "প্রথমে SMTP সেটিংস পূরণ করুন", variant: "destructive" });
      return;
    }
    setTesting(true);

    // Save settings first
    await handleSave();

    const { data, error } = await supabase.functions.invoke("send-smtp-email", {
      body: {
        type: "order_submitted",
        data: {
          order_id: "TEST-ORDER-001",
          email: settings.smtp_admin_email || settings.smtp_username,
          credits: 100,
          amount: 850,
          payment_method: "Test Payment",
        },
      },
    });

    setTesting(false);

    if (error || data?.error) {
      toast({
        title: "টেস্ট ইমেইল ব্যর্থ",
        description: error?.message || data?.error,
        variant: "destructive",
      });
    } else {
      toast({ title: "টেস্ট ইমেইল পাঠানো হয়েছে! ✉️", variant: "success" });
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Mail className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Email Notification Settings</h2>
            <p className="text-sm text-muted-foreground">SMTP কনফিগার করুন ইমেইল নোটিফিকেশনের জন্য</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleTestEmail} disabled={testing}>
          {testing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
          Send Test Mail
        </Button>
      </div>

      <div className="bg-card border border-border/30 rounded-xl p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label className="text-foreground">SMTP Host</Label>
            <Input
              placeholder="e.g. smtp.gmail.com"
              value={settings.smtp_host}
              onChange={(e) => setSettings((s) => ({ ...s, smtp_host: e.target.value }))}
              className="bg-secondary border-border/50"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-foreground">Port</Label>
            <Input
              placeholder="465"
              value={settings.smtp_port}
              onChange={(e) => setSettings((s) => ({ ...s, smtp_port: e.target.value }))}
              className="bg-secondary border-border/50"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-foreground">Encryption</Label>
          <Select
            value={settings.smtp_encryption}
            onValueChange={(val) => setSettings((s) => ({ ...s, smtp_encryption: val }))}
          >
            <SelectTrigger className="bg-secondary border-border/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ssl">SSL</SelectItem>
              <SelectItem value="tls">TLS</SelectItem>
              <SelectItem value="none">None</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label className="text-foreground">Username / Email</Label>
            <Input
              placeholder="your@email.com"
              value={settings.smtp_username}
              onChange={(e) => setSettings((s) => ({ ...s, smtp_username: e.target.value }))}
              className="bg-secondary border-border/50"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-foreground">Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="App password"
                value={settings.smtp_password}
                onChange={(e) => setSettings((s) => ({ ...s, smtp_password: e.target.value }))}
                className="bg-secondary border-border/50 pr-10"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label className="text-foreground">From Email</Label>
            <Input
              placeholder="noreply@yourdomain.com"
              value={settings.smtp_from_email}
              onChange={(e) => setSettings((s) => ({ ...s, smtp_from_email: e.target.value }))}
              className="bg-secondary border-border/50"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-foreground">From Name</Label>
            <Input
              placeholder="FastTokenBuy"
              value={settings.smtp_from_name}
              onChange={(e) => setSettings((s) => ({ ...s, smtp_from_name: e.target.value }))}
              className="bg-secondary border-border/50"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-foreground">Admin Email (নতুন অর্ডার নোটিফিকেশন)</Label>
          <Input
            placeholder="admin@yourdomain.com"
            value={settings.smtp_admin_email}
            onChange={(e) => setSettings((s) => ({ ...s, smtp_admin_email: e.target.value }))}
            className="bg-secondary border-border/50"
          />
          <p className="text-xs text-muted-foreground">নতুন অর্ডার হলে এই ইমেইলে নোটিফিকেশন যাবে</p>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full" variant="hero">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save SMTP Settings
        </Button>
      </div>
    </div>
  );
};

export default AdminSmtpSettings;
