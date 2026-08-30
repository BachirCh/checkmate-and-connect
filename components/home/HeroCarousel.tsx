'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Auto-advancing hero carousel.
 *
 * No arrows by request — position and progress are carried entirely by the
 * segmented line timer at the bottom, one segment per slide, the active one
 * filling over the slide duration.
 *
 * Those segments are real buttons rather than decorative bars. Content that
 * animates on its own needs some way for a person to take control of it
 * (WCAG 2.2.2), and with the arrows gone these are the only affordance left.
 * Auto-advance also pauses on hover, on keyboard focus, and while the tab is
 * hidden — the last one stops a pile of queued transitions firing the moment
 * someone comes back.
 *
 * Under `prefers-reduced-motion` nothing moves by itself and the slide
 * transition is dropped; the buttons still work.
 */

export type HeroSlide = {
  /** 1x source, 1200x460. */
  src: string;
  /** 2x source, 2400x920. */
  src2x: string;
  alt: string;
};

const DURATION_MS = 6000;

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  // Two independent reasons to hold: the pointer/focus is inside, or the tab
  // is in the background. They were one boolean at first, which meant a
  // visibilitychange could clear a hover pause out from under the user.
  const [engaged, setEngaged] = useState(false);
  const [backgrounded, setBackgrounded] = useState(false);
  const [reduced, setReduced] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
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
  const release = useCallback(() => {
    // Keep paused while focus is still somewhere inside the carousel.
    const active = document.activeElement;
    if (rootRef.current && active && rootRef.current.contains(active)) return;
    setEngaged(false);
  }, []);

  return (
    <div
      ref={rootRef}
      role="group"
      aria-roledescription="carousel"
      aria-label="Photos from recent Checkmate & Connect events"
      className="relative mt-16 overflow-hidden rounded-media"
      onMouseEnter={hold}
      onMouseLeave={release}
      onFocus={hold}
      onBlur={release}
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
            height={460}
            alt={slide.alt}
            // The first frame is the page's LCP element; the rest can wait.
            fetchPriority={i === 0 ? 'high' : 'low'}
            loading={i === 0 ? 'eager' : 'lazy'}
            decoding="async"
            aria-hidden={i !== index}
            className="aspect-[1200/460] w-full shrink-0 object-cover"
          />
        ))}
      </div>

      {slides.length > 1 ? (
        /*
          The segments sit on a dark blurred pill. Without it the timer reads
          fine on dark frames and is nearly invisible on bright ones, and it
          is the only progress affordance the carousel has.
        */
        <div className="absolute inset-x-0 bottom-5 flex justify-center">
          <div className="flex items-center gap-2 rounded-pill bg-canvas/55 px-3 py-1.5 backdrop-blur-sm">
            {slides.map((slide, i) => (
              <button
                key={slide.src}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show photo ${i + 1} of ${slides.length}`}
                aria-current={i === index}
                className="group h-5 w-10 px-0 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
              >
                <span className="block h-1 w-full overflow-hidden rounded-pill bg-ink/30 group-hover:bg-ink/50">
                  <span
                    // Remounting on slide change restarts the fill animation.
                    key={`${i === index}-${index}`}
                    className="block h-full w-full origin-left rounded-pill bg-ink"
                    style={
                      i === index
                        ? {
                            animation: reduced
                              ? 'none'
                              : `hero-timer ${DURATION_MS}ms linear forwards`,
                            animationPlayState: paused ? 'paused' : 'running',
                            transform: reduced ? 'scaleX(1)' : undefined,
                          }
                        : { transform: 'scaleX(0)' }
                    }
                  />
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
