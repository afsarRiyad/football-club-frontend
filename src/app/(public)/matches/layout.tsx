import type { Metadata } from "next";
import JsonLd from "@/components/seo/json-ld";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/structured-data";
import { buildMetadata, seoTarget } from "@/lib/seo";

const TITLE = seoTarget("matches").title;
const DESCRIPTION = seoTarget("matches").description;
const PATH = "/matches";

export const metadata: Metadata = buildMetadata({ target: "matches", path: PATH });

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
