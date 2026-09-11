import type { Metadata } from "next";
import JsonLd from "@/components/seo/json-ld";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/structured-data";
import { buildMetadata } from "@/lib/seo";

const TITLE = "Request a Friendly Match";
const DESCRIPTION =
  "Challenge Nayadiganta Sporting Club to a friendly. Pick your preferred date, venue and format — 5v5, 7v7, 9v9 or 11v11 — and our team will get back to you.";
const PATH = "/request-match";

export const metadata: Metadata = buildMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  keywords: ["request a football match", "friendly match Bangladesh", "play against football club"],
});

export default function RequestMatchSeoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={[
          collectionPageSchema({ name: TITLE, description: DESCRIPTION, path: PATH }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Request a Match", path: PATH },
          ]),
        ]}
      />
      {children}
    </>
  );
}
