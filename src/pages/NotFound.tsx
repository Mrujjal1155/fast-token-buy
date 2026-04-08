import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";

const NotFound = () => {
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <SEOHead
        title={t("notFound.title")}
        description={t("notFound.description")}
        path={location.pathname}
        noindex
      />
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-foreground">{t("notFound.heading")}</h1>
        <p className="mb-4 text-xl text-muted-foreground">{t("notFound.text")}</p>
        <Link to="/" className="text-primary underline hover:text-primary/90">
          {t("notFound.goHome")}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
