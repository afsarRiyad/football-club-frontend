import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({ target: "register", path: "/register" });

export default function RegisterSeoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
