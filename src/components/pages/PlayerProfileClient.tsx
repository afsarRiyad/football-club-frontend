"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, Ruler, Weight, Shirt, MapPin, Footprints, Trophy, TrendingUp, BarChart3 } from "lucide-react";
import Image from "next/image";
import api from "@/lib/api";
import { Player, Statistic, StatisticType } from "@/types";
import { PageSpinner } from "@/components/ui";
import { cn, CLUB_TIME_ZONE } from "@/lib/utils";

const positionFull: Record<string, string> = {
  GOALKEEPER: "Goalkeeper",
  DEFENDER: "Defender",
  MIDFIELDER: "Midfielder",
  FORWARD: "Forward",
};

const positionShort: Record<string, string> = {
  GOALKEEPER: "GK",
  DEFENDER: "DEF",
  MIDFIELDER: "MID",
  FORWARD: "FWD",
};

const positionAccent: Record<string, string> = {
  GOALKEEPER: "text-card-gold",
  DEFENDER: "text-pitch-accent",
  MIDFIELDER: "text-floodlight",
  FORWARD: "text-alert-red",
};

const positionBg: Record<string, string> = {
  GOALKEEPER: "from-card-gold/20 to-card-gold/5",
  DEFENDER: "from-pitch-accent/20 to-pitch-accent/5",
  MIDFIELDER: "from-floodlight/20 to-floodlight/5",
  FORWARD: "from-alert-red/20 to-alert-red/5",
};

function calcOVR(player: Player): number {
  const { pac = 50, sho = 50, pas = 50, dri = 50, def = 50, phy = 50 } = player;
  return Math.round((pac + sho + pas + dri + def + phy) / 6);
}

function getStatColor(val: number): string {
  if (val >= 85) return "text-amber-400";
  if (val >= 75) return "text-emerald-400";
  if (val >= 65) return "text-blue-400";
  if (val >= 50) return "text-mist";
  return "text-mist/70";
}

function getBarColor(val: number): string {
  if (val >= 85) return "bg-amber-400";
  if (val >= 75) return "bg-emerald-400";
  if (val >= 65) return "bg-blue-400";
  if (val >= 50) return "bg-mist";
  return "bg-mist/80";
}

function aggregateStats(stats: Statistic[], playerId: string) {
  const playerStats = stats.filter((s) => {
    const pid = typeof s.player === "string" ? s.player : s.player?._id;
    return pid === playerId;
  });
  const get = (type: StatisticType) =>
    playerStats.filter((s) => s.type === type).reduce((sum, s) => sum + s.value, 0);
  return {
    goals: get("GOALS"),
    assists: get("ASSISTS"),
    appearances: get("APPEARANCES"),
    minutesPlayed: get("MINUTES_PLAYED"),
    cleanSheets: get("CLEAN_SHEETS"),
    yellowCards: get("YELLOW_CARDS"),
    redCards: get("RED_CARDS"),
  };
}

function aggregateStatsBySeason(stats: Statistic[], playerId: string) {
  const playerStats = stats.filter((s) => {
    const pid = typeof s.player === "string" ? s.player : s.player?._id;
    return pid === playerId;
  });

  const seasonMap = new Map<string, Statistic[]>();
  for (const s of playerStats) {
    const seasonKey = s.season || "all-time";
    if (!seasonMap.has(seasonKey)) seasonMap.set(seasonKey, []);
    seasonMap.get(seasonKey)!.push(s);
  }

  const results: { seasonId: string; seasonLabel: string; stats: ReturnType<typeof aggregateStats> }[] = [];

  for (const [seasonId, seasonStats] of seasonMap) {
    const get = (type: StatisticType) =>
      seasonStats.filter((s) => s.type === type).reduce((sum, s) => sum + s.value, 0);
    results.push({
      seasonId,
      seasonLabel: seasonId === "all-time" ? "All Time" : seasonId,
      stats: {
        goals: get("GOALS"),
        assists: get("ASSISTS"),
        appearances: get("APPEARANCES"),
        minutesPlayed: get("MINUTES_PLAYED"),
        cleanSheets: get("CLEAN_SHEETS"),
        yellowCards: get("YELLOW_CARDS"),
        redCards: get("RED_CARDS"),
      },
    });
  }

  return results;
}

export default function PlayerProfileClient({
  id,
  player: initialPlayer,
  statistics: initialStatistics,
}: {
  id: string;
  player: Player | null;
  statistics: Statistic[];
}) {
  const [player, setPlayer] = useState<Player | null>(initialPlayer);
  const [statistics, setStatistics] = useState<Statistic[]>(initialStatistics);

  /* The server already rendered the profile, so the player's name, position,
     attributes and statistics are in the initial HTML for crawlers. */
  const [loading, setLoading] = useState(!initialPlayer);

  useEffect(() => {
    if (initialPlayer) return;
    fetchPlayer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchPlayer = async () => {
    setLoading(true);
    try {
      const [playerRes, statsRes] = await Promise.allSettled([
        api.get(`/players/${id}`),
        api.get("/statistics", { params: { limit: 500 } }),
      ]);

      if (playerRes.status === "fulfilled") {
        setPlayer(playerRes.value.data.data?.player || playerRes.value.data.data);
      }
      if (statsRes.status === "fulfilled") {
        setStatistics(statsRes.value.data.data || []);
      }
    } catch (e) {
      console.error("Failed to fetch player:", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageSpinner />;

  if (!player) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-mist">Player not found</p>
      </div>
    );
  }

  const name = `${player.firstName} ${player.lastName}`;
  const age = player.dateOfBirth
    ? Math.max(0, Math.floor((Date.now() - new Date(player.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)))
    : null;
  const ovr = calcOVR(player);
  const career = aggregateStats(statistics, player._id);
  const seasonBreakdown = aggregateStatsBySeason(statistics, player._id);
  const pos = player.position;

  // Season field is a plain string like "2025/26", use it directly
  // Separate "all-time" (no season set) from named seasons, sort descending
  const namedSeasons = seasonBreakdown
    .filter((s) => s.seasonId !== "all-time")
    .sort((a, b) => b.seasonLabel.localeCompare(a.seasonLabel));
  const hasSeasonData = namedSeasons.length > 0;

  const faceStats = pos === "GOALKEEPER"
    ? [
        { label: "DIV", value: player.pac ?? 50 },
        { label: "HND", value: player.sho ?? 50 },
        { label: "KIC", value: player.pas ?? 50 },
        { label: "REF", value: player.dri ?? 50 },
        { label: "SPD", value: player.def ?? 50 },
        { label: "POS", value: player.phy ?? 50 },
      ]
    : [
        { label: "PAC", value: player.pac ?? 50 },
        { label: "SHO", value: player.sho ?? 50 },
        { label: "PAS", value: player.pas ?? 50 },
        { label: "DRI", value: player.dri ?? 50 },
        { label: "DEF", value: player.def ?? 50 },
        { label: "PHY", value: player.phy ?? 50 },
      ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        href="/squad"
        className="inline-flex items-center gap-1.5 text-mist hover:text-floodlight text-sm mb-8 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to squad
      </Link>

      <div className="grid md:grid-cols-5 gap-8 md:gap-12">
        {/* Photo — 3 columns */}
        <div className="md:col-span-3">
          <div className={cn("relative aspect-[4/5] rounded-2xl overflow-hidden bg-gradient-to-b", positionBg[pos])}>
            {player.photo ? (
              <Image
                src={player.photo}
                alt={name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 60vw, 60vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-8xl font-bold text-line/20 font-display">
                  {player.firstName?.charAt(0)}
                </span>
              </div>
            )}

            {/* OVR badge */}
            <div className="absolute top-4 left-4">
              <div className={cn(
                "w-14 h-14 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/20",
                ovr >= 85 ? "bg-gradient-to-br from-amber-400/80 to-yellow-500/80" :
                ovr >= 75 ? "bg-gradient-to-br from-emerald-400/80 to-emerald-500/80" :
                "bg-gradient-to-br from-white/20 to-white/10"
              )}>
                <span className="text-2xl font-black text-white font-display drop-shadow-lg">{ovr}</span>
              </div>
            </div>

            {/* Jersey number */}
            {player.number && (
              <span className="absolute bottom-4 right-4 text-6xl font-mono font-bold text-white/30 tabular-nums drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)]">
                {String(player.number).padStart(2, "0")}
              </span>
            )}

            {/* Position badge */}
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 rounded-lg bg-black/40 backdrop-blur-sm text-white font-mono font-bold text-sm border border-white/10">
                {positionShort[pos]}
              </span>
            </div>
          </div>
        </div>

        {/* Info — 2 columns */}
        <div className="md:col-span-2">
          <div className="sticky top-24 space-y-6">
            {/* Name + Position */}
            <div>
              {player.number && (
                <span className="block mb-1 text-6xl font-black font-mono text-floodlight/60 tabular-nums leading-none select-none">
                  #{player.number}
                </span>
              )}
              <h1 className="text-3xl md:text-4xl font-bold text-floodlight font-display tracking-tight leading-tight">
                {player.firstName}
              </h1>
              <h1 className="text-3xl md:text-4xl font-bold text-floodlight font-display tracking-tight leading-tight">
                {player.lastName}
              </h1>
              <p className={cn("text-lg font-medium mt-1", positionAccent[pos])}>
                {positionFull[pos]}
              </p>
            </div>

            {/* FIFA Stats */}
            <div className="bg-surface rounded-xl border border-line/40 p-4">
              <p className="text-[10px] font-mono text-mist uppercase tracking-widest mb-3">Player Attributes</p>
              <div className="grid grid-cols-6 gap-2">
                {faceStats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className={cn("text-xl font-black font-mono leading-none", getStatColor(stat.value))}>
                      {stat.value}
                    </p>
                    <p className="text-[9px] text-mist font-mono uppercase mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
              {/* Stat bars */}
              <div className="mt-4 space-y-2.5">
                {faceStats.map((stat) => (
                  <div key={stat.label} className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-mist w-7">{stat.label}</span>
                    <div className="flex-1 h-2 bg-line/60 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all", getBarColor(stat.value))}
                        style={{ width: `${Math.max(stat.value, 4)}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-floodlight w-5 text-right">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bio */}
            {player.bio && (
              <p className="text-sm text-mist leading-relaxed">{player.bio}</p>
            )}

            {/* Info rows */}
            <div className="space-y-3">
              {player.nationality && (
                <div className="flex justify-between items-center border-b border-line/30 pb-2.5">
                  <span className="flex items-center gap-2 text-sm text-mist">
                    <MapPin className="h-3.5 w-3.5" /> Nationality
                  </span>
                  <span className="text-sm text-floodlight font-medium">{player.nationality}</span>
                </div>
              )}
              {age && (
                <div className="flex justify-between items-center border-b border-line/30 pb-2.5">
                  <span className="flex items-center gap-2 text-sm text-mist">
                    <Calendar className="h-3.5 w-3.5" /> Age
                  </span>
                  <span className="text-sm text-floodlight font-mono">{age}</span>
                </div>
              )}
              {player.height && (
                <div className="flex justify-between items-center border-b border-line/30 pb-2.5">
                  <span className="flex items-center gap-2 text-sm text-mist">
                    <Ruler className="h-3.5 w-3.5" /> Height
                  </span>
                  <span className="text-sm text-floodlight font-mono">{player.height} cm</span>
                </div>
              )}
              {player.weight && (
                <div className="flex justify-between items-center border-b border-line/30 pb-2.5">
                  <span className="flex items-center gap-2 text-sm text-mist">
                    <Weight className="h-3.5 w-3.5" /> Weight
                  </span>
                  <span className="text-sm text-floodlight font-mono">{player.weight} kg</span>
                </div>
              )}
              {player.preferredFoot && (
                <div className="flex justify-between items-center border-b border-line/30 pb-2.5">
                  <span className="flex items-center gap-2 text-sm text-mist">
                    <Footprints className="h-3.5 w-3.5" /> Preferred Foot
                  </span>
                  <span className="text-sm text-floodlight font-mono">{player.preferredFoot}</span>
                </div>
              )}
              {player.dateOfBirth && (
                <div className="flex justify-between items-center border-b border-line/30 pb-2.5">
                  <span className="text-sm text-mist">Born</span>
                  <span className="text-sm text-floodlight font-mono">
                    {new Date(player.dateOfBirth).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      timeZone: CLUB_TIME_ZONE,
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Career Statistics Section */}
      <div className="mt-12">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-sm font-mono font-bold text-club-accent uppercase tracking-widest">
            Career Statistics
          </span>
          <span className="h-px flex-1 bg-line" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { label: "Appearances", value: career.appearances, color: "text-floodlight" },
            { label: "Goals", value: career.goals, color: "text-pitch-accent" },
            { label: "Assists", value: career.assists, color: "text-floodlight" },
            { label: "Minutes", value: career.minutesPlayed, color: "text-mist" },
            ...(pos === "GOALKEEPER"
              ? [{ label: "Clean Sheets", value: career.cleanSheets, color: "text-card-gold" }]
              : []),
            { label: "Yellow Cards", value: career.yellowCards, color: "text-yellow-400" },
            { label: "Red Cards", value: career.redCards, color: "text-red-400" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-surface rounded-xl border border-line/30 p-4 text-center"
            >
              <p className={cn("text-2xl font-black font-mono", stat.color)}>
                {stat.value}
              </p>
              <p className="text-[10px] text-mist font-mono uppercase mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Season-by-Season Breakdown */}
      {hasSeasonData && (
        <div className="mt-12">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="h-4 w-4 text-club-gold" />
            <span className="text-sm font-mono font-bold text-club-accent uppercase tracking-widest">
              Season by Season
            </span>
            <span className="h-px flex-1 bg-line" />
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line/40">
                  <th className="text-left py-3 px-3 text-[10px] font-mono font-bold text-mist uppercase tracking-wider">Season</th>
                  <th className="text-center py-3 px-2 text-[10px] font-mono font-bold text-mist uppercase tracking-wider">Apps</th>
                  <th className="text-center py-3 px-2 text-[10px] font-mono font-bold text-pitch-accent uppercase tracking-wider">Goals</th>
                  <th className="text-center py-3 px-2 text-[10px] font-mono font-bold text-mist uppercase tracking-wider">Assists</th>
                  <th className="text-center py-3 px-2 text-[10px] font-mono font-bold text-mist uppercase tracking-wider">Minutes</th>
                  {pos === "GOALKEEPER" && (
                    <th className="text-center py-3 px-2 text-[10px] font-mono font-bold text-card-gold uppercase tracking-wider">CS</th>
                  )}
                  <th className="text-center py-3 px-2 text-[10px] font-mono font-bold text-yellow-400 uppercase tracking-wider">YC</th>
                  <th className="text-center py-3 px-2 text-[10px] font-mono font-bold text-red-400 uppercase tracking-wider">RC</th>
                  {pos !== "GOALKEEPER" && (
                    <th className="text-center py-3 px-2 text-[10px] font-mono font-bold text-mist uppercase tracking-wider">G+A</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {namedSeasons.map((row) => (
                  <tr key={row.seasonId} className="border-b border-line/20 hover:bg-surface/60 transition-colors">
                    <td className="py-3 px-3 text-floodlight font-medium">{row.seasonLabel}</td>
                    <td className="py-3 px-2 text-center font-mono text-floodlight">{row.stats.appearances || "-"}</td>
                    <td className="py-3 px-2 text-center font-mono font-bold text-pitch-accent">{row.stats.goals || "-"}</td>
                    <td className="py-3 px-2 text-center font-mono text-floodlight">{row.stats.assists || "-"}</td>
                    <td className="py-3 px-2 text-center font-mono text-mist">{row.stats.minutesPlayed || "-"}</td>
                    {pos === "GOALKEEPER" && (
                      <td className="py-3 px-2 text-center font-mono text-card-gold">{row.stats.cleanSheets || "-"}</td>
                    )}
                    <td className="py-3 px-2 text-center font-mono text-yellow-400">{row.stats.yellowCards || "-"}</td>
                    <td className="py-3 px-2 text-center font-mono text-red-400">{row.stats.redCards || "-"}</td>
                    {pos !== "GOALKEEPER" && (
                      <td className="py-3 px-2 text-center font-mono font-bold text-floodlight">{row.stats.goals + row.stats.assists || "-"}</td>
                    )}
                  </tr>
                ))}
                {/* Totals row */}
                <tr className="bg-surface/40">
                  <td className="py-3 px-3 text-floodlight font-bold font-display">Career Total</td>
                  <td className="py-3 px-2 text-center font-mono font-bold text-floodlight">{career.appearances || "-"}</td>
                  <td className="py-3 px-2 text-center font-mono font-bold text-pitch-accent">{career.goals || "-"}</td>
                  <td className="py-3 px-2 text-center font-mono font-bold text-floodlight">{career.assists || "-"}</td>
                  <td className="py-3 px-2 text-center font-mono font-bold text-mist">{career.minutesPlayed || "-"}</td>
                  {pos === "GOALKEEPER" && (
                    <td className="py-3 px-2 text-center font-mono font-bold text-card-gold">{career.cleanSheets || "-"}</td>
                  )}
                  <td className="py-3 px-2 text-center font-mono font-bold text-yellow-400">{career.yellowCards || "-"}</td>
                  <td className="py-3 px-2 text-center font-mono font-bold text-red-400">{career.redCards || "-"}</td>
                  {pos !== "GOALKEEPER" && (
                    <td className="py-3 px-2 text-center font-mono font-bold text-floodlight">{career.goals + career.assists || "-"}</td>
                  )}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {namedSeasons.map((row) => (
              <div key={row.seasonId} className="bg-surface rounded-xl border border-line/30 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-floodlight font-bold text-sm">{row.seasonLabel}</span>
                  {pos !== "GOALKEEPER" && (
                    <span className="text-xs font-mono text-pitch-accent font-bold">
                      {row.stats.goals + row.stats.assists} G+A
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div className="text-center">
                    <p className="text-lg font-black font-mono text-floodlight">{row.stats.appearances || "-"}</p>
                    <p className="text-[9px] text-mist font-mono uppercase">Apps</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-black font-mono text-pitch-accent">{row.stats.goals || "-"}</p>
                    <p className="text-[9px] text-mist font-mono uppercase">Goals</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-black font-mono text-floodlight">{row.stats.assists || "-"}</p>
                    <p className="text-[9px] text-mist font-mono uppercase">Assists</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-black font-mono text-mist">{row.stats.minutesPlayed || "-"}</p>
                    <p className="text-[9px] text-mist font-mono uppercase">Minutes</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Goals & Assists Bar Chart */}
          {(() => {
            const maxVal = Math.max(...namedSeasons.map((s) => Math.max(s.stats.goals, s.stats.assists, 1)), 1);
            return (
              <div className="mt-8">
                <div className="flex items-center gap-3 mb-4">
                  <BarChart3 className="h-4 w-4 text-club-accent" />
                  <span className="text-[10px] font-mono font-bold text-mist uppercase tracking-widest">
                    Goals vs Assists by Season
                  </span>
                  <span className="h-px flex-1 bg-line" />
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-club-accent" />
                    <span className="text-[10px] font-mono text-mist">Goals</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-pitch-green" />
                    <span className="text-[10px] font-mono text-mist">Assists</span>
                  </div>
                </div>

                {/* Chart */}
                <div className="bg-surface rounded-xl border border-line/30 p-4 sm:p-6">
                  <div className="flex items-end gap-3 sm:gap-5" style={{ height: 200 }}>
                    {namedSeasons.map((row) => {
                      const goalH = maxVal > 0 ? (row.stats.goals / maxVal) * 100 : 0;
                      const assistH = maxVal > 0 ? (row.stats.assists / maxVal) * 100 : 0;
                      return (
                        <div key={row.seasonId} className="flex-1 flex flex-col items-center justify-end h-full">
                          <div className="flex items-end gap-1 mb-1" style={{ minHeight: 24 }}>
                            <span className="text-[10px] font-mono font-bold text-club-accent w-5 text-center">
                              {row.stats.goals || ""}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-pitch-green w-5 text-center">
                              {row.stats.assists || ""}
                            </span>
                          </div>
                          <div className="flex items-end gap-1 w-full" style={{ height: 160 }}>
                            <div className="flex-1 h-full flex items-end justify-center">
                              <div
                                className="w-full max-w-[28px] rounded-t-md bg-club-accent transition-all duration-500"
                                style={{ height: `${Math.max(goalH, 2)}%` }}
                              />
                            </div>
                            <div className="flex-1 h-full flex items-end justify-center">
                              <div
                                className="w-full max-w-[28px] rounded-t-md bg-pitch-green transition-all duration-500"
                                style={{ height: `${Math.max(assistH, 2)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* Per-bar stat labels */}
                  <div className="flex gap-3 sm:gap-5 mt-1.5">
                    {namedSeasons.map((row) => (
                      <div key={`${row.seasonId}-bar-labels`} className="flex-1 flex gap-1">
                        <span className="flex-1 text-center text-[9px] font-mono font-bold text-club-accent">G</span>
                        <span className="flex-1 text-center text-[9px] font-mono font-bold text-pitch-green">A</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 sm:gap-5 mt-3">
                    {namedSeasons.map((row) => (
                      <div key={row.seasonId} className="flex-1 text-center">
                        <span className="text-[9px] sm:text-[10px] font-mono text-mist truncate block">
                          {row.seasonLabel}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Appearances & Minutes Bar Chart */}
          {(() => {
            const maxApps = Math.max(...namedSeasons.map((s) => s.stats.appearances || 0), 1);
            const maxMins = Math.max(...namedSeasons.map((s) => s.stats.minutesPlayed || 0), 1);
            return (
              <div className="mt-8">
                <div className="flex items-center gap-3 mb-4">
                  <BarChart3 className="h-4 w-4 text-club-gold" />
                  <span className="text-[10px] font-mono font-bold text-mist uppercase tracking-widest">
                    Appearances & Minutes by Season
                  </span>
                  <span className="h-px flex-1 bg-line" />
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-blue-500" />
                    <span className="text-[10px] font-mono text-mist">Appearances</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-amber-400" />
                    <span className="text-[10px] font-mono text-mist">Minutes (÷10)</span>
                  </div>
                </div>

                {/* Chart */}
                <div className="bg-surface rounded-xl border border-line/30 p-4 sm:p-6">
                  <div className="flex items-end gap-3 sm:gap-5" style={{ height: 200 }}>
                    {namedSeasons.map((row) => {
                      const appsH = (row.stats.appearances / maxApps) * 100;
                      const minsH = (row.stats.minutesPlayed / 10 / maxApps) * 100;
                      return (
                        <div key={row.seasonId} className="flex-1 flex flex-col items-center justify-end h-full">
                          <div className="flex items-end gap-1 mb-1" style={{ minHeight: 24 }}>
                            <span className="text-[10px] font-mono font-bold text-blue-500 w-5 text-center">
                              {row.stats.appearances || ""}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-amber-500 w-10 text-center">
                              {row.stats.minutesPlayed || ""}
                            </span>
                          </div>
                          <div className="flex items-end gap-1 w-full" style={{ height: 160 }}>
                            <div className="flex-1 h-full flex items-end justify-center">
                              <div
                                className="w-full max-w-[28px] rounded-t-md bg-blue-500 transition-all duration-500"
                                style={{ height: `${Math.max(appsH, 2)}%` }}
                              />
                            </div>
                            <div className="flex-1 h-full flex items-end justify-center">
                              <div
                                className="w-full max-w-[28px] rounded-t-md bg-amber-400 transition-all duration-500"
                                style={{ height: `${Math.max(minsH, 2)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* Per-bar stat labels */}
                  <div className="flex gap-3 sm:gap-5 mt-1.5">
                    {namedSeasons.map((row) => (
                      <div key={`${row.seasonId}-bar-labels`} className="flex-1 flex gap-1">
                        <span className="flex-1 text-center text-[9px] font-mono font-bold text-blue-500 truncate">Apps</span>
                        <span className="flex-1 text-center text-[9px] font-mono font-bold text-amber-500 truncate">Min</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 sm:gap-5 mt-3">
                    {namedSeasons.map((row) => (
                      <div key={row.seasonId} className="flex-1 text-center">
                        <span className="text-[9px] sm:text-[10px] font-mono text-mist truncate block">
                          {row.seasonLabel}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
