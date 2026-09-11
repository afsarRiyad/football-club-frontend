import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Sign In",
  description:
    "Sign in to your Nayadiganta Sporting Club account to follow the club, get live score notifications and access exclusive member content.",
  path: "/login",
  noindex: true,
});

export default function LoginSeoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
