import type { Standing, TopScorer } from "@/types";
import { serverFetch } from "@/lib/seo";
import StandingsClient from "@/components/pages/StandingsClient";

/* ────────────────────────────────────────────────────────────────────
   Standings page — server component
   ────────────────────────────────────────────────────────────────────
   The league table and top scorers are fetched here so team names, points
   and positions are present in the initial HTML. The table/scorers tab
   switch stays client-side.

   Expects the same endpoints the client used.
   ──────────────────────────────────────────────────────────────────── */

export const revalidate = 3600;

type ListResponse<T> = { data?: T[] };

export default async function Page() {
  /* serverFetch never throws — an unreachable API degrades to null and the
     client component falls back to fetching in the browser. */
  const [standings, topScorers] = await Promise.all([
    serverFetch<ListResponse<Standing>>("/statistics/standings"),
    serverFetch<ListResponse<TopScorer>>("/statistics/top-scorers?limit=10"),
  ]);

  return (
    <StandingsClient
      standings={standings?.data ?? []}
      topScorers={topScorers?.data ?? []}
    />
  );
}
