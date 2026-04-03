import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Lock, UserPlus } from "lucide-react";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast({ title: "লগইন ব্যর্থ", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    // Check admin role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      await supabase.auth.signOut();
      toast({ title: "অ্যাক্সেস নেই", description: "আপনি অ্যাডমিন নন।", variant: "destructive" });
      setLoading(false);
      return;
    }

    navigate("/admin/dashboard");
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে", variant: "destructive" });
      return;
    }
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      toast({ title: "সাইনআপ ব্যর্থ", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    if (!data.user) {
      toast({ title: "সাইনআপ ব্যর্থ", variant: "destructive" });
      setLoading(false);
      return;
    }

    // Try to become first admin
    const { data: isAdmin } = await supabase.rpc("setup_first_admin", { p_user_id: data.user.id });

    if (isAdmin) {
      toast({ title: "অ্যাডমিন অ্যাকাউন্ট তৈরি হয়েছে!", variant: "success" });
      navigate("/admin/dashboard");
    } else {
      toast({ title: "অ্যাকাউন্ট তৈরি হয়েছে, কিন্তু অ্যাডমিন ইতিমধ্যে আছে।", variant: "destructive" });
      await supabase.auth.signOut();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <form onSubmit={isSignup ? handleSignup : handleLogin} className="bg-card border border-border/30 rounded-2xl p-8 shadow-card space-y-6">
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              {isSignup ? <UserPlus className="w-7 h-7 text-primary" /> : <Lock className="w-7 h-7 text-primary" />}
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              {isSignup ? "Admin Setup" : "Admin Login"}
            </h2>
            {isSignup && (
              <p className="text-sm text-muted-foreground mt-1">প্রথম সাইনআপ অটো-অ্যাডমিন হবে</p>
            )}
          </div>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 bg-secondary border-border/50"
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 bg-secondary border-border/50"
            required
          />
          <Button variant="hero" size="lg" className="w-full" type="submit" disabled={loading}>
            {loading ? "অপেক্ষা করুন..." : isSignup ? "Sign Up & Setup Admin" : "Sign In"}
          </Button>
          <button
            type="button"
            onClick={() => setIsSignup(!isSignup)}
            className="w-full text-center text-sm text-muted-foreground hover:text-primary transition"
          >
            {isSignup ? "ইতিমধ্যে অ্যাকাউন্ট আছে? লগইন করুন" : "নতুন অ্যাডমিন? সাইনআপ করুন"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
