"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export default function Select({
  label,
  error,
  options,
  placeholder,
  className,
  id,
  ...props
}: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-mist"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          "block w-full rounded-lg border border-line bg-surface px-3 py-2 text-floodlight shadow-sm transition-all duration-150",
          "focus:border-pitch-accent focus:outline-none focus:ring-1 focus:ring-pitch-accent/30",
          error &&
            "border-alert-red focus:border-alert-red focus:ring-alert-red/30",
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-alert-red">{error}</p>
      )}
    </div>
  );
}
