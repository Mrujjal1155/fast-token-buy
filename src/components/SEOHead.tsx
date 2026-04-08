import { Helmet } from "react-helmet-async";
import { useSiteImages } from "@/hooks/useSiteImages";

interface SEOHeadProps {
  title?: string;
  description?: string;
  path?: string;
  keywords?: string;
  type?: string;
  noindex?: boolean;
}

const BASE_URL = "https://lovablecredit.com";
const DEFAULT_OG_IMAGE = "https://lovablecredit.com/og-image.png";
const SITE_NAME = "LovableCredit.com";

const SEOHead = ({
  title = "Lovable Credits কিনুন — বাংলাদেশে সবচেয়ে সস্তায়",
  description = "bKash, Nagad, Rocket ও Crypto দিয়ে Lovable AI ক্রেডিট কিনুন। ৫-৩০ মিনিটে ডেলিভারি। ২৪% পর্যন্ত সাশ্রয়!",
  path = "/",
  keywords = "lovable credits, buy lovable credits, lovable credit bangladesh, lovable ক্রেডিট",
  type = "website",
  noindex = false,
}: SEOHeadProps) => {
  const fullTitle = title.includes("LovableCredit") ? title : `${title} | ${SITE_NAME}`;
  const url = `${BASE_URL}${path}`;
  const { ogImage } = useSiteImages();
  const ogImageUrl = ogImage || DEFAULT_OG_IMAGE;

  return (
    <Helmet>
      {/* Primary */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="bn_BD" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImageUrl} />

      {/* Alternate language */}
      <link rel="alternate" hrefLang="bn" href={url} />
      <link rel="alternate" hrefLang="x-default" href={url} />
    </Helmet>
  );
};

export default SEOHead;
