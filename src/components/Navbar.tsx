import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import OperatorStatus from "@/components/OperatorStatus";
import HeaderNotice from "@/components/HeaderNotice";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/20">
      {/* Top bar */}
      <div className="container flex items-center justify-between py-3 md:py-4">
        <Link to="/" className="flex items-center gap-2 md:gap-3">
          <img src="/logo-icon.png" alt="Lovable Credits" className="w-8 h-8 md:w-10 md:h-10" />
          <span className="font-display font-bold text-lg md:text-2xl text-foreground">Lovable Credits</span>
        </Link>
        <div className="hidden md:flex flex-1 justify-center">
          <OperatorStatus />
        </div>
        <div className="hidden md:block">
          <Button variant="outline" size="sm" asChild>
            <Link to="/track">📦 Track Order</Link>
          </Button>
        </div>
      </div>

      {/* Mobile: Operator + Track Order always visible */}
      <div className="md:hidden container pb-3 space-y-3">
        <OperatorStatus />
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link to="/track">📦 Track Order</Link>
        </Button>
      </div>

      <HeaderNotice />
    </header>
  );
};

export default Navbar;
