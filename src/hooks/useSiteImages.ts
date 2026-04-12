import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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

const fetchSiteImages = async (): Promise<SiteImages> => {
  const { data } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", ["site_logo", "site_favicon", "site_og_image"]);

  const result: SiteImages = { logo: null, favicon: null, ogImage: null };
  if (data) {
    data.forEach((row) => {
      const field = IMAGE_KEY_MAP[row.key];
      if (field && row.value) result[field] = row.value;
    });
  }
  return result;
};

export const useSiteImages = () => {
  const queryClient = useQueryClient();

  const { data: images = { logo: null, favicon: null, ogImage: null } } = useQuery({
    queryKey: ["site-images"],
    queryFn: fetchSiteImages,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 15,
  });

  useEffect(() => {
    const channel = supabase
      .channel("site-images-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "site_settings" }, () => {
        queryClient.invalidateQueries({ queryKey: ["site-images"] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  return images;
};
