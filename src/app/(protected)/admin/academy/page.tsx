"use client";

import React, { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import api from "@/lib/api";
import { Academy, Club, Player } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Button, Badge, Modal, SearchInput } from "@/components/ui";
import DataTable, { Column } from "@/components/ui/DataTable";
import { formatDate } from "@/lib/utils";

interface AcademyForm {
  name: string;
  ageGroup: string;
  headCoach: string;
  schedule: string;
  club: string;
}

const emptyForm: AcademyForm = { name: "", ageGroup: "", headCoach: "", schedule: "", club: "" };

export default function AdminAcademyPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [academies, setAcademies] = useState<Academy[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Academy | null>(null);
  const [form, setForm] = useState<AcademyForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchClubs();
    fetchAcademies();
  }, [search, page]);

  const fetchClubs = async () => {
    try {
      const { data } = await api.get("/clubs", { params: { limit: 100 } });
      setClubs(data.data);
    } catch (error) {
      console.error("Failed to fetch clubs:", error);
    }
  };

  const fetchAcademies = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (search) params.search = search;

      const { data } = await api.get("/academy", { params });
      setAcademies(data.data);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Failed to fetch academies:", error);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (academy: Academy) => {
    setEditing(academy);
    setForm({
      name: academy.name,
      ageGroup: academy.ageGroup || "",
      headCoach: typeof academy.headCoach === "string" ? academy.headCoach : "",
      schedule: academy.schedule || "",
      club: typeof academy.club === "string" ? academy.club : academy.club._id,
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.name) { showToast("Name is required", "error"); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        ageGroup: form.ageGroup || undefined,
        headCoach: form.headCoach || undefined,
        schedule: form.schedule || undefined,
        club: form.club || undefined,
      };
      if (editing) {
        await api.patch(`/academy/${editing._id}`, payload);
        showToast("Academy updated", "success");
      } else {
        await api.post("/academy", payload);
        showToast("Academy created", "success");
      }
      setShowModal(false);
      fetchAcademies();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to save academy", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (academy: Academy) => {
    if (!confirm(`Delete academy "${academy.name}"?`)) return;
    try {
      await api.delete(`/academy/${academy._id}`);
      showToast("Academy deleted", "success");
      fetchAcademies();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to delete academy", "error");
    }
  };

  const columns: Column<Academy>[] = [
    {
      key: "name",
      header: "Academy",
      sortable: true,
      render: (academy) => (
        <div>
          <p className="font-medium">{academy.name}</p>
          {academy.ageGroup && <p className="text-xs text-gray-500 dark:text-gray-400">Ages: {academy.ageGroup}</p>}
        </div>
      ),
    },
    {
      key: "headCoach",
      header: "Head Coach",
      render: (academy) => {
        const coach = typeof academy.headCoach === "string" ? academy.headCoach : academy.headCoach?.name;
        return <span className="text-sm text-gray-600 dark:text-gray-400">{coach || "—"}</span>;
      },
    },
    {
      key: "schedule",
      header: "Schedule",
      render: (academy) => <span className="text-sm text-gray-600 dark:text-gray-400">{academy.schedule || "—"}</span>,
    },
    {
      key: "players",
      header: "Players",
      render: (academy) => <span className="text-sm text-gray-600 dark:text-gray-400">{academy.players?.length || 0}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (academy) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={(e) => { e.stopPropagation(); openEdit(academy); }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
            <Pencil className="h-4 w-4" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleDelete(academy); }} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500">
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Academy</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage youth academy programs</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> Add Program</Button>
      </div>

      <div className="mb-6">
        <SearchInput placeholder="Search academies..." value={search} onChange={(v) => { setSearch(v); setPage(1); }} className="max-w-md" />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <DataTable columns={columns} data={academies} currentPage={page} totalPages={totalPages} onPageChange={setPage} loading={loading} emptyMessage="No academy programs found" />
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? "Edit Academy" : "New Academy Program"}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm" placeholder="e.g. Under-16 Academy" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Age Group</label>
              <input type="text" value={form.ageGroup} onChange={(e) => setForm({ ...form, ageGroup: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm" placeholder="e.g. 14-16" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Club</label>
              <select value={form.club} onChange={(e) => setForm({ ...form, club: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm">
                <option value="">Select club</option>
                {clubs.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Schedule</label>
            <input type="text" value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm" placeholder="e.g. Mon/Wed/Fri 4-6pm" />
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
