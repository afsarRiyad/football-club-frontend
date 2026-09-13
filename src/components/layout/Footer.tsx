"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { CLUB, CLUB_FULL_LOCATION, CLUB_MAP_URL, CONTACT, SITE_NAME } from "@/lib/seo";

/** Safe label for a social profile link — never throws on a malformed URL. */
function socialLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "social profile";
  }
}

export default function Footer() {
  return (
    <footer className="bg-pitch-night border-t border-line text-text-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/logo.png"
                alt="N.S Club Logo"
                width={1305}
                height={1206}
                className="h-10 w-auto object-contain"
                loading="lazy"
                sizes="(max-width: 640px) 40px, 40px"
              />
              <span className="text-xl font-bold text-floodlight font-display tracking-tight">
                N.S Club
              </span>
            </Link>
            {/* The footer shows on every page, so the club's name, town and
                district live here rather than only on the About page. */}
            <p className="text-sm text-text-secondary/90">
              The official website of {SITE_NAME} — a football club based at
              Bhuiyarhat Chowrasta, Kabirhat, Noakhali, Bangladesh.
            </p>
            {/* Only rendered once CLUB.socials is filled in: a dead `href="#"`
                link is worse for users and crawlers than no icon at all. */}
            {CLUB.socials.length > 0 ? (
              <div className="flex items-center gap-4">
                {CLUB.socials.map((url) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${SITE_NAME} on ${socialLabel(url)}`}
                    className="hover:text-pitch-accent transition-colors duration-150"
                  >
                    <ExternalLink className="h-5 w-5" />
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-floodlight font-semibold mb-4 font-display">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                {/* `/clubs` was a 404 on every page of the site. */}
                <Link
                  href="/contact"
                  className="text-sm text-text-secondary hover:text-pitch-accent transition-colors duration-150"
                >
                  Contact & Directions
                </Link>
              </li>
              <li>
                <Link
                  href="/matches"
                  className="text-sm text-text-secondary hover:text-pitch-accent transition-colors duration-150"
                >
                  Matches
                </Link>
              </li>
              <li>
                <Link
                  href="/news"
                  className="text-sm text-text-secondary hover:text-pitch-accent transition-colors duration-150"
                >
                  News
                </Link>
              </li>
              <li>
                <Link
                  href="/standings"
                  className="text-sm text-text-secondary hover:text-pitch-accent transition-colors duration-150"
                >
                  Standings
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-floodlight font-semibold mb-4 font-display">
              Features
            </h3>
            <ul className="space-y-2">
              <li>
                <span className="text-sm text-text-secondary">Live Match Updates</span>
              </li>
              <li>
                <span className="text-sm text-text-secondary">Player Management</span>
              </li>
              <li>
                <span className="text-sm text-text-secondary">Team Statistics</span>
              </li>
              <li>
                <span className="text-sm text-text-secondary">Academy Programs</span>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-floodlight font-semibold mb-4 font-display">
              Support
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/login"
                  className="text-sm text-text-secondary hover:text-pitch-accent transition-colors duration-150"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="text-sm text-text-secondary hover:text-pitch-accent transition-colors duration-150"
                >
                  Create Account
                </Link>
              </li>
              <li>
                <span className="text-sm text-text-secondary">Help Center</span>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-sm text-text-secondary hover:text-pitch-accent transition-colors duration-150"
                >
                  About & Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* NAP block — the club's name, address and phone. These exact strings
            are what local search matches against the club's Google Business
            Profile, so keep them identical wherever they appear (here, the
            structured data, Facebook, the profile itself). */}
        <div className="border-t border-line mt-8 pt-8 text-center text-sm text-text-secondary/70">
          <p className="mb-2">
            <span className="text-text-secondary">{SITE_NAME}</span>
            {" · "}
            <a
              href={CLUB_MAP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-pitch-accent transition-colors"
            >
              {CLUB_FULL_LOCATION}
            </a>
            {CONTACT.telephone ? (
              <>
                {" · "}
                <a href={`tel:${CONTACT.telephone}`} className="hover:text-pitch-accent transition-colors">
                  {CONTACT.telephone}
                </a>
              </>
            ) : null}
            {CONTACT.email ? (
              <>
                {" · "}
                <a href={`mailto:${CONTACT.email}`} className="hover:text-pitch-accent transition-colors">
                  {CONTACT.email}
                </a>
              </>
            ) : null}
          </p>
          <p>&copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
