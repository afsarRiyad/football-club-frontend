import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Reset Password",
  description: "Choose a new password for your Nayadiganta Sporting Club account.",
  path: "/reset-password",
  noindex: true,
});

export default function ResetPasswordSeoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
