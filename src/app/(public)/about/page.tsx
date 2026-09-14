import type { Club } from "@/types";
import { serverFetch } from "@/lib/seo";
import AboutClient from "@/components/pages/AboutClient";

export const revalidate = 60; /* Content window — see CONTENT_REVALIDATE in lib/seo.ts */

type ListResponse<T> = { data?: T[] };

export default async function Page() {
  const clubs = await serverFetch<ListResponse<Club>>("/clubs?limit=1");

  return <AboutClient club={clubs?.data?.[0] ?? null} />;
}
