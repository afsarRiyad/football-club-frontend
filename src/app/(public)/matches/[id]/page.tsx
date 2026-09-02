"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Calendar, MapPin, Users, MessageCircle, ArrowLeft } from "lucide-react";
import api from "@/lib/api";
import { Match, Team, MatchEvent } from "@/types";
import { Badge, PageSpinner, Input, Button } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";
import { getSocket, connectSocket, disconnectSocket } from "@/lib/socket";
import Link from "next/link";

function getTeamName(team: string | Team): string {
  if (typeof team === "string") return "TBD";
  return team.name;
}

const eventTypeLabels: Record<string, string> = {
  GOAL: "⚽ Goal",
  OWN_GOAL: "⚽ Own Goal",
  PENALTY: "⚽ Penalty",
  YELLOW_CARD: "🟨 Yellow Card",
  RED_CARD: "🟥 Red Card",
  SUBSTITUTION: "🔄 Substitution",
  OTHER: "📋 Event",
};

interface ChatMessage {
  user: string;
  message: string;
  timestamp: string;
}

export default function MatchDetailPage() {
  const params = useParams();
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewers, setViewers] = useState(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");

  useEffect(() => {
    fetchMatch();
  }, [params.id]);

  useEffect(() => {
    if (!match || match.status !== "LIVE") return;

    const socket = connectSocket();
    socket.emit("match:join", match._id);

    socket.on("match:scoreUpdate", (data) => {
      setMatch((prev) =>
        prev
          ? { ...prev, homeScore: data.score.home, awayScore: data.score.away }
          : prev
      );
    });

    socket.on("match:newEvent", (data) => {
      setMatch((prev) =>
        prev ? { ...prev, events: [...prev.events, data.event] } : prev
      );
    });

    socket.on("match:statusChange", (data) => {
      setMatch((prev) => (prev ? { ...prev, status: data.status } : prev));
    });

    socket.on("match:viewerCount", (count) => {
      setViewers(count);
    });

    socket.on("match:chatMessage", (data) => {
      setChatMessages((prev) => [...prev, data]);
    });

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
      setMatch(data.data);
    } catch (error) {
      console.error("Failed to fetch match:", error);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-2xl font-bold text-floodlight font-display">
          Match not found
        </h1>
      </div>
    );
  }

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        href="/matches"
        className="inline-flex items-center gap-1.5 text-mist hover:text-floodlight text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        All matches
      </Link>

      {/* Match Header — broadcast scoreboard */}
      <div className="bg-surface rounded-xl border border-line p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <Badge variant={statusVariant[match.status]}>
            {match.status === "LIVE" ? "LIVE" : match.status}
          </Badge>
          {match.status === "LIVE" && (
            <div className="flex items-center gap-2 text-sm text-mist">
              <Users className="h-4 w-4" />
              <span className="font-mono text-xs">{viewers} watching</span>
            </div>
          )}
        </div>

        {/* Scoreboard */}
        <div className="flex items-center justify-center py-8">
          <div className="flex-1 text-center">
            <h2 className="text-2xl font-bold text-floodlight font-display">
              {homeTeam}
            </h2>
            <p className="text-sm text-mist mt-1">Home</p>
          </div>
          <div className="px-8">
            <div className="text-5xl font-mono font-bold text-floodlight tabular-nums">
              {match.homeScore}
              <span className="text-mist mx-2">-</span>
              {match.awayScore}
            </div>
          </div>
          <div className="flex-1 text-center">
            <h2 className="text-2xl font-bold text-floodlight font-display">
              {awayTeam}
            </h2>
            <p className="text-sm text-mist mt-1">Away</p>
          </div>
        </div>

        {/* Match Info */}
        <div className="flex items-center justify-center gap-6 text-sm text-mist">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="font-mono text-xs">
              {formatDateTime(match.matchDate)}
            </span>
          </div>
          {match.venue && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{match.venue}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Timeline */}
        <div className="lg:col-span-2">
          <div className="bg-surface rounded-xl border border-line p-6">
            <h3 className="text-lg font-semibold text-floodlight mb-4 font-display">
              Match Timeline
            </h3>
            {match.events.length === 0 ? (
              <p className="text-mist text-center py-8 font-mono text-sm">
                No events yet
              </p>
            ) : (
              <div className="space-y-3">
                {match.events.map((event, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-3 bg-surface-raised rounded-lg"
                  >
                    <div className="text-sm font-mono text-pitch-accent w-12 tabular-nums">
                      {event.minute}&apos;
                    </div>
                    <div>
                      <p className="font-medium text-floodlight">
                        {eventTypeLabels[event.type] || event.type}
                      </p>
                      {event.description && (
                        <p className="text-sm text-mist mt-0.5">
                          {event.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat */}
        <div className="bg-surface rounded-xl border border-line p-6 flex flex-col h-[500px]">
          <h3 className="text-lg font-semibold text-floodlight mb-4 flex items-center gap-2 font-display">
            <MessageCircle className="h-5 w-5 text-pitch-accent" />
            Live Chat
          </h3>
          <div className="flex-1 overflow-y-auto space-y-3 mb-4">
            {chatMessages.length === 0 ? (
              <p className="text-mist text-center text-sm py-8 font-mono">
                No messages yet. Start the conversation!
              </p>
            ) : (
              chatMessages.map((msg, index) => (
                <div key={index} className="text-sm">
                  <span className="font-medium text-pitch-accent">
                    {msg.user}:{" "}
                  </span>
                  <span className="text-mist">{msg.message}</span>
                </div>
              ))
            )}
          </div>
          {match.status === "LIVE" && (
            <div className="flex gap-2">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message..."
                onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
              />
              <Button onClick={sendChatMessage} size="sm">
                Send
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
