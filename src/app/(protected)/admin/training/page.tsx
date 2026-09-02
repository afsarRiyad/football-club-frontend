"use client";

import React, { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import api from "@/lib/api";
import { TrainingSession, Club, Team, TrainingType, TrainingStatus } from "@/types";
import { useToast } from "@/context/ToastContext";
import { Button, Badge, Modal, SearchInput } from "@/components/ui";
import DataTable, { Column } from "@/components/ui/DataTable";
import { formatDate } from "@/lib/utils";

const typeOptions: { value: string; label: string }[] = [
  { value: "", label: "All Types" },
  { value: "PRACTICE", label: "Practice" },
  { value: "TACTICAL", label: "Tactical" },
  { value: "FITNESS", label: "Fitness" },
  { value: "RECOVERY", label: "Recovery" },
  { value: "OTHER", label: "Other" },
];

interface TrainingForm {
  title: string;
  date: string;
  type: TrainingType;
  club: string;
  team: string;
  status: TrainingStatus;
}

const emptyForm: TrainingForm = { title: "", date: "", type: "PRACTICE", club: "", team: "", status: "SCHEDULED" };

export default function AdminTrainingPage() {
  const { showToast } = useToast();
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<TrainingSession | null>(null);
  const [form, setForm] = useState<TrainingForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchClubs();
    fetchTeams();
    fetchSessions();
  }, [search, type, page]);

  const fetchClubs = async () => {
    try {
      const { data } = await api.get("/clubs", { params: { limit: 100 } });
      setClubs(data.data);
    } catch (error) {
      console.error("Failed to fetch clubs:", error);
    }
  };

  const fetchTeams = async () => {
    try {
      const { data } = await api.get("/teams", { params: { limit: 200 } });
      setTeams(data.data);
    } catch (error) {
      console.error("Failed to fetch teams:", error);
    }
  };

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (search) params.search = search;
      if (type) params.type = type;

      const { data } = await api.get("/training", { params });
      setSessions(data.data);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Failed to fetch training sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (session: TrainingSession) => {
    setEditing(session);
    setForm({
      title: session.title,
      date: session.date ? new Date(session.date).toISOString().slice(0, 16) : "",
      type: session.type,
      club: typeof session.club === "string" ? session.club : session.club._id,
      team: typeof session.team === "string" ? session.team : session.team._id,
      status: session.status,
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.title) { showToast("Title is required", "error"); return; }
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        date: form.date || undefined,
        type: form.type,
        club: form.club || undefined,
        team: form.team || undefined,
        status: form.status,
      };
      if (editing) {
        await api.patch(`/training/${editing._id}`, payload);
        showToast("Training session updated", "success");
      } else {
        await api.post("/training", payload);
        showToast("Training session created", "success");
      }
      setShowModal(false);
      fetchSessions();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to save session", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (session: TrainingSession) => {
    if (!confirm(`Delete training session "${session.title}"?`)) return;
    try {
      await api.delete(`/training/${session._id}`);
      showToast("Session deleted", "success");
      fetchSessions();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to delete session", "error");
    }
  };

  const columns: Column<TrainingSession>[] = [
    {
      key: "title",
      header: "Session",
      sortable: true,
      render: (session) => (
        <div>
          <p className="font-medium">{session.title}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(session.date)}</p>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (session) => {
        const colors: Record<string, "info" | "success" | "warning" | "danger" | "default"> = {
          PRACTICE: "info", TACTICAL: "success", FITNESS: "warning", RECOVERY: "default", OTHER: "default",
        };
        return <Badge variant={colors[session.type] || "default"}>{session.type}</Badge>;
      },
    },
    {
      key: "team",
      header: "Team",
      render: (session) => {
        const team = typeof session.team === "string" ? teams.find((t) => t._id === session.team) : session.team;
        return <span className="text-sm text-gray-600 dark:text-gray-400">{team?.name || "—"}</span>;
      },
    },
    {
      key: "status",
      header: "Status",
      render: (session) => {
        const colors: Record<string, "success" | "warning" | "danger"> = { SCHEDULED: "warning", COMPLETED: "success", CANCELLED: "danger" };
        return <Badge variant={colors[session.status] || "default"}>{session.status}</Badge>;
      },
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (session) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={(e) => { e.stopPropagation(); openEdit(session); }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
            <Pencil className="h-4 w-4" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleDelete(session); }} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500">
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Training</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage training sessions</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> New Session</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <SearchInput placeholder="Search sessions..." value={search} onChange={(v) => { setSearch(v); setPage(1); }} className="flex-1 max-w-md" />
        <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm">
          {typeOptions.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <DataTable columns={columns} data={sessions} currentPage={page} totalPages={totalPages} onPageChange={setPage} loading={loading} emptyMessage="No training sessions found" />
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? "Edit Session" : "New Training Session"}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm" placeholder="e.g. Morning Practice" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date & Time</label>
              <input type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as TrainingType })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm">
                {typeOptions.filter((t) => t.value).map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Club</label>
              <select value={form.club} onChange={(e) => setForm({ ...form, club: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm">
                <option value="">Select club</option>
                {clubs.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Team</label>
              <select value={form.team} onChange={(e) => setForm({ ...form, team: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm">
                <option value="">Select team</option>
                {teams.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button loading={saving} onClick={handleSubmit}>{editing ? "Save Changes" : "Create"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
