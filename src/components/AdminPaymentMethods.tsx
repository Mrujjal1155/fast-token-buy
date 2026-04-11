import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Save, Wallet, CreditCard, Upload, X, ImageIcon, Eye, EyeOff, Settings } from "lucide-react";
import { paymentMethods } from "@/lib/packages";

interface PaymentMethodConfig {
  id: string;
  name: string;
  enabled: boolean;
  iconUrl: string | null;
}

interface GatewayConfig {
  enabled: boolean;
  apiKey: string;
  secretKey: string;
  brandKey: string;
}

const AdminPaymentMethods = () => {
  const [methods, setMethods] = useState<PaymentMethodConfig[]>([]);
  const [ajkerpay, setAjkerpay] = useState<GatewayConfig>({
    enabled: false, apiKey: "", secretKey: "", brandKey: "",
  });
  const [nowpaybd, setNowpaybd] = useState<GatewayConfig>({
    enabled: false, apiKey: "", secretKey: "", brandKey: "",
  });
  const [showKeys, setShowKeys] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const { toast } = useToast();

  useEffect(() => { fetchConfig(); }, []);

  const fetchConfig = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("key, value")
      .or("key.like.payment_method_%,key.like.ajkerpay_%,key.like.nowpaybd_%");

    const savedConfig: Record<string, any> = {};
    const ajkerConfig: Partial<GatewayConfig> = {};
    const nowConfig: Partial<GatewayConfig> = {};

    if (data) {
      data.forEach((s) => {
        if (s.key === "ajkerpay_enabled") ajkerConfig.enabled = s.value === "true";
        else if (s.key === "ajkerpay_api_key") ajkerConfig.apiKey = s.value;
        else if (s.key === "ajkerpay_secret_key") ajkerConfig.secretKey = s.value;
        else if (s.key === "ajkerpay_brand_key") ajkerConfig.brandKey = s.value;
        else if (s.key === "nowpaybd_enabled") nowConfig.enabled = s.value === "true";
        else if (s.key === "nowpaybd_api_key") nowConfig.apiKey = s.value;
        else if (s.key === "nowpaybd_secret_key") nowConfig.secretKey = s.value;
        else if (s.key === "nowpaybd_brand_key") nowConfig.brandKey = s.value;
        else {
          const methodId = s.key.replace("payment_method_", "").replace("_enabled", "").replace("_icon", "");
          if (!savedConfig[methodId]) savedConfig[methodId] = {};
          if (s.key.endsWith("_enabled")) savedConfig[methodId].enabled = s.value === "true";
          if (s.key.endsWith("_icon")) savedConfig[methodId].iconUrl = s.value;
        }
      });
    }

    setAjkerpay({
      enabled: ajkerConfig.enabled ?? false,
      apiKey: ajkerConfig.apiKey ?? "",
      secretKey: ajkerConfig.secretKey ?? "",
      brandKey: ajkerConfig.brandKey ?? "",
    });

    setNowpaybd({
      enabled: nowConfig.enabled ?? false,
      apiKey: nowConfig.apiKey ?? "",
      secretKey: nowConfig.secretKey ?? "",
      brandKey: nowConfig.brandKey ?? "",
    });

    const merged = paymentMethods.map((m) => ({
      id: m.id,
      name: m.name,
      enabled: savedConfig[m.id]?.enabled ?? true,
      iconUrl: savedConfig[m.id]?.iconUrl || null,
    }));

    setMethods(merged);
    setLoading(false);
  };

  const updateMethod = (id: string, field: keyof PaymentMethodConfig, value: any) => {
    setMethods((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

  const handleIconUpload = async (methodId: string, file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "শুধু ইমেজ ফাইল আপলোড করুন", variant: "destructive" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "ফাইল সাইজ ২MB এর কম হতে হবে", variant: "destructive" });
      return;
    }

    setUploading(methodId);
    const ext = file.name.split(".").pop() || "png";
    const filePath = `${methodId}.${ext}`;

    await supabase.storage.from("payment-icons").remove([filePath]);
    const { error } = await supabase.storage
      .from("payment-icons")
      .upload(filePath, file, { upsert: true });

    if (error) {
      toast({ title: "আপলোড ব্যর্থ", description: error.message, variant: "destructive" });
      setUploading(null);
      return;
    }

    const { data: urlData } = supabase.storage.from("payment-icons").getPublicUrl(filePath);
    updateMethod(methodId, "iconUrl", `${urlData.publicUrl}?t=${Date.now()}`);
    toast({ title: "আইকন আপলোড হয়েছে", variant: "success" });
    setUploading(null);
  };

  const removeIcon = async (methodId: string) => {
    const extensions = ["png", "jpg", "jpeg", "webp", "svg"];
    await supabase.storage.from("payment-icons").remove(extensions.map((ext) => `${methodId}.${ext}`));
    updateMethod(methodId, "iconUrl", null);
    toast({ title: "আইকন মুছে ফেলা হয়েছে", variant: "success" });
  };

  const saveSetting = async (key: string, value: string) => {
    const { data: existing } = await supabase
      .from("site_settings").select("id").eq("key", key).maybeSingle();
    if (existing) {
      await supabase.from("site_settings").update({ value }).eq("key", key);
    } else {
      await supabase.from("site_settings").insert({ key, value });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const promises = [
      ...methods.flatMap((m) => [
        saveSetting(`payment_method_${m.id}_enabled`, m.enabled ? "true" : "false"),
        saveSetting(`payment_method_${m.id}_icon`, m.iconUrl || ""),
      ]),
      saveSetting("ajkerpay_enabled", ajkerpay.enabled ? "true" : "false"),
      saveSetting("ajkerpay_api_key", ajkerpay.apiKey),
      saveSetting("ajkerpay_secret_key", ajkerpay.secretKey),
      saveSetting("ajkerpay_brand_key", ajkerpay.brandKey),
      saveSetting("nowpaybd_enabled", nowpaybd.enabled ? "true" : "false"),
      saveSetting("nowpaybd_api_key", nowpaybd.apiKey),
      saveSetting("nowpaybd_secret_key", nowpaybd.secretKey),
      saveSetting("nowpaybd_brand_key", nowpaybd.brandKey),
    ];
    await Promise.all(promises);
    toast({ title: "পেমেন্ট সেটিংস সেভ হয়েছে", variant: "success" });
    setSaving(false);
  };

  if (loading) return <p className="text-center text-muted-foreground py-8">লোড হচ্ছে...</p>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Wallet className="w-5 h-5" /> পেমেন্ট কন্ট্রোল
          </h2>
          <p className="text-sm text-muted-foreground">সব পেমেন্ট গেটওয়ে একসাথে কনফিগার করুন</p>
        </div>
        <Button onClick={handleSave} disabled={saving} size="sm">
          <Save className="w-3.5 h-3.5 mr-1" />
          {saving ? "সেভ হচ্ছে..." : "সব সেভ করুন"}
        </Button>
      </div>

      {/* AjkerPay Config */}
      <div className="bg-card border border-border/30 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-primary" />
            <div>
              <span className="font-semibold text-foreground">AjkerPay গেটওয়ে (bKash/Nagad/Rocket)</span>
              <p className="text-xs text-muted-foreground">অটো পেমেন্ট প্রসেসিং</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{ajkerpay.enabled ? "চালু" : "বন্ধ"}</span>
            <Switch
              checked={ajkerpay.enabled}
              onCheckedChange={(v) => setAjkerpay((p) => ({ ...p, enabled: v }))}
            />
          </div>
        </div>

        {ajkerpay.enabled && (
          <div className="space-y-3 pt-2 border-t border-border/20">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">API Key</label>
              <Input
                type={showKeys ? "text" : "password"}
                value={ajkerpay.apiKey}
                onChange={(e) => setAjkerpay((p) => ({ ...p, apiKey: e.target.value }))}
                placeholder="আপনার AjkerPay API Key"
                className="h-9 bg-secondary border-border/50"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Secret Key</label>
              <Input
                type={showKeys ? "text" : "password"}
                value={ajkerpay.secretKey}
                onChange={(e) => setAjkerpay((p) => ({ ...p, secretKey: e.target.value }))}
                placeholder="আপনার AjkerPay Secret Key"
                className="h-9 bg-secondary border-border/50"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Brand Key</label>
              <Input
                type={showKeys ? "text" : "password"}
                value={ajkerpay.brandKey}
                onChange={(e) => setAjkerpay((p) => ({ ...p, brandKey: e.target.value }))}
                placeholder="আপনার AjkerPay Brand Key"
                className="h-9 bg-secondary border-border/50"
              />
            </div>
            <button
              onClick={() => setShowKeys(!showKeys)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition"
            >
              {showKeys ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showKeys ? "কী লুকান" : "কী দেখুন"}
            </button>
          </div>
        )}
      </div>

      {/* NowPayBD Config */}
      <div className="bg-card border border-border/30 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="font-semibold text-foreground">NowPayBD গেটওয়ে (bKash/Nagad/Rocket/Bank)</span>
              <p className="text-xs text-muted-foreground">অটো পেমেন্ট প্রসেসিং - NowPayBD</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{nowpaybd.enabled ? "চালু" : "বন্ধ"}</span>
            <Switch
              checked={nowpaybd.enabled}
              onCheckedChange={(v) => setNowpaybd((p) => ({ ...p, enabled: v }))}
            />
          </div>
        </div>

        {nowpaybd.enabled && (
          <div className="space-y-3 pt-2 border-t border-border/20">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">API Key</label>
              <Input
                type={showKeys ? "text" : "password"}
                value={nowpaybd.apiKey}
                onChange={(e) => setNowpaybd((p) => ({ ...p, apiKey: e.target.value }))}
                placeholder="আপনার NowPayBD API Key"
                className="h-9 bg-secondary border-border/50"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Secret Key</label>
              <Input
                type={showKeys ? "text" : "password"}
                value={nowpaybd.secretKey}
                onChange={(e) => setNowpaybd((p) => ({ ...p, secretKey: e.target.value }))}
                placeholder="আপনার NowPayBD Secret Key"
                className="h-9 bg-secondary border-border/50"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Brand Key</label>
              <Input
                type={showKeys ? "text" : "password"}
                value={nowpaybd.brandKey}
                onChange={(e) => setNowpaybd((p) => ({ ...p, brandKey: e.target.value }))}
                placeholder="আপনার NowPayBD Brand Key"
                className="h-9 bg-secondary border-border/50"
              />
            </div>
            <button
              onClick={() => setShowKeys(!showKeys)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition"
            >
              {showKeys ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showKeys ? "কী লুকান" : "কী দেখুন"}
            </button>
          </div>
        )}
      </div>

      {/* Payment Methods */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">পেমেন্ট মেথড সমূহ</h3>
        {methods.map((m) => (
          <div
            key={m.id}
            className={`bg-card border rounded-xl p-5 transition-all ${
              m.enabled ? "border-border/30" : "border-border/10 opacity-60"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {m.iconUrl ? (
                  <img src={m.iconUrl} alt={`${m.name} payment icon`} loading="lazy" className="w-8 h-8 rounded-lg object-contain bg-secondary p-0.5" />
                ) : (
                  <CreditCard className={`w-5 h-5 ${m.enabled ? "text-primary" : "text-muted-foreground"}`} />
                )}
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

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">আইকন/লোগো</label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={(el) => { fileInputRefs.current[m.id] = el; }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleIconUpload(m.id, file);
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 text-xs flex-1"
                  onClick={() => fileInputRefs.current[m.id]?.click()}
                  disabled={!m.enabled || uploading === m.id}
                >
                  {uploading === m.id ? (
                    "আপলোড হচ্ছে..."
                  ) : m.iconUrl ? (
                    <><ImageIcon className="w-3.5 h-3.5 mr-1" /> পরিবর্তন</>
                  ) : (
                    <><Upload className="w-3.5 h-3.5 mr-1" /> আপলোড</>
                  )}
                </Button>
                {m.iconUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 text-destructive hover:text-destructive"
                    onClick={() => removeIcon(m.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-secondary/30 border border-border/20 rounded-xl p-4 text-sm text-muted-foreground space-y-2">
        <p className="font-medium text-foreground">Tips:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>বন্ধ করা মেথড কাস্টমারদের কাছে দেখাবে না</li>
          <li>অন্তত একটি পেমেন্ট মেথড চালু রাখুন</li>
          <li>AjkerPay চালু থাকলে bKash/Nagad/Rocket অটো পেমেন্ট হবে</li>
          <li>আইকন সাইজ: সর্বোচ্চ ২MB, PNG/JPG/SVG সাপোর্টেড</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminPaymentMethods;
