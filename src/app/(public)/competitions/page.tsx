import type { Competition } from "@/types";
import { serverFetch } from "@/lib/seo";
import CompetitionsClient, {
  type CompetitionsInitialData,
} from "@/components/pages/CompetitionsClient";

/* ────────────────────────────────────────────────────────────────────
   Competitions page — server component
   ────────────────────────────────────────────────────────────────────
   Competitions and tournaments are fetched here so their names appear in the
   initial HTML. Selecting an entry and the 30s live refresh stay client-side.

   Both endpoints are requested with the same limit the client used.
   ──────────────────────────────────────────────────────────────────── */

export const revalidate = 3600;

type ListResponse<T> = { data?: T[] };

export default async function Page() {
  const [competitions, tournaments] = await Promise.all([
    serverFetch<ListResponse<Competition>>("/competitions?limit=50"),
    serverFetch<ListResponse<Competition>>("/tournaments?limit=50"),
  ]);

  const initialData: CompetitionsInitialData = {
    competitions: competitions?.data ?? [],
    tournaments: tournaments?.data ?? [],
  };

  return <CompetitionsClient initialData={initialData} />;
}
