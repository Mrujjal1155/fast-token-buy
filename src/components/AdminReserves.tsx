import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Eye, EyeOff, Package } from "lucide-react";

interface Reserve {
  id: string;
  label: string;
  amount: string;
  icon: string;
  sort_order: number;
  is_visible: boolean;
}

const AdminReserves = () => {
  const [reserves, setReserves] = useState<Reserve[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchReserves = async () => {
    const { data } = await supabase
      .from("reserves")
      .select("*")
      .order("sort_order");
    if (data) setReserves(data as Reserve[]);
    setLoading(false);
  };

  useEffect(() => { fetchReserves(); }, []);

  const handleUpdate = async (id: string, field: string, value: string | number | boolean) => {
    const { error } = await supabase
      .from("reserves")
      .update({ [field]: value, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      toast({ title: "আপডেট করা যায়নি", variant: "destructive" });
    } else {
      setReserves((prev) => prev.map((r) => r.id === id ? { ...r, [field]: value } : r));
    }
  };

  const handleAdd = async () => {
    const maxOrder = reserves.length > 0 ? Math.max(...reserves.map((r) => r.sort_order)) : 0;
    const { data, error } = await supabase
      .from("reserves")
      .insert({ label: "50 ক্রেডিট", amount: "100", icon: "coins", sort_order: maxOrder + 1 })
      .select()
      .single();
    if (error) {
      toast({ title: "যোগ করা যায়নি", variant: "destructive" });
    } else if (data) {
      setReserves((prev) => [...prev, data as Reserve]);
      toast({ title: "নতুন প্যাকেজ স্টক যোগ হয়েছে" });
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("reserves").delete().eq("id", id);
    if (error) {
      toast({ title: "মুছতে পারা যায়নি", variant: "destructive" });
    } else {
      setReserves((prev) => prev.filter((r) => r.id !== id));
      toast({ title: "মুছে ফেলা হয়েছে" });
    }
  };

  if (loading) return <p className="text-muted-foreground text-center py-8">লোড হচ্ছে...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">প্যাকেজ স্টক ম্যানেজমেন্ট</h2>
          <p className="text-sm text-muted-foreground">প্রতিটি প্যাকেজে কতটি এভেইলেবল আছে সেট করুন</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-1" /> নতুন প্যাকেজ
        </Button>
      </div>

      <div className="space-y-3">
        {reserves.map((r) => (
          <div key={r.id} className="bg-card border border-border/30 rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <Package className="w-5 h-5 text-primary shrink-0 hidden sm:block" />

            <div className="flex-1 w-full sm:w-auto">
              <label className="text-xs text-muted-foreground mb-1 block sm:hidden">প্যাকেজ নাম</label>
              <Input
                defaultValue={r.label}
                placeholder="যেমন: 50 ক্রেডিট"
                className="h-9 bg-secondary border-border/30 text-sm"
                onBlur={(e) => handleUpdate(r.id, "label", e.target.value)}
              />
            </div>

            <div className="w-full sm:w-36">
              <label className="text-xs text-muted-foreground mb-1 block sm:hidden">এভেইলেবল সংখ্যা</label>
              <Input
                defaultValue={r.amount}
                placeholder="এভেইলেবল সংখ্যা"
                className="h-9 bg-secondary border-border/30 text-sm"
                onBlur={(e) => handleUpdate(r.id, "amount", e.target.value)}
              />
            </div>

            <div className="w-full sm:w-20">
              <label className="text-xs text-muted-foreground mb-1 block sm:hidden">ক্রম</label>
              <Input
                type="number"
                defaultValue={r.sort_order}
                placeholder="ক্রম"
                className="h-9 bg-secondary border-border/30 text-sm"
                onBlur={(e) => handleUpdate(r.id, "sort_order", parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="flex gap-1.5 shrink-0">
              <button
                onClick={() => handleUpdate(r.id, "is_visible", !r.is_visible)}
                className={`p-2 rounded-lg transition ${r.is_visible ? "text-primary bg-primary/10" : "text-muted-foreground bg-secondary"}`}
                title={r.is_visible ? "দৃশ্যমান" : "লুকানো"}
              >
                {r.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <button
                onClick={() => handleDelete(r.id)}
                className="p-2 rounded-lg text-destructive bg-destructive/10 hover:bg-destructive/20 transition"
                title="মুছুন"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {reserves.length === 0 && (
        <p className="text-center text-muted-foreground py-6">কোনো প্যাকেজ স্টক নেই। উপরের বাটন দিয়ে যোগ করুন।</p>
      )}
    </div>
  );
};

export default AdminReserves;
