import { useState } from "react";
import { X, Sparkles } from "lucide-react";

const HeaderNotice = () => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="bg-primary/80 text-primary-foreground py-2 px-4 relative overflow-hidden">
      <div className="animate-marquee whitespace-nowrap font-medium text-sm flex items-center gap-1">
        <Sparkles className="w-3.5 h-3.5 inline-block shrink-0" /> Lovable Credits এর পক্ষ থেকে সবাইকে স্বাগতম! সীমিত সময়ের জন্য সকল প্যাকেজে বিশেষ ছাড় চলছে। এখনই অর্ডার করুন! <Sparkles className="w-3.5 h-3.5 inline-block shrink-0" />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <Sparkles className="w-3.5 h-3.5 inline-block shrink-0" /> Lovable Credits এর পক্ষ থেকে সবাইকে স্বাগতম! সীমিত সময়ের জন্য সকল প্যাকেজে বিশেষ ছাড় চলছে। এখনই অর্ডার করুন! <Sparkles className="w-3.5 h-3.5 inline-block shrink-0" />
      </div>
      <button
        onClick={() => setVisible(false)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-foreground/70 hover:text-primary-foreground transition z-10"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default HeaderNotice;
