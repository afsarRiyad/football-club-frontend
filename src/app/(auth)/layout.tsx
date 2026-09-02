"use client";

import React from "react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-club-primary/5 rounded-full blur-[120px]" />

      <div className="max-w-md w-full relative">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="h-10 w-10 bg-club-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl font-display">
                F
              </span>
            </div>
            <span className="text-2xl font-bold text-text-primary font-display tracking-tight">
              FClub
            </span>
          </Link>
        </div>
        <div className="bg-surface border border-line rounded-2xl shadow-xl p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
