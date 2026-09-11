import type { Player, Statistic } from "@/types";
import { serverFetch } from "@/lib/seo";
import PlayerProfileClient from "@/components/pages/PlayerProfileClient";

/* ────────────────────────────────────────────────────────────────────
   Player profile page — server component
   ────────────────────────────────────────────────────────────────────
   The player and season statistics are fetched here so the player's name,
   position, attributes and stats are present in the initial HTML — which is
   what lets a profile rank when someone searches a player's name.

   Expects the same endpoints the client used: the player plus statistics.
   ──────────────────────────────────────────────────────────────────── */

export const revalidate = 3600;

/* The API returns either { data: { player } } or { data: player }. */
type PlayerPayload = { player?: Player } & Partial<Player>;
type ListResponse<T> = { data?: T[] };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [playerJson, statisticsJson] = await Promise.all([
    serverFetch<{ data?: PlayerPayload }>(`/players/${encodeURIComponent(id)}`),
    serverFetch<ListResponse<Statistic>>("/statistics?limit=500"),
  ]);

  const data = playerJson?.data;
  const player: Player | null =
    data?.player ??
    (data && (data.firstName || data.lastName) ? (data as Player) : null);

  return (
    <PlayerProfileClient
      id={id}
      player={player}
      statistics={statisticsJson?.data ?? []}
    />
  );
}
