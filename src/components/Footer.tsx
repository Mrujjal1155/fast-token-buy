import { Link } from "react-router-dom";
import { Mail, MessageCircle, ExternalLink, Globe, Send, ShieldCheck } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useSiteImages } from "@/hooks/useSiteImages";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);
const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>
);
const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);

const Footer = () => {
  const { content } = useSiteContent();
  const c = content.footer;
  const { logo } = useSiteImages();
  const { t } = useLanguage();

  const { data: paymentMethods = [] } = useQuery({
    queryKey: ["footer-payment-methods"],
    queryFn: async () => {
      const { data } = await supabase
        .from("payment_methods")
        .select("*")
        .eq("is_visible", true)
        .order("sort_order", { ascending: true });
      return data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  return (
    <footer className="relative border-t border-border/10 pt-1">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-primary" />

      <div className="container px-4 py-12 md:py-16">
        <div className="text-center mb-10 md:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-muted-foreground">{c.trustText}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
          <div className="space-y-4">
            <div className="flex items-center">
              <img src={logo || "/logo.png"} alt="LovableCredit.com — Trusted Lovable Credit Seller in Bangladesh" loading="lazy" className="h-9 w-auto" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{c.description}</p>
            <div className="flex flex-wrap gap-2.5 pt-2">
              {[
                { icon: Globe, href: c.socialWebsite || "#", color: "text-blue-400", hoverBg: "hover:bg-blue-500/10" },
                { icon: Send, href: c.socialTelegram || "#", color: "text-[#26A5E4]", hoverBg: "hover:bg-[#26A5E4]/10" },
                { icon: MessageCircle, href: c.socialWhatsapp || "#", color: "text-[#25D366]", hoverBg: "hover:bg-[#25D366]/10" },
                { icon: Mail, href: c.socialEmail || "mailto:support@lovablecredits.com", color: "text-[#EA4335]", hoverBg: "hover:bg-[#EA4335]/10" },
                { icon: FacebookIcon, href: c.socialFacebook || "#", color: "text-[#1877F2]", hoverBg: "hover:bg-[#1877F2]/10" },
                { icon: YoutubeIcon, href: c.socialYoutube || "#", color: "text-[#FF0000]", hoverBg: "hover:bg-[#FF0000]/10" },
                { icon: InstagramIcon, href: c.socialInstagram || "#", color: "text-[#E4405F]", hoverBg: "hover:bg-[#E4405F]/10" },
              ].map(({ icon: Icon, href, color, hoverBg }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-9 h-9 rounded-full glass flex items-center justify-center ${color} ${hoverBg} hover:scale-110 transition-all duration-300`}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">{t("footer.quickLinks")}</h4>
            <ul className="space-y-2.5">
              {[
                { label: t("footer.home"), to: "/" },
                { label: t("footer.pricing"), to: "/#pricing" },
                { label: t("footer.orderTrack"), to: "/track" },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">{t("footer.support")}</h4>
            <ul className="space-y-2.5">
              {[
                { label: t("footer.faq"), to: "/faq" },
                { label: t("footer.terms"), to: "/terms" },
                { label: t("footer.privacy"), to: "/privacy" },
                { label: t("footer.refund"), to: "/refund" },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">{t("footer.contact")}</h4>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 text-[#FF7A18]" />
                {c.email}
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <MessageCircle className="w-4 h-4 text-[#FF3CAC]" />
                {c.chatText}
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <ExternalLink className="w-4 h-4 text-[#7B61FF]" />
                <a href="#" className="hover:text-foreground transition-colors">{c.website}</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment Methods */}
        {paymentMethods.length > 0 && (
          <div className="mt-8 pt-6 border-t border-border/20">
            <p className="text-xs text-muted-foreground text-center mb-3">Accepted Payment Methods</p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {paymentMethods.map((pm) => (
                <div
                  key={pm.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass"
                >
                  {pm.icon_url ? (
                    <img src={pm.icon_url} alt={pm.name} loading="lazy" className="h-6 w-6 object-contain" />
                  ) : (
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                      style={{ backgroundColor: pm.brand_color + "20", color: pm.brand_color }}
                    >
                      {pm.name.charAt(0)}
                    </span>
                  )}
                  <span className="text-xs font-medium" style={{ color: pm.brand_color }}>{pm.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-border/20 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">{c.copyright}</p>
          <p className="text-xs text-muted-foreground">{c.tagline}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
