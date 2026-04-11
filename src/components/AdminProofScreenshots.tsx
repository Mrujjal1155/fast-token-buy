import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Eye, EyeOff, Upload, Camera, Sparkles, GripVertical } from "lucide-react";

interface ProofScreenshot {
  id: string;
  image_url: string;
  caption: string;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
}

const AdminProofScreenshots = () => {
  const [screenshots, setScreenshots] = useState<ProofScreenshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const fetchAll = async () => {
    const { data } = await supabase
      .from("proof_screenshots")
      .select("*")
      .order("sort_order", { ascending: true });
    if (data) setScreenshots(data as ProofScreenshot[]);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);

    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop() || "png";
      const fileName = `proof_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("proof-screenshots")
        .upload(fileName, file, { contentType: file.type });

      if (uploadError) {
        toast({ title: "আপলোড ব্যর্থ", description: uploadError.message, variant: "destructive" });
        continue;
      }

      const { data: urlData } = supabase.storage
        .from("proof-screenshots")
        .getPublicUrl(fileName);

      const { error: insertError } = await supabase
        .from("proof_screenshots")
        .insert({
          image_url: urlData.publicUrl,
          caption: "",
          sort_order: screenshots.length,
        });

      if (insertError) {
        toast({ title: "সেভ ব্যর্থ", variant: "destructive" });
      }
    }

    toast({ title: "আপলোড সফল!", variant: "success" });
    setUploading(false);
    fetchAll();
    e.target.value = "";
  };

  const handleUpdate = async (id: string, field: string, value: string | boolean | number) => {
    const { error } = await supabase
      .from("proof_screenshots")
      .update({ [field]: value } as any)
      .eq("id", id);
    if (error) {
      toast({ title: "আপডেট ব্যর্থ", variant: "destructive" });
    } else {
      setScreenshots((prev) => prev.map((s) => s.id === id ? { ...s, [field]: value } : s));
    }
  };

  const handleDelete = async (id: string, imageUrl: string) => {
    // Delete from storage
    const fileName = imageUrl.split("/").pop();
    if (fileName) {
      await supabase.storage.from("proof-screenshots").remove([fileName]);
    }
    // Delete from DB
    const { error } = await supabase.from("proof_screenshots").delete().eq("id", id);
    if (error) {
      toast({ title: "মুছতে পারা যায়নি", variant: "destructive" });
    } else {
      setScreenshots((prev) => prev.filter((s) => s.id !== id));
      toast({ title: "মুছে ফেলা হয়েছে", variant: "success" });
    }
  };

  if (loading) return <p className="text-muted-foreground text-center py-8">লোড হচ্ছে...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <Camera className="w-4 h-4 text-primary-foreground" />
          </div>
          <h2 className="text-lg font-bold text-foreground">প্রুফ স্ক্রিনশট</h2>
        </div>
        <label>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
          <Button variant="hero" size="sm" className="gap-1.5 cursor-pointer" asChild disabled={uploading}>
            <span>
              <Upload className="w-4 h-4" />
              {uploading ? "আপলোড হচ্ছে..." : "ইমেজ আপলোড"}
            </span>
          </Button>
        </label>
      </div>

      <p className="text-xs text-muted-foreground">
        1024×1024 সাইজের স্ক্রিনশট আপলোড করুন। এগুলো ওয়েবসাইটে প্রুফ হিসেবে দেখানো হবে।
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {screenshots.map((s) => (
          <div
            key={s.id}
            className={`relative group rounded-2xl border overflow-hidden transition-all ${
              s.is_visible
                ? "bg-[hsl(222_40%_8%/0.95)] border-primary/20"
                : "bg-[hsl(222_40%_8%/0.7)] border-border/20 opacity-60"
            }`}
          >
            <div className="aspect-square overflow-hidden">
              <img
                src={s.image_url}
                alt={s.caption || "Proof"}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            {/* Overlay controls */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                onClick={() => handleUpdate(s.id, "is_visible", !s.is_visible)}
                className={`p-2.5 rounded-xl transition-all ${
                  s.is_visible
                    ? "text-primary bg-primary/20 hover:bg-primary/30"
                    : "text-muted-foreground bg-secondary/40 hover:bg-secondary/60"
                }`}
                title={s.is_visible ? "লুকান" : "দেখান"}
              >
                {s.is_visible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
              <button
                onClick={() => handleDelete(s.id, s.image_url)}
                className="p-2.5 rounded-xl text-destructive bg-destructive/20 hover:bg-destructive/30 transition-all"
                title="মুছুন"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            {/* Caption input */}
            <div className="p-3">
              <Input
                defaultValue={s.caption}
                placeholder="ক্যাপশন (ঐচ্ছিক)"
                className="h-8 text-xs bg-secondary/40 border-border/20 rounded-lg"
                onBlur={(e) => handleUpdate(s.id, "caption", e.target.value)}
              />
            </div>

            {/* Status indicator */}
            <div className="absolute top-2 right-2">
              <span className={`w-2.5 h-2.5 rounded-full block ${s.is_visible ? "bg-green-400 shadow-[0_0_6px_rgba(34,197,94,0.5)]" : "bg-muted-foreground/40"}`} />
            </div>
          </div>
        ))}
      </div>

      {screenshots.length === 0 && (
        <div className="text-center py-12">
          <div className="w-14 h-14 rounded-2xl bg-secondary/50 flex items-center justify-center mx-auto mb-4">
            <Camera className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">কোনো স্ক্রিনশট নেই। উপরের বাটন দিয়ে আপলোড করুন।</p>
        </div>
      )}
    </div>
  );
};

export default AdminProofScreenshots;
