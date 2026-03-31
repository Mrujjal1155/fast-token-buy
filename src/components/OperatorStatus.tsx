import { useEffect, useState } from "react";
import { Clock, UserCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const OperatorStatus = () => {
  const [isOnline, setIsOnline] = useState(true);

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
    <div className="flex items-center gap-2 md:gap-3 px-3 md:px-6 py-1.5 md:py-3 rounded-lg md:rounded-xl glass w-full md:w-auto flex-wrap justify-center">
      <div className="flex items-center gap-1.5">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] md:text-xs font-semibold ${isOnline ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
          <span className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${isOnline ? "bg-green-400 animate-pulse" : "bg-red-400"}`} />
          {isOnline ? "অনলাইন" : "অফলাইন"}
        </span>
      </div>
      <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="w-3.5 h-3.5" />
        সকাল ৯:০০ - রাত ১১:৫৯
      </span>
      <span className="text-[10px] md:text-xs font-medium text-gradient-primary">{bengaliDate}</span>
    </div>
  );
};

export default OperatorStatus;
