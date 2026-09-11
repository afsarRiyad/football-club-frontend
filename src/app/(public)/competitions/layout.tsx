import type { Metadata } from "next";
import JsonLd from "@/components/seo/json-ld";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/structured-data";
import { buildMetadata } from "@/lib/seo";

const TITLE = "Competitions, Leagues & Tournaments";
const DESCRIPTION =
  "Every competition Nayadiganta Sporting Club plays in — leagues, cups, and tournaments, with participating teams, formats, fixtures and results.";
const PATH = "/competitions";

export const metadata: Metadata = buildMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  keywords: [
    "football league Bangladesh",
    "Nayadiganta competitions",
    "football cup Noakhali",
    "club tournaments",
  ],
});

export default function CompetitionsSeoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={[
          collectionPageSchema({ name: TITLE, description: DESCRIPTION, path: PATH }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Competitions", path: PATH },
          ]),
        ]}
      />
      {children}
    </>
  );
}
