"use client";

import React from "react";
import { motion, type Variants, useReducedMotion } from "framer-motion";
import {
  fadeUp,
  fadeDown,
  fadeLeft,
  fadeRight,
  fadeIn,
  scaleIn,
  scaleUp,
  staggerContainer,
  staggerFast,
  staggerSlow,
  cardHover,
  buttonPress,
  buttonTap,
  viewportConfig,
  viewportRepeat,
  reduceMotion,
} from "@/lib/animations";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  once?: boolean;
}

// Motion-aware wrapper that respects reduced motion preferences
function MotionWrapper({ 
  children, 
  reducedMotion 
}: { 
  children: React.ReactNode; 
  reducedMotion: boolean;
}) {
  if (reducedMotion) {
    return <>{children}</>;
  }
  return <>{children}</>;
}

export function FadeUp({ children, className, delay = 0, once = true }: SectionProps) {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <motion.div
      variants={prefersReducedMotion ? reduceMotion : fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={once ? viewportConfig : viewportRepeat}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function FadeDown({ children, className, delay = 0, once = true }: SectionProps) {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <motion.div
      variants={prefersReducedMotion ? reduceMotion : fadeDown}
      initial="hidden"
      whileInView="visible"
      viewport={once ? viewportConfig : viewportRepeat}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function FadeLeft({ children, className, delay = 0, once = true }: SectionProps) {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <motion.div
      variants={prefersReducedMotion ? reduceMotion : fadeLeft}
      initial="hidden"
      whileInView="visible"
      viewport={once ? viewportConfig : viewportRepeat}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function FadeRight({ children, className, delay = 0, once = true }: SectionProps) {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <motion.div
      variants={prefersReducedMotion ? reduceMotion : fadeRight}
      initial="hidden"
      whileInView="visible"
      viewport={once ? viewportConfig : viewportRepeat}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function FadeIn({ children, className, delay = 0, once = true }: SectionProps) {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <motion.div
      variants={prefersReducedMotion ? reduceMotion : fadeIn}
      initial="hidden"
      whileInView="visible"
      viewport={once ? viewportConfig : viewportRepeat}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ScaleIn({ children, className, delay = 0, once = true }: SectionProps) {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <motion.div
      variants={prefersReducedMotion ? reduceMotion : scaleIn}
      initial="hidden"
      whileInView="visible"
      viewport={once ? viewportConfig : viewportRepeat}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ScaleUp({ children, className, delay = 0, once = true }: SectionProps) {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <motion.div
      variants={prefersReducedMotion ? reduceMotion : scaleUp}
      initial="hidden"
      whileInView="visible"
      viewport={once ? viewportConfig : viewportRepeat}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({ 
  children, 
  className, 
  speed = "normal",
  once = true 
}: SectionProps & { speed?: "fast" | "normal" | "slow" }) {
  const prefersReducedMotion = useReducedMotion();
  const staggerVariant = speed === "fast" ? staggerFast : speed === "slow" ? staggerSlow : staggerContainer;
  
  return (
    <motion.div
      variants={prefersReducedMotion ? reduceMotion : staggerVariant}
      initial="hidden"
      whileInView="visible"
      viewport={once ? viewportConfig : viewportRepeat}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  variant = "fadeUp",
}: SectionProps & { variant?: "fadeUp" | "scaleIn" | "fadeIn" }) {
  const prefersReducedMotion = useReducedMotion();
  const variantMap = {
    fadeUp,
    scaleIn,
    fadeIn,
  };
  
  return (
    <motion.div 
      variants={prefersReducedMotion ? reduceMotion : variantMap[variant]} 
      className={className}
    >
      {children}
    </motion.div>
  );
}
