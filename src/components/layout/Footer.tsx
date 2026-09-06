"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-pitch-night border-t border-line text-mist">
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
              />
              <span className="text-xl font-bold text-floodlight font-display tracking-tight">
                N.S Club
              </span>
            </Link>
            <p className="text-sm text-mist/80">
              Your complete football club management platform. Manage players,
              matches, and more.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="hover:text-pitch-accent transition-colors duration-150"
              >
                <ExternalLink className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-floodlight font-semibold mb-4 font-display">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/clubs"
                  className="text-sm hover:text-pitch-accent transition-colors duration-150"
                >
                  Browse Clubs
                </Link>
              </li>
              <li>
                <Link
                  href="/matches"
                  className="text-sm hover:text-pitch-accent transition-colors duration-150"
                >
                  Matches
                </Link>
              </li>
              <li>
                <Link
                  href="/news"
                  className="text-sm hover:text-pitch-accent transition-colors duration-150"
                >
                  News
                </Link>
              </li>
              <li>
                <Link
                  href="/standings"
                  className="text-sm hover:text-pitch-accent transition-colors duration-150"
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
                <span className="text-sm">Live Match Updates</span>
              </li>
              <li>
                <span className="text-sm">Player Management</span>
              </li>
              <li>
                <span className="text-sm">Team Statistics</span>
              </li>
              <li>
                <span className="text-sm">Academy Programs</span>
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
                  className="text-sm hover:text-pitch-accent transition-colors duration-150"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="text-sm hover:text-pitch-accent transition-colors duration-150"
                >
                  Create Account
                </Link>
              </li>
              <li>
                <span className="text-sm">Help Center</span>
              </li>
              <li>
                <span className="text-sm">Contact Us</span>
              </li>
            </ul>
          </div>
        </div>          <div className="border-t border-line mt-8 pt-8 text-center text-sm text-mist/60">
          <p>&copy; {new Date().getFullYear()} N.S Club. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
