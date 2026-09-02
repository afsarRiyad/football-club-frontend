"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Play, Pause, Square, Plus } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { Match, Team, MatchEvent } from "@/types";
import { useToast } from "@/context/ToastContext";
import { Button, Input, Badge, Modal, PageSpinner } from "@/components/ui";
import { getSocket, connectSocket, disconnectSocket } from "@/lib/socket";

function getTeamName(team: string | Team): string {
  if (typeof team === "string") return "TBD";
  return team.name;
}

const eventTypes = [
  { value: "GOAL", label: "⚽ Goal" },
  { value: "OWN_GOAL", label: "⚽ Own Goal" },
  { value: "PENALTY", label: "⚽ Penalty" },
  { value: "YELLOW_CARD", label: "🟨 Yellow Card" },
  { value: "RED_CARD", label: "🟥 Red Card" },
  { value: "SUBSTITUTION", label: "🔄 Substitution" },
  { value: "OTHER", label: "📋 Other" },
];

export default function LiveMatchPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventForm, setEventForm] = useState({ type: "GOAL", minute: "", description: "" });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchMatch();
  }, [params.id]);

  useEffect(() => {
    if (!match) return;

    const socket = connectSocket();
    socket.emit("match:join", match._id);

    socket.on("match:scoreUpdate", (data) => {
      setMatch((prev) => prev ? { ...prev, homeScore: data.score.home, awayScore: data.score.away } : prev);
    });

    socket.on("match:newEvent", (data) => {
      setMatch((prev) => prev ? { ...prev, events: [...prev.events, data.event] } : prev);
    });

    socket.on("match:statusChange", (data) => {
      setMatch((prev) => prev ? { ...prev, status: data.status } : prev);
    });

    return () => {
      socket.emit("match:leave", match._id);
      socket.off("match:scoreUpdate");
      socket.off("match:newEvent");
      socket.off("match:statusChange");
      disconnectSocket();
    };
  }, [match?._id]);

  const fetchMatch = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/matches/${params.id}`);
      setMatch(data.data);
      setHomeScore(data.data.homeScore);
      setAwayScore(data.data.awayScore);
    } catch (error) {
      showToast("Failed to load match", "error");
    } finally {
      setLoading(false);
    }
  };

  const updateScore = useCallback((home: number, away: number) => {
    const socket = getSocket();
    socket.emit("match:updateScore", { matchId: match?._id, homeScore: home, awayScore: away });
    setHomeScore(home);
    setAwayScore(away);
  }, [match?._id]);

  const updateStatus = (status: string) => {
    const socket = getSocket();
    socket.emit("match:updateStatus", { matchId: match?._id, status });
    showToast(`Match status changed to ${status}`, "success");
  };

  const addEvent = async () => {
    if (!eventForm.minute) { showToast("Minute is required", "error"); return; }
    setSending(true);
    try {
      // Also save via API
      await api.post(`/matches/${match?._id}/events`, {
        type: eventForm.type,
        minute: Number(eventForm.minute),
        description: eventForm.description || undefined,
      });
      showToast("Event added", "success");
      setShowEventModal(false);
      setEventForm({ type: "GOAL", minute: "", description: "" });
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to add event", "error");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <PageSpinner />;
  if (!match) return <div className="p-8 text-center text-gray-500">Match not found</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/admin/matches" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to matches
      </Link>

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Badge variant="live">LIVE CONTROL</Badge>
          </div>
          <div className="flex gap-2">
            {match.status === "SCHEDULED" && (
              <Button size="sm" onClick={() => updateStatus("LIVE")}>
                <Play className="h-4 w-4 mr-1" /> Start
              </Button>
            )}
            {match.status === "LIVE" && (
              <>
                <Button size="sm" variant="secondary" onClick={() => updateStatus("HT")}>
                  <Pause className="h-4 w-4 mr-1" /> Half Time
                </Button>
                <Button size="sm" variant="danger" onClick={() => updateStatus("FT")}>
                  <Square className="h-4 w-4 mr-1" /> Full Time
                </Button>
              </>
            )}
            {match.status === "HT" && (
              <Button size="sm" onClick={() => updateStatus("LIVE")}>
                <Play className="h-4 w-4 mr-1" /> Resume
              </Button>
            )}
          </div>
        </div>

        {/* Scoreboard */}
        <div className="flex items-center justify-center py-6">
          <div className="flex-1 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{getTeamName(match.homeTeam)}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Home</p>
          </div>
          <div className="px-6 flex items-center gap-4">
            <button onClick={() => updateScore(homeScore - 1 < 0 ? 0 : homeScore - 1, awayScore)} className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600">−</button>
            <div className="text-5xl font-bold text-gray-900 dark:text-white min-w-[120px] text-center">
              {homeScore} - {awayScore}
            </div>
            <button onClick={() => updateScore(homeScore + 1, awayScore)} className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600">+</button>
          </div>
          <div className="flex-1 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{getTeamName(match.awayTeam)}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Away</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <button onClick={() => updateScore(homeScore, awayScore - 1 < 0 ? 0 : awayScore - 1)} className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600">−</button>
              <button onClick={() => updateScore(homeScore, awayScore + 1)} className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600">+</button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Button onClick={() => setShowEventModal(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Event
        </Button>
        <Button variant="outline" onClick={fetchMatch}>
          Refresh Match
        </Button>
      </div>

      {/* Events Timeline */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Match Events</h3>
        {match.events.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">No events yet</p>
        ) : (
          <div className="space-y-2">
            {match.events.map((event, index) => (
              <div key={index} className="flex items-start gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-sm font-mono text-gray-500 dark:text-gray-400 w-12">{event.minute}'</div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {eventTypes.find((e) => e.value === event.type)?.label || event.type}
                  </p>
                  {event.description && <p className="text-sm text-gray-500 dark:text-gray-400">{event.description}</p>}
                </div>
                <button
                  onClick={async () => {
                    try {
                      await api.delete(`/matches/${match._id}/events/${index}`);
                      setMatch((prev) => prev ? { ...prev, events: prev.events.filter((_, i) => i !== index) } : prev);
                      showToast("Event removed", "success");
                    } catch (error: any) {
                      showToast(error.response?.data?.message || "Failed to remove event", "error");
                    }
                  }}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Event Modal */}
      <Modal isOpen={showEventModal} onClose={() => setShowEventModal(false)} title="Add Match Event">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Event Type</label>
            <select value={eventForm.type} onChange={(e) => setEventForm({ ...eventForm, type: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm">
              {eventTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <Input label="Minute" type="number" value={eventForm.minute} onChange={(e) => setEventForm({ ...eventForm, minute: e.target.value })} placeholder="e.g. 45" />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (optional)</label>
            <textarea value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm" rows={2} placeholder="e.g. Header from corner" />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowEventModal(false)}>Cancel</Button>
            <Button loading={sending} onClick={addEvent}>Add Event</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
