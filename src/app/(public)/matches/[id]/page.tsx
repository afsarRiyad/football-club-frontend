"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Calendar, MapPin, Users, MessageCircle, ArrowLeft, Clock, Trophy, CircleDot, BarChart3 } from "lucide-react";
import api from "@/lib/api";
import { Match, Team, MatchEvent, Player } from "@/types";
import { Badge, PageSpinner, Input, Button } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";
import { getSocket, connectSocket, disconnectSocket } from "@/lib/socket";
import { cn } from "@/lib/utils";

function getTeamName(team: string | Team): string {
  if (typeof team === "string") return "TBD";
  return team?.name || "TBD";
}

function getTeamLogo(team: string | Team): string {
  if (!team || typeof team === "string") return "";
  return (team as any).logo || "";
}

interface ChatMessage {
  user: string;
  message: string;
  timestamp: string;
}

// ─── Event config ───
const EVENT_ICONS: Record<string, { emoji: string; color: string; bg: string }> = {
  GOAL: { emoji: "⚽", color: "text-green-500", bg: "bg-green-500/10" },
  OWN_GOAL: { emoji: "⚽", color: "text-red-500", bg: "bg-red-500/10" },
  PENALTY_MISSED: { emoji: "❌", color: "text-orange-500", bg: "bg-orange-500/10" },
  YELLOW_CARD: { emoji: "🟨", color: "text-yellow-500", bg: "bg-yellow-500/10" },
  RED_CARD: { emoji: "🟥", color: "text-red-500", bg: "bg-red-500/10" },
  SUBSTITUTION: { emoji: "🔄", color: "text-blue-500", bg: "bg-blue-500/10" },
  INJURY: { emoji: "🏥", color: "text-rose-500", bg: "bg-rose-500/10" },
};

const EVENT_LABELS: Record<string, string> = {
  GOAL: "Goal",
  OWN_GOAL: "Own Goal",
  PENALTY_MISSED: "Penalty Missed",
  YELLOW_CARD: "Yellow Card",
  RED_CARD: "Red Card",
  SUBSTITUTION: "Substitution",
  INJURY: "Injury",
};

export default function MatchDetailPage() {
  const params = useParams();
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewers, setViewers] = useState(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");

  useEffect(() => { fetchMatch(); }, [params.id]);

  useEffect(() => {
    if (!match || match.status !== "LIVE") return;
    const socket = connectSocket();
    socket.emit("match:join", match._id);

    socket.on("match:scoreUpdate", (data) => {
      setMatch((prev) => prev ? { ...prev, score: { home: data.score.home, away: data.score.away } } : prev);
    });
    socket.on("match:newEvent", (data) => {
      setMatch((prev) => prev ? { ...prev, events: [...prev.events, data.event] } : prev);
    });
    socket.on("match:statusChange", (data) => {
      setMatch((prev) => prev ? { ...prev, status: data.status } : prev);
    });
    socket.on("match:viewerCount", (count) => setViewers(count));
    socket.on("match:chatMessage", (data) => setChatMessages((prev) => [...prev, data]));

    return () => {
      socket.emit("match:leave", match._id);
      socket.off("match:scoreUpdate");
      socket.off("match:newEvent");
      socket.off("match:statusChange");
      socket.off("match:viewerCount");
      socket.off("match:chatMessage");
      disconnectSocket();
    };
  }, [match?._id, match?.status]);

  const fetchMatch = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/matches/${params.id}`);
      setMatch(data.data?.match || data.data);
    } catch (e) {
      console.error("Failed to fetch match:", e);
    } finally {
      setLoading(false);
    }
  };

  const sendChatMessage = useCallback(() => {
    if (!chatInput.trim() || !match) return;
    const socket = getSocket();
    socket.emit("match:chat", { message: chatInput });
    setChatInput("");
  }, [chatInput, match]);

  if (loading) return <PageSpinner />;
  if (!match) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-floodlight">Match not found</h1>
      </div>
    );
  }

  const homeName = getTeamName(match.homeTeam);
  const awayName = getTeamName(match.awayTeam);
  const homeLogo = getTeamLogo(match.homeTeam);
  const awayLogo = getTeamLogo(match.awayTeam);
  const isLive = match.status === "LIVE" || match.status === "HT";
  const isFinished = match.status === "FT";

  // Extract goals and assists — filter out null player objects
  const homeGoals = match.events
    .filter((e) => e.type === "GOAL" && e.player && typeof e.player === "object" && (e.player as any).firstName)
    .map((e) => ({
      player: e.player as any,
      assist: e.assist && typeof e.assist === "object" && (e.assist as any).firstName ? (e.assist as any) : null,
      minute: e.minute,
    }));
  const awayGoals = match.events
    .filter((e) => e.type === "GOAL" && e.player && typeof e.player === "object" && (e.player as any).firstName)
    .map((e) => ({
      player: e.player as any,
      assist: e.assist && typeof e.assist === "object" && (e.assist as any).firstName ? (e.assist as any) : null,
      minute: e.minute,
    }));
  // For goals stored as description (typed name for opponent)
  const goalsFromDesc = match.events
    .filter((e) => e.type === "GOAL" && typeof e.player === "string")
    .map((e) => ({
      playerName: e.player as string,
      assistName: e.description?.includes("assist:") ? e.description.split("assist:")[1]?.trim() : null,
      minute: e.minute,
    }));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/matches" className="inline-flex items-center gap-1.5 text-mist hover:text-floodlight text-sm mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> All matches
      </Link>

      {/* ═══════ SCOREBOARD ═══════ */}
      <div className="bg-gradient-to-b from-surface to-surface rounded-2xl border border-line/40 overflow-hidden mb-6">
        {/* Status bar */}
        <div className={cn(
          "flex items-center justify-between px-6 py-2",
          isLive ? "bg-red-500/10 border-b border-red-500/20" :
          isFinished ? "bg-green-500/5 border-b border-green-500/10" :
          "bg-surface-raised/50 border-b border-line/30"
        )}>
          <div className="flex items-center gap-2">
            {isLive && <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />}
            <Badge variant={isLive ? "live" : isFinished ? "success" : "default"} className="text-[10px]">
              {match.status === "HT" ? "HALF TIME" : match.status}
            </Badge>
            {match.competition && (
              <span className="text-[10px] text-mist font-mono">
                {typeof match.competition === "object" ? match.competition.name : ""}
              </span>
            )}
          </div>
          {isLive && (
            <div className="flex items-center gap-1.5 text-xs text-mist">
              <Users className="h-3 w-3" />
              <span className="font-mono">{viewers}</span>
            </div>
          )}
        </div>

        {/* Main scoreboard */}
        <div className="px-6 py-8 md:py-12">
          <div className="flex items-center justify-center gap-4 md:gap-8">
            {/* Home */}
            <div className="flex-1 flex flex-col items-center md:flex-row md:justify-end gap-3 md:gap-4">
              {homeLogo ? (
                <img src={homeLogo} alt={homeName} className="w-16 h-16 md:w-20 md:h-20 rounded-full object-contain border border-line/30" />
              ) : (
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-surface-raised border border-line/30 flex items-center justify-center">
                  <span className="text-2xl font-bold text-line/30">{homeName.charAt(0)}</span>
                </div>
              )}
              <div className="text-center md:text-right">
                <h2 className="text-xl md:text-2xl font-bold text-floodlight font-display">{homeName}</h2>
                <p className="text-[10px] text-mist font-mono uppercase tracking-wider">Home</p>
                {/* Home goalscorers */}
                {homeGoals.length > 0 && (
                  <div className="mt-2 space-y-0.5">
                    {homeGoals.map((g, i) => (
                      <div key={i} className="flex items-center gap-1.5 justify-center md:justify-end text-[11px]">
                        <span>⚽</span>
                        <span className="font-medium text-floodlight">{g.player.firstName} {g.player.lastName}</span>
                        {g.assist && (
                          <span className="text-mist">(assist: {g.assist.firstName} {g.assist.lastName})</span>
                        )}
                        {g.minute != null && <span className="text-mist font-mono text-[10px]">{g.minute}'</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Score */}
            <div className="flex flex-col items-center">
              <div className="text-5xl md:text-7xl font-black text-floodlight font-mono tabular-nums tracking-tight">
                {match.score.home}
                <span className="text-2xl md:text-4xl text-line/40 mx-1 md:mx-2">:</span>
                {match.score.away}
              </div>
              {isLive && (
                <div className="flex items-center gap-1 mt-2 text-red-500">
                  <Clock className="h-3 w-3" />
                  <span className="text-[10px] font-mono font-bold animate-pulse">LIVE</span>
                </div>
              )}
            </div>

            {/* Away */}
            <div className="flex-1 flex flex-col items-center md:flex-row md:justify-start gap-3 md:gap-4">
              <div className="text-center md:text-left">
                <h2 className="text-xl md:text-2xl font-bold text-floodlight font-display">{awayName}</h2>
                <p className="text-[10px] text-mist font-mono uppercase tracking-wider">Away</p>
                {/* Away goalscorers */}
                {(awayGoals.length > 0 || goalsFromDesc.length > 0) && (
                  <div className="mt-2 space-y-0.5">
                    {awayGoals.map((g, i) => (
                      <div key={`obj-${i}`} className="flex items-center gap-1.5 justify-center md:justify-start text-[11px]">
                        {g.minute != null && <span className="text-mist font-mono text-[10px]">{g.minute}'</span>}
                        <span>⚽</span>
                        <span className="font-medium text-floodlight">{g.player.firstName} {g.player.lastName}</span>
                        {g.assist && (
                          <span className="text-mist">(assist: {g.assist.firstName} {g.assist.lastName})</span>
                        )}
                      </div>
                    ))}
                    {goalsFromDesc.map((g, i) => (
                      <div key={`desc-${i}`} className="flex items-center gap-1.5 justify-center md:justify-start text-[11px]">
                        {g.minute != null && <span className="text-mist font-mono text-[10px]">{g.minute}'</span>}
                        <span>⚽</span>
                        <span className="font-medium text-floodlight">{g.playerName}</span>
                        {g.assistName && (
                          <span className="text-mist">(assist: {g.assistName})</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {awayLogo ? (
                <img src={awayLogo} alt={awayName} className="w-16 h-16 md:w-20 md:h-20 rounded-full object-contain border border-line/30" />
              ) : (
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-surface-raised border border-line/30 flex items-center justify-center">
                  <span className="text-2xl font-bold text-line/30">{awayName.charAt(0)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Match info bar */}
        <div className="flex items-center justify-center gap-4 md:gap-6 px-6 py-3 border-t border-line/30 text-xs text-mist">
          {match.matchDate && (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span className="font-mono">{formatDateTime(match.matchDate)}</span>
            </div>
          )}
          {match.venue?.name && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              <span>{match.venue.name}</span>
            </div>
          )}
          {match.attendance && (
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              <span>{match.attendance.toLocaleString()}</span>
            </div>
          )}
          {match.referee && (
            <div className="flex items-center gap-1.5">
              <CircleDot className="h-3.5 w-3.5" />
              <span>{match.referee}</span>
            </div>
          )}
        </div>
      </div>

      {/* ═══════ MATCH STATS ═══════ */}
      {(match as any).stats && (
        <MatchStats
          stats={(match as any).stats}
          homeName={homeName}
          awayName={awayName}
        />
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ═══════ EVENTS TIMELINE ═══════ */}
        <div className="lg:col-span-2">
          <div className="bg-surface rounded-xl border border-line/40 p-6">
            <h3 className="text-sm font-bold text-floodlight uppercase tracking-wider mb-4 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-pitch-accent" />
              Match Events
            </h3>

            {match.events.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-8 w-8 text-line/30 mx-auto mb-2" />
                <p className="text-sm text-mist font-mono">No events yet</p>
              </div>
            ) : (
              <div className="relative">
                {/* Center timeline line */}
                <div className="absolute left-6 top-0 bottom-0 w-px bg-line/30" />

                <div className="space-y-4">
                  {match.events.map((event, index) => {
                    const cfg = EVENT_ICONS[event.type] || EVENT_ICONS.GOAL;
                    const isHome = index % 2 === 0; // Simple alternation for visual
                    return (
                      <div key={index} className="relative flex items-start gap-4 pl-2">
                        {/* Timeline dot */}
                        <div className={cn("relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 border-surface text-sm shrink-0", cfg.bg)}>
                          {cfg.emoji}
                        </div>

                        {/* Event content */}
                        <div className={cn("flex-1 rounded-xl border p-3", cfg.bg, "border-line/20")}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-pitch-accent">
                                {event.minute != null ? `${event.minute}'` : ""}
                              </span>
                              <span className="text-xs font-bold text-floodlight">{EVENT_LABELS[event.type] || event.type}</span>
                            </div>
                          </div>

                          {/* Player + Assist */}
                          <div className="flex items-center gap-2 text-sm">
                            {event.player && (
                              <span className="font-medium text-floodlight">
                                {typeof event.player === "object" ? `${(event.player as any).firstName} ${(event.player as any).lastName}` : ""}
                              </span>
                            )}
                            {event.type === "GOAL" && event.assist && (
                              <span className="text-xs text-mist">
                                (assist: {typeof event.assist === "object" ? `${(event.assist as any).firstName} ${(event.assist as any).lastName}` : ""})
                              </span>
                            )}
                            {event.type === "SUBSTITUTION" && event.assist && (
                              <span className="text-xs text-mist">
                                → {typeof event.assist === "object" ? `${(event.assist as any).firstName} ${(event.assist as any).lastName}` : ""}
                              </span>
                            )}
                          </div>

                          {event.description && (
                            <p className="text-xs text-mist mt-1">{event.description}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Match Notes */}
          {match.notes && (
            <div className="bg-surface rounded-xl border border-line/40 p-6 mt-4">
              <h3 className="text-sm font-bold text-floodlight uppercase tracking-wider mb-2">Notes</h3>
              <p className="text-sm text-mist leading-relaxed">{match.notes}</p>
            </div>
          )}
        </div>

        {/* ═══════ LIVE CHAT ═══════ */}
        <div className="bg-surface rounded-xl border border-line/40 flex flex-col h-[500px]">
          <div className="p-4 border-b border-line/30">
            <h3 className="text-sm font-bold text-floodlight flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-pitch-accent" />
              Live Chat
              {isLive && <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />}
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="h-6 w-6 text-line/30 mx-auto mb-2" />
                <p className="text-xs text-mist font-mono">No messages yet</p>
              </div>
            ) : (
              chatMessages.map((msg, index) => (
                <div key={index} className="text-sm">
                  <span className="font-medium text-pitch-accent">{msg.user}: </span>
                  <span className="text-mist">{msg.message}</span>
                </div>
              ))
            )}
          </div>
          {isLive && (
            <div className="p-4 border-t border-line/30 flex gap-2">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message..."
                onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
              />
              <Button onClick={sendChatMessage} size="sm">Send</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// LaLiga-style Match Stats Component
// ═══════════════════════════════════════════════════════════════════
interface MatchStatsProps {
  stats: {
    possession?: { home: number; away: number };
    shots?: { home: number; away: number };
    shotsOnTarget?: { home: number; away: number };
    corners?: { home: number; away: number };
    fouls?: { home: number; away: number };
    offsides?: { home: number; away: number };
    yellowCards?: { home: number; away: number };
    redCards?: { home: number; away: number };
    saves?: { home: number; away: number };
  };
  homeName: string;
  awayName: string;
}

function StatBar({ label, home, away, isPossession }: { label: string; home: number; away: number; isPossession?: boolean }) {
  const total = home + away;
  const homePct = total > 0 ? (home / total) * 100 : 50;
  const awayPct = total > 0 ? (away / total) * 100 : 50;
  const homeWinning = home > away;
  const awayWinning = away > home;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className={cn("text-sm font-mono tabular-nums", homeWinning ? "font-bold text-pitch-accent" : "text-floodlight")}>
          {isPossession ? `${home}%` : home}
        </span>
        <span className="text-[10px] text-mist font-mono uppercase tracking-wider">{label}</span>
        <span className={cn("text-sm font-mono tabular-nums", awayWinning ? "font-bold text-pitch-accent" : "text-floodlight")}>
          {isPossession ? `${away}%` : away}
        </span>
      </div>
      <div className="flex h-1.5 rounded-full overflow-hidden bg-line/30">
        <div
          className={cn("h-full rounded-l-full transition-all duration-500", homeWinning ? "bg-pitch-accent" : "bg-floodlight/40")}
          style={{ width: `${homePct}%` }}
        />
        <div
          className={cn("h-full rounded-r-full transition-all duration-500", awayWinning ? "bg-pitch-accent" : "bg-floodlight/40")}
          style={{ width: `${awayPct}%` }}
        />
      </div>
    </div>
  );
}

function MatchStats({ stats, homeName, awayName }: MatchStatsProps) {
  const statRows = [
    { key: "possession", label: "Possession", isPossession: true },
    { key: "shots", label: "Total Shots" },
    { key: "shotsOnTarget", label: "Shots on Target" },
    { key: "corners", label: "Corners" },
    { key: "fouls", label: "Fouls" },
    { key: "offsides", label: "Offsides" },
    { key: "yellowCards", label: "Yellow Cards" },
    { key: "redCards", label: "Red Cards" },
    { key: "saves", label: "Saves" },
  ];

  // Check if any stats have non-default values
  const hasStats = statRows.some((row) => {
    const s = (stats as any)[row.key];
    return s && (s.home > 0 || s.away > 0);
  });

  if (!hasStats) return null;

  return (
    <div className="bg-surface rounded-xl border border-line/40 p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold text-floodlight uppercase tracking-wider flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-pitch-accent" />
          Match Statistics
        </h3>
      </div>

      {/* Team names header */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm font-bold text-floodlight truncate max-w-[40%]">{homeName}</span>
        <span className="text-sm font-bold text-floodlight truncate max-w-[40%] text-right">{awayName}</span>
      </div>

      <div className="space-y-4">
        {statRows.map((row) => {
          const s = (stats as any)[row.key];
          if (!s) return null;
          return (
            <StatBar
              key={row.key}
              label={row.label}
              home={s.home}
              away={s.away}
              isPossession={row.isPossession}
            />
          );
        })}
      </div>
    </div>
  );
}
