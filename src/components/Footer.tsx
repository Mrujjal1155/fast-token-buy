import { Zap } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border/30 py-12">
    <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <Zap className="w-5 h-5 text-primary" />
        <span className="font-display font-bold text-foreground">Lovable Credits</span>
      </div>
      <div className="flex gap-6 text-sm text-muted-foreground">
        <Link to="/track" className="hover:text-foreground transition">Track Order</Link>
        <a href="#pricing" className="hover:text-foreground transition">Pricing</a>
      </div>
      <p className="text-xs text-muted-foreground">© 2026 Lovable Credits. All rights reserved.</p>
    </div>
  </footer>
);

export default Footer;
