"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Match } from "@/types";
import Image from "next/image";
import { PageSpinner, Pagination } from "@/components/ui";
import { cn, CLUB_TIME_ZONE } from "@/lib/utils";

function getTeamName(team: any): string {
  if (typeof team === "string") return "TBD";
  return team?.name || "TBD";
}

function getTeamLogo(team: any): string {
  if (!team || typeof team === "string") return "";
  return team?.logo || "";
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: CLUB_TIME_ZONE,
  });
}

function formatTime(d: string) {
  return new Date(d).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: CLUB_TIME_ZONE,
  });
}

const statusFilters = [
  { value: "", label: "All" },
  { value: "SCHEDULED", label: "Upcoming" },
  { value: "LIVE", label: "Live" },
  { value: "FT", label: "Results" },
];

// ─── Extract all events for a team side ───
function getPlayerName(player: any): string {
  if (!player) return "";
  if (typeof player === "object") return `${player.firstName || ""} ${player.lastName || ""}`.trim();
  return "";
}

function parseDescription(raw: string): { name: string; assist?: string } {
  if (!raw) return { name: "" };
  const parts = raw.split("|");
  const name = parts[0]?.trim() || raw;
  const assistPart = parts.find((p: string) => p.trim().startsWith("assist:"));
  const assist = assistPart ? assistPart.replace("assist:", "").trim() : undefined;
  return { name, assist };
}

type MatchEventDisplay = {
  type: string;
  minute: number;
  text: string;
  icon: string;
  color: string;
};

function getTeamEvents(events: any[]): MatchEventDisplay[] {
  if (!events) return [];
  const items: MatchEventDisplay[] = [];

  for (const e of events) {
    const minute = e.minute || 0;
    let name = getPlayerName(e.player);
    let assist: string | undefined = getPlayerName(e.assist) || undefined;

    // Fallback to description parsing
    if (!name && e.description) {
      const parsed = parseDescription(e.description);
      name = parsed.name;
      if (!assist && parsed.assist) assist = parsed.assist;
    }

    switch (e.type) {
      case "GOAL":
        items.push({
          type: "GOAL",
          minute,
          text: name ? `${name}${assist ? ` (ast. ${assist})` : ""}` : "Goal",
          icon: "⚽",
          color: "text-emerald-400",
        });
        break;
      case "OWN_GOAL":
        items.push({
          type: "OWN_GOAL",
          minute,
          text: name ? `${name} (OG)` : "Own Goal",
          icon: "⚽",
          color: "text-red-400",
        });
        break;
      case "YELLOW_CARD":
        items.push({
          type: "YELLOW_CARD",
          minute,
          text: name || "Yellow",
          icon: "🟨",
          color: "text-yellow-400",
        });
        break;
      case "RED_CARD":
        items.push({
          type: "RED_CARD",
          minute,
          text: name || "Red",
          icon: "🟥",
          color: "text-red-500",
        });
        break;
      case "SUBSTITUTION":
        items.push({
          type: "SUBSTITUTION",
          minute,
          text: name ? `${name} ${e.description ? `(${e.description})` : ""}` : e.description || "Sub",
          icon: "🔄",
          color: "text-blue-400",
        });
        break;
      case "PENALTY_MISSED":
        items.push({
          type: "PENALTY_MISSED",
          minute,
          text: name ? `${name} (Missed PK)` : "Penalty Missed",
          icon: "❌",
          color: "text-orange-400",
        });
        break;
      default:
        break;
    }
  }

  return items.sort((a, b) => a.minute - b.minute);
}

/* Page 1 of the unfiltered list, fetched on the server (see src/app/(public)/matches/page.tsx). */
export type MatchesInitialData = {
  matches: Match[];
  totalPages: number;
};

export default function MatchesClient({ initialData }: { initialData: MatchesInitialData }) {
  /* If the server couldn't reach the API there is nothing rendered yet, so start
     in the loading state and fetch in the browser as before. */
  const serverHadNothing = initialData.matches.length === 0;

  const [matches, setMatches] = useState<Match[]>(initialData.matches);
  const [loading, setLoading] = useState(serverHadNothing);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialData.totalPages);

  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      // The server already rendered page 1 with no filter.
      if (!serverHadNothing) return;
    }
    fetchMatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, page]);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 12, sort: "-matchDate" };
      if (status) params.status = status;
      const { data } = await api.get("/matches", { params });
      setMatches(data.data || []);
      setTotalPages(data.totalPages || 1);
    } catch (e) {
      console.error("Failed to fetch matches:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-floodlight font-display tracking-tight">
          Matches
        </h1>
      </div>

      {/* Filter */}
      <div className="flex gap-1 mb-10 overflow-x-auto pb-2">
        {statusFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => { setStatus(f.value); setPage(1); }}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors",
              status === f.value
                ? "bg-floodlight text-pitch-night"
                : "text-mist hover:text-floodlight hover:bg-surface-raised"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <PageSpinner />
      ) : matches.length === 0 ? (
        <div className="py-20 text-center">
          <p className="font-mono text-mist">No matches found</p>
        </div>
      ) : (
        <>
          <div className="space-y-px">
            {matches.map((match) => {
              const isLive = match.status === "LIVE" || match.status === "HT";
              const isFinished = match.status === "FT";
              const allEvents = getTeamEvents((match as any).events);
              const homeLogo = getTeamLogo(match.homeTeam);
              const awayLogo = getTeamLogo(match.awayTeam);

              return (
                <Link
                  key={match._id}
                  href={`/matches/${match._id}`}
                  className="block py-4 px-4 hover:bg-surface rounded-xl transition-colors group border-b border-line/20 last:border-0"
                >
                  {/* Date / Time */}
                  <div className="text-[10px] text-mist font-mono mb-2">
                    {formatDate(match.matchDate)} · {formatTime(match.matchDate)}
                  </div>

                  {/* Match row */}
                  <div className="flex items-center gap-4">
                    {/* Home team */}
                    <div className="flex-1 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-sm md:text-base font-semibold text-floodlight group-hover:text-pitch-accent transition-colors truncate">
                          {getTeamName(match.homeTeam)}
                        </span>
                        {homeLogo && (
                          <Image src={homeLogo} alt={`${getTeamName(match.homeTeam)} logo`} width={24} height={24} className="w-6 h-6 rounded-full object-contain border border-line/30 shrink-0" />
                        )}
                      </div>
                    </div>

                    {/* Score */}
                    <div className="flex flex-col items-center shrink-0">
                      {match.status === "SCHEDULED" ? (
                        <span className="text-sm font-mono text-mist px-3">vs</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-2xl font-black font-mono tabular-nums",
                            match.score.home > match.score.away ? "text-pitch-accent" : "text-floodlight"
                          )}>
                            {match.score.home}
                          </span>
                          <span className="text-lg text-line/40 font-light">–</span>
                          <span className={cn(
                            "text-2xl font-black font-mono tabular-nums",
                            match.score.away > match.score.home ? "text-pitch-accent" : "text-floodlight"
                          )}>
                            {match.score.away}
                          </span>
                        </div>
                      )}
                      {/* Status badge */}
                      <div className="mt-1">
                        {isLive ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-alert-red bg-alert-red/10 px-2 py-0.5 rounded-full">
                            <span className="h-1.5 w-1.5 rounded-full bg-alert-red animate-pulse" />
                            LIVE
                          </span>
                        ) : isFinished ? (
                          <span className="text-[9px] font-mono text-mist/70 px-2 py-0.5 rounded-full">
                            FT
                          </span>
                        ) : match.status === "HT" ? (
                          <span className="text-[9px] font-mono font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                            HT
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {/* Away team */}
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        {awayLogo && (
                          <Image src={awayLogo} alt={`${getTeamName(match.awayTeam)} logo`} width={24} height={24} className="w-6 h-6 rounded-full object-contain border border-line/30 shrink-0" />
                        )}
                        <span className="text-sm md:text-base font-semibold text-floodlight group-hover:text-pitch-accent transition-colors truncate">
                          {getTeamName(match.awayTeam)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Events timeline below score */}
                  {allEvents.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 justify-center">
                      {allEvents.map((ev, i) => (
                        <span key={i} className={`text-[11px] ${ev.color} whitespace-nowrap`}>
                          {ev.icon} {ev.minute}&apos; {ev.text}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            className="mt-10"
          />
        </>
      )}
    </div>
  );
}
