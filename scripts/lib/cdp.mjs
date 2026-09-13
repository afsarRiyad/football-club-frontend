/**
 * Minimal Chrome DevTools Protocol client, shared by the project's browser checks.
 *
 * WHY THIS EXISTS
 * ---------------
 * Chrome or Edge is already installed wherever this project runs, and Node 22 ships
 * a global WebSocket, so the project can drive a real browser over the DevTools
 * Protocol with nothing to install — no Playwright, no 130MB browser download.
 *
 * `check-layout.mjs` (does a block render at a sane size?) and `check-perf.mjs`
 * (how slow is the page on a phone?) both need the same plumbing, so it lives here.
 */

import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export const CANDIDATE_BROWSERS = [
  process.env.LAYOUT_BROWSER,
  process.env.PERF_BROWSER,
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
].filter(Boolean);

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const findBrowser = () => CANDIDATE_BROWSERS.find((candidate) => existsSync(candidate)) ?? null;

export class Devtools {
  constructor(ws) {
    this.ws = ws;
    this.nextId = 1;
    this.pending = new Map();
    ws.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      const waiter = this.pending.get(message.id);
      if (!waiter) return;
      this.pending.delete(message.id);
      message.error ? waiter.reject(new Error(message.error.message)) : waiter.resolve(message.result);
    });
  }

  static async connect(url) {
    const ws = new WebSocket(url);
    await new Promise((resolve, reject) => {
      ws.addEventListener("open", resolve, { once: true });
      ws.addEventListener("error", () => reject(new Error(`Cannot open ${url}`)), { once: true });
    });
    return new Devtools(ws);
  }

  send(method, params = {}, sessionId) {
    const id = this.nextId++;
    this.ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      setTimeout(() => {
        if (this.pending.delete(id)) reject(new Error(`CDP timeout: ${method}`));
      }, 30000);
    });
  }

  /**
   * Subscribe to an event for the lifetime of the session. Unlike `once`, the
   * handler keeps firing — needed for Network events, which arrive per request.
   */
  on(method, handler) {
    const onMessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.method !== method) return;
      handler(message.params);
    };
    this.ws.addEventListener("message", onMessage);
    return () => this.ws.removeEventListener("message", onMessage);
  }

  once(method, timeoutMs) {
    return new Promise((resolve) => {
      const onMessage = (event) => {
        if (JSON.parse(event.data).method !== method) return;
        this.ws.removeEventListener("message", onMessage);
        resolve();
      };
      this.ws.addEventListener("message", onMessage);
      setTimeout(() => {
        this.ws.removeEventListener("message", onMessage);
        resolve();
      }, timeoutMs);
    });
  }

  close() {
    try {
      this.ws.close();
    } catch {
      /* already closed */
    }
  }
}

export async function waitForDevtools(port, deadlineMs = 25000) {
  const start = Date.now();
  while (Date.now() - start < deadlineMs) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (res.ok) return await res.json();
    } catch {
      /* not listening yet */
    }
    await sleep(200);
  }
  throw new Error("The browser did not expose its debugging port in time.");
}

/**
 * Launch a headless browser and attach a page session.
 *
 * @returns {Promise<{cdp: Devtools, sessionId: string, close: () => Promise<void>}>}
 */
export async function launchSession() {
  const browserPath = findBrowser();
  if (!browserPath) {
    throw new Error("No Chrome or Edge found. Set LAYOUT_BROWSER to a browser executable.");
  }

  const port = 9222 + Math.floor(Math.random() * 700);
  const profileDir = mkdtempSync(join(tmpdir(), "fclub-browser-"));
  const args = [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-extensions",
    `--user-data-dir=${profileDir}`,
    `--remote-debugging-port=${port}`,
    "about:blank",
  ];
  /* Containers running as root need this; a normal desktop session must not have it. */
  if (process.platform === "linux" && process.getuid?.() === 0) args.unshift("--no-sandbox");

  const child = spawn(browserPath, args, { stdio: ["ignore", "ignore", "pipe"] });

  const version = await waitForDevtools(port);
  const cdp = await Devtools.connect(version.webSocketDebuggerUrl);
  const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });

  const close = async () => {
    try {
      cdp.close();
      const exited = new Promise((resolve) => child.once("exit", resolve));
      child.kill();
      await Promise.race([exited, sleep(3000)]);
      rmSync(profileDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 250 });
    } catch {
      /* A locked temp profile is not a reason to fail the check. */
    }
  };

  return { cdp, sessionId, browserPath, close };
}
