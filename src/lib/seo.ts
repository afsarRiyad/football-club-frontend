import type { Metadata } from "next";

/*Site-wide SEO configuration */

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.nayadiganta.club"
).replace(/\/+$/, "");


/* Backend REST API (used for server-side metadata + sitemap generation). */
export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "https://football-club-997m.onrender.com/api"
).replace(/\/+$/, "");

/* ─── Club identity ─── */
export const SITE_NAME = "Nayadiganta Sporting Club";
export const SITE_SHORT_NAME = "Nayadiganta SC";
export const SITE_LOCALE = "en_US";
export const SITE_LANGUAGE = "en";

export const CLUB = {
  name: SITE_NAME,
  legalName: "Nayadiganta Sporting Club",
  founded: "2025",
  /** Street / area line. */
  address: "Bhuiyarhat Chowrasta",
  city: "Kabirhat",
  region: "Noakhali",
  country: "Bangladesh",
  countryCode: "BD",
  sport: "Association football",
  logo: "https://res.cloudinary.com/xjrgjslb/image/upload/v1788376645/fclub/1788376643695-77153592.jpg",
  /* Official profiles — . */
  socials: [
    "https://www.facebook.com/profile.php?id=61566985887930",
  ] as string[],
} as const;

/* ─── Location ───. */
export const CLUB_LOCALITY = `${CLUB.city}, ${CLUB.region}`;
export const CLUB_FULL_LOCATION = `${CLUB.address}, ${CLUB.city}, ${CLUB.region}, ${CLUB.country}`;

export const CLUB_MAP_URL = "https://maps.app.goo.gl/bXDaysez5Qw9thgPA";

/* ─── Contact details (NAP: name, address, phone) ─── */
export const CONTACT = {
  telephone: "",
  email: "",
  postalCode: "3800",
  geo: { latitude: 22.8584232, longitude: 91.227936 } as {
    latitude: number;
    longitude: number;
  } | null,
  openingHours: [] as string[],
};

/**
 * Map embed for the contact page. Uses the exact pin when we have coordinates,
 * otherwise falls back to the address, so it always points somewhere real.
 * `maps.google.com/maps?...&output=embed` needs no API key.
 */
export const CLUB_MAP_EMBED_URL = CONTACT.geo
  ? `https://maps.google.com/maps?q=${CONTACT.geo.latitude},${CONTACT.geo.longitude}&z=16&output=embed`
  : `https://maps.google.com/maps?q=${encodeURIComponent(CLUB_FULL_LOCATION)}&z=15&output=embed`;

/*SEO_METADATA — one object, every title, description and keyword.

     SEO_METADATA.titleTemplate        the single title template
     SEO_METADATA.targets.<key>        { title, description, keywords } for one
                                       page or one search intent */

export const SEO_METADATA = {
 
  titleTemplate: `%s | ${SITE_SHORT_NAME}`,

  targets: {

    home: {

      title: `${SITE_NAME} — Football, ${CLUB.city}, ${CLUB.region}`,
      description: `The official website of ${SITE_NAME} — a football club at ${CLUB.address}, ${CLUB.city}, ${CLUB.region}, Bangladesh. Squad, fixtures and results.`,
      /* The homepage is the one page that legitimately owns every phrasing,
         so its list is the longest. */
      keywords: [
        "Nayadiganta Sporting Club",
        "Nayadiganta Club",
        "Nayadiganta SC",
        "Nayadiganta football club",
        "Nayadiganta club Kabirhat Noakhali",
        "Nayadiganta club Kabirhat",
        "Nayadiganta club Noakhali",
        "Nayadiganta club Bhuiyarhat",
        "Nayadiganta Sporting Club Bhuiyarhat Chowrasta",
        "Nayadiganta club Kabirhat Bhuiyarhat",
        "Nayadiganta club near Bhuiyarhat Chowrasta",
        "Nayadiganta club noakhali bangladesh",
        "Kabirhat football club",
        "Bhuiyarhat football club",
        "Bhuiyarhat Chowrasta football club",
        "Noakhali football club",
        "football club in Noakhali Bangladesh",
        "club fixtures and results",
        "football squad profiles",
      ],
      absoluteTitle: true,
    },

    /* ── Brand-only queries: "nayadiganta club", "nayadiganta sporting club",
          "nayadiganta sc" — no location attached. ── */
    brand: {
      /* Already leads with the club name, so the suffix would only repeat it. */
      title: `${SITE_NAME} — Official Club Website`,
      description: `Founded in 2025 at ${CLUB.address}, ${SITE_NAME} is a football club in ${CLUB.city}, ${CLUB.region}, Bangladesh. Squad, fixtures and live scores.`,
      keywords: [
        "Nayadiganta Sporting Club",
        "Nayadiganta Club",
        "Nayadiganta SC",
        "Nayadiganta football club",
        "Nayadiganta Sporting Club official website",
        "Nayadiganta club official site",
        "Nayadiganta Sporting Club Bangladesh",
        "Nayadiganta club Kabirhat",
        "Nayadiganta club Noakhali",
        "Nayadiganta club Bhuiyarhat",
        "Nayadiganta Sporting Club Bhuiyarhat Chowrasta",
        "Bangladesh football club",
      ],
      absoluteTitle: true,
    },

    /* ── Town + district together: "nayadiganta club kabirhat noakhali". ── */
    locality: {
      /* Starts with the short brand, so no suffix either. */
      title: `${SITE_SHORT_NAME} — Football Club in ${CLUB_LOCALITY}`,
      description: `Football club in ${CLUB_LOCALITY}: ${SITE_NAME}, at ${CLUB.address}. Look up the squad, the fixture list, results and the league table.`,
      keywords: [
        "Nayadiganta club Kabirhat Noakhali",
        "Nayadiganta club Kabirhat",
        "Nayadiganta club Noakhali",
        "Nayadiganta club Bhuiyarhat",
        "Nayadiganta club Kabirhat Noakhali Bangladesh",
        "Nayadiganta club near Kabirhat",
        "Nayadiganta club near Bhuiyarhat Chowrasta",
        "football club in Noakhali Bangladesh",
        "Kabirhat football club",
        "Bhuiyarhat football club",
        "Noakhali football club",
      ],
      absoluteTitle: true,
    },

    /* ── Single-place: Kabirhat. ── */
    kabirhat: {
      /* 50 characters, and the club name is already in it. */
      title: `Nayadiganta Club Kabirhat — Football Team, ${CLUB.region}`,
      description: `The football club of ${CLUB.city}, ${CLUB.region}: ${SITE_NAME}, based at ${CLUB.address}. Match-day news, player profiles and youth teams.`,
      keywords: [
        "Nayadiganta club Kabirhat",
        "Nayadiganta club Kabirhat Noakhali",
        "Nayadiganta Sporting Club Kabirhat",
        "Kabirhat football club",
        "Kabirhat football team",
        "football club in Kabirhat",
        "football academy Kabirhat",
        "Kabirhat football ground",
      ],
      absoluteTitle: true,
    },

    /* ── Single-place: Noakhali district. ── */
    noakhali: {
      title: `Nayadiganta Club Noakhali — Football Club, Bangladesh`,
      description: `${SITE_NAME} represents ${CLUB.region} district in Bangladesh's local football, playing at ${CLUB.address} in ${CLUB.city}. See fixtures and results.`,
      keywords: [
        "Nayadiganta club Noakhali",
        "Nayadiganta club Noakhali Bangladesh",
        "Nayadiganta Sporting Club Noakhali",
        "Noakhali football club",
        "football club in Noakhali",
        "Noakhali district football",
        "football clubs in Noakhali Bangladesh",
        "Noakhali football league",
        "football academy Noakhali",
      ],
      absoluteTitle: true,
    },

    /* ── Single-place: Bhuiyarhat / the Chowrasta crossroads. ── */
    bhuiyarhat: {
      title: `Nayadiganta Club Bhuiyarhat — Football in ${CLUB.city}`,
      description: `Match days at ${CLUB.address}: ${SITE_NAME} trains and plays at the crossroads in ${CLUB.city}, ${CLUB.region}. Directions, fixtures and results.`,
      keywords: [
        "Nayadiganta club Bhuiyarhat",
        "Nayadiganta Bhuiyarhat Chowrasta",
        "Nayadiganta club near Bhuiyarhat Chowrasta",
        "Bhuiyarhat Chowrasta football",
        "Bhuiyarhat football club",
        "Bhuiyarhat Chowrasta football club",
        "football ground Bhuiyarhat",
        "Bhuiyarhat Chowrasta Kabirhat",
      ],
      absoluteTitle: true,
    },

    /* ── The ground itself: people searching for the pitch, not the club. ── */
    ground: {
      /* Names both the ground and the club, so no suffix. */
      title: `${CLUB.address} Football Ground — ${SITE_SHORT_NAME}`,
      description: `The pitch ${SITE_NAME} calls home: ${CLUB.address}, ${CLUB.city}, ${CLUB.region}. Find it on the map, get directions and check the fixture list.`,
      keywords: [
        "Bhuiyarhat Chowrasta football ground",
        "Nayadiganta club ground",
        "Nayadiganta Sporting Club home ground",
        "Kabirhat football ground",
        "football ground Noakhali",
        "Nayadiganta club directions",
        "football pitch Kabirhat",
      ],
      absoluteTitle: true,
    },

    /* ── Club / brand pages. ── */
    about: {
      /* Short enough that the " | Nayadiganta SC" suffix still fits. */
      title: `About the Club — ${CLUB_LOCALITY}`,
      description: `The history of ${SITE_NAME}: founded in 2025 at ${CLUB.address}, ${CLUB.city}, ${CLUB.region}, Bangladesh — our mission, values and home ground.`,
      keywords: [
        "About Nayadiganta Sporting Club",
        "Nayadiganta SC history",
        "Nayadiganta club Kabirhat",
        "Nayadiganta club Noakhali",
        "Nayadiganta club Bhuiyarhat",
        "Nayadiganta Sporting Club Bhuiyarhat Chowrasta",
        "Kabirhat football club",
        "Bhuiyarhat Chowrasta football club",
        "football club in Noakhali Bangladesh",
        "Bangladesh football club",
      ],
    },

    squad: {
      title: "Squad — Player Profiles & Statistics",
      description: `Meet the ${SITE_NAME} football squad in ${CLUB.city}, ${CLUB.region} — goalkeeper, defender, midfielder and forward profiles with stats and shirt numbers.`,
      keywords: [
        "Nayadiganta squad",
        "Nayadiganta Sporting Club players",
        "Nayadiganta club Kabirhat",
        "Nayadiganta football club",
        "football squad profiles",
        "player profiles",
      ],
    },

    matches: {
      title: "Fixtures, Results & Live Scores",
      description: `${SITE_NAME} fixtures and results in ${CLUB.city}, ${CLUB.region} — upcoming matches, live scores, kick-off times, venues and match reports.`,
      keywords: [
        "Nayadiganta fixtures",
        "Nayadiganta results",
        "Nayadiganta club match",
        "Nayadiganta Sporting Club",
        "Nayadiganta club Kabirhat",
        "club fixtures and results",
        "live football scores",
        "upcoming football matches",
      ],
    },

    news: {
      title: "Club News, Transfers & Match Reports",
      description: `The latest news from ${SITE_NAME} in ${CLUB.city}, ${CLUB.region} — transfers, match reports, player interviews and official club announcements.`,
      keywords: [
        "Nayadiganta news",
        "Nayadiganta Sporting Club news",
        "Nayadiganta club news",
        "Nayadiganta club Kabirhat",
        "Nayadiganta club Noakhali",
        "transfer news",
        "match reports",
      ],
    },

    gallery: {
      title: "Gallery — Match Day, Training & Club Photos",
      description: `Photo and video gallery of ${SITE_NAME}: match-day action, training and club events from ${CLUB.address}, ${CLUB.city}, ${CLUB.region}.`,
      keywords: [
        "Nayadiganta gallery",
        "Nayadiganta club photos",
        "Nayadiganta club Noakhali images",
        "Nayadiganta Sporting Club",
        "Bhuiyarhat Chowrasta",
        "football club photos",
        "match day photos",
      ],
    },

    academy: {
      title: "Youth Academy — Player Development",
      description: `The ${SITE_NAME} youth academy in ${CLUB.city}, ${CLUB.region}: age groups from U8 to U21, professional coaching and a pathway to the first team.`,
      keywords: [
        "Nayadiganta academy",
        "Nayadiganta club Kabirhat",
        "Nayadiganta club Noakhali",
        "football academy Kabirhat",
        "football academy Noakhali",
        "youth football Noakhali",
      ],
    },

    competitions: {
      title: "Competitions, Leagues & Tournaments",
      description: `The football competitions ${SITE_NAME} plays in — ${CLUB.city} and ${CLUB.region} leagues, cups and tournaments, plus fixtures and results.`,
      keywords: [
        "Nayadiganta competitions",
        "Nayadiganta club league",
        "Nayadiganta Sporting Club",
        "Kabirhat football league",
        "Noakhali football league",
        "football league Bangladesh",
        "football cup Noakhali",
        "football club tournaments",
      ],
    },

    standings: {
      title: "League Standings & Top Scorers",
      description: `League tables, points, goal difference and top scorers for ${SITE_NAME} in the ${CLUB.city} and ${CLUB.region} leagues — updated through the season.`,
      keywords: [
        "Nayadiganta standings",
        "Nayadiganta club league table",
        "Nayadiganta Sporting Club",
        "Noakhali football league table",
        "Kabirhat football league table",
        "football league table",
        "top scorers",
      ],
    },

    contact: {
      /* Leads with the ground's location, which is the part of this page that
         is uniquely ours — "contact a football club" is not winnable. */
      title: `Contact & Directions — ${CLUB.address}, ${CLUB.city}`,
      description: `How to reach ${SITE_NAME}: our address is ${CLUB_FULL_LOCATION}${
        CONTACT.telephone ? `, phone ${CONTACT.telephone}` : ""
      }. Directions to the ground and the academy.`,
      keywords: [
        "Nayadiganta Sporting Club contact",
        "Nayadiganta club address",
        "Nayadiganta club Kabirhat",
        "Nayadiganta club Noakhali",
        "Bhuiyarhat Chowrasta Kabirhat",
        "Kabirhat football ground",
        "Noakhali football club contact",
      ],
      absoluteTitle: true,
    },

    requestMatch: {
      title: "Request a Friendly Match",
      description: `Challenge ${SITE_NAME} to a friendly — a ${CLUB.city}, ${CLUB.region} club. Pick your date, venue and format, 5v5 to 11v11, and we will reply.`,
      keywords: [
        "request a football match",
        "challenge Nayadiganta club",
        "Nayadiganta club friendly match",
        "Nayadiganta club Kabirhat",
        "friendly match Noakhali",
      ],
    },

    /* ── Account screens. Never indexed, but each still needs a real title and
          description for browser tabs, shares and screen readers. ── */
    login: {
      title: "Sign In",
      description: `Sign in to your ${SITE_NAME} account to follow the club, get live score notifications and access member content.`,
      keywords: ["Nayadiganta club login", "Nayadiganta Sporting Club sign in"],
      noindex: true,
    },

    register: {
      title: "Create Account",
      description: `Create a free ${SITE_NAME} account to follow the club, save fixtures and receive live score notifications.`,
      keywords: ["Nayadiganta club register", "Nayadiganta Sporting Club account"],
      noindex: true,
    },

    forgotPassword: {
      title: "Forgot Password",
      description: `Reset your ${SITE_NAME} account password by email.`,
      keywords: ["Nayadiganta club password reset"],
      noindex: true,
    },

    resetPassword: {
      title: "Reset Password",
      description: `Choose a new password for your ${SITE_NAME} account.`,
      keywords: ["Nayadiganta club new password"],
      noindex: true,
    },
  },
} as const;

/** Key of one target inside SEO_METADATA.targets. */
export type SeoTargetKey = keyof typeof SEO_METADATA.targets;

/** One target, in the shared shape — every entry above is one of these. */
export type SeoTarget = {
  title: string;
  description: string;
  keywords: readonly string[];
  /** Keep the title as-is instead of appending the site suffix. */
  absoluteTitle?: boolean;
  /** Never let the page into the index. */
  noindex?: boolean;
};

/**
 * Read a target. Exists so the literal object above can stay `as const`
 * (for the exact key names) while callers — including the JSON-LD builders in
 * the page layouts — get the same shape for every entry.
 */
export function seoTarget(key: SeoTargetKey): SeoTarget {
  return SEO_METADATA.targets[key];
}

/* Absolute default social-share image (generated by src/app/opengraph-image.tsx). */
export const DEFAULT_OG_IMAGE = `${SITE_URL}/opengraph-image`;

export const absoluteUrl = (path = "/") =>
  `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

/* Every title/description/keyword now lives in the single SEO_METADATA object
   above — look there for the brand, locality (Kabirhat / Noakhali /
   Bhuiyarhat) and per-page targets. */

/* ─── Page metadata builder ─── */

/** Everything a page contributes that is not a title/description/keyword. */
type PageMetaBase = {
  /** Route path, e.g. "/squad" — also used as the canonical URL. */
  path: string;
  /** Extra phrases appended to the target's own keyword list. */
  keywords?: readonly string[];
  /** Absolute URLs of share images. Falls back to the generated OG card. */
  images?: (string | undefined | null)[];
  type?: "website" | "article" | "profile";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  /** Overrides the target's own setting for pages that must stay out of the
      index (e.g. a detail route whose record could not be found). */
  noindex?: boolean;
};

/**
 * A page either names one of the seoTargets — and then gets its title,
 * description and keywords from the object — or brings its own title and
 * description, which is what data-driven routes (a match, a player, an
 * article) have to do. Passing both is allowed on purpose: the explicit title
 * wins and the target still supplies the keywords.
 */
export type PageMeta = PageMetaBase &
  (
    | { target: SeoTargetKey; title?: string; description?: string }
    | { target?: undefined; title: string; description: string }
  );

/** Kept as an alias so existing imports keep compiling. */
export type PageMetaWithTarget = PageMeta;

export function buildMetadata(meta: PageMeta): Metadata {
  const target = meta.target ? seoTarget(meta.target) : undefined;

  /* The union type guarantees a title and description whenever no target is
     named, so the brand entry is only a belt-and-braces fallback. */
  const brand = seoTarget("brand");
  const title = meta.title ?? target?.title ?? brand.title;
  const description = meta.description ?? target?.description ?? brand.description;

  /* The target's phrases come first, then anything the page adds, with
     duplicates dropped so a page can re-add a phrase without it appearing
     twice in the tag. */
  const keywords = [...(target?.keywords ?? []), ...(meta.keywords ?? [])].filter(
    (keyword, index, all) => Boolean(keyword) && all.indexOf(keyword) === index,
  );

  const noindex = meta.noindex ?? target?.noindex ?? false;

  /* The site suffix is applied from SEO_METADATA.titleTemplate rather than by
     relying on the root layout's template: dynamically rendered routes do not
     inherit it, and an absolute title keeps static and dynamic pages identical.
     A target can opt out (the homepage already carries the club name). */
  const fullTitle = target?.absoluteTitle
    ? title
    : SEO_METADATA.titleTemplate.replace("%s", title);

  const images = (meta.images || []).filter((src): src is string => Boolean(src));
  // Always emit a share image: a child route's openGraph object replaces the
  // parent's entirely, so without an explicit fallback the generated OG card
  // from the root layout would be dropped on every nested page.
  const ogImages = images.length > 0 ? images : [DEFAULT_OG_IMAGE];

  return {
    title: { absolute: fullTitle },
    description,
    keywords,
    alternates: { canonical: meta.path },
    robots: noindex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type: meta.type ?? "website",
      url: meta.path,
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      title,
      description,
      images: ogImages,
      ...(meta.publishedTime ? { publishedTime: meta.publishedTime } : {}),
      ...(meta.modifiedTime ? { modifiedTime: meta.modifiedTime } : {}),
      ...(meta.authors && meta.authors.length > 0 ? { authors: meta.authors } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImages,
    },
  };
}

/*   Server-side data fetching (metadata, sitemap, structured data)
   Never throws: a cold or unreachable API degrades to the fallback so a
   build or a page render can always complete. */

/*  How long a server-rendered page may serve cached data.

    These pages are statically rendered (good for LCP and for crawlers), but the
    club publishes through the admin at unpredictable times. At the old 3600s
    window an article written at 16:27 was invisible on the live site until
    17:27 — which reads as "my content is not showing" rather than "cache".
    One minute keeps first paint just as fast (the cached HTML is still served
    instantly and regenerates in the background) while edits go live almost
    immediately.

    Keep this in sync with the `revalidate` literal exported by each page —
    Next reads that one statically and cannot resolve an imported constant. */
export const CONTENT_REVALIDATE = 60;

/*  Every server-side API fetch carries this tag so a single revalidateTag() can
    clear the data cache as well as the rendered pages. Timed revalidation alone
    would still hand back up to 60s-old JSON after an admin edit; see
    app/api/revalidate/route.ts. */
export const API_CACHE_TAG = "api-data";

export async function serverFetch<T = unknown>(
  path: string,
  revalidate = CONTENT_REVALIDATE,
): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      next: { revalidate, tags: [API_CACHE_TAG] },
      headers: { Accept: "application/json" },
      /* Generous timeout: serverFetch also runs at build time, where a cold
         API instance can take several seconds to wake. A short timeout here
         means pages get prerendered with empty content. */
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** Collapse whitespace + strip markdown/HTML noise, then clip to a meta-friendly length. */
export function metaDescription(raw: string | undefined | null, fallback: string, max = 160): string {
  if (!raw) return fallback;
  const clean = raw
    .replace(/<[^>]*>/g, " ")
    .replace(/[#*_>`~\[\]()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!clean) return fallback;
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}

export function truncate(raw: string | undefined | null, max = 70): string {
  if (!raw) return "";
  const clean = raw.replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`;
}
