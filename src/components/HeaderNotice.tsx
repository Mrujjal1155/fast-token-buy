import { useState } from "react";
import { X, Sparkles, Gift } from "lucide-react";

const HeaderNotice = () => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="relative overflow-hidden border-t border-white/5">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#FF7A18]/90 via-[#FF3CAC]/90 via-[#7B61FF]/90 to-[#4D8DFF]/90 animate-gradient bg-[length:300%_100%]" />
      {/* Shimmer overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.15)_50%,transparent_75%)] bg-[length:250%_100%] animate-gradient" />

      <div className="relative flex items-center py-2.5 px-4">
        {/* Left icon */}
        <div className="hidden sm:flex items-center justify-center w-7 h-7 rounded-full bg-white/15 shrink-0 mr-3">
          <Gift className="w-3.5 h-3.5 text-white" />
        </div>

        {/* Scrolling text */}
        <div className="flex-1 overflow-hidden mask-fade">
          <div className="animate-marquee whitespace-nowrap font-semibold text-sm text-white flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>সীমিত সময়ের অফার — সকল প্যাকেজে বিশেষ ছাড় চলছে!</span>
            <span className="mx-3 w-1 h-1 rounded-full bg-white/50" />
            <span>এখনই অর্ডার করুন এবং সাশ্রয় করুন</span>
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="mx-6" />
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>সীমিত সময়ের অফার — সকল প্যাকেজে বিশেষ ছাড় চলছে!</span>
            <span className="mx-3 w-1 h-1 rounded-full bg-white/50" />
            <span>এখনই অর্ডার করুন এবং সাশ্রয় করুন</span>
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={() => setVisible(false)}
          className="ml-3 w-6 h-6 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white/80 hover:text-white transition-all duration-200 shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default HeaderNotice;
