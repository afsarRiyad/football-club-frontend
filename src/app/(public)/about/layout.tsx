import type { Metadata } from "next";
import JsonLd from "@/components/seo/json-ld";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/structured-data";
import { buildMetadata, seoTarget } from "@/lib/seo";

/* Copy, keywords and locale phrases all come from the `about` target in
   SEO_METADATA; the same two strings feed the CollectionPage JSON-LD below, so
   the page and its structured data can never disagree. */
const TITLE = seoTarget("about").title;
const DESCRIPTION = seoTarget("about").description;
const PATH = "/about";

export const metadata: Metadata = buildMetadata({ target: "about", path: PATH });

export default function AboutSeoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={[
          collectionPageSchema({ name: TITLE, description: DESCRIPTION, path: PATH }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "About the Club", path: PATH },
          ]),
        ]}
      />
      {children}
    </>
  );
}
