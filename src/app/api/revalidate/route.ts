import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { API_CACHE_TAG } from "@/lib/seo";

/* ────────────────────────────────────────────────────────────────────
   On-demand revalidation endpoint.

   The public pages are statically rendered with a 60s window. Without this,
   an admin save is invisible for up to a minute, which reads as "my content
   isn't showing" rather than "that's the cache". After every successful write
   the API posts here and the cached pages are purged immediately.

   Called by the backend only (middleware/revalidateSite.js). It is protected by
   a shared secret, and it degrades safely:

     · REVALIDATE_SECRET unset here  → 501, nothing happens, the API logs it once
       and the site keeps refreshing on its timer. Nothing breaks.
     · wrong secret                  → 401, nothing is purged.

   Never expose REVALIDATE_SECRET to the browser (no NEXT_PUBLIC_ prefix).
   ──────────────────────────────────────────────────────────────────── */

/* A cache purge must never be served from cache itself. */
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;

  if (!secret) {
    return NextResponse.json(
      {
        revalidated: false,
        configured: false,
        reason:
          "REVALIDATE_SECRET is not set on this deployment. Pages fall back to their 60s window.",
      },
      { status: 501 },
    );
  }

  const fromHeader = request.headers.get("x-revalidate-secret");
  const fromBody = fromHeader ? undefined : ((await request.json().catch(() => ({}))) as { secret?: string }).secret;
  const provided = fromHeader ?? fromBody ?? "";

  if (provided !== secret) {
    return NextResponse.json({ revalidated: false, reason: "Invalid secret." }, { status: 401 });
  }

  /* Both are needed and they cover different caches:
     revalidateTag drops the cached API responses (the data), revalidatePath
     drops the rendered HTML that was built from them.

     `{ expire: 0 }` rather than the "max" profile: this call comes from a
     webhook (the API), not a Server Action, so there is no `updateTag`. With
     "max" the first visitor after a save is still served the stale page, which
     recreates the exact problem this endpoint exists to fix — the admin saving
     an article and seeing the old version when they refresh. Expiring
     immediately means that refresh blocks for the regeneration and shows the
     new content. (Explicit paths are covered by the layout-wide path purge,
     which invalidates every route under it, including detail pages.) */
  revalidateTag(API_CACHE_TAG, { expire: 0 });
  revalidatePath("/", "layout");

  return NextResponse.json({
    revalidated: true,
    tag: API_CACHE_TAG,
    path: "/",
    at: new Date().toISOString(),
  });
}

/** Configuration probe for ops — deliberately does not reveal the secret. */
export async function GET() {
  return NextResponse.json({ configured: Boolean(process.env.REVALIDATE_SECRET) });
}
