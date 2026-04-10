import { Helmet } from "react-helmet-async";
import { useSiteImages } from "@/hooks/useSiteImages";
import { useLanguage } from "@/contexts/LanguageContext";

interface SEOHeadProps {
  title?: string;
  description?: string;
  path?: string;
  keywords?: string;
  type?: string;
  noindex?: boolean;
}

const BASE_URL = "https://lovablecredit.com";
const DEFAULT_OG_IMAGE = "https://lovablecredit.com/og-image.jpg";
const SITE_NAME = "LovableCredit.com";

const SEOHead = ({
  title,
  description,
  path = "/",
  keywords,
  type = "website",
  noindex = false,
}: SEOHeadProps) => {
  const { t, lang } = useLanguage();
  const finalTitle = title || t("seo.title");
  const finalDescription = description || t("seo.description");
  const finalKeywords = keywords || t("seo.keywords");
  const fullTitle = finalTitle.includes("LovableCredit") ? finalTitle : `${finalTitle} | ${SITE_NAME}`;
  const url = `${BASE_URL}${path}`;
  const { ogImage } = useSiteImages();
  const ogImageUrl = ogImage || DEFAULT_OG_IMAGE;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content={lang === "bn" ? "bn_BD" : "en_US"} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={ogImageUrl} />

      <link rel="alternate" hrefLang="bn" href={url} />
      <link rel="alternate" hrefLang="en" href={url} />
      <link rel="alternate" hrefLang="x-default" href={url} />
    </Helmet>
  );
};

export default SEOHead;
