'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from './Icon';

/**
 * Horizontal carousel with a heading row and prev/next controls.
 *
 * Built on native scroll-snap (see `.carousel` in globals.css) rather than a
 * carousel library. Native scrolling means touch, trackpad, keyboard and
 * screen readers all work without us reimplementing them, and it keeps the
 * client bundle to this one small component — which matters against the
 * Worker's 3 MiB ceiling.
 *
 * The heading lives here rather than in the parent because the controls sit
 * beside it, and only this component knows whether they should be disabled.
 * Children are server-rendered and pass straight through.
 *
 * Arrows scroll by exactly one card, so snap points always line up.
 */

type CarouselProps = {
  children: React.ReactNode;
  heading: string;
  headingId: string;
  /** Accessible name for the scrollable region, e.g. "testimonials". */
  label: string;
  /** Applied to the scrolling track. */
  trackClassName?: string;
};

export function Carousel({
  children,
  heading,
  headingId,
  label,
  trackClassName,
}: CarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [overflows, setOverflows] = useState(false);

  const sync = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setOverflows(max > 1);
    setAtStart(el.scrollLeft <= 1);
    setAtEnd(el.scrollLeft >= max - 1);
  }, []);

  useEffect(() => {
    sync();
    const el = trackRef.current;
    if (!el) return;
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    return () => observer.disconnect();
  }, [sync]);

  const step = useCallback((direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    // Distance from one card's left edge to the next, gap included
    const first = el.firstElementChild as HTMLElement | null;
    const second = el.children[1] as HTMLElement | undefined;
    const delta =
      first && second
        ? second.offsetLeft - first.offsetLeft
        : (first?.offsetWidth ?? el.clientWidth);
    el.scrollBy({ left: delta * direction, behavior: 'smooth' });
  }, []);

  return (
    <>
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-6 px-6 md:px-10 lg:px-[120px]">
        <h2
          id={headingId}
          className="font-display text-[clamp(32px,5vw,48px)] font-bold leading-[1.125] tracking-[-0.02em]"
        >
          {heading}
        </h2>

        {overflows ? (
          <div className="hidden shrink-0 gap-3 sm:flex">
            <NavButton
              direction="prev"
              disabled={atStart}
              onClick={() => step(-1)}
              label={`Previous ${label}`}
            />
            <NavButton
              direction="next"
              disabled={atEnd}
              onClick={() => step(1)}
              label={`Next ${label}`}
            />
          </div>
        ) : null}
      </div>

      <div
        ref={trackRef}
        onScroll={sync}
        className={`carousel mt-11 ${trackClassName ?? ''}`}
        role="region"
        aria-label={label}
        tabIndex={0}
      >
        {children}
      </div>
    </>
  );
}

function NavButton({
  direction,
  disabled,
  onClick,
  label,
}: {
  direction: 'prev' | 'next';
  disabled: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="grid h-12 w-12 place-items-center rounded-pill border border-line text-ink transition-colors hover:border-ink/40 hover:bg-raised disabled:opacity-30 disabled:hover:border-line disabled:hover:bg-transparent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
    >
      <Icon name={direction === 'prev' ? 'caret-left' : 'caret-right'} size={18} />
    </button>
  );
}
