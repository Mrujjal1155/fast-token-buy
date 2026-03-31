import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Save, CreditCard, Eye, EyeOff } from "lucide-react";

const AdminAjkerPay = () => {
  const [enabled, setEnabled] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [brandKey, setBrandKey] = useState("");
  const [showKeys, setShowKeys] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["ajkerpay_enabled", "ajkerpay_api_key", "ajkerpay_secret_key", "ajkerpay_brand_key"]);

    if (data) {
      data.forEach((s) => {
        if (s.key === "ajkerpay_enabled") setEnabled(s.value === "true");
        if (s.key === "ajkerpay_api_key") setApiKey(s.value);
        if (s.key === "ajkerpay_secret_key") setSecretKey(s.value);
        if (s.key === "ajkerpay_brand_key") setBrandKey(s.value);
      });
    }
    setLoading(false);
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
    await Promise.all([
      saveSetting("ajkerpay_enabled", enabled ? "true" : "false"),
      saveSetting("ajkerpay_api_key", apiKey),
      saveSetting("ajkerpay_secret_key", secretKey),
      saveSetting("ajkerpay_brand_key", brandKey),
    ]);
    toast({ title: "AjkerPay সেটিংস সেভ হয়েছে ✅" });
    setSaving(false);
  };

  if (loading) return <p className="text-center text-muted-foreground py-8">লোড হচ্ছে...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <CreditCard className="w-5 h-5" /> AjkerPay পেমেন্ট গেটওয়ে
          </h2>
          <p className="text-sm text-muted-foreground">bKash, Nagad, Rocket অটো পেমেন্ট কনফিগার করুন</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{enabled ? "চালু" : "বন্ধ"}</span>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>
      </div>

      <div className="bg-card border border-border/30 rounded-xl p-5 space-y-4">
        <div>
          <label className="text-sm text-muted-foreground mb-1.5 block">API Key</label>
          <Input
            type={showKeys ? "text" : "password"}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="আপনার AjkerPay API Key"
            className="h-10 bg-secondary border-border/50"
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1.5 block">Secret Key</label>
          <Input
            type={showKeys ? "text" : "password"}
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            placeholder="আপনার AjkerPay Secret Key"
            className="h-10 bg-secondary border-border/50"
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1.5 block">Brand Key</label>
          <Input
            type={showKeys ? "text" : "password"}
            value={brandKey}
            onChange={(e) => setBrandKey(e.target.value)}
            placeholder="আপনার AjkerPay Brand Key"
            className="h-10 bg-secondary border-border/50"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setShowKeys(!showKeys)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition"
          >
            {showKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showKeys ? "কী লুকান" : "কী দেখুন"}
          </button>
          <Button onClick={handleSave} disabled={saving} size="sm">
            <Save className="w-3.5 h-3.5 mr-1" />
            {saving ? "সেভ হচ্ছে..." : "সেভ করুন"}
          </Button>
        </div>
      </div>

      <div className="bg-secondary/30 border border-border/20 rounded-xl p-4 text-sm text-muted-foreground space-y-2">
        <p className="font-medium text-foreground">📋 কিভাবে কাজ করে:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>AjkerPay চালু থাকলে bKash/Nagad/Rocket পেমেন্ট অটো হয়ে যাবে</li>
          <li>কাস্টমার পেমেন্ট পেজে রিডাইরেক্ট হবে → পেমেন্ট করবে → অটো ভেরিফাই</li>
          <li>বন্ধ থাকলে আগের ম্যানুয়াল সিস্টেম চলবে</li>
          <li>API Key, Secret Key ও Brand Key আপনার AjkerPay ড্যাশবোর্ড থেকে পাবেন</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminAjkerPay;
