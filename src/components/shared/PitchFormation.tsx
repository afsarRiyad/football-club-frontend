"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Player, Formation, Statistic } from "@/types";
import { cn } from "@/lib/utils";
import CaptainArmband from "./CaptainArmband";
import PlayerTooltip from "./PlayerTooltip";

/* ── Position-to-role mapping logic ── */
function positionForSlot(role: string, player?: Player): string {
  if (!player) return role;
  const pos = player.position;
  if (pos === "GOALKEEPER") return "GK";
  if (pos === "DEFENDER") {
    if (role.startsWith("CB")) return "CB";
    if (role === "LWB" || role === "LB") return "LB";
    if (role === "RWB" || role === "RB") return "RB";
    return role;
  }
  if (pos === "MIDFIELDER") {
    if (role === "ST" || role === "LW" || role === "RW") return "CM";
    if (role === "CDM") return "CM";
    return role;
  }
  if (pos === "FORWARD") {
    if (role === "CM" || role === "CDM") return "ST";
    return role;
  }
  return role;
}

/* ── Spring config for position morphing ── */
const morphTransition = {
  type: "spring" as const,
  stiffness: 120,
  damping: 20,
  mass: 0.8,
};

interface PitchFormationProps {
  // Slot-aligned: index i corresponds to formation.slots[i]; may contain holes
  // (undefined) for slots with no player.
  starters: (Player | undefined)[];
  formation: Formation;
  statistics?: Statistic[];
  captainId?: string | null;
  viceCaptainId?: string | null;
  matchDayMode?: boolean;
  onSelectPlayer: (player: Player) => void;
}

export default function PitchFormation({
  starters,
  formation,
  statistics = [],
  captainId,
  viceCaptainId,
  matchDayMode = false,
  onSelectPlayer,
}: PitchFormationProps) {
  const slots = formation.slots;
  const [hoveredPlayer, setHoveredPlayer] = useState<string | null>(null);

  return (
    <div className="relative w-full max-w-2xl mx-auto card-perspective">
      {/* ── Outer wrapper — overflow visible so tooltips show ── */}
      <div className="relative">
        {/* ── Pitch background — overflow hidden for rounded corners ── */}
        <div className={cn(
          "relative aspect-[68/105] rounded-2xl overflow-hidden border",
          matchDayMode ? "border-card-gold/40 shadow-[0_0_30px_rgba(212,162,76,0.15)]" : "border-line/40"
        )}>
          {/* Gradient pitch surface */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a6b3a] via-[#1d7a40] to-[#1a6b3a]" />

          {/* Match Day ambient glow overlay */}
          {matchDayMode && (
            <div className="absolute inset-0 bg-gradient-to-t from-card-gold/5 via-transparent to-card-gold/5 pointer-events-none" />
          )}

          {/* Pitch lines SVG */}
          <svg
            viewBox="0 0 680 1050"
            className="absolute inset-0 w-full h-full"
            fill="none"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="3"
          >
            <rect x="30" y="30" width="620" height="990" rx="4" />
            <line x1="30" y1="525" x2="650" y2="525" />
            <circle cx="340" cy="525" r="91.5" />
            <circle cx="340" cy="525" r="5" fill="rgba(255,255,255,0.25)" />
            <rect x="170" y="30" width="340" height="165" />
            <rect x="230" y="30" width="220" height="55" />
            <circle cx="340" cy="148" r="5" fill="rgba(255,255,255,0.25)" />
            <path d="M 270 195 A 91.5 91.5 0 0 0 410 195" />
            <rect x="170" y="855" width="340" height="165" />
            <rect x="230" y="965" width="220" height="55" />
            <circle cx="340" cy="902" r="5" fill="rgba(255,255,255,0.25)" />
            <path d="M 270 855 A 91.5 91.5 0 0 1 410 855" />
            <path d="M 30 42 A 12 12 0 0 0 42 30" />
            <path d="M 638 30 A 12 12 0 0 0 650 42" />
            <path d="M 30 1008 A 12 12 0 0 1 42 1020" />
            <path d="M 638 1020 A 12 12 0 0 1 650 1008" />
          </svg>

          {/* Grass stripes */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <div
              key={i}
              className={cn("absolute left-0 right-0", i % 2 === 0 ? "bg-white/[0.03]" : "")}
              style={{ top: `${i * 10}%`, height: "10%" }}
            />
          ))}
        </div>

        {/* ── Player slots — rendered OUTSIDE the overflow-hidden container ── */}
        {slots.map((slot, i) => {
          const player = starters[i];
          const displayRole = positionForSlot(slot.role, player);
          const isCaptain = captainId && player?._id === captainId;
          const isViceCaptain = viceCaptainId && player?._id === viceCaptainId;
          const isHovered = hoveredPlayer === player?._id;

          return (
            <motion.button
              key={`slot-${i}`}
              initial={{ opacity: 0, scale: 0.3, left: `${slot.x}%`, top: `${slot.y}%` }}
              animate={{ opacity: 1, scale: 1, left: `${slot.x}%`, top: `${slot.y}%` }}
              transition={morphTransition}
              onClick={() => player && onSelectPlayer(player)}
              onMouseEnter={() => player && setHoveredPlayer(player._id)}
              onMouseLeave={() => setHoveredPlayer(null)}
              className={cn(
                "absolute -translate-x-1/2 -translate-y-1/2 group z-20",
                "hover:scale-110 hover:z-30",
                "animate-slot-pulse",
                !player && "opacity-40"
              )}
            >
              {/* Tooltip — can now overflow the pitch */}
              {player && (
                <PlayerTooltip
                  player={player}
                  statistics={statistics}
                  visible={isHovered}
                />
              )}

              {/* Player circle */}
              <div className="relative flex flex-col items-center">
                {/* Captain armband */}
                {isCaptain && (
                  <motion.div
                    className="absolute -top-2 -right-2 z-20"
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: i * 0.08 + 0.6, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <CaptainArmband size="sm" />
                  </motion.div>
                )}

                {/* Vice-captain indicator */}
                {isViceCaptain && !isCaptain && (
                  <motion.div
                    className="absolute -top-1 -right-1 z-20"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.08 + 0.6, duration: 0.3 }}
                  >
                    <div className="w-4 h-4 rounded-full bg-silver border border-white/30 flex items-center justify-center">
                      <span className="text-[7px] font-bold text-gray-700">V</span>
                    </div>
                  </motion.div>
                )}

                <div
                  className={cn(
                    "w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden border-2 transition-all duration-300",
                    "bg-club-primary shadow-lg",
                    isCaptain
                      ? "border-card-gold shadow-[0_0_12px_rgba(212,162,76,0.4)]"
                      : "border-white/30",
                    "group-hover:border-pitch-accent group-hover:shadow-[0_0_20px_rgba(255,107,74,0.4)]",
                    player?.photo && !isCaptain && "border-white/40",
                    matchDayMode && !isCaptain && "ring-1 ring-card-gold/20"
                  )}
                >
                  {player?.photo ? (
                    <img
                      src={player.photo}
                      alt={`${player.firstName} ${player.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-club-primary">
                      <span className="text-white font-bold text-sm font-display">
                        {player ? player.firstName?.charAt(0) : "?"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Name label */}
                <div className="mt-1 bg-black/60 backdrop-blur-sm rounded px-1.5 py-0.5 text-center max-w-[80px]">
                  <p className="text-[10px] md:text-xs font-bold text-white truncate leading-tight">
                    {player ? `${player.firstName?.charAt(0)}. ${player.lastName}` : displayRole}
                  </p>
                  {player?.number && (
                    <p className="text-[8px] md:text-[9px] text-white/60 font-mono">
                      #{player.number}
                    </p>
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
