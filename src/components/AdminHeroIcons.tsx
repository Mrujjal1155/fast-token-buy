import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2, Trash2, Plus, Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface HeroIcon {
  id: string;
  image_url: string;
  label: string;
  position_x: number;
  position_y: number;
  rotation: number;
  size: number;
  is_visible: boolean;
  sort_order: number;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const AdminHeroIcons = () => {
  const [icons, setIcons] = useState<HeroIcon[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => { fetchIcons(); }, []);

  const fetchIcons = async () => {
    const { data } = await supabase
      .from("hero_floating_icons")
      .select("*")
      .order("sort_order");
    if (data) setIcons(data as HeroIcon[]);
    setLoading(false);
  };

  const handleUpload = async (file: File, label: string) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const filePath = `hero-icons/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("site-assets")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast({ title: "আপলোড ব্যর্থ", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/site-assets/${filePath}`;

    // Random position
    const positions = [
      { x: 5, y: 15 }, { x: 85, y: 10 }, { x: 8, y: 50 },
      { x: 88, y: 45 }, { x: 12, y: 80 }, { x: 82, y: 75 },
      { x: 3, y: 35 }, { x: 92, y: 30 },
    ];
    const pos = positions[icons.length % positions.length];

    const { error } = await supabase.from("hero_floating_icons").insert({
      image_url: publicUrl,
      label: label || "Icon",
      position_x: pos.x,
      position_y: pos.y,
      rotation: Math.floor(Math.random() * 30) - 15,
      size: 60,
      sort_order: icons.length,
    });

    if (error) {
      toast({ title: "সেভ ব্যর্থ", variant: "destructive" });
    } else {
      toast({ title: "আইকন যোগ হয়েছে!", variant: "success" });
      fetchIcons();
    }
    setUploading(false);
  };

  const updateIcon = async (id: string, updates: Partial<HeroIcon>) => {
    await supabase.from("hero_floating_icons").update(updates).eq("id", id);
    setIcons((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));
  };

  const deleteIcon = async (id: string) => {
    await supabase.from("hero_floating_icons").delete().eq("id", id);
    setIcons((prev) => prev.filter((i) => i.id !== id));
    toast({ title: "আইকন ডিলিট হয়েছে", variant: "success" });
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground mb-1">হিরো ফ্লোটিং আইকন</h2>
          <p className="text-sm text-muted-foreground">হিরো সেকশনে ভাসমান আইকন যোগ/ম্যানেজ করুন</p>
        </div>
        <label>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const label = prompt("আইকনের লেবেল দিন (যেমন: WordPress, Flutter)") || "Icon";
                handleUpload(file, label);
              }
              e.target.value = "";
            }}
            disabled={uploading}
          />
          <Button variant="outline" size="sm" className="gap-1.5 cursor-pointer" asChild disabled={uploading}>
            <span>
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {uploading ? "আপলোড হচ্ছে..." : "আইকন যোগ করুন"}
            </span>
          </Button>
        </label>
      </div>

      {icons.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Image className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p>কোনো আইকন নেই। উপরের বাটনে ক্লিক করে আইকন যোগ করুন।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {icons.map((icon) => (
            <div key={icon.id} className="bg-card border border-border/30 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-lg bg-secondary/50 flex items-center justify-center overflow-hidden shrink-0">
                  <img src={icon.image_url} alt={icon.label} className="max-w-full max-h-full object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <Input
                    value={icon.label}
                    onChange={(e) => updateIcon(icon.id, { label: e.target.value })}
                    className="text-sm h-8"
                    placeholder="লেবেল"
                  />
                </div>
                <Button variant="ghost" size="sm" onClick={() => deleteIcon(icon.id)} className="text-destructive shrink-0">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-muted-foreground">X পজিশন (%)</label>
                  <Input
                    type="number" min={0} max={100}
                    value={icon.position_x}
                    onChange={(e) => updateIcon(icon.id, { position_x: Number(e.target.value) })}
                    className="h-7 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground">Y পজিশন (%)</label>
                  <Input
                    type="number" min={0} max={100}
                    value={icon.position_y}
                    onChange={(e) => updateIcon(icon.id, { position_y: Number(e.target.value) })}
                    className="h-7 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground">রোটেশন (°)</label>
                  <Input
                    type="number" min={-45} max={45}
                    value={icon.rotation}
                    onChange={(e) => updateIcon(icon.id, { rotation: Number(e.target.value) })}
                    className="h-7 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground">সাইজ (px)</label>
                  <Input
                    type="number" min={20} max={150}
                    value={icon.size}
                    onChange={(e) => updateIcon(icon.id, { size: Number(e.target.value) })}
                    className="h-7 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{icon.is_visible ? "দেখাচ্ছে" : "লুকানো"}</span>
                <Button
                  variant={icon.is_visible ? "outline" : "secondary"}
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => updateIcon(icon.id, { is_visible: !icon.is_visible })}
                >
                  {icon.is_visible ? "লুকান" : "দেখান"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminHeroIcons;
