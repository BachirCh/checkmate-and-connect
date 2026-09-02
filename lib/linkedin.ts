/**
 * LinkedIn link handling, shared by /join and /speak.
 *
 * People paste what they see in the address bar, which is usually
 * `linkedin.com/in/name` with the scheme and often the `www.` stripped by the
 * browser. Both forms accept that, and both normalise before storing.
 *
 * Normalising is not cosmetic: a stored value with no scheme is a *relative*
 * href, so `<a href="linkedin.com/in/name">` on the members grid would resolve
 * to checkmate.ma/linkedin.com/in/name. The Sanity `url` field also validates
 * for an http(s) scheme and would reject a bare domain.
 */

/**
 * Optional scheme, optional subdomain, then linkedin.com and a path.
 *
 * The subdomain group has to end in a dot so `notlinkedin.com/x` cannot match:
 * without it, any domain ending in "linkedin.com" would pass.
 */
const LINKEDIN = /^(?:https?:\/\/)?(?:[a-z0-9-]+\.)?linkedin\.com\/\S+$/i;

export function isLinkedInUrl(value: string): boolean {
  return LINKEDIN.test(value.trim());
}

/** Add the scheme when the person left it off. Returns '' for empty input. */
export function normaliseLinkedIn(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export const LINKEDIN_ERROR = 'Please paste a linkedin.com link.';
