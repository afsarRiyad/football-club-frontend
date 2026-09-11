import type { Metadata } from "next";
import JsonLd from "@/components/seo/json-ld";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/structured-data";
import { buildMetadata } from "@/lib/seo";

const TITLE = "Gallery — Match Day, Training & Club Photos";
const DESCRIPTION =
  "Photo and video gallery of Nayadiganta Sporting Club: match-day action, training sessions, club events and team photos from Kabirhat, Noakhali, Bangladesh.";
const PATH = "/gallery";

export const metadata: Metadata = buildMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  keywords: ["football club photos", "Nayadiganta gallery", "match day photos", "Bangladesh football photos"],
});

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
