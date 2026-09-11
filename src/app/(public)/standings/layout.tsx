import type { Metadata } from "next";
import JsonLd from "@/components/seo/json-ld";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/structured-data";
import { buildMetadata } from "@/lib/seo";

const TITLE = "League Standings & Top Scorers";
const DESCRIPTION =
  "League tables, points, goal difference and the top scorers for Nayadiganta Sporting Club and their competitions — updated through the season.";
const PATH = "/standings";

export const metadata: Metadata = buildMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  keywords: [
    "football league table",
    "league standings Bangladesh",
    "top scorers",
    "Nayadiganta standings",
  ],
});

export default function StandingsSeoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={[
          collectionPageSchema({ name: TITLE, description: DESCRIPTION, path: PATH }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Standings", path: PATH },
          ]),
        ]}
      />
      {children}
    </>
  );
}
