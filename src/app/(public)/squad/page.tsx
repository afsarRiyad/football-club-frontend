"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Player, Statistic } from "@/types";
import { PageSpinner } from "@/components/ui";
import { cn } from "@/lib/utils";
import PitchFormation from "@/components/shared/PitchFormation";
import PlayerRevealCard from "@/components/shared/PlayerRevealCard";

const positions = [
  { value: "", label: "All" },
  { value: "FORMATION", label: "Formation" },
  { value: "GOALKEEPER", label: "Goalkeepers" },
  { value: "DEFENDER", label: "Defenders" },
  { value: "MIDFIELDER", label: "Midfielders" },
  { value: "FORWARD", label: "Forwards" },
  { value: "EXTRA", label: "Extra Players" },
];

const positionShort: Record<string, string> = {
  GOALKEEPER: "GK",
  DEFENDER: "DEF",
  MIDFIELDER: "MID",
  FORWARD: "FWD",
};

const positionAccent: Record<string, string> = {
  GOALKEEPER: "text-card-gold",
  DEFENDER: "text-pitch-accent",
  MIDFIELDER: "text-floodlight",
  FORWARD: "text-alert-red",
};

function getPlayerName(p: Player) {
  return `${p.firstName} ${p.lastName}`;
}

export default function SquadPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [position, setPosition] = useState("FORMATION");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [statistics, setStatistics] = useState<Statistic[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [playersRes, statsRes] = await Promise.allSettled([
        api.get("/players", { params: { limit: 50, sort: "lastName" } }),
        api.get("/statistics", { params: { limit: 500 } }),
      ]);
      if (playersRes.status === "fulfilled") setPlayers(playersRes.value.data.data || []);
      if (statsRes.status === "fulfilled") setStatistics(statsRes.value.data.data || []);
    } catch (e) {
      console.error("Failed to fetch data:", e);
    } finally {
      setLoading(false);
    }
  };

  // Split into starters (first 11 by position priority) and reserves
  const starters = getStarters(players);
  const starterIds = new Set(starters.map((p) => p._id));
  const reserves = players.filter((p) => !starterIds.has(p._id));

  // Group by position
  const grouped = players.reduce((acc, p) => {
    if (!acc[p.position]) acc[p.position] = [];
    acc[p.position].push(p);
    return acc;
  }, {} as Record<string, Player[]>);

  const positionOrder = ["GOALKEEPER", "DEFENDER", "MIDFIELDER", "FORWARD"];

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        {/* Header */}
        <div className="mb-10 md:mb-14">
          <h1 className="text-4xl md:text-5xl font-bold text-floodlight font-display tracking-tight">
            The Squad
          </h1>
          <p className="text-mist mt-3 text-lg max-w-xl">
            Meet the players who wear the shirt with pride.
          </p>
        </div>

        {/* Position Filter */}
        <div className="flex gap-1 mb-10 overflow-x-auto pb-2">
          {positions.map((pos) => (
            <button
              key={pos.value}
              onClick={() => setPosition(pos.value)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors",
                position === pos.value
                  ? "bg-club-accent text-white"
                  : "text-mist hover:text-floodlight hover:bg-surface-raised"
              )}
            >
              {pos.label}
            </button>
          ))}
        </div>

        {loading ? (
          <PageSpinner />
        ) : position === "FORMATION" ? (
          /* ═══════════ FORMATION VIEW ═══════════ */
          <div className="space-y-16">
            {/* Formation label */}
            <div className="text-center">
              <span className="text-xs font-mono text-club-accent uppercase tracking-widest">
                Starting XI
              </span>
              <h2 className="text-lg font-bold text-floodlight font-display mt-1">4-3-3 Formation</h2>
            </div>

            {/* Pitch with players */}
            <PitchFormation
              starters={starters.slice(0, 11)}
              onSelectPlayer={setSelectedPlayer}
            />

            {/* Reserves */}
            {reserves.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-sm font-mono font-bold text-text-secondary uppercase tracking-widest">
                    Reserves
                  </span>
                  <span className="h-px flex-1 bg-line" />
                  <span className="text-xs text-mist font-mono">{reserves.length}</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {reserves.map((player) => (
                    <ReserveCard
                      key={player._id}
                      player={player}
                      onClick={() => setSelectedPlayer(player)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : position === "EXTRA" ? (
          /* ═══════════ EXTRA PLAYERS VIEW ═══════════ */
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-sm font-mono font-bold text-club-accent uppercase tracking-widest">
                Extended Squad
              </span>
              <span className="h-px flex-1 bg-line" />
              <span className="text-xs text-mist font-mono">{players.length} players</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {players.map((player) => (
                <PlayerGridCard
                  key={player._id}
                  player={player}
                  onClick={() => setSelectedPlayer(player)}
                />
              ))}
            </div>
          </div>
        ) : (
          /* ═══════════ FILTERED / GROUPED VIEW ═══════════ */
          <div className="space-y-14">
            {positionOrder.map((pos) => {
              const group = grouped[pos];
              if (!group || group.length === 0) return null;
              if (position && position !== pos) return null;
              return (
                <section key={pos}>
                  <div className="flex items-center gap-3 mb-6">
                    <span className={cn("text-sm font-mono font-bold uppercase tracking-widest", positionAccent[pos])}>
                      {positionShort[pos]}
                    </span>
                    <span className="h-px flex-1 bg-line" />
                    <span className="text-xs text-mist font-mono">{group.length}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                    {group.map((player) => (
                      <PlayerGridCard
                        key={player._id}
                        player={player}
                        onClick={() => setSelectedPlayer(player)}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      {/* FC26 Player Reveal Card */}
      <PlayerRevealCard player={selectedPlayer} statistics={statistics} onClose={() => setSelectedPlayer(null)} />
    </>
  );
}

/* ── Helper: pick 11 starters from the squad ── */
function getStarters(all: Player[]): Player[] {
  const picks: Player[] = [];
  const order: [string, number][] = [
    ["GOALKEEPER", 1],
    ["DEFENDER", 4],
    ["MIDFIELDER", 3],
    ["FORWARD", 3],
  ];
  for (const [pos, count] of order) {
    const pool = all.filter((p) => p.position === pos && !picks.includes(p));
    picks.push(...pool.slice(0, count));
  }
  // Fill remaining from unsorted if not enough by position
  const remaining = all.filter((p) => !picks.includes(p));
  while (picks.length < 11 && remaining.length > 0) {
    picks.push(remaining.shift()!);
  }
  return picks;
}

/* ── Reserve Card ── */
function ReserveCard({ player, onClick }: { player: Player; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group aspect-[3/4] bg-surface rounded-xl overflow-hidden relative border border-line/40 transition-all duration-300 hover:border-pitch-accent/40 hover:shadow-lg text-left"
    >
      {player.photo ? (
        <img
          src={player.photo}
          alt={getPlayerName(player)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-surface-raised">
          <span className="text-3xl font-bold text-line font-display">{player.firstName?.charAt(0)}</span>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
        <p className="text-[10px] font-bold text-white truncate">
          {player.firstName} {player.lastName}
        </p>
        <p className="text-[8px] text-white/50 font-mono">
          {positionShort[player.position]}{player.number ? ` · #${player.number}` : ""}
        </p>
      </div>
    </button>
  );
}

/* ── Grid Card (for filtered / grouped views) ── */
function PlayerGridCard({ player, onClick }: { player: Player; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group bg-surface rounded-xl overflow-hidden transition-all duration-200 hover:bg-surface-raised border border-line/30 text-left"
    >
      <div className="relative aspect-[3/4] bg-surface-raised overflow-hidden">
        {player.photo ? (
          <img
            src={player.photo}
            alt={getPlayerName(player)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl font-bold text-line font-display opacity-20">
              {player.firstName?.charAt(0)}
            </span>
          </div>
        )}
        {player.number && (
          <span className="absolute bottom-2 left-2 text-[10px] font-mono font-bold text-white/80 bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded">
            #{player.number}
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-medium text-floodlight truncate group-hover:text-pitch-accent transition-colors">
          {getPlayerName(player)}
        </p>
        <p className="text-[10px] text-mist font-mono mt-0.5">
          {positionShort[player.position]}
        </p>
      </div>
    </button>
  );
}
