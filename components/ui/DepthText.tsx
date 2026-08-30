'use client';

import { useEffect, useMemo, useRef, type CSSProperties } from 'react';
import './DepthText.css';

/**
 * DepthText: an extruded 3D word built from stacked, receding copies of the
 * text, tilted by pointer position with a slow ambient orbit as a fallback.
 *
 * Adapted from the upstream component for inline use inside a headline rather
 * than as a standalone display block. Departures, all forced by that context:
 *
 *   1. Typography is inherited, not declared. Upstream hardcodes its own
 *      font-size / weight / line-height / letter-spacing; inside our <h1>
 *      that would break the baseline and the tracking of the words either
 *      side of it. The `fontSize` and `fontWeight` props are gone with it.
 *   2. `depthUnit` is new. Upstream measures extrusion in px, but our h1 is
 *      clamp(40px, 6.4vw, 88px): a fixed px extrusion that reads correctly at
 *      88px is ~30% of the glyph height at 40px, which collides with the line
 *      below. Passing 'em' makes the extrusion scale with the type.
 *   3. `user-select: none` applies only to the depth layers, so the headline
 *      still copies as one clean sentence.
 *   4. The rAF loop pauses when the word scrolls out of view. Upstream runs
 *      it forever; this sits in a hero that is off-screen for most of the
 *      page, and on touch devices (no pointer tracking) it would otherwise
 *      orbit permanently on the weakest hardware. The pause is fail-safe: the
 *      loop starts on its own and the observer only ever stops it.
 *
 * Only the face carries the text for assistive tech; every depth layer is
 * aria-hidden, so the <h1> still reads as a single sentence.
 */

const MAX_LAYERS = 64;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const getLayerColor = (
  faceColor: string,
  depthColor: string,
  index: number,
  total: number
) => {
  const progress = total <= 1 ? 1 : index / total;
  const eased = progress * progress;
  const faceMix = Math.round((1 - eased) * 72 + 4);
  return `color-mix(in srgb, ${faceColor} ${faceMix}%, ${depthColor})`;
};

const getTransform = (rotateX: number, rotateY: number) =>
  `rotateX(${rotateX.toFixed(3)}deg) rotateY(${rotateY.toFixed(3)}deg)`;

type DepthTextProps = {
  text: string;
  /** Number of stacked copies behind the face. Clamped to 2..64. */
  layers?: number;
  /** Spacing between layers, in `depthUnit`. */
  depth?: number;
  /** 'em' scales the extrusion with the inherited font size. */
  depthUnit?: 'px' | 'em';
  faceColor?: string;
  depthColor?: string;
  /** Maximum tilt in degrees, for both pointer tracking and the orbit. */
  tilt?: number;
  pointerTracking?: boolean;
  smoothing?: number;
  perspective?: number;
  autoOrbit?: boolean;
  orbitSpeed?: number;
  shadow?: boolean;
  className?: string;
  style?: CSSProperties;
};

export function DepthText({
  text,
  layers = 28,
  depth = 0.026,
  depthUnit = 'em',
  faceColor = 'var(--color-lime)',
  depthColor = 'color-mix(in srgb, var(--color-lime) 20%, var(--color-canvas))',
  tilt = 6,
  pointerTracking = true,
  smoothing = 0.14,
  perspective = 900,
  autoOrbit = true,
  orbitSpeed = 0.12,
  shadow = false,
  className = '',
  style = {},
}: DepthTextProps) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const stageRef = useRef<HTMLSpanElement>(null);

  const safeLayers = clamp(Math.round(Number(layers) || 1), 2, MAX_LAYERS);
  const safeDepth = Math.max(Number(depth) || 0, 0);
  const safeTilt = clamp(Number(tilt) || 0, 0, 12);
  const safeSmoothing = clamp(Number(smoothing) || 0.14, 0.02, 0.35);
  const safePerspective = clamp(Number(perspective) || 900, 300, 2000);
  const safeOrbitSpeed = clamp(Number(orbitSpeed) || 0, 0, 2);

  const baseRotation = useMemo(
    () => ({ x: -safeTilt * 0.32, y: safeTilt * 0.42 }),
    [safeTilt]
  );

  const depthLayers = useMemo(
    () =>
      Array.from({ length: safeLayers }, (_, layerIndex) => {
        const index = safeLayers - layerIndex;
        return {
          index,
          color: getLayerColor(faceColor, depthColor, index, safeLayers),
          transform: `translateZ(${-(index * safeDepth).toFixed(4)}${depthUnit})`,
        };
      }),
    [safeLayers, safeDepth, depthUnit, faceColor, depthColor]
  );

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    if (!root || !stage) return undefined;

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const finePointer = window.matchMedia(
      '(hover: hover) and (pointer: fine)'
    ).matches;
    const canTrackPointer = pointerTracking && finePointer && !reducedMotion;

    if (reducedMotion) {
      stage.style.transform = getTransform(baseRotation.x, baseRotation.y);
      return undefined;
    }

    let frameId = 0;
    let activePointer = false;
    let startTime = performance.now();
    const current = { ...baseRotation };
    const target = { ...baseRotation };

    const applyTransform = () => {
      stage.style.transform = getTransform(current.x, current.y);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      activePointer = true;
      const x = clamp(
        (event.clientX - (rect.left + rect.width / 2)) / (rect.width * 0.8),
        -1,
        1
      );
      const y = clamp(
        (event.clientY - (rect.top + rect.height / 2)) / (rect.height * 0.8),
        -1,
        1
      );

      target.x = baseRotation.x - y * safeTilt;
      target.y = baseRotation.y + x * safeTilt;
    };

    const handlePointerLeave = () => {
      activePointer = false;
      target.x = baseRotation.x;
      target.y = baseRotation.y;
    };

    if (canTrackPointer) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerleave', handlePointerLeave);
      window.addEventListener('blur', handlePointerLeave);
    }

    const tick = (now: number) => {
      if ((!canTrackPointer || !activePointer) && autoOrbit) {
        const elapsed = (now - startTime) / 1000;
        const orbit = elapsed * safeOrbitSpeed * Math.PI * 2;
        const fallbackAmount = canTrackPointer ? 0.18 : 0.55;
        target.x = baseRotation.x + Math.sin(orbit) * safeTilt * fallbackAmount;
        target.y =
          baseRotation.y + Math.cos(orbit * 0.85) * safeTilt * fallbackAmount;
      }

      current.x += (target.x - current.x) * safeSmoothing;
      current.y += (target.y - current.y) * safeSmoothing;
      applyTransform();
      frameId = requestAnimationFrame(tick);
    };

    const start = () => {
      if (frameId) return;
      // Re-base the clock so the orbit resumes from its start rather than
      // jumping to wherever it would have been while paused.
      startTime = performance.now();
      frameId = requestAnimationFrame(tick);
    };

    const stop = () => {
      if (!frameId) return;
      cancelAnimationFrame(frameId);
      frameId = 0;
    };

    applyTransform();

    // Start unconditionally, then let the observer pause the loop while the
    // word is off screen. Deliberately not the other way round: gating the
    // start on the observer would leave the word frozen for good anywhere
    // IntersectionObserver is missing or slow to deliver its first callback,
    // whereas this way the worst case is simply upstream's always-on loop.
    start();

    const observer =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(([entry]) =>
            entry.isIntersecting ? start() : stop()
          );
    observer?.observe(root);

    return () => {
      observer?.disconnect();
      stop();
      if (canTrackPointer) {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerleave', handlePointerLeave);
        window.removeEventListener('blur', handlePointerLeave);
      }
    };
  }, [
    autoOrbit,
    baseRotation,
    pointerTracking,
    safeOrbitSpeed,
    safeSmoothing,
    safeTilt,
  ]);

  const rootStyle = {
    ...style,
    '--depth-text-perspective': `${safePerspective}px`,
    '--depth-text-face-color': faceColor,
    '--depth-text-shadow': shadow
      ? `0 22px 34px color-mix(in srgb, ${depthColor} 36%, transparent), 0 4px 8px rgba(0, 0, 0, 0.28)`
      : 'none',
  } as CSSProperties;

  return (
    <span ref={rootRef} className={`depth-text ${className}`.trim()} style={rootStyle}>
      <span ref={stageRef} className="depth-text__stage">
        {depthLayers.map((layer) => (
          <span
            aria-hidden="true"
            className="depth-text__layer"
            key={layer.index}
            data-text={text}
            style={{ color: layer.color, transform: layer.transform }}
          />
        ))}
        <span className="depth-text__face">{text}</span>
      </span>
    </span>
  );
}

export default DepthText;
