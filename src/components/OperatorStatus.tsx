import { useEffect, useState } from "react";
import { Clock, UserCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { useSiteContent } from "@/hooks/useSiteContent";

const OperatorStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const { content } = useSiteContent();
  const c = content.operator;

  const bengaliDate = new Date().toLocaleDateString("bn-BD", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    const fetchStatus = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "operator_status")
        .maybeSingle();
      if (data) setIsOnline(data.value === "online");
    };

    fetchStatus();

    const channel = supabase
      .channel(`operator-status-${crypto.randomUUID()}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "site_settings",
          filter: "key=eq.operator_status",
        },
        (payload) => {
          const row = payload.new as { key: string; value: string };
          setIsOnline(row.value === "online");
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative flex flex-col items-center gap-1.5 md:flex-row md:gap-3 px-4 md:px-6 py-2.5 md:py-3 rounded-xl bg-[hsl(222_40%_10%/0.9)] backdrop-blur-xl border border-border/30 shadow-card w-full md:w-auto"
    >
          <div className="flex items-center gap-2 pr-6 md:pr-0">
            <UserCircle className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
            <span className="text-xs md:text-sm text-muted-foreground">{c.label}</span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] md:text-xs font-semibold border ${
                isOnline
                  ? "bg-green-500/10 text-green-400 border-green-500/20"
                  : "bg-red-500/10 text-red-400 border-red-500/20"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${
                  isOnline ? "bg-green-400 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                }`}
              />
              {isOnline ? "অনলাইন" : "অফলাইন"}
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[11px] md:text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            {c.workingHours}
          </span>
          <span className="text-[11px] md:text-xs font-medium text-gradient-primary">{bengaliDate}</span>
    </motion.div>
  );
};

export default OperatorStatus;
