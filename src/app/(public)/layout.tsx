"use client";

import React from "react";
import { Navbar, Footer } from "@/components/layout";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background">{children}</main>
      <Footer />
    </>
  );
}
