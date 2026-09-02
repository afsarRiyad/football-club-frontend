"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/layout";
import { PageSpinner } from "@/components/ui";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return <PageSpinner />;
  }

  if (!user) {
    router.push("/login");
    return <PageSpinner />;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-surface">{children}</main>
    </>
  );
}
