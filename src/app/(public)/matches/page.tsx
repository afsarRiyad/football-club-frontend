import type { Match } from "@/types";
import { serverFetch } from "@/lib/seo";
import MatchesClient, { type MatchesInitialData } from "@/components/pages/MatchesClient";

/* Page 1 of the unfiltered fixture list is fetched here so match names, dates
   and scores are present in the initial HTML. Filtering and pagination stay
   client-side. Mirrors the params the client uses: page=1, limit=12. */

export const revalidate = 3600;

type ListResponse<T> = { data?: T[]; totalPages?: number };

export default async function Page() {
  const res = await serverFetch<ListResponse<Match>>(
    "/matches?page=1&limit=12&sort=-matchDate",
  );

  const initialData: MatchesInitialData = {
    matches: res?.data ?? [],
    totalPages: res?.totalPages ?? 1,
  };

  return <MatchesClient initialData={initialData} />;
}
