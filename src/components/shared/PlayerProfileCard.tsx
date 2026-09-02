"use client";

import React from "react";
import Link from "next/link";
import { Player } from "@/types";
import { Badge, Avatar } from "@/components/ui";

interface PlayerProfileCardProps {
  player: Player;
  slug: string;
  variant?: "grid" | "list";
}

const positionBadge = {
  GOALKEEPER: "bg-card-gold/10 text-card-gold",
  DEFENDER: "bg-pitch-accent/10 text-pitch-accent",
  MIDFIELDER: "bg-floodlight/10 text-floodlight",
  FORWARD: "bg-alert-red/10 text-alert-red",
};

const positionShort: Record<string, string> = {
  GOALKEEPER: "GK",
  DEFENDER: "DEF",
  MIDFIELDER: "MID",
  FORWARD: "FWD",
};

const statusColors = {
  ACTIVE: "success" as const,
  INJURED: "warning" as const,
  SUSPENDED: "danger" as const,
  TRANSFERRED: "default" as const,
  RETIRED: "default" as const,
};

function getPlayerName(player: Player): string {
  return `${player.firstName} ${player.lastName}`;
}

export default function PlayerProfileCard({
  player,
  slug,
  variant = "grid",
}: PlayerProfileCardProps) {
  const name = getPlayerName(player);

  if (variant === "list") {
    return (
      <Link href={`/squad/${player._id}`}>
        <div className="font-card flex items-center gap-4 p-4 bg-surface rounded-2xl border border-line/60 transition-all duration-300 hover:shadow-[0_8px_30px_-8px_rgba(62,213,152,0.12)] hover:border-line group">
          <div className="relative">
            <Avatar src={player.photo} alt={name} size="lg" />
            {player.number && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-pitch-accent text-pitch-night text-[10px] font-mono font-bold rounded-full flex items-center justify-center">
                {player.number}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-floodlight group-hover:text-pitch-accent transition-colors truncate">
              {name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${positionBadge[player.position]}`}>
                {positionShort[player.position]}
              </span>
              <Badge variant={statusColors[player.status]}>{player.status}</Badge>
            </div>
          </div>
          {player.nationality && (
            <span className="text-xs text-mist shrink-0">{player.nationality}</span>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/squad/${player._id}`}>
      <div className="font-card bg-surface rounded-2xl border border-line/60 overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_-8px_rgba(62,213,152,0.12)] hover:border-line group">
        <div className="aspect-[3/4] bg-surface-raised relative overflow-hidden">
          {player.photo ? (
            <img
              src={player.photo}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl font-bold text-line font-display">{player.firstName?.charAt(0)}</span>
            </div>
          )}
          {player.number && (
            <span className="absolute bottom-3 right-3 h-10 w-10 bg-pitch-night/70 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10">
              <span className="text-lg font-mono font-bold text-pitch-accent tabular-nums">{player.number}</span>
            </span>
          )}
          <span className={`absolute top-3 left-3 text-[10px] px-2 py-1 rounded-lg font-mono font-bold backdrop-blur-sm ${positionBadge[player.position]}`}>
            {positionShort[player.position]}
          </span>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-floodlight group-hover:text-pitch-accent transition-colors truncate text-sm">
            {name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={statusColors[player.status]}>{player.status}</Badge>
            {player.nationality && <span className="text-xs text-mist">{player.nationality}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}
