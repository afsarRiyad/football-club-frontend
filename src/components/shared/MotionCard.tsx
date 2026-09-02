"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { cardHover, scaleIn } from "@/lib/animations";

interface MotionCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  onClick?: () => void;
  variant?: "default" | "elevated" | "flat";
}

const variants = {
  default: "bg-surface border border-line/60 rounded-2xl",
  elevated: "bg-surface border border-line/60 rounded-2xl shadow-lg",
  flat: "bg-surface border-0 rounded-2xl",
};

export function MotionCard({ 
  children, 
  className, 
  delay = 0, 
  onClick,
  variant = "default"
}: MotionCardProps) {
  return (
    <motion.div
      className={cn(variants[variant], "p-5", onClick && "cursor-pointer", className)}
      variants={scaleIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay }}
      whileHover={onClick ? { scale: 1.02, y: -4 } : { scale: 1.01 }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}