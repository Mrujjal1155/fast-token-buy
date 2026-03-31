import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Eye, EyeOff, Bell } from "lucide-react";

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
    // Admins can see all via the admin policy
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
      toast({ title: "নোটিফিকেশন যোগ হয়েছে" });
    }
  };

  const handleUpdate = async (id: string, field: string, value: string | boolean) => {
    const { error } = await supabase
      .from("notifications")
      .update({ [field]: value })
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
      toast({ title: "মুছে ফেলা হয়েছে" });
    }
  };

  if (loading) return <p className="text-muted-foreground text-center py-8">লোড হচ্ছে...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">নোটিফিকেশন</h2>
        </div>
        <Button variant="outline" size="sm" onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-1" /> নতুন যোগ
        </Button>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <div key={n.id} className="bg-card border border-border/30 rounded-xl p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-2">
                <Input
                  defaultValue={n.title}
                  placeholder="শিরোনাম"
                  className="h-9 bg-secondary border-border/30 text-sm font-semibold"
                  onBlur={(e) => handleUpdate(n.id, "title", e.target.value)}
                />
                <Textarea
                  defaultValue={n.message}
                  placeholder="মেসেজ"
                  className="bg-secondary border-border/30 text-sm min-h-[60px]"
                  onBlur={(e) => handleUpdate(n.id, "message", e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5 shrink-0">
                <button
                  onClick={() => handleUpdate(n.id, "is_active", !n.is_active)}
                  className={`p-2 rounded-lg transition ${n.is_active ? "text-primary bg-primary/10" : "text-muted-foreground bg-secondary"}`}
                  title={n.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                >
                  {n.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleDelete(n.id)}
                  className="p-2 rounded-lg text-destructive bg-destructive/10 hover:bg-destructive/20 transition"
                  title="মুছুন"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground">
              {new Date(n.created_at).toLocaleDateString("bn-BD")} — {n.is_active ? "✅ সক্রিয়" : "⛔ নিষ্ক্রিয়"}
            </p>
          </div>
        ))}
      </div>

      {notifications.length === 0 && (
        <p className="text-center text-muted-foreground py-6">কোনো নোটিফিকেশন নেই। উপরের বাটন দিয়ে যোগ করুন।</p>
      )}
    </div>
  );
};

export default AdminNotifications;
