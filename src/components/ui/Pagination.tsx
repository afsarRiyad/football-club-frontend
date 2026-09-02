"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showEllipsisStart = currentPage > 3;
    const showEllipsisEnd = currentPage < totalPages - 2;

    if (showEllipsisStart) {
      pages.push(1);
      pages.push("...");
    }

    const start = Math.max(1, showEllipsisStart ? currentPage - 1 : 1);
    const end = Math.min(
      totalPages,
      showEllipsisEnd ? currentPage + 1 : totalPages
    );

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (showEllipsisEnd) {
      pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <nav
      className={cn(
        "flex items-center justify-center gap-1",
        className
      )}
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg hover:bg-surface-raised disabled:opacity-50 disabled:cursor-not-allowed text-mist"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {getPageNumbers().map((page, index) =>
        typeof page === "string" ? (
          <span
            key={`ellipsis-${index}`}
            className="px-2 text-mist"
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              "px-3 py-1 rounded-lg text-sm font-medium transition-all duration-150",
              currentPage === page
                ? "bg-pitch-accent text-pitch-night"
                : "hover:bg-surface-raised text-mist hover:text-floodlight"
            )}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg hover:bg-surface-raised disabled:opacity-50 disabled:cursor-not-allowed text-mist"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
