import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { site } from '@/lib/site';

const STATS = [
  { value: site.stats.members, label: 'members' },
  { value: site.stats.cadence, label: 'every Wednesday, 18:00' },
  { value: site.stats.price, label: 'no ticket, no pitch' },
  { value: site.stats.venue, label: 'Casablanca' },
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
          Your next move starts here
        </h1>

        <p className="mt-7 max-w-[720px] text-lead text-secondary">
          {site.description}
        </p>

        <div className="mt-10">
          <ButtonLink href={site.social.linkedin}>Follow us on LinkedIn</ButtonLink>
        </div>

        {/*
          Plain <img> rather than next/image: the asset is pre-sized at build
          (see scripts/), which avoids routing every request through the Next
          image optimizer on a Cloudflare Worker. Two widths cover 1x and 2x.
        */}
        <img
          src="/img/hero-1200.webp"
          srcSet="/img/hero-1200.webp 1200w, /img/hero-2400.webp 2400w"
          sizes="(max-width: 1440px) calc(100vw - 48px), 1200px"
          width={1200}
          height={460}
          alt="Members of Checkmate & Connect gathered under the pendant lights at Commons Zerktouni, holding certificates at the end of a hackathon."
          fetchPriority="high"
          decoding="async"
          className="mt-16 aspect-[1200/460] w-full rounded-media object-cover"
        />

        <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <span className="block font-display text-stat font-semibold tracking-[-0.01em] text-ink">
                  {stat.value}
                </span>
                <span className="mt-1.5 block text-caption text-muted">
                  {stat.label}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
