'use client';

import { useEffect, useState } from 'react';
import { RotatingText } from '@/components/ui/RotatingText';

/**
 * The speakers band headline: "From <a> to <b>." with both halves rotating.
 *
 * One interval drives both slots, so they always change on the same tick — two
 * self-rotating components drift apart within a few cycles.
 *
 * Under `prefers-reduced-motion` the pairs stop rotating and the first one is
 * rendered as plain text. Text that swaps itself every few seconds is the
 * moving-content case WCAG 2.2.2 covers, and there is no control here to pause
 * it; holding still is the honest answer for anyone who has asked for less
 * motion.
 */

/** Read as "From {0} to {1}." — both halves swap together. */
const PAIRS: [string, string][] = [
  ['established enterprises', 'next-gen startups'],
  ['Tanja', 'Lagouira'],
  ['heart', 'heart'],
  ['who made it', 'those making it'],
  ['the community, back', 'the community'],
];

// Time from one swap starting to the next. A swap is exit + enter and runs
// roughly 1.8s of this, so the phrase holds still for the remainder — raise
// this, not the spring, to give people longer to read it.
const INTERVAL_MS = 4000;

const FROMS = PAIRS.map(([from]) => from);
const TOS = PAIRS.map(([, to]) => to);

export function SpeakersHeadline({ id }: { id: string }) {
  const [index, setIndex] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [backgrounded, setBackgrounded] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  // A hidden tab throttles rAF to nothing, so the swap animations cannot run,
  // but setInterval keeps firing — which queues a backlog that all churns
  // through the moment someone comes back. Same guard as HeroCarousel.
  useEffect(() => {
    const sync = () => setBackgrounded(document.hidden);
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => document.removeEventListener('visibilitychange', sync);
  }, []);

  useEffect(() => {
    if (reduced || backgrounded) return;
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % PAIRS.length),
      INTERVAL_MS
    );
    return () => window.clearInterval(id);
  }, [reduced, backgrounded]);

  return (
    <h2
      id={id}
      className="mx-auto max-w-[560px] text-center font-sans text-lead font-normal text-ink"
    >
      Bringing Morocco&rsquo;s best speakers.
      {/*
        The rotating half is its own line: it changes length on every tick, so
        sharing a line with the static sentence would reflow that sentence too.
      */}
      <span className="mt-1 block">
        <span className="text-secondary">From</span>{' '}
        <RotatingText texts={FROMS} index={index} still={reduced} className="text-lime" />{' '}
        <span className="text-secondary">to</span>{' '}
        <RotatingText texts={TOS} index={index} still={reduced} className="text-lime" />
        <span className="text-secondary">.</span>
      </span>
    </h2>
  );
}
