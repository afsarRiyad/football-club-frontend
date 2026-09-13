import type { News } from "@/types";
import { serverFetch } from "@/lib/seo";
import NewsClient, { type NewsInitialData } from "@/components/pages/NewsClient";

/* Page 1 of the unfiltered article list is fetched here so headlines and links
   are present in the initial HTML. Category filtering and pagination stay
   client-side. Mirrors the params the client uses: page=1, limit=9. */

export const revalidate = 60; /* Content window — see CONTENT_REVALIDATE in lib/seo.ts */

type ListResponse<T> = { data?: T[]; totalPages?: number };

export default async function Page() {
  /* Two requests on purpose. The hero slot is the editor's Featured article,
     which may be older than page 1, so it cannot be found by widening the list —
     it has to be asked for explicitly. (The API also filters it to published
     articles for an anonymous request, so a featured draft never leaks out.) */
  const [res, featuredRes] = await Promise.all([
    serverFetch<ListResponse<News>>("/news?page=1&limit=9&sort=-createdAt"),
    serverFetch<ListResponse<News>>("/news?isFeatured=true&limit=1"),
  ]);

  const initialData: NewsInitialData = {
    articles: res?.data ?? [],
    totalPages: res?.totalPages ?? 1,
    featured: featuredRes?.data?.[0] ?? null,
  };

  return <NewsClient initialData={initialData} />;
}
