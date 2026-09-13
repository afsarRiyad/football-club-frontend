import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  target: "resetPassword",
  path: "/reset-password",
});

export default function ResetPasswordSeoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
