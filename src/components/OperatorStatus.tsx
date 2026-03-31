import { Clock } from "lucide-react";

const OperatorStatus = () => {
  const now = new Date();
  const hour = now.getHours();
  const isOnline = hour >= 9 && hour < 24; // 9:00 AM - 11:59 PM

  const bengaliDate = now.toLocaleDateString("bn-BD", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-lg bg-muted/50 border border-border/30 text-sm">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">Operator:</span>
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${isOnline ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
          <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-400 animate-pulse" : "bg-red-400"}`} />
          {isOnline ? "online" : "offline"}
        </span>
      </div>
      <div className="w-px h-4 bg-border/40" />
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Clock className="w-3.5 h-3.5" />
        <span>9:00 AM - 11:59 PM (GMT+06)</span>
      </div>
      <div className="w-px h-4 bg-border/40" />
      <span className="text-primary font-medium">{bengaliDate}</span>
    </div>
  );
};

export default OperatorStatus;
