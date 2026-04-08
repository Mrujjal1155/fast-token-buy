import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteContent } from "@/hooks/useSiteContent";

const WhatsAppButton = () => {
  const { t } = useLanguage();
  const { content } = useSiteContent();
  const number = content.footer.whatsappNumber || "8801889067101";

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <span className="absolute inset-0 rounded-full bg-[#25D366]/40 animate-ping" />
      <span className="absolute inset-0 rounded-full bg-[#25D366]/20 animate-pulse" />
      <a
        href={`https://wa.me/${number}`}
        target="_blank"
        rel="noopener noreferrer"
        className="relative flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe57] text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group"
        aria-label="WhatsApp Support"
        title={t("whatsapp.chat")}
      >
        <img src="https://th.bing.com/th/id/R.1028371bf3f572030d2a502a63b90f07?rik=djVPoQDJX%2be4PA&pid=ImgRaw&r=0" alt="WhatsApp" className="w-6 h-6 rounded-full" />
        <span className="hidden sm:inline text-sm font-medium">WhatsApp Support</span>
      </a>
    </div>
  );
};

export default WhatsAppButton;
