import type { Metadata } from "next";
import JsonLd from "@/components/seo/json-ld";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/structured-data";
import { buildMetadata } from "@/lib/seo";

const TITLE = "Squad — Player Profiles & Statistics";
const DESCRIPTION =
  "Meet the Nayadiganta Sporting Club squad: goalkeeper, defender, midfielder and forward profiles with shirt numbers, attributes, match-day XI and season statistics.";
const PATH = "/squad";

export const metadata: Metadata = buildMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  keywords: [
    "Nayadiganta squad",
    "football players Bangladesh",
    "player profiles",
    "team line-up",
  ],
});

export default function SquadSeoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={[
          collectionPageSchema({ name: TITLE, description: DESCRIPTION, path: PATH }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Squad", path: PATH },
          ]),
        ]}
      />
      {children}
    </>
  );
}
