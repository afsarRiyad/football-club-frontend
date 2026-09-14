import type { Metadata } from "next";
import JsonLd from "@/components/seo/json-ld";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/structured-data";
import { buildMetadata, seoTarget } from "@/lib/seo";

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
