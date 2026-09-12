"use client";

import React, { useState, useEffect, useRef } from "react";
import { Camera, Play, X, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import api from "@/lib/api";
import { Gallery } from "@/types";
import { PageSpinner, Pagination } from "@/components/ui";
import { cn, CLUB_TIME_ZONE } from "@/lib/utils";

const categories = ["All", "Match", "Training", "Event", "Team", "Other"];

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: CLUB_TIME_ZONE,
  });
}

/* Page 1 of the unfiltered list, fetched on the server (see src/app/(public)/gallery/page.tsx). */
export type GalleryInitialData = {
  galleries: Gallery[];
  totalPages: number;
};

export default function GalleryClient({ initialData }: { initialData: GalleryInitialData }) {
  /* If the server couldn't reach the API there is nothing rendered yet, so start
     in the loading state and fetch in the browser as before. */
  const serverHadNothing = initialData.galleries.length === 0;

  const [galleries, setGalleries] = useState<Gallery[]>(initialData.galleries);
  const [loading, setLoading] = useState(serverHadNothing);
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialData.totalPages);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxGallery, setLightboxGallery] = useState<Gallery | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      // The server already rendered page 1 with no category filter.
      if (!serverHadNothing) return;
    }
    fetchGalleries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, page]);

  const fetchGalleries = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 9 };
      if (category && category !== "All") params.category = category;
      const { data } = await api.get("/gallery", { params });
      setGalleries(data.data || []);
      setTotalPages(data.totalPages || 1);
    } catch (e) {
      console.error("Failed to fetch galleries:", e);
    } finally {
      setLoading(false);
    }
  };

  const openLightbox = (gallery: Gallery, index: number) => {
    setLightboxGallery(gallery);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setLightboxGallery(null);
  };

  const navigateLightbox = (direction: "prev" | "next") => {
    if (!lightboxGallery) return;
    const total = lightboxGallery.media.length;
    if (direction === "next") {
      setLightboxIndex((prev) => (prev + 1) % total);
    } else {
      setLightboxIndex((prev) => (prev - 1 + total) % total);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-floodlight font-display tracking-tight">
          Gallery
        </h1>
        <p className="text-mist mt-3 text-lg">
          Photos and videos from matches, training, and events.
        </p>
      </div>

      {/* Category filter */}
      <div className="flex gap-1 mb-10 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setCategory(cat === "All" ? "" : cat);
              setPage(1);
            }}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors",
              (category === "" && cat === "All") || category === cat
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
      ) : galleries.length === 0 ? (
        <div className="py-20 text-center">
          <Camera className="h-10 w-10 text-mist mx-auto mb-3" />
          <p className="font-mono text-mist">No galleries found</p>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {galleries.map((gallery) => (
              <div
                key={gallery._id}
                className="group bg-surface rounded-xl border border-line/60 overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                {/* Cover image or first media */}
                <div
                  className="relative aspect-video cursor-pointer overflow-hidden"
                  onClick={() => openLightbox(gallery, 0)}
                >
                  {gallery.coverImage ? (
                    <Image
                      src={gallery.coverImage}
                      alt={gallery.title}
                      fill
                      className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                    />
                  ) : gallery.media.length > 0 ? (
                    <Image
                      src={gallery.media[0].url}
                      alt={gallery.title}
                      fill
                      className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-surface-raised flex items-center justify-center">
                      <Camera className="h-10 w-10 text-line" />
                    </div>
                  )}

                  {/* Media count badge */}
                  {gallery.media.length > 1 && (
                    <div className="absolute top-3 right-3 bg-pitch-night/70 backdrop-blur-sm text-white text-xs font-mono px-2 py-1 rounded-lg">
                      {gallery.media.length} items
                    </div>
                  )}

                  {/* Category badge */}
                  {gallery.category && (
                    <div className="absolute bottom-3 left-3">
                      <span className="text-[10px] font-mono text-white bg-pitch-night/60 backdrop-blur-sm px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {gallery.category}
                      </span>
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-pitch-night/0 group-hover:bg-pitch-night/20 transition-colors duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white/90 rounded-full p-3">
                        <Camera className="h-5 w-5 text-pitch-night" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-floodlight group-hover:text-pitch-accent transition-colors line-clamp-1">
                    {gallery.title}
                  </h3>
                  {gallery.description && (
                    <p className="text-sm text-mist mt-1 line-clamp-2">
                      {gallery.description}
                    </p>
                  )}
                  <p className="text-xs text-mist mt-2 font-mono">
                    {formatDate(gallery.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            className="mt-10"
          />
        </>
      )}

      {/* Lightbox */}
      {lightboxOpen && lightboxGallery && (
        <div className="fixed inset-0 z-50 bg-pitch-night/95 flex items-center justify-center">
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white/70 hover:text-white z-10 p-2"
            aria-label="Close lightbox"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Navigation */}
          {lightboxGallery.media.length > 1 && (
            <>
              <button
                onClick={() => navigateLightbox("prev")}
                className="absolute left-4 text-white/70 hover:text-white z-10 p-2 bg-pitch-night/50 rounded-full"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={() => navigateLightbox("next")}
                className="absolute right-4 text-white/70 hover:text-white z-10 p-2 bg-pitch-night/50 rounded-full"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Media */}
          <div className="max-w-4xl max-h-[80vh] px-16">
            {lightboxGallery.media[lightboxIndex]?.type === "VIDEO" ? (
              <video
                src={lightboxGallery.media[lightboxIndex].url}
                controls
                className="max-w-full max-h-[80vh] mx-auto rounded-lg"
              />
            ) : (
              <Image
                src={lightboxGallery.media[lightboxIndex]?.url}
                alt={lightboxGallery.title}
                width={1600}
                height={1000}
                className="max-w-full max-h-[80vh] mx-auto rounded-lg object-contain w-auto h-auto"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 90vw, 80vw"
              />
            )}
          </div>

          {/* Caption & counter */}
          <div className="absolute bottom-6 left-0 right-0 text-center">
            {lightboxGallery.media[lightboxIndex]?.caption && (
              <p className="text-white/80 text-sm mb-2">
                {lightboxGallery.media[lightboxIndex].caption}
              </p>
            )}
            <p className="text-white/50 text-xs font-mono">
              {lightboxIndex + 1} / {lightboxGallery.media.length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
