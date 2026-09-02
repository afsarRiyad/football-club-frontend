"use client";

import React, { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, ArrowUp } from "lucide-react";
import api from "@/lib/api";
import { Member, Club, User, MembershipType } from "@/types";
import { useToast } from "@/context/ToastContext";
import { Button, Badge, Modal, SearchInput } from "@/components/ui";
import DataTable, { Column } from "@/components/ui/DataTable";
import { formatDate } from "@/lib/utils";

const membershipTypes: { value: string; label: string }[] = [
  { value: "", label: "All Types" },
  { value: "FREE", label: "Free" },
  { value: "BASIC", label: "Basic" },
  { value: "PREMIUM", label: "Premium" },
  { value: "VIP", label: "VIP" },
];

interface MemberForm {
  user: string;
  club: string;
  membershipType: MembershipType;
  expiryDate: string;
}

const emptyForm: MemberForm = { user: "", club: "", membershipType: "FREE", expiryDate: "" };

export default function AdminMembersPage() {
  const { showToast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [membershipType, setMembershipType] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [form, setForm] = useState<MemberForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchClubs();
    fetchMembers();
  }, [search, membershipType, page]);

  const fetchClubs = async () => {
    try {
      const { data } = await api.get("/clubs", { params: { limit: 100 } });
      setClubs(data.data);
    } catch (error) {
      console.error("Failed to fetch clubs:", error);
    }
  };

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (search) params.search = search;
      if (membershipType) params.membershipType = membershipType;

      const { data } = await api.get("/members", { params });
      setMembers(data.data);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Failed to fetch members:", error);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (member: Member) => {
    setEditing(member);
    setForm({
      user: typeof member.user === "string" ? member.user : member.user._id,
      club: typeof member.club === "string" ? member.club : member.club._id,
      membershipType: member.membershipType,
      expiryDate: member.expiryDate ? member.expiryDate.split("T")[0] : "",
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.user || !form.club) { showToast("User and club are required", "error"); return; }
    setSaving(true);
    try {
      const payload = {
        user: form.user,
        club: form.club,
        membershipType: form.membershipType,
        expiryDate: form.expiryDate || undefined,
      };
      if (editing) {
        await api.patch(`/members/${editing._id}`, payload);
        showToast("Member updated", "success");
      } else {
        await api.post("/members", payload);
        showToast("Member created", "success");
      }
      setShowModal(false);
      fetchMembers();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to save member", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleUpgrade = async (member: Member) => {
    const types: MembershipType[] = ["FREE", "BASIC", "PREMIUM", "VIP"];
    const currentIndex = types.indexOf(member.membershipType);
    if (currentIndex >= types.length - 1) {
      showToast("Already at highest tier", "info");
      return;
    }
    const newType = types[currentIndex + 1];
    try {
      await api.patch(`/members/${member._id}/upgrade`, {
        membershipType: newType,
        expiryDate: member.expiryDate,
      });
      showToast(`Upgraded to ${newType}`, "success");
      fetchMembers();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to upgrade member", "error");
    }
  };

  const handleDelete = async (member: Member) => {
    if (!confirm("Remove this member?")) return;
    try {
      await api.delete(`/members/${member._id}`);
      showToast("Member removed", "success");
      fetchMembers();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to remove member", "error");
    }
  };

  const getUserName = (user: string | User): string => {
    if (typeof user === "string") return user;
    return user.name;
  };

  const columns: Column<Member>[] = [
    {
      key: "user",
      header: "Member",
      render: (member) => (
        <div>
          <p className="font-medium">{getUserName(member.user)}</p>
          {typeof member.user !== "string" && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{member.user.email}</p>
          )}
        </div>
      ),
    },
    {
      key: "club",
      header: "Club",
      render: (member) => {
        const club = typeof member.club === "string" ? clubs.find((c) => c._id === member.club) : member.club;
        return <span className="text-sm text-gray-600 dark:text-gray-400">{club?.name || "—"}</span>;
      },
    },
    {
      key: "membershipType",
      header: "Type",
      render: (member) => {
        const colors: Record<string, "default" | "info" | "success" | "warning" | "danger"> = {
          FREE: "default", BASIC: "info", PREMIUM: "success", VIP: "danger",
        };
        return <Badge variant={colors[member.membershipType] || "default"}>{member.membershipType}</Badge>;
      },
    },
    {
      key: "expiryDate",
      header: "Expires",
      render: (member) => <span className="text-sm text-gray-600 dark:text-gray-400">{member.expiryDate ? formatDate(member.expiryDate) : "—"}</span>,
    },
    {
      key: "isActive",
      header: "Status",
      render: (member) => <Badge variant={member.isActive ? "success" : "danger"}>{member.isActive ? "Active" : "Inactive"}</Badge>,
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (member) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={(e) => { e.stopPropagation(); handleUpgrade(member); }} className="p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-green-500" title="Upgrade">
            <ArrowUp className="h-4 w-4" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); openEdit(member); }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
            <Pencil className="h-4 w-4" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleDelete(member); }} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500">
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Members</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage club memberships</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> Add Member</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <SearchInput placeholder="Search members..." value={search} onChange={(v) => { setSearch(v); setPage(1); }} className="flex-1 max-w-md" />
        <select value={membershipType} onChange={(e) => { setMembershipType(e.target.value); setPage(1); }} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm">
          {membershipTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <DataTable columns={columns} data={members} currentPage={page} totalPages={totalPages} onPageChange={setPage} loading={loading} emptyMessage="No members found" />
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? "Edit Member" : "Add Member"}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">User ID</label>
            <input type="text" value={form.user} onChange={(e) => setForm({ ...form, user: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm" placeholder="Enter user ID" disabled={!!editing} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Club</label>
            <select value={form.club} onChange={(e) => setForm({ ...form, club: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm" disabled={!!editing}>
              <option value="">Select club</option>
              {clubs.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Membership Type</label>
              <select value={form.membershipType} onChange={(e) => setForm({ ...form, membershipType: e.target.value as MembershipType })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm">
                {membershipTypes.filter((t) => t.value).map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expiry Date</label>
              <input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button loading={saving} onClick={handleSubmit}>{editing ? "Save Changes" : "Add Member"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
