import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title?: string;
  description?: string;
  path?: string;
  keywords?: string;
}

const BASE_URL = "https://fast-token-buy.lovable.app";

const SEOHead = ({
  title = "Lovable Credits কিনুন — বাংলাদেশে সবচেয়ে সস্তায়",
  description = "bKash, Nagad, Rocket ও Crypto দিয়ে Lovable AI ক্রেডিট কিনুন। ৫-৩০ মিনিটে ডেলিভারি। ২৪% পর্যন্ত সাশ্রয়!",
  path = "/",
  keywords = "lovable credits, buy lovable credits, lovable credit bangladesh, lovable ক্রেডিট",
}: SEOHeadProps) => {
  const fullTitle = title.includes("LovableCredit") ? title : `${title} | LovableCredit.com`;
  const url = `${BASE_URL}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
};

export default SEOHead;
