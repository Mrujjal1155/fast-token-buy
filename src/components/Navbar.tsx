import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import OperatorStatus from "@/components/OperatorStatus";

const Navbar = () => (
  <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/20 bg-background/80 backdrop-blur-xl">
    <div className="container flex items-center justify-between h-16">
      <Link to="/" className="flex items-center gap-2">
        <img src="/logo-icon.png" alt="Lovable Credits" className="w-7 h-7" />
        <span className="font-display font-bold text-lg text-foreground">Lovable Credits</span>
      </Link>
      <OperatorStatus />
      <div className="flex items-center gap-4">
        <Link to="/track" className="text-sm text-muted-foreground hover:text-foreground transition">
          Track Order
        </Link>
        <Button variant="hero" size="sm" asChild>
          <a href="#pricing">Buy Credits</a>
        </Button>
      </div>
    </div>
  </nav>
);

export default Navbar;
