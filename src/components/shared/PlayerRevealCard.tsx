"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Calendar, Ruler, Weight, Target, HandMetal, Shirt, Clock, CircleDot, AlertTriangle } from "lucide-react";
import { Player, Statistic, StatisticType } from "@/types";
import { cn } from "@/lib/utils";

const positionLabel: Record<string, string> = {
  GOALKEEPER: "GK",
  DEFENDER: "DEF",
  MIDFIELDER: "MID",
  FORWARD: "FWD",
};

const positionColor: Record<string, string> = {
  GOALKEEPER: "from-amber-500 to-yellow-600",
  DEFENDER: "from-emerald-500 to-teal-600",
  MIDFIELDER: "from-blue-500 to-indigo-600",
  FORWARD: "from-rose-500 to-red-600",
};

const positionBg: Record<string, string> = {
  GOALKEEPER: "bg-amber-500/20 text-amber-400",
  DEFENDER: "bg-emerald-500/20 text-emerald-400",
  MIDFIELDER: "bg-blue-500/20 text-blue-400",
  FORWARD: "bg-rose-500/20 text-rose-400",
};

/* ── Compute real stats from API data ── */
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

/* ── Derive overall rating from real stats ── */
function computeRating(careerStats: ReturnType<typeof aggregateStats>, position: string): number {
  const { goals, assists, appearances, minutesPlayed, cleanSheets } = careerStats;
  if (appearances === 0 && minutesPlayed === 0) return 62; // default for no data

  const mins = minutesPlayed || appearances * 90;

  switch (position) {
    case "GOALKEEPER": {
      const base = 60 + Math.min(cleanSheets * 1.5, 20);
      const minutesBonus = Math.min(mins / 1000, 10);
      return Math.round(Math.min(base + minutesBonus, 95));
    }
    case "DEFENDER": {
      const base = 62 + Math.min(goals * 2, 8) + Math.min(assists * 1, 5);
      const minutesBonus = Math.min(mins / 1000, 12);
      return Math.round(Math.min(base + minutesBonus, 94));
    }
    case "MIDFIELDER": {
      const base = 60 + Math.min(goals * 1.2, 12) + Math.min(assists * 1.5, 12);
      const minutesBonus = Math.min(mins / 1000, 12);
      return Math.round(Math.min(base + minutesBonus, 96));
    }
    case "FORWARD": {
      const base = 58 + Math.min(goals * 1.8, 20) + Math.min(assists * 0.8, 8);
      const minutesBonus = Math.min(mins / 1000, 10);
      return Math.round(Math.min(base + minutesBonus, 97));
    }
    default:
      return 65;
  }
}

/* ── Position-based stat bars ── */
function getStatBars(careerStats: ReturnType<typeof aggregateStats>, position: string) {
  const { goals, assists, appearances, minutesPlayed, cleanSheets, yellowCards } = careerStats;
  const mins = minutesPlayed || appearances * 90;

  const clamp = (v: number, max: number) => Math.round(Math.min((v / max) * 100, 100));

  if (position === "GOALKEEPER") {
    return [
      { label: "APPS", value: clamp(appearances, 40), display: appearances },
      { label: "CLEAN", value: clamp(cleanSheets, 20), display: cleanSheets },
      { label: "MINS", value: clamp(mins, 3600), display: mins },
      { label: "YELLOWS", value: clamp(yellowCards, 10), display: yellowCards },
    ];
  }

  return [
    { label: "APPS", value: clamp(appearances, 40), display: appearances },
    { label: "GOALS", value: clamp(goals, 30), display: goals },
    { label: "ASSISTS", value: clamp(assists, 20), display: assists },
    { label: "MINS", value: clamp(mins, 3600), display: mins },
  ];
}

function getOverallColor(rating: number): string {
  if (rating >= 90) return "from-amber-400 to-yellow-500";
  if (rating >= 80) return "from-emerald-400 to-teal-500";
  if (rating >= 70) return "from-blue-400 to-indigo-500";
  return "from-slate-400 to-gray-500";
}

function getStatColor(pct: number): string {
  if (pct >= 80) return "from-amber-400 to-yellow-500";
  if (pct >= 60) return "from-emerald-400 to-teal-500";
  if (pct >= 40) return "from-blue-400 to-indigo-500";
  return "from-slate-400 to-gray-500";
}

function getAge(dob?: string): string {
  if (!dob) return "—";
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) age--;
  return `${age}`;
}

interface PlayerRevealCardProps {
  player: Player | null;
  statistics: Statistic[];
  onClose: () => void;
}

export default function PlayerRevealCard({ player, statistics, onClose }: PlayerRevealCardProps) {
  if (!player) return null;

  const careerStats = aggregateStats(statistics, player._id);
  const rating = computeRating(careerStats, player.position);
  const statBars = getStatBars(careerStats, player.position);
  const age = getAge(player.dateOfBirth);

  return (
    <AnimatePresence>
      {player && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md animate-card-overlay" />

          {/* Card */}
          <motion.div
            className={cn(
              "relative w-full max-w-sm animate-card-reveal",
              "rounded-3xl overflow-hidden",
              "bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a]",
              "border border-white/10",
              "shadow-2xl"
            )}
            onClick={(e) => e.stopPropagation()}
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Top accent stripe */}
            <div className={cn("h-1.5 w-full bg-gradient-to-r", positionColor[player.position])} />

            {/* Rating badge — top right */}
            <div className="absolute top-4 right-4 animate-rating-pop z-10">
              <div className={cn(
                "w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center",
                "shadow-lg border border-white/20",
                getOverallColor(rating)
              )}>
                <span className="text-2xl font-black text-white font-display leading-none">{rating}</span>
              </div>
            </div>

            {/* Player image */}
            <div className="relative h-72 overflow-hidden bg-gradient-to-b from-transparent to-[#0f0f1a]">
              {player.photo ? (
                <img
                  src={player.photo}
                  alt={`${player.firstName} ${player.lastName}`}
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-club-primary/40 to-transparent">
                  <span className="text-7xl font-bold text-white/10 font-display">
                    {player.firstName?.charAt(0)}
                  </span>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0f0f1a] to-transparent" />
            </div>

            {/* Player info */}
            <div className="relative px-6 pb-6 -mt-8">
              {/* Position badge */}
              <span className={cn(
                "inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2",
                positionBg[player.position]
              )}>
                {positionLabel[player.position]}
              </span>

              {/* Number + Name */}
              <div className="flex items-end gap-3 mb-4">
                {player.number && (
                  <span className="text-5xl font-black text-white/10 font-display leading-none animate-number-slam">
                    {player.number}
                  </span>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-white font-display leading-tight">
                    {player.firstName}
                  </h2>
                  <h2 className="text-2xl font-bold text-white/60 font-display leading-tight">
                    {player.lastName}
                  </h2>
                </div>
              </div>

              {/* Quick info pills */}
              <div className="flex gap-2 mb-5 flex-wrap">
                {player.nationality && (
                  <span className="flex items-center gap-1 text-xs text-white/50 bg-white/5 rounded-full px-2.5 py-1">
                    <MapPin className="h-3 w-3" /> {player.nationality}
                  </span>
                )}
                {player.dateOfBirth && (
                  <span className="flex items-center gap-1 text-xs text-white/50 bg-white/5 rounded-full px-2.5 py-1">
                    <Calendar className="h-3 w-3" /> Age {age}
                  </span>
                )}
                {player.height && (
                  <span className="flex items-center gap-1 text-xs text-white/50 bg-white/5 rounded-full px-2.5 py-1">
                    <Ruler className="h-3 w-3" /> {player.height}cm
                  </span>
                )}
                {player.weight && (
                  <span className="flex items-center gap-1 text-xs text-white/50 bg-white/5 rounded-full px-2.5 py-1">
                    <Weight className="h-3 w-3" /> {player.weight}kg
                  </span>
                )}
              </div>

              {/* Career stats from API */}
              <div className="mb-4">
                <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-2.5">Career Stats</p>
                <div className="space-y-2.5">
                  {statBars.map((stat, i) => (
                    <div key={stat.label} className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-white/40 w-12 text-right font-mono">
                        {stat.label}
                      </span>
                      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full animate-stat-fill bg-gradient-to-r", getStatColor(stat.value))}
                          style={{ width: `${stat.value}%`, animationDelay: `${0.5 + i * 0.08}s` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-white/70 w-8 text-left font-mono tabular-nums">
                        {stat.display}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary row */}
              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <div className="flex gap-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-white font-mono">{careerStats.appearances}</p>
                    <p className="text-[9px] text-white/30 uppercase">Apps</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-white font-mono">{careerStats.goals}</p>
                    <p className="text-[9px] text-white/30 uppercase">Goals</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-white font-mono">{careerStats.assists}</p>
                    <p className="text-[9px] text-white/30 uppercase">Assists</p>
                  </div>
                </div>
                {careerStats.yellowCards > 0 && (
                  <div className="flex gap-1.5 items-center">
                    <span className="w-2.5 h-3.5 rounded-sm bg-yellow-400" />
                    <span className="text-xs text-white/40 font-mono">{careerStats.yellowCards}</span>
                    {careerStats.redCards > 0 && (
                      <>
                        <span className="w-2.5 h-3.5 rounded-sm bg-red-500 ml-1" />
                        <span className="text-xs text-white/40 font-mono">{careerStats.redCards}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 left-4 p-2 rounded-full bg-black/40 backdrop-blur-sm text-white/60 hover:text-white hover:bg-black/60 transition-colors z-10"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
