import type { News } from "@/types";
import { serverFetch } from "@/lib/seo";
import NewsClient, { type NewsInitialData } from "@/components/pages/NewsClient";

/* Page 1 of the unfiltered article list is fetched here so headlines and links
   are present in the initial HTML. Category filtering and pagination stay
   client-side. Mirrors the params the client uses: page=1, limit=9. */

export const revalidate = 3600;

type ListResponse<T> = { data?: T[]; totalPages?: number };

export default async function Page() {
  const res = await serverFetch<ListResponse<News>>(
    "/news?page=1&limit=9&sort=-createdAt",
  );

  const initialData: NewsInitialData = {
    articles: res?.data ?? [],
    totalPages: res?.totalPages ?? 1,
  };

  return <NewsClient initialData={initialData} />;
}
