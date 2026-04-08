import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import SEOHead from "@/components/SEOHead";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <SEOHead
        title="৪০৪ — পেজ পাওয়া যায়নি"
        description="দুঃখিত! আপনি যে পেজটি খুঁজছেন সেটি পাওয়া যায়নি।"
        path={location.pathname}
        noindex
      />
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-foreground">৪০৪</h1>
        <p className="mb-4 text-xl text-muted-foreground">দুঃখিত! পেজটি খুঁজে পাওয়া যায়নি</p>
        <Link to="/" className="text-primary underline hover:text-primary/90">
          হোমে ফিরুন
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
