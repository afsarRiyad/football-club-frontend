"use client";

import React from "react";
import { Standing } from "@/types";

interface StandingTableProps {
  standings: Standing[];
}

export default function StandingTable({ standings }: StandingTableProps) {
  return (
    <div className="overflow-x-auto font-card">
      <table className="w-full">
        <thead>
          <tr className="border-b border-line">
            <th className="text-left py-3 px-4 text-xs font-semibold text-mist uppercase tracking-wider">#</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-mist uppercase tracking-wider">Team</th>
            <th className="text-center py-3 px-4 text-xs font-semibold text-mist uppercase tracking-wider">P</th>
            <th className="text-center py-3 px-4 text-xs font-semibold text-mist uppercase tracking-wider">W</th>
            <th className="text-center py-3 px-4 text-xs font-semibold text-mist uppercase tracking-wider">D</th>
            <th className="text-center py-3 px-4 text-xs font-semibold text-mist uppercase tracking-wider">L</th>
            <th className="text-center py-3 px-4 text-xs font-semibold text-mist uppercase tracking-wider">GF</th>
            <th className="text-center py-3 px-4 text-xs font-semibold text-mist uppercase tracking-wider">GA</th>
            <th className="text-center py-3 px-4 text-xs font-semibold text-mist uppercase tracking-wider">GD</th>
            <th className="text-center py-3 px-4 text-xs font-semibold text-mist uppercase tracking-wider">Pts</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s) => (
            <tr key={s.team._id} className="border-b border-line/40 hover:bg-surface-raised/50 transition-colors">
              <td className="py-3 px-4 text-sm font-mono font-medium text-floodlight tabular-nums">{s.position}</td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  {typeof s.team !== "string" && s.team.logo ? (
                    <img src={s.team.logo} alt={s.team.name} className="h-6 w-6 rounded-full object-cover border border-line" />
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-surface-raised border border-line" />
                  )}
                  <span className="text-sm font-medium text-floodlight">{typeof s.team === "string" ? "Unknown" : s.team.name}</span>
                </div>
              </td>
              <td className="py-3 px-4 text-sm text-center font-mono text-mist tabular-nums">{s.played}</td>
              <td className="py-3 px-4 text-sm text-center font-mono text-mist tabular-nums">{s.won}</td>
              <td className="py-3 px-4 text-sm text-center font-mono text-mist tabular-nums">{s.drawn}</td>
              <td className="py-3 px-4 text-sm text-center font-mono text-mist tabular-nums">{s.lost}</td>
              <td className="py-3 px-4 text-sm text-center font-mono text-mist tabular-nums">{s.goalsFor}</td>
              <td className="py-3 px-4 text-sm text-center font-mono text-mist tabular-nums">{s.goalsAgainst}</td>
              <td className="py-3 px-4 text-sm text-center font-mono text-mist tabular-nums">
                {s.goalDifference > 0 ? "+" : ""}{s.goalDifference}
              </td>
              <td className="py-3 px-4 text-sm text-center font-mono font-bold text-pitch-accent tabular-nums">{s.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
