import type { Metadata } from "next";
import JsonLd from "@/components/seo/json-ld";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/structured-data";
import { buildMetadata, seoTarget } from "@/lib/seo";

const TITLE = seoTarget("competitions").title;
const DESCRIPTION = seoTarget("competitions").description;
const PATH = "/competitions";

export const metadata: Metadata = buildMetadata({ target: "competitions", path: PATH });

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
