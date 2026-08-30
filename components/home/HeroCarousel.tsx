'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Auto-advancing hero carousel.
 *
 * No arrows and no per-slide segments by request: advancing is automatic only,
 * and the single bar at the bottom is a decorative timer for the current slide
 * rather than a control. Auto-advance still pauses on hover and while the tab
 * is hidden — the latter stops a pile of queued transitions firing the moment
 * someone comes back.
 *
 * Under `prefers-reduced-motion` nothing moves by itself: the slide transition
 * is dropped and the carousel holds on the first frame.
 *
 * ACCESSIBILITY: with the segments gone there is no longer a control to pause
 * or step the carousel, which WCAG 2.2.2 (Pause, Stop, Hide) asks for on
 * content that animates for more than five seconds. The reduced-motion path
 * covers the people most affected and hover covers pointer users, but touch
 * and keyboard users have no way to hold a frame. Restoring that needs a
 * visible control of some kind.
 */

export type HeroSlide = {
  /** 1x source, 1200x800. */
  src: string;
  /** 2x source, 2400x920. */
  src2x: string;
  alt: string;
};

const DURATION_MS = 6000;

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  // Two independent reasons to hold: the pointer is inside, or the tab is in
  // the background. They were one boolean at first, which meant a
  // visibilitychange could clear a hover pause out from under the user.
  const [engaged, setEngaged] = useState(false);
  const [backgrounded, setBackgrounded] = useState(false);
  const [reduced, setReduced] = useState(false);
  const paused = engaged || backgrounded;

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  // Don't advance in a background tab.
  useEffect(() => {
    const onVisibility = () => setBackgrounded(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  useEffect(() => {
    if (reduced || paused || slides.length < 2) return;
    const id = window.setTimeout(
      () => setIndex((i) => (i + 1) % slides.length),
      DURATION_MS
    );
    return () => window.clearTimeout(id);
  }, [index, paused, reduced, slides.length]);

  const hold = useCallback(() => setEngaged(true), []);
  const release = useCallback(() => setEngaged(false), []);

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label="Photos from recent Checkmate & Connect events"
      className="relative mt-16 overflow-hidden rounded-media"
      onMouseEnter={hold}
      onMouseLeave={release}
    >
      <div
        className="flex"
        style={{
          transform: `translate3d(-${index * 100}%, 0, 0)`,
          transition: reduced ? 'none' : 'transform 700ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {slides.map((slide, i) => (
          <img
            key={slide.src}
            src={slide.src}
            srcSet={`${slide.src} 1200w, ${slide.src2x} 2400w`}
            sizes="(max-width: 1440px) calc(100vw - 48px), 1200px"
            width={1200}
            height={800}
            alt={slide.alt}
            // The first frame is the page's LCP element; the rest can wait.
            fetchPriority={i === 0 ? 'high' : 'low'}
            loading={i === 0 ? 'eager' : 'lazy'}
            decoding="async"
            aria-hidden={i !== index}
            // One ratio at every width: the sources are 3:2 frames, so a
            // breakpoint override here would crop the photo rather than
            // reveal more of it.
            className="aspect-[3/2] w-full shrink-0 object-cover"
          />
        ))}
      </div>

      {slides.length > 1 ? (
        /*
          One bar, no pill behind it. It carries progress through the current
          slide only — not position in the set — and is inert, so it is hidden
          from assistive tech rather than announced as a control.

          The pill used to supply the contrast that keeps the bar readable on a
          bright frame. A drop-shadow does that job instead: it follows the
          rounded shape rather than boxing it, and it costs nothing on the dark
          frames where the bar already reads.
        */
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-5 flex justify-center drop-shadow-[0_1px_3px_rgba(0,0,0,0.75)]"
        >
          <span className="block h-1 w-24 overflow-hidden rounded-pill bg-ink/25">
            <span
              // Remounting on slide change restarts the drain.
              key={index}
              className="block h-full w-full origin-left rounded-pill bg-ink"
              style={{
                animation: reduced
                  ? 'none'
                  : `hero-timer ${DURATION_MS}ms linear forwards`,
                animationPlayState: paused ? 'paused' : 'running',
                transform: reduced ? 'scaleX(1)' : undefined,
              }}
            />
          </span>
        </div>
      ) : null}
    </div>
  );
}
