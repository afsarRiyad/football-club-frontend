"use client";

import React, { useState, useEffect } from "react";
import { MapPin, Calendar, Globe, Building2, ExternalLink, Trophy } from "lucide-react";
import api from "@/lib/api";
import { Club } from "@/types";
import { PageSpinner } from "@/components/ui";

/* ═══════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════ */
function getStadiumName(stadium: any): string {
  if (!stadium) return "";
  if (typeof stadium === "string") return stadium;
  return stadium.name || stadium.address || "";
}

function getStadiumAddress(stadium: any): string {
  if (!stadium) return "";
  if (typeof stadium === "string") return "";
  return stadium.address || "";
}

/* ═══════════════════════════════════════════
   About Page
   ═══════════════════════════════════════════ */
export default function AboutPage() {
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClub();
  }, []);

  const fetchClub = async () => {
    try {
      const { data } = await api.get("/clubs", { params: { limit: 1 } });
      if (data.data.length > 0) setClub(data.data[0]);
    } catch (e) {
      console.error("Failed to fetch club:", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageSpinner />;

  if (!club) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-mist">Club information not available.</p>
      </div>
    );
  }

  const location = club.location
    ? [club.location.city, club.location.country].filter(Boolean).join(", ")
    : null;

  const stadiumName = getStadiumName((club as any).stadium);
  const stadiumAddr = getStadiumAddress((club as any).stadium);

  // Social links from contact.social
  const social = (club as any).contact?.social || {};

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Hero */}
      <div className="mb-14 md:mb-20">
        <span className="text-xs font-mono text-club-accent uppercase tracking-widest mb-3 block">
          Our Story
        </span>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-floodlight font-display tracking-tight leading-[1.1]">
          About <span className="text-club-accent">{club.name}</span>
        </h1>
        {club.founded && (
          <p className="text-mist mt-4 text-lg font-mono">Est. {club.founded}</p>
        )}
      </div>

      {/* Description */}
      {club.description && (
        <div className="mb-16 md:mb-24">
          <div className="max-w-3xl">
            <p className="text-xl md:text-2xl text-floodlight/80 leading-relaxed font-light">
              {club.description}
            </p>
          </div>
        </div>
      )}

      {/* Key facts */}
      <div className="mb-16 md:mb-24">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="h-5 w-5 text-club-gold shrink-0" />
          <span className="text-lg font-mono font-bold text-club-accent uppercase tracking-widest">
            Club Facts
          </span>
          <span className="h-px flex-1 bg-line" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {club.founded && (
            <div className="bg-surface rounded-xl border border-line/30 p-6">
              <Trophy className="h-5 w-5 text-club-gold mb-3" />
              <p className="text-3xl font-mono font-black text-floodlight tabular-nums">
                {new Date().getFullYear() - club.founded}
              </p>
              <p className="text-[10px] text-mist font-mono uppercase tracking-widest mt-2">
                Years Active
              </p>
            </div>
          )}
          {stadiumName && (
            <div className="bg-surface rounded-xl border border-line/30 p-6">
              <Building2 className="h-5 w-5 text-club-accent mb-3" />
              <p className="text-lg font-bold text-floodlight line-clamp-2">{stadiumName}</p>
              <p className="text-[10px] text-mist font-mono uppercase tracking-widest mt-2">
                Home Ground
              </p>
            </div>
          )}
          {club.location?.country && (
            <div className="bg-surface rounded-xl border border-line/30 p-6">
              <Globe className="h-5 w-5 text-pitch-green mb-3" />
              <p className="text-lg font-bold text-floodlight">{club.location.country}</p>
              <p className="text-[10px] text-mist font-mono uppercase tracking-widest mt-2">
                Country
              </p>
            </div>
          )}
          <div className="bg-surface rounded-xl border border-line/30 p-6">
            <Calendar className="h-5 w-5 text-club-gold mb-3" />
            <p className="text-3xl font-mono font-black text-floodlight tabular-nums">
              {club.founded || "—"}
            </p>
            <p className="text-[10px] text-mist font-mono uppercase tracking-widest mt-2">
              Founded
            </p>
          </div>
        </div>
      </div>

      {/* Contact + Mission */}
      <div className="grid md:grid-cols-2 gap-12 md:gap-16">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-lg font-mono font-bold text-club-accent uppercase tracking-widest">
              Get in Touch
            </span>
            <span className="h-px flex-1 bg-line" />
          </div>
          <div className="space-y-4">
            {location && (
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-club-accent mt-1 shrink-0" />
                <span className="text-sm text-mist">{location}</span>
              </div>
            )}
            {stadiumAddr && (
              <div className="flex items-start gap-3">
                <Building2 className="h-4 w-4 text-club-accent mt-1 shrink-0" />
                <span className="text-sm text-mist">{stadiumAddr}</span>
              </div>
            )}

            {/* Social links */}
            {social.facebook && (
              <div className="flex items-start gap-3">
                <ExternalLink className="h-4 w-4 text-club-accent mt-1 shrink-0" />
                <a
                  href={social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-pitch-accent hover:underline"
                >
                  Facebook
                </a>
              </div>
            )}
            {social.twitter && (
              <div className="flex items-start gap-3">
                <ExternalLink className="h-4 w-4 text-club-accent mt-1 shrink-0" />
                <a
                  href={social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-pitch-accent hover:underline"
                >
                  Twitter / X
                </a>
              </div>
            )}
            {social.instagram && (
              <div className="flex items-start gap-3">
                <ExternalLink className="h-4 w-4 text-club-accent mt-1 shrink-0" />
                <a
                  href={social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-pitch-accent hover:underline"
                >
                  Instagram
                </a>
              </div>
            )}
            {social.youtube && (
              <div className="flex items-start gap-3">
                <ExternalLink className="h-4 w-4 text-club-accent mt-1 shrink-0" />
                <a
                  href={social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-pitch-accent hover:underline"
                >
                  YouTube
                </a>
              </div>
            )}

            {!location && !stadiumAddr && !social.facebook && !social.twitter && !social.instagram && !social.youtube && (
              <p className="text-mist text-sm">No contact information available yet.</p>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-lg font-mono font-bold text-club-accent uppercase tracking-widest">
              Our Mission
            </span>
            <span className="h-px flex-1 bg-line" />
          </div>
          <p className="text-mist leading-relaxed">
            To develop world-class football talent while fostering community spirit,
            sportsmanship, and a passion for the beautiful game. We believe in the
            power of sport to bring people together and create lasting memories.
          </p>
        </div>
      </div>
    </div>
  );
}