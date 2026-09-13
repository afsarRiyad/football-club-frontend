import type { Metadata } from "next";
import type { Academy, Club, Gallery, Match, News, Player } from "@/types";
import { buildMetadata, serverFetch } from "@/lib/seo";
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

   Hero target: one page, multiple phrasings. The title carries brand +
   town + crossroads so it answers "nayadiganta club", "nayadiganta club
   kabirhat noakhali" and "nayadiganta club bhuiyarhat chowrasta" at
   once, without contradicting itself. */

export const revalidate = 3600;

/* Title, description and keywords come from the `home` target; the title is
   marked absolute there so this page's long, keyword-carrying title does not
   collect a second "| Nayadiganta Sporting Club". */
export const metadata: Metadata = buildMetadata({ target: "home", path: "/" });

type ListResponse<T> = { data?: T[] };

export default async function Page() {
  /* serverFetch never throws — an unreachable API degrades to null and the
     client component falls back to fetching in the browser. */
  const [clubs, news, matches, players, academies, galleries] = await Promise.all([
    serverFetch<ListResponse<Club>>("/clubs?limit=1"),
    serverFetch<ListResponse<News>>("/news?limit=5&sort=-createdAt"),
    serverFetch<ListResponse<Match>>("/matches?limit=8&sort=-matchDate"),
    serverFetch<ListResponse<Player>>("/players?limit=8"),
    serverFetch<ListResponse<Academy>>("/academy?limit=6"),
    /* The photo marquee needs these. Fetching them here rather than in the
       browser keeps the gallery request off the client and away from the API
       host's CORS rules — a rejected cross-origin call was the only console
       error Lighthouse reported on this page. */
    serverFetch<ListResponse<Gallery>>("/gallery?limit=20"),
  ]);

  const initialData: HomeData = {
    club: clubs?.data?.[0] ?? null,
    news: news?.data ?? [],
    matches: matches?.data ?? [],
    players: players?.data ?? [],
    academies: academies?.data ?? [],
    galleries: galleries?.data ?? [],
  };

  return <HomeClient initialData={initialData} />;
}
