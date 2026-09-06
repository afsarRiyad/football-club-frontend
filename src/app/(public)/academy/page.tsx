"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { GraduationCap, Star, Users, Trophy, Mail } from "lucide-react";
import Image from "next/image";
import api from "@/lib/api";
import { Player, Academy } from "@/types";
import { PageSpinner, Button } from "@/components/ui";
import { cn } from "@/lib/utils";

export default function AcademyPage() {
  const [academy, setAcademy] = useState<Academy | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [academyRes, playersRes] = await Promise.allSettled([
        api.get("/academy", { params: { limit: 1 } }),
        api.get("/players", { params: { limit: 20 } }),
      ]);

      if (academyRes.status === "fulfilled") {
        const academies = academyRes.value.data.data || [];
        if (academies.length > 0) setAcademy(academies[0]);
      }

      if (playersRes.status === "fulfilled") {
        setPlayers(playersRes.value.data.data || []);
      }
    } catch (e) {
      console.error("Failed to fetch data:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Header */}
      <div className="mb-14 md:mb-20">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-floodlight font-display tracking-tight leading-[1.1]">
              The{" "}
              <span className="text-pitch-accent">Academy</span>
            </h1>
            <p className="text-mist mt-4 text-lg max-w-2xl leading-relaxed">
              {academy?.description || "Where the next generation of talent is shaped. Our academy provides a clear pathway from youth football to the professional game."}
            </p>
          </div>

          {/* Academy Photo */}
          <div className="relative aspect-[4/3] bg-surface rounded-2xl border border-line/60 overflow-hidden animate-academy-photos">
            {academy?.photo ? (
              <Image
                src={academy.photo}
                alt="Academy"
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-surface-raised to-surface flex items-center justify-center">
                <div className="text-center">
                  <GraduationCap className="h-10 w-10 text-pitch-accent mx-auto mb-3" />
                  <p className="text-mist text-sm">Academy Photos</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Philosophy — three pillars, editorial layout */}
      <div className="mb-16 md:mb-24">
        <div className="grid md:grid-cols-3 gap-px bg-line/30">
          {[
            {
              icon: Star,
              title: "Excellence",
              text: "We push every player to reach their potential, on and off the pitch.",
            },
            {
              icon: Users,
              title: "Development",
              text: "Structured programs building technical skill, tactical awareness, and character.",
            },
            {
              icon: Trophy,
              title: "Pathway",
              text: "A clear route from youth football to the first team for those who earn it.",
            },
          ].map((item) => (
            <div key={item.title} className="bg-surface p-8 md:p-10">
              <item.icon className="h-6 w-6 text-pitch-accent mb-4" />
              <h3 className="text-lg font-bold text-floodlight font-display mb-2">
                {item.title}
              </h3>
              <p className="text-mist text-sm leading-relaxed">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Players */}
      {loading ? (
        <PageSpinner />
      ) : players.length > 0 ? (
        <div className="mb-16 md:mb-24">
          <h2 className="text-2xl font-bold text-floodlight font-display mb-8">
            Academy Squad
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 md:gap-5">
            {players.slice(0, 12).map((player, i) => (
              <Link key={player._id} href={`/squad/${player._id}`}>
                <div
                  className={cn(
                    "group aspect-[3/4] bg-surface overflow-hidden relative",
                    "clip-angle-left",
                  )}
                >
                  {player.photo ? (
                    <Image
                      src={player.photo}
                      alt={`${player.firstName} ${player.lastName}`}
                      fill
                      className="object-cover animate-ken-burns"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-3xl font-bold text-line font-display">
                        {player.firstName?.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-pitch-night/80 to-transparent p-2">
                    <p className="text-xs text-floodlight truncate">
                      {player.firstName} {player.lastName}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      {/* Trial CTA — simple, not overdesigned */}
      <div className="bg-surface rounded-xl border border-line p-8 md:p-12">
        <div className="max-w-lg">
          <h2 className="text-2xl font-bold text-floodlight font-display mb-3">
            Join the Academy
          </h2>
          <p className="text-mist leading-relaxed mb-6">
            We hold regular trials for players aged 8–18. If you&apos;re serious about
            your development, we want to see you.
          </p>
          <ul className="space-y-2 mb-6">
            {["Open trials held quarterly", "Ages 8–18 welcome", "Professional coaching staff"].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-mist">
                <span className="h-1 w-1 rounded-full bg-pitch-accent shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <Button className="group">
            <Mail className="mr-2 h-4 w-4" />
            Contact About Trials
          </Button>
        </div>
      </div>
    </div>
  );
}
