import type { ReactNode } from 'react';
import { Container } from './Container';

/**
 * The standard page header: lime eyebrow, display headline, lead paragraph.
 *
 * Extracted because /about, /members and /join all open the same way, and
 * three hand-copied versions would drift the moment one of them is touched.
 * Type sizes match the homepage hero so a page opening never feels like a
 * different site.
 */
export function PageHeader({
  eyebrow,
  title,
  lead,
  children,
}: {
  /** Optional — /join drops it, since "Join" only restated the headline. */
  eyebrow?: string;
  /** ReactNode, not string: /members extrudes a word with DepthText. */
  title: ReactNode;
  /** Optional — omit on pages where the headline says enough. */
  lead?: ReactNode;
  /** Optional slot under the lead, e.g. buttons. */
  children?: ReactNode;
}) {
  return (
    <section className="pb-16 pt-24">
      <Container>
        {eyebrow ? (
          <p className="text-eyebrow font-semibold uppercase text-lime">{eyebrow}</p>
        ) : null}
        {/* The top margin belongs to the eyebrow, not the headline: without
            that guard, dropping the eyebrow leaves its 24px behind. */}
        <h1
          className={`max-w-[18ch] font-display text-[clamp(40px,6.4vw,88px)] font-bold leading-none tracking-[-0.02em] ${eyebrow ? 'mt-6' : ''}`}
        >
          {title}
        </h1>
        {lead ? (
          <p className="mt-7 max-w-[720px] text-lead text-secondary">{lead}</p>
        ) : null}
        {children}
      </Container>
    </section>
  );
}
