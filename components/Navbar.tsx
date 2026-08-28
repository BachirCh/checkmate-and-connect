'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogoLink } from '@/components/brand/Logo';
import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { site } from '@/lib/site';

/**
 * Only routes that actually exist appear here.
 *
 * The Figma nav shows "Events" and "About"; /events was deleted and its
 * listings live on Meetup, so RSVP points there instead of to a page that
 * would duplicate — and go stale against — the real source.
 */
const LINKS = [
  { href: '/about', label: 'About' },
  { href: '/members', label: 'Members' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the drawer on navigation
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Don't let the page scroll behind an open drawer
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="relative z-50 border-b border-hairline bg-canvas">
      <Container>
        <nav
          className="flex h-24 items-center justify-between"
          aria-label="Primary"
        >
          <LogoLink />

          {/* Desktop */}
          <div className="hidden items-center gap-7 md:flex">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={pathname === link.href ? 'page' : undefined}
                className="text-ui font-medium text-secondary transition-colors hover:text-ink aria-[current=page]:text-ink"
              >
                {link.label}
              </Link>
            ))}
            <ButtonLink href={site.social.meetup} className="ml-2">
              RSVP
            </ButtonLink>
          </div>

          {/* Mobile */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="grid h-12 w-12 place-items-center rounded-pill border border-line md:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
          >
            <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
            <span aria-hidden className="relative block h-4 w-5">
              <span
                className={`absolute left-0 block h-0.5 w-5 bg-ink transition-transform ${open ? 'top-1/2 rotate-45' : 'top-0.5'}`}
              />
              <span
                className={`absolute left-0 block h-0.5 w-5 bg-ink transition-transform ${open ? 'top-1/2 -rotate-45' : 'bottom-0.5'}`}
              />
            </span>
          </button>
        </nav>
      </Container>

      {open ? (
        <div
          id="mobile-menu"
          className="absolute inset-x-0 top-full border-b border-hairline bg-canvas md:hidden"
        >
          <Container className="flex flex-col gap-6 py-8">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-display text-3xl font-bold tracking-[-0.02em] text-ink"
              >
                {link.label}
              </Link>
            ))}
            <ButtonLink href={site.social.meetup} className="mt-2 w-full">
              RSVP on Meetup
            </ButtonLink>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
