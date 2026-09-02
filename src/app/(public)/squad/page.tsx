"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Player, Statistic, Team, Formation, Match, StartingXIEntry } from "@/types";
import { PageSpinner } from "@/components/ui";
import { cn } from "@/lib/utils";
import PitchFormation from "@/components/shared/PitchFormation";
import PlayerRevealCard from "@/components/shared/PlayerRevealCard";
import { getFormation, FORMATION_OPTIONS } from "@/lib/formations";
import { motion } from "framer-motion";
import { Calendar, MapPin, Trophy, Clock } from "lucide-react";

const positionFilters = [
  { value: "", label: "All" },
  { value: "FORMATION", label: "Formation" },
  { value: "MATCHDAY", label: "Match Day XI" },
  { value: "GOALKEEPER", label: "Goalkeepers" },
  { value: "DEFENDER", label: "Defenders" },
  { value: "MIDFIELDER", label: "Midfielders" },
  { value: "FORWARD", label: "Forwards" },
  { value: "EXTRA", label: "Extended" },
];

const positionShort: Record<string, string> = {
  GOALKEEPER: "GK",
  DEFENDER: "DEF",
  MIDFIELDER: "MID",
  FORWARD: "FWD",
};

const positionAccent: Record<string, string> = {
  GOALKEEPER: "text-card-gold",
  DEFENDER: "text-pitch-accent",
  MIDFIELDER: "text-floodlight",
  FORWARD: "text-alert-red",
};

/* ── Entrance animation variants ── */
const gridItemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.04,
      duration: 0.35,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

function getPlayerName(p: Player) {
  return `${p.firstName} ${p.lastName}`;
}

/* ── Format match date ── */
function formatMatchDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const formatted = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  if (diffDays === 0) return `Today, ${date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
  if (diffDays === 1) return `Tomorrow, ${date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
  if (diffDays <= 7) return `${formatted} (${diffDays}d)`;
  return formatted;
}

/* ── Get team name from match ── */
function getTeamName(team: string | Team): string {
  if (typeof team === "string") return "TBD";
  return team.name || "TBD";
}

/* ═══════════════════════════════════════════
   MOCK DATA — used when backend is unavailable
   ═══════════════════════════════════════════ */
const MOCK_CLUB_ID = "mock-club-001";

const MOCK_PLAYERS: Player[] = [
  // GOALKEEPER
  { _id: "p01", club: MOCK_CLUB_ID, firstName: "Manuel", lastName: "Neuer", number: 1, position: "GOALKEEPER", status: "ACTIVE", nationality: "Germany", dateOfBirth: "1986-03-27", height: 193, weight: 92, createdAt: "", updatedAt: "" },
  // DEFENDERS
  { _id: "p02", club: MOCK_CLUB_ID, firstName: "Trent", lastName: "Alexander-Arnold", number: 66, position: "DEFENDER", status: "ACTIVE", nationality: "England", dateOfBirth: "1998-10-07", height: 175, weight: 72, createdAt: "", updatedAt: "" },
  { _id: "p03", club: MOCK_CLUB_ID, firstName: "Virgil", lastName: "van Dijk", number: 4, position: "DEFENDER", status: "ACTIVE", nationality: "Netherlands", dateOfBirth: "1991-07-08", height: 193, weight: 92, createdAt: "", updatedAt: "" },
  { _id: "p04", club: MOCK_CLUB_ID, firstName: "Ruben", lastName: "Dias", number: 3, position: "DEFENDER", status: "ACTIVE", nationality: "Portugal", dateOfBirth: "1997-05-14", height: 186, weight: 82, createdAt: "", updatedAt: "" },
  { _id: "p05", club: MOCK_CLUB_ID, firstName: "Alphonso", lastName: "Davies", number: 19, position: "DEFENDER", status: "ACTIVE", nationality: "Canada", dateOfBirth: "2000-11-02", height: 181, weight: 75, createdAt: "", updatedAt: "" },
  // MIDFIELDERS
  { _id: "p06", club: MOCK_CLUB_ID, firstName: "Kevin", lastName: "De Bruyne", number: 17, position: "MIDFIELDER", status: "ACTIVE", nationality: "Belgium", dateOfBirth: "1991-06-28", height: 181, weight: 76, createdAt: "", updatedAt: "" },
  { _id: "p07", club: MOCK_CLUB_ID, firstName: "Jude", lastName: "Bellingham", number: 5, position: "MIDFIELDER", status: "ACTIVE", nationality: "England", dateOfBirth: "2003-06-29", height: 186, weight: 78, createdAt: "", updatedAt: "" },
  { _id: "p08", club: MOCK_CLUB_ID, firstName: "Luka", lastName: "Modric", number: 10, position: "MIDFIELDER", status: "ACTIVE", nationality: "Croatia", dateOfBirth: "1985-09-09", height: 174, weight: 66, createdAt: "", updatedAt: "" },
  // FORWARDS
  { _id: "p09", club: MOCK_CLUB_ID, firstName: "Kylian", lastName: "Mbappé", number: 7, position: "FORWARD", status: "ACTIVE", nationality: "France", dateOfBirth: "1998-12-20", height: 178, weight: 73, createdAt: "", updatedAt: "" },
  { _id: "p10", club: MOCK_CLUB_ID, firstName: "Erling", lastName: "Haaland", number: 9, position: "FORWARD", status: "ACTIVE", nationality: "Norway", dateOfBirth: "2000-07-21", height: 194, weight: 88, createdAt: "", updatedAt: "" },
  { _id: "p11", club: MOCK_CLUB_ID, firstName: "Vinícius", lastName: "Júnior", number: 11, position: "FORWARD", status: "ACTIVE", nationality: "Brazil", dateOfBirth: "2000-07-12", height: 176, weight: 73, createdAt: "", updatedAt: "" },
  // BENCH
  { _id: "p12", club: MOCK_CLUB_ID, firstName: "Thibaut", lastName: "Courtois", number: 25, position: "GOALKEEPER", status: "ACTIVE", nationality: "Belgium", dateOfBirth: "1992-05-11", height: 199, weight: 96, createdAt: "", updatedAt: "" },
  { _id: "p13", club: MOCK_CLUB_ID, firstName: "Achraf", lastName: "Hakimi", number: 2, position: "DEFENDER", status: "ACTIVE", nationality: "Morocco", dateOfBirth: "1998-11-04", height: 181, weight: 73, createdAt: "", updatedAt: "" },
  { _id: "p14", club: MOCK_CLUB_ID, firstName: "Federico", lastName: "Valverde", number: 8, position: "MIDFIELDER", status: "ACTIVE", nationality: "Uruguay", dateOfBirth: "1998-07-22", height: 182, weight: 78, createdAt: "", updatedAt: "" },
  { _id: "p15", club: MOCK_CLUB_ID, firstName: "Bukayo", lastName: "Saka", number: 14, position: "FORWARD", status: "ACTIVE", nationality: "England", dateOfBirth: "2001-09-05", height: 178, weight: 72, createdAt: "", updatedAt: "" },
  { _id: "p16", club: MOCK_CLUB_ID, firstName: "Phil", lastName: "Foden", number: 20, position: "MIDFIELDER", status: "ACTIVE", nationality: "England", dateOfBirth: "2000-05-28", height: 171, weight: 70, createdAt: "", updatedAt: "" },
  { _id: "p17", club: MOCK_CLUB_ID, firstName: "Jamal", lastName: "Musaiala", number: 42, position: "MIDFIELDER", status: "ACTIVE", nationality: "Germany", dateOfBirth: "2003-02-26", height: 180, weight: 72, createdAt: "", updatedAt: "" },
  { _id: "p18", club: MOCK_CLUB_ID, firstName: "Florian", lastName: "Wirtz", number: 10, position: "MIDFIELDER", status: "ACTIVE", nationality: "Germany", dateOfBirth: "2003-05-03", height: 176, weight: 70, createdAt: "", updatedAt: "" },
];

const MOCK_STATISTICS: Statistic[] = [
  // Haaland — prolific scorer
  { _id: "s01", club: MOCK_CLUB_ID, player: "p10", type: "APPEARANCES", value: 35, createdAt: "", updatedAt: "" },
  { _id: "s02", club: MOCK_CLUB_ID, player: "p10", type: "GOALS", value: 28, createdAt: "", updatedAt: "" },
  { _id: "s03", club: MOCK_CLUB_ID, player: "p10", type: "ASSISTS", value: 5, createdAt: "", updatedAt: "" },
  { _id: "s04", club: MOCK_CLUB_ID, player: "p10", type: "MINUTES_PLAYED", value: 2800, createdAt: "", updatedAt: "" },
  // Mbappé
  { _id: "s05", club: MOCK_CLUB_ID, player: "p09", type: "APPEARANCES", value: 32, createdAt: "", updatedAt: "" },
  { _id: "s06", club: MOCK_CLUB_ID, player: "p09", type: "GOALS", value: 22, createdAt: "", updatedAt: "" },
  { _id: "s07", club: MOCK_CLUB_ID, player: "p09", type: "ASSISTS", value: 10, createdAt: "", updatedAt: "" },
  { _id: "s08", club: MOCK_CLUB_ID, player: "p09", type: "MINUTES_PLAYED", value: 2700, createdAt: "", updatedAt: "" },
  // Vinícius
  { _id: "s09", club: MOCK_CLUB_ID, player: "p11", type: "APPEARANCES", value: 30, createdAt: "", updatedAt: "" },
  { _id: "s10", club: MOCK_CLUB_ID, player: "p11", type: "GOALS", value: 18, createdAt: "", updatedAt: "" },
  { _id: "s11", club: MOCK_CLUB_ID, player: "p11", type: "ASSISTS", value: 12, createdAt: "", updatedAt: "" },
  { _id: "s12", club: MOCK_CLUB_ID, player: "p11", type: "MINUTES_PLAYED", value: 2500, createdAt: "", updatedAt: "" },
  // De Bruyne
  { _id: "s13", club: MOCK_CLUB_ID, player: "p06", type: "APPEARANCES", value: 28, createdAt: "", updatedAt: "" },
  { _id: "s14", club: MOCK_CLUB_ID, player: "p06", type: "GOALS", value: 8, createdAt: "", updatedAt: "" },
  { _id: "s15", club: MOCK_CLUB_ID, player: "p06", type: "ASSISTS", value: 16, createdAt: "", updatedAt: "" },
  { _id: "s16", club: MOCK_CLUB_ID, player: "p06", type: "MINUTES_PLAYED", value: 2200, createdAt: "", updatedAt: "" },
  // Bellingham
  { _id: "s17", club: MOCK_CLUB_ID, player: "p07", type: "APPEARANCES", value: 33, createdAt: "", updatedAt: "" },
  { _id: "s18", club: MOCK_CLUB_ID, player: "p07", type: "GOALS", value: 14, createdAt: "", updatedAt: "" },
  { _id: "s19", club: MOCK_CLUB_ID, player: "p07", type: "ASSISTS", value: 8, createdAt: "", updatedAt: "" },
  { _id: "s20", club: MOCK_CLUB_ID, player: "p07", type: "MINUTES_PLAYED", value: 2600, createdAt: "", updatedAt: "" },
  // Neuer — GK
  { _id: "s21", club: MOCK_CLUB_ID, player: "p01", type: "APPEARANCES", value: 30, createdAt: "", updatedAt: "" },
  { _id: "s22", club: MOCK_CLUB_ID, player: "p01", type: "CLEAN_SHEETS", value: 12, createdAt: "", updatedAt: "" },
  { _id: "s23", club: MOCK_CLUB_ID, player: "p01", type: "MINUTES_PLAYED", value: 2700, createdAt: "", updatedAt: "" },
  // Van Dijk
  { _id: "s24", club: MOCK_CLUB_ID, player: "p03", type: "APPEARANCES", value: 34, createdAt: "", updatedAt: "" },
  { _id: "s25", club: MOCK_CLUB_ID, player: "p03", type: "GOALS", value: 3, createdAt: "", updatedAt: "" },
  { _id: "s26", club: MOCK_CLUB_ID, player: "p03", type: "ASSISTS", value: 2, createdAt: "", updatedAt: "" },
  { _id: "s27", club: MOCK_CLUB_ID, player: "p03", type: "MINUTES_PLAYED", value: 3000, createdAt: "", updatedAt: "" },
  { _id: "s28", club: MOCK_CLUB_ID, player: "p03", type: "YELLOW_CARDS", value: 3, createdAt: "", updatedAt: "" },

  // Modric
  { _id: "s37", club: MOCK_CLUB_ID, player: "p08", type: "APPEARANCES", value: 25, createdAt: "", updatedAt: "" },
  { _id: "s38", club: MOCK_CLUB_ID, player: "p08", type: "GOALS", value: 4, createdAt: "", updatedAt: "" },
  { _id: "s39", club: MOCK_CLUB_ID, player: "p08", type: "ASSISTS", value: 8, createdAt: "", updatedAt: "" },
  { _id: "s40", club: MOCK_CLUB_ID, player: "p08", type: "MINUTES_PLAYED", value: 1800, createdAt: "", updatedAt: "" },
  // BENCH PLAYERS
  // Courtois — GK
  { _id: "s41", club: MOCK_CLUB_ID, player: "p12", type: "APPEARANCES", value: 22, createdAt: "", updatedAt: "" },
  { _id: "s42", club: MOCK_CLUB_ID, player: "p12", type: "CLEAN_SHEETS", value: 8, createdAt: "", updatedAt: "" },
  { _id: "s43", club: MOCK_CLUB_ID, player: "p12", type: "MINUTES_PLAYED", value: 1980, createdAt: "", updatedAt: "" },
  // Hakimi
  { _id: "s44", club: MOCK_CLUB_ID, player: "p13", type: "APPEARANCES", value: 28, createdAt: "", updatedAt: "" },
  { _id: "s45", club: MOCK_CLUB_ID, player: "p13", type: "GOALS", value: 3, createdAt: "", updatedAt: "" },
  { _id: "s46", club: MOCK_CLUB_ID, player: "p13", type: "ASSISTS", value: 7, createdAt: "", updatedAt: "" },
  { _id: "s47", club: MOCK_CLUB_ID, player: "p13", type: "MINUTES_PLAYED", value: 2300, createdAt: "", updatedAt: "" },
  // Valverde
  { _id: "s48", club: MOCK_CLUB_ID, player: "p14", type: "APPEARANCES", value: 30, createdAt: "", updatedAt: "" },
  { _id: "s49", club: MOCK_CLUB_ID, player: "p14", type: "GOALS", value: 6, createdAt: "", updatedAt: "" },
  { _id: "s50", club: MOCK_CLUB_ID, player: "p14", type: "ASSISTS", value: 5, createdAt: "", updatedAt: "" },
  { _id: "s51", club: MOCK_CLUB_ID, player: "p14", type: "MINUTES_PLAYED", value: 2400, createdAt: "", updatedAt: "" },
  // Saka
  { _id: "s52", club: MOCK_CLUB_ID, player: "p15", type: "APPEARANCES", value: 31, createdAt: "", updatedAt: "" },
  { _id: "s53", club: MOCK_CLUB_ID, player: "p15", type: "GOALS", value: 12, createdAt: "", updatedAt: "" },
  { _id: "s54", club: MOCK_CLUB_ID, player: "p15", type: "ASSISTS", value: 9, createdAt: "", updatedAt: "" },
  { _id: "s55", club: MOCK_CLUB_ID, player: "p15", type: "MINUTES_PLAYED", value: 2400, createdAt: "", updatedAt: "" },
  // Foden
  { _id: "s56", club: MOCK_CLUB_ID, player: "p16", type: "APPEARANCES", value: 29, createdAt: "", updatedAt: "" },
  { _id: "s57", club: MOCK_CLUB_ID, player: "p16", type: "GOALS", value: 10, createdAt: "", updatedAt: "" },
  { _id: "s58", club: MOCK_CLUB_ID, player: "p16", type: "ASSISTS", value: 7, createdAt: "", updatedAt: "" },
  { _id: "s59", club: MOCK_CLUB_ID, player: "p16", type: "MINUTES_PLAYED", value: 2100, createdAt: "", updatedAt: "" },
  // Musiala
  { _id: "s60", club: MOCK_CLUB_ID, player: "p17", type: "APPEARANCES", value: 27, createdAt: "", updatedAt: "" },
  { _id: "s61", club: MOCK_CLUB_ID, player: "p17", type: "GOALS", value: 9, createdAt: "", updatedAt: "" },
  { _id: "s62", club: MOCK_CLUB_ID, player: "p17", type: "ASSISTS", value: 6, createdAt: "", updatedAt: "" },
  { _id: "s63", club: MOCK_CLUB_ID, player: "p17", type: "MINUTES_PLAYED", value: 2000, createdAt: "", updatedAt: "" },
  // Wirtz
  { _id: "s64", club: MOCK_CLUB_ID, player: "p18", type: "APPEARANCES", value: 26, createdAt: "", updatedAt: "" },
  { _id: "s65", club: MOCK_CLUB_ID, player: "p18", type: "GOALS", value: 8, createdAt: "", updatedAt: "" },
  { _id: "s66", club: MOCK_CLUB_ID, player: "p18", type: "ASSISTS", value: 10, createdAt: "", updatedAt: "" },
  { _id: "s67", club: MOCK_CLUB_ID, player: "p18", type: "MINUTES_PLAYED", value: 1900, createdAt: "", updatedAt: "" },
];

export default function SquadPage() {
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [position, setPosition] = useState("MATCHDAY");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  // Click handler: flip card for formation/matchday, navigate for position views
  const handlePlayerClick = (player: Player) => {
    if (position === "MATCHDAY" || position === "FORMATION") {
      setSelectedPlayer(player);
    } else {
      router.push(`/squad/${player._id}`);
    }
  };
  const [statistics, setStatistics] = useState<Statistic[]>([]);

  // Formation state
  const [formationName, setFormationName] = useState<string>("4-3-3");
  const [formation, setFormation] = useState<Formation>(getFormation("4-3-3"));

  // Team / captain / startingXI state
  const [captainId, setCaptainId] = useState<string | null>(null);
  const [viceCaptainId, setViceCaptainId] = useState<string | null>(null);
  const [teamStartingXI, setTeamStartingXI] = useState<StartingXIEntry[]>([]);

  // Next match state
  const [nextMatch, setNextMatch] = useState<Match | null>(null);
  const [loadingMatch, setLoadingMatch] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  // Update formation when name changes
  useEffect(() => {
    setFormation(getFormation(formationName));
  }, [formationName]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [playersRes, statsRes, teamRes, matchRes] = await Promise.allSettled([
        api.get("/players", { params: { limit: 50, sort: "lastName" } }),
        api.get("/statistics", { params: { limit: 500 } }),
        api.get("/teams", { params: { limit: 1 } }),
        api.get("/matches", { params: { status: "SCHEDULED", sort: "matchDate", limit: 1 } }),
      ]);

      if (playersRes.status === "fulfilled") {
        const apiPlayers = playersRes.value.data.data || [];
        setPlayers(apiPlayers.length > 0 ? apiPlayers : MOCK_PLAYERS);
      } else {
        setPlayers(MOCK_PLAYERS);
      }
      if (statsRes.status === "fulfilled") {
        const apiStats = statsRes.value.data.data || [];
        setStatistics(apiStats.length > 0 ? apiStats : MOCK_STATISTICS);
      } else {
        setStatistics(MOCK_STATISTICS);
      }

      // Set mock captain if no team data
      if (!captainId) setCaptainId("p10"); // Haaland as captain
      if (!viceCaptainId) setViceCaptainId("p03"); // Van Dijk as vice

      // Extract captain from team data
      if (teamRes.status === "fulfilled") {
        const teams = teamRes.value.data.data;
        const team: Team | undefined = Array.isArray(teams) ? teams[0] : teams;
        if (team) {
          const cap = team.captain;
          if (typeof cap === "string") setCaptainId(cap);
          else if (cap && typeof cap === "object") setCaptainId(cap._id);

          const vc = team.viceCaptain;
          if (typeof vc === "string") setViceCaptainId(vc);
          else if (vc && typeof vc === "object") setViceCaptainId(vc._id);

          if (team.formation && FORMATION_OPTIONS.includes(team.formation)) {
            setFormationName(team.formation);
          }

          // Use admin-set starting XI if available
          if ((team as any).startingXI && (team as any).startingXI.length > 0) {
            setTeamStartingXI((team as any).startingXI);
          }
        }
      }



      // Next match
      if (matchRes.status === "fulfilled") {
        const matches = matchRes.value.data.data;
        const match = Array.isArray(matches) ? matches[0] : matches;
        if (match && match.status === "SCHEDULED") {
          setNextMatch(match);
        }
      }
    } catch (e) {
      console.error("Failed to fetch data:", e);
    } finally {
      setLoading(false);
      setLoadingMatch(false);
    }
  };

  // Build starters: use admin-set startingXI if available, otherwise auto-pick
  const starters = useMemo(() => {
    if (teamStartingXI.length > 0) {
      // Map startingXI entries to Player objects
      return teamStartingXI
        .sort((a, b) => a.slotIndex - b.slotIndex)
        .map((entry) => {
          const pid = typeof entry.player === "string" ? entry.player : entry.player._id;
          return players.find((p) => p._id === pid);
        })
        .filter(Boolean) as Player[];
    }
    // Fallback: auto-pick by position priority
    return getStarters(players, formation);
  }, [teamStartingXI, players, formation]);

  const starterIds = new Set(starters.map((p) => p._id));
  const reserves = players.filter((p) => !starterIds.has(p._id));

  // Group by position
  const grouped = players.reduce((acc, p) => {
    if (!acc[p.position]) acc[p.position] = [];
    acc[p.position].push(p);
    return acc;
  }, {} as Record<string, Player[]>);

  const positionOrder = ["GOALKEEPER", "DEFENDER", "MIDFIELDER", "FORWARD"];

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        {/* Header */}
        <div className="mb-10 md:mb-14">
          <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight" style={{ color: '#FF6B4A' }}>
            <span className="text-black">The</span> Squad
          </h1>
          <p className="text-text-secondary mt-3 text-lg max-w-xl">
            Meet the players who wear the shirt with pride.
          </p>
        </div>

        {/* Position Filter */}
        <div className="flex gap-1 mb-10 overflow-x-auto pb-2">
          {positionFilters.map((pos) => (
            <button
              key={pos.value}
              onClick={() => setPosition(pos.value)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors",
                position === pos.value
                  ? "bg-club-accent text-white"
                  : "text-mist hover:text-floodlight hover:bg-surface-raised"
              )}
            >
              {pos.label}
            </button>
          ))}
        </div>

        {loading ? (
          <PageSpinner />
        ) : position === "MATCHDAY" ? (
          /* ═══════════ MATCH DAY XI VIEW ═══════════ */
          <div className="space-y-10">
            {/* Match Info Banner */}
            {nextMatch ? (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="relative overflow-hidden rounded-2xl border border-card-gold/30 bg-gradient-to-r from-surface via-surface-raised to-surface"
              >
                {/* Gold accent top bar */}
                <div className="h-1 bg-gradient-to-r from-card-gold via-amber-400 to-card-gold" />

                <div className="p-6 md:p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-card-gold animate-pulse" />
                    <span className="text-xs font-mono font-bold text-card-gold uppercase tracking-widest">
                      Next Match
                    </span>
                  </div>

                  {/* Teams */}
                  <div className="flex items-center justify-center gap-4 md:gap-8 mb-6">
                    <div className="text-right flex-1">
                      <p className="text-lg md:text-xl font-bold text-floodlight font-display">
                        {getTeamName(nextMatch.homeTeam)}
                      </p>
                      <p className="text-xs text-mist font-mono">HOME</p>
                    </div>

                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-black text-card-gold font-display">VS</span>
                      <span className="text-[10px] font-mono text-mist mt-1">
                        {nextMatch.score.home} - {nextMatch.score.away}
                      </span>
                    </div>

                    <div className="text-left flex-1">
                      <p className="text-lg md:text-xl font-bold text-floodlight font-display">
                        {getTeamName(nextMatch.awayTeam)}
                      </p>
                      <p className="text-xs text-mist font-mono">AWAY</p>
                    </div>
                  </div>

                  {/* Match details */}
                  <div className="flex items-center justify-center gap-4 md:gap-6 text-xs text-mist flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-card-gold" />
                      <span className="font-mono">{formatMatchDate(nextMatch.matchDate)}</span>
                    </div>
                    {nextMatch.venue?.name && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-card-gold" />
                        <span className="font-mono">{nextMatch.venue.name}</span>
                      </div>
                    )}
                    {nextMatch.competition && (
                      <div className="flex items-center gap-1.5">
                        <Trophy className="h-3.5 w-3.5 text-card-gold" />
                        <span className="font-mono">{typeof nextMatch.competition === 'string' ? nextMatch.competition : nextMatch.competition.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : !loadingMatch ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 rounded-2xl border border-line/40 bg-surface"
              >
                <Clock className="h-8 w-8 text-mist mx-auto mb-3" />
                <p className="text-sm text-mist font-mono">No upcoming matches scheduled</p>
                <p className="text-xs text-text-muted mt-1">Showing projected starting XI</p>
              </motion.div>
            ) : null}

            {/* Formation selector */}
            <div className="text-center space-y-4">
              <span className="text-xs font-mono text-card-gold uppercase tracking-widest">
                Predicted Lineup
              </span>
              <h2 className="text-lg font-bold text-floodlight font-display">
                {formationName} Formation
              </h2>

              <div className="flex items-center justify-center gap-2 flex-wrap">
                {FORMATION_OPTIONS.map((name) => (
                  <button
                    key={name}
                    onClick={() => setFormationName(name)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all duration-200",
                      formationName === name
                        ? "bg-card-gold text-white shadow-lg shadow-card-gold/20"
                        : "bg-surface-raised text-mist hover:text-floodlight hover:bg-surface border border-line/40"
                    )}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            {/* Pitch with players — match day mode */}
            <PitchFormation
              starters={starters.slice(0, formation.slots.length)}
              formation={formation}
              statistics={statistics}
              captainId={captainId}
              viceCaptainId={viceCaptainId}
              matchDayMode
              onSelectPlayer={setSelectedPlayer}
            />

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 text-xs text-mist flex-wrap">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-card-gold to-amber-600 border border-amber-300/50 flex items-center justify-center">
                  <span className="text-[7px] font-bold text-white">C</span>
                </div>
                <span>Captain</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-silver border border-white/30 flex items-center justify-center">
                  <span className="text-[7px] font-bold text-gray-700">V</span>
                </div>
                <span>Vice Captain</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full border border-card-gold/30 bg-club-primary" />
                <span>Hover for stats</span>
              </div>
            </div>

            {/* Reserves */}
            {reserves.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-sm font-mono font-bold text-text-secondary uppercase tracking-widest">
                    Bench
                  </span>
                  <span className="h-px flex-1 bg-line" />
                  <span className="text-xs text-mist font-mono">{reserves.length}</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {reserves.map((player, i) => (
                    <motion.div
                      key={player._id}
                      custom={i}
                      variants={gridItemVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <ReserveCard
                        player={player}
                        isCaptain={player._id === captainId}
                        onClick={() => setSelectedPlayer(player)}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : position === "FORMATION" ? (
          /* ═══════════ FORMATION VIEW ═══════════ */
          <div className="space-y-16">
            {/* Formation selector + label */}
            <div className="text-center space-y-4">
              <span className="text-xs font-mono text-club-accent uppercase tracking-widest">
                Starting XI
              </span>
              <h2 className="text-lg font-bold text-floodlight font-display">
                {formationName} Formation
              </h2>

              {/* Formation switcher */}
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {FORMATION_OPTIONS.map((name) => (
                  <button
                    key={name}
                    onClick={() => setFormationName(name)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all duration-200",
                      formationName === name
                        ? "bg-club-accent text-white shadow-lg shadow-club-accent/20"
                        : "bg-surface-raised text-mist hover:text-floodlight hover:bg-surface border border-line/40"
                    )}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            {/* Pitch with players */}
            <PitchFormation
              starters={starters.slice(0, formation.slots.length)}
              formation={formation}
              statistics={statistics}
              captainId={captainId}
              viceCaptainId={viceCaptainId}
              onSelectPlayer={setSelectedPlayer}
            />

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 text-xs text-mist">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-card-gold to-amber-600 border border-amber-300/50 flex items-center justify-center">
                  <span className="text-[7px] font-bold text-white">C</span>
                </div>
                <span>Captain</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-silver border border-white/30 flex items-center justify-center">
                  <span className="text-[7px] font-bold text-gray-700">V</span>
                </div>
                <span>Vice Captain</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full border border-line bg-club-primary" />
                <span>Hover for stats</span>
              </div>
            </div>

            {/* Reserves */}
            {reserves.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-sm font-mono font-bold text-text-secondary uppercase tracking-widest">
                    Reserves
                  </span>
                  <span className="h-px flex-1 bg-line" />
                  <span className="text-xs text-mist font-mono">{reserves.length}</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {reserves.map((player, i) => (
                    <motion.div
                      key={player._id}
                      custom={i}
                      variants={gridItemVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <ReserveCard
                        player={player}
                        isCaptain={player._id === captainId}
                        onClick={() => setSelectedPlayer(player)}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : position === "EXTRA" ? (
          /* ═══════════ EXTENDED SQUAD VIEW ═══════════ */
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-sm font-mono font-bold text-club-accent uppercase tracking-widest">
                Extended Squad
              </span>
              <span className="h-px flex-1 bg-line" />
              <span className="text-xs text-mist font-mono">{players.length} players</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {players.map((player, i) => (
                <motion.div
                  key={player._id}
                  custom={i}
                  variants={gridItemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <PlayerGridCard
                    player={player}
                    isCaptain={player._id === captainId}
                    onClick={() => handlePlayerClick(player)}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          /* ═══════════ FILTERED / GROUPED VIEW ═══════════ */
          <div className="space-y-14">
            {positionOrder.map((pos) => {
              const group = grouped[pos];
              if (!group || group.length === 0) return null;
              if (position && position !== pos) return null;
              return (
                <section key={pos}>
                  <div className="flex items-center gap-3 mb-6">
                    <span className={cn("text-sm font-mono font-bold uppercase tracking-widest", positionAccent[pos])}>
                      {positionShort[pos]}
                    </span>
                    <span className="h-px flex-1 bg-line" />
                    <span className="text-xs text-mist font-mono">{group.length}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                    {group.map((player, i) => (
                      <motion.div
                        key={player._id}
                        custom={i}
                        variants={gridItemVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        <PlayerGridCard
                          player={player}
                          isCaptain={player._id === captainId}
                          onClick={() => handlePlayerClick(player)}
                        />
                      </motion.div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      {/* FC26 Player Reveal Card */}
      <PlayerRevealCard player={selectedPlayer} statistics={statistics} onClose={() => setSelectedPlayer(null)} />
    </>
  );
}

/* ── Helper: pick starters based on formation slot count ── */
function getStarters(all: Player[], formation: Formation): Player[] {
  const slotCount = formation.slots.length;
  const picks: Player[] = [];
  const order: [string, number][] = [
    ["GOALKEEPER", 1],
    ["DEFENDER", 4],
    ["MIDFIELDER", 3],
    ["FORWARD", 3],
  ];

  // First pass: pick by position priority
  for (const [pos, count] of order) {
    if (picks.length >= slotCount) break;
    const pool = all.filter((p) => p.position === pos && !picks.includes(p));
    picks.push(...pool.slice(0, Math.min(count, slotCount - picks.length)));
  }

  // Fill remaining slots from unsorted
  const remaining = all.filter((p) => !picks.includes(p));
  while (picks.length < slotCount && remaining.length > 0) {
    picks.push(remaining.shift()!);
  }

  return picks;
}

/* ── Reserve Card ── */
function ReserveCard({
  player,
  isCaptain,
  onClick,
}: {
  player: Player;
  isCaptain?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group aspect-[3/4] bg-surface rounded-xl overflow-hidden relative border border-line/40 transition-all duration-300 hover:border-pitch-accent/40 hover:shadow-lg text-left"
    >
      {player.photo ? (
        <img
          src={player.photo}
          alt={getPlayerName(player)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-surface-raised">
          <span className="text-3xl font-bold text-line font-display">{player.firstName?.charAt(0)}</span>
        </div>
      )}
      {isCaptain && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-gradient-to-br from-card-gold to-amber-600 border border-amber-300/50 flex items-center justify-center shadow-md animate-captain-glow">
          <span className="text-[8px] font-bold text-white">C</span>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
        <p className="text-[10px] font-bold text-white truncate">
          {player.firstName} {player.lastName}
        </p>
        <p className="text-[8px] text-white/50 font-mono">
          {positionShort[player.position]}{player.number ? ` · #${player.number}` : ""}
        </p>
      </div>
    </button>
  );
}

/* ── Grid Card (for filtered / grouped views) ── */
function PlayerGridCard({
  player,
  isCaptain,
  onClick,
}: {
  player: Player;
  isCaptain?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group bg-surface rounded-xl overflow-hidden transition-all duration-200 hover:bg-surface-raised border border-line/30 text-left"
    >
      <div className="relative aspect-[3/4] bg-surface-raised overflow-hidden">
        {player.photo ? (
          <img
            src={player.photo}
            alt={getPlayerName(player)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl font-bold text-line font-display opacity-20">
              {player.firstName?.charAt(0)}
            </span>
          </div>
        )}
        {player.number && (
          <span className="absolute bottom-2 left-2 text-[10px] font-mono font-bold text-white/80 bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded">
            #{player.number}
          </span>
        )}
        {isCaptain && (
          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-gradient-to-br from-card-gold to-amber-600 border border-amber-300/50 flex items-center justify-center shadow-md animate-captain-glow">
            <span className="text-[8px] font-bold text-white">C</span>
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-medium text-floodlight truncate group-hover:text-pitch-accent transition-colors">
          {getPlayerName(player)}
        </p>
        <p className="text-[10px] text-mist font-mono mt-0.5">
          {positionShort[player.position]}
        </p>
      </div>
    </button>
  );
}
