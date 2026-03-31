import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import OperatorStatus from "@/components/OperatorStatus";
import HeaderNotice from "@/components/HeaderNotice";

const Navbar = () => (
  <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl">
    {/* Top bar: Logo + Operator Status */}
    <div className="container flex items-center justify-between py-4">
      <Link to="/" className="flex items-center gap-3">
        <img src="/logo-icon.png" alt="Lovable Credits" className="w-10 h-10" />
        <span className="font-display font-bold text-2xl text-foreground">Lovable Credits</span>
      </Link>
      <div className="hidden md:block">
        <OperatorStatus />
      </div>
    </div>

    {/* Nav links bar */}
    <div className="border-y border-border/20 bg-primary/10">
      <div className="container flex items-center justify-center gap-8 py-2.5">
        <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition flex items-center gap-1.5">
          💰 Pricing
        </a>
        <Link to="/track" className="text-sm font-medium text-muted-foreground hover:text-foreground transition flex items-center gap-1.5">
          📦 Track Order
        </Link>
        <Button variant="hero" size="sm" asChild>
          <a href="#pricing">Buy Credits</a>
        </Button>
      </div>
    </div>

    {/* Scrolling notice */}
    <HeaderNotice />
  </header>
);

export default Navbar;
