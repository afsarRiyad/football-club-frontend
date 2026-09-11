import type { Match } from "@/types";
import { serverFetch } from "@/lib/seo";
import MatchDetailClient from "@/components/pages/MatchDetailClient";

/* ────────────────────────────────────────────────────────────────────
   Match detail page — server component
   ────────────────────────────────────────────────────────────────────
   The match is fetched here so both team names, the score, status and the
   goal/card timeline are present in the initial HTML — which is what lets a
   fixture rank for "Team A vs Team B" and result searches.

   Live score updates, viewer counts and chat stay client-side in
   MatchDetailClient.
   ──────────────────────────────────────────────────────────────────── */

export const revalidate = 3600;

/* The API returns either { data: { match } } or { data: match }. */
type MatchPayload = { match?: Match } & Partial<Match>;

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  /* serverFetch never throws — an unreachable API returns null and the client
     component falls back to fetching in the browser. */
  const json = await serverFetch<{ data?: MatchPayload }>(
    `/matches/${encodeURIComponent(id)}`,
  );

  const data = json?.data;
  const match: Match | null =
    data?.match ?? (data && data._id ? (data as Match) : null);

  return <MatchDetailClient id={id} match={match} />;
}
