import type { JsonLdObject } from "@/lib/jsonld";

/**
 * Server-renders a schema.org block.
 *
 * JSON.stringify output is escaped for `<` so a stray "</script>" inside any
 * user-entered field (an event description, say) cannot break out of the
 * script tag. This is the standard XSS guard for embedded JSON-LD.
 */
export default function JsonLd({ data }: { data: JsonLdObject | JsonLdObject[] }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
