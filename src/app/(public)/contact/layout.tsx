import JsonLd from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/structured-data";
import { CLUB, CONTACT, absoluteUrl, seoTarget } from "@/lib/seo";

/* The page's own title/description/keywords come from the `contact` target in
   SEO_METADATA (that is the file to edit), and the same two strings feed the
   ContactPage JSON-LD below. Metadata itself is exported by page.tsx, so the
   contact route has exactly one metadata declaration. */
const TITLE = seoTarget("contact").title;
const DESCRIPTION = seoTarget("contact").description;
const PATH = "/contact";

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
