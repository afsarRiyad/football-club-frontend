import type { Match, Player, Statistic, Team } from "@/types";
import { serverFetch } from "@/lib/seo";
import { SQUAD_PLAYERS_PAGE_SIZE, deriveTeamState, pickNextMatch } from "@/lib/squad";
import SquadClient, { type SquadInitialData } from "@/components/pages/SquadClient";

/* ────────────────────────────────────────────────────────────────────
   Squad page — server component
   ────────────────────────────────────────────────────────────────────
   The roster, statistics, team (captain, formation, starting XI, bench) and
   next fixture are all fetched here so they appear in the initial HTML rather
   than only after JavaScript runs. Live formation updates over socket.io stay
   client-side in SquadClient.

   Expects the same params the client used: players page 1, statistics 500,
   teams 10, plus SCHEDULED and LIVE matches.
   ──────────────────────────────────────────────────────────────────── */

export const revalidate = 3600;

type ListResponse<T> = { data?: T[]; totalPages?: number };

export default async function Page() {
  /* serverFetch never throws — an unreachable API degrades to null and the
     client component falls back to fetching in the browser. */
  const [players, statistics, teams, scheduled, live] = await Promise.all([
    serverFetch<ListResponse<Player>>(
      `/players?limit=${SQUAD_PLAYERS_PAGE_SIZE}&page=1&sort=lastName`,
    ),
    serverFetch<ListResponse<Statistic>>("/statistics?limit=500"),
    serverFetch<ListResponse<Team>>("/teams?limit=10"),
    serverFetch<ListResponse<Match>>("/matches?status=SCHEDULED&sort=matchDate&limit=5"),
    serverFetch<ListResponse<Match>>("/matches?status=LIVE&sort=matchDate&limit=5"),
  ]);

  const playerList = players?.data ?? [];
  const teamList = teams?.data ?? [];
  const scheduledMatches = scheduled?.data ?? [];
  const liveMatches = live?.data ?? [];

  const initialData: SquadInitialData = {
    playersPage: { data: playerList, totalPages: players?.totalPages ?? 1 },
    statistics: statistics?.data ?? [],
    teams: teamList,
    scheduledMatches,
    liveMatches,
    /* Derived with the same pure helper the client uses, so the two can't
       disagree about who is in the XI or who wears the armband. */
    teamState: deriveTeamState(teamList),
    nextMatch: pickNextMatch(scheduledMatches, liveMatches),
  };

  return <SquadClient initialData={initialData} />;
}
