import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

/**
 * Pill buttons, per GL 11 (radius: pill) and GL 07 (lime = action only).
 *
 * Primary is the lime fill with near-black type — the only place lime becomes
 * a surface, and only because it *is* the action. Secondary is a hairline
 * outline. Both are 48px tall to match the Figma nav and hero.
 */

const BASE =
  'inline-flex h-12 items-center justify-center gap-2 rounded-pill px-7 text-ui font-sans whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime';

const VARIANTS = {
  primary: 'bg-lime text-canvas font-semibold hover:bg-lime/90',
  secondary:
    'border border-line text-ink font-medium hover:border-ink/40 hover:bg-raised',
} as const;

type Variant = keyof typeof VARIANTS;

/** Same pill as ButtonLink, for anything that has to be a real <button>. */
export function buttonClass(variant: Variant = 'primary', className?: string) {
  return `${BASE} ${VARIANTS[variant]} ${className ?? ''}`;
}

type ButtonLinkProps = {
  variant?: Variant;
  children: ReactNode;
  className?: string;
} & Omit<ComponentProps<typeof Link>, 'className'>;

export function ButtonLink({
  variant = 'primary',
  children,
  className,
  href,
  ...rest
}: ButtonLinkProps) {
  const external = typeof href === 'string' && href.startsWith('http');

  return (
    <Link
      href={href}
      className={`${BASE} ${VARIANTS[variant]} ${className ?? ''}`}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...rest}
    >
      {children}
    </Link>
  );
}

type ButtonProps = {
  variant?: Variant;
  children: ReactNode;
} & ComponentProps<'button'>;

export function Button({
  variant = 'primary',
  children,
  className,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button type={type} className={buttonClass(variant, className)} {...rest}>
      {children}
    </button>
  );
}
