"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Radio } from "lucide-react";
import api from "@/lib/api";
import { Match, Team } from "@/types";

function getTeamName(team: string | Team): string {
  if (typeof team === "string") return "TBD";
  return team.name;
}

export default function LiveMatchStrip() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLiveMatches();
    const interval = setInterval(fetchLiveMatches, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchLiveMatches = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const { data } = await api.get("/matches", {
        params: { limit: 5, sort: "-matchDate" },
      });

      // Show live matches and today's matches
      const relevantMatches = (data.data || []).filter((m: Match) => {
        const matchDate = new Date(m.matchDate).toISOString().split("T")[0];
        return m.status === "LIVE" || m.status === "HT" || matchDate === today;
      });

      setMatches(relevantMatches.slice(0, 3));
    } catch {
      // Silent fail - strip is non-critical
    } finally {
      setLoading(false);
    }
  };

  if (loading || matches.length === 0) return null;

  return (
    <div className="bg-surface border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 py-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 text-mist shrink-0">
            <Radio className="h-3.5 w-3.5 text-pitch-accent" />
            <span className="text-xs font-medium uppercase tracking-wider">
              Live
            </span>
          </div>

          <div className="h-4 w-px bg-line shrink-0" />

          <div className="flex items-center gap-4">
            {matches.map((match) => {
              const isLive =
                match.status === "LIVE" || match.status === "HT";
              return (
                <Link
                  key={match._id}
                  href={`/matches/${match._id}`}
                  className="flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-surface-raised transition-all duration-150 shrink-0"
                >
                  {isLive && (
                    <span className="h-2 w-2 rounded-full bg-pitch-accent animate-pulse shrink-0" />
                  )}
                  <span className="text-xs text-mist truncate max-w-[80px]">
                    {getTeamName(match.homeTeam)}
                  </span>
                  <span className="text-sm font-mono font-bold text-floodlight tabular-nums">
                    {match.homeScore}
                    <span className="text-mist mx-1">-</span>
                    {match.awayScore}
                  </span>
                  <span className="text-xs text-mist truncate max-w-[80px]">
                    {getTeamName(match.awayTeam)}
                  </span>
                  {isLive && (
                    <span className="text-[10px] font-mono text-pitch-accent font-medium">
                      {match.status === "HT" ? "HT" : `${match.status}`}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
