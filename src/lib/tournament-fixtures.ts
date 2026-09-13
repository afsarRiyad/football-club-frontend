import type { Match } from "@/types";

export type TournamentLike = {
  _id?: string;
  name?: string;
  club?: string | { _id?: string; name?: string } | null;
  matches?: Array<{
    _id?: string;
    round?: string;
    status?: string;
    matchDate?: string | null;
    homeTeam?: unknown;
    awayTeam?: unknown;
    venue?: string;
    group?: string | null;
  }>;
};

/** The markers a tournament fixture adds on top of the Match shape. */
type TournamentMarkers = {
  _source: "tournament";
  tournamentId: string;
  tournamentName: string;
  /** SEMI_FINAL, GROUP_STAGE, … */
  round: string;
  group?: string | null;
  /** The bracket match inside the tournament — the real id, not the composite one. */
  tournamentMatchId: string;
};


export type TournamentFixture = Omit<Match, "createdAt" | "updatedAt"> & TournamentMarkers;


export type SiteFixture =
  | (Match & Partial<TournamentMarkers>)
  | (TournamentFixture & Partial<TournamentMarkers>);

const idOf = (value: unknown): string =>
  typeof value === "string" ? value : ((value as { _id?: string } | null)?._id ?? "");

const nameOf = (value: unknown): string =>
  typeof value === "string" ? value : ((value as { name?: string } | null)?.name ?? "");

/**
 * Scheduled, playable fixtures from one tournament.
 */
export function tournamentFixtures(tournament: TournamentLike | null | undefined): TournamentFixture[] {
  if (!tournament || !Array.isArray(tournament.matches)) return [];

  const tournamentId = idOf(tournament._id);
  const tournamentName = nameOf(tournament.name);

  return tournament.matches
    .filter((match) => {
      if (match.status !== "SCHEDULED" || !match.matchDate) return false;
      // Both sides must be known, otherwise it is an empty bracket slot.
      return Boolean(idOf(match.homeTeam) && idOf(match.awayTeam));
    })
    .map((match) => {
      const matchId = idOf(match._id);

      return {
        /* Match-shaped, so every existing fixture renderer keeps working. */
        _id: `${tournamentId}-${matchId}`,
        club: idOf(tournament.club) || tournamentId,
        homeTeam: match.homeTeam as Match["homeTeam"],
        awayTeam: (match.awayTeam ?? null) as Match["awayTeam"],
        matchDate: match.matchDate as string,
        status: "SCHEDULED" as Match["status"],
        score: { home: 0, away: 0 },
        events: [],
        venue:
          typeof match.venue === "string" && match.venue
            ? ({ name: match.venue } as Match["venue"])
            : undefined,
        competition: { _id: tournamentId, name: tournamentName, type: "TOURNAMENT" },
        _source: "tournament" as const,
        tournamentId,
        tournamentName,
        round: String(match.round ?? ""),
        group: match.group ?? null,
        tournamentMatchId: matchId,
      };
    });
}

export function collectTournamentFixtures(
  tournaments: TournamentLike[] | null | undefined,
  { clubId, limit, from }: { clubId?: string | null; limit?: number; from?: Date } = {},
): TournamentFixture[] {
  if (!Array.isArray(tournaments)) return [];

  const fixtures = tournaments
    .filter((tournament) => (clubId ? idOf(tournament.club) === clubId : true))
    .flatMap((tournament) => tournamentFixtures(tournament))
    .filter((fixture) => (from ? new Date(fixture.matchDate).getTime() >= from.getTime() : true))
    .sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime());

  return typeof limit === "number" ? fixtures.slice(0, limit) : fixtures;
}

/** Where a fixture's row should link: a match page, or the competition it belongs to. */
export function fixtureHref(match: { _id: string; _source?: string }): string {
  return match._source === "tournament" ? "/competitions" : `/matches/${match._id}`;
}
