import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2, Image, Trash2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ImageItem {
  key: string;
  label: string;
  description: string;
  currentUrl: string;
}

const IMAGE_KEYS: Omit<ImageItem, "currentUrl">[] = [
  { key: "site_logo", label: "সাইট লোগো", description: "নেভবার ও ফুটারে দেখাবে" },
  { key: "site_favicon", label: "ফেভিকন", description: "ব্রাউজার ট্যাবে দেখাবে" },
  { key: "site_og_image", label: "OG ইমেজ (সোশ্যাল শেয়ার)", description: "ফেসবুক/হোয়াটসঅ্যাপে শেয়ার করলে দেখাবে" },
];

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const AdminImages = () => {
  const [images, setImages] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchImageSettings();
  }, []);

  const fetchImageSettings = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", IMAGE_KEYS.map((k) => k.key));
    
    if (data) {
      const map: Record<string, string> = {};
      data.forEach((row) => { map[row.key] = row.value; });
      setImages(map);
    }
    setLoading(false);
  };

  const getPublicUrl = (path: string) => {
    return `${SUPABASE_URL}/storage/v1/object/public/site-assets/${path}`;
  };

  const handleUpload = async (key: string, file: File) => {
    setUploading(key);

    const ext = file.name.split(".").pop();
    const filePath = `${key}.${ext}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from("site-assets")
      .upload(filePath, file, { upsert: true, cacheControl: "3600" });

    if (uploadError) {
      toast({ title: "আপলোড ব্যর্থ", description: uploadError.message, variant: "destructive" });
      setUploading(null);
      return;
    }

    const publicUrl = getPublicUrl(filePath);

    // Save URL to site_settings
    const { data: existing } = await supabase
      .from("site_settings")
      .select("id")
      .eq("key", key)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("site_settings")
        .update({ value: publicUrl, updated_at: new Date().toISOString() })
        .eq("key", key);
    } else {
      await supabase
        .from("site_settings")
        .insert({ key, value: publicUrl });
    }

    setImages((prev) => ({ ...prev, [key]: publicUrl }));
    toast({ title: "আপলোড সফল!", variant: "success" });
    setUploading(null);
  };

  const handleRemove = async (key: string) => {
    // Remove from site_settings
    await supabase
      .from("site_settings")
      .update({ value: "", updated_at: new Date().toISOString() })
      .eq("key", key);

    setImages((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
    toast({ title: "ইমেজ রিমুভ হয়েছে", variant: "success" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">ইমেজ ও লোগো ম্যানেজমেন্ট</h2>
        <p className="text-sm text-muted-foreground">সাইটের লোগো, ফেভিকন, OG ইমেজ পরিবর্তন করুন</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {IMAGE_KEYS.map((item) => {
          const currentUrl = images[item.key];
          const isUploading = uploading === item.key;

          return (
            <div
              key={item.key}
              className="bg-card border border-border/30 rounded-xl p-5 space-y-4"
            >
              <div>
                <h3 className="text-sm font-semibold text-foreground">{item.label}</h3>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>

              {/* Preview */}
              <div className="w-full h-32 rounded-lg bg-secondary/50 border border-border/20 flex items-center justify-center overflow-hidden">
                {currentUrl ? (
                  <img
                    src={currentUrl}
                    alt={`${item.label} preview`}
                    loading="lazy"
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="text-center text-muted-foreground">
                    <Image className="w-8 h-8 mx-auto mb-1 opacity-30" />
                    <p className="text-xs">কোনো ইমেজ নেই</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <label className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(item.key, file);
                      e.target.value = "";
                    }}
                    disabled={isUploading}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-1.5 cursor-pointer"
                    asChild
                    disabled={isUploading}
                  >
                    <span>
                      {isUploading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      {isUploading ? "আপলোড হচ্ছে..." : "আপলোড"}
                    </span>
                  </Button>
                </label>
                {currentUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(item.key)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>

              {currentUrl && (
                <a
                  href={currentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground truncate"
                >
                  <ExternalLink className="w-3 h-3 shrink-0" />
                  <span className="truncate">{currentUrl}</span>
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminImages;
