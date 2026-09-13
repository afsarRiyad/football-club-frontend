import type { Metadata } from "next";
import type { Academy, Club, Gallery, Match, News, Player } from "@/types";
import { buildMetadata, serverFetch } from "@/lib/seo";
import { collectTournamentFixtures, type TournamentLike } from "@/lib/tournament-fixtures";
import HomeClient, { type HomeData } from "@/components/pages/HomeClient";

/* ────────────────────────────────────────────────────────────────────
   Home page — server component
   ────────────────────────────────────────────────────────────────────
   Data is fetched here, on the server, so the club name, squad, fixtures
   and news are all present in the initial HTML. Search engine crawlers
   index that HTML directly rather than depending on JavaScript execution.

   Previously this page was a client component that fetched in useEffect,
   which meant crawlers only ever saw the "Loading home…" skeleton.

   Rendered statically and refreshed every minute (see CONTENT_REVALIDATE in
   lib/seo.ts), matching the sitemap.

   Hero target: one page, multiple phrasings. The title carries brand +
   town + crossroads so it answers "nayadiganta club", "nayadiganta club
   kabirhat noakhali" and "nayadiganta club bhuiyarhat chowrasta" at
   once, without contradicting itself. */

export const revalidate = 60; /* Content window — see CONTENT_REVALIDATE in lib/seo.ts */

/* Title, description and keywords come from the `home` target; the title is
   marked absolute there so this page's long, keyword-carrying title does not
   collect a second "| Nayadiganta Sporting Club". */
export const metadata: Metadata = buildMetadata({ target: "home", path: "/" });

type ListResponse<T> = { data?: T[] };

export default async function Page() {
  /* serverFetch never throws — an unreachable API degrades to null and the
     client component falls back to fetching in the browser. */
  /* Results and fixtures are fetched separately rather than as one
     "latest 8 matches". Sorting by -matchDate returns the eight latest DATES,
     so as a season fills up with future fixtures the finished matches fall
     outside the limit and the Results section silently vanishes even though
     results exist. Asking for each status separately makes both sections
     independent of how many fixtures are scheduled. */
  const [clubs, news, featuredNews, results, fixtures, tournaments, players, academies, galleries] = await Promise.all([
    serverFetch<ListResponse<Club>>("/clubs?limit=1"),
    serverFetch<ListResponse<News>>("/news?limit=5&sort=-createdAt"),
    /* The same Featured article that headlines the news page — searched for
       separately because it may be older than the five returned above. */
    serverFetch<ListResponse<News>>("/news?isFeatured=true&limit=1"),
    serverFetch<ListResponse<Match>>("/matches?status=FT,LIVE,HT&limit=4&sort=-matchDate"),
    serverFetch<ListResponse<Match>>("/matches?status=SCHEDULED&limit=4&sort=matchDate"),
    /* Tournament fixtures are separate documents, so they would never appear in
       the fixture list above. They are merged in below and link to the
       competition, where the bracket lives. */
    serverFetch<ListResponse<TournamentLike>>("/tournaments?limit=50"),
    serverFetch<ListResponse<Player>>("/players?limit=8"),
    serverFetch<ListResponse<Academy>>("/academy?limit=6"),
    /* The photo marquee needs these. Fetching them here rather than in the
       browser keeps the gallery request off the client and away from the API
       host's CORS rules — a rejected cross-origin call was the only console
       error Lighthouse reported on this page. */
    serverFetch<ListResponse<Gallery>>("/gallery?limit=20"),
  ]);

  /* The Featured story leads the news block, so featuring an article changes the
     homepage and the news page together instead of only one of them. */
  const newsList = news?.data ?? [];
  const featuredArticle = featuredNews?.data?.[0] ?? null;
  const orderedNews = featuredArticle
    ? [featuredArticle, ...newsList.filter((n) => n._id !== featuredArticle._id)].slice(0, 5)
    : newsList;

  const club = clubs?.data?.[0] ?? null;
  /* Upcoming = club fixtures + tournament fixtures, soonest first, so "Next Up"
     shows whichever match actually comes next. */
  const upcoming = [
    ...(fixtures?.data ?? []),
    ...collectTournamentFixtures(tournaments?.data, { clubId: club?._id }),
  ].sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime());

  const initialData: HomeData = {
    club,
    news: orderedNews,
    matches: [...(results?.data ?? []), ...upcoming],
    players: players?.data ?? [],
    academies: academies?.data ?? [],
    galleries: galleries?.data ?? [],
  };

  return <HomeClient initialData={initialData} />;
}
