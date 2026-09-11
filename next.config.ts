import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Production API / uploads host
      { protocol: "https", hostname: "football-club-997m.onrender.com" },
      // Local dev backend
      { protocol: "http", hostname: "localhost", port: "5000" },
      // Unsplash fallback photos (InfinitePhotoMarquee)
      { protocol: "https", hostname: "images.unsplash.com" },
      // Cloudinary image delivery (any cloud name — it lives in the path)
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },

  async redirects() {
    return [
      // Consolidate SEO on the canonical domain: the old *.vercel.app host
      // permanently redirects, so the two never compete as duplicate sites.
      // Only this specific production alias matches — preview deployments
      // (project-git-branch.vercel.app) are unaffected.
      {
        source: "/:path*",
        has: [{ type: "host", value: "nayadigantaclub.vercel.app" }],
        destination: "https://www.nayadiganta.club/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
