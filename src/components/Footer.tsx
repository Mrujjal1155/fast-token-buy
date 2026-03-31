import { Link } from "react-router-dom";
import { Mail, MessageCircle, ExternalLink, Globe, Send } from "lucide-react";

const Footer = () => (
  <footer className="relative border-t border-border/10 pt-1">
    {/* Gradient top border */}
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-primary" />

    <div className="container px-4 py-12 md:py-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
        {/* Logo + description */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <img src="/logo-icon.png" alt="Lovable Credits" className="w-8 h-8" />
            <span className="font-display font-bold text-lg text-foreground">Lovable Credits</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Power up your Lovable projects with affordable credits. Fast delivery, secure payments, trusted by hundreds.
          </p>
          {/* Social icons */}
          <div className="flex gap-3 pt-2">
            {[
              { icon: Twitter, href: "#" },
              { icon: Github, href: "#" },
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

        {/* Quick Links */}
        <div>
          <h4 className="font-display font-semibold text-foreground mb-4">Quick Links</h4>
          <ul className="space-y-2.5">
            {[
              { label: "Home", to: "/" },
              { label: "Pricing", to: "/#pricing" },
              { label: "Track Order", to: "/track" },
            ].map(({ label, to }) => (
              <li key={label}>
                <Link to={to} className="text-sm text-muted-foreground hover:text-gradient-primary-inline transition-colors duration-300 hover:text-foreground">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="font-display font-semibold text-foreground mb-4">Support</h4>
          <ul className="space-y-2.5">
            {["FAQ", "Terms of Service", "Privacy Policy", "Refund Policy"].map((item) => (
              <li key={item}>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-display font-semibold text-foreground mb-4">Contact</h4>
          <ul className="space-y-2.5">
            <li className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="w-4 h-4 text-[#FF7A18]" />
              support@lovablecredits.com
            </li>
            <li className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageCircle className="w-4 h-4 text-[#FF3CAC]" />
              Live Chat Available
            </li>
            <li className="flex items-center gap-2 text-sm text-muted-foreground">
              <ExternalLink className="w-4 h-4 text-[#7B61FF]" />
              <a href="#" className="hover:text-foreground transition-colors">lovablecredits.com</a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mt-10 pt-6 border-t border-border/20 flex flex-col md:flex-row items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">© 2026 Lovable Credits. All rights reserved.</p>
        <p className="text-xs text-muted-foreground">Made with ❤️ for Lovable developers</p>
      </div>
    </div>
  </footer>
);

export default Footer;
