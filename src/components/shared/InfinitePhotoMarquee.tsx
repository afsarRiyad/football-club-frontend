"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import api from "@/lib/api";
import { Gallery } from "@/types";

// Fallback images shown while loading or if no gallery data exists
const FALLBACK_PHOTOS = [
  "https://images.unsplash.com/photo-1552667466-07770ae110d0?w=500",
  "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=500",
  "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500",
  "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500",
  "https://images.unsplash.com/photo-1614632537190-23e4146777db?w=500",
  "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=500",
];

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
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default function InfinitePhotoMarquee() {
  const [photos, setPhotos] = useState<string[]>(FALLBACK_PHOTOS);

  useEffect(() => {
    fetchGalleryPhotos();
  }, []);

  const fetchGalleryPhotos = async () => {
    try {
      const { data } = await api.get("/gallery", {
        params: { limit: 20 },
      });

      const galleries: Gallery[] = data.data || [];

      // Extract all image URLs from galleries
      // Priority: media items first, then coverImage
      const imageUrls: string[] = [];

      for (const gallery of galleries) {
        // Add cover image if it exists
        if (gallery.coverImage) {
          imageUrls.push(gallery.coverImage);
        }
        // Add all IMAGE media items
        for (const item of gallery.media) {
          if (item.type === "IMAGE" && item.url) {
            imageUrls.push(item.url);
          }
        }
      }

      // Only update if we got real images
      if (imageUrls.length > 0) {
        setPhotos(imageUrls);
      }
    } catch {
      // Silent fail — keep fallback images
    }
  };

  // Split photos into two rows for the marquee effect
  const midpoint = Math.ceil(photos.length / 2);
  const row1 = photos.slice(0, midpoint);
  const row2 = photos.slice(midpoint);

  // If row2 is too short, redistribute for better visual balance
  const minPerRow = 3;
  const row1Final = row1.length < minPerRow ? photos : row1;
  const row2Final = row2.length < minPerRow ? photos : row2;

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
