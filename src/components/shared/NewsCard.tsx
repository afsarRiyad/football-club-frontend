"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { FiCalendar, FiEye } from "react-icons/fi";
import { News } from "@/types";
import { formatDate } from "@/lib/utils";

interface NewsCardProps {
  news: News;
  featured?: boolean;
}

export default function NewsCard({ news, featured = false }: NewsCardProps) {
  return (
    <Link href={`/news/${news.slug}`}>
      <article
        className={`font-card bg-surface rounded-2xl border border-line/60 overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_-8px_rgba(62,213,152,0.12)] hover:border-line cursor-pointer group ${
          featured ? "md:flex" : ""
        }`}
      >
        {news.cover && (
          <div className={`relative ${featured ? "md:w-1/2" : "aspect-video"} overflow-hidden`}>
            <Image
              src={news.cover}
              alt={news.title}
              fill
              className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
              sizes={featured ? "(max-width: 640px) 100vw, (max-width: 768px) 50vw, 50vw" : "(max-width: 640px) 100vw, (max-width: 768px) 75vw, 50vw"}
              loading="lazy"
            />
          </div>
        )}
        <div className={`p-5 ${featured ? "md:w-1/2 md:p-6" : ""}`}>
          {news.category && (
            <span className="text-[10px] font-medium text-pitch-accent bg-pitch-accent/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
              {news.category}
            </span>
          )}
          <h3
            className={`font-semibold text-floodlight mt-3 group-hover:text-pitch-accent transition-colors duration-200 ${
              featured ? "text-xl" : "text-base"
            } line-clamp-2`}
          >
            {news.title}
          </h3>
          {news.excerpt && (
            <p className="text-mist text-sm mt-2 line-clamp-2 leading-relaxed">
              {news.excerpt}
            </p>
          )}
          <div className="flex items-center gap-4 mt-4 text-xs text-mist">
            <div className="flex items-center gap-1.5">
              <FiCalendar className="h-3 w-3" />
              <span className="font-mono">{formatDate(news.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FiEye className="h-3 w-3" />
              <span className="font-mono">{news.viewCount}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
