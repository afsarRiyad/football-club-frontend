"use client";

import React, { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import api from "@/lib/api";
import { Team, Club, TeamCategory, Player } from "@/types";
import { useToast } from "@/context/ToastContext";
import { Button, Input, Badge, Modal, SearchInput } from "@/components/ui";
import DataTable, { Column } from "@/components/ui/DataTable";

const categories: { value: string; label: string }[] = [
  { value: "", label: "All Categories" },
  { value: "SENIOR", label: "Senior" },
  { value: "JUNIOR", label: "Junior" },
  { value: "WOMEN", label: "Women" },
  { value: "ACADEMY", label: "Academy" },
  { value: "RESERVE", label: "Reserve" },
];

interface TeamForm {
  name: string;
  category: TeamCategory;
  division: string;
  club: string;
}

const emptyForm: TeamForm = { name: "", category: "SENIOR", division: "", club: "" };

export default function AdminTeamsPage() {
  const { showToast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [form, setForm] = useState<TeamForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchClubs();
    fetchTeams();
  }, [search, category, page]);

  const fetchClubs = async () => {
    try {
      const { data } = await api.get("/clubs", { params: { limit: 100 } });
      setClubs(data.data);
    } catch (error) {
      console.error("Failed to fetch clubs:", error);
    }
  };

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (search) params.search = search;
      if (category) params.category = category;

      const { data } = await api.get("/teams", { params });
      setTeams(data.data);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Failed to fetch teams:", error);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => { setEditingTeam(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (team: Team) => {
    setEditingTeam(team);
    setForm({
      name: team.name,
      category: team.category,
      division: team.division || "",
      club: typeof team.club === "string" ? team.club : team.club._id,
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.name) { showToast("Team name is required", "error"); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        category: form.category,
        division: form.division || undefined,
        club: form.club || undefined,
      };
      if (editingTeam) {
        await api.patch(`/teams/${editingTeam._id}`, payload);
        showToast("Team updated", "success");
      } else {
        await api.post("/teams", payload);
        showToast("Team created", "success");
      }
      setShowModal(false);
      fetchTeams();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to save team", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (team: Team) => {
    if (!confirm(`Delete team "${team.name}"?`)) return;
    try {
      await api.delete(`/teams/${team._id}`);
      showToast("Team deleted", "success");
      fetchTeams();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to delete team", "error");
    }
  };

  const columns: Column<Team>[] = [
    {
      key: "name",
      header: "Team",
      sortable: true,
      render: (team) => (
        <div>
          <p className="font-medium">{team.name}</p>
          {team.division && <p className="text-xs text-gray-500 dark:text-gray-400">{team.division}</p>}
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (team) => {
        const colors: Record<string, "info" | "success" | "warning" | "default"> = {
          SENIOR: "info", JUNIOR: "success", WOMEN: "warning", ACADEMY: "default", RESERVE: "default",
        };
        return <Badge variant={colors[team.category] || "default"}>{team.category}</Badge>;
      },
    },
    {
      key: "club",
      header: "Club",
      render: (team) => {
        const club = typeof team.club === "string" ? clubs.find((c) => c._id === team.club) : team.club;
        return <span className="text-sm text-gray-600 dark:text-gray-400">{club?.name || "—"}</span>;
      },
    },
    {
      key: "players",
      header: "Players",
      render: (team) => (
        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
          <Users className="h-4 w-4" />
          <span>{team.players?.length || 0}</span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (team) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={(e) => { e.stopPropagation(); openEdit(team); }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
            <Pencil className="h-4 w-4" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleDelete(team); }} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500">
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Teams</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage teams within clubs</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> Add Team</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <SearchInput placeholder="Search teams..." value={search} onChange={(v) => { setSearch(v); setPage(1); }} className="flex-1 max-w-md" />
        <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm">
          {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <DataTable columns={columns} data={teams} currentPage={page} totalPages={totalPages} onPageChange={setPage} loading={loading} emptyMessage="No teams found" />
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingTeam ? "Edit Team" : "Create Team"}>
        <div className="space-y-4">
          <Input label="Team Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. First Team" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as TeamCategory })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm">
                {categories.filter((c) => c.value).map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <Input label="Division" value={form.division} onChange={(e) => setForm({ ...form, division: e.target.value })} placeholder="e.g. Premier League" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Club</label>
            <select value={form.club} onChange={(e) => setForm({ ...form, club: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm">
              <option value="">Select club</option>
              {clubs.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button loading={saving} onClick={handleSubmit}>{editingTeam ? "Save Changes" : "Create Team"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
