import { useState } from "react";
import { X, Sparkles } from "lucide-react";

const HeaderNotice = () => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="relative overflow-hidden border-t border-white/5">
      <div className="absolute inset-0 bg-gradient-to-r from-[#FF7A18] via-[#FF3CAC] to-[#7B61FF]" />

      <div className="relative flex items-center justify-center py-2 px-10">
        <div className="overflow-hidden mask-fade">
          <div className="animate-marquee whitespace-nowrap font-semibold text-xs sm:text-sm text-white flex items-center gap-2">
            <Sparkles className="w-3 h-3 shrink-0" />
            <span>সীমিত সময়ের অফার — সকল প্যাকেজে বিশেষ ছাড় চলছে!</span>
            <span className="mx-2 w-1 h-1 rounded-full bg-white/50" />
            <span>এখনই অর্ডার করুন এবং সাশ্রয় করুন</span>
            <Sparkles className="w-3 h-3 shrink-0" />
            <span className="mx-8" />
            <Sparkles className="w-3 h-3 shrink-0" />
            <span>সীমিত সময়ের অফার — সকল প্যাকেজে বিশেষ ছাড় চলছে!</span>
            <span className="mx-2 w-1 h-1 rounded-full bg-white/50" />
            <span>এখনই অর্ডার করুন এবং সাশ্রয় করুন</span>
            <Sparkles className="w-3 h-3 shrink-0" />
          </div>
        </div>

        <button
          onClick={() => setVisible(false)}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center text-white/80 hover:text-white transition shrink-0"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default HeaderNotice;
