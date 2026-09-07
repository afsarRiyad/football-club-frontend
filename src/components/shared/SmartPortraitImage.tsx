"use client";

/**
 * SmartPortraitImage — a `next/image` that crops a player photo "professionally".
 *
 * Player photos are arbitrary phone shots: full-body, odd ratios, heads not
 * centered, extra headroom above. A plain `object-cover object-top` crop either
 * cuts the subject's face off or hides most of the body, which is why the card
 * used to get stretched taller and taller to "fit" the photo.
 *
 * This component runs a tiny on-device skin-tone scan on a downscaled canvas to
 * estimate where the subject actually is, then computes an `object-position`
 * that keeps their head inside the crop with the body flowing below it — no
 * external face-detection API, no backend change, works in both themes.
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

export interface Point {
  x: number; // 0..1 across the source image
  y: number; // 0..1 down the source image
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

/**
 * Locate the subject by finding the densest skin-tone cluster in the upper part
 * of the photo (the head / upper body), so legs or skin-toned backgrounds in the
 * lower half can't win. Returns normalized coordinates, or null if there isn't
 * enough skin to be confident (then the caller falls back to a top-center crop).
 */
function findFaceCenter(img: HTMLImageElement): Point | null {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return null;

  const W = 96;
  const H = Math.max(1, Math.round((ih / iw) * W));
  if (W * H > 400000) return null; // safety — never scan huge buffers

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  let data: Uint8ClampedArray;
  try {
    ctx.drawImage(img, 0, 0, W, H);
    data = ctx.getImageData(0, 0, W, H).data;
  } catch {
    // Cross-origin / tainted canvas — cannot read pixels.
    return null;
  }

  // Grid of skin-density cells (coarse enough to be fast, fine enough to locate a head).
  const cols = 10;
  const rows = 12;
  const cellW = W / cols;
  const cellH = H / rows;
  const grid: number[][] = Array.from({ length: rows }, () => new Array(cols).fill(0));

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const mx = Math.max(r, g, b);
      const mn = Math.min(r, g, b);
      // Broad skin heuristic: warm, moderately lit, not pure red, not washed out.
      const warm =
        r > 60 && g > 30 && b > 20 &&
        r >= g && g >= b &&
        r - b > 10 &&
        mx - mn > 12 &&
        (r + g + b) / 3 < 235;
      if (warm) {
        grid[Math.min(rows - 1, Math.floor(y / cellH))][Math.min(cols - 1, Math.floor(x / cellW))]++;
      }
    }
  }

  const headZone = Math.floor(rows * 0.42); // prefer skin in the head/shoulders zone
  let best = 0;
  let bestRow = -1;
  let bestCol = -1;
  for (let gy = 0; gy < rows; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      const weight = gy <= headZone ? 1.6 : 0.6;
      const score = grid[gy][gx] * weight;
      if (score > best) {
        best = score;
        bestRow = gy;
        bestCol = gx;
      }
    }
  }

  // Not enough skin anywhere — probably a distant shot or covered subject.
  if (bestRow < 0 || best < Math.max(8, (W * H) / 900)) return null;

  // Weighted centroid around the winning cell (smooths the estimate).
  let wx = 0;
  let wy = 0;
  let total = 0;
  for (let gy = Math.max(0, bestRow - 1); gy <= Math.min(rows - 1, bestRow + 1); gy++) {
    for (let gx = Math.max(0, bestCol - 1); gx <= Math.min(cols - 1, bestCol + 1); gx++) {
      const c = grid[gy][gx];
      if (!c) continue;
      wx += ((gx + 0.5) * cellW) * c;
      wy += ((gy + 0.5) * cellH) * c;
      total += c;
    }
  }
  if (!total) return null;

  return {
    x: clamp(wx / total / W, 0.02, 0.98),
    y: clamp(wy / total / H, 0.02, 0.92),
  };
}

/**
 * Convert a subject anchor + measured container into CSS `object-position`
 * percentages. We keep the natural `object-cover` scale but shift the visible
 * window so the subject's head sits ~20% below the top of the crop with as much
 * of their body flowing underneath as the container allows.
 */
function computeObjectPosition(
  anchor: Point,
  imgW: number,
  imgH: number,
  boxW: number,
  boxH: number
): string {
  const scale = Math.max(boxW / imgW, boxH / imgH);
  const viewW = clamp(boxW / (imgW * scale), 0, 1); // fraction of source visible horizontally
  const viewH = clamp(boxH / (imgH * scale), 0, 1); // fraction of source visible vertically

  const windowX0 = clamp(anchor.x - viewW / 2, 0, 1 - viewW);
  // Face at ~22% from the top of the visible area leaves room above and shows the body below.
  let windowY0 = clamp(anchor.y - viewH * 0.22, 0, 1 - viewH);
  if (viewH >= 0.995) windowY0 = Math.min(windowY0, 0.02); // whole photo fits — keep it top aligned

  const px = viewW < 1 ? (windowX0 / (1 - viewW)) * 100 : 50;
  const py = viewH < 1 ? (windowY0 / (1 - viewH)) * 100 : 50;
  return `${px}% ${py}%`;
}

interface SmartPortraitImageProps {
  src: string;
  alt: string;
  /** next/image responsive sizes — important for `fill` images. */
  sizes: string;
  className?: string;
  quality?: number;
  priority?: boolean;
  /** Optional mask-image applied to the photo (e.g. fade into the card below). */
  mask?: string;
  /** Fallback anchor used before detection / when no face is found. */
  fallback?: Point;
}

export default function SmartPortraitImage({
  src,
  alt,
  sizes,
  className,
  quality,
  priority,
  mask,
  fallback = { x: 0.5, y: 0.1 },
}: SmartPortraitImageProps) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const anchorRef = useRef<Point>(fallback);
  const [objectPosition, setObjectPosition] = useState("50% 0%");

  const applyPosition = useCallback(() => {
    const img = imgRef.current;
    const box = img?.parentElement;
    if (!img || !box) return;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const boxW = box.clientWidth;
    const boxH = box.clientHeight;
    if (!iw || !ih || !boxW || !boxH) return;
    setObjectPosition(computeObjectPosition(anchorRef.current, iw, ih, boxW, boxH));
  }, []);

  // Recompute whenever the crop area resizes (orientation change, window resize).
  useEffect(() => {
    const img = imgRef.current;
    const box = img?.parentElement;
    if (!box) return;
    applyPosition();
    const ro = new ResizeObserver(applyPosition);
    ro.observe(box);
    return () => ro.disconnect();
  }, [applyPosition, src]);

  return (
    <Image
      ref={imgRef}
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      quality={quality}
      priority={priority}
      decoding="async"
      className={className}
      style={{
        objectPosition,
        maskImage: mask,
        WebkitMaskImage: mask,
      }}
      onLoad={(e) => {
        const el = e.currentTarget;
        // Give the layout a beat to settle (the card animates in), then detect once.
        requestAnimationFrame(() => {
          const found = findFaceCenter(el);
          if (found) anchorRef.current = found;
          applyPosition();
        });
      }}
    />
  );
}
