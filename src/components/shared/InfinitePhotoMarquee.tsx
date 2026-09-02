"use client";

import { motion } from "framer-motion";

const photos = [
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
            className="flex-none w-[280px] h-[180px] rounded-xl overflow-hidden border border-line/60"
          >
            <img
              src={src}
              alt={`Club photo ${i + 1}`}
              className="w-full h-full object-cover transition-transform duration-400 hover:scale-110"
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default function InfinitePhotoMarquee() {
  return (
    <section className="bg-background py-14 md:py-20 overflow-hidden">
      <h2 className="text-2xl md:text-3xl font-bold text-floodlight font-display text-center mb-8">
        Club Gallery
      </h2>

      <MarqueeRow images={photos} direction="left" speed={35} />
      <MarqueeRow images={photos} direction="right" speed={40} />
    </section>
  );
}
