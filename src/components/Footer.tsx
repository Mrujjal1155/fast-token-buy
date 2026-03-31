import { Link } from "react-router-dom";
import { Mail, MessageCircle, ExternalLink, Globe, Send, ShieldCheck } from "lucide-react";

const Footer = () => (
  <footer className="relative border-t border-border/10 pt-1">
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-primary" />

    <div className="container px-4 py-12 md:py-16">
      {/* Trust statement */}
      <div className="text-center mb-10 md:mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-sm text-muted-foreground">আপনার নিরাপত্তা ও সন্তুষ্টি আমাদের প্রথম অগ্রাধিকার</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
        {/* লোগো + বিবরণ */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <img src="/logo-icon.png" alt="Lovable Credits" className="w-8 h-8" />
            <span className="font-display font-bold text-lg text-foreground">Lovable Credits</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            বাংলাদেশের সবচেয়ে বিশ্বস্ত Lovable ক্রেডিট সেলার। দ্রুত ডেলিভারি, সেরা দাম, শত শত সন্তুষ্ট গ্রাহক।
          </p>
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

        {/* দ্রুত লিংক */}
        <div>
          <h4 className="font-display font-semibold text-foreground mb-4">দ্রুত লিংক</h4>
          <ul className="space-y-2.5">
            {[
              { label: "হোম", to: "/" },
              { label: "মূল্য তালিকা", to: "/#pricing" },
              { label: "অর্ডার ট্র্যাক", to: "/track" },
            ].map(({ label, to }) => (
              <li key={label}>
                <Link to={to} className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* সহায়তা */}
        <div>
          <h4 className="font-display font-semibold text-foreground mb-4">সহায়তা</h4>
          <ul className="space-y-2.5">
            {["সচরাচর জিজ্ঞাসা", "সেবার শর্তাবলী", "গোপনীয়তা নীতি", "ফেরত নীতি"].map((item) => (
              <li key={item}>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* যোগাযোগ */}
        <div>
          <h4 className="font-display font-semibold text-foreground mb-4">যোগাযোগ</h4>
          <ul className="space-y-2.5">
            <li className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="w-4 h-4 text-[#FF7A18]" />
              support@lovablecredits.com
            </li>
            <li className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageCircle className="w-4 h-4 text-[#FF3CAC]" />
              লাইভ চ্যাট — সবসময় চালু
            </li>
            <li className="flex items-center gap-2 text-sm text-muted-foreground">
              <ExternalLink className="w-4 h-4 text-[#7B61FF]" />
              <a href="#" className="hover:text-foreground transition-colors">lovablecredits.com</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-border/20 flex flex-col md:flex-row items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">© ২০২৬ Lovable Credits। সর্বস্বত্ব সংরক্ষিত।</p>
        <p className="text-xs text-muted-foreground">আপনার ভরসায় গড়ে উঠেছে Lovable Credits</p>
      </div>
    </div>
  </footer>
);

export default Footer;
