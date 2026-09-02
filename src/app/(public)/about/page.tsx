"use client";

import React, { useState, useEffect } from "react";
import { MapPin, Calendar, Mail, Phone, Globe, Building2 } from "lucide-react";
import api from "@/lib/api";
import { Club } from "@/types";
import { PageSpinner } from "@/components/ui";

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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Hero — editorial header */}
      <div className="mb-14 md:mb-20">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-floodlight font-display tracking-tight leading-[1.1]">
          About{" "}
          <span className="text-pitch-accent">{club.name}</span>
        </h1>
        {club.founded && (
          <p className="text-mist mt-4 text-lg font-mono">
            Est. {club.founded}
          </p>
        )}
      </div>

      {/* Description — large editorial text */}
      {club.description && (
        <div className="mb-16 md:mb-24">
          <div className="max-w-3xl">
            <p className="text-xl md:text-2xl text-floodlight/90 leading-relaxed font-light">
              {club.description}
            </p>
          </div>
        </div>
      )}

      {/* Key facts — horizontal strip, not card grid */}
      <div className="mb-16 md:mb-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-line/30">
          {club.founded && (
            <div className="bg-surface p-6 md:p-8">
              <p className="text-3xl md:text-4xl font-mono font-bold text-pitch-accent tabular-nums">
                {new Date().getFullYear() - club.founded}
              </p>
              <p className="text-xs text-mist mt-2 uppercase tracking-wider">Years Active</p>
            </div>
          )}
          {club.stadium && (
            <div className="bg-surface p-6 md:p-8">
              <p className="text-lg font-bold text-floodlight font-display line-clamp-2">
                {club.stadium}
              </p>
              <p className="text-xs text-mist mt-2 uppercase tracking-wider">Home Ground</p>
            </div>
          )}
          {club.location?.country && (
            <div className="bg-surface p-6 md:p-8">
              <p className="text-lg font-bold text-floodlight font-display">
                {club.location.country}
              </p>
              <p className="text-xs text-mist mt-2 uppercase tracking-wider">Country</p>
            </div>
          )}
          <div className="bg-surface p-6 md:p-8">
            <p className="text-3xl md:text-4xl font-mono font-bold text-pitch-accent tabular-nums">
              {club.founded || "—"}
            </p>
            <p className="text-xs text-mist mt-2 uppercase tracking-wider">Founded</p>
          </div>
        </div>
      </div>

      {/* Contact — simple, not overdesigned */}
      <div className="grid md:grid-cols-2 gap-12 md:gap-16">
        <div>
          <h2 className="text-2xl font-bold text-floodlight font-display mb-6">
            Get in Touch
          </h2>
          <div className="space-y-4">
            {location && (
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-mist mt-1 shrink-0" />
                <span className="text-mist">{location}</span>
              </div>
            )}
            {club.contact?.email && (
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-mist mt-1 shrink-0" />
                <a href={`mailto:${club.contact.email}`} className="text-pitch-accent hover:underline">
                  {club.contact.email}
                </a>
              </div>
            )}
            {club.contact?.phone && (
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-mist mt-1 shrink-0" />
                <a href={`tel:${club.contact.phone}`} className="text-pitch-accent hover:underline">
                  {club.contact.phone}
                </a>
              </div>
            )}
            {club.contact?.website && (
              <div className="flex items-start gap-3">
                <Globe className="h-4 w-4 text-mist mt-1 shrink-0" />
                <a
                  href={club.contact.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pitch-accent hover:underline"
                >
                  {club.contact.website}
                </a>
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-floodlight font-display mb-6">
            Our Mission
          </h2>
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
