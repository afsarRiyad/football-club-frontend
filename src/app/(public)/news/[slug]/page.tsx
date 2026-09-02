"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Calendar, Eye, ArrowLeft, Tag } from "lucide-react";
import api from "@/lib/api";
import { News } from "@/types";
import { Badge, PageSpinner } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export default function NewsDetailPage() {
  const params = useParams();
  const [article, setArticle] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticle();
  }, [params.slug]);

  const fetchArticle = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/news/${params.slug}`);
      setArticle(data.data);
    } catch (error) {
      console.error("Failed to fetch article:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageSpinner />;

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-2xl font-bold text-floodlight font-display">
          Article not found
        </h1>
        <Link
          href="/news"
          className="text-pitch-accent hover:underline mt-4 block"
        >
          Back to news
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        href="/news"
        className="inline-flex items-center gap-1.5 text-mist hover:text-floodlight text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to news
      </Link>

      <article>
        {article.cover && (
          <img
            src={article.cover}
            alt={article.title}
            className="w-full h-64 md:h-96 object-cover rounded-xl mb-6 border border-line"
          />
        )}

        <div className="flex items-center gap-4 mb-4">
          {article.category && (
            <Badge variant="info">{article.category}</Badge>
          )}
          <div className="flex items-center gap-4 text-sm text-mist">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span className="font-mono text-xs">
                {formatDate(article.createdAt)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Eye className="h-4 w-4" />
              <span className="font-mono text-xs">
                {article.viewCount} views
              </span>
            </div>
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-floodlight mb-4 font-display tracking-tight leading-tight">
          {article.title}
        </h1>

        {article.tags && article.tags.length > 0 && (
          <div className="flex items-center gap-2 mb-8">
            <Tag className="h-4 w-4 text-mist" />
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="text-sm text-mist bg-surface border border-line px-2.5 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="prose prose-lg max-w-none">
          <div className="whitespace-pre-wrap text-mist leading-relaxed text-[15px]">
            {article.content}
          </div>
        </div>

        {article.author && (
          <div className="mt-8 pt-6 border-t border-line">
            <p className="text-sm text-mist">
              Written by{" "}
              <span className="font-medium text-floodlight">
                {typeof article.author === "string"
                  ? "Unknown"
                  : article.author.name}
              </span>
            </p>
          </div>
        )}
      </article>
    </div>
  );
}
