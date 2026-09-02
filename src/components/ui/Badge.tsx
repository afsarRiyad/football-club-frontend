"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "live";
  className?: string;
}

const variants = {
  default: "bg-surface-raised text-mist",
  success: "bg-pitch-accent/15 text-pitch-accent",
  warning: "bg-card-gold/15 text-card-gold",
  danger: "bg-alert-red/15 text-alert-red",
  info: "bg-pitch-accent/10 text-pitch-accent",
  live: "bg-alert-red/15 text-alert-red animate-pulse",
};

export default function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {variant === "live" && (
        <span className="mr-1.5 h-2 w-2 rounded-full bg-alert-red animate-pulse" />
      )}
      {children}
    </span>
  );
}
