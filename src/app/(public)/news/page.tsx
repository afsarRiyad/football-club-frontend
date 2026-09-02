"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { News } from "@/types";
import { PageSpinner, Pagination } from "@/components/ui";
import { cn } from "@/lib/utils";

const categories = ["Transfer", "Match Report", "Interview", "Analysis", "Club News"];

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function NewsPage() {
  const [articles, setArticles] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchNews();
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
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {articles[0] && (
              <Link href={`/news/${articles[0].slug}`} className="group md:row-span-2">
                <div className="relative aspect-[4/3] md:aspect-auto md:h-full bg-surface rounded-xl overflow-hidden">
                  {articles[0].cover ? (
                    <img
                      src={articles[0].cover}
                      alt={articles[0].title}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-surface-raised flex items-center justify-center">
                      <span className="text-5xl font-bold text-line font-display">
                        {articles[0].title.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-pitch-night via-pitch-night/60 to-transparent p-6">
                    {articles[0].category && (
                      <span className="text-xs font-mono text-pitch-accent mb-2 block">
                        {articles[0].category}
                      </span>
                    )}
                    <h2 className="text-xl md:text-2xl font-bold text-floodlight font-display leading-tight">
                      {articles[0].title}
                    </h2>
                    <p className="text-xs text-mist mt-2 font-mono">
                      {formatDate(articles[0].createdAt)}
                    </p>
                  </div>
                </div>
              </Link>
            )}

            <div className="space-y-4">
              {articles.slice(1, 4).map((article) => (
                <Link
                  key={article._id}
                  href={`/news/${article.slug}`}
                  className="group flex gap-4 bg-surface rounded-xl p-4 hover:bg-surface-raised transition-colors"
                >
                  {article.cover && (
                    <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0">
                      <img
                        src={article.cover}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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

          {/* Remaining articles — simple list */}
          {articles.length > 4 && (
            <div className="space-y-px mt-8">
              {articles.slice(4).map((article) => (
                <Link
                  key={article._id}
                  href={`/news/${article.slug}`}
                  className="flex items-center gap-4 py-4 px-4 hover:bg-surface rounded-lg transition-colors group"
                >
                  {article.cover && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                      <img
                        src={article.cover}
                        alt={article.title}
                        className="w-full h-full object-cover"
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
