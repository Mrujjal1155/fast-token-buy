import { useState } from "react";
import { X } from "lucide-react";
import OperatorStatus from "@/components/OperatorStatus";

const HeaderNotice = () => {
  const [visible, setVisible] = useState(true);

  return (
    <div className="border-b border-primary/20 bg-primary/5">
      {visible && (
        <div className="text-primary text-center text-sm py-2 px-4 relative border-b border-primary/10">
          <span className="font-medium">
            🎉 Lovable Credits এর পক্ষ থেকে সবাইকে স্বাগতম! সীমিত সময়ের জন্য সকল প্যাকেজে বিশেষ ছাড় চলছে।
          </span>
          <button
            onClick={() => setVisible(false)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/60 hover:text-primary transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      <div className="container flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <img src="/logo-icon.png" alt="Lovable Credits" className="w-7 h-7" />
          <span className="font-display font-bold text-lg text-foreground">Lovable Credits</span>
        </div>
        <OperatorStatus />
      </div>
    </div>
  );
};

export default HeaderNotice;
