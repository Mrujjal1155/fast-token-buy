import { useState } from "react";
import { X } from "lucide-react";

const HeaderNotice = () => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="bg-primary/10 border-b border-primary/20 text-primary text-center text-sm py-2 px-4 relative">
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
  );
};

export default HeaderNotice;
