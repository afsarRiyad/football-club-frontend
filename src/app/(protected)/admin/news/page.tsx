"use client";

import React, { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import api from "@/lib/api";
import { News, Club } from "@/types";
import { useToast } from "@/context/ToastContext";
import { Button, Badge, Modal, SearchInput, FileUpload } from "@/components/ui";
import DataTable, { Column } from "@/components/ui/DataTable";
import { formatDate } from "@/lib/utils";

const categoryOptions = ["Transfer", "Match Report", "Interview", "Analysis", "Club News"];

interface NewsForm {
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string;
  club: string;
  isPublished: boolean;
}

const emptyForm: NewsForm = { title: "", content: "", excerpt: "", category: "", tags: "", club: "", isPublished: false };

export default function AdminNewsPage() {
  const { showToast } = useToast();
  const [articles, setArticles] = useState<News[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<News | null>(null);
  const [form, setForm] = useState<NewsForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [coverFile, setCoverFile] = useState<File[]>([]);

  useEffect(() => {
    fetchClubs();
    fetchArticles();
  }, [search, page]);

  const fetchClubs = async () => {
    try {
      const { data } = await api.get("/clubs", { params: { limit: 100 } });
      setClubs(data.data);
    } catch (error) {
      console.error("Failed to fetch clubs:", error);
    }
  };

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (search) params.search = search;

      const { data } = await api.get("/news", { params });
      setArticles(data.data);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Failed to fetch articles:", error);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => { setEditing(null); setForm(emptyForm); setCoverFile([]); setShowModal(true); };
  const openEdit = (article: News) => {
    setEditing(article);
    setForm({
      title: article.title,
      content: article.content,
      excerpt: article.excerpt || "",
      category: article.category || "",
      tags: article.tags?.join(", ") || "",
      club: typeof article.club === "string" ? article.club : article.club._id,
      isPublished: article.isPublished,
    });
    setCoverFile([]);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.content) { showToast("Title and content are required", "error"); return; }
    setSaving(true);
    try {
      let coverUrl = editing?.cover;

      // Upload cover if selected
      if (coverFile.length > 0) {
        const formData = new FormData();
        formData.append("file", coverFile[0]);
        const { data: uploadData } = await api.post("/uploads", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        coverUrl = uploadData.data.file.url;
      }

      const payload: any = {
        title: form.title,
        content: form.content,
        excerpt: form.excerpt || undefined,
        category: form.category || undefined,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
        club: form.club || undefined,
        isPublished: form.isPublished,
        cover: coverUrl,
      };

      if (editing) {
        await api.patch(`/news/${editing._id}`, payload);
        showToast("Article updated", "success");
      } else {
        await api.post("/news", payload);
        showToast("Article created", "success");
      }
      setShowModal(false);
      fetchArticles();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to save article", "error");
    } finally {
      setSaving(false);
    }
  };

  const handlePublishToggle = async (article: News) => {
    try {
      if (article.isPublished) {
        await api.patch(`/news/${article._id}/unpublish`);
        showToast("Article unpublished", "success");
      } else {
        await api.patch(`/news/${article._id}/publish`);
        showToast("Article published", "success");
      }
      fetchArticles();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to update article", "error");
    }
  };

  const handleDelete = async (article: News) => {
    if (!confirm(`Delete article "${article.title}"?`)) return;
    try {
      await api.delete(`/news/${article._id}`);
      showToast("Article deleted", "success");
      fetchArticles();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to delete article", "error");
    }
  };

  const columns: Column<News>[] = [
    {
      key: "title",
      header: "Article",
      sortable: true,
      render: (article) => (
        <div>
          <p className="font-medium line-clamp-1">{article.title}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(article.createdAt)}</p>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (article) => article.category ? <Badge variant="info">{article.category}</Badge> : <span className="text-gray-400">—</span>,
    },
    {
      key: "views",
      header: "Views",
      render: (article) => <span className="text-sm text-gray-600 dark:text-gray-400">{article.viewCount}</span>,
    },
    {
      key: "isPublished",
      header: "Status",
      render: (article) => (
        <Badge variant={article.isPublished ? "success" : "default"}>
          {article.isPublished ? "Published" : "Draft"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (article) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={(e) => { e.stopPropagation(); handlePublishToggle(article); }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500" title={article.isPublished ? "Unpublish" : "Publish"}>
            {article.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          <button onClick={(e) => { e.stopPropagation(); openEdit(article); }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
            <Pencil className="h-4 w-4" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleDelete(article); }} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500">
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">News</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage news articles and publications</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> New Article</Button>
      </div>

      <div className="mb-6">
        <SearchInput placeholder="Search articles..." value={search} onChange={(v) => { setSearch(v); setPage(1); }} className="max-w-md" />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <DataTable columns={columns} data={articles} currentPage={page} totalPages={totalPages} onPageChange={setPage} loading={loading} emptyMessage="No articles found" />
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? "Edit Article" : "New Article"} className="max-w-2xl">
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm" placeholder="Article title" />
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Excerpt</label>
            <textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm" rows={2} placeholder="Brief summary..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content</label>
            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm" rows={8} placeholder="Write your article..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags (comma separated)</label>
            <input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm" placeholder="e.g. football, transfer, breaking" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cover Image</label>
            <FileUpload accept="image/*" onFilesSelected={setCoverFile} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isPublished" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} className="rounded" />
            <label htmlFor="isPublished" className="text-sm text-gray-700 dark:text-gray-300">Publish immediately</label>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button loading={saving} onClick={handleSubmit}>{editing ? "Save Changes" : "Create Article"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
