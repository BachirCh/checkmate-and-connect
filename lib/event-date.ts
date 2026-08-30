import { formatMeetupDate } from '@/lib/site';

/**
 * The DDMMYY slug used in feedback form URLs — /feedback/020926.
 *
 * Six digits because the link gets read off a slide and typed on a phone in a
 * noisy room. Day-first matches how the date is said out loud in Casablanca,
 * and two-digit years are unambiguous for a weekly meetup: nothing here is
 * dated before 2000 or after 2099.
 */

/** '2026-09-02' -> '020926' */
export function toEventSlug(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  return `${day}${month}${year.slice(2)}`;
}

/**
 * '020926' -> '2026-09-02', or null if it is not a real date.
 *
 * The round-trip check is what rejects '310226': Date.UTC rolls an overflowing
 * day into the next month rather than failing, so 31 February silently becomes
 * 3 March unless the result is compared back against the input.
 */
export function parseEventSlug(slug: string): string | null {
  if (!/^\d{6}$/.test(slug)) return null;

  const day = Number(slug.slice(0, 2));
  const month = Number(slug.slice(2, 4));
  const year = 2000 + Number(slug.slice(4, 6));

  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date.toISOString().slice(0, 10);
}

/** '2026-09-02' -> 'Wednesday 2 September'. Midday UTC so no timezone can shift the day. */
export function formatEventDate(isoDate: string): string {
  return formatMeetupDate(new Date(`${isoDate}T12:00:00Z`));
}
