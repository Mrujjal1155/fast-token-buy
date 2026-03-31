import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Save, Wallet, CreditCard } from "lucide-react";
import { paymentMethods } from "@/lib/packages";

interface PaymentMethodConfig {
  id: string;
  name: string;
  enabled: boolean;
  number: string;
}

const AdminPaymentMethods = () => {
  const [methods, setMethods] = useState<PaymentMethodConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    // Fetch saved config from site_settings
    const { data } = await supabase
      .from("site_settings")
      .select("key, value")
      .like("key", "payment_method_%");

    const savedConfig: Record<string, any> = {};
    if (data) {
      data.forEach((s) => {
        const methodId = s.key.replace("payment_method_", "").replace("_enabled", "").replace("_number", "");
        if (!savedConfig[methodId]) savedConfig[methodId] = {};
        if (s.key.endsWith("_enabled")) savedConfig[methodId].enabled = s.value === "true";
        if (s.key.endsWith("_number")) savedConfig[methodId].number = s.value;
      });
    }

    // Merge with default payment methods
    const merged = paymentMethods.map((m) => ({
      id: m.id,
      name: m.name,
      enabled: savedConfig[m.id]?.enabled ?? true,
      number: savedConfig[m.id]?.number ?? m.number,
    }));

    setMethods(merged);
    setLoading(false);
  };

  const updateMethod = (id: string, field: keyof PaymentMethodConfig, value: any) => {
    setMethods((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const saveSetting = async (key: string, value: string) => {
    const { data: existing } = await supabase
      .from("site_settings")
      .select("id")
      .eq("key", key)
      .maybeSingle();

    if (existing) {
      await supabase.from("site_settings").update({ value }).eq("key", key);
    } else {
      await supabase.from("site_settings").insert({ key, value });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const promises = methods.flatMap((m) => [
      saveSetting(`payment_method_${m.id}_enabled`, m.enabled ? "true" : "false"),
      saveSetting(`payment_method_${m.id}_number`, m.number),
    ]);
    await Promise.all(promises);
    toast({ title: "পেমেন্ট সেটিংস সেভ হয়েছে ✅" });
    setSaving(false);
  };

  if (loading) return <p className="text-center text-muted-foreground py-8">লোড হচ্ছে...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Wallet className="w-5 h-5" /> পেমেন্ট মেথড কন্ট্রোল
          </h2>
          <p className="text-sm text-muted-foreground">প্রতিটি পেমেন্ট মেথড চালু/বন্ধ ও নম্বর সেট করুন</p>
        </div>
        <Button onClick={handleSave} disabled={saving} size="sm">
          <Save className="w-3.5 h-3.5 mr-1" />
          {saving ? "সেভ হচ্ছে..." : "সব সেভ করুন"}
        </Button>
      </div>

      <div className="space-y-3">
        {methods.map((m) => (
          <div
            key={m.id}
            className={`bg-card border rounded-xl p-5 transition-all ${
              m.enabled ? "border-border/30" : "border-border/10 opacity-60"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <CreditCard className={`w-5 h-5 ${m.enabled ? "text-primary" : "text-muted-foreground"}`} />
                <span className="font-semibold text-foreground">{m.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  m.enabled ? "bg-emerald-500/10 text-emerald-400" : "bg-destructive/10 text-destructive"
                }`}>
                  {m.enabled ? "চালু" : "বন্ধ"}
                </span>
              </div>
              <Switch
                checked={m.enabled}
                onCheckedChange={(v) => updateMethod(m.id, "enabled", v)}
              />
            </div>
            {m.id !== "crypto" && (
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">পেমেন্ট নম্বর</label>
                <Input
                  value={m.number}
                  onChange={(e) => updateMethod(m.id, "number", e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="h-9 bg-secondary border-border/50"
                  disabled={!m.enabled}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-secondary/30 border border-border/20 rounded-xl p-4 text-sm text-muted-foreground space-y-2">
        <p className="font-medium text-foreground">💡 টিপস:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>বন্ধ করা মেথড কাস্টমারদের কাছে দেখাবে না</li>
          <li>অন্তত একটি পেমেন্ট মেথড চালু রাখুন</li>
          <li>নম্বর পরিবর্তন করলে কাস্টমার নতুন নম্বরে পেমেন্ট করবে</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminPaymentMethods;
