"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import {
  FiArrowRight,
  FiChevronRight,
  FiUsers,
  FiCalendar,
  FiMapPin,
  FiStar,
  FiFileText,
  FiShield,
  FiZap,
} from "react-icons/fi";
import { Trophy } from "lucide-react";
import api from "@/lib/api";
import { Match, News, Player, Club, Academy } from "@/types";
import { Navbar, Footer } from "@/components/layout";
import { Button } from "@/components/ui";
import InfinitePhotoMarquee from "@/components/shared/InfinitePhotoMarquee";
import { cn } from "@/lib/utils";

/* ─── Helpers ─── */
function getTeamName(team: any): string {
  if (typeof team === "string") return "TBD";
  return team?.name || "TBD";
}
function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/* ─── Animated counter ─── */
function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: false, margin: "-50px" });
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) { setCount(0); return; }
    let start = 0;
    const duration = 1200;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setCount(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target]);
  return <span ref={ref} className="font-mono tabular-nums">{count}{suffix}</span>;
}

/* ─── Reveal wrapper ─── */
function Reveal({ children, className, direction = "up" }: {
  children: React.ReactNode;
  className?: string;
  direction?: "up" | "left" | "right";
}) {
  const dirMap = { up: { y: 30, x: 0 }, left: { y: 0, x: -30 }, right: { y: 0, x: 30 } };
  const d = dirMap[direction];
  return (
    <motion.div
      initial={{ opacity: 0, x: d.x, y: d.y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: false, margin: "-60px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Stagger ─── */
function Stagger({ children, className, delay = 0 }: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, margin: "-50px" }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.07, delayChildren: delay } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const itemVariant = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

/* ─── Page ─── */
export default function HomePage() {
  const [club, setClub] = useState<Club | null>(null);
  const [news, setNews] = useState<News[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [academies, setAcademies] = useState<Academy[]>([]);
  const [loading, setLoading] = useState(true);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [clubsRes, newsRes, matchesRes, playersRes, academiesRes] = await Promise.allSettled([
        api.get("/clubs", { params: { limit: 1 } }),
        api.get("/news", { params: { limit: 5, sort: "-createdAt" } }),
        api.get("/matches", { params: { limit: 8, sort: "-matchDate" } }),
        api.get("/players", { params: { limit: 8 } }),
        api.get("/academy", { params: { limit: 6 } }),
      ]);
      if (clubsRes.status === "fulfilled" && clubsRes.value.data.data.length > 0)
        setClub(clubsRes.value.data.data[0]);
      if (newsRes.status === "fulfilled") setNews(newsRes.value.data.data || []);
      if (matchesRes.status === "fulfilled") setMatches(matchesRes.value.data.data || []);
      if (playersRes.status === "fulfilled") setPlayers(playersRes.value.data.data || []);
      if (academiesRes.status === "fulfilled") setAcademies(academiesRes.value.data.data || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const upcoming = matches.filter((m) => m.status === "SCHEDULED").slice(0, 4);
  const recent = matches.filter((m) => m.status === "FT" || m.status === "LIVE").slice(0, 4);

  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* ═══════════ HERO ═══════════ */}
        <section ref={heroRef} className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-pitch-night via-surface to-pitch-night" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]" />

          <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
            <div className="max-w-2xl">
              <motion.p initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="text-pitch-accent font-mono text-sm mb-5 tracking-wider uppercase">
                {club?.name || "Football Club"}
              </motion.p>
              <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-5xl md:text-7xl lg:text-8xl font-bold text-floodlight font-display tracking-tight leading-[0.95]">
                {club?.name ? (
                  <>Welcome to <span className="text-pitch-accent">{club.name.split(" ")[0]}</span></>
                ) : (
                  <>The Beautiful <span className="text-pitch-accent">Game</span></>
                )}
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="text-mist text-lg mt-6 max-w-lg leading-relaxed">
                Squad, fixtures, news — everything about the club, all in one place.
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }} className="flex gap-3 mt-8">
                <Link href="/squad">
                  <Button size="lg" className="group">
                    Meet the Squad
                    <FiArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/matches">
                  <Button size="lg" variant="outline">Fixtures</Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* ═══════════ NEXT MATCH ═══════════ */}
        {upcoming.length > 0 && (
          <section className="bg-surface border-y border-line">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Stagger className="flex items-center gap-6 py-5 overflow-x-auto">
                <span className="text-xs font-mono text-mist uppercase tracking-widest shrink-0">Next Up</span>
                <span className="h-4 w-px bg-line shrink-0" />
                {upcoming.slice(0, 3).map((m) => (
                  <motion.div key={m._id} variants={itemVariant}>
                    <Link href={`/matches/${m._id}`} className="font-card flex items-center gap-4 px-4 py-2 rounded-xl hover:bg-surface-raised transition-colors shrink-0">
                      <span className="text-xs text-mist font-mono">{formatDate(m.matchDate)}</span>
                      <span className="text-sm text-floodlight font-medium">{getTeamName(m.homeTeam)}</span>
                      <span className="text-sm font-mono font-bold text-pitch-accent">vs</span>
                      <span className="text-sm text-floodlight font-medium">{getTeamName(m.awayTeam)}</span>
                    </Link>
                  </motion.div>
                ))}
              </Stagger>
            </div>
          </section>
        )}

        {/* ═══════════ STATS ═══════════ */}
        <section className="border-b border-line/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
            <Stagger className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12" delay={0.1}>
              {[
                { icon: FiUsers, value: 25, suffix: "+", label: "Players" },
                { icon: FiCalendar, value: 30, suffix: "+", label: "Matches This Season" },
                { icon: Trophy, value: 12, suffix: "", label: "Trophies Won" },
                { icon: FiMapPin, value: 1, suffix: "", label: "Home Ground" },
              ].map((s) => (
                <motion.div key={s.label} variants={itemVariant} className="font-card text-center md:text-left">
                  <s.icon className="h-5 w-5 text-pitch-accent mb-3 mx-auto md:mx-0" />
                  <p className="text-3xl md:text-4xl font-bold text-floodlight">
                    <CountUp target={s.value} suffix={s.suffix} />
                  </p>
                  <p className="text-sm text-mist mt-1">{s.label}</p>
                </motion.div>
              ))}
            </Stagger>
          </div>
        </section>

        {/* ═══════════ PHOTO MARQUEE ═══════════ */}
        <InfinitePhotoMarquee />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* ═══════════ NEWS ═══════════ */}
          {news.length > 0 && (
            <section className="py-14 md:py-20">
              <Reveal>
                <div className="flex items-baseline justify-between mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-floodlight font-display">Latest</h2>
                  <Link href="/news" className="text-sm text-pitch-accent hover:underline flex items-center gap-1">
                    All news <FiChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </Reveal>

              <div className="grid md:grid-cols-2 gap-4">
                {news[0] && (
                  <Reveal direction="left">
                    <Link href={`/news/${news[0].slug}`} className="group block md:row-span-2">
                      <div className="font-card relative aspect-[4/3] md:aspect-auto md:h-full bg-surface rounded-2xl border border-line/60 overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_-8px_rgba(62,213,152,0.12)]">
                        {news[0].cover ? (
                          <img src={news[0].cover} alt={news[0].title} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full bg-surface-raised flex items-center justify-center">
                            <span className="text-4xl font-bold text-line font-display">{news[0].title.charAt(0)}</span>
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-pitch-night via-pitch-night/60 to-transparent p-6">
                          {news[0].category && <span className="text-xs font-mono text-pitch-accent mb-2 block">{news[0].category}</span>}
                          <h3 className="text-xl md:text-2xl font-bold text-floodlight font-display leading-tight">{news[0].title}</h3>
                          <p className="text-sm text-mist mt-2 font-mono">{formatDate(news[0].createdAt)}</p>
                        </div>
                      </div>
                    </Link>
                  </Reveal>
                )}

                <Stagger className="space-y-4" delay={0.15}>
                  {news.slice(1, 4).map((a) => (
                    <motion.div key={a._id} variants={itemVariant}>
                      <Link href={`/news/${a.slug}`} className="font-card group flex gap-4 bg-surface rounded-2xl border border-line/60 p-4 transition-all duration-300 hover:shadow-[0_8px_30px_-8px_rgba(62,213,152,0.12)]">
                        {a.cover && (
                          <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden shrink-0">
                            <img src={a.cover} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          {a.category && <span className="text-[10px] font-mono text-pitch-accent uppercase tracking-wider">{a.category}</span>}
                          <h3 className="text-sm md:text-base font-medium text-floodlight mt-1 line-clamp-2 group-hover:text-pitch-accent transition-colors">{a.title}</h3>
                          <p className="text-xs text-mist mt-1 font-mono">{formatDate(a.createdAt)}</p>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </Stagger>
              </div>
            </section>
          )}

          {/* ═══════════ RESULTS ═══════════ */}
          {recent.length > 0 && (
            <section className="py-14 md:py-20 border-t border-line/50">
              <Reveal>
                <div className="flex items-baseline justify-between mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-floodlight font-display">Results</h2>
                  <Link href="/matches" className="text-sm text-pitch-accent hover:underline flex items-center gap-1">
                    All matches <FiChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </Reveal>

              <Stagger className="space-y-px">
                {recent.map((m) => (
                  <motion.div key={m._id} variants={itemVariant}>
                    <Link href={`/matches/${m._id}`} className="font-card flex items-center justify-between py-4 px-4 hover:bg-surface rounded-xl transition-colors group">
                      <div className="flex items-center gap-6 flex-1">
                        <span className="text-xs text-mist font-mono w-16 shrink-0">{formatDate(m.matchDate)}</span>
                        <span className="text-sm text-floodlight group-hover:text-pitch-accent transition-colors">{getTeamName(m.homeTeam)}</span>
                      </div>
                      <span className="text-lg font-mono font-bold text-floodlight tabular-nums px-6">
                        {m.score.home}<span className="text-mist mx-1">–</span>{m.score.away}
                      </span>
                      <div className="flex items-center gap-6 flex-1 justify-end">
                        <span className="text-sm text-floodlight group-hover:text-pitch-accent transition-colors">{getTeamName(m.awayTeam)}</span>
                        <span className={cn("text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded", m.status === "LIVE" ? "text-alert-red bg-alert-red/10" : "text-mist")}>
                          {m.status === "FT" ? "FT" : m.status}
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </Stagger>
            </section>
          )}

          {/* ═══════════ SQUAD ═══════════ */}
          {players.length > 0 && (
            <section className="py-14 md:py-20 border-t border-line/50">
              <Reveal>
                <div className="flex items-baseline justify-between mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-floodlight font-display">Squad</h2>
                  <Link href="/squad" className="text-sm text-pitch-accent hover:underline flex items-center gap-1">
                    Full squad <FiChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </Reveal>

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, margin: "-50px" }}
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
                className="grid grid-cols-3 md:grid-cols-6 gap-3"
              >
                {players.slice(0, 6).map((p, i) => (
                  <motion.div key={p._id} variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } } }}>
                    <Link href={`/squad/${p._id}`}>
                      <div className={cn("font-card group aspect-[3/4] bg-surface rounded-2xl border border-line/60 overflow-hidden relative transition-all duration-300 hover:shadow-[0_8px_30px_-8px_rgba(62,213,152,0.12)]", i === 0 && "md:col-span-2 md:row-span-2")}>
                        {p.photo ? (
                          <img src={p.photo} alt={`${p.firstName} ${p.lastName}`} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-surface-raised">
                            <span className="text-4xl font-bold text-line font-display">{p.firstName?.charAt(0)}</span>
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-pitch-night/80 to-transparent p-3">
                          <p className={cn("font-medium text-floodlight truncate", i === 0 ? "text-lg" : "text-xs")}>
                            {p.firstName} {p.lastName}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </section>
          )}

          {/* ═══════════ WHY FOLLOW ═══════════ */}
          <section className="py-14 md:py-20 border-t border-line/50">
            <Reveal>
              <h2 className="text-2xl md:text-3xl font-bold text-floodlight font-display mb-10">Why Follow the Club?</h2>
            </Reveal>

            <div className="grid md:grid-cols-3 gap-4">
              {[
                { icon: FiFileText, title: "Stay Updated", text: "Get the latest news, match reports, and transfer updates as they happen." },
                { icon: FiZap, title: "Live Scores", text: "Real-time match updates with live scores, events, and minute-by-minute commentary." },
                { icon: FiShield, title: "Behind the Scenes", text: "Exclusive content from training sessions, press conferences, and player interviews." },
              ].map((f, i) => (
                <Reveal key={f.title} direction={i === 0 ? "left" : i === 2 ? "right" : "up"}>
                  <div className="font-card bg-surface rounded-2xl border border-line/60 p-8 transition-all duration-300 hover:shadow-[0_8px_30px_-8px_rgba(62,213,152,0.12)] h-full">
                    <f.icon className="h-6 w-6 text-pitch-accent mb-4" />
                    <h3 className="text-lg font-bold text-floodlight font-display mb-2">{f.title}</h3>
                    <p className="text-mist text-sm leading-relaxed">{f.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>

          {/* ═══════════ ACADEMY ═══════════ */}
          <section className="py-14 md:py-20 border-t border-line/50">
            <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
              <Reveal direction="left">
                <span className="text-xs font-mono text-pitch-accent uppercase tracking-widest mb-3 block">Youth Development</span>
                <h2 className="text-2xl md:text-3xl font-bold text-floodlight font-display mb-4">The Academy</h2>
                <p className="text-mist leading-relaxed mb-6">
                  Our academy is the heartbeat of the club. We develop young talent from the grassroots up, providing professional coaching and a clear pathway to the first team.
                </p>
                <ul className="space-y-2 mb-6">
                  {["Professional coaching staff", "Ages 8–18 welcome", "Pathway to first team"].map((t) => (
                    <li key={t} className="flex items-center gap-2 text-sm text-mist">
                      <span className="h-1 w-1 rounded-full bg-pitch-accent shrink-0" />
                      {t}
                    </li>
                  ))}
                </ul>
                <Link href="/academy">
                  <Button variant="outline" className="group">
                    Learn More <FiArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </Reveal>

              <Reveal direction="right">
                <div className="font-card aspect-[4/3] bg-surface rounded-2xl border border-line/60 overflow-hidden animate-academy-photos">
                  {academies.length > 0 && academies[0].photo ? (
                    <div className="relative w-full h-full">
                      <img
                        src={academies[0].photo}
                        alt={academies[0].name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-pitch-night/60 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <p className="text-sm font-bold text-white">{academies[0].name}</p>
                        <p className="text-xs text-white/60 font-mono">{academies[0].ageGroup}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-surface-raised to-surface flex items-center justify-center">
                      <div className="text-center">
                        <FiStar className="h-10 w-10 text-pitch-accent mx-auto mb-3" />
                        <p className="text-mist text-sm">Academy Photos</p>
                      </div>
                    </div>
                  )}
                </div>
              </Reveal>
            </div>
          </section>

          {/* ═══════════ ABOUT ═══════════ */}
          {club?.description && (
            <section className="py-14 md:py-20 border-t border-line/50">
              <Reveal>
                <span className="text-xs font-mono text-pitch-accent uppercase tracking-widest mb-3 block">Our Story</span>
                <h2 className="text-2xl md:text-3xl font-bold text-floodlight font-display mb-4">About {club.name}</h2>
                <p className="text-xl text-floodlight/80 leading-relaxed font-light mb-6 max-w-3xl">
                  {club.description.length > 200 ? club.description.slice(0, 200) + "…" : club.description}
                </p>
                <Link href="/about" className="text-sm text-pitch-accent hover:underline inline-flex items-center gap-1">
                  Read our full story <FiChevronRight className="h-3 w-3" />
                </Link>
              </Reveal>
            </section>
          )}
        </div>

        {/* ═══════════ CTA ═══════════ */}
        <section className="border-t border-line/50 mt-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
            <Reveal>
              <h2 className="text-3xl md:text-4xl font-bold text-floodlight font-display tracking-tight">Never Miss a Match</h2>
              <p className="text-mist mt-3 max-w-md mx-auto">
                Create an account to follow the club, get live score notifications, and access exclusive content.
              </p>
              <div className="flex justify-center gap-3 mt-8">
                <Link href="/register">
                  <Button size="lg" className="group">
                    Create Account <FiArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button size="lg" variant="outline">About the Club</Button>
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
