import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Save, Wallet, CreditCard, Upload, X, ImageIcon } from "lucide-react";
import { paymentMethods } from "@/lib/packages";

interface PaymentMethodConfig {
  id: string;
  name: string;
  enabled: boolean;
  number: string;
  iconUrl: string | null;
}

const AdminPaymentMethods = () => {
  const [methods, setMethods] = useState<PaymentMethodConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchConfig();
  }, []);

  const getIconUrl = (methodId: string) => {
    const { data } = supabase.storage
      .from("payment-icons")
      .getPublicUrl(`${methodId}.png`);
    return data.publicUrl;
  };

  const fetchConfig = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("key, value")
      .like("key", "payment_method_%");

    const savedConfig: Record<string, any> = {};
    if (data) {
      data.forEach((s) => {
        const methodId = s.key.replace("payment_method_", "").replace("_enabled", "").replace("_number", "").replace("_icon", "");
        if (!savedConfig[methodId]) savedConfig[methodId] = {};
        if (s.key.endsWith("_enabled")) savedConfig[methodId].enabled = s.value === "true";
        if (s.key.endsWith("_number")) savedConfig[methodId].number = s.value;
        if (s.key.endsWith("_icon")) savedConfig[methodId].iconUrl = s.value;
      });
    }

    const merged = paymentMethods.map((m) => ({
      id: m.id,
      name: m.name,
      enabled: savedConfig[m.id]?.enabled ?? true,
      number: savedConfig[m.id]?.number ?? m.number,
      iconUrl: savedConfig[m.id]?.iconUrl || null,
    }));

    setMethods(merged);
    setLoading(false);
  };

  const updateMethod = (id: string, field: keyof PaymentMethodConfig, value: any) => {
    setMethods((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
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

    // Delete old file if exists
    await supabase.storage.from("payment-icons").remove([filePath]);

    const { error } = await supabase.storage
      .from("payment-icons")
      .upload(filePath, file, { upsert: true });

    if (error) {
      toast({ title: "আপলোড ব্যর্থ", description: error.message, variant: "destructive" });
      setUploading(null);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("payment-icons")
      .getPublicUrl(filePath);

    const iconUrl = `${urlData.publicUrl}?t=${Date.now()}`;
    updateMethod(methodId, "iconUrl", iconUrl);
    toast({ title: "আইকন আপলোড হয়েছে ✅" });
    setUploading(null);
  };

  const removeIcon = async (methodId: string) => {
    // Remove all possible extensions
    const extensions = ["png", "jpg", "jpeg", "webp", "svg"];
    await supabase.storage
      .from("payment-icons")
      .remove(extensions.map((ext) => `${methodId}.${ext}`));

    updateMethod(methodId, "iconUrl", null);
    toast({ title: "আইকন মুছে ফেলা হয়েছে" });
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
      saveSetting(`payment_method_${m.id}_icon`, m.iconUrl || ""),
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
          <p className="text-sm text-muted-foreground">প্রতিটি পেমেন্ট মেথড চালু/বন্ধ, নম্বর ও আইকন সেট করুন</p>
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
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {m.iconUrl ? (
                  <img src={m.iconUrl} alt={m.name} className="w-8 h-8 rounded-lg object-contain bg-secondary p-0.5" />
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
          </div>
        ))}
      </div>

      <div className="bg-secondary/30 border border-border/20 rounded-xl p-4 text-sm text-muted-foreground space-y-2">
        <p className="font-medium text-foreground">💡 টিপস:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>বন্ধ করা মেথড কাস্টমারদের কাছে দেখাবে না</li>
          <li>অন্তত একটি পেমেন্ট মেথড চালু রাখুন</li>
          <li>আইকন সাইজ: সর্বোচ্চ ২MB, PNG/JPG/SVG সাপোর্টেড</li>
          <li>নম্বর পরিবর্তন করলে কাস্টমার নতুন নম্বরে পেমেন্ট করবে</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminPaymentMethods;
