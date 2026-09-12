import {
  CLUB,
  CLUB_MAP_URL,
  CONTACT,
  DEFAULT_KEYWORDS,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  metaDescription,
} from "./seo";

/* ────────────────────────────────────────────────────────────────────
   schema.org structured data (JSON-LD)
   ────────────────────────────────────────────────────────────────────
   These graphs are what let Google render rich results: organisation
   knowledge panels, article cards, player/event details and breadcrumbs.
   ──────────────────────────────────────────────────────────────────── */

type Json = Record<string, any>;

const postalAddress = {
  "@type": "PostalAddress",
  streetAddress: CLUB.address,
  addressLocality: CLUB.city,
  addressRegion: CLUB.region,
  ...(CONTACT.postalCode ? { postalCode: CONTACT.postalCode } : {}),
  addressCountry: CLUB.countryCode,
};

const fullLocationName = [CLUB.address, CLUB.city, CLUB.region, CLUB.country].join(", ");

/** The club itself — powers the Google knowledge panel. */
export function sportsClubSchema(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "SportsClub",
    "@id": `${SITE_URL}/#club`,
    name: CLUB.name,
    legalName: CLUB.legalName,
    alternateName: "Nayadiganta SC",
    url: SITE_URL,
    logo: CLUB.logo,
    image: CLUB.logo,
    foundingDate: CLUB.founded,
    foundingLocation: { "@type": "Place", name: fullLocationName, address: postalAddress },
    sport: CLUB.sport,
    /* The phrases the club wants to be found for, attached to the entity. */
    keywords: DEFAULT_KEYWORDS.join(", "),
    address: postalAddress,
    location: { "@type": "Place", name: fullLocationName, address: postalAddress },
    hasMap: CLUB_MAP_URL,
    /* Local queries resolve through areaServed, so name the town and district
       as well as the country rather than only "Bangladesh". */
    areaServed: [
      { "@type": "City", name: CLUB.city },
      { "@type": "AdministrativeArea", name: CLUB.region },
      { "@type": "Country", name: CLUB.country },
    ],
    /* Everything below only appears once the real values are filled into
       CONTACT — nothing is invented. */
    ...(CONTACT.telephone ? { telephone: CONTACT.telephone } : {}),
    ...(CONTACT.email ? { email: CONTACT.email } : {}),
    ...(CONTACT.geo
      ? { geo: { "@type": "GeoCoordinates", latitude: CONTACT.geo.latitude, longitude: CONTACT.geo.longitude } }
      : {}),
    ...(CONTACT.openingHours.length > 0 ? { openingHours: CONTACT.openingHours } : {}),
    ...(CONTACT.telephone || CONTACT.email
      ? {
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "customer service",
            areaServed: CLUB.countryCode,
            availableLanguage: ["en", "bn"],
            ...(CONTACT.telephone ? { telephone: CONTACT.telephone } : {}),
            ...(CONTACT.email ? { email: CONTACT.email } : {}),
          },
        }
      : {}),
    ...(CLUB.socials.length > 0 ? { sameAs: CLUB.socials } : {}),
  };
}

/** The website entity — lets search engines show the site name in results. */
export function webSiteSchema(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    alternateName: "Nayadiganta SC",
    inLanguage: "en",
    publisher: { "@id": `${SITE_URL}/#club` },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** Generic list/landing page schema. */
export function collectionPageSchema({
  name,
  description,
  path,
}: {
  name: string;
  description: string;
  path: string;
}): Json {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: absoluteUrl(path),
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#club` },
    inLanguage: "en",
  };
}

export function newsArticleSchema(article: {
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  cover?: string;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  author?: { name?: string } | null;
  category?: string;
}): Json {
  const published = article.publishedAt || article.createdAt;
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: metaDescription(
      article.excerpt || article.content,
      article.title,
      200,
    ),
    url: absoluteUrl(`/news/${article.slug}`),
    ...(article.cover ? { image: [article.cover] } : {}),
    ...(published ? { datePublished: new Date(published).toISOString() } : {}),
    ...(article.updatedAt ? { dateModified: new Date(article.updatedAt).toISOString() } : {}),
    ...(article.category ? { articleSection: article.category } : {}),
    author: {
      "@type": article.author?.name ? "Person" : "Organization",
      name: article.author?.name || CLUB.name,
    },
    publisher: { "@id": `${SITE_URL}/#club` },
    isPartOf: { "@id": `${SITE_URL}/#website` },
    inLanguage: "en",
    mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(`/news/${article.slug}`) },
  };
}

export function personSchema(player: {
  _id: string;
  firstName: string;
  lastName: string;
  position?: string;
  number?: number;
  photo?: string;
  nationality?: string;
  dateOfBirth?: string;
  height?: number;
  weight?: number;
}): Json {
  const positionLabels: Record<string, string> = {
    GOALKEEPER: "Goalkeeper",
    DEFENDER: "Defender",
    MIDFIELDER: "Midfielder",
    FORWARD: "Forward",
  };
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: `${player.firstName} ${player.lastName}`.trim(),
    givenName: player.firstName,
    familyName: player.lastName,
    url: absoluteUrl(`/squad/${player._id}`),
    ...(player.photo ? { image: player.photo } : {}),
    ...(player.dateOfBirth ? { birthDate: new Date(player.dateOfBirth).toISOString().slice(0, 10) } : {}),
    ...(player.nationality ? { nationality: { "@type": "Country", name: player.nationality } } : {}),
    ...(player.position ? { jobTitle: positionLabels[player.position] || player.position } : {}),
    affiliation: { "@id": `${SITE_URL}/#club` },
    memberOf: { "@type": "SportsTeam", name: CLUB.name, sport: CLUB.sport },
  };
}

export function sportsEventSchema(match: {
  _id: string;
  matchDate?: string;
  venue?: { name?: string; address?: string };
  homeName: string;
  awayName: string;
  status?: string;
  score?: { home: number; away: number };
}): Json {
  const statusMap: Record<string, string> = {
    SCHEDULED: "https://schema.org/EventScheduled",
    LIVE: "https://schema.org/EventScheduled",
    HT: "https://schema.org/EventScheduled",
    FT: "https://schema.org/EventScheduled",
    POSTPONED: "https://schema.org/EventPostponed",
    CANCELLED: "https://schema.org/EventCancelled",
  };
  return {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: `${match.homeName} vs ${match.awayName}`,
    url: absoluteUrl(`/matches/${match._id}`),
    ...(match.matchDate ? { startDate: new Date(match.matchDate).toISOString() } : {}),
    eventStatus: statusMap[match.status || "SCHEDULED"] || statusMap.SCHEDULED,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    sport: CLUB.sport,
    competitor: [
      { "@type": "SportsTeam", name: match.homeName },
      { "@type": "SportsTeam", name: match.awayName },
    ],
    ...(match.venue?.name
      ? {
          location: {
            "@type": "Place",
            name: match.venue.name,
            ...(match.venue.address ? { address: match.venue.address } : {}),
          },
        }
      : { location: { "@type": "Place", name: "To be confirmed" } }),
    organizer: { "@id": `${SITE_URL}/#club` },
    ...(match.status === "FT" && match.score
      ? {
          description: `${match.homeName} ${match.score.home}–${match.score.away} ${match.awayName}`,
        }
      : {}),
  };
}
