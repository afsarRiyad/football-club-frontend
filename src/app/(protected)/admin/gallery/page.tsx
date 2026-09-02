"use client";

import React, { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Image as ImageIcon } from "lucide-react";
import api from "@/lib/api";
import { Gallery, Club } from "@/types";
import { useToast } from "@/context/ToastContext";
import { Button, Modal, SearchInput, FileUpload } from "@/components/ui";
import DataTable, { Column } from "@/components/ui/DataTable";
import { formatDate } from "@/lib/utils";

const categoryOptions = ["Match", "Training", "Event", "Team", "Other"];

interface GalleryForm {
  title: string;
  description: string;
  category: string;
  club: string;
}

const emptyForm: GalleryForm = { title: "", description: "", category: "", club: "" };

export default function AdminGalleryPage() {
  const { showToast } = useToast();
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Gallery | null>(null);
  const [form, setForm] = useState<GalleryForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);

  useEffect(() => {
    fetchClubs();
    fetchGalleries();
  }, [search, page]);

  const fetchClubs = async () => {
    try {
      const { data } = await api.get("/clubs", { params: { limit: 100 } });
      setClubs(data.data);
    } catch (error) {
      console.error("Failed to fetch clubs:", error);
    }
  };

  const fetchGalleries = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (search) params.search = search;

      const { data } = await api.get("/gallery", { params });
      setGalleries(data.data);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Failed to fetch galleries:", error);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => { setEditing(null); setForm(emptyForm); setMediaFiles([]); setShowModal(true); };
  const openEdit = (gallery: Gallery) => {
    setEditing(gallery);
    setForm({
      title: gallery.title,
      description: gallery.description || "",
      category: gallery.category || "",
      club: typeof gallery.club === "string" ? gallery.club : gallery.club._id,
    });
    setMediaFiles([]);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.title) { showToast("Title is required", "error"); return; }
    setSaving(true);
    try {
      let mediaUrls: any[] = [];

      // Upload media files
      if (mediaFiles.length > 0) {
        const formData = new FormData();
        mediaFiles.forEach((file) => formData.append("files", file));
        const { data: uploadData } = await api.post("/uploads/multiple", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        mediaUrls = uploadData.data.files.map((f: any) => ({
          url: f.url,
          type: f.type,
        }));
      }

      const payload: any = {
        title: form.title,
        description: form.description || undefined,
        category: form.category || undefined,
        club: form.club || undefined,
      };

      if (editing) {
        await api.patch(`/gallery/${editing._id}`, payload);
        // Add new media if uploaded
        if (mediaUrls.length > 0) {
          for (const media of mediaUrls) {
            await api.post(`/gallery/${editing._id}/media`, media);
          }
        }
        showToast("Gallery updated", "success");
      } else {
        payload.media = mediaUrls;
        await api.post("/gallery", payload);
        showToast("Gallery created", "success");
      }
      setShowModal(false);
      fetchGalleries();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to save gallery", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (gallery: Gallery) => {
    if (!confirm(`Delete gallery "${gallery.title}"?`)) return;
    try {
      await api.delete(`/gallery/${gallery._id}`);
      showToast("Gallery deleted", "success");
      fetchGalleries();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to delete gallery", "error");
    }
  };

  const columns: Column<Gallery>[] = [
    {
      key: "title",
      header: "Gallery",
      sortable: true,
      render: (gallery) => (
        <div className="flex items-center gap-3">
          {gallery.media?.[0]?.url ? (
            <img src={gallery.media[0].url} alt={gallery.title} className="h-10 w-10 rounded-lg object-cover" />
          ) : (
            <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <ImageIcon className="h-5 w-5 text-gray-400" />
            </div>
          )}
          <div>
            <p className="font-medium">{gallery.title}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{gallery.media?.length || 0} media items</p>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (gallery) => gallery.category || <span className="text-gray-400">—</span>,
    },
    {
      key: "club",
      header: "Club",
      render: (gallery) => {
        const club = typeof gallery.club === "string" ? clubs.find((c) => c._id === gallery.club) : gallery.club;
        return <span className="text-sm text-gray-600 dark:text-gray-400">{club?.name || "—"}</span>;
      },
    },
    {
      key: "createdAt",
      header: "Created",
      render: (gallery) => <span className="text-sm text-gray-600 dark:text-gray-400">{formatDate(gallery.createdAt)}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (gallery) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={(e) => { e.stopPropagation(); openEdit(gallery); }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
            <Pencil className="h-4 w-4" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleDelete(gallery); }} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500">
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gallery</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage photo and video galleries</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> New Gallery</Button>
      </div>

      <div className="mb-6">
        <SearchInput placeholder="Search galleries..." value={search} onChange={(v) => { setSearch(v); setPage(1); }} className="max-w-md" />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <DataTable columns={columns} data={galleries} currentPage={page} totalPages={totalPages} onPageChange={setPage} loading={loading} emptyMessage="No galleries found" />
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? "Edit Gallery" : "New Gallery"}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm" placeholder="Gallery title" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm" rows={2} placeholder="Optional description" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm">
                <option value="">No category</option>
                {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Media Files</label>
            <FileUpload accept="image/*,video/*" multiple maxFiles={20} onFilesSelected={setMediaFiles} />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button loading={saving} onClick={handleSubmit}>{editing ? "Save Changes" : "Create Gallery"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
