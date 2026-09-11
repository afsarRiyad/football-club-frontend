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

/* Pick the senior team (falling back to the first) and read everything the
   squad page needs off it: captain, vice-captain, formation, starting XI,
   bench and the ids of the players in that team. */
export function deriveTeamState(teams: Team[]): DerivedTeamState {
  const state = emptyTeamState();
  const list = Array.isArray(teams) ? teams : [];
  const team = list.find((t) => t.category === "SENIOR") || list[0];
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
