"use client";

import React from "react";
import { Player } from "@/types";
import { cn } from "@/lib/utils";

/* ── 4-3-3 Formation Positions (% of pitch area) ── */
const formation433: { role: string; x: number; y: number }[] = [
  // GK
  { role: "GK",  x: 50, y: 90 },
  // DEF
  { role: "LB",  x: 15, y: 72 },
  { role: "CB",  x: 37, y: 75 },
  { role: "CB",  x: 63, y: 75 },
  { role: "RB",  x: 85, y: 72 },
  // MID
  { role: "CM",  x: 30, y: 52 },
  { role: "CM",  x: 50, y: 48 },
  { role: "CM",  x: 70, y: 52 },
  // FWD
  { role: "LW",  x: 18, y: 25 },
  { role: "ST",  x: 50, y: 20 },
  { role: "RW",  x: 82, y: 25 },
];

function positionForSlot(role: string, player?: Player): string {
  if (!player) return role;
  const pos = player.position;
  if (pos === "GOALKEEPER") return "GK";
  if (pos === "DEFENDER") return role.startsWith("C") ? "CB" : role;
  if (pos === "MIDFIELDER") return role === "ST" ? "CM" : role;
  if (pos === "FORWARD") return role === "CM" ? "ST" : role;
  return role;
}

interface PitchFormationProps {
  starters: Player[];   // exactly 11
  onSelectPlayer: (player: Player) => void;
}

export default function PitchFormation({ starters, onSelectPlayer }: PitchFormationProps) {
  return (
    <div className="relative w-full max-w-2xl mx-auto card-perspective">
      {/* Pitch SVG background */}
      <div className="relative aspect-[68/105] rounded-2xl overflow-hidden border border-line/40">
        {/* Gradient pitch surface */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a6b3a] via-[#1d7a40] to-[#1a6b3a]" />

        {/* Pitch lines SVG */}
        <svg
          viewBox="0 0 680 1050"
          className="absolute inset-0 w-full h-full"
          fill="none"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="3"
        >
          {/* Outer boundary */}
          <rect x="30" y="30" width="620" height="990" rx="4" />
          {/* Halfway line */}
          <line x1="30" y1="525" x2="650" y2="525" />
          {/* Center circle */}
          <circle cx="340" cy="525" r="91.5" />
          {/* Center spot */}
          <circle cx="340" cy="525" r="5" fill="rgba(255,255,255,0.25)" />
          {/* Top penalty area */}
          <rect x="170" y="30" width="340" height="165" />
          <rect x="230" y="30" width="220" height="55" />
          <circle cx="340" cy="148" r="5" fill="rgba(255,255,255,0.25)" />
          <path d="M 270 195 A 91.5 91.5 0 0 0 410 195" />
          {/* Bottom penalty area */}
          <rect x="170" y="855" width="340" height="165" />
          <rect x="230" y="965" width="220" height="55" />
          <circle cx="340" cy="902" r="5" fill="rgba(255,255,255,0.25)" />
          <path d="M 270 855 A 91.5 91.5 0 0 1 410 855" />
          {/* Corner arcs */}
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

        {/* Player slots */}
        {formation433.map((slot, i) => {
          const player = starters[i];
          const displayRole = positionForSlot(slot.role, player);

          return (
            <button
              key={i}
              onClick={() => player && onSelectPlayer(player)}
              className={cn(
                "absolute -translate-x-1/2 -translate-y-1/2 group z-10",
                "transition-transform duration-300 hover:scale-110 hover:z-20",
                "animate-slot-pulse",
                !player && "opacity-40"
              )}
              style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
            >
              {/* Player circle */}
              <div className="relative flex flex-col items-center">
                <div
                  className={cn(
                    "w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden border-2 transition-all duration-300",
                    "bg-club-primary border-white/30 shadow-lg",
                    "group-hover:border-pitch-accent group-hover:shadow-[0_0_20px_rgba(255,107,74,0.4)]",
                    player?.photo && "border-white/40"
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
            </button>
          );
        })}
      </div>
    </div>
  );
}
