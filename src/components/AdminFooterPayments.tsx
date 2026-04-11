import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Save, Plus, Trash2, Upload, X, GripVertical, Info,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface PaymentMethod {
  id: string;
  name: string;
  icon_url: string;
  sort_order: number;
  is_visible: boolean;
  brand_color: string;
}

const IMAGE_GUIDE = {
  size: "64×64px বা 128×128px (স্কোয়ার)",
  format: "PNG (transparent background সেরা), SVG, JPG, WebP",
  maxFile: "সর্বোচ্চ 500KB",
  tip: "সাদা বা স্বচ্ছ ব্যাকগ্রাউন্ডের লোগো ব্যবহার করুন",
};

interface SortableItemProps {
  method: PaymentMethod;
  uploading: string | null;
  fileRefs: React.MutableRefObject<Record<string, HTMLInputElement | null>>;
  onUpdate: (id: string, field: keyof PaymentMethod, value: any) => void;
  onUpload: (id: string, file: File) => void;
  onDelete: (id: string) => void;
}

const SortablePaymentItem = ({ method: m, uploading, fileRefs, onUpdate, onUpload, onDelete }: SortableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: m.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : "auto" as const,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-card border rounded-xl p-4 transition-all ${
        m.is_visible ? "border-border/30" : "border-border/10 opacity-60"
      } ${isDragging ? "shadow-lg ring-2 ring-primary/30" : ""}`}
    >
      <div className="flex items-center gap-3 mb-3">
        <button
          {...attributes}
          {...listeners}
          className="touch-none cursor-grab active:cursor-grabbing p-1 rounded hover:bg-secondary transition"
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </button>

        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border border-border/30"
          style={{ backgroundColor: m.brand_color + "15" }}
        >
          {m.icon_url ? (
            <img src={m.icon_url} alt={m.name} className="w-7 h-7 object-contain" />
          ) : (
            <span className="text-xs font-bold" style={{ color: m.brand_color }}>{m.name.charAt(0)}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <Input
            value={m.name}
            onChange={(e) => onUpdate(m.id, "name", e.target.value)}
            className="h-8 text-sm bg-secondary border-border/50"
            placeholder="মেথডের নাম"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="color"
            value={m.brand_color}
            onChange={(e) => onUpdate(m.id, "brand_color", e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border-0 p-0"
            title="ব্র্যান্ড কালার"
          />
          <Switch
            checked={m.is_visible}
            onCheckedChange={(v) => onUpdate(m.id, "is_visible", v)}
          />
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            onClick={() => onDelete(m.id)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-[52px]">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={(el) => { fileRefs.current[m.id] = el; }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(m.id, file);
          }}
        />
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          onClick={() => fileRefs.current[m.id]?.click()}
          disabled={uploading === m.id}
        >
          {uploading === m.id ? "আপলোড হচ্ছে..." : (
            <><Upload className="w-3 h-3 mr-1" /> আপলোড</>
          )}
        </Button>

        <span className="text-muted-foreground text-xs">অথবা</span>

        <Input
          value={m.icon_url}
          onChange={(e) => onUpdate(m.id, "icon_url", e.target.value)}
          className="h-8 text-xs bg-secondary border-border/50 flex-1"
          placeholder="ইমেজ URL পেস্ট করুন (https://...)"
        />

        {m.icon_url && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onUpdate(m.id, "icon_url", "")}
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
};

const AdminFooterPayments = () => {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => { fetchMethods(); }, []);

  const fetchMethods = async () => {
    const { data } = await supabase
      .from("payment_methods")
      .select("*")
      .order("sort_order", { ascending: true });
    if (data) setMethods(data);
    setLoading(false);
  };

  const update = (id: string, field: keyof PaymentMethod, value: any) => {
    setMethods((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setMethods((prev) => {
      const oldIndex = prev.findIndex((m) => m.id === active.id);
      const newIndex = prev.findIndex((m) => m.id === over.id);
      const reordered = arrayMove(prev, oldIndex, newIndex);
      return reordered.map((m, i) => ({ ...m, sort_order: i + 1 }));
    });
  };

  const handleUpload = async (id: string, file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "শুধু ইমেজ ফাইল আপলোড করুন", variant: "destructive" });
      return;
    }
    if (file.size > 500 * 1024) {
      toast({ title: "ফাইল সাইজ ৫০০KB এর কম হতে হবে", variant: "destructive" });
      return;
    }

    setUploading(id);
    const ext = file.name.split(".").pop() || "png";
    const filePath = `footer-${id}.${ext}`;

    await supabase.storage.from("payment-icons").remove([filePath]);
    const { error } = await supabase.storage
      .from("payment-icons")
      .upload(filePath, file, { upsert: true });

    if (error) {
      toast({ title: "আপলোড ব্যর্থ", description: error.message, variant: "destructive" });
      setUploading(null);
      return;
    }

    const { data: urlData } = supabase.storage.from("payment-icons").getPublicUrl(filePath);
    update(id, "icon_url", `${urlData.publicUrl}?t=${Date.now()}`);
    toast({ title: "আইকন আপলোড হয়েছে" });
    setUploading(null);
  };

  const addMethod = async () => {
    const maxOrder = methods.length > 0 ? Math.max(...methods.map((m) => m.sort_order)) : 0;
    const { data, error } = await supabase
      .from("payment_methods")
      .insert({ name: "New Method", sort_order: maxOrder + 1, brand_color: "#FFFFFF" })
      .select()
      .single();
    if (data) setMethods((prev) => [...prev, data]);
    if (error) toast({ title: "যোগ করা যায়নি", variant: "destructive" });
  };

  const deleteMethod = async (id: string) => {
    await supabase.from("payment_methods").delete().eq("id", id);
    setMethods((prev) => prev.filter((m) => m.id !== id));
    toast({ title: "ডিলিট হয়েছে" });
  };

  const handleSave = async () => {
    setSaving(true);
    const promises = methods.map((m) =>
      supabase.from("payment_methods").update({
        name: m.name,
        icon_url: m.icon_url,
        sort_order: m.sort_order,
        is_visible: m.is_visible,
        brand_color: m.brand_color,
      }).eq("id", m.id)
    );
    await Promise.all(promises);
    toast({ title: "সেভ হয়েছে!" });
    setSaving(false);
  };

  if (loading) return <p className="text-center text-muted-foreground py-8">লোড হচ্ছে...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">ফুটার পেমেন্ট মেথড</h2>
          <p className="text-sm text-muted-foreground">ড্র্যাগ করে ক্রম পরিবর্তন করুন • সেভ করতে ভুলবেন না</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={addMethod}>
            <Plus className="w-3.5 h-3.5 mr-1" /> নতুন যোগ
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            <Save className="w-3.5 h-3.5 mr-1" /> {saving ? "সেভ হচ্ছে..." : "সেভ করুন"}
          </Button>
        </div>
      </div>

      {/* Image Guide */}
      <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
          <div className="text-sm space-y-1">
            <p className="font-semibold text-blue-400">আইকন আপলোড গাইড</p>
            <ul className="text-muted-foreground space-y-0.5 text-xs">
              <li>📐 সাইজ: <span className="text-foreground">{IMAGE_GUIDE.size}</span></li>
              <li>📁 ফরম্যাট: <span className="text-foreground">{IMAGE_GUIDE.format}</span></li>
              <li>📦 ফাইল সাইজ: <span className="text-foreground">{IMAGE_GUIDE.maxFile}</span></li>
              <li>💡 টিপস: <span className="text-foreground">{IMAGE_GUIDE.tip}</span></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Sortable Methods List */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={methods.map((m) => m.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {methods.map((m) => (
              <SortablePaymentItem
                key={m.id}
                method={m}
                uploading={uploading}
                fileRefs={fileRefs}
                onUpdate={update}
                onUpload={handleUpload}
                onDelete={deleteMethod}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default AdminFooterPayments;
