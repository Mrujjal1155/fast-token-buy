import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Tag, Pencil, Trash2, X, Check } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Coupon = Tables<"coupons">;

interface CouponForm {
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: string;
  min_amount: string;
  max_uses: string;
  expires_at: string;
  is_active: boolean;
}

const emptyCoupon: CouponForm = {
  code: "",
  discount_type: "percentage",
  discount_value: "",
  min_amount: "0",
  max_uses: "",
  expires_at: "",
  is_active: true,
};

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CouponForm>(emptyCoupon);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    const { data } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setCoupons(data);
    setLoading(false);
  };

  const openCreate = () => {
    setForm(emptyCoupon);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (c: Coupon) => {
    setForm({
      code: c.code,
      discount_type: c.discount_type as "percentage" | "fixed",
      discount_value: String(c.discount_value),
      min_amount: String(c.min_amount ?? 0),
      max_uses: c.max_uses ? String(c.max_uses) : "",
      expires_at: c.expires_at ? c.expires_at.slice(0, 16) : "",
      is_active: c.is_active,
    });
    setEditingId(c.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.code.trim() || !form.discount_value) {
      toast({ title: "Code and discount value are required", variant: "destructive" });
      return;
    }
    setSaving(true);

    const payload = {
      code: form.code.trim().toUpperCase(),
      discount_type: form.discount_type as "percentage" | "fixed",
      discount_value: Number(form.discount_value),
      min_amount: Number(form.min_amount) || 0,
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      expires_at: form.expires_at || null,
      is_active: form.is_active,
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from("coupons").update(payload).eq("id", editingId));
    } else {
      ({ error } = await supabase.from("coupons").insert(payload));
    }

    if (error) {
      toast({ title: "Failed to save", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editingId ? "Coupon updated" : "Coupon created" });
      setShowForm(false);
      fetchCoupons();
    }
    setSaving(false);
  };

  const toggleActive = async (id: string, active: boolean) => {
    await supabase.from("coupons").update({ is_active: active }).eq("id", id);
    fetchCoupons();
  };

  const deleteCoupon = async (id: string) => {
    const { error } = await supabase.from("coupons").delete().eq("id", id);
    if (error) {
      toast({ title: "Failed to delete", variant: "destructive" });
    } else {
      toast({ title: "Coupon deleted" });
      fetchCoupons();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Tag className="w-5 h-5 text-primary" /> Coupons
        </h2>
        <Button variant="hero" size="sm" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-1" /> New Coupon
        </Button>
      </div>

      {/* Create/Edit form */}
      {showForm && (
        <div className="bg-secondary/50 border border-border/30 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-foreground">{editingId ? "Edit Coupon" : "Create Coupon"}</h3>
            <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Code</label>
              <Input
                placeholder="e.g. SAVE10"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                className="h-10 bg-background border-border/50 uppercase"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Discount Type</label>
              <Select value={form.discount_type} onValueChange={(v) => setForm({ ...form, discount_type: v as "percentage" | "fixed" })}>
                <SelectTrigger className="h-10 bg-background border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="fixed">Fixed (৳)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Discount Value {form.discount_type === "percentage" ? "(%)" : "(৳)"}
              </label>
              <Input
                type="number"
                placeholder="10"
                value={form.discount_value}
                onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                className="h-10 bg-background border-border/50"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Min Order Amount (৳)</label>
              <Input
                type="number"
                placeholder="0"
                value={form.min_amount}
                onChange={(e) => setForm({ ...form, min_amount: e.target.value })}
                className="h-10 bg-background border-border/50"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Max Uses (empty = unlimited)</label>
              <Input
                type="number"
                placeholder="Unlimited"
                value={form.max_uses}
                onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
                className="h-10 bg-background border-border/50"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Expires At (optional)</label>
              <Input
                type="datetime-local"
                value={form.expires_at}
                onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                className="h-10 bg-background border-border/50"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
            <span className="text-sm text-foreground">Active</span>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="hero" size="sm" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editingId ? "Update" : "Create"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Coupons table */}
      <div className="bg-card border border-border/30 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/30 text-muted-foreground">
                <th className="text-left p-4 font-medium">Code</th>
                <th className="text-left p-4 font-medium">Discount</th>
                <th className="text-left p-4 font-medium">Min Amount</th>
                <th className="text-left p-4 font-medium">Uses</th>
                <th className="text-left p-4 font-medium">Expires</th>
                <th className="text-left p-4 font-medium">Active</th>
                <th className="text-left p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : coupons.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No coupons yet</td></tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c.id} className="border-b border-border/10 hover:bg-secondary/30 transition">
                    <td className="p-4 font-mono font-bold text-primary">{c.code}</td>
                    <td className="p-4 text-foreground">
                      {c.discount_type === "percentage" ? `${c.discount_value}%` : `৳${c.discount_value}`}
                    </td>
                    <td className="p-4 text-foreground">৳{c.min_amount ?? 0}</td>
                    <td className="p-4 text-foreground">
                      {c.used_count}{c.max_uses ? ` / ${c.max_uses}` : " / ∞"}
                    </td>
                    <td className="p-4 text-xs text-muted-foreground">
                      {c.expires_at ? new Date(c.expires_at).toLocaleDateString() : "Never"}
                    </td>
                    <td className="p-4">
                      <Switch
                        checked={c.is_active}
                        onCheckedChange={(v) => toggleActive(c.id, v)}
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteCoupon(c.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCoupons;
