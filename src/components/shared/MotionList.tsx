"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { listItem, staggerContainer } from "@/lib/animations";

interface MotionListProps {
  children: React.ReactNode;
  className?: string;
  stagger?: boolean;
}

interface MotionListItemProps {
  children: React.ReactNode;
  className?: string;
  index?: number;
}

export function MotionList({ children, className, stagger = true }: MotionListProps) {
  return (
    <motion.div
      className={className}
      variants={stagger ? staggerContainer : undefined}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
}

export function MotionListItem({ children, className, index = 0 }: MotionListItemProps) {
  return (
    <motion.div
      className={className}
      variants={listItem}
      custom={index}
    >
      {children}
    </motion.div>
  );
}

// For lists with dynamic add/remove
export function AnimatedList({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <AnimatePresence mode="popLayout">
        {children}
      </AnimatePresence>
    </div>
  );
}