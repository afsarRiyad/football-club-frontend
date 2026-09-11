import type { Metadata } from "next";
import JsonLd from "@/components/seo/json-ld";
import { breadcrumbSchema, personSchema } from "@/lib/structured-data";
import { SITE_NAME, buildMetadata, metaDescription, serverFetch, truncate } from "@/lib/seo";

type RouteParams = { params: Promise<{ id: string }> };

type PlayerDetail = {
  _id?: string;
  firstName?: string;
  lastName?: string;
  position?: string;
  number?: number;
  photo?: string;
  bio?: string;
  nationality?: string;
  dateOfBirth?: string;
  height?: number;
  weight?: number;
};

const POSITION_LABELS: Record<string, string> = {
  GOALKEEPER: "Goalkeeper",
  DEFENDER: "Defender",
  MIDFIELDER: "Midfielder",
  FORWARD: "Forward",
};

async function getPlayer(id: string): Promise<PlayerDetail | null> {
  const json = await serverFetch<any>(`/players/${encodeURIComponent(id)}`);
  const player = json?.data?.player ?? json?.data;
  if (!player?.firstName && !player?.lastName) return null;
  return player as PlayerDetail;
}

const fullName = (player: PlayerDetail) =>
  `${player.firstName || ""} ${player.lastName || ""}`.trim();

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { id } = await params;
  const player = await getPlayer(id);

  if (!player) {
    return buildMetadata({
      title: "Player not found",
      description: `This player profile could not be found. Browse the full ${SITE_NAME} squad.`,
      path: `/squad/${id}`,
      noindex: true,
    });
  }

  const name = fullName(player);
  const position = player.position ? POSITION_LABELS[player.position] || player.position : "";
  const title = truncate([name, position].filter(Boolean).join(" — "), 60);
  // Only prefer the (optional, free-text) bio when it is long enough to make a
  // useful search snippet; otherwise describe the player from real data.
  const bio = (player.bio || "").trim();
  const description = metaDescription(
    bio.length >= 60 ? bio : undefined,
    `${name}${player.number ? ` (#${player.number})` : ""}${position ? `, ${position.toLowerCase()}` : ""} for ${SITE_NAME}. Profile, attributes and season statistics.`,
  );

  return buildMetadata({
    title,
    description,
    path: `/squad/${id}`,
    images: [player.photo],
    type: "profile",
    keywords: [name, `${name} football`, `${SITE_NAME} squad`, position].filter(Boolean),
  });
}

export default async function PlayerSeoLayout({
  children,
  params,
}: RouteParams & { children: React.ReactNode }) {
  const { id } = await params;
  const player = await getPlayer(id);

  if (!player) return <>{children}</>;

  const name = fullName(player);

  return (
    <>
      <JsonLd
        data={[
          personSchema({
            _id: id,
            firstName: player.firstName || "",
            lastName: player.lastName || "",
            position: player.position,
            number: player.number,
            photo: player.photo,
            nationality: player.nationality,
            dateOfBirth: player.dateOfBirth,
            height: player.height,
            weight: player.weight,
          }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Squad", path: "/squad" },
            { name, path: `/squad/${id}` },
          ]),
        ]}
      />
      {children}
    </>
  );
}
