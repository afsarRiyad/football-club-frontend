"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, MapPin } from "lucide-react";
import { Match, Team } from "@/types";
import { Badge } from "@/components/ui";
import { formatDate, formatDateTime } from "@/lib/utils";
import { cardHover } from "@/lib/animations";

interface MatchCardProps {
  match: Match;
}

function getTeamName(team: string | Team | null): string {
  if (!team || typeof team === "string") return "TBD";
  return team.name || "TBD";
}

export default function MatchCard({ match }: MatchCardProps) {
  const homeTeam = getTeamName(match.homeTeam);
  const awayTeam = getTeamName(match.awayTeam);

  const statusVariant = {
    SCHEDULED: "default" as const,
    LIVE: "live" as const,
    HT: "warning" as const,
    FT: "success" as const,
    POSTPONED: "warning" as const,
    CANCELLED: "danger" as const,
  };

  return (
    <Link href={`/matches/${match._id}`}>
      <motion.div
        className="font-card bg-surface rounded-2xl border border-line/60 p-5 cursor-pointer group"
        variants={cardHover}
        initial="rest"
        whileHover="hover"
        transition={{ duration: 0.2 }}
      >
        {/* Status */}
        <div className="flex items-center justify-between mb-4">
          <Badge variant={statusVariant[match.status]}>
            {match.status === "LIVE" ? "🔴 LIVE" : match.status}
          </Badge>
        </div>

        {/* Teams & Score */}
        <div className="flex items-center justify-between">
          <div className="flex-1 text-center">
            <p className="font-semibold text-text-primary group-hover:text-club-accent transition-colors duration-200 text-sm">
              {homeTeam}
            </p>
            <p className="text-[10px] text-text-secondary mt-0.5 uppercase tracking-wider">Home</p>
          </div>

          <div className="px-4">
            {match.status === "SCHEDULED" ? (
              <span className="text-lg font-mono font-bold text-text-muted">vs</span>
            ) : (
              <span className="text-xl font-mono font-bold text-text-primary tabular-nums">
                {match.score.home}
                <span className="text-text-secondary mx-1">-</span>
                {match.score.away}
              </span>
            )}
          </div>

          <div className="flex-1 text-center">
            <p className="font-semibold text-text-primary group-hover:text-club-accent transition-colors duration-200 text-sm">
              {awayTeam}
            </p>
            <p className="text-[10px] text-text-secondary mt-0.5 uppercase tracking-wider">Away</p>
          </div>
        </div>

        {/* Info */}
        <div className="mt-4 pt-3 border-t border-line/40 flex items-center gap-4 text-xs text-text-secondary">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3" />
            <span className="font-mono">
              {match.status === "LIVE" || match.status === "FT"
                ? formatDateTime(match.matchDate)
                : formatDate(match.matchDate)}
            </span>
          </div>
          {match.venue?.name && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3" />
              <span>{match.venue.name}</span>
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
