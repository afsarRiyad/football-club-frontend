"use client";

import React, { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import api from "@/lib/api";
import { Statistic, Club, Player, Team, StatisticType } from "@/types";
import { useToast } from "@/context/ToastContext";
import { Button, Badge, Modal, SearchInput } from "@/components/ui";
import DataTable, { Column } from "@/components/ui/DataTable";

const statTypes: { value: string; label: string }[] = [
  { value: "", label: "All Types" },
  { value: "GOALS", label: "Goals" },
  { value: "ASSISTS", label: "Assists" },
  { value: "CLEAN_SHEETS", label: "Clean Sheets" },
  { value: "YELLOW_CARDS", label: "Yellow Cards" },
  { value: "RED_CARDS", label: "Red Cards" },
  { value: "APPEARANCES", label: "Appearances" },
  { value: "MINUTES_PLAYED", label: "Minutes Played" },
];

interface StatForm {
  club: string;
  player: string;
  team: string;
  type: StatisticType;
  value: string;
  season: string;
  competition: string;
}

const emptyForm: StatForm = { club: "", player: "", team: "", type: "GOALS", value: "", season: "", competition: "" };

function getPlayerName(player: string | Player): string {
  if (typeof player === "string") return player;
  return `${player.firstName} ${player.lastName}`;
}

export default function AdminStatisticsPage() {
  const { showToast } = useToast();
  const [stats, setStats] = useState<Statistic[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Statistic | null>(null);
  const [form, setForm] = useState<StatForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDropdowns();
    fetchStats();
  }, [search, type, page]);

  const fetchDropdowns = async () => {
    try {
      const [clubsRes, playersRes, teamsRes] = await Promise.all([
        api.get("/clubs", { params: { limit: 100 } }),
        api.get("/players", { params: { limit: 500 } }),
        api.get("/teams", { params: { limit: 200 } }),
      ]);
      setClubs(clubsRes.data.data);
      setPlayers(playersRes.data.data);
      setTeams(teamsRes.data.data);
    } catch (error) {
      console.error("Failed to fetch dropdown data:", error);
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (search) params.search = search;
      if (type) params.type = type;

      const { data } = await api.get("/statistics", { params });
      setStats(data.data);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Failed to fetch statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (stat: Statistic) => {
    setEditing(stat);
    setForm({
      club: typeof stat.club === "string" ? stat.club : stat.club._id,
      player: typeof stat.player === "string" ? stat.player : stat.player._id,
      team: typeof stat.team === "string" ? stat.team : stat.team?._id || "",
      type: stat.type,
      value: stat.value?.toString() || "",
      season: typeof stat.season === "string" ? stat.season : "",
      competition: typeof stat.competition === "string" ? stat.competition : "",
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.player || !form.type || !form.value) {
      showToast("Player, type, and value are required", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        club: form.club || undefined,
        player: form.player,
        team: form.team || undefined,
        type: form.type,
        value: Number(form.value),
        season: form.season || undefined,
        competition: form.competition || undefined,
      };
      if (editing) {
        await api.patch(`/statistics/${editing._id}`, payload);
        showToast("Statistic updated", "success");
      } else {
        await api.post("/statistics", payload);
        showToast("Statistic created", "success");
      }
      setShowModal(false);
      fetchStats();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to save statistic", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (stat: Statistic) => {
    if (!confirm("Delete this statistic?")) return;
    try {
      await api.delete(`/statistics/${stat._id}`);
      showToast("Statistic deleted", "success");
      fetchStats();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to delete statistic", "error");
    }
  };

  const columns: Column<Statistic>[] = [
    {
      key: "player",
      header: "Player",
      render: (stat) => (
        <p className="font-medium">{getPlayerName(stat.player)}</p>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (stat) => {
        const colors: Record<string, "default" | "info" | "success" | "warning" | "danger"> = {
          GOALS: "success", ASSISTS: "info", CLEAN_SHEETS: "success", YELLOW_CARDS: "warning", RED_CARDS: "danger", APPEARANCES: "default", MINUTES_PLAYED: "default",
        };
        return <Badge variant={colors[stat.type] || "default"}>{stat.type.replace(/_/g, " ")}</Badge>;
      },
    },
    {
      key: "value",
      header: "Value",
      render: (stat) => <span className="font-bold text-lg">{stat.value}</span>,
    },
    {
      key: "team",
      header: "Team",
      render: (stat) => {
        const team = typeof stat.team === "string" ? teams.find((t) => t._id === stat.team) : stat.team;
        return <span className="text-sm text-gray-600 dark:text-gray-400">{team?.name || "—"}</span>;
      },
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (stat) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={(e) => { e.stopPropagation(); openEdit(stat); }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
            <Pencil className="h-4 w-4" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleDelete(stat); }} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500">
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Statistics</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage player statistics and records</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> Add Statistic</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <SearchInput placeholder="Search statistics..." value={search} onChange={(v) => { setSearch(v); setPage(1); }} className="flex-1 max-w-md" />
        <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm">
          {statTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <DataTable columns={columns} data={stats} currentPage={page} totalPages={totalPages} onPageChange={setPage} loading={loading} emptyMessage="No statistics found" />
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? "Edit Statistic" : "Add Statistic"}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Player</label>
            <select value={form.player} onChange={(e) => setForm({ ...form, player: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm">
              <option value="">Select player</option>
              {players.map((p) => <option key={p._id} value={p._id}>{p.firstName} {p.lastName}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stat Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as StatisticType })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm">
                {statTypes.filter((t) => t.value).map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Value</label>
              <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm" placeholder="e.g. 10" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Club</label>
              <select value={form.club} onChange={(e) => setForm({ ...form, club: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm">
                <option value="">No club</option>
                {clubs.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Team</label>
              <select value={form.team} onChange={(e) => setForm({ ...form, team: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm">
                <option value="">No team</option>
                {teams.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Season</label>
              <input type="text" value={form.season} onChange={(e) => setForm({ ...form, season: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm" placeholder="e.g. 2024/25" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Competition</label>
              <input type="text" value={form.competition} onChange={(e) => setForm({ ...form, competition: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm" placeholder="e.g. Premier League" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button loading={saving} onClick={handleSubmit}>{editing ? "Save Changes" : "Add Statistic"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
