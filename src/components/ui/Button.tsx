"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { buttonPress, buttonTap } from "@/lib/animations";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  withMotion?: boolean;
  children: React.ReactNode;
}

const variants = {
  primary:
    "bg-club-accent text-white hover:bg-club-accent/90 focus:ring-club-accent/50",
  secondary:
    "bg-club-primary text-white hover:bg-club-primary/90 focus:ring-club-primary/50",
  danger:
    "bg-error text-white hover:bg-error/90 focus:ring-error/50",
  ghost:
    "bg-transparent text-text-secondary hover:bg-surface hover:text-text-primary focus:ring-line/50",
  outline:
    "border border-line bg-transparent text-text-primary hover:bg-surface focus:ring-line/50",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  withMotion = true,
  className,
  children,
  ...props
}: ButtonProps) {
  const buttonContent = (
    <>
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </>
  );

  const baseClasses = cn(
    "inline-flex items-center justify-center font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
    variants[variant],
    sizes[size],
    className
  );

  // Strip framer-motion props that conflict with native button attributes
  const { onDrag, onDragStart, onDragEnd, ...restProps } = props as any;

  if (withMotion && !loading && !disabled) {
    return (
      <motion.button
        className={baseClasses}
        disabled={disabled || loading}
        variants={buttonPress}
        initial="rest"
        whileHover="hover"
        whileTap="tap"
        {...restProps}
      >
        {buttonContent}
      </motion.button>
    );
  }

  return (
    <button
      className={baseClasses}
      disabled={disabled || loading}
      {...props}
    >
      {buttonContent}
    </button>
  );
}
