import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SiteImages {
  logo: string | null;
  favicon: string | null;
  ogImage: string | null;
}

const IMAGE_KEY_MAP: Record<string, keyof SiteImages> = {
  site_logo: "logo",
  site_favicon: "favicon",
  site_og_image: "ogImage",
};

export const useSiteImages = () => {
  const [images, setImages] = useState<SiteImages>({ logo: null, favicon: null, ogImage: null });

  useEffect(() => {
    const fetchImages = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["site_logo", "site_favicon", "site_og_image"]);

      if (data) {
        const result: SiteImages = { logo: null, favicon: null, ogImage: null };
        data.forEach((row) => {
          const field = IMAGE_KEY_MAP[row.key];
          if (field && row.value) result[field] = row.value;
        });
        setImages(result);
      }
    };

    fetchImages();

    const channel = supabase
      .channel(`site-images-${crypto.randomUUID()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "site_settings" }, () => {
        fetchImages();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return images;
};
