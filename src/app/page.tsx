import type { Metadata } from "next";
import type { Academy, Club, Gallery, Match, News, Player } from "@/types";
import { buildMetadata, serverFetch } from "@/lib/seo";
import { collectTournamentFixtures, type TournamentLike } from "@/lib/tournament-fixtures";
import HomeClient, { type HomeData } from "@/components/pages/HomeClient";



export const revalidate = 60; /* Content window — see CONTENT_REVALIDATE in lib/seo.ts */

export const metadata: Metadata = buildMetadata({ target: "home", path: "/" });

type ListResponse<T> = { data?: T[] };

export default async function Page() {
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
