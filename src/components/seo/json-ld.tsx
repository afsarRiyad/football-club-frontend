/**
 * Renders schema.org structured data as a JSON-LD script tag.
 * Server component only — keep it out of "use client" trees.
 */
export default function JsonLd({ data }: { data: object | object[] }) {
  const payload = Array.isArray(data) ? data : [data];
  return (
    <>
      {payload.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          // JSON.stringify output is safe here: values come from our own API,
          // and "<" is escaped so a title can never close the script tag early.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(item).replace(/</g, "\\u003c"),
          }}
        />
      ))}
    </>
  );
}
