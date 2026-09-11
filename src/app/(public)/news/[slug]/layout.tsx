import type { Metadata } from "next";
import JsonLd from "@/components/seo/json-ld";
import { breadcrumbSchema, newsArticleSchema } from "@/lib/structured-data";
import { SITE_NAME, buildMetadata, metaDescription, serverFetch, truncate } from "@/lib/seo";

type RouteParams = { params: Promise<{ slug: string }> };

type Article = {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  cover?: string;
  category?: string;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  author?: { name?: string } | null;
};

type ResolvedArticle = Article & { title: string; slug: string };

/** Server-side article lookup (same endpoint the page uses). */
async function getArticle(slug: string): Promise<ResolvedArticle | null> {
  const json = await serverFetch<any>(`/news/${encodeURIComponent(slug)}`);
  const article = json?.data?.article ?? json?.data;
  if (!article?.title) return null;
  return { ...article, title: article.title, slug: article.slug || slug };
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return buildMetadata({
      title: "Article not found",
      description: `This article could not be found. Browse the latest news from ${SITE_NAME}.`,
      path: `/news/${slug}`,
      noindex: true,
    });
  }

  return buildMetadata({
    title: truncate(article.title, 60),
    description: metaDescription(
      article.excerpt || article.content,
      `${article.title} — news from ${SITE_NAME}.`,
    ),
    path: `/news/${article.slug}`,
    images: [article.cover],
    type: "article",
    publishedTime: article.publishedAt || article.createdAt,
    modifiedTime: article.updatedAt,
    authors: article.author?.name ? [article.author.name] : undefined,
    keywords: article.category ? [article.category, "Nayadiganta news"] : undefined,
  });
}

export default async function NewsArticleSeoLayout({
  children,
  params,
}: RouteParams & { children: React.ReactNode }) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) return <>{children}</>;

  const path = `/news/${article.slug}`;

  return (
    <>
      <JsonLd
        data={[
          newsArticleSchema(article),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "News", path: "/news" },
            { name: article.title || "Article", path },
          ]),
        ]}
      />
      {children}
    </>
  );
}
