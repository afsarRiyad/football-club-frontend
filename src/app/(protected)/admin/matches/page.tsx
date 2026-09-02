"use client";

import React, { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Radio } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { Match, Team, MatchStatus } from "@/types";
import { useToast } from "@/context/ToastContext";
import { Button, Badge, Modal, SearchInput } from "@/components/ui";
import DataTable, { Column } from "@/components/ui/DataTable";
import { formatDate, formatDateTime } from "@/lib/utils";

const statusOptions: { value: string; label: string }[] = [
  { value: "", label: "All Status" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "LIVE", label: "Live" },
  { value: "FT", label: "Finished" },
  { value: "POSTPONED", label: "Postponed" },
];

function getTeamName(team: string | Team): string {
  if (typeof team === "string") return "TBD";
  return team.name;
}

function getTeamId(team: string | Team): string {
  if (typeof team === "string") return team;
  return team._id;
}

interface MatchForm {
  homeTeam: string;
  awayTeam: string;
  matchDate: string;
  venue: string;
  competition: string;
  season: string;
}

const emptyForm: MatchForm = { homeTeam: "", awayTeam: "", matchDate: "", venue: "", competition: "", season: "" };

export default function AdminMatchesPage() {
  const { showToast } = useToast();
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [form, setForm] = useState<MatchForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTeams();
    fetchMatches();
  }, [search, status, page]);

  const fetchTeams = async () => {
    try {
      const { data } = await api.get("/teams", { params: { limit: 200 } });
      setTeams(data.data);
    } catch (error) {
      console.error("Failed to fetch teams:", error);
    }
  };

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (search) params.search = search;
      if (status) params.status = status;

      const { data } = await api.get("/matches", { params });
      setMatches(data.data);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Failed to fetch matches:", error);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => { setEditingMatch(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (match: Match) => {
    setEditingMatch(match);
    setForm({
      homeTeam: getTeamId(match.homeTeam),
      awayTeam: getTeamId(match.awayTeam),
      matchDate: match.matchDate ? new Date(match.matchDate).toISOString().slice(0, 16) : "",
      venue: match.venue || "",
      competition: typeof match.competition === "string" ? match.competition : "",
      season: typeof match.season === "string" ? match.season : "",
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.homeTeam || !form.awayTeam) { showToast("Both teams are required", "error"); return; }
    setSaving(true);
    try {
      const payload = {
        homeTeam: form.homeTeam,
        awayTeam: form.awayTeam,
        matchDate: form.matchDate || undefined,
        venue: form.venue || undefined,
        competition: form.competition || undefined,
        season: form.season || undefined,
      };
      if (editingMatch) {
        await api.patch(`/matches/${editingMatch._id}`, payload);
        showToast("Match updated", "success");
      } else {
        await api.post("/matches", payload);
        showToast("Match created", "success");
      }
      setShowModal(false);
      fetchMatches();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to save match", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (match: Match) => {
    if (!confirm("Delete this match?")) return;
    try {
      await api.delete(`/matches/${match._id}`);
      showToast("Match deleted", "success");
      fetchMatches();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to delete match", "error");
    }
  };

  const columns: Column<Match>[] = [
    {
      key: "teams",
      header: "Match",
      render: (match) => (
        <div>
          <p className="font-medium">{getTeamName(match.homeTeam)} vs {getTeamName(match.awayTeam)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {match.status === "SCHEDULED" ? formatDate(match.matchDate) : formatDateTime(match.matchDate)}
          </p>
        </div>
      ),
    },
    {
      key: "score",
      header: "Score",
      render: (match) => (
        <span className="font-bold text-lg">
          {match.status === "SCHEDULED" ? "—" : `${match.homeScore} - ${match.awayScore}`}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (match) => {
        const variants: Record<string, "default" | "live" | "warning" | "success" | "danger"> = {
          SCHEDULED: "default", LIVE: "live", HT: "warning", FT: "success", POSTPONED: "warning", CANCELLED: "danger",
        };
        return <Badge variant={variants[match.status] || "default"}>{match.status}</Badge>;
      },
    },
    {
      key: "venue",
      header: "Venue",
      render: (match) => <span className="text-sm text-gray-600 dark:text-gray-400">{match.venue || "—"}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (match) => (
        <div className="flex items-center justify-end gap-1">
          {match.status === "LIVE" && (
            <Link href={`/admin/matches/${match._id}/live`} onClick={(e) => e.stopPropagation()}>
              <span className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 inline-flex">
                <Radio className="h-4 w-4" />
              </span>
            </Link>
          )}
          <button onClick={(e) => { e.stopPropagation(); openEdit(match); }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
            <Pencil className="h-4 w-4" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleDelete(match); }} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Matches</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage matches and live games</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> Add Match</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <SearchInput placeholder="Search matches..." value={search} onChange={(v) => { setSearch(v); setPage(1); }} className="flex-1 max-w-md" />
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm">
          {statusOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <DataTable columns={columns} data={matches} currentPage={page} totalPages={totalPages} onPageChange={setPage} loading={loading} emptyMessage="No matches found" />
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingMatch ? "Edit Match" : "Create Match"}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Home Team</label>
            <select value={form.homeTeam} onChange={(e) => setForm({ ...form, homeTeam: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm">
              <option value="">Select home team</option>
              {teams.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Away Team</label>
            <select value={form.awayTeam} onChange={(e) => setForm({ ...form, awayTeam: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm">
              <option value="">Select away team</option>
              {teams.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Match Date</label>
              <input type="datetime-local" value={form.matchDate} onChange={(e) => setForm({ ...form, matchDate: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Venue</label>
              <input type="text" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} placeholder="e.g. Old Trafford" className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button loading={saving} onClick={handleSubmit}>{editingMatch ? "Save Changes" : "Create Match"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
