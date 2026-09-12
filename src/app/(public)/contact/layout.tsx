import type { Metadata } from "next";
import JsonLd from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/structured-data";
import {
  CLUB,
  CLUB_FULL_LOCATION,
  CONTACT,
  SITE_NAME,
  absoluteUrl,
  buildMetadata,
} from "@/lib/seo";

/* Leads with the ground's location, because that is the part of this page's
   subject that is uniquely ours — "contact a football club" matches thousands
   of pages, "Bhuiyyarhat Chowrasta, Kabirhat, Noakhali" matches us. */
const TITLE = "Contact & Directions — Bhuiyyarhat Chowrasta, Kabirhat";
const DESCRIPTION = `How to reach ${SITE_NAME}: our ground is at ${CLUB_FULL_LOCATION}${
  CONTACT.telephone ? `, phone ${CONTACT.telephone}` : ""
}. Arrange a friendly, contact the club, or join the youth academy.`;
const PATH = "/contact";

export const metadata: Metadata = buildMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  keywords: [
    "Nayadiganta Sporting Club contact",
    "Nayadiganta club address",
    "Bhuiyyarhat Chowrasta Kabirhat",
    "Kabirhat football ground",
    "Noakhali football club contact",
    "Nayadiganta club phone number",
  ],
});

export default function ContactSeoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "@id": absoluteUrl(PATH),
            url: absoluteUrl(PATH),
            name: TITLE,
            description: DESCRIPTION,
            /* Points at the club entity declared site-wide, so search engines
               tie this page to the organisation rather than treating it as a
               standalone contact form. */
            about: { "@id": `${absoluteUrl("/")}#club` },
            inLanguage: "en",
            isPartOf: { "@id": `${absoluteUrl("/")}#website` },
            address: {
              "@type": "PostalAddress",
              streetAddress: CLUB.address,
              addressLocality: CLUB.city,
              addressRegion: CLUB.region,
              ...(CONTACT.postalCode ? { postalCode: CONTACT.postalCode } : {}),
              addressCountry: CLUB.countryCode,
            },
          },
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Contact", path: PATH },
          ]),
        ]}
      />
      {children}
    </>
  );
}
