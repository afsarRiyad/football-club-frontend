"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api, { setTokens, clearTokens, getAccessToken } from "@/lib/api";
import { User, UserRole } from "@/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Restore session on mount ──────────────────────────────────────
  const fetchUser = useCallback(async () => {
    try {
      const token = getAccessToken();
      if (!token) {
        setLoading(false);
        return;
      }
      const { data } = await api.get("/auth/me");
      setUser(data.data.user);
    } catch {
      // Token invalid/expired and refresh failed — clear everything
      clearTokens();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // ── Login ─────────────────────────────────────────────────────────
  const login = async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", { email, password });

    // Backend returns: { accessToken, refreshToken, data: { user } }
    setTokens(data.accessToken, data.refreshToken);
    api.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;
    setUser(data.data.user);
  };

  // ── Register ──────────────────────────────────────────────────────
  const register = async (name: string, email: string, password: string) => {
    const { data } = await api.post("/auth/register", { name, email, password });

    setTokens(data.accessToken, data.refreshToken);
    api.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;
    setUser(data.data.user);
  };

  // ── Logout ────────────────────────────────────────────────────────
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      clearTokens();
      delete api.defaults.headers.common.Authorization;
      setUser(null);
      window.location.href = "/login";
    }
  };

  // ── Update local user state ───────────────────────────────────────
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  // ── Role check with hierarchy ─────────────────────────────────────
  const hasRole = (roles: UserRole[]) => {
    if (!user) return false;
    const roleHierarchy: UserRole[] = [
      "SUPER_ADMIN",
      "CLUB_ADMIN",
      "TEAM_MANAGER",
      "COACH",
      "SCORER",
      "PLAYER",
      "MEMBER",
    ];
    const userRoleIndex = roleHierarchy.indexOf(user.role);
    return roles.some((role) => {
      const requiredRoleIndex = roleHierarchy.indexOf(role);
      return userRoleIndex <= requiredRoleIndex;
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
