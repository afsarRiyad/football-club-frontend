"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Player, Statistic, StatisticType } from "@/types";
import { cn } from "@/lib/utils";

interface PlayerTooltipProps {
  player: Player | null;
  statistics: Statistic[];
  visible: boolean;
}

/* ── Aggregate stats for a player ── */
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

/* ── Position-specific stat display ── */
function getStatDisplay(player: Player, position: string) {
  if (position === "GOALKEEPER") {
    return [
      { label: "DIV", value: player.pac ?? 50 },
      { label: "HND", value: player.sho ?? 50 },
      { label: "REF", value: player.dri ?? 50 },
    ];
  }
  return [
    { label: "PAC", value: player.pac ?? 50 },
    { label: "SHO", value: player.sho ?? 50 },
    { label: "PAS", value: player.pas ?? 50 },
    { label: "DRI", value: player.dri ?? 50 },
    { label: "DEF", value: player.def ?? 50 },
    { label: "PHY", value: player.phy ?? 50 },
  ];
}

function getPositionColor(position: string): string {
  switch (position) {
    case "GOALKEEPER": return "from-amber-500/90 to-yellow-600/90";
    case "DEFENDER": return "from-emerald-500/90 to-teal-600/90";
    case "MIDFIELDER": return "from-blue-500/90 to-indigo-600/90";
    case "FORWARD": return "from-rose-500/90 to-red-600/90";
    default: return "from-gray-500/90 to-gray-600/90";
  }
}

export default function PlayerTooltip({ player, statistics, visible }: PlayerTooltipProps) {
  if (!player) return null;

  const stats = aggregateStats(statistics, player._id);
  const statDisplay = getStatDisplay(player, player.position);
  const posColor = getPositionColor(player.position);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.95 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "absolute z-50 pointer-events-none",
            "w-52 rounded-xl overflow-hidden",
            "bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a]",
            "border border-white/15 shadow-2xl",
            "backdrop-blur-xl"
          )}
          style={{
            left: "50%",
            transform: "translateX(-50%)",
            bottom: "calc(100% + 12px)",
          }}
        >
          {/* Top accent bar */}
          <div className={cn("h-1 w-full bg-gradient-to-r", posColor)} />

          {/* Player info */}
          <div className="p-3">
            {/* Name + Number */}
            <div className="flex items-center gap-2 mb-2">
              {player.photo ? (
                <img
                  src={player.photo}
                  alt={`${player.firstName} ${player.lastName}`}
                  className="w-8 h-8 rounded-full object-cover border border-white/20"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                  <span className="text-xs font-bold text-white">
                    {player.firstName?.charAt(0)}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate leading-tight">
                  {player.firstName} {player.lastName}
                </p>
                <div className="flex items-center gap-1.5">
                  {player.number && (
                    <span className="text-[9px] font-mono text-white/50">#{player.number}</span>
                  )}
                  <span className="text-[9px] font-mono text-white/40 uppercase">
                    {player.position === "GOALKEEPER" ? "GK" :
                     player.position === "DEFENDER" ? "DEF" :
                     player.position === "MIDFIELDER" ? "MID" : "FWD"}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="flex items-center justify-between gap-1 pt-2 border-t border-white/10">
              {statDisplay.map((stat) => (
                <div key={stat.label} className="flex-1 text-center">
                  <p className="text-sm font-bold text-white font-mono tabular-nums">
                    {stat.value}
                  </p>
                  <p className="text-[8px] text-white/40 uppercase tracking-wider font-mono">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Cards (if any) */}
            {(stats.yellowCards > 0 || stats.redCards > 0) && (
              <div className="flex items-center justify-center gap-1.5 mt-2 pt-2 border-t border-white/10">
                {stats.yellowCards > 0 && (
                  <div className="flex items-center gap-0.5">
                    <span className="w-2 h-2.5 rounded-sm bg-yellow-400" />
                    <span className="text-[9px] text-white/50 font-mono">{stats.yellowCards}</span>
                  </div>
                )}
                {stats.redCards > 0 && (
                  <div className="flex items-center gap-0.5">
                    <span className="w-2 h-2.5 rounded-sm bg-red-500" />
                    <span className="text-[9px] text-white/50 font-mono">{stats.redCards}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tooltip arrow */}
          <div
            className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-[#0f0f1a] border-r border-b border-white/15"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
