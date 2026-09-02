"use client";

import React, { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import api from "@/lib/api";
import { Competition, Club, CompetitionType } from "@/types";
import { useToast } from "@/context/ToastContext";
import { Button, Badge, Modal, SearchInput } from "@/components/ui";
import DataTable, { Column } from "@/components/ui/DataTable";

const typeOptions: { value: string; label: string }[] = [
  { value: "", label: "All Types" },
  { value: "LEAGUE", label: "League" },
  { value: "CUP", label: "Cup" },
  { value: "FRIENDLY", label: "Friendly" },
  { value: "TOURNAMENT", label: "Tournament" },
];

interface CompetitionForm {
  name: string;
  type: CompetitionType;
  club: string;
  season: string;
  format: string;
}

const emptyForm: CompetitionForm = { name: "", type: "LEAGUE", club: "", season: "", format: "" };

export default function AdminCompetitionsPage() {
  const { showToast } = useToast();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Competition | null>(null);
  const [form, setForm] = useState<CompetitionForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchClubs();
    fetchCompetitions();
  }, [search, type, page]);

  const fetchClubs = async () => {
    try {
      const { data } = await api.get("/clubs", { params: { limit: 100 } });
      setClubs(data.data);
    } catch (error) {
      console.error("Failed to fetch clubs:", error);
    }
  };

  const fetchCompetitions = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (search) params.search = search;
      if (type) params.type = type;

      const { data } = await api.get("/competitions", { params });
      setCompetitions(data.data);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Failed to fetch competitions:", error);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (comp: Competition) => {
    setEditing(comp);
    setForm({
      name: comp.name,
      type: comp.type,
      club: typeof comp.club === "string" ? comp.club : comp.club._id,
      season: typeof comp.season === "string" ? comp.season : "",
      format: comp.format || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.name) { showToast("Name is required", "error"); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        type: form.type,
        club: form.club || undefined,
        season: form.season || undefined,
        format: form.format || undefined,
      };
      if (editing) {
        await api.patch(`/competitions/${editing._id}`, payload);
        showToast("Competition updated", "success");
      } else {
        await api.post("/competitions", payload);
        showToast("Competition created", "success");
      }
      setShowModal(false);
      fetchCompetitions();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to save competition", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (comp: Competition) => {
    if (!confirm(`Delete competition "${comp.name}"?`)) return;
    try {
      await api.delete(`/competitions/${comp._id}`);
      showToast("Competition deleted", "success");
      fetchCompetitions();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to delete competition", "error");
    }
  };

  const columns: Column<Competition>[] = [
    {
      key: "name",
      header: "Competition",
      sortable: true,
      render: (comp) => <p className="font-medium">{comp.name}</p>,
    },
    {
      key: "type",
      header: "Type",
      render: (comp) => {
        const colors: Record<string, "info" | "success" | "warning" | "default"> = {
          LEAGUE: "info", CUP: "warning", FRIENDLY: "default", TOURNAMENT: "success",
        };
        return <Badge variant={colors[comp.type] || "default"}>{comp.type}</Badge>;
      },
    },
    {
      key: "club",
      header: "Club",
      render: (comp) => {
        const club = typeof comp.club === "string" ? clubs.find((c) => c._id === comp.club) : comp.club;
        return <span className="text-sm text-gray-600 dark:text-gray-400">{club?.name || "—"}</span>;
      },
    },
    {
      key: "format",
      header: "Format",
      render: (comp) => <span className="text-sm text-gray-600 dark:text-gray-400">{comp.format || "—"}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (comp) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={(e) => { e.stopPropagation(); openEdit(comp); }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
            <Pencil className="h-4 w-4" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleDelete(comp); }} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500">
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Competitions</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage leagues, cups, and tournaments</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> Add Competition</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <SearchInput placeholder="Search competitions..." value={search} onChange={(v) => { setSearch(v); setPage(1); }} className="flex-1 max-w-md" />
        <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm">
          {typeOptions.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <DataTable columns={columns} data={competitions} currentPage={page} totalPages={totalPages} onPageChange={setPage} loading={loading} emptyMessage="No competitions found" />
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? "Edit Competition" : "Create Competition"}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Premier League" className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as CompetitionType })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm">
                {typeOptions.filter((t) => t.value).map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Club</label>
              <select value={form.club} onChange={(e) => setForm({ ...form, club: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm">
                <option value="">No club</option>
                {clubs.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Format</label>
            <input type="text" value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })} placeholder="e.g. Round Robin" className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm" />
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
