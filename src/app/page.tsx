import type { Academy, Club, Match, News, Player } from "@/types";
import { serverFetch } from "@/lib/seo";
import HomeClient, { type HomeData } from "@/components/pages/HomeClient";

/* ────────────────────────────────────────────────────────────────────
   Home page — server component
   ────────────────────────────────────────────────────────────────────
   Data is fetched here, on the server, so the club name, squad, fixtures
   and news are all present in the initial HTML. Search engine crawlers
   index that HTML directly rather than depending on JavaScript execution.

   Previously this page was a client component that fetched in useEffect,
   which meant crawlers only ever saw the "Loading home…" skeleton.

   Rendered statically and refreshed hourly, matching the sitemap.
   ──────────────────────────────────────────────────────────────────── */

export const revalidate = 3600;

type ListResponse<T> = { data?: T[] };

export default async function Page() {
  /* serverFetch never throws — an unreachable API degrades to null and the
     client component falls back to fetching in the browser. */
  const [clubs, news, matches, players, academies] = await Promise.all([
    serverFetch<ListResponse<Club>>("/clubs?limit=1"),
    serverFetch<ListResponse<News>>("/news?limit=5&sort=-createdAt"),
    serverFetch<ListResponse<Match>>("/matches?limit=8&sort=-matchDate"),
    serverFetch<ListResponse<Player>>("/players?limit=8"),
    serverFetch<ListResponse<Academy>>("/academy?limit=6"),
  ]);

  const initialData: HomeData = {
    club: clubs?.data?.[0] ?? null,
    news: news?.data ?? [],
    matches: matches?.data ?? [],
    players: players?.data ?? [],
    academies: academies?.data ?? [],
  };

  return <HomeClient initialData={initialData} />;
}
