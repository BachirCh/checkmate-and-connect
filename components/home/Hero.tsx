import { DepthText } from '@/components/ui/DepthText';
import { HeroCarousel, type HeroSlide } from './HeroCarousel';
import { CtaPair } from '@/components/ui/CtaPair';
import { Container } from '@/components/ui/Container';
import { Icon } from '@/components/ui/Icon';
import { site } from '@/lib/site';

/**
 * Each is a 3:2 frame, pre-sized at 1200 and 2400 so the browser never asks
 * the Worker to resize anything.
 *
 * 3:2 is the camera's native ratio (4928x3264), so the slides now show close
 * to the whole frame instead of the 2.6:1 letterbox crop they shipped with.
 * Five of the six are exported straight from the crops in the C&C Figma file
 * (section "Section 1", frames image1-image5, 4096x2713) — that is the source
 * of truth for how each photo is framed, so re-cut from there, not from the
 * camera original, if one ever needs regenerating.
 */
const SLIDES: HeroSlide[] = [
  {
    src: '/img/hero-2-1200.webp',
    src2x: '/img/hero-2-2400.webp',
    alt: 'A packed room of founders and builders standing and talking during a Checkmate & Connect event.',
  },
  {
    src: '/img/hero-image1-1200.webp',
    src2x: '/img/hero-image1-2400.webp',
    alt: 'Members playing a game theory exercise on a whiteboard while a talk plays on the screen behind them.',
  },
  {
    src: '/img/hero-image2-1200.webp',
    src2x: '/img/hero-image2-2400.webp',
    alt: 'A member stacking a Jenga tower back together as a crowd watches and laughs.',
  },
  {
    src: '/img/hero-image3-1200.webp',
    src2x: '/img/hero-image3-2400.webp',
    alt: 'The Commons Zerktouni neon sign reading "Commons work wonders" on a plant wall.',
  },
  {
    src: '/img/hero-image4-1200.webp',
    src2x: '/img/hero-image4-2400.webp',
    alt: 'Checkmate & Connect branded water bottles lined up along the bar.',
  },
  {
    src: '/img/hero-image5-1200.webp',
    src2x: '/img/hero-image5-2400.webp',
    alt: 'A member smiling behind stacked meal boxes under pendant lights at Commons Zerktouni.',
  },
];

/**
 * `href` turns the caption into a link. The venue uses it to hand off to Maps —
 * on a phone the maps.app.goo.gl short link opens the Google Maps app directly.
 */
const STATS: {
  value: string;
  label: string;
  href?: string;
  /** Screen-reader term, where the visible caption does not describe the value. */
  term?: string;
}[] = [
  { value: site.stats.members, label: 'members' },
  { value: site.stats.cadence, label: 'every Wednesday, 18:00' },
  { value: site.stats.price, label: 'no ticket, no registration' },
  {
    value: site.stats.venue,
    label: 'Open in Maps',
    href: site.event.mapsUrl,
    term: 'venue',
  },
];

export default function Hero() {
  return (
    <section className="pb-24 pt-24">
      <Container>
        <p className="text-eyebrow font-semibold uppercase text-lime">
          Casablanca startup community
        </p>

        {/* No max-width: at 88px this sits on one line across the 1200px
            measure, exactly as in the artboard. It wraps naturally below ~1180px. */}
        <h1 className="mt-6 font-display text-[clamp(40px,6.4vw,88px)] font-bold leading-none tracking-[-0.02em]">
          Your next <DepthText text="move" /> starts here
        </h1>

        <p className="mt-7 max-w-[720px] text-lead text-secondary">
          {site.description}
        </p>

        <CtaPair className="mt-10" />

        <HeroCarousel slides={SLIDES} />

        <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <dt className="sr-only">{stat.term ?? stat.label}</dt>
              <dd>
                <span className="block font-display text-stat font-semibold tracking-[-0.01em] text-ink">
                  {stat.value}
                </span>
                {stat.href ? (
                  <a
                    href={stat.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 inline-flex items-center gap-1 text-caption text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime"
                  >
                    <span className="underline decoration-dashed underline-offset-4">
                      {stat.label}
                    </span>
                    <Icon name="arrow-up-right" size={14} className="shrink-0" />
                  </a>
                ) : (
                  <span className="mt-1.5 block text-caption text-muted">
                    {stat.label}
                  </span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
