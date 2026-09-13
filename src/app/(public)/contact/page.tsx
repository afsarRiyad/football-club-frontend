import type { Metadata } from "next";
import Link from "next/link";
import MapEmbed from "@/components/shared/MapEmbed";
import {
  CLUB,
  CLUB_MAP_URL,
  CONTACT,
  SITE_NAME,
  buildMetadata,
} from "@/lib/seo";

/* ────────────────────────────────────────────────────────────────────
   Contact & directions — server component on purpose
   ────────────────────────────────────────────────────────────────────
   The address, town and district are rendered into the HTML on the server,
   which is exactly what local searches look for. Every detail comes from
   lib/seo.ts, so the footer, this page and the structured data can never
   disagree — inconsistent NAP data is what breaks local rankings.
   ──────────────────────────────────────────────────────────────────── */

/* Title, description and keywords all come from the `contact` target in
   SEO_METADATA — the one place this page's search copy lives. */
export const metadata: Metadata = buildMetadata({ target: "contact", path: "/contact" });

const directions = [
  {
    title: "Finding the ground",
    text: `Head for ${CLUB.address} in ${CLUB.city} — the ground sits beside the crossroads, in ${CLUB.region} district.`,
  },
  {
    title: "Match days",
    text: "Home fixtures and kick-off times (Bangladesh time) are listed on the fixtures page, along with results and live scores.",
  },
  {
    title: "Join the academy",
    text: "Our youth programme is open to players aged 8–18 from Kabirhat, Noakhali and the surrounding areas.",
  },
];

export default function ContactPage() {
  const hasPhoneOrEmail = Boolean(CONTACT.telephone || CONTACT.email);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <span className="text-xs font-mono text-pitch-accent uppercase tracking-widest mb-3 block">
        Get in touch
      </span>
      <h1 className="text-3xl md:text-5xl font-bold text-floodlight font-display tracking-tight mb-4">
        Contact {SITE_NAME}
      </h1>
      <p className="text-mist text-lg leading-relaxed max-w-2xl mb-10">
        We are a football club based at {CLUB.address}, {CLUB.city}, {CLUB.region},{" "}
        {CLUB.country}. Whether you want to arrange a friendly, join the youth academy
        or visit us on a match day, this is how to reach us.
      </p>

      <div className="grid md:grid-cols-2 gap-6 md:gap-10 items-start">
        <section className="font-card bg-surface rounded-2xl border border-line/60 p-6 md:p-8">
          <h2 className="text-xl font-bold text-floodlight font-display mb-6">Club details</h2>

          <dl className="space-y-5 text-sm">
            <div>
              <dt className="text-xs font-mono uppercase tracking-widest text-mist mb-1">Ground</dt>
              <dd className="text-floodlight leading-relaxed">
                {CLUB.address}
                <br />
                {CLUB.city}, {CLUB.region}
                {CONTACT.postalCode ? ` ${CONTACT.postalCode}` : ""}
                <br />
                {CLUB.country}
              </dd>
            </div>

            {CONTACT.telephone ? (
              <div>
                <dt className="text-xs font-mono uppercase tracking-widest text-mist mb-1">Phone</dt>
                <dd>
                  <a href={`tel:${CONTACT.telephone}`} className="text-pitch-accent hover:underline">
                    {CONTACT.telephone}
                  </a>
                </dd>
              </div>
            ) : null}

            {CONTACT.email ? (
              <div>
                <dt className="text-xs font-mono uppercase tracking-widest text-mist mb-1">Email</dt>
                <dd>
                  <a href={`mailto:${CONTACT.email}`} className="text-pitch-accent hover:underline">
                    {CONTACT.email}
                  </a>
                </dd>
              </div>
            ) : null}

            {CONTACT.openingHours.length > 0 ? (
              <div>
                <dt className="text-xs font-mono uppercase tracking-widest text-mist mb-1">Training</dt>
                <dd className="text-floodlight">{CONTACT.openingHours.join(" · ")}</dd>
              </div>
            ) : null}
          </dl>

          {!hasPhoneOrEmail ? (
            <p className="text-mist text-sm mt-6 leading-relaxed">
              No phone number or email is published yet. Use the match request form and the
              club will get back to you by email.
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-7">
            <Link href="/request-match" className="text-sm text-pitch-accent hover:underline">
              Request a match
            </Link>
            <Link href="/about" className="text-sm text-pitch-accent hover:underline">
              About the club
            </Link>
            <a
              href={CLUB_MAP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-pitch-accent hover:underline"
            >
              Open in Google Maps
            </a>
          </div>
        </section>

        {/* The map is click-to-load: see MapEmbed for why the embed's ~1MB of
            third-party JavaScript must not run on page load. */}
        <section className="rounded-2xl border border-line/60 overflow-hidden bg-surface">
          <MapEmbed />
        </section>
      </div>

      <section className="mt-12 grid sm:grid-cols-3 gap-4">
        {directions.map((item) => (
          <div
            key={item.title}
            className="font-card bg-surface rounded-2xl border border-line/60 p-6"
          >
            <h2 className="text-base font-bold text-floodlight font-display mb-2">{item.title}</h2>
            <p className="text-mist text-sm leading-relaxed">{item.text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
