import type { Metadata } from "next";
import JsonLd from "@/components/seo/json-ld";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/structured-data";
import { buildMetadata, seoTarget } from "@/lib/seo";

/* Title, description and keywords live in the `academy` target — including the
   Kabirhat / Bhuiyarhat / Noakhali phrasings, since the academy serves those
   places. The same strings feed the JSON-LD below. */
const TITLE = seoTarget("academy").title;
const DESCRIPTION = seoTarget("academy").description;
const PATH = "/academy";

export const metadata: Metadata = buildMetadata({ target: "academy", path: PATH });

export default function AcademySeoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={[
          collectionPageSchema({ name: TITLE, description: DESCRIPTION, path: PATH }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Academy", path: PATH },
          ]),
        ]}
      />
      {children}
    </>
  );
}
