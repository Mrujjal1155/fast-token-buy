import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Star, CheckCircle, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Review {
  id: string;
  order_id: string;
  name: string;
  rating: number;
  text: string;
  is_approved: boolean;
  created_at: string;
}

const AdminReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setReviews(data as Review[]);
    if (error) toast({ title: "রিভিউ লোড ব্যর্থ", variant: "destructive" });
    setLoading(false);
  };

  useEffect(() => { fetchReviews(); }, []);

  const toggleApproval = async (id: string, current: boolean) => {
    const { error } = await supabase
      .from("reviews")
      .update({ is_approved: !current })
      .eq("id", id);
    if (error) {
      toast({ title: "আপডেট ব্যর্থ", variant: "destructive" });
    } else {
      toast({ title: !current ? "রিভিউ অনুমোদিত" : "রিভিউ লুকানো হয়েছে", variant: "success" });
      fetchReviews();
    }
  };

  const deleteReview = async (id: string) => {
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) {
      toast({ title: "ডিলিট ব্যর্থ", variant: "destructive" });
    } else {
      toast({ title: "রিভিউ ডিলিট হয়েছে", variant: "success" });
      fetchReviews();
    }
  };

  if (loading) return <p className="text-center text-muted-foreground py-8">লোড হচ্ছে...</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">রিভিউ ম্যানেজমেন্ট</h2>
        <span className="text-sm text-muted-foreground">{reviews.length} টি রিভিউ</span>
      </div>

      {reviews.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">কোনো রিভিউ নেই</p>
      ) : (
        <div className="grid gap-4">
          {reviews.map((r) => (
            <div key={r.id} className={`bg-card border rounded-xl p-5 ${r.is_approved ? "border-primary/30" : "border-border/30"}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-foreground">{r.name}</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? "text-[#FF7A18] fill-[#FF7A18]" : "text-border"}`} />
                      ))}
                    </div>
                    {r.is_approved && (
                      <span className="text-xs bg-primary/15 text-primary px-2 py-0.5 rounded-full font-medium">অনুমোদিত</span>
                    )}
                  </div>
                  <p className="text-sm text-secondary-foreground mb-2">"{r.text}"</p>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>অর্ডার: {r.order_id}</span>
                    <span>{new Date(r.created_at).toLocaleDateString("bn-BD")}</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleApproval(r.id, r.is_approved)}
                    className={r.is_approved ? "text-muted-foreground" : "text-primary border-primary/30"}
                  >
                    {r.is_approved ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteReview(r.id)}
                    className="text-destructive border-destructive/30 hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
