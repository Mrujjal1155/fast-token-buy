import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";
import OperatorStatus from "@/components/OperatorStatus";
import NotificationBell from "@/components/NotificationBell";

const Navbar = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-strong">
      <div className="container flex items-center justify-between py-2 md:py-4">
        <Link to="/" className="flex items-center gap-2 md:gap-3">
          <img src="/logo-icon.png" alt="Lovable Credits" className="w-6 h-6 md:w-10 md:h-10" />
          <span className="font-display font-bold text-sm md:text-2xl text-foreground">Lovable Credits</span>
        </Link>
        <div className="hidden md:flex flex-1 justify-center">
          <OperatorStatus />
        </div>
        <div className="flex items-center gap-1.5 md:gap-3">
          <NotificationBell />
          <Button variant="outline" size="sm" asChild className="text-xs md:text-sm h-8 md:h-9 px-2 md:px-3">
            <Link to="/track"><Package className="w-3.5 h-3.5 md:w-4 md:h-4" /> <span className="hidden sm:inline">অর্ডার</span> ট্র্যাক</Link>
          </Button>
        </div>
      </div>

      <div className="md:hidden container pb-2 px-3">
        <OperatorStatus />
      </div>
    </header>
  );
};

export default Navbar;
