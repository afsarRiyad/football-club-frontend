"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Calendar, Ruler, Weight, Share2, Check } from "lucide-react";
import SmartPortraitImage from "./SmartPortraitImage";
import { Player, Statistic, StatisticType } from "@/types";
import { cn } from "@/lib/utils";

const positionLabel: Record<string, string> = {
  GOALKEEPER: "GK", DEFENDER: "CB", MIDFIELDER: "CM", FORWARD: "ST",
};

function getCardRarity(rating: number) {
  if (rating >= 90) return { bg: "from-[#d4a843] via-[#f0d060] to-[#b8922e]", border: "border-amber-400/60", effect: "card-effect-fire", tier: "legend" as const };
  if (rating >= 85) return { bg: "from-[#c9a84c] via-[#e8c85a] to-[#a08530]", border: "border-amber-500/40", effect: "card-effect-lightning", tier: "elite" as const };
  if (rating >= 80) return { bg: "from-[#b89830] via-[#d4b840] to-[#907820]", border: "border-yellow-500/30", effect: "card-effect-shimmer", tier: "gold" as const };
  if (rating >= 75) return { bg: "from-[#8a8a8a] via-[#c0c0c0] to-[#707070]", border: "border-gray-300/40", effect: "", tier: "silver" as const };
  if (rating >= 70) return { bg: "from-[#7a7a7a] via-[#b0b0b0] to-[#606060]", border: "border-gray-400/30", effect: "", tier: "silver" as const };
  return { bg: "from-[#8B6914] via-[#CD9B1D] to-[#6B4F12]", border: "border-yellow-700/40", effect: "", tier: "bronze" as const };
}

function getPackColor(tier: string) {
  switch (tier) {
    case "legend": return "from-amber-600 via-yellow-500 to-amber-700";
    case "elite": return "from-amber-700 via-yellow-600 to-amber-800";
    case "gold": return "from-yellow-700 via-yellow-500 to-yellow-800";
    case "silver": return "from-gray-500 via-gray-300 to-gray-600";
    default: return "from-yellow-800 via-yellow-600 to-yellow-900";
  }
}

function aggregateStats(stats: Statistic[], playerId: string) {
  const playerStats = stats.filter((s) => {
    const pid = typeof s.player === "string" ? s.player : s.player?._id;
    return pid === playerId;
  });
  const get = (type: StatisticType) =>
    playerStats.filter((s) => s.type === type).reduce((sum, s) => sum + s.value, 0);
  return {
    goals: get("GOALS"), assists: get("ASSISTS"), appearances: get("APPEARANCES"),
    minutesPlayed: get("MINUTES_PLAYED"), cleanSheets: get("CLEAN_SHEETS"),
    yellowCards: get("YELLOW_CARDS"), redCards: get("RED_CARDS"),
  };
}

function calcOVR(player: Player): number {
  const { pac = 50, sho = 50, pas = 50, dri = 50, def = 50, phy = 50 } = player;
  return Math.round((pac + sho + pas + dri + def + phy) / 6);
}

function getPlayerFaceStats(player: Player) {
  const hasStats = [player.pac, player.sho, player.pas, player.dri, player.def, player.phy].some(v => v != null);
  if (player.position === "GOALKEEPER") {
    if (hasStats) {
      return [
        { label: "DIV", value: player.pac ?? 50 }, { label: "HND", value: player.sho ?? 50 },
        { label: "KIC", value: player.pas ?? 50 }, { label: "REF", value: player.dri ?? 50 },
        { label: "SPD", value: player.def ?? 50 }, { label: "POS", value: player.phy ?? 50 },
      ];
    }
    return [
      { label: "DIV", value: 50 }, { label: "HND", value: 50 },
      { label: "KIC", value: 50 }, { label: "REF", value: 50 },
      { label: "SPD", value: 50 }, { label: "POS", value: 50 },
    ];
  }
  return [
    { label: "PAC", value: player.pac ?? 50 }, { label: "SHO", value: player.sho ?? 50 },
    { label: "PAS", value: player.pas ?? 50 }, { label: "DRI", value: player.dri ?? 50 },
    { label: "DEF", value: player.def ?? 50 }, { label: "PHY", value: player.phy ?? 50 },
  ];
}

function getStatColor(val: number): string {
  if (val >= 85) return "text-amber-400";
  if (val >= 75) return "text-emerald-400";
  if (val >= 65) return "text-blue-400";
  return "text-white/70";
}

function getAge(dob?: string): string {
  if (!dob) return "—";
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) age--;
  return age < 0 ? "—" : `${age}`;
}

function buildShareText(player: Player, rating: number, careerStats: ReturnType<typeof aggregateStats>): string {
  const lines = [
    `⚽ ${player.firstName} ${player.lastName}`,
    `Rating: ${rating} | ${positionLabel[player.position]}${player.number ? ` | #${player.number}` : ""}`,
    "",
    `📊 Season Stats:`,
    `  ${careerStats.appearances} Apps | ${careerStats.goals} Goals | ${careerStats.assists} Assists`,
  ];
  if (player.position === "GOALKEEPER") lines.push(`  ${careerStats.cleanSheets} Clean Sheets`);
  if (player.nationality) lines.push(`\n🌍 ${player.nationality}`);
  lines.push(`\n🏅 FC Player Card`);
  return lines.join("\n");
}

interface PlayerRevealCardProps {
  player: Player | null;
  statistics: Statistic[];
  onClose: () => void;
}

export default function PlayerRevealCard({ player, statistics, onClose }: PlayerRevealCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showPack, setShowPack] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [shareState, setShareState] = useState<"idle" | "copied">("idle");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!player) { setShowPack(false); setShowCard(false); setIsFlipped(false); return; }
    setIsFlipped(false); setShowCard(false); setShowPack(true); setShareState("idle");
    timerRef.current = setTimeout(() => { setShowPack(false); setShowCard(true); }, 1200);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [player?._id]);

  const handleSkip = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setShowPack(false); setShowCard(true);
  }, []);

  const handleClose = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setShowCard(false); setShowPack(false); setIsFlipped(false); onClose();
  }, [onClose]);

  const careerStats = player ? aggregateStats(statistics, player._id) : null;
  const rating = player ? calcOVR(player) : 70;
  const faceStats = player ? getPlayerFaceStats(player) : [];
  const rarity = getCardRarity(rating);
  const age = player ? getAge(player.dateOfBirth) : "—";
  const decoyCount = rating >= 85 ? 4 : rating >= 80 ? 3 : 2;

  const handleShare = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!player || !careerStats) return;
    const text = buildShareText(player, rating, careerStats);
    if (navigator.share) {
      try { await navigator.share({ title: `${player.firstName} ${player.lastName} — FC Card`, text }); } catch {}
    } else {
      try { await navigator.clipboard.writeText(text); setShareState("copied"); setTimeout(() => setShareState("idle"), 2000); } catch {}
    }
  }, [player, rating, careerStats]);

  return (
    <AnimatePresence>
      {player && (
        <motion.div
          key="card-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={handleClose}
        >
          <div className="absolute inset-0 bg-black/85 backdrop-blur-xl" />

          <div
            className="relative z-10 w-[min(370px,92vw)] aspect-[2/3]"
            style={{ perspective: "1200px" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ══════ PACK PHASE ══════ */}
            <AnimatePresence>
              {showPack && (
                <motion.div key="pack" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                  {Array.from({ length: decoyCount }).map((_, i) => {
                    const angle = (i - (decoyCount - 1) / 2) * 10;
                    const xOffset = (i - (decoyCount - 1) / 2) * 35;
                    return (
                      <motion.div key={`decoy-${i}`} className="absolute inset-0 rounded-3xl overflow-hidden border-2 border-white/10"
                        initial={{ x: 0, y: 0, rotate: 0, scale: 0.7, opacity: 0 }}
                        animate={{ x: xOffset, y: 0, rotate: angle, scale: 1, opacity: 0.8 }}
                        exit={{ x: xOffset * 4, y: -80, rotate: angle * 3, scale: 0.4, opacity: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        style={{ zIndex: i }}
                      >
                        <div className={cn("absolute inset-0 bg-gradient-to-b", getPackColor(rarity.tier))} />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/40" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full border-2 border-white/20 flex items-center justify-center">
                            <span className="text-2xl font-black text-white/40 font-display">FC</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                  <motion.div className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }} transition={{ delay: 0.8, duration: 0.5 }}
                  >
                    <div className={cn("w-48 h-48 rounded-full",
                      rating >= 90 ? "bg-gradient-to-br from-amber-400/60 via-orange-500/30 to-transparent" :
                      rating >= 85 ? "bg-gradient-to-br from-blue-300/60 via-cyan-400/30 to-transparent" :
                      "bg-gradient-to-br from-yellow-300/60 via-amber-400/30 to-transparent"
                    )} />
                  </motion.div>
                  <motion.button
                    className="absolute bottom-[-44px] left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-white/70 text-[11px] font-mono hover:bg-white/20 hover:text-white transition-all z-30 whitespace-nowrap"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    onClick={(e) => { e.stopPropagation(); handleSkip(); }}
                  >
                    Tap to skip ▸
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ══════ REAL CARD ══════ */}
            <AnimatePresence>
              {showCard && (
                <motion.div key="real-card" className="absolute inset-0 cursor-pointer"
                  style={{ transformStyle: "preserve-3d" }}
                  initial={{ scale: 0.2, opacity: 0, rotateY: -120 }}
                  animate={{ scale: 1, opacity: 1, rotateY: isFlipped ? 180 : 0 }}
                  exit={{ scale: 0.3, opacity: 0, rotateY: 120 }}
                  transition={{ type: "spring", stiffness: 70, damping: 16, mass: 1.3, opacity: { duration: 0.3 } }}
                  onClick={() => setIsFlipped(!isFlipped)}
                >
                  {/* ══════ FRONT FACE ══════ */}
                  <div className={cn("absolute inset-0 rounded-3xl overflow-hidden border-2", rarity.border, "shadow-2xl", rarity.effect)}
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <div className={cn("absolute inset-0 bg-gradient-to-b", rarity.bg)} />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
                      style={{ backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.5) 10px, rgba(255,255,255,0.5) 11px)` }}
                    />

                    <div className="relative h-full flex flex-col px-5 pt-3 pb-4 z-10">
                      {/* Top row: Close — Rating — Position — Share */}
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <button onClick={(e) => { e.stopPropagation(); handleClose(); }}
                            className="p-1.5 rounded-full bg-black/20 backdrop-blur-sm text-white/50 hover:text-white hover:bg-black/40 transition-colors"
                            aria-label="Close player card"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                          <motion.span
                            className="text-4xl md:text-5xl font-black text-white font-display leading-none drop-shadow-lg"
                            initial={{ scale: 2, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                          >
                            {rating}
                          </motion.span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl md:text-2xl font-black text-white font-display leading-none drop-shadow-lg">
                            {positionLabel[player.position]}
                          </span>
                          <button onClick={handleShare}
                            className={cn("p-1.5 rounded-full backdrop-blur-sm transition-colors",
                              shareState === "copied" ? "bg-emerald-500/30 text-emerald-400" : "bg-black/20 text-white/50 hover:text-white hover:bg-black/40"
                            )}
                            aria-label={shareState === "copied" ? "Link copied" : "Share player"}
                          >
                            {shareState === "copied" ? <Check className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Player photo */}
                      <div className="relative my-1 flex-[3] min-h-0 shrink-0">
                        {player.photo ? (
                          <SmartPortraitImage
                            src={player.photo}
                            alt={`${player.firstName} ${player.lastName}`}
                            sizes="(max-width: 640px) 88vw, 360px"
                            className="object-cover rounded-xl"
                            mask="linear-gradient(to bottom, black 72%, transparent 100%)"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center rounded-xl bg-black/20">
                            <span className="text-6xl md:text-8xl font-bold text-white/20 font-display">{player.firstName?.charAt(0)}</span>
                          </div>
                        )}
                        {player.number && (
                          <div className="absolute bottom-0 right-2 pointer-events-none">
                            <span className="text-[80px] md:text-[120px] font-black text-white/[0.07] font-display leading-none select-none">{player.number}</span>
                          </div>
                        )}
                      </div>

                      {/* Bottom */}
                      <div className="space-y-1.5 shrink-0">
                        <div className="text-center">
                          <p className="text-[10px] text-white/60 font-mono uppercase tracking-widest mb-0.5">{player.nationality || ""}</p>
                          <h2 className="text-lg md:text-xl font-black text-white font-display leading-tight uppercase tracking-wide">{player.firstName}</h2>
                          <h2 className="text-xl md:text-2xl font-black text-white font-display leading-tight uppercase tracking-wide">{player.lastName}</h2>
                        </div>
                        <div className="grid grid-cols-6 gap-1">
                          {faceStats.map((stat) => (
                            <div key={stat.label} className="text-center">
                              <p className={cn("text-base md:text-xl font-black font-mono leading-none drop-shadow-md", getStatColor(stat.value))}>{stat.value}</p>
                              <p className="text-[8px] md:text-[9px] text-white/60 font-mono uppercase mt-0.5 font-bold tracking-wider">{stat.label}</p>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between text-[10px] md:text-[11px] text-white/50 font-mono border-t border-white/15 pt-2">
                          {player.height && <span className="flex items-center gap-1"><Ruler className="h-2.5 w-2.5" />{player.height}cm</span>}
                          {player.weight && <span className="flex items-center gap-1"><Weight className="h-2.5 w-2.5" />{player.weight}kg</span>}
                          {player.dateOfBirth && <span className="flex items-center gap-1"><Calendar className="h-2.5 w-2.5" />AGE {age}</span>}
                          {player.number && <span className="font-bold">#{player.number}</span>}
                        </div>
                      </div>                      <p className="text-[9px] text-white/30 font-mono text-center mt-1 shrink-0">TAP TO FLIP</p>
                      </div>
                  </div>

                  {/* ══════ BACK FACE ══════ */}
                  <div className={cn("absolute inset-0 rounded-3xl overflow-hidden border-2", rarity.border, "shadow-2xl")}
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a]" />
                    <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
                      style={{ backgroundImage: `repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(255,255,255,0.5) 10px, rgba(255,255,255,0.5) 11px)` }}
                    />

                    <div className="relative h-full flex flex-col p-3 md:p-5 z-10">
                      {/* Header row: identical layout to front face */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-1.5 md:gap-2 min-w-0 flex-1">
                          <button onClick={(e) => { e.stopPropagation(); handleClose(); }}
                            className="p-1.5 rounded-full bg-black/20 backdrop-blur-sm text-white/50 hover:text-white hover:bg-black/40 transition-colors shrink-0"
                            aria-label="Close player card"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                          <div className="min-w-0">
                            <p className="text-[9px] md:text-[10px] text-white/40 font-mono uppercase tracking-widest">Player Stats</p>
                            <h3 className="text-xs md:text-base font-bold text-white font-display truncate">{player.firstName} {player.lastName}</h3>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
                          <div className={cn(
                            "w-9 h-9 md:w-11 md:h-11 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg border border-white/20",
                            rating >= 85 ? "from-amber-400 to-yellow-500" : rating >= 75 ? "from-gray-300 to-gray-400" : "from-yellow-700 to-yellow-800"
                          )}>
                            <span className="text-sm md:text-lg font-black text-white font-display">{rating}</span>
                          </div>
                          <button onClick={handleShare}
                            className={cn("p-1.5 rounded-full backdrop-blur-sm transition-colors",
                              shareState === "copied" ? "bg-emerald-500/30 text-emerald-400" : "bg-black/20 text-white/50 hover:text-white hover:bg-black/40"
                            )}
                            aria-label={shareState === "copied" ? "Link copied" : "Share player"}
                          >
                            {shareState === "copied" ? <Check className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex-1 space-y-2 md:space-y-3">
                        <p className="text-[9px] text-white/30 font-mono uppercase tracking-widest">Career Statistics</p>
                        {[
                          { label: "Appearances", value: careerStats!.appearances, max: 40 },
                          { label: "Goals", value: careerStats!.goals, max: 30 },
                          { label: "Assists", value: careerStats!.assists, max: 20 },
                          { label: "Minutes", value: careerStats!.minutesPlayed || careerStats!.appearances * 90, max: 3600 },
                          ...(player.position === "GOALKEEPER" ? [{ label: "Clean Sheets", value: careerStats!.cleanSheets, max: 20 }] : []),
                        ].map((stat, i) => {
                          const pct = Math.min((stat.value / stat.max) * 100, 100);
                          return (
                            <div key={stat.label}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] text-white/50 font-mono uppercase">{stat.label}</span>
                                <span className="text-sm font-bold text-white font-mono tabular-nums">{stat.value}</span>
                              </div>
                              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <motion.div className="h-full rounded-full bg-gradient-to-r from-club-accent to-amber-400"
                                  initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                                  transition={{ delay: 0.4 + i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                />
                              </div>
                            </div>
                          );
                        })}
                        {(careerStats!.yellowCards > 0 || careerStats!.redCards > 0) && (
                          <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                            <span className="text-[9px] text-white/30 font-mono uppercase">Cards</span>
                            <div className="flex gap-1.5 items-center">
                              {careerStats!.yellowCards > 0 && <><span className="w-3 h-4 rounded-sm bg-yellow-400" /><span className="text-xs text-white/50 font-mono">{careerStats!.yellowCards}</span></>}
                              {careerStats!.redCards > 0 && <><span className="w-3 h-4 rounded-sm bg-red-500" /><span className="text-xs text-white/50 font-mono">{careerStats!.redCards}</span></>}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-1.5 md:gap-2 flex-wrap pt-2 md:pt-3 border-t border-white/5">
                        {player.nationality && <span className="flex items-center gap-1 text-[9px] md:text-[10px] text-white/40 bg-white/5 rounded-full px-1.5 md:px-2 py-0.5"><MapPin className="h-2 w-2 md:h-2.5 md:w-2.5" /> {player.nationality}</span>}
                        {player.dateOfBirth && <span className="flex items-center gap-1 text-[9px] md:text-[10px] text-white/40 bg-white/5 rounded-full px-1.5 md:px-2 py-0.5"><Calendar className="h-2 w-2 md:h-2.5 md:w-2.5" /> Age {age}</span>}
                        {player.height && <span className="flex items-center gap-1 text-[9px] md:text-[10px] text-white/40 bg-white/5 rounded-full px-1.5 md:px-2 py-0.5"><Ruler className="h-2 w-2 md:h-2.5 md:w-2.5" /> {player.height}cm</span>}
                        {player.weight && <span className="flex items-center gap-1 text-[9px] md:text-[10px] text-white/40 bg-white/5 rounded-full px-1.5 md:px-2 py-0.5"><Weight className="h-2 w-2 md:h-2.5 md:w-2.5" /> {player.weight}kg</span>}
                      </div>                      <p className="text-[9px] text-white/30 font-mono text-center mt-1 md:mt-2 shrink-0">TAP TO FLIP</p>
                      </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
