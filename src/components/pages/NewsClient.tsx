"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { News } from "@/types";
import Image from "next/image";
import { PageSpinner, Pagination } from "@/components/ui";
import { cn, CLUB_TIME_ZONE } from "@/lib/utils";

const categories = ["Transfer", "Match Report", "Interview", "Analysis", "Club News"];

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: CLUB_TIME_ZONE,
  });
}

/* Page 1 of the unfiltered list, fetched on the server (see src/app/(public)/news/page.tsx). */
export type NewsInitialData = {
  articles: News[];
  totalPages: number;
  /** The article the editor marked Featured — the big hero slot. Published only. */
  featured: News | null;
};

export default function NewsClient({ initialData }: { initialData: NewsInitialData }) {
  /* If the server couldn't reach the API there is nothing rendered yet, so start
     in the loading state and fetch in the browser as before. */
  const serverHadNothing = initialData.articles.length === 0;

  const [articles, setArticles] = useState<News[]>(initialData.articles);
  const [featured, setFeatured] = useState<News | null>(initialData.featured);
  const [loading, setLoading] = useState(serverHadNothing);
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialData.totalPages);

  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      // The server already rendered page 1 with no category filter.
      if (!serverHadNothing) return;
    }
    fetchNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, page]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 9, sort: "-createdAt" };
      if (category) params.category = category;
      const { data } = await api.get("/news", { params });
      setArticles(data.data || []);
      setTotalPages(data.totalPages || 1);
    } catch (e) {
      console.error("Failed to fetch news:", e);
    } finally {
      setLoading(false);
    }
  };

  /* The hero slot holds the article marked Featured in the admin, and falls back
     to the newest story when nothing is featured. It is only used on the
     unfiltered first page: once the reader picks a category or pages forward they
     are browsing a result set, and promoting an article outside it would be
     confusing. */
  const onDefaultView = category === "" && page === 1;
  const hero: News | null = (onDefaultView ? featured : null) ?? articles[0] ?? null;
  const rest = articles.filter((article) => article._id !== hero?._id);

  /* The hero card is paired with the next three articles as a side column. Both
     the grid and the image box are laid out around that pairing, so with a
     single article the side column is empty and the pairing has to collapse to
     one column instead of leaving a dead half-row. */
  const hasSideColumn = rest.length > 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-floodlight font-display tracking-tight">
          News
        </h1>
      </div>

      {/* Category filter */}
      <div className="flex gap-1 mb-10 overflow-x-auto pb-2">
        <button
          onClick={() => { setCategory(""); setPage(1); }}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors",
            !category
              ? "bg-floodlight text-pitch-night"
              : "text-mist hover:text-floodlight hover:bg-surface-raised"
          )}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => { setCategory(cat); setPage(1); }}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors",
              category === cat
                ? "bg-floodlight text-pitch-night"
                : "text-mist hover:text-floodlight hover:bg-surface-raised"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <PageSpinner />
      ) : articles.length === 0 ? (
        <div className="py-20 text-center">
          <p className="font-mono text-mist">No articles found</p>
        </div>
      ) : (
        <>
          {/* Editorial layout — first article large, rest in grid */}
          <div className={cn("grid gap-4 mb-8", hasSideColumn && "md:grid-cols-2")}>
            {hero && (
              <Link
                href={`/news/${hero.slug}`}
                className={cn("group", hasSideColumn && "md:row-span-2")}
              >
                {/* This box only ever contains absolutely positioned children, so
                    it gets its height from CSS alone. `md:aspect-auto md:h-full`
                    measured 0px tall on desktop: with an empty side column the
                    grid row had no content to size it, so the cover image
                    disappeared. The aspect ratio therefore stays definite, and
                    `md:h-full` only stretches it once a side column exists to
                    give the row a height. */}
                <div
                  className={cn(
                    "relative bg-surface rounded-xl overflow-hidden aspect-[4/3]",
                    hasSideColumn
                      ? "md:h-full md:min-h-[360px]"
                      : "md:aspect-[16/9]"
                  )}
                >
                  {hero.cover ? (
                    <Image
                      src={hero.cover}
                      alt={hero.title}
                      fill
                      className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      /* Matches the real slot: full width when the featured card
                         spans the row, half of the 5xl container when the side
                         column is present. */
                      sizes={
                        hasSideColumn
                          ? "(max-width: 767px) 100vw, (max-width: 1024px) 50vw, 512px"
                          : "(max-width: 1024px) 100vw, 1024px"
                      }
                    />
                  ) : (
                    <div className="w-full h-full bg-surface-raised flex items-center justify-center">
                      <span className="text-5xl font-bold text-line font-display">
                        {hero.title.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-pitch-night via-pitch-night/60 to-transparent p-6">
                    {hero.category && (
                      <span className="text-xs font-mono text-pitch-accent mb-2 block">
                        {hero.category}
                      </span>
                    )}
                    <h2 className="text-xl md:text-2xl font-bold text-floodlight font-display leading-tight">
                      {hero.title}
                    </h2>
                    <p className="text-xs text-mist mt-2 font-mono">
                      {formatDate(hero.createdAt)}
                    </p>
                  </div>
                </div>
              </Link>
            )}

            <div className={cn("space-y-4", !hasSideColumn && "hidden")}>
              {rest.slice(0, 3).map((article) => (
                <Link
                  key={article._id}
                  href={`/news/${article.slug}`}
                  className="group flex gap-4 bg-surface rounded-xl p-4 hover:bg-surface-raised transition-colors"
                >
                  {article.cover && (
                    <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0">
                      <Image
                        src={article.cover}
                        alt={article.title}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="80px"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    {article.category && (
                      <span className="text-[10px] font-mono text-pitch-accent uppercase tracking-wider">
                        {article.category}
                      </span>
                    )}
                    <h3 className="text-sm font-medium text-floodlight mt-1 line-clamp-2 group-hover:text-pitch-accent transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-xs text-mist mt-1 font-mono">
                      {formatDate(article.createdAt)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Remaining articles — simple list */}            {rest.length > 3 && (
              <div className="space-y-px mt-8">
                {rest.slice(3).map((article) => (
                <Link
                  key={article._id}
                  href={`/news/${article.slug}`}
                  className="flex items-center gap-4 py-4 px-4 hover:bg-surface rounded-lg transition-colors group"
                >
                  {article.cover && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                      <Image
                        src={article.cover}
                        alt={article.title}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                        sizes="64px"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-floodlight truncate group-hover:text-pitch-accent transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-xs text-mist mt-0.5 font-mono">
                      {formatDate(article.createdAt)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            className="mt-10"
          />
        </>
      )}
    </div>
  );
}
