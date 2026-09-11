import type { Academy, Player } from "@/types";
import { serverFetch } from "@/lib/seo";
import AcademyClient from "@/components/pages/AcademyClient";

/* ────────────────────────────────────────────────────────────────────
   Academy page — server component
   ────────────────────────────────────────────────────────────────────
   The academy record and its squad are fetched here so the academy name,
   description and player names are present in the initial HTML.

   Expects the same endpoints the client used: academy limit 1, players 20.
   ──────────────────────────────────────────────────────────────────── */

export const revalidate = 3600;

type ListResponse<T> = { data?: T[] };

export default async function Page() {
  /* serverFetch never throws — an unreachable API degrades to null and the
     client component falls back to fetching in the browser. */
  const [academy, players] = await Promise.all([
    serverFetch<ListResponse<Academy>>("/academy?limit=1"),
    serverFetch<ListResponse<Player>>("/players?limit=20"),
  ]);

  return (
    <AcademyClient
      academy={academy?.data?.[0] ?? null}
      players={players?.data ?? []}
    />
  );
}
