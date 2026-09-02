"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, User, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button, Avatar, ThemeToggle } from "@/components/ui";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/squad", label: "Squad" },
  { href: "/squad?view=extra", label: "Players" },
  { href: "/matches", label: "Matches" },
  { href: "/news", label: "News" },
  { href: "/academy", label: "Academy" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const { user, logout, hasRole } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isAdmin = hasRole(["CLUB_ADMIN", "SUPER_ADMIN"]);

  return (
    <nav className="sticky top-0 z-40">
      <div className="bg-surface/95 backdrop-blur-md border-b border-line/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="h-7 w-7 bg-club-primary rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm font-display">
                  F
                </span>
              </div>
              <span className="text-lg font-bold text-text-primary font-display tracking-tight hidden sm:block">
                FClub
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-3 py-1.5 text-sm transition-colors",
                    pathname === link.href || pathname.startsWith(link.href + "/")
                      ? "text-club-accent font-medium"
                      : "text-text-secondary hover:text-text-primary"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1 rounded-lg hover:bg-surface-raised transition-colors"
                  >
                    <Avatar src={user.photo} alt={user.name} size="sm" />
                    <span className="hidden sm:block text-sm text-mist">
                      {user.name}
                    </span>
                  </button>

                  {userMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-surface border border-line rounded-lg shadow-xl py-1 z-50">
                        <div className="px-3 py-2 border-b border-line">
                          <p className="text-sm text-floodlight truncate">{user.name}</p>
                          <p className="text-xs text-mist">{user.role.replace("_", " ")}</p>
                        </div>
                        {isAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-mist hover:bg-surface-raised"
                          >
                            <Settings className="h-4 w-4" />
                            Admin
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            logout();
                          }}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-alert-red hover:bg-alert-red/10 w-full"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="ghost" size="sm">Sign in</Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm">Sign up</Button>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-1.5 rounded-lg hover:bg-surface-raised"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5 text-mist" />
                ) : (
                  <Menu className="h-5 w-5 text-mist" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface border-b border-line">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "block px-3 py-2 rounded-lg text-sm",
                  pathname === link.href || pathname.startsWith(link.href + "/")
                    ? "text-pitch-accent bg-pitch-accent/10"
                    : "text-mist hover:text-floodlight hover:bg-surface-raised"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
