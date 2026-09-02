"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({
  label,
  error,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-mist"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "block w-full rounded-lg border border-line bg-surface px-3 py-2 text-floodlight placeholder-mist/60 shadow-sm transition-all duration-150",
          "focus:border-pitch-accent focus:outline-none focus:ring-1 focus:ring-pitch-accent/30",
          error &&
            "border-alert-red focus:border-alert-red focus:ring-alert-red/30",
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-alert-red">{error}</p>
      )}
    </div>
  );
}
