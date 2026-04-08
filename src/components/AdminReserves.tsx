import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Eye, EyeOff, Package } from "lucide-react";
import {
  buildReserveLabelFallback,
  getReserveLabelText,
  loadReserveTextMaps,
  saveReserveTextMap,
  type LocalizedCatalogLang,
  type ReserveTextMap,
} from "@/lib/catalogLocalization";

interface Reserve {
  id: string;
  label: string;
  amount: string;
  icon: string;
  sort_order: number;
  is_visible: boolean;
}

type ReserveLabelState = Record<string, Record<LocalizedCatalogLang, string>>;

const buildReserveLabelPayload = (
  reserveLabels: ReserveLabelState,
  lang: LocalizedCatalogLang
): ReserveTextMap =>
  Object.fromEntries(
    Object.entries(reserveLabels)
      .map(([reserveId, labels]) => [reserveId, labels[lang].trim()])
      .filter(([, label]) => Boolean(label))
      .map(([reserveId, label]) => [reserveId, { label }])
  );

const AdminReserves = () => {
  const [reserves, setReserves] = useState<Reserve[]>([]);
  const [textLang, setTextLang] = useState<LocalizedCatalogLang>("en");
  const [reserveLabels, setReserveLabels] = useState<ReserveLabelState>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchReserves = async () => {
    const [{ data }, textMaps] = await Promise.all([
      supabase.from("reserves").select("*").order("sort_order"),
      loadReserveTextMaps(),
    ]);

    if (data) {
      const reserveRows = data as Reserve[];
      setReserves(reserveRows);
      setReserveLabels(
        reserveRows.reduce<ReserveLabelState>((acc, reserve) => {
          acc[reserve.id] = {
            en: getReserveLabelText(
              textMaps.en,
              reserve.id,
              buildReserveLabelFallback({ value: reserve.label, lang: "en" })
            ),
            bn: getReserveLabelText(
              textMaps.bn,
              reserve.id,
              buildReserveLabelFallback({ value: reserve.label, lang: "bn" })
            ),
          };
          return acc;
        }, {})
      );
    }

    setLoading(false);
  };

  useEffect(() => { fetchReserves(); }, []);

  const handleUpdate = async (id: string, field: string, value: string | number | boolean) => {
    const updateData: Record<string, string | number | boolean> = { [field]: value, updated_at: new Date().toISOString() };
    const { error } = await supabase
      .from("reserves")
      .update(updateData as any)
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
      .insert({ label: "50 Credits", amount: "100", icon: "coins", sort_order: maxOrder + 1 })
      .select()
      .single();
    if (error) {
      toast({ title: "যোগ করা যায়নি", variant: "destructive" });
    } else if (data) {
      await fetchReserves();
      toast({ title: "নতুন প্যাকেজ স্টক যোগ হয়েছে", variant: "success" });
    }
  };

  const handleDelete = async (reserve: Reserve) => {
    const nextReserveLabels = Object.fromEntries(
      Object.entries(reserveLabels).filter(([reserveId]) => reserveId !== reserve.id)
    ) as ReserveLabelState;

    try {
      const [{ error }] = await Promise.all([
        supabase.from("reserves").delete().eq("id", reserve.id),
        Promise.all([
          saveReserveTextMap("en", buildReserveLabelPayload(nextReserveLabels, "en")),
          saveReserveTextMap("bn", buildReserveLabelPayload(nextReserveLabels, "bn")),
        ]),
      ]);

      if (error) throw error;

      setReserveLabels(nextReserveLabels);
      setReserves((prev) => prev.filter((item) => item.id !== reserve.id));
      toast({ title: "মুছে ফেলা হয়েছে", variant: "success" });
    } catch {
      toast({ title: "মুছতে পারা যায়নি", variant: "destructive" });
    }
  };

  const updateReserveLabel = (id: string, lang: LocalizedCatalogLang, value: string) => {
    setReserveLabels((prev) => ({
      ...prev,
      [id]: {
        en: prev[id]?.en ?? "",
        bn: prev[id]?.bn ?? "",
        [lang]: value,
      },
    }));
  };

  const saveReserveLabels = async () => {
    try {
      await saveReserveTextMap(textLang, buildReserveLabelPayload(reserveLabels, textLang));
    } catch {
      toast({ title: "টেক্সট সেভ ব্যর্থ", variant: "destructive" });
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
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-lg border border-border/30 bg-secondary p-1">
            <button
              type="button"
              onClick={() => setTextLang("en")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                textLang === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setTextLang("bn")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                textLang === "bn" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              বাংলা
            </button>
          </div>
          <Button variant="outline" size="sm" onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-1" /> নতুন প্যাকেজ
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {reserves.map((r) => (
          <div key={r.id} className="bg-card border border-border/30 rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <Package className="w-5 h-5 text-primary shrink-0 hidden sm:block" />

            <div className="flex-1 w-full sm:w-auto">
              <label className="text-xs text-muted-foreground mb-1 block sm:hidden">
                প্যাকেজ নাম ({textLang === "en" ? "EN" : "বাংলা"})
              </label>
              <Input
                value={reserveLabels[r.id]?.[textLang] ?? ""}
                placeholder={textLang === "en" ? "e.g. 105 Credits" : "যেমন: ১০৫ ক্রেডিট"}
                className="h-9 bg-secondary border-border/30 text-sm"
                onChange={(e) => updateReserveLabel(r.id, textLang, e.target.value)}
                onBlur={saveReserveLabels}
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
                onClick={() => handleDelete(r)}
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
