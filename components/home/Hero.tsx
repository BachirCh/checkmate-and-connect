import { MessageUsButton } from '@/components/MessageUs';
import { DepthText } from '@/components/ui/DepthText';
import { HeroCarousel, type HeroSlide } from './HeroCarousel';
import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Icon } from '@/components/ui/Icon';
import { site } from '@/lib/site';

/**
 * Placeholder frames pending final picks. Each is a 2.6:1 centre crop of an
 * original camera file, pre-sized at 1200 and 2400 so the browser never asks
 * the Worker to resize anything.
 */
const SLIDES: HeroSlide[] = [
  {
    src: '/img/hero-1-1200.webp',
    src2x: '/img/hero-1-2400.webp',
    alt: 'Members of Checkmate & Connect gathered under the pendant lights at Commons Zerktouni, holding certificates at the end of a hackathon.',
  },
  {
    src: '/img/hero-2-1200.webp',
    src2x: '/img/hero-2-2400.webp',
    alt: 'A packed room of founders and builders standing and talking during a Checkmate & Connect event.',
  },
  {
    src: '/img/hero-3-1200.webp',
    src2x: '/img/hero-3-2400.webp',
    alt: 'A seated audience listening to a talk at a Checkmate & Connect event in Casablanca.',
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
  { value: site.stats.price, label: 'no ticket, no pitch' },
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

        <div className="mt-10 flex flex-col gap-3.5 sm:flex-row">
          <ButtonLink href={site.social.linkedin}>Follow on LinkedIn</ButtonLink>
          <MessageUsButton />
        </div>

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
