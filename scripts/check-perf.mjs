#!/usr/bin/env node
/**
 * Mobile performance check.
 *
 */

import { launchSession } from "./lib/cdp.mjs";

/* Lighthouse mobile cut-offs: [good, poor]. */
const BUDGETS = {
  fcp: [1800, 3000],
  lcp: [2500, 4000],
  tbt: [200, 600],
  cls: [0.1, 0.25],
  ttfb: [800, 1800],
};

const MOBILE = {
  width: 390,
  height: 844,
  deviceScaleFactor: 3,
  cpuThrottle: 4,
  // Lighthouse "Slow 4G" in bytes/second, plus its 150ms round-trip penalty.
  downloadBytesPerSecond: (1638 * 1024) / 8,
  uploadBytesPerSecond: (750 * 1024) / 8,
  latencyMs: 150,
};

const args = process.argv.slice(2);
const labelFlagIndex = args.indexOf("--dev");
const isDevRun = labelFlagIndex !== -1;
if (isDevRun) args.splice(labelFlagIndex, 1);
const baseUrl = (args[0] || process.env.PERF_BASE_URL || "http://127.0.0.1:3000").replace(/\/+$/, "");

/* Runs before any page script, so nothing is missed while the bundle is parsing. */
const COLLECTOR = `
window.__perf = { fcp: null, lcp: 0, cls: 0, longTasks: [], lcpElement: "", shifts: 0, lcpEntries: [] };
try {
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name === "first-contentful-paint") window.__perf.fcp = entry.startTime;
    }
  }).observe({ type: "paint", buffered: true });

  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.startTime > window.__perf.lcp) {
        window.__perf.lcp = entry.startTime;
        window.__perf.lcpElement = entry.element ? (entry.element.tagName + (entry.element.className ? "." + String(entry.element.className).split(" ")[0] : "")) : (entry.url || "");
      }
      window.__perf.lcpEntries.push(entry.startTime);
    }
  }).observe({ type: "largest-contentful-paint", buffered: true });

  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.hadRecentInput) continue;
      window.__perf.cls += entry.value;
      window.__perf.shifts += 1;
    }
  }).observe({ type: "layout-shift", buffered: true });

  let blocking = 0;
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      window.__perf.longTasks.push({ start: entry.startTime, duration: entry.duration });
      if (entry.duration > 50) blocking += entry.duration - 50;
    }
    window.__perf.blockingMs = blocking;
  }).observe({ type: "longtask", buffered: true });
} catch (error) {
  window.__perf.error = String(error);
}
`;

const formatMs = (value) => (value === null || value === undefined ? "n/a" : `${(value / 1000).toFixed(2)} s`);
const formatBytes = (bytes) => `${(bytes / 1024).toFixed(1)} KiB`;
const verdict = (key, value) => {
  if (value === null || value === undefined) return "?  unknown";
  const [good, poor] = BUDGETS[key];
  if (value <= good) return "✓ good";
  if (value <= poor) return "!  needs work";
  return "✖ poor";
};

try {
  const res = await fetch(`${baseUrl}/`, { redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
} catch (error) {
  console.error(`✖ ${baseUrl} is not reachable (${error.message}).`);
  console.error("  For a real number, run a production build:  npm run build && npm start");
  process.exit(1);
}

console.log(`\nMobile performance → ${baseUrl}`);
if (isDevRun) {
  console.log("MODE: development server — expect inflated numbers. For a real measurement run a production build.");
}
console.log(
  `Emulation: ${MOBILE.width}×${MOBILE.height} @${MOBILE.deviceScaleFactor}x, CPU ${MOBILE.cpuThrottle}x throttle, Slow 4G (${(MOBILE.downloadBytesPerSecond / 1024).toFixed(0)} KiB/s, ${MOBILE.latencyMs}ms RTT)\n`,
);

let session;
let failures = [];

try {
  session = await launchSession();
  const { cdp, sessionId } = session;

  await cdp.send("Page.enable", {}, sessionId);
  await cdp.send("Runtime.enable", {}, sessionId);
  await cdp.send("Network.enable", {}, sessionId);
  await cdp.send("Performance.enable", {}, sessionId);

  await cdp.send(
    "Emulation.setDeviceMetricsOverride",
    {
      width: MOBILE.width,
      height: MOBILE.height,
      deviceScaleFactor: MOBILE.deviceScaleFactor,
      mobile: true,
    },
    sessionId,
  );
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: MOBILE.cpuThrottle }, sessionId);
  await cdp.send(
    "Network.emulateNetworkConditions",
    {
      offline: false,
      latency: MOBILE.latencyMs,
      downloadThroughput: MOBILE.downloadBytesPerSecond,
      uploadThroughput: MOBILE.uploadBytesPerSecond,
    },
    sessionId,
  );
  await cdp.send("Page.addScriptToEvaluateOnNewDocument", { source: COLLECTOR }, sessionId);

  /*
   * Real wire bytes, from the network stack itself.
   *
   * The Resource Timing API's transferSize/encodedBodySize are NOT trustworthy
   * under a DevTools session: they came back equal to the DECODED size for every
   * asset, which would have reported this site as moving 2 MB when Vercel is
   * actually serving the 119 KiB stylesheet brotli-compressed at 17 KiB — a
   * sevenfold exaggeration that sends you optimising the wrong thing. The
   * Network domain reports encodedDataLength (bytes actually on the wire) and the
   * real response headers, so that is what gets reported now.
   */
  const wire = new Map(); // url -> { status, encoding, mimeType, bytes }
  const urlOfRequest = new Map(); // requestId -> url

  cdp.on("Network.responseReceived", ({ requestId, response }) => {
    urlOfRequest.set(requestId, response.url);
    const existing = wire.get(response.url);
    if (existing) return; // a second request for the same url: keep accumulating
    wire.set(response.url, {
      status: response.status,
      encoding: response.headers["content-encoding"] || response.headers["Content-Encoding"] || "identity",
      mimeType: response.mimeType,
      bytes: 0,
    });
  });

  cdp.on("Network.loadingFinished", ({ requestId, encodedDataLength }) => {
    const url = urlOfRequest.get(requestId);
    const entry = url ? wire.get(url) : null;
    if (entry) entry.bytes += encodedDataLength || 0;
  });

  /* Cold cache: a first-time visitor on a phone. */
  await cdp.send("Network.clearBrowserCache", {}, sessionId);

  const loaded = cdp.once("Page.loadEventFired", 60000);
  await cdp.send("Page.navigate", { url: baseUrl }, sessionId);
  await loaded;

  /* Let the page finish settling: lazy images, hydration, idle callbacks. Long
     tasks keep landing after `load`, and TBT is defined over that whole window. */
  await new Promise((resolve) => setTimeout(resolve, 5000));

  const { result } = await cdp.send(
    "Runtime.evaluate",
    {
      returnByValue: true,
      expression: `(() => {
        const nav = performance.getEntriesByType("navigation")[0] || {};
        const resources = performance.getEntriesByType("resource").map((r) => ({
          name: r.name,
          initiator: r.initiatorType,
          bytes: r.transferSize || 0,
          encoded: r.encodedBodySize || 0,
          decoded: r.decodedBodySize || 0,
          duration: Math.round(r.duration),
          start: Math.round(r.startTime),
          end: Math.round(r.startTime + r.duration),
          renderBlockingStatus: r.renderBlockingStatus || "",
        }));
        return {
          perf: window.__perf,
          nav: {
            ttfb: nav.responseStart || null,
            domContentLoaded: nav.domContentLoadedEventEnd || null,
            load: nav.loadEventEnd || null,
            transferSize: nav.transferSize || 0,
          },
          resources,
        };
      })()`,
    },
    sessionId,
  );

  const { perf, nav, resources } = result.value;
  const lcp = perf.lcp || null;
  const fcp = perf.fcp;
  const blocking = perf.blockingMs || 0;
  const cls = Number(perf.cls.toFixed(4));
  const ttfb = nav.ttfb;

  console.log("Core metrics");
  console.log(`   FCP   ${formatMs(fcp).padStart(7)}   ${verdict("fcp", fcp)}`);
  console.log(`   LCP   ${formatMs(lcp).padStart(7)}   ${verdict("lcp", lcp)}${perf.lcpElement ? `   (element: ${perf.lcpElement})` : ""}`);
  console.log(`   TBT   ${String(Math.round(blocking) + " ms").padStart(7)}   ${verdict("tbt", blocking)}`);
  console.log(`   CLS   ${String(cls).padStart(7)}   ${verdict("cls", cls)}${perf.shifts ? `   (${perf.shifts} shift(s))` : ""}`);
  console.log(`   TTFB  ${String(Math.round(ttfb) + " ms").padStart(7)}   ${verdict("ttfb", ttfb)}`);
  console.log("");

  /* Prefer the network stack's own accounting; fall back to Resource Timing. */
  const wireBytes = [...wire.values()].reduce((sum, entry) => sum + entry.bytes, 0);
  const compressed = [...wire.values()].filter((e) => e.encoding && e.encoding !== "identity").length;
  for (const resource of resources) {
    const match = wire.get(resource.name);
    if (match) resource.wire = match.bytes;
  }

  const totalBytes = wireBytes > 0 ? wireBytes : resources.reduce((sum, r) => sum + r.bytes, 0) + (nav.transferSize || 0);
  const byType = resources.reduce((acc, r) => {
    const key = r.initiator === "link" || r.name.includes(".css") ? "css"
      : r.name.includes(".js") ? "js"
      : r.initiator === "img" || /\.(png|jpe?g|webp|avif|svg|gif)(\?|$)/i.test(r.name) ? "image"
      : r.initiator === "font" || /\.(woff2?|ttf|otf)(\?|$)/i.test(r.name) ? "font"
      : "other";
    acc[key] = acc[key] || { count: 0, bytes: 0 };
    acc[key].count += 1;
    acc[key].bytes += r.bytes;
    return acc;
  }, {});
  console.log(
    `Transferred ${formatBytes(totalBytes)} over ${resources.length + 1} request(s) on a cold cache` +
      (compressed > 0 ? `  (${compressed} response(s) compressed)` : ""),
  );
  for (const [type, info] of Object.entries(byType).sort((a, b) => b[1].bytes - a[1].bytes)) {
    console.log(`   ${type.padEnd(5)} ${String(info.count).padStart(3)} req  ${formatBytes(info.bytes).padStart(10)}`);
  }
  console.log("");

  const renderBlocking = resources.filter((r) => r.renderBlockingStatus === "blocking" || (r.initiator === "link" && r.name.includes(".css")));
  const heaviest = [...resources].sort((a, b) => b.bytes - a.bytes).slice(0, 6);
  const slowest = [...resources].sort((a, b) => b.duration - a.duration).slice(0, 5);
  const shortName = (url) => {
    const clean = url.split("?")[0];
    const parts = clean.split("/");
    return parts.slice(-1)[0].length > 42 ? `${parts.slice(-1)[0].slice(0, 39)}…` : parts.slice(-1)[0];
  };

  const window_ = (r) => `${(r.start / 1000).toFixed(2)}s → ${(r.end / 1000).toFixed(2)}s`;
  /* transferSize is what actually crossed the network (post-compression). When it
     is close to the DECODED size the server sent it uncompressed — that is worth
     knowing before optimising the file itself. */
  const compressionNote = (r) => {
    const entry = wire.get(r.name);
    if (!entry) return "";
    if (entry.encoding === "identity") return r.decoded ? `  ← UNCOMPRESSED (${formatBytes(r.decoded)} of text)` : "";
    return `  (${entry.encoding}, ${formatBytes(entry.bytes)} on the wire)`;
  };
  console.log(`Heaviest resources (by bytes on the wire)`);
  const byWire = [...resources].sort((a, b) => (b.wire ?? b.bytes) - (a.wire ?? a.bytes)).slice(0, 6);
  for (const r of byWire) {
    console.log(`   ${formatBytes(r.wire ?? r.bytes).padStart(10)}  ${window_(r)}  ${shortName(r.name)}${r.renderBlockingStatus === "blocking" ? "  [render-blocking]" : ""}${compressionNote(r)}`);
  }
  console.log("");
  console.log(`Slowest resources (wall-clock window, not just transfer time)`);
  for (const r of slowest) {
    console.log(`   ${String(r.duration).padStart(6)}ms  ${window_(r)}  ${formatBytes(r.wire ?? r.bytes).padStart(10)}  ${shortName(r.name)}`);
  }
  console.log("");

  if (renderBlocking.length > 0) {
    const bytes = renderBlocking.reduce((sum, r) => sum + (r.wire ?? r.bytes), 0);
    console.log(`Render-blocking: ${renderBlocking.length} resource(s), ${formatBytes(bytes)}`);
    for (const r of renderBlocking.slice(0, 8)) console.log(`   • ${formatBytes(r.wire ?? r.bytes).padStart(10)}  ${window_(r)}  ${shortName(r.name)}${compressionNote(r)}`);
    /* When the last render-blocking sheet lands, the browser can finally paint.
       If that time matches FCP, THIS is what the page is waiting on. */
    const lastBlocking = Math.max(...renderBlocking.map((r) => r.end));
    console.log(`   last blocking sheet ready at ${(lastBlocking / 1000).toFixed(2)}s; FCP was ${formatMs(fcp)}`);
    if (fcp !== null && Math.abs(lastBlocking - fcp) < 400) {
      console.log("   → first paint is gated by these stylesheets");
    }
    console.log("");
  } else {
    console.log("Render-blocking: none reported\n");
  }

  const longestTasks = [...(perf.longTasks || [])].sort((a, b) => b.duration - a.duration).slice(0, 5);
  if (longestTasks.length > 0) {
    console.log(`Longest main-thread tasks (${perf.longTasks.length} total, TBT counts everything over 50ms)`);
    for (const task of longestTasks) {
      console.log(`   ${String(Math.round(task.duration) + "ms").padStart(7)}  starting at ${(task.start / 1000).toFixed(2)}s`);
    }
    console.log("");
  }

  for (const [key, value] of [["fcp", fcp], ["lcp", lcp], ["tbt", blocking], ["cls", cls], ["ttfb", ttfb]]) {
    if (value === null || value === undefined) continue;
    const [, poor] = BUDGETS[key];
    if (value > poor) failures.push(`${key.toUpperCase()} ${key === "cls" ? cls : Math.round(value) + (key.startsWith("ttfb") || key === "tbt" ? "ms" : "")} is in Lighthouse's poor band (${poor}${key === "cls" ? "" : "ms"} max)`);
  }
} catch (error) {
  failures.push(`check could not complete: ${error.message}`);
  console.error(`\n✖ ${error.message}`);
} finally {
  await session?.close?.();
}

console.log("─".repeat(64));
if (failures.length > 0) {
  console.error(`\n✖ ${failures.length} metric(s) below the bar:\n`);
  for (const failure of failures) console.error(`  • ${failure}`);
  console.error("\nFix the biggest number first — see the tables above for what is actually heavy.\n");
  process.exit(1);
}
console.log("\n✓ Core Web Vitals are within Lighthouse's mobile 'good' or 'needs work' bands.\n");
