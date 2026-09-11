import type { MetadataRoute } from "next";
import { SITE_URL, serverFetch } from "@/lib/seo";

/* Regenerate the sitemap hourly instead of on every request. */
export const revalidate = 3600;

type ListResponse<T> = { data?: T[] };

type NewsItem = { slug?: string; _id?: string; updatedAt?: string; createdAt?: string };
type PlayerItem = { _id?: string; updatedAt?: string };
type MatchItem = { _id?: string; updatedAt?: string; matchDate?: string };

/** Public pages that always exist. */
const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/matches", priority: 0.9, changeFrequency: "daily" },
  { path: "/squad", priority: 0.9, changeFrequency: "weekly" },
  { path: "/news", priority: 0.8, changeFrequency: "daily" },
  { path: "/standings", priority: 0.8, changeFrequency: "daily" },
  { path: "/competitions", priority: 0.7, changeFrequency: "weekly" },
  { path: "/about", priority: 0.6, changeFrequency: "monthly" },
  { path: "/academy", priority: 0.6, changeFrequency: "monthly" },
  { path: "/gallery", priority: 0.5, changeFrequency: "weekly" },
  { path: "/request-match", priority: 0.5, changeFrequency: "monthly" },
];

const asDate = (value?: string): Date | undefined => {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path === "/" ? "" : route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  // Dynamic content — falls back to the static routes if the API is unreachable.
  const [news, players, matches] = await Promise.all([
    serverFetch<ListResponse<NewsItem>>("/news?limit=200&sort=-createdAt"),
    serverFetch<ListResponse<PlayerItem>>("/players?limit=300&sort=lastName"),
    serverFetch<ListResponse<MatchItem>>("/matches?limit=300&sort=-matchDate"),
  ]);

  for (const article of news?.data || []) {
    const slug = article.slug || article._id;
    if (!slug) continue;
    entries.push({
      url: `${SITE_URL}/news/${encodeURIComponent(slug)}`,
      lastModified: asDate(article.updatedAt) || asDate(article.createdAt) || now,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  for (const player of players?.data || []) {
    if (!player._id) continue;
    entries.push({
      url: `${SITE_URL}/squad/${player._id}`,
      lastModified: asDate(player.updatedAt) || now,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  for (const match of matches?.data || []) {
    if (!match._id) continue;
    entries.push({
      url: `${SITE_URL}/matches/${match._id}`,
      lastModified: asDate(match.updatedAt) || asDate(match.matchDate) || now,
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  // De-duplicate URLs while keeping the highest-priority occurrence first.
  const seen = new Set<string>();
  return entries.filter((entry) => {
    if (seen.has(entry.url)) return false;
    seen.add(entry.url);
    return true;
  });
}
