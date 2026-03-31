import { Clock, UserCircle } from "lucide-react";

const OperatorStatus = () => {
  const now = new Date();
  const hour = now.getHours();
  const isOnline = hour >= 9 && hour < 24;

  const bengaliDate = now.toLocaleDateString("bn-BD", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col items-center gap-1 px-3 md:px-6 py-2 md:py-3 rounded-xl glass w-full md:w-auto">
      <div className="flex items-center gap-2">
        <UserCircle className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground" />
        <span className="text-xs md:text-sm text-muted-foreground">Operator:</span>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${isOnline ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
          <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-400 animate-pulse" : "bg-red-400"}`} />
          {isOnline ? "online" : "offline"}
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-xs md:text-sm text-muted-foreground">
        <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />
        <span>Working Time: 9:00 AM - 11:59 PM (GMT+06)</span>
      </div>
      <span className="text-xs md:text-sm font-medium text-gradient-primary">{bengaliDate}</span>
    </div>
  );
};

export default OperatorStatus;
