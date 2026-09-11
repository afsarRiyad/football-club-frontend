import type { Metadata } from "next";
import JsonLd from "@/components/seo/json-ld";
import { breadcrumbSchema, sportsEventSchema } from "@/lib/structured-data";
import { SITE_NAME, buildMetadata, metaDescription, serverFetch, truncate } from "@/lib/seo";

type RouteParams = { params: Promise<{ id: string }> };

type MatchDetail = {
  _id?: string;
  matchDate?: string;
  status?: string;
  venue?: { name?: string; address?: string };
  score?: { home?: number; away?: number };
  homeTeam?: { name?: string } | string;
  awayTeam?: { name?: string } | string;
  competition?: { name?: string } | string;
  notes?: string;
};

const teamName = (team: MatchDetail["homeTeam"]) =>
  typeof team === "string" ? "TBD" : team?.name || "TBD";

const competitionName = (competition: MatchDetail["competition"]) =>
  typeof competition === "string" ? competition : competition?.name || "";

async function getMatch(id: string): Promise<MatchDetail | null> {
  const json = await serverFetch<any>(`/matches/${encodeURIComponent(id)}`);
  const match = json?.data?.match ?? json?.data;
  if (!match) return null;
  return match as MatchDetail;
}

function formatKickoff(date?: string): string {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { id } = await params;
  const match = await getMatch(id);

  if (!match) {
    return buildMetadata({
      title: "Match not found",
      description: `This match could not be found. See the latest ${SITE_NAME} fixtures and results.`,
      path: `/matches/${id}`,
      noindex: true,
    });
  }

  const home = teamName(match.homeTeam);
  const away = teamName(match.awayTeam);
  const isPlayed = match.status === "FT" || match.status === "LIVE" || match.status === "HT";
  const score =
    match.score && typeof match.score.home === "number" && typeof match.score.away === "number"
      ? `${match.score.home}–${match.score.away}`
      : "";

  const title = truncate(
    isPlayed && score ? `${home} ${score} ${away}` : `${home} vs ${away}`,
    60,
  );

  const generated = `${
    isPlayed && score ? `Result: ${home} ${score} ${away}. ` : ""
  }${home} vs ${away}${match.matchDate ? ` on ${formatKickoff(match.matchDate)}` : ""}${
    match.venue?.name ? ` at ${match.venue.name}` : ""
  }. ${competitionName(match.competition) ? `${competitionName(match.competition)} · ` : ""}${
    SITE_NAME
  } match centre with line-ups, goalscorers and statistics.`;

  // `notes` is a free-text admin field — only prefer it when it is substantial,
  // otherwise short placeholder notes would become the search snippet.
  const notes = (match.notes || "").trim();
  const description = metaDescription(
    notes.length >= 60 ? notes : undefined,
    generated,
  );

  return buildMetadata({
    title,
    description,
    path: `/matches/${id}`,
    keywords: [home, away, `${home} vs ${away}`, "match result", `${SITE_NAME} match`],
  });
}

export default async function MatchSeoLayout({
  children,
  params,
}: RouteParams & { children: React.ReactNode }) {
  const { id } = await params;
  const match = await getMatch(id);

  if (!match) return <>{children}</>;

  const home = teamName(match.homeTeam);
  const away = teamName(match.awayTeam);

  return (
    <>
      <JsonLd
        data={[
          sportsEventSchema({
            _id: id,
            matchDate: match.matchDate,
            venue: match.venue,
            homeName: home,
            awayName: away,
            status: match.status,
            score: {
              home: match.score?.home ?? 0,
              away: match.score?.away ?? 0,
            },
          }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Matches", path: "/matches" },
            { name: `${home} vs ${away}`, path: `/matches/${id}` },
          ]),
        ]}
      />
      {children}
    </>
  );
}
