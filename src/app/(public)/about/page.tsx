"use client";

import React, { useState, useEffect } from "react";
import { MapPin, Calendar, Mail, Phone, Globe, Building2, ExternalLink } from "lucide-react";
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
        <p className="text-gray-500 dark:text-gray-400">Club information not available.</p>
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
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white tracking-tight leading-[1.1]">
          About{" "}
          <span className="text-primary">{club.name}</span>
        </h1>
        {club.founded && (
          <p className="text-gray-500 dark:text-gray-400 mt-4 text-lg font-mono">
            Est. {club.founded}
          </p>
        )}
      </div>

      {/* Description */}
      {club.description && (
        <div className="mb-16 md:mb-24">
          <div className="max-w-3xl">
            <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 leading-relaxed font-light">
              {club.description}
            </p>
          </div>
        </div>
      )}

      {/* Key facts */}
      <div className="mb-16 md:mb-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-200 dark:bg-gray-800">
          {club.founded && (
            <div className="bg-white dark:bg-gray-900 p-6 md:p-8">
              <p className="text-3xl md:text-4xl font-mono font-bold text-primary tabular-nums">
                {new Date().getFullYear() - club.founded}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 uppercase tracking-wider">Years Active</p>
            </div>
          )}
          {stadiumName && (
            <div className="bg-white dark:bg-gray-900 p-6 md:p-8">
              <p className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2">
                {stadiumName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 uppercase tracking-wider">Home Ground</p>
            </div>
          )}
          {club.location?.country && (
            <div className="bg-white dark:bg-gray-900 p-6 md:p-8">
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {club.location.country}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 uppercase tracking-wider">Country</p>
            </div>
          )}
          <div className="bg-white dark:bg-gray-900 p-6 md:p-8">
            <p className="text-3xl md:text-4xl font-mono font-bold text-primary tabular-nums">
              {club.founded || "—"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 uppercase tracking-wider">Founded</p>
          </div>
        </div>
      </div>

      {/* Contact + Mission */}
      <div className="grid md:grid-cols-2 gap-12 md:gap-16">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Get in Touch
          </h2>
          <div className="space-y-4">
            {location && (
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-gray-400 mt-1 shrink-0" />
                <span className="text-gray-600 dark:text-gray-300">{location}</span>
              </div>
            )}
            {stadiumAddr && (
              <div className="flex items-start gap-3">
                <Building2 className="h-4 w-4 text-gray-400 mt-1 shrink-0" />
                <span className="text-gray-600 dark:text-gray-300">{stadiumAddr}</span>
              </div>
            )}

            {/* Social links */}
            {social.facebook && (
              <div className="flex items-start gap-3">
                <ExternalLink className="h-4 w-4 text-gray-400 mt-1 shrink-0" />
                <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Facebook
                </a>
              </div>
            )}
            {social.twitter && (
              <div className="flex items-start gap-3">
                <ExternalLink className="h-4 w-4 text-gray-400 mt-1 shrink-0" />
                <a href={social.twitter} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Twitter / X
                </a>
              </div>
            )}
            {social.instagram && (
              <div className="flex items-start gap-3">
                <ExternalLink className="h-4 w-4 text-gray-400 mt-1 shrink-0" />
                <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Instagram
                </a>
              </div>
            )}
            {social.youtube && (
              <div className="flex items-start gap-3">
                <ExternalLink className="h-4 w-4 text-gray-400 mt-1 shrink-0" />
                <a href={social.youtube} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  YouTube
                </a>
              </div>
            )}

            {!location && !stadiumAddr && !social.facebook && !social.twitter && !social.instagram && !social.youtube && (
              <p className="text-gray-400 text-sm">No contact information available yet.</p>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Our Mission
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            To develop world-class football talent while fostering community spirit,
            sportsmanship, and a passion for the beautiful game. We believe in the
            power of sport to bring people together and create lasting memories.
          </p>
        </div>
      </div>
    </div>
  );
}
