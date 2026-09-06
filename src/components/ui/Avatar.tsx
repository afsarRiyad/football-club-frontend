"use client";

import React from "react";
import Image from "next/image";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-16 w-16",
};

export default function Avatar({
  src,
  alt,
  size = "md",
  className,
}: AvatarProps) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt || "Avatar"}
        width={size === "lg" ? 64 : size === "md" ? 40 : 32}
        height={size === "lg" ? 64 : size === "md" ? 40 : 32}
        className={cn(
          "rounded-full object-cover border-2 border-line",
          sizes[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full bg-surface-raised flex items-center justify-center border-2 border-line",
        sizes[size],
        className
      )}
    >
      <User className="h-1/2 w-1/2 text-mist" />
    </div>
  );
}
