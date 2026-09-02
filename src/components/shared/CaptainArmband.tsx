"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface CaptainArmbandProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "w-5 h-5",
  md: "w-7 h-7",
  lg: "w-9 h-9",
};

/**
 * Captain armband — a stylized "C" badge in club gold.
 * Used on the pitch formation and player cards.
 */
export default function CaptainArmband({ size = "md", className }: CaptainArmbandProps) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full",
        "bg-gradient-to-br from-card-gold to-amber-600",
        "border border-amber-300/50 shadow-lg",
        "animate-captain-glow",
        sizes[size],
        className
      )}
      title="Captain"
    >
      {/* Inner ring */}
      <div className="absolute inset-[2px] rounded-full border border-white/30" />

      {/* "C" letter */}
      <span
        className={cn(
          "font-display font-black text-white leading-none",
          size === "sm" && "text-[9px]",
          size === "md" && "text-xs",
          size === "lg" && "text-sm"
        )}
      >
        C
      </span>
    </div>
  );
}
