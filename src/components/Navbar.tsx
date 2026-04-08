import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Package, Globe } from "lucide-react";
import OperatorStatus from "@/components/OperatorStatus";
import NotificationBell from "@/components/NotificationBell";
import { useSiteImages } from "@/hooks/useSiteImages";
import { useLanguage } from "@/contexts/LanguageContext";

const Navbar = () => {
  const { logo } = useSiteImages();
  const { lang, setLang, t } = useLanguage();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-strong">
      <div className="container flex items-center justify-between py-2 md:py-4 px-3 md:px-6">
        <Link to="/" className="flex items-center gap-2 md:gap-3 min-w-0">
          <img src={logo || "/logo.png"} alt="LovableCredit.com" className="h-7 md:h-10 w-auto flex-shrink-0" />
        </Link>
        <div className="hidden md:flex flex-1 justify-center">
          <OperatorStatus />
        </div>
        <div className="flex items-center gap-1.5 md:gap-3 flex-shrink-0">
          {/* Language Switch */}
          <button
            onClick={() => setLang(lang === "en" ? "bn" : "en")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full glass text-xs md:text-sm font-medium text-muted-foreground hover:text-foreground hover:shadow-glow transition-all duration-300"
            title={lang === "en" ? "বাংলায় দেখুন" : "Switch to English"}
          >
            <Globe className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span>{lang === "en" ? "বাং" : "EN"}</span>
          </button>
          <NotificationBell />
        </div>
      </div>

      <div className="md:hidden px-3 pb-2 space-y-2">
        <OperatorStatus />
        <Button variant="outline" size="sm" asChild className="w-full text-xs h-9">
          <Link to="/track" className="flex items-center justify-center gap-1.5">
            <Package className="w-3.5 h-3.5" /> {t("nav.trackOrder")}
          </Link>
        </Button>
      </div>

      <div className="hidden md:block container">
        <Button variant="outline" size="sm" asChild className="text-sm h-9 px-3 absolute right-6 top-3">
          <Link to="/track"><Package className="w-4 h-4" /> {t("nav.orderTrack")}</Link>
        </Button>
      </div>
    </header>
  );
};

export default Navbar;
