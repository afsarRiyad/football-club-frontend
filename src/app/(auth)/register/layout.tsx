import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Create Account",
  description:
    "Create a free Nayadiganta Sporting Club account to follow the club, receive live score notifications and access exclusive member content.",
  path: "/register",
  noindex: true,
});

export default function RegisterSeoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
