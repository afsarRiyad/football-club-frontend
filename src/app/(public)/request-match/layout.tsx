import type { Metadata } from "next";
import JsonLd from "@/components/seo/json-ld";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/structured-data";
import { buildMetadata, seoTarget } from "@/lib/seo";

const TITLE = seoTarget("requestMatch").title;
const DESCRIPTION = seoTarget("requestMatch").description;
const PATH = "/request-match";

export const metadata: Metadata = buildMetadata({ target: "requestMatch", path: PATH });

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
