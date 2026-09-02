"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Trophy, ArrowLeft, Target } from "lucide-react";
import api from "@/lib/api";
import { Standing, TopScorer } from "@/types";
import { PageSpinner } from "@/components/ui";

function getTeamName(team: any): string {
  if (typeof team === "string") return "Unknown";
  return team?.name || "Unknown";
}

export default function StandingsPage() {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [topScorers, setTopScorers] = useState<TopScorer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"standings" | "scorers">("standings");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [standingsRes, scorersRes] = await Promise.allSettled([
        api.get("/statistics/standings"),
        api.get("/statistics/top-scorers", { params: { limit: 10 } }),
      ]);

      if (standingsRes.status === "fulfilled") {
        const data = standingsRes.value.data.data || [];
        setStandings(data.map((s: any, i: number) => ({ ...s, position: i + 1 })));
      }

      if (scorersRes.status === "fulfilled") {
        setTopScorers(scorersRes.value.data.data || []);
      }
    } catch (e) {
      console.error("Failed to fetch standings:", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageSpinner />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-floodlight font-display tracking-tight">
          Standings
        </h1>
        <p className="text-mist mt-3 text-lg">
          League table and top performers this season.
        </p>
      </div>

      {/* Tab selector */}
      <div className="flex gap-1 mb-10 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab("standings")}
          className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
            activeTab === "standings"
              ? "bg-floodlight text-pitch-night"
              : "text-mist hover:text-floodlight hover:bg-surface-raised"
          }`}
        >
          League Table
        </button>
        <button
          onClick={() => setActiveTab("scorers")}
          className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
            activeTab === "scorers"
              ? "bg-floodlight text-pitch-night"
              : "text-mist hover:text-floodlight hover:bg-surface-raised"
          }`}
        >
          Top Scorers
        </button>
      </div>

      {activeTab === "standings" ? (
        standings.length === 0 ? (
          <div className="py-20 text-center">
            <Trophy className="h-10 w-10 text-mist mx-auto mb-3" />
            <p className="font-mono text-mist">No standings available yet</p>
            <p className="text-sm text-mist mt-1">
              Standings are generated from completed match results.
            </p>
          </div>
        ) : (
          <div className="bg-surface rounded-xl border border-line overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-line bg-surface-raised/50">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-mist uppercase tracking-wider w-12">
                      #
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-mist uppercase tracking-wider">
                      Team
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-mist uppercase tracking-wider">
                      P
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-mist uppercase tracking-wider">
                      W
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-mist uppercase tracking-wider">
                      D
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-mist uppercase tracking-wider">
                      L
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-mist uppercase tracking-wider">
                      GF
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-mist uppercase tracking-wider">
                      GA
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-mist uppercase tracking-wider">
                      GD
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-mist uppercase tracking-wider">
                      Pts
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((s) => (
                    <tr
                      key={getTeamName(s.team)}
                      className="border-b border-line/40 hover:bg-surface-raised/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm font-mono font-medium text-floodlight tabular-nums">
                        {s.position}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {typeof s.team !== "string" && s.team.logo ? (
                            <img
                              src={s.team.logo}
                              alt={s.team.name}
                              className="h-6 w-6 rounded-full object-cover border border-line"
                            />
                          ) : (
                            <div className="h-6 w-6 rounded-full bg-surface-raised border border-line" />
                          )}
                          <span className="text-sm font-medium text-floodlight">
                            {getTeamName(s.team)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-center font-mono text-mist tabular-nums">
                        {s.played}
                      </td>
                      <td className="py-3 px-4 text-sm text-center font-mono text-mist tabular-nums">
                        {s.won}
                      </td>
                      <td className="py-3 px-4 text-sm text-center font-mono text-mist tabular-nums">
                        {s.drawn}
                      </td>
                      <td className="py-3 px-4 text-sm text-center font-mono text-mist tabular-nums">
                        {s.lost}
                      </td>
                      <td className="py-3 px-4 text-sm text-center font-mono text-mist tabular-nums">
                        {s.goalsFor}
                      </td>
                      <td className="py-3 px-4 text-sm text-center font-mono text-mist tabular-nums">
                        {s.goalsAgainst}
                      </td>
                      <td className="py-3 px-4 text-sm text-center font-mono text-mist tabular-nums">
                        {s.goalDifference > 0 ? "+" : ""}
                        {s.goalDifference}
                      </td>
                      <td className="py-3 px-4 text-sm text-center font-mono font-bold text-pitch-accent tabular-nums">
                        {s.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        /* Top Scorers */
        topScorers.length === 0 ? (
          <div className="py-20 text-center">
            <Target className="h-10 w-10 text-mist mx-auto mb-3" />
            <p className="font-mono text-mist">No top scorers data available</p>
          </div>
        ) : (
          <div className="space-y-px">
            {topScorers.map((scorer, index) => {
              const player = scorer.player;
              const name = typeof player === "string"
                ? "Unknown"
                : `${player.firstName} ${player.lastName}`;
              const photo = typeof player === "string" ? undefined : player.photo;
              const number = typeof player === "string" ? undefined : player.number;
              const position = typeof player === "string" ? undefined : player.position;

              return (
                <div
                  key={typeof player === "string" ? index : player._id}
                  className="flex items-center gap-4 py-4 px-4 hover:bg-surface rounded-lg transition-colors group"
                >
                  <span className="text-lg font-mono font-bold text-mist tabular-nums w-8 text-center">
                    {index + 1}
                  </span>

                  {photo ? (
                    <img
                      src={photo}
                      alt={name}
                      className="h-10 w-10 rounded-full object-cover border border-line"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-surface-raised border border-line flex items-center justify-center">
                      <span className="text-sm font-bold text-line">
                        {name.charAt(0)}
                      </span>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-floodlight group-hover:text-pitch-accent transition-colors truncate">
                      {name}
                    </p>
                    <p className="text-xs text-mist">
                      {position && position.replace("_", " ")}
                      {number != null && ` • #${number}`}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xl font-mono font-bold text-pitch-accent tabular-nums">
                      {scorer.goals}
                    </span>
                    <p className="text-[10px] text-mist uppercase tracking-wider">
                      goals
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
