import type { Metadata } from "next";
import JsonLd from "@/components/seo/json-ld";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/structured-data";
import { buildMetadata, seoTarget } from "@/lib/seo";

const TITLE = seoTarget("news").title;
const DESCRIPTION = seoTarget("news").description;
const PATH = "/news";

export const metadata: Metadata = buildMetadata({ target: "news", path: PATH });

export default function NewsSeoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={[
          collectionPageSchema({ name: TITLE, description: DESCRIPTION, path: PATH }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "News", path: PATH },
          ]),
        ]}
      />
      {children}
    </>
  );
}
