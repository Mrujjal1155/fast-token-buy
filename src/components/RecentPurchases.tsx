import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart } from "lucide-react";

const names = ["Rahim", "Karim", "Fatima", "Arif", "Nusrat", "Tanvir", "Mita", "Sakib"];
const pkgs = ["50 Credits", "105 Credits", "300 Credits"];

const RecentPurchases = () => {
  const [show, setShow] = useState(false);
  const [purchase, setPurchase] = useState({ name: "", pkg: "", time: "" });

  useEffect(() => {
    const interval = setInterval(() => {
      setPurchase({
        name: names[Math.floor(Math.random() * names.length)],
        pkg: pkgs[Math.floor(Math.random() * pkgs.length)],
        time: `${Math.floor(Math.random() * 5) + 1} min ago`,
      });
      setShow(true);
      setTimeout(() => setShow(false), 4000);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          className="fixed bottom-6 left-6 z-50 bg-card border border-border/50 rounded-xl px-4 py-3 shadow-card max-w-xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {purchase.name} bought {purchase.pkg}
              </p>
              <p className="text-xs text-muted-foreground">{purchase.time}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RecentPurchases;
