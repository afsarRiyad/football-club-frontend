"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { cardHover } from "@/lib/animations";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className, interactive = false, onClick }: CardProps) {
  const baseClasses = cn(
    "rounded-xl border border-line bg-surface shadow-sm",
    interactive && "cursor-pointer hover:shadow-md transition-shadow",
    className
  );

  if (interactive) {
    return (
      <motion.div
        className={baseClasses}
        onClick={onClick}
        variants={cardHover}
        initial="rest"
        whileHover="hover"
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={baseClasses}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div
      className={cn(
        "border-b border-line px-6 py-4",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardContent({ children, className }: CardContentProps) {
  return <div className={cn("px-6 py-4", className)}>{children}</div>;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div
      className={cn(
        "border-t border-line px-6 py-4",
        className
      )}
    >
      {children}
    </div>
  );
}
