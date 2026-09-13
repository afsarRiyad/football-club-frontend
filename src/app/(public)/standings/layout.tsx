import type { Metadata } from "next";
import JsonLd from "@/components/seo/json-ld";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/structured-data";
import { buildMetadata, seoTarget } from "@/lib/seo";

const TITLE = seoTarget("standings").title;
const DESCRIPTION = seoTarget("standings").description;
const PATH = "/standings";

export const metadata: Metadata = buildMetadata({ target: "standings", path: PATH });

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
