"use client";

import React from "react";
import { Player } from "@/types";
import { Badge, Avatar } from "@/components/ui";

interface PlayerCardProps {
  player: Player;
}

const positionBadge: Record<string, string> = {
  GOALKEEPER: "bg-card-gold/10 text-card-gold",
  DEFENDER: "bg-pitch-accent/10 text-pitch-accent",
  MIDFIELDER: "bg-floodlight/10 text-floodlight",
  FORWARD: "bg-alert-red/10 text-alert-red",
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

export default function PlayerCard({ player }: PlayerCardProps) {
  return (
    <div className="font-card bg-surface rounded-2xl border border-line/60 p-5 transition-all duration-300 hover:shadow-[0_8px_30px_-8px_rgba(62,213,152,0.12)] hover:border-line group">
      <div className="flex items-start gap-4">
        <Avatar src={player.photo} alt={getPlayerName(player)} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {player.number && (
              <span className="text-lg font-mono font-bold text-floodlight tabular-nums">#{player.number}</span>
            )}
            <h3 className="font-semibold text-floodlight truncate group-hover:text-pitch-accent transition-colors text-sm">
              {getPlayerName(player)}
            </h3>
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${positionBadge[player.position]}`}>
              {player.position}
            </span>
            <Badge variant={statusColors[player.status]}>{player.status}</Badge>
          </div>
          {player.nationality && <p className="text-sm text-mist mt-1.5">{player.nationality}</p>}
        </div>
      </div>
    </div>
  );
}
