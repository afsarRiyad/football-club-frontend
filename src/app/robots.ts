import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * robots.txt — allow every public page, keep search engines out of the
 * authenticated/admin areas, and point crawlers at the sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/profile",
          "/change-password",
          "/matchday-formation",
          "/login",
          "/register",
          "/forgot-password",
          "/reset-password",
          "/api/",
          "/*?*view=",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
