import type { Club } from "@/types";
import { serverFetch } from "@/lib/seo";
import AboutClient from "@/components/pages/AboutClient";

/* Club details are fetched here so the club name, description and facts are
   present in the initial HTML for crawlers. Refreshed hourly. */

export const revalidate = 3600;

type ListResponse<T> = { data?: T[] };

export default async function Page() {
  /* serverFetch never throws — an unreachable API returns null and the client
     component falls back to fetching in the browser. */
  const clubs = await serverFetch<ListResponse<Club>>("/clubs?limit=1");

  return <AboutClient club={clubs?.data?.[0] ?? null} />;
}
