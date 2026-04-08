import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Eye, EyeOff, Bell, Sparkles } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  is_active: boolean;
  created_at: string;
}

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAll = async () => {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setNotifications(data as Notification[]);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAdd = async () => {
    const { data, error } = await supabase
      .from("notifications")
      .insert({ title: "নতুন নোটিফিকেশন", message: "এখানে মেসেজ লিখুন" })
      .select()
      .single();
    if (error) {
      toast({ title: "যোগ করা যায়নি", variant: "destructive" });
    } else if (data) {
      setNotifications((prev) => [data as Notification, ...prev]);
      toast({ title: "নোটিফিকেশন যোগ হয়েছে", variant: "success" });
    }
  };

  const handleUpdate = async (id: string, field: string, value: string | boolean) => {
    const updateData: Record<string, string | boolean> = { [field]: value };
    const { error } = await supabase
      .from("notifications")
      .update(updateData as any)
      .eq("id", id);
    if (error) {
      toast({ title: "আপডেট করা যায়নি", variant: "destructive" });
    } else {
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, [field]: value } : n));
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("notifications").delete().eq("id", id);
    if (error) {
      toast({ title: "মুছতে পারা যায়নি", variant: "destructive" });
    } else {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast({ title: "মুছে ফেলা হয়েছে", variant: "success" });
    }
  };

  if (loading) return <p className="text-muted-foreground text-center py-8">লোড হচ্ছে...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <h2 className="text-lg font-bold text-foreground">নোটিফিকেশন</h2>
        </div>
        <Button variant="hero" size="sm" onClick={handleAdd} className="gap-1.5">
          <Plus className="w-4 h-4" /> নতুন যোগ
        </Button>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`relative overflow-hidden rounded-2xl border backdrop-blur-xl p-5 space-y-3 transition-all ${
              n.is_active
                ? "bg-[hsl(222_40%_8%/0.95)] border-primary/20 shadow-[0_0_20px_-5px_rgba(255,122,24,0.1)]"
                : "bg-[hsl(222_40%_8%/0.7)] border-border/20 opacity-70"
            }`}
          >
            {/* Accent bar */}
            <div
              className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${
                n.is_active
                  ? "bg-gradient-to-b from-primary to-primary/30"
                  : "bg-gradient-to-b from-muted-foreground/30 to-transparent"
              }`}
            />

            <div className="flex items-start justify-between gap-3 pl-2">
              <div className="flex-1 space-y-2">
                <Input
                  defaultValue={n.title}
                  placeholder="শিরোনাম"
                  className="h-9 bg-secondary/40 border-border/20 text-sm font-semibold rounded-xl focus:border-primary/40 focus:shadow-[0_0_10px_-3px_rgba(255,122,24,0.2)]"
                  onBlur={(e) => handleUpdate(n.id, "title", e.target.value)}
                />
                <Textarea
                  defaultValue={n.message}
                  placeholder="মেসেজ"
                  className="bg-secondary/40 border-border/20 text-sm min-h-[60px] rounded-xl focus:border-primary/40 focus:shadow-[0_0_10px_-3px_rgba(255,122,24,0.2)]"
                  onBlur={(e) => handleUpdate(n.id, "message", e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <button
                  onClick={() => handleUpdate(n.id, "is_active", !n.is_active)}
                  className={`p-2.5 rounded-xl transition-all ${
                    n.is_active
                      ? "text-primary bg-primary/10 shadow-[0_0_10px_-3px_rgba(255,122,24,0.2)] hover:bg-primary/20"
                      : "text-muted-foreground bg-secondary/40 hover:bg-secondary/60"
                  }`}
                  title={n.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                >
                  {n.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleDelete(n.id)}
                  className="p-2.5 rounded-xl text-destructive bg-destructive/10 hover:bg-destructive/20 hover:shadow-[0_0_10px_-3px_rgba(220,38,38,0.2)] transition-all"
                  title="মুছুন"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 pl-2">
              <span className={`w-1.5 h-1.5 rounded-full ${n.is_active ? "bg-green-400 shadow-[0_0_6px_rgba(34,197,94,0.5)]" : "bg-muted-foreground/40"}`} />
              <p className="text-[11px] text-muted-foreground/70">
                {new Date(n.created_at).toLocaleDateString("bn-BD")} — {n.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {notifications.length === 0 && (
        <div className="text-center py-12">
          <div className="w-14 h-14 rounded-2xl bg-secondary/50 flex items-center justify-center mx-auto mb-4">
            <Bell className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">কোনো নোটিফিকেশন নেই। উপরের বাটন দিয়ে যোগ করুন।</p>
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;
