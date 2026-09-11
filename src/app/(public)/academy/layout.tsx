import type { Metadata } from "next";
import JsonLd from "@/components/seo/json-ld";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/structured-data";
import { buildMetadata } from "@/lib/seo";

const TITLE = "Youth Academy — Player Development";
const DESCRIPTION =
  "The Nayadiganta Sporting Club Academy develops young footballers at Bhuiyyarhat Chowrasta, Kabirhat, Noakhali, Bangladesh. Age groups from U8 to U21, professional coaching, training schedules and a pathway to the first team.";
const PATH = "/academy";

export const metadata: Metadata = buildMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  keywords: [
    "football academy Bangladesh",
    "youth football Noakhali",
    "Nayadiganta academy",
    "football training Kabirhat",
    "football academy Noakhali",
  ],
});

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
