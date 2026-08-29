/**
 * The brand background shape.
 *
 * Two concentric quarter-arcs — a filled r=440 disc and a r=660→880 ring —
 * all struck from the *top-right* corner of the viewBox. That corner is the
 * origin the geometry radiates from, so placement means anchoring that corner
 * somewhere and letting the arcs sweep away from it.
 *
 * `origin` mirrors the shape rather than rotating it, which keeps the arc
 * weights identical in every placement.
 *
 * Purely decorative: always absolute, always inert, never announced. Callers
 * supply position, size and opacity; colour comes from `currentColor` so it
 * inherits `text-lime` instead of hardcoding the hex.
 */

const ORIGIN = {
  'top-right': '',
  'top-left': '-scale-x-100',
  'bottom-right': '-scale-y-100',
  'bottom-left': '-scale-100',
} as const;

export type MarkShapeOrigin = keyof typeof ORIGIN;

export function MarkShape({
  origin = 'top-right',
  className,
}: {
  /** Which corner the arcs radiate from. */
  origin?: MarkShapeOrigin;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 880 880"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={`pointer-events-none absolute ${ORIGIN[origin]} ${className ?? ''}`}
    >
      <path
        d="M880 880V660C704.957 660 537.084 590.464 413.31 466.69C289.535 342.916 220 175.043 220 -1.90735e-05H-1.90735e-05C-1.90735e-05 233.391 92.714 457.222 257.746 622.254C422.778 787.286 646.609 880 880 880Z"
        fill="currentColor"
      />
      <path
        d="M880 440V-9.53674e-06H440C440 116.695 486.357 228.611 568.873 311.127C651.389 393.643 763.305 440 880 440Z"
        fill="currentColor"
      />
    </svg>
  );
}
