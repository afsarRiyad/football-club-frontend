import type { Club, Match } from "@/types";
import { serverFetch } from "@/lib/seo";
import { collectTournamentFixtures, type TournamentLike } from "@/lib/tournament-fixtures";
import MatchesClient, { type MatchesInitialData } from "@/components/pages/MatchesClient";

/* Page 1 of the unfiltered fixture list is fetched here so match names, dates
   and scores are present in the initial HTML. Filtering and pagination stay
   client-side. Mirrors the params the client uses: page=1, limit=12. */

export const revalidate = 60; /* Content window — see CONTENT_REVALIDATE in lib/seo.ts */

type ListResponse<T> = { data?: T[]; totalPages?: number };

export default async function Page() {
  const [res, clubs, tournaments] = await Promise.all([
    serverFetch<ListResponse<Match>>("/matches?page=1&limit=12&sort=-matchDate"),
    serverFetch<ListResponse<Club>>("/clubs?limit=1"),
    /* Tournament matches live inside their tournament document, so they are not
       part of the fixture list above. They are shown separately and link to the
       competition, where the bracket is. */
    serverFetch<ListResponse<TournamentLike>>("/tournaments?limit=50"),
  ]);

  const initialData: MatchesInitialData = {
    matches: res?.data ?? [],
    totalPages: res?.totalPages ?? 1,
    tournamentFixtures: collectTournamentFixtures(tournaments?.data, {
      clubId: clubs?.data?.[0]?._id,
    }),
  };

  return <MatchesClient initialData={initialData} />;
}
