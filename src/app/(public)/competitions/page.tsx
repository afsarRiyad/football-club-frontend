"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Trophy, Swords, ArrowLeft, Calendar, MapPin, Users, ChevronRight, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { Competition, Match } from "@/types";
import { PageSpinner } from "@/components/ui";
import { cn } from "@/lib/utils";

const typeColors: Record<string, string> = {
  LEAGUE: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  CUP: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  TOURNAMENT: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  FRIENDLY: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

const statusColors: Record<string, string> = {
  UPCOMING: "bg-blue-500/10 text-blue-400",
  DRAFT: "bg-gray-500/10 text-gray-400",
  REGISTRATION: "bg-blue-500/10 text-blue-400",
  IN_PROGRESS: "bg-green-500/10 text-green-400",
  COMPLETED: "bg-gray-500/10 text-gray-400",
  CANCELLED: "bg-red-500/10 text-red-400",
};

function getTeamName(team: any): string {
  if (!team) return "TBD";
  if (typeof team === "string") return "TBD";
  return team.name || "TBD";
}

function getTeamLogo(team: any): string {
  if (!team || typeof team === "string") return "";
  return team.logo || "";
}

// ─── Mini Bracket View ─────────────────────────────────────────────
function MiniBracket({ matches }: { matches: any[] }) {
  if (!matches || matches.length === 0) return null;

  // Group by round
  const rounds: Record<string, any[]> = {};
  matches.forEach((m) => {
    if (!rounds[m.round]) rounds[m.round] = [];
    rounds[m.round].push(m);
  });

  const roundOrder = Object.keys(rounds);

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-6 min-w-max items-start">
        {roundOrder.map((round, ri) => (
          <div key={round} className="flex flex-col items-center" style={{ marginTop: ri * 20 }}>
            <h4 className="text-[10px] font-mono font-bold text-mist uppercase tracking-wider mb-3 whitespace-nowrap">
              {round.replace(/_/g, " ")}
            </h4>
            <div
              className="flex flex-col gap-3"
              style={{ gap: `${Math.pow(2, ri) * 12 + 12}px` }}
            >
              {rounds[round].map((match: any, mi: number) => {
                const isHomeWin = match.status === "COMPLETED" && match.winner === "HOME";
                const isAwayWin = match.status === "COMPLETED" && match.winner === "AWAY";

                return (
                  <div
                    key={match._id || mi}
                    className="bg-surface rounded-lg border border-line/40 w-48 text-sm overflow-hidden"
                  >
                    <div className={cn("flex items-center gap-1.5 px-2.5 py-1.5 border-b border-line/30", isHomeWin && "bg-green-500/5")}>
                      {getTeamLogo(match.homeTeam) && (
                        <img src={getTeamLogo(match.homeTeam)} alt="" className="w-4 h-4 rounded object-contain" />
                      )}
                      <span className={cn("flex-1 truncate text-xs", isHomeWin && "font-bold text-pitch-accent")}>
                        {getTeamName(match.homeTeam)}
                      </span>
                      {match.status === "COMPLETED" ? (
                        <span className={cn("text-xs font-mono font-bold", isHomeWin && "text-pitch-accent")}>
                          {match.homeScore ?? 0}
                        </span>
                      ) : null}
                    </div>
                    <div className={cn("flex items-center gap-1.5 px-2.5 py-1.5", isAwayWin && "bg-green-500/5")}>
                      {getTeamLogo(match.awayTeam) && (
                        <img src={getTeamLogo(match.awayTeam)} alt="" className="w-4 h-4 rounded object-contain" />
                      )}
                      <span className={cn("flex-1 truncate text-xs", isAwayWin && "font-bold text-pitch-accent")}>
                        {getTeamName(match.awayTeam)}
                      </span>
                      {match.status === "COMPLETED" ? (
                        <span className={cn("text-xs font-mono font-bold", isAwayWin && "text-pitch-accent")}>
                          {match.awayScore ?? 0}
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Competition Card ──────────────────────────────────────────────
function CompetitionCard({
  competition,
  onSelect,
}: {
  competition: Competition;
  onSelect: () => void;
}) {
  const teamCount = ((competition as any).teams || []).filter((t: any) => t && typeof t === "object").length;
  const matchCount = (competition as any).matches?.length || 0;
  const status = (competition as any).status || "UPCOMING";

  return (
    <button
      onClick={onSelect}
      className="w-full text-left bg-surface rounded-xl border border-line/40 overflow-hidden hover:border-club-accent/40 hover:shadow-lg transition-all duration-300 group"
    >
      {/* Header with logo */}
      <div className="relative h-32 bg-gradient-to-br from-surface-raised to-surface overflow-hidden">
        {competition.logo ? (
          <img src={competition.logo} alt={competition.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Trophy className="h-12 w-12 text-line/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />

        {/* Type badge */}
        <div className="absolute top-3 left-3">
          <span className={cn("text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border", typeColors[competition.type || "LEAGUE"])}>
            {competition.type || "LEAGUE"}
          </span>
        </div>

        {/* Status badge */}
        <div className="absolute top-3 right-3">
          <span className={cn("text-[10px] font-mono font-bold px-2 py-0.5 rounded-full", statusColors[status])}>
            {status.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold text-floodlight group-hover:text-pitch-accent transition-colors truncate">
          {competition.name}
        </h3>
        {competition.country && (
          <p className="text-xs text-mist mt-0.5">{competition.country}</p>
        )}
        <div className="flex items-center gap-3 mt-3 text-xs text-mist">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {teamCount} teams
          </span>
          <span className="flex items-center gap-1">
            <Trophy className="h-3 w-3" />
            {matchCount} matches
          </span>
          {competition.format && (
            <span className="text-mist/60">{competition.format.replace(/_/g, " ")}</span>
          )}
        </div>
      </div>
    </button>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────
export default function CompetitionsPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"all" | "LEAGUE" | "CUP" | "TOURNAMENT">("all");

  useEffect(() => {
    fetchCompetitions();
  }, []);

  // Live refresh: poll selected item every 30s if it has live/scheduled matches
  useEffect(() => {
    if (!selected) return;
    const hasActive = (selected as any).matches?.some((m: any) => m.status === "LIVE" || m.status === "SCHEDULED");
    if (!hasActive) return;

    const isTournament = selected._source === "tournament";
    const endpoint = isTournament ? `/tournaments/${selected._id}` : `/competitions/${selected._id}`;

    const interval = setInterval(async () => {
      try {
        const { data: res } = await api.get(endpoint);
        if (isTournament) {
          const t = res.data?.tournament || res.data;
          if (t) setSelected({ ...t, type: "TOURNAMENT", _source: "tournament" });
        } else if (res.data?.competition) {
          setSelected(res.data.competition);
        } else if (res.data) {
          setSelected(res.data as any);
        }
      } catch {
        // silently ignore
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [selected?._id]);

  const fetchCompetitions = async () => {
    setLoading(true);
    try {
      // Merge real competitions with tournaments (admin creates tournaments via /tournaments)
      const [compsRes, tournsRes] = await Promise.allSettled([
        api.get("/competitions", { params: { limit: 50 } }),
        api.get("/tournaments", { params: { limit: 50 } }),
      ]);
      const comps: Competition[] =
        compsRes.status === "fulfilled" ? compsRes.value.data.data || [] : [];
      const tourns: any[] =
        tournsRes.status === "fulfilled" ? tournsRes.value.data.data || [] : [];

      setCompetitions([
        ...comps,
        ...tourns.map((t) => ({ ...t, type: "TOURNAMENT", _source: "tournament" })),
      ]);
    } catch (e) {
      console.error("Failed to fetch competitions:", e);
    } finally {
      setLoading(false);
    }
  };

  // Open detail: tournaments need their full document (groups + bracket matches)
  const openDetail = async (item: any) => {
    if (item._source === "tournament") {
      setSelected({ ...item, loadingDetail: true } as any);
      try {
        const { data: res } = await api.get(`/tournaments/${item._id}`);
        const t = res.data?.tournament || res.data;
        setSelected({ ...(t || item), type: "TOURNAMENT", _source: "tournament" } as any);
      } catch (e) {
        console.error("Failed to fetch tournament:", e);
        setSelected(item);
      }
    } else {
      setSelected(item);
    }
  };

  const filtered = activeTab === "all"
    ? competitions
    : competitions.filter((c) => c.type === activeTab);

  if (loading) return <PageSpinner />;

  // ── Detail View ──
  if (selected) {
    const status = (selected as any).status || "UPCOMING";
    const teamCount = ((selected as any).teams || []).filter((t: any) => t && typeof t === "object").length;
    const matches = (selected as any).matches || [];

    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <button
          onClick={() => setSelected(null)}
          className="inline-flex items-center gap-1.5 text-mist hover:text-floodlight text-sm mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to competitions
        </button>

        {/* Hero */}
        <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden mb-8">
          {selected.logo ? (
            <img src={selected.logo} alt={selected.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-surface-raised to-surface flex items-center justify-center">
              <Trophy className="h-20 w-20 text-line/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-2">
              <span className={cn("text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border", typeColors[selected.type || "LEAGUE"])}>
                {selected.type || "LEAGUE"}
              </span>
              <span className={cn("text-[10px] font-mono font-bold px-2 py-0.5 rounded-full", statusColors[status])}>
                {status.replace(/_/g, " ")}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white font-display">{selected.name}</h1>
            {selected.country && <p className="text-sm text-white/60 mt-1">{selected.country}</p>}
          </div>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <div className="bg-surface rounded-xl border border-line/40 p-4 text-center">
            <Users className="h-5 w-5 text-mist mx-auto mb-1" />
            <p className="text-2xl font-bold font-mono text-floodlight">{teamCount}</p>
            <p className="text-[10px] text-mist uppercase tracking-wider">Teams</p>
          </div>
          <div className="bg-surface rounded-xl border border-line/40 p-4 text-center">
            <Trophy className="h-5 w-5 text-mist mx-auto mb-1" />
            <p className="text-2xl font-bold font-mono text-floodlight">{matches.length}</p>
            <p className="text-[10px] text-mist uppercase tracking-wider">Matches</p>
          </div>
          <div className="bg-surface rounded-xl border border-line/40 p-4 text-center">
            <Swords className="h-5 w-5 text-mist mx-auto mb-1" />
            <p className="text-2xl font-bold font-mono text-floodlight">
              {matches.filter((m: any) => m.status === "COMPLETED").length}
            </p>
            <p className="text-[10px] text-mist uppercase tracking-wider">Completed</p>
          </div>
          <div className="bg-surface rounded-xl border border-line/40 p-4 text-center">
            <Calendar className="h-5 w-5 text-mist mx-auto mb-1" />
            <p className="text-sm font-medium text-floodlight">
              {selected.format?.replace(/_/g, " ") || "—"}
            </p>
            <p className="text-[10px] text-mist uppercase tracking-wider">Format</p>
          </div>
        </div>

        {/* Description */}
        {selected.description && (
          <div className="bg-surface rounded-xl border border-line/40 p-6 mb-8">
            <p className="text-sm text-mist leading-relaxed">{selected.description}</p>
          </div>
        )}

        {/* Group Stage Standings */}
        {(selected as any).format === "GROUP_AND_KNOCKOUT" && (selected as any).groups && Object.keys((selected as any).groups).length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-mono font-bold text-club-accent uppercase tracking-widest">Group Stage</span>
              <span className="h-px flex-1 bg-line/40" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries((selected as any).groups as Record<string, any[]>).map(([label, groupTeams]) => {
                const gs: Record<string, { team: any; played: number; won: number; drawn: number; lost: number; gf: number; ga: number; gd: number; points: number }> = {};
                for (const t of groupTeams) {
                  const tid = typeof t === "object" ? t._id : t;
                  gs[tid] = { team: typeof t === "object" ? t : { _id: tid, name: "TBD" }, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 };
                }
                const gm = matches.filter((m: any) => m.round === "GROUP_STAGE" && m.group === label);
                for (const m of gm) {
                  if (m.status !== "COMPLETED" || !m.homeTeam || !m.awayTeam) continue;
                  const hid = typeof m.homeTeam === "object" ? m.homeTeam._id : m.homeTeam;
                  const aid = typeof m.awayTeam === "object" ? m.awayTeam._id : m.awayTeam;
                  if (!gs[hid]) gs[hid] = { team: m.homeTeam, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 };
                  if (!gs[aid]) gs[aid] = { team: m.awayTeam, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 };
                  const hs = m.homeScore ?? 0; const as = m.awayScore ?? 0;
                  gs[hid].played++; gs[aid].played++;
                  gs[hid].gf += hs; gs[hid].ga += as; gs[aid].gf += as; gs[aid].ga += hs;
                  if (hs > as) { gs[hid].won++; gs[hid].points += 3; gs[aid].lost++; }
                  else if (as > hs) { gs[aid].won++; gs[aid].points += 3; gs[hid].lost++; }
                  else { gs[hid].drawn++; gs[aid].drawn++; gs[hid].points += 1; gs[aid].points += 1; }
                }
                const sorted = Object.values(gs).map(s => ({ ...s, gd: s.gf - s.ga })).sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);
                const totalGroupMatches = gm.length;
                const playedGroupMatches = gm.filter((m: any) => m.status === "COMPLETED").length;

                return (
                  <div key={label} className="bg-surface rounded-xl border border-line/40 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-line/30">
                      <span className="text-xs font-mono font-bold text-floodlight">Group {label}</span>
                      <span className="text-[10px] text-mist">{playedGroupMatches}/{totalGroupMatches} played</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-line/30 text-mist">
                            <th className="text-left py-2 px-3 text-[9px] font-mono uppercase w-5">#</th>
                            <th className="text-left py-2 px-3 text-[9px] font-mono uppercase">Team</th>
                            <th className="text-center py-2 px-2 text-[9px] font-mono uppercase w-6">P</th>
                            <th className="text-center py-2 px-2 text-[9px] font-mono uppercase w-6">W</th>
                            <th className="text-center py-2 px-2 text-[9px] font-mono uppercase w-6">D</th>
                            <th className="text-center py-2 px-2 text-[9px] font-mono uppercase w-6">L</th>
                            <th className="text-center py-2 px-2 text-[9px] font-mono uppercase w-8">GD</th>
                            <th className="text-center py-2 px-3 text-[9px] font-mono uppercase w-7">PTS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sorted.map((s, i) => {
                            const tn = typeof s.team === "object" ? s.team?.name : "TBD";
                            const tl = typeof s.team === "object" ? s.team?.logo : "";
                            return (
                              <tr key={i} className={cn("border-b border-line/20 last:border-0", i < 2 && "bg-emerald-500/5")}>
                                <td className="py-2 px-3 font-mono text-mist text-[10px]">{i + 1}</td>
                                <td className="py-2 px-3">
                                  <div className="flex items-center gap-2">
                                    {tl ? <img src={tl} alt="" className="w-5 h-5 rounded-full object-contain" /> : <div className="w-5 h-5 rounded-full bg-surface-raised flex items-center justify-center text-[7px] font-bold text-line">{tn?.charAt(0)}</div>}
                                    <span className="font-medium text-floodlight truncate">{tn}</span>
                                  </div>
                                </td>
                                <td className="text-center py-2 px-2 font-mono text-floodlight">{s.played}</td>
                                <td className="text-center py-2 px-2 font-mono text-emerald-500 font-bold">{s.won}</td>
                                <td className="text-center py-2 px-2 font-mono text-floodlight">{s.drawn}</td>
                                <td className="text-center py-2 px-2 font-mono text-red-400">{s.lost}</td>
                                <td className="text-center py-2 px-2 font-mono text-floodlight">{s.gd > 0 ? "+" + s.gd : s.gd}</td>
                                <td className="text-center py-2 px-3 font-mono font-black text-floodlight">{s.points}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <div className="px-4 py-1.5 border-t border-line/20">
                      <p className="text-[9px] text-mist/60">Top 2 advance to knockout</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Standings Table */}
        {(() => {
          // Only show overall standings for non-group formats
          if ((selected as any).format === "GROUP_AND_KNOCKOUT") return null;
          const standings: Record<string, { team: any; played: number; won: number; drawn: number; lost: number; gf: number; ga: number; gd: number; points: number }> = {};
          for (const m of matches) {
            if (m.status !== "COMPLETED" || !m.homeTeam || !m.awayTeam) continue;
            const hid = typeof m.homeTeam === "object" ? m.homeTeam._id : m.homeTeam;
            const aid = typeof m.awayTeam === "object" ? m.awayTeam._id : m.awayTeam;
            if (!standings[hid]) standings[hid] = { team: m.homeTeam, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 };
            if (!standings[aid]) standings[aid] = { team: m.awayTeam, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 };
            const hs = m.homeScore ?? 0;
            const as = m.awayScore ?? 0;
            standings[hid].played++; standings[aid].played++;
            standings[hid].gf += hs; standings[hid].ga += as;
            standings[aid].gf += as; standings[aid].ga += hs;
            if (hs > as) { standings[hid].won++; standings[hid].points += 3; standings[aid].lost++; }
            else if (as > hs) { standings[aid].won++; standings[aid].points += 3; standings[hid].lost++; }
            else { standings[hid].drawn++; standings[aid].drawn++; standings[hid].points += 1; standings[aid].points += 1; }
          }
          const table = Object.values(standings).map(s => ({ ...s, gd: s.gf - s.ga })).sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);

          return table.length > 0 ? (
            <div className="bg-surface rounded-xl border border-line/40 overflow-hidden mb-8">
              <div className="px-6 py-4 border-b border-line/30">
                <h2 className="text-sm font-bold text-floodlight uppercase tracking-wider">Standings</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-line/30 text-mist">
                      <th className="text-left py-3 px-4 text-[10px] font-mono uppercase w-8">#</th>
                      <th className="text-left py-3 px-4 text-[10px] font-mono uppercase">Team</th>
                      <th className="text-center py-3 px-3 text-[10px] font-mono uppercase w-10">P</th>
                      <th className="text-center py-3 px-3 text-[10px] font-mono uppercase w-10">W</th>
                      <th className="text-center py-3 px-3 text-[10px] font-mono uppercase w-10">D</th>
                      <th className="text-center py-3 px-3 text-[10px] font-mono uppercase w-10">L</th>
                      <th className="text-center py-3 px-3 text-[10px] font-mono uppercase w-10">GF</th>
                      <th className="text-center py-3 px-3 text-[10px] font-mono uppercase w-10">GA</th>
                      <th className="text-center py-3 px-3 text-[10px] font-mono uppercase w-10">GD</th>
                      <th className="text-center py-3 px-4 text-[10px] font-mono uppercase w-12">PTS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {table.map((s, i) => {
                      const teamName = typeof s.team === "object" ? s.team?.name : "TBD";
                      const teamLogo = typeof s.team === "object" ? s.team?.logo : "";
                      return (
                        <tr key={i} className="border-b border-line/20 last:border-0 hover:bg-surface-raised/50 transition-colors">
                          <td className="py-3 px-4 font-mono text-mist text-xs">{i + 1}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              {teamLogo ? (
                                <img src={teamLogo} alt="" className="w-7 h-7 rounded-full object-contain border border-line/30" />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-surface-raised border border-line/30 flex items-center justify-center">
                                  <span className="text-[9px] font-bold text-line">{teamName?.charAt(0)}</span>
                                </div>
                              )}
                              <span className="font-medium text-floodlight">{teamName}</span>
                            </div>
                          </td>
                          <td className="text-center py-3 px-3 font-mono text-floodlight">{s.played}</td>
                          <td className="text-center py-3 px-3 font-mono text-emerald-500 font-bold">{s.won}</td>
                          <td className="text-center py-3 px-3 font-mono text-floodlight">{s.drawn}</td>
                          <td className="text-center py-3 px-3 font-mono text-red-400">{s.lost}</td>
                          <td className="text-center py-3 px-3 font-mono text-floodlight">{s.gf}</td>
                          <td className="text-center py-3 px-3 font-mono text-floodlight">{s.ga}</td>
                          <td className="text-center py-3 px-3 font-mono text-floodlight">{s.gd > 0 ? "+" + s.gd : s.gd}</td>
                          <td className="text-center py-3 px-4 font-mono font-black text-floodlight">{s.points}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null;
        })()}

        {/* UCL-style VS Match Cards */}
        {matches.length > 0 && (() => {
          const roundOrder = ["ROUND_OF_32", "ROUND_OF_16", "QUARTER_FINAL", "SEMI_FINAL", "FINAL"];
          const roundLabels: Record<string, string> = {
            ROUND_OF_32: "Round of 32",
            ROUND_OF_16: "Round of 16",
            QUARTER_FINAL: "Quarter-Finals",
            SEMI_FINAL: "Semi-Finals",
            FINAL: "Final",
          };
          const grouped: Record<string, any[]> = {};
          matches.forEach((m: any) => {
            if (!grouped[m.round]) grouped[m.round] = [];
            grouped[m.round].push(m);
          });
          // Filter out GROUP_STAGE — those are shown in group tables above
          const activeRounds = roundOrder.filter(r => r !== "GROUP_STAGE" && grouped[r]?.length > 0);

          return (
            <div className="space-y-8">
              {activeRounds.map((round, ri) => {
                const roundMatches = (grouped[round] || []).sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0));
                return (
                  <div key={round}>
                    {/* Round header */}
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-xs font-mono font-bold text-club-accent uppercase tracking-widest">
                        {roundLabels[round] || round.replace(/_/g, " ")}
                      </span>
                      <span className="h-px flex-1 bg-line/40" />
                      <span className="text-[10px] font-mono text-mist">
                        {roundMatches.filter((m: any) => m.status === "COMPLETED").length}/{roundMatches.length} played
                      </span>
                    </div>

                    {/* Match cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {roundMatches.map((m: any, mi: number) => {
                        const homeTeam = typeof m.homeTeam === "object" ? m.homeTeam : null;
                        const awayTeam = typeof m.awayTeam === "object" ? m.awayTeam : null;
                        const homeName = homeTeam?.name || "TBD";
                        const awayName = awayTeam?.name || "TBD";
                        const homeLogo = homeTeam?.logo || "";
                        const awayLogo = awayTeam?.logo || "";
                        const isCompleted = m.status === "COMPLETED";
                        const isLive = m.status === "LIVE";
                        const isScheduled = m.status === "SCHEDULED";
                        const isPending = m.status === "PENDING";
                        const isHomeWin = isCompleted && m.winner === "HOME";
                        const isAwayWin = isCompleted && m.winner === "AWAY";

                        return (
                          <div
                            key={m._id || mi}
                            className={cn(
                              "bg-surface rounded-2xl border overflow-hidden transition-all",
                              isCompleted ? "border-emerald-500/30" :
                              isLive ? "border-red-500/50 shadow-lg shadow-red-500/10" :
                              "border-line/40"
                            )}
                          >
                            {/* Match status bar */}
                            <div className={cn(
                              "flex items-center justify-between px-4 py-2",
                              isCompleted ? "bg-emerald-500/5 border-b border-emerald-500/10" :
                              isLive ? "bg-red-500/5 border-b border-red-500/10" :
                              "bg-surface-raised/30 border-b border-line/20"
                            )}>
                              <span className="text-[10px] font-mono text-mist">
                                {m.matchDate ? new Date(m.matchDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "TBD"}
                              </span>
                              {isLive ? (
                                <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-red-500">
                                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                                  LIVE
                                </span>
                              ) : isCompleted ? (
                                <span className="text-[10px] font-mono text-emerald-600 font-bold">FT</span>
                              ) : isScheduled ? (
                                <span className="text-[10px] font-mono text-mist/60">UPCOMING</span>
                              ) : null}
                            </div>

                            {/* Teams & Score */}
                            <div className="px-4 py-4">
                              <div className="flex items-center gap-4">
                                {/* Home */}
                                <div className="flex-1 text-right">
                                  <div className="flex items-center justify-end gap-3">
                                    <span className={cn(
                                      "text-sm font-bold",
                                      isHomeWin ? "text-floodlight" : "text-mist"
                                    )}>{homeName}</span>
                                    {homeLogo ? (
                                      <img src={homeLogo} alt="" className="w-10 h-10 rounded-full object-contain border border-line/30" />
                                    ) : (
                                      <div className="w-10 h-10 rounded-full bg-surface-raised border border-line/30 flex items-center justify-center">
                                        <span className="text-xs font-bold text-line">{homeName?.charAt(0)}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Score / VS */}
                                <div className="flex flex-col items-center shrink-0">
                                  {isCompleted ? (
                                    <div className="flex items-center gap-2">
                                      <span className={cn("text-2xl font-black font-mono", isHomeWin ? "text-floodlight" : "text-mist/60")}>{m.homeScore ?? 0}</span>
                                      <span className="text-lg text-line/30 font-light">-</span>
                                      <span className={cn("text-2xl font-black font-mono", isAwayWin ? "text-floodlight" : "text-mist/60")}>{m.awayScore ?? 0}</span>
                                    </div>
                                  ) : (
                                    <span className="text-lg font-bold text-line/30">VS</span>
                                  )}
                                </div>

                                {/* Away */}
                                <div className="flex-1 text-left">
                                  <div className="flex items-center gap-3">
                                    {awayLogo ? (
                                      <img src={awayLogo} alt="" className="w-10 h-10 rounded-full object-contain border border-line/30" />
                                    ) : (
                                      <div className="w-10 h-10 rounded-full bg-surface-raised border border-line/30 flex items-center justify-center">
                                        <span className="text-xs font-bold text-line">{awayName?.charAt(0)}</span>
                                      </div>
                                    )}
                                    <span className={cn(
                                      "text-sm font-bold",
                                      isAwayWin ? "text-floodlight" : "text-mist"
                                    )}>{awayName}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}

        {/* Teams — filter out null padding (tournaments pad to power-of-2) */}
        {(selected as any).teams && (selected as any).teams.some((t: any) => t && t !== null) && (
          <div className="mt-8">
            <h2 className="text-sm font-bold text-floodlight uppercase tracking-wider mb-4">Participating Teams</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {(selected as any).teams.filter((t: any) => t && typeof t === "object").map((team: any, i: number) => (
                <div key={i} className="flex items-center gap-3 bg-surface rounded-xl border border-line/40 px-4 py-3">
                  {team.logo ? (
                    <img src={team.logo} alt="" className="w-8 h-8 rounded-full object-cover border border-line" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-surface-raised border border-line flex items-center justify-center">
                      <span className="text-xs font-bold text-line">{team.name?.charAt(0)}</span>
                    </div>
                  )}
                  <span className="text-sm font-medium text-floodlight truncate">{team.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Champion banner */}
        {(selected as any).champion && (
          <div className="mt-8 flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl px-6 py-4">
            <Trophy className="h-8 w-8 text-amber-400" />
            <div>
              <p className="text-xs text-mist uppercase tracking-wider">Champion</p>
              <p className="text-lg font-bold text-amber-400">
                {typeof (selected as any).champion === "object"
                  ? (selected as any).champion.name
                  : "TBD"}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── List View ──
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight" style={{ color: "#FF6B4A" }}>
          <span className="text-black">Competitions</span>
        </h1>
        <p className="text-text-secondary mt-3 text-lg max-w-xl">
          Tournaments, leagues, and cups our club competes in.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-8 overflow-x-auto pb-2">
        {[
          { value: "all", label: "All" },
          { value: "LEAGUE", label: "Leagues" },
          { value: "CUP", label: "Cups" },
          { value: "TOURNAMENT", label: "Tournaments" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value as any)}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors",
              activeTab === tab.value
                ? "bg-club-accent text-white"
                : "text-mist hover:text-floodlight hover:bg-surface-raised"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Competitions grid */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <Trophy className="h-12 w-12 text-line/30 mx-auto mb-4" />
          <p className="text-mist font-mono">No competitions found</p>
          <p className="text-sm text-mist/60 mt-1">Check back later for updates.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((comp) => (
            <CompetitionCard
              key={comp._id}
              competition={comp}
              onSelect={() => openDetail(comp)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
