"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Match } from "@/types";
import { PageSpinner, Pagination } from "@/components/ui";
import { cn } from "@/lib/utils";

function getTeamName(team: any): string {
  if (typeof team === "string") return "TBD";
  return team?.name || "TBD";
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const statusFilters = [
  { value: "", label: "All" },
  { value: "SCHEDULED", label: "Upcoming" },
  { value: "LIVE", label: "Live" },
  { value: "FT", label: "Results" },
];

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchMatches();
  }, [status, page]);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 12, sort: "-matchDate" };
      if (status) params.status = status;
      const { data } = await api.get("/matches", { params });
      setMatches(data.data || []);
      setTotalPages(data.totalPages || 1);
    } catch (e) {
      console.error("Failed to fetch matches:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-floodlight font-display tracking-tight">
          Matches
        </h1>
      </div>

      {/* Filter */}
      <div className="flex gap-1 mb-10 overflow-x-auto pb-2">
        {statusFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => { setStatus(f.value); setPage(1); }}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors",
              status === f.value
                ? "bg-floodlight text-pitch-night"
                : "text-mist hover:text-floodlight hover:bg-surface-raised"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <PageSpinner />
      ) : matches.length === 0 ? (
        <div className="py-20 text-center">
          <p className="font-mono text-mist">No matches found</p>
        </div>
      ) : (
        <>
          {/* Match list — clean rows, not card grids */}
          <div className="space-y-px">
            {matches.map((match) => {
              const isLive = match.status === "LIVE" || match.status === "HT";
              return (
                <Link
                  key={match._id}
                  href={`/matches/${match._id}`}
                  className="flex items-center justify-between py-5 px-4 hover:bg-surface rounded-lg transition-colors group"
                >
                  <div className="flex items-center gap-6 flex-1">
                    <span className="text-xs text-mist font-mono w-20 shrink-0">
                      {formatDate(match.matchDate)}
                    </span>
                    <span className="text-sm md:text-base text-floodlight group-hover:text-pitch-accent transition-colors font-medium">
                      {getTeamName(match.homeTeam)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 px-6">
                    {match.status === "SCHEDULED" ? (
                      <span className="text-sm font-mono text-mist">vs</span>
                    ) : (
                      <span className="text-xl font-mono font-bold text-floodlight tabular-nums">
                        {match.homeScore}
                        <span className="text-mist mx-1.5">–</span>
                        {match.awayScore}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-6 flex-1 justify-end">
                    <span className="text-sm md:text-base text-floodlight group-hover:text-pitch-accent transition-colors font-medium">
                      {getTeamName(match.awayTeam)}
                    </span>
                    <span className={cn(
                      "text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded shrink-0",
                      isLive
                        ? "text-alert-red bg-alert-red/10"
                        : match.status === "FT"
                        ? "text-mist"
                        : "text-mist"
                    )}>
                      {isLive ? "LIVE" : match.status === "FT" ? "FT" : match.status}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            className="mt-10"
          />
        </>
      )}
    </div>
  );
}
