import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Forgot Password",
  description: "Reset your Nayadiganta Sporting Club account password.",
  path: "/forgot-password",
  noindex: true,
});

export default function ForgotPasswordSeoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
