"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  Shirt,
  Swords,
  Trophy,
  Calendar,
  Newspaper,
  Image,
  GraduationCap,
  Dumbbell,
  UserCheck,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, roles: ["SUPER_ADMIN", "CLUB_ADMIN"] },
  { href: "/admin/users", label: "Users", icon: Users, roles: ["SUPER_ADMIN", "CLUB_ADMIN"] },
  { href: "/admin/clubs", label: "Clubs", icon: Building2, roles: ["SUPER_ADMIN", "CLUB_ADMIN"] },
  { href: "/admin/players", label: "Players", icon: Shirt, roles: ["SUPER_ADMIN", "CLUB_ADMIN", "TEAM_MANAGER", "COACH"] },
  { href: "/admin/teams", label: "Teams", icon: Swords, roles: ["SUPER_ADMIN", "CLUB_ADMIN", "TEAM_MANAGER"] },
  { href: "/admin/matches", label: "Matches", icon: Calendar, roles: ["SUPER_ADMIN", "CLUB_ADMIN", "TEAM_MANAGER", "SCORER"] },
  { href: "/admin/competitions", label: "Competitions", icon: Trophy, roles: ["SUPER_ADMIN", "CLUB_ADMIN"] },
  { href: "/admin/seasons", label: "Seasons", icon: Calendar, roles: ["SUPER_ADMIN", "CLUB_ADMIN"] },
  { href: "/admin/news", label: "News", icon: Newspaper, roles: ["SUPER_ADMIN", "CLUB_ADMIN"] },
  { href: "/admin/gallery", label: "Gallery", icon: Image, roles: ["SUPER_ADMIN", "CLUB_ADMIN"] },
  { href: "/admin/academy", label: "Academy", icon: GraduationCap, roles: ["SUPER_ADMIN", "CLUB_ADMIN", "COACH"] },
  { href: "/admin/training", label: "Training", icon: Dumbbell, roles: ["SUPER_ADMIN", "CLUB_ADMIN", "TEAM_MANAGER", "COACH"] },
  { href: "/admin/members", label: "Members", icon: UserCheck, roles: ["SUPER_ADMIN", "CLUB_ADMIN"] },
  { href: "/admin/statistics", label: "Statistics", icon: BarChart3, roles: ["SUPER_ADMIN", "CLUB_ADMIN", "TEAM_MANAGER", "COACH"] },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, hasRole } = useAuth();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // If this is the /admin root page (dashboard), show the admin layout with sidebar
  // For nested admin pages, also show sidebar
  const visibleLinks = adminLinks.filter((link) => hasRole(link.roles as any));

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <aside
        className={cn(
          "bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 flex flex-col",
          sidebarCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
          {!sidebarCollapsed && (
            <Link href="/admin" className="flex items-center gap-2">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white">Admin</span>
            </Link>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {visibleLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white",
                  sidebarCollapsed && "justify-center px-2"
                )}
                title={sidebarCollapsed ? link.label : undefined}
              >
                <link.icon className="h-5 w-5 shrink-0" />
                {!sidebarCollapsed && <span>{link.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Back to site */}
        <div className="p-2 border-t border-gray-200 dark:border-gray-800">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors",
              sidebarCollapsed && "justify-center px-2"
            )}
          >
            <ChevronLeft className="h-5 w-5 shrink-0" />
            {!sidebarCollapsed && <span>Back to Site</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
