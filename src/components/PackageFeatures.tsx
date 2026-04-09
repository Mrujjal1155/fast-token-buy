import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Eye, EyeOff, Check, ChevronDown, ChevronUp } from "lucide-react";

interface Feature {
  id: string;
  text_en: string;
  text_bn: string;
  sort_order: number;
  is_visible: boolean;
  package_key: string | null;
}

interface PackageFeaturesProps {
  packageKey: string;
  textLang: "en" | "bn";
}

const PackageFeatures = ({ packageKey, textLang }: PackageFeaturesProps) => {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchFeatures = async () => {
    const { data } = await supabase
      .from("pricing_features")
      .select("*")
      .or(`package_key.eq.${packageKey},package_key.is.null`)
      .order("sort_order");
    if (data) setFeatures(data as Feature[]);
    setLoading(false);
  };

  useEffect(() => { fetchFeatures(); }, [packageKey]);

  const handleAdd = async () => {
    const maxOrder = features.length > 0 ? Math.max(...features.map((f) => f.sort_order)) : 0;
    const { data, error } = await supabase
      .from("pricing_features")
      .insert({ text_en: "New feature", text_bn: "নতুন ফিচার", sort_order: maxOrder + 1, package_key: packageKey } as any)
      .select()
      .single();
    if (error) {
      toast({ title: "যোগ করা যায়নি", variant: "destructive" });
    } else if (data) {
      setFeatures((prev) => [...prev, data as Feature]);
      toast({ title: "ফিচার যোগ হয়েছে", variant: "success" });
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
      toast({ title: "ফিচার মুছে ফেলা হয়েছে", variant: "success" });
    }
  };

  const packageFeatures = features.filter((f) => f.package_key === packageKey);
  const globalFeatures = features.filter((f) => f.package_key === null);

  if (loading) return null;

  return (
    <div className="border-t border-border/20 pt-3 mt-3">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-full"
      >
        <Check className="w-4 h-4 text-emerald-400" />
        ফিচার লিস্ট ({packageFeatures.length} নিজস্ব + {globalFeatures.length} গ্লোবাল)
        {expanded ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
      </button>

      {expanded && (
        <div className="mt-3 space-y-2">
          {/* Package-specific features */}
          {packageFeatures.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">📦 এই প্ল্যানের ফিচার</p>
              {packageFeatures.map((f) => (
                <div key={f.id} className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <Input
                    defaultValue={textLang === "en" ? f.text_en : f.text_bn}
                    key={`${f.id}-${textLang}`}
                    placeholder={textLang === "en" ? "Feature text" : "ফিচার টেক্সট"}
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
            </div>
          )}

          {/* Global features (read-only view) */}
          {globalFeatures.length > 0 && (
            <div className="space-y-1.5 mt-2">
              <p className="text-xs text-muted-foreground font-medium">🌐 গ্লোবাল ফিচার (সব প্ল্যানে দেখায়)</p>
              {globalFeatures.map((f) => (
                <div key={f.id} className="flex items-center gap-2 opacity-60">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-xs text-muted-foreground">{textLang === "en" ? f.text_en : f.text_bn}</span>
                </div>
              ))}
            </div>
          )}

          <Button variant="outline" size="sm" onClick={handleAdd} className="mt-2 h-7 text-xs">
            <Plus className="w-3 h-3 mr-1" /> ফিচার যোগ করুন
          </Button>
        </div>
      )}
    </div>
  );
};

export default PackageFeatures;
