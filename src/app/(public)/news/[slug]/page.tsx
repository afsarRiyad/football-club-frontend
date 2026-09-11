import type { News } from "@/types";
import { serverFetch } from "@/lib/seo";
import NewsArticleClient from "@/components/pages/NewsArticleClient";

/* ────────────────────────────────────────────────────────────────────
   News article page — server component
   ────────────────────────────────────────────────────────────────────
   The article is fetched here so its headline and body are present in the
   initial HTML, which is what lets an article rank for its own title.

   The sibling layout already fetches the same URL for generateMetadata and
   JSON-LD; Next dedupes identical requests within a render, so this does not
   cause a second network call.
   ──────────────────────────────────────────────────────────────────── */

export const revalidate = 3600;

/* The API returns either { data: { article } } or { data: article }. */
type ArticlePayload = { article?: News } & Partial<News>;

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  /* serverFetch never throws — an unreachable API returns null and the client
     component falls back to fetching in the browser. */
  const json = await serverFetch<{ data?: ArticlePayload }>(
    `/news/${encodeURIComponent(slug)}`,
  );

  const data = json?.data;
  const article: News | null =
    data?.article ?? (data && data.title ? (data as News) : null);

  return <NewsArticleClient slug={slug} article={article} />;
}
