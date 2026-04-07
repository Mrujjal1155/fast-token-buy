import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Trash2, Shield, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AdminUser {
  id: string;
  user_id: string;
  role: string;
}

const AdminUsers = () => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string; userId: string }>({ open: false, id: "", userId: "" });
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    fetchAdmins();
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setCurrentUserId(user.id);
  };

  const fetchAdmins = async () => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("*")
      .eq("role", "admin");
    if (data) setAdmins(data);
    if (error) toast({ title: "অ্যাডমিন লোড ব্যর্থ", variant: "destructive" });
    setLoading(false);
  };

  const addAdmin = async () => {
    if (!newEmail.trim() || !newPassword.trim()) {
      toast({ title: "ইমেইল ও পাসওয়ার্ড দিন", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর", variant: "destructive" });
      return;
    }
    setAdding(true);

    // Sign up the new user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: newEmail.trim(),
      password: newPassword.trim(),
    });

    if (signUpError || !signUpData.user) {
      toast({ title: "অ্যাকাউন্ট তৈরি ব্যর্থ", description: signUpError?.message, variant: "destructive" });
      setAdding(false);
      return;
    }

    // Add admin role
    const { error: roleError } = await supabase
      .from("user_roles")
      .insert({ user_id: signUpData.user.id, role: "admin" as const });

    if (roleError) {
      toast({ title: "অ্যাডমিন রোল দেওয়া যায়নি", description: roleError.message, variant: "destructive" });
    } else {
      toast({ title: "নতুন অ্যাডমিন যোগ হয়েছে!", variant: "success" });
      setNewEmail("");
      setNewPassword("");
      fetchAdmins();
    }
    setAdding(false);
  };

  const removeAdmin = async () => {
    const { id, userId } = deleteDialog;
    setDeleteDialog({ open: false, id: "", userId: "" });

    if (userId === currentUserId) {
      toast({ title: "নিজেকে রিমুভ করা যাবে না!", variant: "destructive" });
      return;
    }

    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ title: "রিমুভ ব্যর্থ", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "অ্যাডমিন রিমুভ হয়েছে", variant: "success" });
      fetchAdmins();
    }
  };

  return (
    <div className="space-y-6">
      {/* Add New Admin */}
      <div className="bg-card border border-border/30 rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-primary" />
          নতুন অ্যাডমিন যোগ করুন
        </h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            type="email"
            placeholder="ইমেইল"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="h-11 bg-secondary border-border/50 flex-1"
          />
          <Input
            type="password"
            placeholder="পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="h-11 bg-secondary border-border/50 flex-1"
          />
          <Button variant="hero" onClick={addAdmin} disabled={adding} className="h-11 px-6">
            {adding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
            {adding ? "যোগ হচ্ছে..." : "যোগ করুন"}
          </Button>
        </div>
      </div>

      {/* Admin List */}
      <div className="bg-card border border-border/30 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border/30">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            বর্তমান অ্যাডমিনরা ({admins.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-8 text-center text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            লোড হচ্ছে...
          </div>
        ) : admins.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">কোনো অ্যাডমিন নেই</div>
        ) : (
          <div className="divide-y divide-border/10">
            {admins.map((admin) => (
              <div key={admin.id} className="flex items-center justify-between p-4 hover:bg-secondary/30 transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground font-mono">{admin.user_id.slice(0, 8)}...</p>
                    <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30 mt-1">
                      {admin.role}
                    </Badge>
                  </div>
                </div>
                {admin.user_id === currentUserId ? (
                  <Badge variant="outline" className="text-xs bg-green-400/10 text-green-400 border-green-400/30">
                    আপনি
                  </Badge>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteDialog({ open: true, id: admin.id, userId: admin.user_id })}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    রিমুভ
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, id: "", userId: "" })}>
        <AlertDialogContent className="bg-card border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">অ্যাডমিন রিমুভ করুন</AlertDialogTitle>
            <AlertDialogDescription>
              আপনি কি নিশ্চিত এই অ্যাডমিনকে রিমুভ করতে চান? এটি আর অ্যাডমিন প্যানেলে এক্সেস পাবে না।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border/50">বাতিল</AlertDialogCancel>
            <AlertDialogAction onClick={removeAdmin} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              রিমুভ করুন
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUsers;
