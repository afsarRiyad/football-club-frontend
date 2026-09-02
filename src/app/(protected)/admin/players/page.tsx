"use client";

import React, { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Upload, ArrowRightLeft, Link2 } from "lucide-react";
import api from "@/lib/api";
import { Player, Club, PlayerPosition, PlayerStatus } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Button, Input, Badge, Modal, SearchInput, FileUpload } from "@/components/ui";
import DataTable, { Column } from "@/components/ui/DataTable";

const positions: { value: string; label: string }[] = [
  { value: "", label: "All Positions" },
  { value: "GOALKEEPER", label: "Goalkeeper" },
  { value: "DEFENDER", label: "Defender" },
  { value: "MIDFIELDER", label: "Midfielder" },
  { value: "FORWARD", label: "Forward" },
];

const statusOptions: { value: string; label: string }[] = [
  { value: "", label: "All Status" },
  { value: "ACTIVE", label: "Active" },
  { value: "INJURED", label: "Injured" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "TRANSFERRED", label: "Transferred" },
  { value: "RETIRED", label: "Retired" },
];

interface PlayerForm {
  firstName: string;
  lastName: string;
  number: string;
  position: PlayerPosition;
  status: PlayerStatus;
  dateOfBirth: string;
  nationality: string;
  height: string;
  weight: string;
  club: string;
}

const emptyForm: PlayerForm = {
  firstName: "",
  lastName: "",
  number: "",
  position: "MIDFIELDER",
  status: "ACTIVE",
  dateOfBirth: "",
  nationality: "",
  height: "",
  weight: "",
  club: "",
};

export default function AdminPlayersPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [players, setPlayers] = useState<Player[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [position, setPosition] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [form, setForm] = useState<PlayerForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [importFiles, setImportFiles] = useState<File[]>([]);

  useEffect(() => {
    fetchClubs();
    fetchPlayers();
  }, [search, position, status, page]);

  const fetchClubs = async () => {
    try {
      const { data } = await api.get("/clubs", { params: { limit: 100 } });
      setClubs(data.data);
    } catch (error) {
      console.error("Failed to fetch clubs:", error);
    }
  };

  const fetchPlayers = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (search) params.search = search;
      if (position) params.position = position;
      if (status) params.status = status;

      const { data } = await api.get("/players", { params });
      setPlayers(data.data);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Failed to fetch players:", error);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingPlayer(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (player: Player) => {
    setEditingPlayer(player);
    setForm({
      firstName: player.firstName,
      lastName: player.lastName,
      number: player.number?.toString() || "",
      position: player.position,
      status: player.status,
      dateOfBirth: player.dateOfBirth ? player.dateOfBirth.split("T")[0] : "",
      nationality: player.nationality || "",
      height: player.height?.toString() || "",
      weight: player.weight?.toString() || "",
      club: typeof player.club === "string" ? player.club : player.club._id,
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.firstName || !form.lastName) {
      showToast("First name and last name are required", "error");
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        firstName: form.firstName,
        lastName: form.lastName,
        number: form.number ? Number(form.number) : undefined,
        position: form.position,
        status: form.status,
        dateOfBirth: form.dateOfBirth || undefined,
        nationality: form.nationality || undefined,
        height: form.height ? Number(form.height) : undefined,
        weight: form.weight ? Number(form.weight) : undefined,
        club: form.club || undefined,
      };

      if (editingPlayer) {
        await api.patch(`/players/${editingPlayer._id}`, payload);
        showToast("Player updated", "success");
      } else {
        await api.post("/players", payload);
        showToast("Player created", "success");
      }
      setShowModal(false);
      fetchPlayers();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to save player", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (player: Player) => {
    if (!confirm(`Delete player ${player.firstName} ${player.lastName}?`)) return;
    try {
      await api.delete(`/players/${player._id}`);
      showToast("Player deleted", "success");
      fetchPlayers();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to delete player", "error");
    }
  };

  const handleBulkImport = async () => {
    if (importFiles.length === 0) return;
    setSaving(true);
    try {
      // Read the CSV/JSON file
      const file = importFiles[0];
      const text = await file.text();
      let playersToImport: any[];

      if (file.name.endsWith(".json")) {
        playersToImport = JSON.parse(text);
      } else {
        showToast("Please upload a JSON file", "error");
        setSaving(false);
        return;
      }

      await api.post("/players/bulk-import", { players: playersToImport });
      showToast(`Imported ${playersToImport.length} players`, "success");
      setShowImportModal(false);
      setImportFiles([]);
      fetchPlayers();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to import players", "error");
    } finally {
      setSaving(false);
    }
  };

  const getPlayerName = (player: Player) => `${player.firstName} ${player.lastName}`;

  const columns: Column<Player>[] = [
    {
      key: "name",
      header: "Player",
      sortable: true,
      render: (player) => (
        <div className="flex items-center gap-3">
          {player.photo ? (
            <img src={player.photo} alt={getPlayerName(player)} className="h-8 w-8 rounded-full object-cover" />
          ) : (
            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-500">{player.firstName.charAt(0)}</span>
            </div>
          )}
          <div>
            <p className="font-medium">{getPlayerName(player)}</p>
            {player.number && <p className="text-xs text-gray-500 dark:text-gray-400">#{player.number}</p>}
          </div>
        </div>
      ),
    },
    {
      key: "position",
      header: "Position",
      sortable: true,
      render: (player) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">{player.position}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (player) => {
        const colors: Record<string, "success" | "warning" | "danger" | "default"> = {
          ACTIVE: "success",
          INJURED: "warning",
          SUSPENDED: "danger",
          TRANSFERRED: "default",
          RETIRED: "default",
        };
        return <Badge variant={colors[player.status] || "default"}>{player.status}</Badge>;
      },
    },
    {
      key: "club",
      header: "Club",
      render: (player) => {
        const club = typeof player.club === "string" ? clubs.find((c) => c._id === player.club) : player.club;
        return <span className="text-sm text-gray-600 dark:text-gray-400">{club?.name || "—"}</span>;
      },
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (player) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); openEdit(player); }}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(player); }}
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Players</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage player roster and profiles</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setShowImportModal(true); setImportFiles([]); }}>
            <Upload className="h-4 w-4 mr-2" /> Import
          </Button>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" /> Add Player
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <SearchInput
          placeholder="Search players..."
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          className="flex-1 max-w-md"
        />
        <select
          value={position}
          onChange={(e) => { setPosition(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
        >
          {positions.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
        >
          {statusOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <DataTable
          columns={columns}
          data={players}
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          loading={loading}
          emptyMessage="No players found"
        />
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingPlayer ? "Edit Player" : "Add Player"}>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
            <Input label="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Number" type="number" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} placeholder="10" />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Position</label>
              <select value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value as PlayerPosition })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm">
                {positions.filter((p) => p.value).map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as PlayerStatus })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm">
                {statusOptions.filter((s) => s.value).map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Club</label>
            <select value={form.club} onChange={(e) => setForm({ ...form, club: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm">
              <option value="">No club</option>
              {clubs.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Date of Birth" type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
            <Input label="Nationality" value={form.nationality} onChange={(e) => setForm({ ...form, nationality: e.target.value })} placeholder="e.g. Brazilian" />
            <div />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Height (cm)" type="number" value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} />
            <Input label="Weight (kg)" type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button loading={saving} onClick={handleSubmit}>{editingPlayer ? "Save Changes" : "Add Player"}</Button>
          </div>
        </div>
      </Modal>

      {/* Import Modal */}
      <Modal isOpen={showImportModal} onClose={() => setShowImportModal(false)} title="Bulk Import Players">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Upload a JSON file with an array of player objects. Each object should have: club, firstName, lastName, position, etc.
          </p>
          <FileUpload
            accept=".json"
            onFilesSelected={setImportFiles}
          />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowImportModal(false)}>Cancel</Button>
            <Button loading={saving} onClick={handleBulkImport} disabled={importFiles.length === 0}>
              Import Players
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
