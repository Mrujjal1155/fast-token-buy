import { useState, useEffect, useRef } from "react";
import { Bell, X } from "lucide-react";
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
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#FF3CAC] text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
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
            className="absolute right-0 top-12 w-80 max-h-96 overflow-y-auto rounded-2xl glass-strong border border-border/30 shadow-card z-50"
          >
            <div className="flex items-center justify-between p-4 border-b border-border/20">
              <h3 className="font-semibold text-foreground text-sm">নোটিফিকেশন</h3>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            {notifications.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground text-sm">
                কোনো নোটিফিকেশন নেই
              </div>
            ) : (
              <div className="divide-y divide-border/10">
                {notifications.map((n) => (
                  <div key={n.id} className="p-4 hover:bg-secondary/30 transition-colors">
                    <p className="text-sm font-semibold text-foreground mb-1">{n.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1.5">{timeAgo(n.created_at)}</p>
                  </div>
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
