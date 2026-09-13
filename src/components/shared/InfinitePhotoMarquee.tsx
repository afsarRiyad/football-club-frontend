"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import api from "@/lib/api";
import { Gallery } from "@/types";

// Fallback images shown while loading or if no gallery data exists.
// Every URL here must resolve — a dead one shows as a broken image and logs a
// failed /_next/image request in the console.
const FALLBACK_PHOTOS = [
  "https://images.unsplash.com/photo-1552667466-07770ae110d0?w=300",
  "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=300",
  "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=300",
  "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=300",
  "https://images.unsplash.com/photo-1614632537190-23e4146777db?w=300",
  "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=300",
];

/* Upper bound on distinct photos in the strip. Every entry is its own image
   download, so this is the knob that caps the section's byte weight. */
const MAX_PHOTOS = 10;

function MarqueeRow({
  images,
  direction = "left",
  speed = 30,
}: {
  images: string[];
  direction?: "left" | "right";
  speed?: number;
}) {
  // Duplicate for seamless loop
  const loopImages = [...images, ...images];

  return (
    <div className="overflow-hidden w-full mb-4 mask-x-fade">
      <motion.div
        className="flex gap-4 w-max"
        animate={{
          x: direction === "left" ? ["0%", "-50%"] : ["-50%", "0%"],
        }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {loopImages.map((src, i) => (
          <div
            key={i}
            className="relative flex-none w-[280px] h-[180px] rounded-xl overflow-hidden border border-line/60"
          >
            <Image
              src={src}
              alt={`Club photo ${(i % (loopImages.length / 2)) + 1}`}
              fill
              className="object-cover transition-transform duration-400 hover:scale-110"
              sizes="280px"
              /* These are 280x180 thumbnails scrolling past; the default q=75
                 spends roughly a third more bytes than the size needs. */
              quality={55}
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}

/** Pull the displayable URLs out of gallery documents, in order.
    Priority: media items first, then coverImage. */
function extractPhotos(galleries: Gallery[]): string[] {
  const urls: string[] = [];
  for (const gallery of galleries) {
    if (gallery.coverImage) urls.push(gallery.coverImage);
    for (const item of gallery.media) {
      if (item.type === "IMAGE" && item.url) urls.push(item.url);
    }
  }
  return urls;
}

export default function InfinitePhotoMarquee({ galleries = [] }: { galleries?: Gallery[] }) {
  /* Photos come from the server component that already fetched the page data.
     That keeps the gallery out of the browser's request path (and out of range
     of any origin/CORS setup on the API host) — previously this fired a
     client-side XHR on every visit, and a rejected one logged a console error. */
  const serverPhotos = extractPhotos(galleries);
  const hasServerPhotos = serverPhotos.length > 0;
  const [photos, setPhotos] = useState<string[]>(
    hasServerPhotos ? serverPhotos : FALLBACK_PHOTOS,
  );

  useEffect(() => {
    // Only reach for the API when the server had nothing to hand over.
    if (hasServerPhotos) return;

    const fetchGalleryPhotos = async () => {
      try {
        const { data } = await api.get("/gallery", {
          params: { limit: 20 },
        });

        const imageUrls = extractPhotos(data.data || []);

        // Only update if we got real images
        if (imageUrls.length > 0) {
          setPhotos(imageUrls);
        }
      } catch {
        // Silent fail — keep fallback images
      }
    };

    fetchGalleryPhotos();
  }, [hasServerPhotos]);

  /* Each unique photo is a separate optimised download, and the strip scrolls
     through all of them, so an unbounded list turned into hundreds of
     kilobytes of images on a phone. Ten covers both rows with room to scroll
     without repeating on screen at the same time. */
  const visible = photos.slice(0, MAX_PHOTOS);

  // Split photos into two rows for the marquee effect
  const midpoint = Math.ceil(visible.length / 2);
  const row1 = visible.slice(0, midpoint);
  const row2 = visible.slice(midpoint);

  // If row2 is too short, redistribute for better visual balance
  const minPerRow = 3;
  const row1Final = row1.length < minPerRow ? visible : row1;
  const row2Final = row2.length < minPerRow ? visible : row2;

  return (
    <section className="bg-background py-14 md:py-20 overflow-hidden">
      <h2 className="text-2xl md:text-3xl font-bold text-floodlight font-display text-center mb-8">
        Club Gallery
      </h2>

      <MarqueeRow images={row1Final} direction="left" speed={35} />
      <MarqueeRow images={row2Final} direction="right" speed={40} />
    </section>
  );
}
