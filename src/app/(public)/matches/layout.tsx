import type { Metadata } from "next";
import JsonLd from "@/components/seo/json-ld";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/structured-data";
import { buildMetadata } from "@/lib/seo";

const TITLE = "Fixtures, Results & Live Scores";
const DESCRIPTION =
  "Nayadiganta Sporting Club fixtures and results — upcoming matches, live scores, kick-off times, venues, goalscorers and full match reports.";
const PATH = "/matches";

export const metadata: Metadata = buildMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  keywords: [
    "Nayadiganta fixtures",
    "Nayadiganta results",
    "football live scores Bangladesh",
    "upcoming football matches",
  ],
});

export default function MatchesSeoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={[
          collectionPageSchema({ name: TITLE, description: DESCRIPTION, path: PATH }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Matches", path: PATH },
          ]),
        ]}
      />
      {children}
    </>
  );
}
