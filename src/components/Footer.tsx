import { Link } from "react-router-dom";
import { Mail, MessageCircle, ExternalLink, Globe, Send, ShieldCheck } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useSiteImages } from "@/hooks/useSiteImages";

const Footer = () => {
  const { content } = useSiteContent();
  const c = content.footer;
  const { logo } = useSiteImages();

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
              <img src={logo || "/logo.png"} alt="LovableCredit.com" className="h-9 w-auto" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{c.description}</p>
            <div className="flex gap-3 pt-2">
              {[
                { icon: Globe, href: "#" },
                { icon: Send, href: "#" },
                { icon: MessageCircle, href: "#" },
                { icon: Mail, href: "#" },
              ].map(({ icon: Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-9 h-9 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-foreground hover:shadow-glow transition-all duration-300"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">দ্রুত লিংক</h4>
            <ul className="space-y-2.5">
              {[
                { label: "হোম", to: "/" },
                { label: "মূল্য তালিকা", to: "/#pricing" },
                { label: "অর্ডার ট্র্যাক", to: "/track" },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">সহায়তা</h4>
            <ul className="space-y-2.5">
              {[
                { label: "সচরাচর জিজ্ঞাসা", to: "/faq" },
                { label: "সেবার শর্তাবলী", to: "/terms" },
                { label: "গোপনীয়তা নীতি", to: "/privacy" },
                { label: "ফেরত নীতি", to: "/refund" },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">যোগাযোগ</h4>
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

        <div className="mt-10 pt-6 border-t border-border/20 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">{c.copyright}</p>
          <p className="text-xs text-muted-foreground">{c.tagline}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
