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
      .channel("operator-status-live")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "site_settings" },
        (payload) => {
          const row = payload.new as { key: string; value: string };
          if (row.key === "operator_status") setIsOnline(row.value === "online");
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="flex flex-col items-center gap-1 px-3 md:px-6 py-2 md:py-3 rounded-xl glass w-full md:w-auto">
      <div className="flex items-center gap-2">
        <UserCircle className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground" />
        <span className="text-xs md:text-sm text-muted-foreground">অপারেটর:</span>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${isOnline ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
          <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-400 animate-pulse" : "bg-red-400"}`} />
          {isOnline ? "অনলাইন" : "অফলাইন"}
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-xs md:text-sm text-muted-foreground">
        <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />
        <span>কর্মসময়: সকাল ৯:০০ - রাত ১১:৫৯ (GMT+06)</span>
      </div>
      <span className="text-xs md:text-sm font-medium text-gradient-primary">{bengaliDate}</span>
    </div>
  );
};

export default OperatorStatus;
