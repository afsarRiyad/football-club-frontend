"use client";

import React, { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import api from "@/lib/api";
import { Season, Club } from "@/types";
import { useToast } from "@/context/ToastContext";
import { Button, Badge, Modal, SearchInput } from "@/components/ui";
import DataTable, { Column } from "@/components/ui/DataTable";
import { formatDate } from "@/lib/utils";

interface SeasonForm {
  name: string;
  year: string;
  club: string;
  startDate: string;
  endDate: string;
}

const emptyForm: SeasonForm = { name: "", year: "", club: "", startDate: "", endDate: "" };

export default function AdminSeasonsPage() {
  const { showToast } = useToast();
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Season | null>(null);
  const [form, setForm] = useState<SeasonForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchClubs();
    fetchSeasons();
  }, [search, page]);

  const fetchClubs = async () => {
    try {
      const { data } = await api.get("/clubs", { params: { limit: 100 } });
      setClubs(data.data);
    } catch (error) {
      console.error("Failed to fetch clubs:", error);
    }
  };

  const fetchSeasons = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (search) params.search = search;

      const { data } = await api.get("/seasons", { params });
      setSeasons(data.data);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Failed to fetch seasons:", error);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (season: Season) => {
    setEditing(season);
    setForm({
      name: season.name,
      year: season.year?.toString() || "",
      club: typeof season.club === "string" ? season.club : season.club._id,
      startDate: season.startDate ? season.startDate.split("T")[0] : "",
      endDate: season.endDate ? season.endDate.split("T")[0] : "",
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.name) { showToast("Name is required", "error"); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        year: form.year ? Number(form.year) : undefined,
        club: form.club || undefined,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
      };
      if (editing) {
        await api.patch(`/seasons/${editing._id}`, payload);
        showToast("Season updated", "success");
      } else {
        await api.post("/seasons", payload);
        showToast("Season created", "success");
      }
      setShowModal(false);
      fetchSeasons();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to save season", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (season: Season) => {
    if (!confirm(`Delete season "${season.name}"?`)) return;
    try {
      await api.delete(`/seasons/${season._id}`);
      showToast("Season deleted", "success");
      fetchSeasons();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to delete season", "error");
    }
  };

  const columns: Column<Season>[] = [
    {
      key: "name",
      header: "Season",
      sortable: true,
      render: (season) => (
        <div>
          <p className="font-medium">{season.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Year {season.year}</p>
        </div>
      ),
    },
    {
      key: "club",
      header: "Club",
      render: (season) => {
        const club = typeof season.club === "string" ? clubs.find((c) => c._id === season.club) : season.club;
        return <span className="text-sm text-gray-600 dark:text-gray-400">{club?.name || "—"}</span>;
      },
    },
    {
      key: "dates",
      header: "Dates",
      render: (season) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {season.startDate ? formatDate(season.startDate) : "—"} — {season.endDate ? formatDate(season.endDate) : "—"}
        </span>
      ),
    },
    {
      key: "isActive",
      header: "Status",
      render: (season) => (
        <Badge variant={season.isActive ? "success" : "default"}>
          {season.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (season) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={(e) => { e.stopPropagation(); openEdit(season); }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
            <Pencil className="h-4 w-4" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleDelete(season); }} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500">
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Seasons</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage seasons and year groups</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> Add Season</Button>
      </div>

      <div className="mb-6">
        <SearchInput placeholder="Search seasons..." value={search} onChange={(v) => { setSearch(v); setPage(1); }} className="max-w-md" />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <DataTable columns={columns} data={seasons} currentPage={page} totalPages={totalPages} onPageChange={setPage} loading={loading} emptyMessage="No seasons found" />
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? "Edit Season" : "Create Season"}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. 2024/25" className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year</label>
              <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="e.g. 2024" className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Club</label>
              <select value={form.club} onChange={(e) => setForm({ ...form, club: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm">
                <option value="">No club</option>
                {clubs.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
              <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
              <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm" />
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
