import type { Metadata } from "next";
import JsonLd from "@/components/seo/json-ld";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/structured-data";
import { buildMetadata, seoTarget } from "@/lib/seo";

const TITLE = seoTarget("gallery").title;
const DESCRIPTION = seoTarget("gallery").description;
const PATH = "/gallery";

export const metadata: Metadata = buildMetadata({ target: "gallery", path: PATH });

export default function GallerySeoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={[
          collectionPageSchema({ name: TITLE, description: DESCRIPTION, path: PATH }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Gallery", path: PATH },
          ]),
        ]}
      />
      {children}
    </>
  );
}
