import { MessageUsButton } from '@/components/MessageUs';
import { ButtonLink } from '@/components/ui/Button';

/**
 * The site's standard call to action: suggest a talk, or talk to an organiser.
 *
 * Extracted because the homepage hero, the closing band and /about all end the
 * same way. Three hand-copied pairs is how one of them ends up still pointing
 * at last quarter's campaign — the pair changed once already, from
 * "Follow on LinkedIn", and had to be found in four files to do it.
 *
 * The nav composes its own pair: the buttons there are sized to the bar on
 * desktop and go full-width in the drawer, so it shares the labels, not the layout.
 */
export function CtaPair({
  /** Spacing above the pair — it differs per section, so callers own it. */
  className,
  /** Centred inside the closing band, left-aligned everywhere else. */
  align = 'start',
}: {
  className?: string;
  align?: 'start' | 'center';
}) {
  return (
    <div
      className={`flex flex-col gap-3.5 sm:flex-row ${
        align === 'center' ? 'items-center justify-center' : ''
      } ${className ?? ''}`}
    >
      <ButtonLink href="/speak">Suggest a talk</ButtonLink>
      <MessageUsButton />
    </div>
  );
}
