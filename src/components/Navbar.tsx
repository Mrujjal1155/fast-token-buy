import { Link } from "react-router-dom";
import OperatorStatus from "@/components/OperatorStatus";
import HeaderNotice from "@/components/HeaderNotice";

const Navbar = () => (
  <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/20">
    <div className="container flex items-center justify-between py-4">
      <Link to="/" className="flex items-center gap-3">
        <img src="/logo-icon.png" alt="Lovable Credits" className="w-10 h-10" />
        <span className="font-display font-bold text-2xl text-foreground">Lovable Credits</span>
      </Link>
      <div className="hidden md:flex flex-1 justify-center">
        <OperatorStatus />
      </div>
      {/* Empty div to balance flex layout */}
      <div className="hidden md:block w-[200px]" />
    </div>
    <HeaderNotice />
  </header>
);

export default Navbar;
