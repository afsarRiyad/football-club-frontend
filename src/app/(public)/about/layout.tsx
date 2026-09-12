import type { Metadata } from "next";
import JsonLd from "@/components/seo/json-ld";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/structured-data";
import { buildMetadata } from "@/lib/seo";

/* Leads with the location as well as the club: "about the club" alone competes
   with every club in the world, "Kabirhat, Noakhali" is the part that is ours. */
const TITLE = "About the Club — Kabirhat, Noakhali";
const DESCRIPTION =
  "The story of Nayadiganta Sporting Club: founded in 2025 at Bhuiyyarhat Chowrasta, Kabirhat, Noakhali, Bangladesh. Our mission, values, home ground and the people who run the club.";
const PATH = "/about";

export const metadata: Metadata = buildMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  keywords: [
    "About Nayadiganta Sporting Club",
    "Nayadiganta SC history",
    "Kabirhat football club",
    "Bhuiyyarhat Chowrasta football club",
    "Noakhali football club",
  ],
});

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
