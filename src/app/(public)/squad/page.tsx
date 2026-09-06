"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Player, Statistic, Team, Formation, Match, StartingXIEntry, MatchFormation } from "@/types";
import { cn } from "@/lib/utils";
import PitchFormation from "@/components/shared/PitchFormation";
import PlayerRevealCard from "@/components/shared/PlayerRevealCard";
import { getFormation, FORMATION_OPTIONS } from "@/lib/formations";
import { getSocket, connectSocket } from "@/lib/socket";
import { motion } from "framer-motion";
import { Calendar, MapPin, Trophy, Clock } from "lucide-react";

// Number of players fetched per request while infinitely scrolling the roster
const PLAYERS_PAGE_SIZE = 20;
// localStorage key that remembers the last squad view (MATCHDAY / FORMATION / position / EXTRA)
const VIEW_STORAGE_KEY = "squad-view";

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
function getTeamName(team: string | Team | null): string {
  if (!team || typeof team === "string") return "TBD";
  return team.name || "TBD";
}

/* ── Loading skeleton (shown while the page fetches real squad data) ── */
function SquadSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Filter pills */}
      <div className="flex gap-1 mb-10 pb-2 overflow-hidden">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-9 w-24 shrink-0 rounded-lg bg-surface-raised border border-line/40" />
        ))}
      </div>
      {/* Pitch placeholder */}
      <div className="h-[340px] md:h-[480px] max-w-2xl mx-auto rounded-2xl border border-line/40 bg-surface-raised/50" />
      {/* Bench / player card placeholders */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 mt-8">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="aspect-[3/4] rounded-xl border border-line/40 bg-surface-raised" />
        ))}
      </div>
      <p className="sr-only">Loading squad…</p>
    </div>
  );
}

/* ── Empty state (no real squad data yet — no fabricated players) ── */
function EmptySquadState() {
  return (
    <div className="py-16 text-center rounded-2xl border border-dashed border-line/50 bg-surface">
      <p className="text-sm font-semibold text-floodlight">The squad is empty</p>
      <p className="text-xs text-mist mt-1.5 max-w-md mx-auto">
        Real player data will appear here as soon as players are added. No sample or placeholder
        players are ever shown.
      </p>
    </div>
  );
}

export default function SquadPage() {
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [position, setPosition] = useState("MATCHDAY");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  // Remember the squad view the visitor last used. A URL ?view= parameter wins
  // over localStorage, so shared links can still pin a specific section.
  useEffect(() => {
    let saved: string | null = null;
    try {
      const urlView = new URLSearchParams(window.location.search).get("view");
      saved = urlView !== null ? urlView : localStorage.getItem(VIEW_STORAGE_KEY);
    } catch {
      saved = null;
    }
    if (saved !== null && positionFilters.some((f) => f.value === saved)) {
      setPosition(saved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeView = (view: string) => {
    setPosition(view);
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, view);
      const url = new URL(window.location.href);
      if (view) url.searchParams.set("view", view);
      else url.searchParams.delete("view");
      window.history.replaceState(null, "", url.toString());
    } catch {
      // Persistence is a nice-to-have — ignore failures (private mode, storage blocked)
    }
  };

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
  const [teamFormationName, setTeamFormationName] = useState<string>("4-3-3");

  // Team / captain / startingXI state
  const [captainId, setCaptainId] = useState<string | null>(null);
  const [viceCaptainId, setViceCaptainId] = useState<string | null>(null);
  const [teamStartingXI, setTeamStartingXI] = useState<StartingXIEntry[]>([]);
  const [teamPlayerIds, setTeamPlayerIds] = useState<Set<string>>(new Set());
  const [teamBench, setTeamBench] = useState<Player[]>([]);

  // Next match state
  const [nextMatch, setNextMatch] = useState<Match | null>(null);
  const [loadingMatch, setLoadingMatch] = useState(true);  // Match formation state (from MatchFormation API)
  const [matchFormation, setMatchFormation] = useState<MatchFormation | null>(null);

  // Infinite scroll — the roster loads a page at a time until every player is fetched
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const pageRef = useRef(1);
  const hasMoreRef = useRef(false);
  const busyRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Refs for socket room management
  const currentMatchIdRef = useRef<string>("");
  const currentTeamIdRef = useRef<string>("");

  // Helper: re-fetch match formation for the current match
  // Uses the /match/:matchId endpoint (returns all formations for the match)
  // then picks the one matching our team
  const refreshMatchFormation = useCallback(async (matchId?: string, teamId?: string) => {
    const mid = matchId || currentMatchIdRef.current;
    const tid = teamId || currentTeamIdRef.current;
    if (!mid) return;
    try {
      console.log("[Squad] refreshMatchFormation: matchId=", mid, "teamId=", tid);
      const mfRes = await api.get(`/match-formations/match/${mid}`);
      const formations: MatchFormation[] = mfRes.data?.data || [];
      console.log("[Squad] API returned formations:", formations.length, formations.map((f) => ({
        team: typeof f.team === "object" ? f.team.name : f.team,
        teamId: typeof f.team === "object" ? f.team._id : f.team,
        formation: f.formation,
        xi: f.startingXI?.length,
        bench: f.bench?.length,
      })));
      // Find the formation for our team
      const mfData = tid
        ? formations.find((f) => {
            const fTeamId = typeof f.team === "object" ? f.team._id : f.team;
            return fTeamId === tid;
          })
        : formations[0];
      console.log("[Squad] Matched formation:", mfData ? { formation: mfData.formation, xi: mfData.startingXI?.length, bench: mfData.bench?.length } : "NONE");
      if (mfData) {
        setMatchFormation(mfData);
        if (mfData.formation) setFormationName(mfData.formation);
        const cap = mfData.captain;
        if (cap && typeof cap === "object" && cap._id) setCaptainId(cap._id);
      } else {
        setMatchFormation(null);
      }
    } catch (e) {
      console.error("[Squad] refreshMatchFormation FAILED:", e);
      setMatchFormation(null);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  // Re-fetch formations when page regains focus (to handle tab switching from admin)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && currentMatchIdRef.current) {
        console.log("[Squad] Page visible — re-fetching match formation");
        refreshMatchFormation(currentMatchIdRef.current, currentTeamIdRef.current);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [refreshMatchFormation]);

  // Update formation when name changes — use teamFormationName for Formation tab, formationName for Matchday
  useEffect(() => {
    const activeName = position === "FORMATION" ? teamFormationName : formationName;
    setFormation(getFormation(activeName));
  }, [formationName, teamFormationName, position]);

  // Socket connection for real-time formation updates
  useEffect(() => {
    const socket = connectSocket();

    const handleConnect = () => {
      console.log("[Squad] Socket connected, joining room for match:", currentMatchIdRef.current);
      if (currentMatchIdRef.current) {
        socket.emit("formation:join", currentMatchIdRef.current);
      }
    };

    const handleFormationUpdate = (data: { matchId: string; teamId: string }) => {
      console.log("[Squad] Socket received formation:update", data);
      if (data.matchId === currentMatchIdRef.current) {
        // Re-fetch all formations for this match, then pick ours
        refreshMatchFormation(data.matchId, currentTeamIdRef.current);
      }
    };

    const handleFormationDeleted = (data: { matchId: string; teamId: string }) => {
      console.log("[Squad] Socket received formation:deleted", data);
      if (data.matchId === currentMatchIdRef.current) {
        refreshMatchFormation(data.matchId, currentTeamIdRef.current);
      }
    };

    socket.on("connect", handleConnect);
    socket.on("formation:update", handleFormationUpdate);
    socket.on("formation:deleted", handleFormationDeleted);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("formation:update", handleFormationUpdate);
      socket.off("formation:deleted", handleFormationDeleted);
      if (currentMatchIdRef.current) {
        socket.emit("formation:leave", currentMatchIdRef.current);
      }
    };
  }, [refreshMatchFormation]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [playersRes, statsRes, teamRes, matchRes, liveMatchRes] = await Promise.allSettled([
        api.get("/players", { params: { limit: PLAYERS_PAGE_SIZE, page: 1, sort: "lastName" } }),
        api.get("/statistics", { params: { limit: 500 } }),
        api.get("/teams", { params: { limit: 10 } }),
        api.get("/matches", { params: { status: "SCHEDULED", sort: "matchDate", limit: 5 } }),
        api.get("/matches", { params: { status: "LIVE", sort: "matchDate", limit: 5 } }),
      ]);

      if (playersRes.status === "fulfilled") {
        const pageData = playersRes.value.data || {};
        setPlayers(pageData.data || []);
        pageRef.current = 1;
        const more = 1 < (pageData.totalPages || 1);
        hasMoreRef.current = more;
        setHasMore(more);
      } else {
        console.error("Failed to load players:", playersRes.reason);
        setPlayers([]);
        hasMoreRef.current = false;
        setHasMore(false);
      }
      if (statsRes.status === "fulfilled") {
        setStatistics(statsRes.value.data.data || []);
      } else {
        console.error("Failed to load statistics:", statsRes.reason);
        setStatistics([]);
      }

      // Extract captain from team data — prefer SENIOR team
      let firstTeamId: string | null = null;
      if (teamRes.status === "fulfilled") {
        const allTeams: Team[] = teamRes.value.data.data || [];
        const team: Team | undefined =
          (Array.isArray(allTeams) ? allTeams : []).find((t) => t.category === "SENIOR") ||
          (Array.isArray(allTeams) ? allTeams[0] : undefined);
        if (team) {
          firstTeamId = typeof team._id === "string" ? team._id : null;

          const cap = team.captain;
          if (typeof cap === "string") setCaptainId(cap);
          else if (cap && typeof cap === "object") setCaptainId(cap._id);

          const vc = team.viceCaptain;
          if (typeof vc === "string") setViceCaptainId(vc);
          else if (vc && typeof vc === "object") setViceCaptainId(vc._id);

          if (team.formation && FORMATION_OPTIONS.includes(team.formation)) {
            setTeamFormationName(team.formation);
          }

          // Use admin-set starting XI if available
          if ((team as any).startingXI && (team as any).startingXI.length > 0) {
            setTeamStartingXI((team as any).startingXI);
          }

          // Load bench players from team data
          if ((team as any).bench && (team as any).bench.length > 0) {
            const bench = (team as any).bench
              .filter((p: any) => p && p._id)
              .map((p: any) => (typeof p === "object" ? p : null))
              .filter(Boolean);
            setTeamBench(bench);
          }

          // Track team player IDs for filtering reserves
          const tPlayerIds = (team.players || []).map((p: any) => {
            if (typeof p === "string") return p;
            if (typeof p === "object" && p._id) return p._id;
            return null;
          }).filter(Boolean) as string[];
          setTeamPlayerIds(new Set(tPlayerIds));
        }
      }

      // Next match + match formation
      // Prefer SCHEDULED, then fall back to LIVE
      const scheduledMatchList = matchRes.status === "fulfilled" ? (matchRes.value.data.data || []) : [];
      const liveMatchList = liveMatchRes.status === "fulfilled" ? (liveMatchRes.value.data.data || []) : [];
      const allUpcoming = [...scheduledMatchList, ...liveMatchList.filter((lm: any) => !scheduledMatchList.some((sm: any) => sm._id === lm._id))];
      const match = allUpcoming.length > 0 ? allUpcoming[0] : null;
      if (match && (match.status === "SCHEDULED" || match.status === "LIVE")) {
        setNextMatch(match);

        // Store IDs for socket room management
        currentMatchIdRef.current = match._id;
        if (firstTeamId) currentTeamIdRef.current = firstTeamId;
        console.log("[Squad] Next match:", { matchId: match._id, status: match.status, teamId: firstTeamId });

        // Join socket formation room for real-time updates
        const socket = getSocket();
        socket.emit("formation:join", currentMatchIdRef.current);

        // Fetch match formation for this match (admin-set lineup)
        // First try with our team ID, then fall back to any formation for the match
        await refreshMatchFormation(match._id, firstTeamId || undefined);
      }
    } catch (e) {
      console.error("Failed to fetch data:", e);
    } finally {
      setLoading(false);
      setLoadingMatch(false);
    }
  };

  // Load the next page of players when the roster sentinel scrolls into view.
  // Stops automatically once the API reports we're on the last page.
  const loadMorePlayers = useCallback(async () => {
    if (busyRef.current || !hasMoreRef.current) return;
    busyRef.current = true;
    setLoadingMore(true);
    try {
      const nextPage = pageRef.current + 1;
      const res = await api.get("/players", {
        params: { limit: PLAYERS_PAGE_SIZE, page: nextPage, sort: "lastName" },
      });
      const resData = res.data || {};
      const incoming: Player[] = resData.data || [];
      setPlayers((prev) => {
        const seen = new Set(prev.map((p) => p._id));
        return [...prev, ...incoming.filter((p) => !seen.has(p._id))];
      });
      pageRef.current = nextPage;
      const more = nextPage < (resData.totalPages || 1);
      hasMoreRef.current = more;
      setHasMore(more);
    } catch (e) {
      console.error("Failed to load more players:", e);
    } finally {
      busyRef.current = false;
      setLoadingMore(false);
    }
  }, []);

  // Watch the sentinel at the bottom of the roster and load more when visible
  useEffect(() => {
    if (!hasMore) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadMorePlayers();
        }
      },
      { rootMargin: "400px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadMorePlayers]);

  // Build starters (slot-aligned — index i matches pitch slot i). Entries that
  // reference a player who no longer exists are skipped instead of crashing.
  const starters = useMemo<(Player | undefined)[]>(() => {
    const slotCount = formation.slots.length;
    const bySlot: (Player | undefined)[] = new Array(slotCount).fill(undefined);

    // 1. Match formation (admin-set per match), 2. Team startingXI (admin-set default)
    const source =
      matchFormation && matchFormation.startingXI && matchFormation.startingXI.length > 0
        ? matchFormation.startingXI
        : teamStartingXI.length > 0
          ? teamStartingXI
          : null;

    if (source) {
      const ordered = [...source].sort((a, b) => a.slotIndex - b.slotIndex);
      for (const entry of ordered) {
        const entryPlayer = entry && entry.player ? entry.player : null;
        if (!entryPlayer) continue;
        const pid = typeof entryPlayer === "string" ? entryPlayer : entryPlayer?._id;
        if (!pid) continue;
        const p = players.find((pl) => pl._id === pid);
        if (p && entry.slotIndex >= 0 && entry.slotIndex < slotCount) {
          bySlot[entry.slotIndex] = p;
        }
      }
      return bySlot;
    }

    // 3. Auto-pick by position priority
    const picks = getStarters(players, formation);
    picks.forEach((p, i) => {
      if (i < slotCount) bySlot[i] = p;
    });
    return bySlot;
  }, [matchFormation, teamStartingXI, players, formation]);

  // Build bench: prefer match formation, then team bench (null-safe)
  const benchPlayers = useMemo(() => {
    // 1. Match formation bench (admin-set per match)
    if (matchFormation && matchFormation.bench && matchFormation.bench.length > 0) {
      return matchFormation.bench
        .map((p) => {
          const pid = typeof p === "string" ? p : p && p._id;
          return pid ? players.find((pl) => pl._id === pid) : undefined;
        })
        .filter((p): p is Player => !!p) as Player[];
    }
    // 2. Team bench (admin-set default)
    if (teamBench.length > 0) {
      return teamBench
        .map((p) => players.find((pl) => pl._id === p._id))
        .filter((p): p is Player => !!p) as Player[];
    }
    return [];
  }, [matchFormation, teamBench, players]);

  const starterIds = new Set(starters.map((p) => p?._id).filter((id): id is string => !!id));
  // Only show team members as reserves (not all club players)
  const reserves = players.filter((p) => !starterIds.has(p._id) && (teamPlayerIds.size === 0 || teamPlayerIds.has(p._id)));

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
            <span className="text-floodlight">The</span> Squad
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
              onClick={() => changeView(pos.value)}
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
          <SquadSkeleton />
        ) : players.length === 0 ? (
          <EmptySquadState />
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
              starters={starters}
              formation={formation}
              statistics={statistics}
              captainId={captainId}
              viceCaptainId={viceCaptainId}
              matchDayMode
              onSelectPlayer={setSelectedPlayer}
            />            {/* Bench / Reserves */}
            {benchPlayers.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-mono text-card-gold uppercase tracking-widest">
                    Bench / Reserves ({benchPlayers.length})
                  </span>
                  <span className="h-px flex-1 bg-line/40" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {benchPlayers.map((player, i) => (
                    <motion.div
                      key={`bench-${player._id}`}
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
                {teamFormationName} Formation
              </h2>

              {/* Formation switcher */}
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {FORMATION_OPTIONS.map((name) => (
                  <button
                    key={name}
                    onClick={() => setTeamFormationName(name)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all duration-200",
                      teamFormationName === name
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
              starters={starters}
              formation={formation}
              statistics={statistics}
              captainId={captainId}
              viceCaptainId={viceCaptainId}
              onSelectPlayer={setSelectedPlayer}
            />

            {/* Bench / Reserves */}
            {benchPlayers.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-mono text-card-gold uppercase tracking-widest">
                    Bench / Reserves ({benchPlayers.length})
                  </span>
                  <span className="h-px flex-1 bg-line/40" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {benchPlayers.map((player, i) => (
                    <motion.div
                      key={`bench-${player._id}`}
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
            {/* Responsive vertical grid (no horizontal swipe) */}
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
                  {/* Responsive vertical grid (no horizontal swipe) */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
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

        {/* Infinite scroll sentinel — loads the next page of players */}
        {!loading && players.length > 0 && hasMore && (
          <div ref={sentinelRef} className="flex items-center justify-center py-6">
            <span className="flex items-center gap-2 text-xs text-mist font-mono">
              {loadingMore ? (
                <>
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-line border-t-club-accent animate-spin" />
                  Loading more players…
                </>
              ) : (
                "Keep scrolling to load the full squad"
              )}
            </span>
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
