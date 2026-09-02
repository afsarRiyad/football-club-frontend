"use client";

import React, { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Shield, UserCheck, UserX } from "lucide-react";
import api from "@/lib/api";
import { User, UserRole } from "@/types";
import { useToast } from "@/context/ToastContext";
import { Button, Input, Badge, Modal, SearchInput, PageSpinner } from "@/components/ui";
import DataTable, { Column } from "@/components/ui/DataTable";

const roleColors: Record<string, "success" | "warning" | "danger" | "info" | "default"> = {
  SUPER_ADMIN: "danger",
  CLUB_ADMIN: "warning",
  TEAM_MANAGER: "info",
  COACH: "info",
  SCORER: "default",
  PLAYER: "success",
  MEMBER: "default",
};

const roles: { value: string; label: string }[] = [
  { value: "", label: "All Roles" },
  { value: "SUPER_ADMIN", label: "Super Admin" },
  { value: "CLUB_ADMIN", label: "Club Admin" },
  { value: "TEAM_MANAGER", label: "Team Manager" },
  { value: "COACH", label: "Coach" },
  { value: "SCORER", label: "Scorer" },
  { value: "PLAYER", label: "Player" },
  { value: "MEMBER", label: "Member" },
];

export default function AdminUsersPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editRole, setEditRole] = useState<UserRole>("MEMBER");

  useEffect(() => {
    fetchUsers();
  }, [search, role, page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (search) params.search = search;
      if (role) params.role = role;

      const { data } = await api.get("/users", { params });
      setUsers(data.data);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async () => {
    if (!editUser) return;
    try {
      await api.patch(`/users/${editUser._id}/role`, { role: editRole });
      showToast("User role updated", "success");
      setEditUser(null);
      fetchUsers();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to update role", "error");
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      if (user.isActive) {
        await api.patch(`/users/${user._id}/deactivate`);
        showToast("User deactivated", "success");
      } else {
        await api.patch(`/users/${user._id}/activate`);
        showToast("User activated", "success");
      }
      fetchUsers();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to update user", "error");
    }
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`Delete user ${user.name}? This cannot be undone.`)) return;
    try {
      await api.delete(`/users/${user._id}`);
      showToast("User deleted", "success");
      fetchUsers();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to delete user", "error");
    }
  };

  const columns: Column<User>[] = [
    {
      key: "name",
      header: "User",
      sortable: true,
      render: (user) => (
        <div className="flex items-center gap-3">
          {user.photo ? (
            <img src={user.photo} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
          ) : (
            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-500">{user.name.charAt(0)}</span>
            </div>
          )}
          <div>
            <p className="font-medium">{user.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      sortable: true,
      render: (user) => (
        <Badge variant={roleColors[user.role] || "default"}>
          {user.role.replace(/_/g, " ")}
        </Badge>
      ),
    },
    {
      key: "isActive",
      header: "Status",
      render: (user) => (
        <Badge variant={user.isActive ? "success" : "danger"}>
          {user.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (user) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); setEditUser(user); setEditRole(user.role); }}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
            title="Change role"
          >
            <Shield className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleToggleActive(user); }}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
            title={user.isActive ? "Deactivate" : "Activate"}
          >
            {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(user); }}
            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
            title="Delete"
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage user accounts and roles</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <SearchInput
          placeholder="Search users..."
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          className="flex-1 max-w-md"
        />
        <select
          value={role}
          onChange={(e) => { setRole(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
        >
          {roles.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <DataTable
          columns={columns}
          data={users}
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          loading={loading}
          emptyMessage="No users found"
        />
      </div>

      {/* Role Edit Modal */}
      <Modal isOpen={!!editUser} onClose={() => setEditUser(null)} title="Change User Role">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Change role for <strong>{editUser?.name}</strong>
          </p>
          <select
            value={editRole}
            onChange={(e) => setEditRole(e.target.value as UserRole)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
          >
            {roles.filter((r) => r.value).map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setEditUser(null)}>Cancel</Button>
            <Button onClick={handleRoleChange}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
