/**
 * The four member roles.
 *
 * One source of truth on purpose: the value is stored in Sanity, offered in the
 * /join dropdown, validated server-side and used to pick the card artwork on
 * /members. Four separate lists would drift, and a role that exists in the
 * dropdown but not in the art map renders an empty card.
 *
 * Artwork is the halftone chess-piece set — one piece per role, on its own
 * brand colour. Stored as static webp in public/img rather than as CMS assets:
 * the pieces belong to the design system, not to any member's submission.
 */
export const ROLES = [
  { value: 'builder', label: 'Builder', piece: 'knight' },
  { value: 'creative', label: 'Creative', piece: 'bishop' },
  { value: 'investor', label: 'Investor', piece: 'queen' },
  { value: 'founder', label: 'Founder', piece: 'rook' },
] as const;

export type Role = (typeof ROLES)[number]['value'];

export const ROLE_VALUES = ROLES.map((r) => r.value) as readonly Role[];

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLE_VALUES as readonly string[]).includes(value);
}

export function roleLabel(role: Role): string {
  return ROLES.find((r) => r.value === role)?.label ?? role;
}

/** 1x and 2x sources for a role's card artwork. */
export function roleArt(role: Role) {
  return {
    src: `/img/role-${role}-560.webp`,
    srcSet: `/img/role-${role}-560.webp 1x, /img/role-${role}-1120.webp 2x`,
  };
}
