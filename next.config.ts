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
};

export default nextConfig;