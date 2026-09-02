"use client";

import React, { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import api from "@/lib/api";
import { Club } from "@/types";
import { useToast } from "@/context/ToastContext";
import { Button, Input, Modal, SearchInput, PageSpinner } from "@/components/ui";
import DataTable, { Column } from "@/components/ui/DataTable";

interface ClubFormData {
  name: string;
  description: string;
  founded: string;
  stadium: string;
  email: string;
  phone: string;
  website: string;
  country: string;
  city: string;
}

const emptyForm: ClubFormData = {
  name: "",
  description: "",
  founded: "",
  stadium: "",
  email: "",
  phone: "",
  website: "",
  country: "",
  city: "",
};

export default function AdminClubsPage() {
  const { showToast } = useToast();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const [form, setForm] = useState<ClubFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchClubs();
  }, [search, page]);

  const fetchClubs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/clubs", { params: { search, page, limit: 20 } });
      setClubs(data.data);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Failed to fetch clubs:", error);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingClub(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (club: Club) => {
    setEditingClub(club);
    setForm({
      name: club.name,
      description: club.description || "",
      founded: club.founded?.toString() || "",
      stadium: club.stadium || "",
      email: club.contact?.email || "",
      phone: club.contact?.phone || "",
      website: club.contact?.website || "",
      country: club.location?.country || "",
      city: club.location?.city || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const payload: any = {
        name: form.name,
        description: form.description || undefined,
        founded: form.founded ? Number(form.founded) : undefined,
        stadium: form.stadium || undefined,
        contact: {
          email: form.email || undefined,
          phone: form.phone || undefined,
          website: form.website || undefined,
        },
        location: {
          country: form.country || undefined,
          city: form.city || undefined,
        },
      };

      if (editingClub) {
        await api.patch(`/clubs/${editingClub._id}`, payload);
        showToast("Club updated", "success");
      } else {
        await api.post("/clubs", payload);
        showToast("Club created", "success");
      }
      setShowModal(false);
      fetchClubs();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to save club", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (club: Club) => {
    if (!confirm(`Delete club "${club.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/clubs/${club._id}`);
      showToast("Club deleted", "success");
      fetchClubs();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to delete club", "error");
    }
  };

  const columns: Column<Club>[] = [
    {
      key: "name",
      header: "Club",
      sortable: true,
      render: (club) => (
        <div className="flex items-center gap-3">
          {club.logo ? (
            <img src={club.logo} alt={club.name} className="h-8 w-8 rounded-full object-cover" />
          ) : (
            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-500">{club.name.charAt(0)}</span>
            </div>
          )}
          <div>
            <p className="font-medium">{club.name}</p>
            {club.stadium && <p className="text-xs text-gray-500 dark:text-gray-400">{club.stadium}</p>}
          </div>
        </div>
      ),
    },
    {
      key: "location",
      header: "Location",
      render: (club) => {
        const loc = club.location ? [club.location.city, club.location.country].filter(Boolean).join(", ") : "—";
        return <span className="text-gray-600 dark:text-gray-400">{loc}</span>;
      },
    },
    {
      key: "founded",
      header: "Founded",
      sortable: true,
      render: (club) => <span className="text-gray-600 dark:text-gray-400">{club.founded || "—"}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (club) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); openEdit(club); }}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(club); }}
            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
          >
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Clubs</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage football clubs</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> Add Club
        </Button>
      </div>

      <div className="mb-6">
        <SearchInput
          placeholder="Search clubs..."
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          className="max-w-md"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <DataTable
          columns={columns}
          data={clubs}
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          loading={loading}
          emptyMessage="No clubs found"
        />
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingClub ? "Edit Club" : "Create Club"}
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          <Input
            label="Club Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Manchester United"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              rows={3}
              placeholder="About the club..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Founded"
              type="number"
              value={form.founded}
              onChange={(e) => setForm({ ...form, founded: e.target.value })}
              placeholder="e.g. 1878"
            />
            <Input
              label="Stadium"
              value={form.stadium}
              onChange={(e) => setForm({ ...form, stadium: e.target.value })}
              placeholder="e.g. Old Trafford"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Country"
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              placeholder="e.g. England"
            />
            <Input
              label="City"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="e.g. Manchester"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Contact Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="email@example.com"
            />
            <Input
              label="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+1 234 567 890"
            />
          </div>
          <Input
            label="Website"
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            placeholder="https://example.com"
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button loading={saving} onClick={handleSubmit}>
              {editingClub ? "Save Changes" : "Create Club"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
