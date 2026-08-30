import type { CSSProperties } from 'react';
import './GlitchText.css';

/**
 * GlitchText from React Bits (JS + CSS variant), typed and rendered as a
 * <span> so it can sit inside a heading. It is CSS-only — no state, no
 * effects — so it stays a server component.
 *
 * The default shadows are white and lime rather than the upstream red/cyan:
 * the brand is black, white and one accent, and an RGB split would be the
 * only two off-palette colours on the page.
 */
type GlitchTextProps = {
  children: string;
  /** Multiplier for the animation speed. Higher is slower. */
  speed?: number;
  /** Toggle the coloured shadows on the glitch pseudo-elements. */
  enableShadows?: boolean;
  /** When true, the glitch only runs on hover. */
  enableOnHover?: boolean;
  className?: string;
};

export function GlitchText({
  children,
  speed = 1,
  enableShadows = true,
  enableOnHover = true,
  className = '',
}: GlitchTextProps) {
  const inlineStyles = {
    '--after-duration': `${speed * 3}s`,
    '--before-duration': `${speed * 2}s`,
    '--after-shadow': enableShadows ? '-0.06em 0 var(--color-ink)' : 'none',
    '--before-shadow': enableShadows ? '0.06em 0 var(--color-lime)' : 'none',
  } as CSSProperties;

  return (
    <span
      className={`glitch ${enableOnHover ? 'enable-on-hover' : ''} ${className}`.trim()}
      style={inlineStyles}
      data-text={children}
    >
      {children}
    </span>
  );
}

export default GlitchText;
