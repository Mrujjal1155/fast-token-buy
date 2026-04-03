import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Save, Package, Star } from "lucide-react";

interface PackageRow {
  id: string;
  package_key: string;
  credits: number;
  price: number;
  currency: string;
  popular: boolean;
  savings: string | null;
  sort_order: number;
  is_active: boolean;
}

const AdminPackages = () => {
  const [packages, setPackages] = useState<PackageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPackages = async () => {
    const { data, error } = await supabase
      .from("packages")
      .select("*")
      .order("sort_order");
    if (data) setPackages(data as PackageRow[]);
    if (error) toast({ title: "লোড করতে সমস্যা", variant: "destructive" });
    setLoading(false);
  };

  useEffect(() => { fetchPackages(); }, []);

  const addPackage = async () => {
    const key = `pkg-${Date.now()}`;
    const { error } = await supabase.from("packages").insert({
      package_key: key,
      credits: 50,
      price: 40,
      currency: "BDT",
      sort_order: packages.length,
    });
    if (error) {
      toast({ title: "যোগ করা যায়নি", variant: "destructive" });
    } else {
      toast({ title: "নতুন প্যাকেজ যোগ হয়েছে", variant: "success" });
      fetchPackages();
    }
  };

  const updatePackage = async (pkg: PackageRow) => {
    const { error } = await supabase
      .from("packages")
      .update({
        credits: pkg.credits,
        price: pkg.price,
        currency: pkg.currency,
        popular: pkg.popular,
        savings: pkg.savings,
        sort_order: pkg.sort_order,
        is_active: pkg.is_active,
      })
      .eq("id", pkg.id);
    if (error) {
      toast({ title: "আপডেট ব্যর্থ", variant: "destructive" });
    } else {
      toast({ title: "প্যাকেজ আপডেট হয়েছে", variant: "success" });
    }
  };

  const deletePackage = async (id: string) => {
    const { error } = await supabase.from("packages").delete().eq("id", id);
    if (error) {
      toast({ title: "ডিলিট ব্যর্থ", variant: "destructive" });
    } else {
      toast({ title: "প্যাকেজ ডিলিট হয়েছে", variant: "success" });
      fetchPackages();
    }
  };

  const updateField = (id: string, field: keyof PackageRow, value: any) => {
    setPackages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  if (loading) return <p className="text-center text-muted-foreground py-8">লোড হচ্ছে...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Package className="w-5 h-5" /> প্যাকেজ ম্যানেজমেন্ট
          </h2>
          <p className="text-sm text-muted-foreground">ক্রেডিট প্যাকেজ যোগ, এডিট বা ডিলিট করুন</p>
        </div>
        <Button onClick={addPackage} size="sm">
          <Plus className="w-4 h-4 mr-1" /> নতুন প্যাকেজ
        </Button>
      </div>

      <div className="space-y-4">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className="bg-card border border-border/30 rounded-xl p-5 space-y-4"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">ক্রেডিট</label>
                <Input
                  type="number"
                  value={pkg.credits}
                  onChange={(e) => updateField(pkg.id, "credits", parseInt(e.target.value) || 0)}
                  className="h-9 bg-secondary border-border/50"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">দাম (৳)</label>
                <Input
                  type="number"
                  value={pkg.price}
                  onChange={(e) => updateField(pkg.id, "price", parseFloat(e.target.value) || 0)}
                  className="h-9 bg-secondary border-border/50"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-muted-foreground mb-1 block">সেভিংস টেক্সট</label>
                <Input
                  value={pkg.savings || ""}
                  onChange={(e) => updateField(pkg.id, "savings", e.target.value || null)}
                  placeholder="যেমন: ২৪% সাশ্রয়!"
                  className="h-9 bg-secondary border-border/50"
                />
              </div>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Star className={`w-4 h-4 ${pkg.popular ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="text-sm text-muted-foreground">পপুলার</span>
                  <Switch
                    checked={pkg.popular}
                    onCheckedChange={(v) => updateField(pkg.id, "popular", v)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">একটিভ</span>
                  <Switch
                    checked={pkg.is_active}
                    onCheckedChange={(v) => updateField(pkg.id, "is_active", v)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground">অর্ডার</label>
                  <Input
                    type="number"
                    value={pkg.sort_order}
                    onChange={(e) => updateField(pkg.id, "sort_order", parseInt(e.target.value) || 0)}
                    className="h-8 w-16 bg-secondary border-border/50 text-center text-xs"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => updatePackage(pkg)}>
                  <Save className="w-3.5 h-3.5 mr-1" /> সেভ
                </Button>
                <Button variant="destructive" size="sm" onClick={() => deletePackage(pkg.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {packages.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Package className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p>কোনো প্যাকেজ নেই। উপরে "নতুন প্যাকেজ" ক্লিক করুন।</p>
        </div>
      )}
    </div>
  );
};

export default AdminPackages;
