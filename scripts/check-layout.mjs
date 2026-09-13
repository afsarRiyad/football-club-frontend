#!/usr/bin/env node
/**
 * Layout collapse check.
 *
 */
const PAGES = [
  {
    path: "/",
    label: "homepage",
    blocks: [
      { name: "hero news cover", selector: 'a[href^="/news/"] img', min: { w: 120, h: 120 } },
      { name: "fixture row", selector: 'a[href^="/matches/"]', min: { w: 200, h: 28 } },
      /* Tournament fixtures share the Next Up strip but link to the competition. */
      { name: "tournament fixture row", selector: 'a.font-card[href^="/competitions"]', min: { w: 200, h: 24 } },
      { name: "squad grid card", selector: 'a[href^="/squad/"]', min: { w: 60, h: 60 } },
    ],
  },
  {
    path: "/news",
    label: "news",
    blocks: [
      { name: "hero card", selector: 'a[href^="/news/"] > div', min: { w: 200, h: 150 } },
      { name: "hero cover image", selector: 'a[href^="/news/"] img', min: { w: 200, h: 150 } },
    ],
  },
  {
    path: "/matches",
    label: "matches",
    blocks: [
      { name: "match card", selector: 'a[href^="/matches/"]', min: { w: 200, h: 60 } },
      { name: "tournament fixture row", selector: 'a.block[href="/competitions"]', min: { w: 200, h: 60 } },
    ],
  },
  {
    path: "/squad",
    label: "squad",
    blocks: [{ name: "formation pitch", selector: 'div[class*="aspect-[68/105]"]', min: { w: 240, h: 300 } }],
  },
];

/* Two tiers, because "small" and "collapsed" are different problems. */
const IMAGE_FLOOR = 8; // below this it is invisible → failure
const IMAGE_SMALL = 32; // worth a human glance → warning only

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1366, height: 768 },
];

const SETTLE_SAMPLES = 3; // consecutive identical measurements required
const SETTLE_INTERVAL_MS = 250;
const SETTLE_MAX_MS = 6000;

/* Browser plumbing (Devtools client, launch, cleanup) lives in scripts/lib/cdp.mjs,
   shared with check-perf.mjs. */

/* ───────────────────────────── measurement ───────────────────────────── */

/** Runs in the page. Reads geometry only — nothing is modified. */
const MEASURE = String.raw`((blocks) => {
  const visible = (el) => {
    if (typeof el.checkVisibility === "function") {
      return el.checkVisibility({ visibilityProperty: true, opacityProperty: false, contentVisibilityAuto: true });
    }
    return el.offsetParent !== null;
  };
  const rectOf = (el) => {
    const r = el.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height) };
  };

  const root = document.documentElement;

  return {
    viewport: { w: innerWidth, h: innerHeight },
    /* Horizontal overflow is reported, not failed: it is a real defect but a
       different one from collapse, and a club should decide when to block on it. */
    overflow: { client: root.clientWidth, scroll: root.scrollWidth },
    results: blocks.map((block) => {
      const matches = [...document.querySelectorAll(block.selector)].filter(visible);
      return {
        name: block.name,
        selector: block.selector,
        min: block.min,
        matched: matches.length,
        size: matches.length ? rectOf(matches[0]) : null,
      };
    }),
    images: [...document.images]
      .filter(visible)
      .map((img) => ({ src: (img.currentSrc || img.src || "").slice(-56), size: rectOf(img) })),
  };
})`;

/** Sizes only: a continuously scrolling marquee must not defeat the settle loop. */
const signatureOf = (measured) =>
  `${measured.results.map((r) => `${r.name}:${r.size ? `${r.size.w}x${r.size.h}` : "-"}`).join(",")}|images:${measured.images.length}`;

/* ──────────────────────────────── main ──────────────────────────────── */

const baseUrl = (process.argv[2] || process.env.LAYOUT_BASE_URL || "http://127.0.0.1:3000").replace(/\/+$/, "");

try {
  const res = await fetch(`${baseUrl}/`, { redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
} catch (error) {
  console.error(`✖ ${baseUrl} is not reachable (${error.message}).`);
  console.error("  Start the app first (npm run dev / npm start), or pass a URL:");
  console.error("    npm run check:layout -- https://www.nayadiganta.club");
  process.exit(1);
}

console.log(`\nLayout collapse check → ${baseUrl}`);
console.log(`Viewports: ${VIEWPORTS.map((v) => `${v.name} ${v.width}×${v.height}`).join(", ")}\n`);

let session;
const failures = [];
const warnings = [];
const skipped = [];

try {
  session = await launchSession();
  const { cdp, sessionId } = session;
  console.log(`Browser: ${session.browserPath}\n`);

  await cdp.send("Page.enable", {}, sessionId);
  await cdp.send("Runtime.enable", {}, sessionId);
  /* Judge the settled layout, not an entrance animation. */
  await cdp.send(
    "Emulation.setEmulatedMedia",
    { features: [{ name: "prefers-reduced-motion", value: "reduce" }] },
    sessionId,
  );

  for (const viewport of VIEWPORTS) {
    await cdp.send(
      "Emulation.setDeviceMetricsOverride",
      { width: viewport.width, height: viewport.height, deviceScaleFactor: 1, mobile: viewport.name === "mobile" },
      sessionId,
    );

    for (const page of PAGES) {
      const loaded = cdp.once("Page.loadEventFired", 25000);
      await cdp.send("Page.navigate", { url: `${baseUrl}${page.path}` }, sessionId);
      await loaded;

      const sample = async () => {
        const { result } = await cdp.send(
          "Runtime.evaluate",
          { expression: `${MEASURE}(${JSON.stringify(page.blocks)})`, returnByValue: true },
          sessionId,
        );
        return result.value;
      };

      let measured = await sample();
      let matching = 1;
      const deadline = Date.now() + SETTLE_MAX_MS;
      while (matching < SETTLE_SAMPLES && Date.now() < deadline) {
        await sleep(SETTLE_INTERVAL_MS);
        const next = await sample();
        matching = signatureOf(next) === signatureOf(measured) ? matching + 1 : 1;
        measured = next;
      }

      console.log(`── ${page.label} @ ${viewport.name} (${measured.viewport.w}×${measured.viewport.h})`);

      for (const block of measured.results) {
        if (!block.matched) {
          skipped.push(`${page.label}/${viewport.name}: ${block.name}`);
          console.log(`   · ${block.name.padEnd(19)} skipped (no such element)`);
          continue;
        }
        const { w, h } = block.size;
        const passes = w >= block.min.w && h >= block.min.h;
        console.log(
          `   ${passes ? "✓" : "✖"} ${block.name.padEnd(19)} ${String(w).padStart(5)}×${String(h).padStart(4)}px  (min ${block.min.w}×${block.min.h})`,
        );
        if (!passes) {
          failures.push(
            `${page.label} @ ${viewport.name}: "${block.name}" renders ${w}×${h}px, expected at least ${block.min.w}×${block.min.h}px  [${block.selector}]`,
          );
        }
      }

      const collapsed = measured.images.filter((img) => img.size.w < IMAGE_FLOOR || img.size.h < IMAGE_FLOOR);
      const tiny = measured.images.filter(
        (img) => !collapsed.includes(img) && (img.size.w < IMAGE_SMALL || img.size.h < IMAGE_SMALL),
      );

      if (collapsed.length > 0) {
        console.log(`   ✖ ${collapsed.length} image(s) effectively invisible (<${IMAGE_FLOOR}px)`);
        for (const img of collapsed) {
          console.log(`       ${img.size.w}×${img.size.h}  …${img.src}`);
          failures.push(
            `${page.label} @ ${viewport.name}: image renders ${img.size.w}×${img.size.h}px — its container has collapsed  (…${img.src})`,
          );
        }
      } else {
        console.log(`   ✓ all ${measured.images.length} visible image(s) at or above ${IMAGE_FLOOR}px`);
      }
      if (tiny.length > 0) {
        warnings.push(`${page.label} @ ${viewport.name}: ${tiny.length} image(s) under ${IMAGE_SMALL}px (possibly scaled art, worth a look)`);
        console.log(`   ! ${tiny.length} image(s) under ${IMAGE_SMALL}px (not a failure — scaled art is legitimate)`);
      }

      const overflowPx = measured.overflow.scroll - measured.overflow.client;
      if (overflowPx > 1) {
        warnings.push(
          `${page.label} @ ${viewport.name}: content is ${overflowPx}px wider than the viewport — the page scrolls sideways on a phone`,
        );
        console.log(`   ! horizontal overflow: content is ${overflowPx}px wider than the visible area`);
      }
      console.log("");
    }
  }
} catch (error) {
  failures.push(`check could not complete: ${error.message}`);
  console.error(`\n✖ ${error.message}`);
}

/* Cleanup must never swallow the verdict. */
await session?.close?.();

if (skipped.length > 0) console.log(`Skipped ${skipped.length} block(s) with no matching element (no data — not a failure).`);
if (warnings.length > 0) {
  console.log("\nWarnings:");
  for (const warning of warnings) console.log(`  ! ${warning}`);
}
console.log("─".repeat(64));

if (failures.length > 0) {
  console.error(`\n✖ ${failures.length} problem(s):\n`);
  for (const failure of failures) console.error(`  • ${failure}`);
  console.error("\nA block like this is laid out but invisible to the user — most often an image");
  console.error("box with no height of its own (aspect-auto + h-full against an empty grid row).\n");
  process.exit(1);
}

console.log("\n✓ Every measured block has visible size at mobile and desktop widths.\n");
