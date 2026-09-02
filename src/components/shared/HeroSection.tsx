"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";
import { FadeUp, Stagger, StaggerItem } from "./Motion";
import { slideUp, fadeIn } from "@/lib/animations";

interface HeroSectionProps {
  title: string;
  subtitle: string;
  description: string;
  primaryCta?: { text: string; href: string };
  secondaryCta?: { text: string; href: string };
  stats?: Array<{ label: string; value: string }>;
}

export function HeroSection({
  title,
  subtitle,
  description,
  primaryCta,
  secondaryCta,
  stats,
}: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={containerRef} className="relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-club-primary/10 via-background to-club-accent/5" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]" />
      
      {/* Animated background glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-club-accent/5 rounded-full blur-[120px]"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.05, 0.08, 0.05],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        style={{ y, opacity }}
        className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32"
      >
        <div className="max-w-2xl">
          {/* Subtitle */}
          <FadeUp delay={0}>
            <motion.p 
              className="text-club-accent font-mono text-sm mb-5 tracking-wider uppercase"
              variants={fadeIn}
            >
              {subtitle}
            </motion.p>
          </FadeUp>

          {/* Main title */}
          <FadeUp delay={0.1}>
            <motion.h1 
              className="text-5xl md:text-7xl lg:text-8xl font-bold text-text-primary font-display tracking-tight leading-[0.95]"
              variants={slideUp}
            >
              {title}
            </motion.h1>
          </FadeUp>

          {/* Description */}
          <FadeUp delay={0.2}>
            <motion.p 
              className="text-text-secondary text-lg mt-6 max-w-lg leading-relaxed"
              variants={fadeIn}
            >
              {description}
            </motion.p>
          </FadeUp>

          {/* CTA Buttons */}
          {primaryCta && (
            <FadeUp delay={0.35}>
              <motion.div 
                className="flex gap-3 mt-8"
                variants={fadeIn}
              >
                <Link href={primaryCta.href}>
                  <Button size="lg" withMotion>
                    {primaryCta.text}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                {secondaryCta && (
                  <Link href={secondaryCta.href}>
                    <Button size="lg" variant="outline" withMotion>
                      {secondaryCta.text}
                    </Button>
                  </Link>
                )}
              </motion.div>
            </FadeUp>
          )}
        </div>

        {/* Stats Section */}
        {stats && stats.length > 0 && (
          <div className="mt-20 pt-12 border-t border-line/50">
            <Stagger speed="normal" className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              {stats.map((stat, index) => (
                <StaggerItem key={stat.label} variant="fadeIn">
                  <motion.div 
                    className="text-center md:text-left"
                    variants={fadeIn}
                  >
                    <p className="text-3xl md:text-4xl font-bold text-text-primary font-display">
                      {stat.value}
                    </p>
                    <p className="text-sm text-text-secondary mt-1">{stat.label}</p>
                  </motion.div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        )}
      </motion.div>
    </section>
  );
}