import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Eye, EyeOff, Check, Globe, ChevronDown, ChevronUp } from "lucide-react";

interface Feature {
  id: string;
  text_en: string;
  text_bn: string;
  sort_order: number;
  is_visible: boolean;
  package_key: string | null;
}

interface GlobalFeaturesProps {
  textLang: "en" | "bn";
}

const GlobalFeatures = ({ textLang }: GlobalFeaturesProps) => {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchFeatures = async () => {
    const { data } = await supabase
      .from("pricing_features")
      .select("*")
      .is("package_key", null)
      .order("sort_order");
    if (data) setFeatures(data as Feature[]);
    setLoading(false);
  };

  useEffect(() => { fetchFeatures(); }, []);

  const handleAdd = async () => {
    const maxOrder = features.length > 0 ? Math.max(...features.map((f) => f.sort_order)) : 0;
    const { data, error } = await supabase
      .from("pricing_features")
      .insert({ text_en: "New feature", text_bn: "নতুন ফিচার", sort_order: maxOrder + 1, package_key: null } as any)
      .select()
      .single();
    if (error) {
      toast({ title: "যোগ করা যায়নি", variant: "destructive" });
    } else if (data) {
      setFeatures((prev) => [...prev, data as Feature]);
      toast({ title: "গ্লোবাল ফিচার যোগ হয়েছে", variant: "success" });
    }
  };

  const handleUpdate = async (id: string, field: string, value: string | number | boolean) => {
    const { error } = await supabase
      .from("pricing_features")
      .update({ [field]: value, updated_at: new Date().toISOString() } as any)
      .eq("id", id);
    if (!error) {
      setFeatures((prev) => prev.map((f) => (f.id === id ? { ...f, [field]: value } : f)));
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("pricing_features").delete().eq("id", id);
    if (!error) {
      setFeatures((prev) => prev.filter((f) => f.id !== id));
      toast({ title: "গ্লোবাল ফিচার মুছে ফেলা হয়েছে", variant: "success" });
    }
  };

  if (loading) return null;

  return (
    <div className="bg-card border border-border/30 rounded-xl p-5">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors w-full"
      >
        <Globe className="w-5 h-5 text-primary" />
        🌐 গ্লোবাল ফিচার (সব প্ল্যানে দেখায়) — {features.length} টি
        {expanded ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
      </button>

      {expanded && (
        <div className="mt-4 space-y-2">
          {features.length === 0 && (
            <p className="text-xs text-muted-foreground py-2">কোনো গ্লোবাল ফিচার নেই।</p>
          )}

          {features.map((f) => (
            <div key={f.id} className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <Input
                defaultValue={textLang === "en" ? f.text_en : f.text_bn}
                key={`${f.id}-${textLang}`}
                placeholder={textLang === "en" ? "Feature text (English)" : "ফিচার টেক্সট (বাংলা)"}
                className="h-8 bg-secondary border-border/30 text-xs flex-1"
                onBlur={(e) => handleUpdate(f.id, textLang === "en" ? "text_en" : "text_bn", e.target.value)}
              />
              <Input
                type="number"
                defaultValue={f.sort_order}
                className="h-8 w-14 bg-secondary border-border/30 text-xs text-center"
                onBlur={(e) => handleUpdate(f.id, "sort_order", parseInt(e.target.value) || 0)}
              />
              <button
                onClick={() => handleUpdate(f.id, "is_visible", !f.is_visible)}
                className={`p-1.5 rounded-md transition ${f.is_visible ? "text-primary bg-primary/10" : "text-muted-foreground bg-secondary"}`}
              >
                {f.is_visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => handleDelete(f.id)}
                className="p-1.5 rounded-md text-destructive bg-destructive/10 hover:bg-destructive/20 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          <Button variant="outline" size="sm" onClick={handleAdd} className="mt-2 h-7 text-xs">
            <Plus className="w-3 h-3 mr-1" /> গ্লোবাল ফিচার যোগ করুন
          </Button>
        </div>
      )}
    </div>
  );
};

export default GlobalFeatures;
