import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  target: "forgotPassword",
  path: "/forgot-password",
});

export default function ForgotPasswordSeoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
