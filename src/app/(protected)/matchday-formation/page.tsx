"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, Badge, Spinner } from "@/components/ui";
import Select from "@/components/ui/Select";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { getSocket, connectSocket } from "@/lib/socket";
import { getFormation, FIELD_SIZES, FieldSize } from "@/lib/formations";
import type { Formation, FormationSlot, Player, Team, Match, MatchFormation } from "@/types";
import { Calendar, MapPin, Clock, Shield, Users, Wifi, WifiOff } from "lucide-react";
import Image from "next/image";

/* ── Helper: format match date ── */
function formatMatchDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatMatchDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/* ── Connection status indicator ── */
function ConnectionStatus({ connected }: { connected: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 text-xs ${connected ? "text-green-600" : "text-gray-400"}`}>
      {connected ? (
        <>
          <Wifi className="h-3 w-3" />
          <span>Live</span>
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3" />
          <span>Offline</span>
        </>
      )}
    </div>
  );
}

/* ── Static pitch visualization ── */
function PitchFormation({
  formation,
  starters,
  captainId,
}: {
  formation: Formation;
  starters: (Player | undefined)[];
  captainId?: string;
}) {
  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="relative aspect-[68/105] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Pitch surface */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a6b3a] via-[#1d7a40] to-[#1a6b3a]" />

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
        </svg>

        {/* Grass stripes */}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
          <div
            key={i}
            className={`absolute left-0 right-0 ${i % 2 === 0 ? "bg-white/[0.03]" : ""}`}
            style={{ top: `${i * 10}%`, height: "10%" }}
          />
        ))}

        {/* Player slots */}
        {formation.slots.map((slot, i) => {
          const player = starters[i];
          const isCaptain = player && captainId && player._id === captainId;

          return (
            <div
              key={`slot-${i}`}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
              style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
            >
              <div className="relative flex flex-col items-center">
                {/* Captain badge */}
                {isCaptain && (
                  <div className="absolute -top-3 -right-1 z-20">
                    <div className="w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center">
                      <span className="text-white text-[8px] font-bold">C</span>
                    </div>
                  </div>
                )}

                {/* Player circle */}
                <div
                  className={`w-12 h-12 md:w-14 md:h-14 rounded-full border-2 flex items-center justify-center transition-all ${
                    player
                      ? "bg-club-primary border-white/40 shadow-lg"
                      : "bg-white/10 border-dashed border-white/30"
                  }`}
                >
                  {player?.photo ? (
                    <Image src={player.photo} alt="" width={56} height={56} className="w-full h-full rounded-full object-cover" />
                  ) : player ? (
                    <span className="text-white font-bold text-sm">{player.firstName?.[0]}</span>
                  ) : (
                    <span className="text-white/40 text-[10px] font-mono font-bold">{slot.role}</span>
                  )}
                </div>

                {/* Name label */}
                <div className="mt-1 bg-black/60 backdrop-blur-sm rounded px-1.5 py-0.5 text-center max-w-[80px]">
                  <p className="text-[10px] font-bold text-white truncate leading-tight">
                    {player ? `${player.firstName?.charAt(0)}. ${player.lastName}` : slot.role}
                  </p>
                  {player?.number && (
                    <p className="text-[8px] text-white/60 font-mono">#{player.number}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function MatchdayFormationPage() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string>("");
  const [matchFormations, setMatchFormations] = useState<MatchFormation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingFormations, setLoadingFormations] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Track the current match for socket cleanup
  const currentMatchRef = useRef<string>("");

  // Fetch scheduled matches
  useEffect(() => {
    fetchMatches();
  }, []);

  // Re-fetch formations when page regains focus (to handle tab switching)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && selectedMatchId) {
        fetchMatchFormations(selectedMatchId);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [selectedMatchId]);

  // Socket connection & match room management
  useEffect(() => {
    const socket = connectSocket();

    const handleConnect = () => {
      setSocketConnected(true);
      // Re-join the current match room if we have one
      if (currentMatchRef.current) {
        socket.emit("formation:join", currentMatchRef.current);
      }
    };

    const handleDisconnect = () => {
      setSocketConnected(false);
    };

    // Listen for real-time formation updates
    const handleFormationUpdate = (data: { matchId: string; teamId: string; formation: MatchFormation }) => {
      if (data.matchId === currentMatchRef.current) {
        setMatchFormations((prev) => {
          const idx = prev.findIndex((f) => (typeof f.team === "object" ? f.team._id : f.team) === data.teamId);
          if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = data.formation;
            return updated;
          }
          return [...prev, data.formation];
        });
        setLastUpdated(new Date());
      }
    };

    const handleFormationDeleted = (data: { matchId: string; teamId: string }) => {
      if (data.matchId === currentMatchRef.current) {
        setMatchFormations((prev) => prev.filter((f) => (typeof f.team === "object" ? f.team._id : f.team) !== data.teamId));
        setLastUpdated(new Date());
      }
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("formation:update", handleFormationUpdate);
    socket.on("formation:deleted", handleFormationDeleted);

    setSocketConnected(socket.connected);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("formation:update", handleFormationUpdate);
      socket.off("formation:deleted", handleFormationDeleted);
    };
  }, []);

  // Join/leave formation rooms when match selection changes
  useEffect(() => {
    const socket = getSocket();

    if (currentMatchRef.current) {
      socket.emit("formation:leave", currentMatchRef.current);
    }

    if (selectedMatchId) {
      socket.emit("formation:join", selectedMatchId);
      currentMatchRef.current = selectedMatchId;
      fetchMatchFormations(selectedMatchId);
    }

    return () => {
      if (selectedMatchId) {
        socket.emit("formation:leave", selectedMatchId);
      }
    };
  }, [selectedMatchId]);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const [schedRes, liveRes] = await Promise.allSettled([
        api.get("/matches", { params: { status: "SCHEDULED", sort: "matchDate", limit: 20 } }),
        api.get("/matches", { params: { status: "LIVE", sort: "matchDate", limit: 20 } }),
      ]);
      const scheduled = schedRes.status === "fulfilled" ? schedRes.value.data?.data || [] : [];
      const live = liveRes.status === "fulfilled" ? liveRes.value.data?.data || [] : [];
      const matchList = [...scheduled, ...live.filter((lm: any) => !scheduled.some((s: any) => s._id === lm._id))];
      console.log("[Formation] Fetched matches:", {
        scheduled: scheduled.length,
        live: live.length,
        total: matchList.length,
        matches: matchList.map((m: any) => ({ id: m._id, status: m.status, date: m.matchDate }))
      });
      setMatches(matchList);
      if (matchList.length > 0) {
        setSelectedMatchId(matchList[0]._id);
      }
    } catch (e) {
      console.error("Failed to fetch matches:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchMatchFormations = async (matchId: string) => {
    setLoadingFormations(true);
    try {
      console.log("[Formation] Fetching formations for match:", matchId);
      const { data } = await api.get(`/match-formations/match/${matchId}`);
      console.log("[Formation] Fetched formations:", data.data);
      setMatchFormations(data.data || []);
    } catch (e) {
      console.error("Failed to fetch match formations:", e);
      setMatchFormations([]);
    } finally {
      setLoadingFormations(false);
    }
  };

  const selectedMatch = matches.find((m) => m._id === selectedMatchId);

  // Options for the match selector
  const matchOptions = matches.map((m) => {
    const homeTeam = typeof m.homeTeam === "object" ? m.homeTeam : null;
    const awayTeam = typeof m.awayTeam === "object" ? m.awayTeam : null;
    return {
      value: m._id,
      label: `${homeTeam?.name || "Home"} vs ${awayTeam?.name || "Away"} — ${formatMatchDate(m.matchDate)}`,
    };
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Shield className="h-7 w-7 text-green-600" />
            Matchday Formations
            <ConnectionStatus connected={socketConnected} />
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View the team lineup for upcoming matches
            {lastUpdated && (
              <span className="ml-2 text-xs text-gray-400">
                • Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => selectedMatchId && fetchMatchFormations(selectedMatchId)}
          className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Match selector */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <Select
            label="Select a Match"
            value={selectedMatchId}
            onChange={(e) => setSelectedMatchId(e.target.value)}
            options={matchOptions}
            placeholder="Choose a match..."
          />

          {/* Selected match details */}
          {selectedMatch && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="font-bold text-lg text-gray-900 dark:text-white">
                      {selectedMatch.homeTeam && typeof selectedMatch.homeTeam === "object" ? selectedMatch.homeTeam.name : "Home"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Home</p>
                  </div>
                  <div className="text-center px-6">
                    <p className="text-2xl font-bold text-gray-400">VS</p>
                    <div className="flex items-center gap-2 mt-1 text-gray-600 dark:text-gray-400">
                      <Calendar className="h-3 w-3" />
                      <span className="text-sm">{formatMatchDateTime(selectedMatch.matchDate)}</span>
                    </div>
                    {selectedMatch.kickoff && (
                      <div className="flex items-center gap-2 mt-1 text-gray-600 dark:text-gray-400">
                        <Clock className="h-3 w-3" />
                        <span className="text-sm">{selectedMatch.kickoff}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-lg text-gray-900 dark:text-white">
                      {selectedMatch.awayTeam && typeof selectedMatch.awayTeam === "object" ? selectedMatch.awayTeam.name : "Away"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Away</p>
                  </div>
                </div>
                {selectedMatch.venue?.name && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{selectedMatch.venue.name}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Match formations */}
      {loadingFormations ? (
        <Card>
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center">
              <Spinner size="lg" />
              <p className="mt-4 text-gray-500 dark:text-gray-400">Loading formations...</p>
            </div>
          </CardContent>
        </Card>
      ) : matchFormations.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <Shield className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Formation Set
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                The admin hasn&apos;t set up a formation for this match yet.
              </p>
              {socketConnected && (
                <p className="text-xs text-green-600 mt-2">
                  ✓ You&apos;ll see updates automatically when the admin saves
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {matchFormations.map((mf) => {
            const pc = (mf.playerCount || 11) as FieldSize;
            const formationData = getFormation(mf.formation, pc);
            const starters: (Player | undefined)[] = new Array(pc).fill(undefined);

            for (const entry of mf.startingXI) {
              const player = typeof entry.player === "object" ? entry.player : null;
              if (player && entry.slotIndex >= 0 && entry.slotIndex < pc) {
                starters[entry.slotIndex] = player;
              }
            }

            console.log("[Formation] Processed formation:", {
              team: mf.team,
              formation: mf.formation,
              playerCount: pc,
              starters: starters.filter(Boolean).length,
              bench: mf.bench?.length || 0
            });

            const teamName = typeof mf.team === "object" ? mf.team.name : "Team";

            return (
              <Card key={mf._id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-lg">{teamName} Lineup</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="info">{mf.formation}</Badge>
                      <Badge variant="info">{pc}v{pc}</Badge>
                      <Badge variant="default">{mf.startingXI.length} players</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <PitchFormation
                        formation={formationData}
                        starters={starters}
                        captainId={typeof mf.captain === "object" ? mf.captain?._id : undefined}
                      />
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 dark:text-white">Starting XI ({mf.startingXI.filter((e: any) => e.slotIndex < pc).length} / {pc})</h4>
                      <div className="space-y-2">
                        {[...mf.startingXI]
                          .filter((entry: any) => entry.slotIndex < pc)
                          .sort((a: any, b: any) => a.slotIndex - b.slotIndex)
                          .map((entry: any, idx: number) => {
                            const player = typeof entry.player === "object" ? entry.player : null;
                            const isCaptain = mf.captain && typeof mf.captain === "object" && player && mf.captain._id === player._id;

                            return (
                              <div
                                key={idx}
                                className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                              >
                                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                  <span className="text-xs font-bold text-green-700 dark:text-green-300">
                                    {entry.position}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {player ? `${player.firstName} ${player.lastName}` : "Unknown"}
                                    {isCaptain && (
                                      <span className="ml-2 text-yellow-500 text-xs">(C)</span>
                                    )}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {entry.position} • Slot {entry.slotIndex + 1}
                                  </p>
                                </div>
                                {player?.number && (
                                  <Badge variant="default" className="text-xs">
                                    #{player.number}
                                  </Badge>
                                )}
                              </div>
                            );
                          })}
                      </div>

                      {mf.captain && typeof mf.captain === "object" && (
                        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                              Captain: {mf.captain.firstName} {mf.captain.lastName}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Bench / Reserves */}
                      {mf.bench && mf.bench.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Bench / Reserves ({mf.bench.length})
                          </h4>
                          <div className="space-y-1.5">
                            {mf.bench.map((p: any, idx: number) => {
                              const player = typeof p === "object" ? p : null;
                              if (!player) return null;
                              return (
                                <div
                                  key={`bench-${player._id || idx}`}
                                  className="flex items-center gap-3 p-2 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200/50 dark:border-yellow-800/30"
                                >
                                  <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                                    <span className="text-xs font-bold text-yellow-700 dark:text-yellow-300">
                                      {player.number ? `#${player.number}` : "—"}
                                    </span>
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                      {player.firstName} {player.lastName}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {player.position?.replace(/_/g, " ")} • Reserve
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
