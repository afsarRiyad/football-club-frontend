"use client";

import { useState } from "react";
import { CLUB_FULL_LOCATION, CLUB_MAP_EMBED_URL, CLUB_MAP_URL, SITE_NAME } from "@/lib/seo";

/* ────────────────────────────────────────────────────────────────────
   Click-to-load map
   ────────────────────────────────────────────────────────────────────
   A Google Maps embed pulls in roughly a megabyte of third-party JavaScript
   and does a lot of main-thread work while it starts up. Rendering it on load
   cost the contact page about 1.2s of Total Blocking Time and wrecked LCP and
   Speed Index on mobile, so the iframe is only injected once the visitor
   actually asks for the map.

   Nothing about local search depends on the embed: the address, town and
   district are real server-rendered text on the page, and the "open in Maps"
   link below works on its own (it hands off to the Google Maps app on phones).
   ──────────────────────────────────────────────────────────────────── */

export default function MapEmbed() {
  const [loaded, setLoaded] = useState(false);

  if (loaded) {
    return (
      <iframe
        title={`Map showing ${SITE_NAME} at ${CLUB_FULL_LOCATION}`}
        src={CLUB_MAP_EMBED_URL}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="w-full h-[320px] md:h-[420px] border-0 block"
      />
    );
  }

  return (
    <div className="w-full h-[320px] md:h-[420px] flex flex-col items-center justify-center gap-3 px-6 py-10 text-center bg-surface-raised">
      <span className="text-xs font-mono uppercase tracking-widest text-mist">Our ground</span>
      <p className="text-sm text-mist leading-relaxed max-w-xs">{CLUB_FULL_LOCATION}</p>

      <button
        type="button"
        onClick={() => setLoaded(true)}
        className="mt-1 px-5 py-2.5 rounded-lg bg-pitch-accent text-pitch-night text-sm font-semibold hover:opacity-90 transition-opacity"
      >
        Load interactive map
      </button>

      <a
        href={CLUB_MAP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-pitch-accent hover:underline"
      >
        Or open in Google Maps
      </a>

      <p className="text-xs text-mist/70 mt-1">Loading the map sends a request to Google.</p>
    </div>
  );
}
