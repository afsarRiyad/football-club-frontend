import type { Gallery } from "@/types";
import { serverFetch } from "@/lib/seo";
import GalleryClient, { type GalleryInitialData } from "@/components/pages/GalleryClient";

/* ────────────────────────────────────────────────────────────────────
   Gallery page — server component
   ────────────────────────────────────────────────────────────────────
   Page 1 of the unfiltered list is fetched here so gallery titles and dates
   are present in the initial HTML. Category filtering, pagination and the
   lightbox stay client-side.

   Mirrors the params the client uses: page=1, limit=9.
   ──────────────────────────────────────────────────────────────────── */

export const revalidate = 3600;

type ListResponse<T> = { data?: T[]; totalPages?: number };

export default async function Page() {
  const res = await serverFetch<ListResponse<Gallery>>("/gallery?page=1&limit=9");

  const initialData: GalleryInitialData = {
    galleries: res?.data ?? [],
    totalPages: res?.totalPages ?? 1,
  };

  return <GalleryClient initialData={initialData} />;
}
