import type { MetadataRoute } from "next";
import { SITE_NAME, SITE_SHORT_NAME, seoTarget } from "@/lib/seo";

/** Web app manifest — install-ability + mobile search presentation. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_SHORT_NAME,
    description: seoTarget("brand").description,
    start_url: "/",
    display: "standalone",
    background_color: "#FFFDF9",
    theme_color: "#0B0B0F",
    lang: "en",
    dir: "ltr",
    categories: ["sports", "news", "entertainment"],
    icons: [
      { src: "/logo.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/logo.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
    ],
  };
}
