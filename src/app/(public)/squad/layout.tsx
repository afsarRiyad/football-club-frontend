import type { Metadata } from "next";
import JsonLd from "@/components/seo/json-ld";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/structured-data";
import { buildMetadata, seoTarget } from "@/lib/seo";

const TITLE = seoTarget("squad").title;
const DESCRIPTION = seoTarget("squad").description;
const PATH = "/squad";

export const metadata: Metadata = buildMetadata({ target: "squad", path: PATH });

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
