"use client";

import React from "react";
import Link from "next/link";
import { User, Key, CreditCard } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, Badge, Avatar } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  const roleColors: Record<string, "success" | "warning" | "danger" | "info" | "default"> = {
    SUPER_ADMIN: "danger",
    CLUB_ADMIN: "warning",
    TEAM_MANAGER: "info",
    COACH: "info",
    SCORER: "default",
    PLAYER: "success",
    MEMBER: "default",
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Welcome back, {user.name}!</p>
      </div>

      {/* Profile Card */}
      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Profile</h2>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <Avatar src={user.photo} alt={user.name} size="lg" />
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{user.name}</h3>
              <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={roleColors[user.role] || "default"}>
                  {user.role.replace(/_/g, " ")}
                </Badge>
                <Badge variant={user.isActive ? "success" : "danger"}>
                  {user.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Link href="/profile">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="flex items-center gap-4">
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Edit Profile</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Update your information</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/change-password">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="flex items-center gap-4">
              <div className="h-12 w-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                <Key className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Change Password</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Update your password</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card className="h-full">
          <CardContent className="flex items-center gap-4">
            <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Membership</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Manage your subscription</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Account Details</h2>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Name</dt>
              <dd className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Email</dt>
              <dd className="text-sm font-medium text-gray-900 dark:text-white">{user.email}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Role</dt>
              <dd className="text-sm font-medium text-gray-900 dark:text-white">
                {user.role.replace(/_/g, " ")}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Member since</dt>
              <dd className="text-sm font-medium text-gray-900 dark:text-white">
                {formatDate(user.createdAt)}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
