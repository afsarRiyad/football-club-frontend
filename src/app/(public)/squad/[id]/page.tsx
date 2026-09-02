"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Ruler } from "lucide-react";
import api from "@/lib/api";
import { Player, Club } from "@/types";
import { PageSpinner } from "@/components/ui";
import { cn } from "@/lib/utils";

const positionFull: Record<string, string> = {
  GOALKEEPER: "Goalkeeper",
  DEFENDER: "Defender",
  MIDFIELDER: "Midfielder",
  FORWARD: "Forward",
};

export default function PlayerProfilePage() {
  const params = useParams();
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlayer();
  }, [params.id]);

  const fetchPlayer = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/players/${params.id}`);
      setPlayer(data.data);
    } catch (e) {
      console.error("Failed to fetch player:", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageSpinner />;

  if (!player) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-mist">Player not found</p>
      </div>
    );
  }

  const name = `${player.firstName} ${player.lastName}`;
  const age = player.dateOfBirth
    ? Math.floor((Date.now() - new Date(player.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        href="/squad"
        className="inline-flex items-center gap-1.5 text-mist hover:text-floodlight text-sm mb-8 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to squad
      </Link>

      {/* Player — two-column editorial layout */}
      <div className="grid md:grid-cols-5 gap-8 md:gap-12">
        {/* Photo — takes 3 columns */}
        <div className="md:col-span-3">
          <div className="relative aspect-[4/5] bg-surface rounded-xl overflow-hidden">
            {player.photo ? (
              <img
                src={player.photo}
                alt={name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-8xl font-bold text-line font-display">
                  {player.firstName?.charAt(0)}
                </span>
              </div>
            )}

            {/* Jersey number — large, overlaid */}
            {player.number && (
              <span className="absolute bottom-4 right-4 text-5xl font-mono font-bold text-floodlight/20 tabular-nums">
                {player.number}
              </span>
            )}
          </div>
        </div>

        {/* Info — takes 2 columns */}
        <div className="md:col-span-2">
          <div className="sticky top-24">
            {player.number && (
              <span className="text-6xl font-mono font-bold text-line/30 tabular-nums block mb-2">
                {String(player.number).padStart(2, "0")}
              </span>
            )}

            <h1 className="text-3xl md:text-4xl font-bold text-floodlight font-display tracking-tight leading-tight">
              {name}
            </h1>

            <p className="text-lg text-pitch-accent font-medium mt-1">
              {positionFull[player.position]}
            </p>

            {/* Stats grid — minimal */}
            <div className="mt-8 space-y-4">
              {player.nationality && (
                <div className="flex justify-between items-baseline border-b border-line/50 pb-3">
                  <span className="text-sm text-mist">Nationality</span>
                  <span className="text-sm text-floodlight font-medium">{player.nationality}</span>
                </div>
              )}
              {age && (
                <div className="flex justify-between items-baseline border-b border-line/50 pb-3">
                  <span className="text-sm text-mist">Age</span>
                  <span className="text-sm text-floodlight font-mono">{age}</span>
                </div>
              )}
              {player.height && (
                <div className="flex justify-between items-baseline border-b border-line/50 pb-3">
                  <span className="text-sm text-mist">Height</span>
                  <span className="text-sm text-floodlight font-mono">{player.height} cm</span>
                </div>
              )}
              {player.weight && (
                <div className="flex justify-between items-baseline border-b border-line/50 pb-3">
                  <span className="text-sm text-mist">Weight</span>
                  <span className="text-sm text-floodlight font-mono">{player.weight} kg</span>
                </div>
              )}
              {player.dateOfBirth && (
                <div className="flex justify-between items-baseline border-b border-line/50 pb-3">
                  <span className="text-sm text-mist">Born</span>
                  <span className="text-sm text-floodlight font-mono">
                    {new Date(player.dateOfBirth).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
