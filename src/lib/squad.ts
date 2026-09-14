import type { Match, Player, StartingXIEntry, Team } from "@/types";
import { FORMATION_OPTIONS } from "@/lib/formations";

/*Squad helpers shared by the server-rendered page and the client shell
   These used to live inline in the client component. They are pure, so the
   server page can compute the exact same state the client derives from the
   API — which means the initial HTML already contains the starting XI,
   captain and next fixture instead of waiting for JavaScript.*/

/* Number of players fetched per request while scrolling the roster. */
export const SQUAD_PLAYERS_PAGE_SIZE = 20;

/* Serializable so it can cross the server → client boundary (a Set cannot). */
export type DerivedTeamState = {
  firstTeamId: string | null;
  captainId: string | null;
  viceCaptainId: string | null;
  teamFormationName: string | null;
  teamStartingXI: StartingXIEntry[];
  teamBench: Player[];
  teamPlayerIds: string[];
};

/* The API can return either a populated object or a bare id in these fields. */
type PlayerRef = string | Player;

const emptyTeamState = (): DerivedTeamState => ({
  firstTeamId: null,
  captainId: null,
  viceCaptainId: null,
  teamFormationName: null,
  teamStartingXI: [],
  teamBench: [],
  teamPlayerIds: [],
});

const refId = (ref: PlayerRef | undefined | null): string | null => {
  if (!ref) return null;
  return typeof ref === "string" ? ref : ref._id ?? null;
};

/* How much line-up a team actually has. Teams come back newest-first, so a
   brand-new empty team heads the list — picking the first SENIOR team handed
   the squad page an empty line-up (no bench, no captain) even though the real
   XI was saved on an older team. */
const lineupScore = (team: Team): number =>
  (team.startingXI?.length ?? 0) * 10 + (team.bench?.length ?? 0) * 3 + ((team.players ?? []) as PlayerRef[]).length;

/* The club's primary team: the SENIOR team with the most line-up data, and on
   a tie (or with nothing configured anywhere) the oldest one. */
export function pickPrimaryTeam(teams: Team[]): Team | null {
  const list = (Array.isArray(teams) ? teams : []).filter(Boolean);
  if (list.length === 0) return null;
  const seniors = list.filter((t) => t.category === "SENIOR");
  const pool = seniors.length > 0 ? seniors : list;
  // Oldest-first, so an all-empty field keeps the club's original team.
  return [...pool].reverse().reduce((best, t) =>
    lineupScore(t) > lineupScore(best) ? t : best,
  );
}

/* Pick the primary team and read everything the squad page needs off it:
   captain, vice-captain, formation, starting XI, bench and the ids of the
   players in that team. */
export function deriveTeamState(teams: Team[]): DerivedTeamState {
  const state = emptyTeamState();
  const team = pickPrimaryTeam(teams);
  if (!team) return state;

  state.firstTeamId = typeof team._id === "string" ? team._id : null;
  state.captainId = refId(team.captain);
  state.viceCaptainId = refId(team.viceCaptain);

  if (team.formation && FORMATION_OPTIONS.includes(team.formation)) {
    state.teamFormationName = team.formation;
  }

  // Use the admin-set starting XI when available.
  if (team.startingXI && team.startingXI.length > 0) {
    state.teamStartingXI = team.startingXI;
  }

  // Load bench players from team data.
  if (team.bench && team.bench.length > 0) {
    state.teamBench = team.bench.filter(
      (p): p is Player => typeof p === "object" && p !== null && Boolean(p._id),
    );
  }

  // Track team player ids so reserves can be filtered out.
  state.teamPlayerIds = ((team.players ?? []) as PlayerRef[])
    .map(refId)
    .filter((id): id is string => Boolean(id));

  return state;
}

/* Prefer a SCHEDULED fixture, falling back to a LIVE one (de-duplicated). */
export function pickNextMatch(scheduled: Match[], live: Match[]): Match | null {
  const all = [
    ...scheduled,
    ...live.filter((lm) => !scheduled.some((sm) => sm._id === lm._id)),
  ];
  const match = all.length > 0 ? all[0] : null;
  return match && (match.status === "SCHEDULED" || match.status === "LIVE") ? match : null;
}
