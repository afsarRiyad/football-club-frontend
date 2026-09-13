import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

/* The `login` target carries the copy and marks the route noindex — nothing
   about an account screen belongs in the index. */
export const metadata: Metadata = buildMetadata({ target: "login", path: "/login" });

export default function LoginSeoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
