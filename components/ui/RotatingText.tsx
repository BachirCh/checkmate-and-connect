'use client';

import { useMemo } from 'react';
import { AnimatePresence, motion, type Transition, type Variants } from 'motion/react';

/**
 * A single word slot that swaps its text with a per-character slide.
 *
 * Controlled rather than self-rotating: the parent owns the index. Two slots in
 * one sentence have to change on the same tick, and two independent timers drift
 * apart within a few cycles.
 *
 * The characters animate through variants inherited from the keyed wrapper
 * rather than each carrying their own initial/animate/exit, so the stagger is
 * orchestrated by `staggerChildren` on both the enter and the exit instead of
 * per-character delay arithmetic.
 *
 * `layout` on the outer span animates the slot's width as phrases of different
 * lengths swap in, so the words either side slide rather than jump. The slot
 * clips its own overflow: characters enter from below the baseline and leave
 * above it, and without the clip they are visible travelling past the line.
 */

// Softer than the stock spring so the characters travel at a readable pace.
// Total swap is exit + enter (AnimatePresence waits), so this has to settle
// comfortably inside the caller's rotation interval.
const SPRING: Transition = { type: 'spring', damping: 24, stiffness: 170 };

const CHAR: Variants = {
  enter: { y: '100%', opacity: 0 },
  center: { y: 0, opacity: 1 },
  exit: { y: '-120%', opacity: 0 },
};

export function RotatingText({
  texts,
  index,
  staggerDuration = 0.015,
  className,
  /** Skip the motion entirely and just render the current text. */
  still = false,
}: {
  texts: string[];
  index: number;
  staggerDuration?: number;
  className?: string;
  still?: boolean;
}) {
  const current = texts[index % texts.length] ?? '';

  // Split to graphemes, not code units, so an accent or emoji stays whole.
  const words = useMemo(() => {
    const toChars = (word: string) =>
      typeof Intl !== 'undefined' && 'Segmenter' in Intl
        ? Array.from(
            new Intl.Segmenter('en', { granularity: 'grapheme' }).segment(word),
            (s) => s.segment
          )
        : Array.from(word);

    return current.split(' ').map((word, i, all) => ({
      chars: toChars(word),
      space: i !== all.length - 1,
    }));
  }, [current]);

  if (still) {
    return <span className={className}>{current}</span>;
  }

  const group: Variants = {
    enter: {},
    center: { transition: { staggerChildren: staggerDuration } },
    exit: { transition: { staggerChildren: staggerDuration } },
  };

  return (
    <motion.span
      layout
      transition={SPRING}
      className={`inline-flex overflow-hidden whitespace-pre-wrap align-bottom ${className ?? ''}`}
    >
      {/* The animated copy is aria-hidden, so this carries the text for AT. */}
      <span className="sr-only">{current}</span>

      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={index}
          aria-hidden
          className="inline-flex"
          variants={group}
          initial="enter"
          animate="center"
          exit="exit"
        >
          {words.map((word, wordIndex) => (
            <span key={wordIndex} className="inline-flex">
              {word.chars.map((char, charIndex) => (
                <motion.span
                  key={charIndex}
                  variants={CHAR}
                  transition={SPRING}
                  className="inline-block"
                >
                  {char}
                </motion.span>
              ))}
              {word.space ? <span className="whitespace-pre"> </span> : null}
            </span>
          ))}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  );
}
