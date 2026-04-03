import { useState, useEffect, useRef } from "react";
import { Bell, X, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
}

const NotificationBell = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState<string[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("seen_notifications");
    if (stored) setSeen(JSON.parse(stored));

    const fetch = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("id, title, message, created_at")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(10);
      if (data) setNotifications(data);
    };
    fetch();
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unseenCount = notifications.filter((n) => !seen.includes(n.id)).length;

  const handleOpen = () => {
    setOpen(!open);
    if (!open && unseenCount > 0) {
      const allIds = notifications.map((n) => n.id);
      setSeen(allIds);
      localStorage.setItem("seen_notifications", JSON.stringify(allIds));
    }
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "এইমাত্র";
    if (mins < 60) return `${mins} মিনিট আগে`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} ঘণ্টা আগে`;
    const days = Math.floor(hours / 24);
    return `${days} দিন আগে`;
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative w-9 h-9 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-foreground hover:shadow-glow transition-all duration-300"
      >
        <Bell className="w-4 h-4" />
        {unseenCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-gradient-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center animate-pulse">
            {unseenCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-12 w-80 max-h-96 overflow-y-auto rounded-2xl bg-[hsl(222_40%_8%/0.95)] backdrop-blur-xl border border-border/30 shadow-card z-50"
          >
            {/* Header with gradient accent */}
            <div className="flex items-center justify-between p-4 border-b border-border/20">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-foreground text-sm">নোটিফিকেশন</h3>
              </div>
              <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-lg hover:bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-3">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm">কোনো নোটিফিকেশন নেই</p>
              </div>
            ) : (
              <div className="divide-y divide-border/10">
                {notifications.map((n, i) => (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 hover:bg-secondary/20 transition-colors group/item"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0 group-hover/item:shadow-glow transition-shadow" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground mb-0.5 truncate">{n.title}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{n.message}</p>
                        <p className="text-[10px] text-muted-foreground/50 mt-1.5">{timeAgo(n.created_at)}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
