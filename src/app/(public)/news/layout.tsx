import type { Metadata } from "next";
import JsonLd from "@/components/seo/json-ld";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/structured-data";
import { buildMetadata } from "@/lib/seo";

const TITLE = "Club News, Transfers & Match Reports";
const DESCRIPTION =
  "The latest news from Nayadiganta Sporting Club — transfers, match reports, player interviews, tactical analysis and official club announcements.";
const PATH = "/news";

export const metadata: Metadata = buildMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  keywords: [
    "Nayadiganta news",
    "football club news Bangladesh",
    "transfer news",
    "match reports",
  ],
});

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
