/**
 * Emit one or more schema.org graphs as JSON-LD.
 *
 * Nulls are filtered so callers can pass conditional graphs inline.
 */
export function JsonLd({ graphs }: { graphs: (object | null)[] }) {
  return (
    <>
      {graphs.filter(Boolean).map((graph, index) => (
        <script
          key={index}
          type="application/ld+json"
          // Structured data is generated from our own typed sources, never user input
          dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
        />
      ))}
    </>
  );
}
