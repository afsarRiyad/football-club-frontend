"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";

export default function AdminPage() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard</h1>
      <p className="text-gray-600 dark:text-gray-400">
        Welcome back, {user?.name}. Use the sidebar to manage your club.
      </p>
    </div>
  );
}
