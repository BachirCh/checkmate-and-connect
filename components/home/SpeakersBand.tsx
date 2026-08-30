import { Container } from '@/components/ui/Container';
import { cloudinarySrcSet, cloudinaryUrl, type CloudinaryAsset } from '@/lib/cloudinary/url';

export type Logo = {
  _id: string;
  name: string;
  url?: string;
  image: CloudinaryAsset;
};

/**
 * Speakers / partners band.
 *
 * Renders exactly what is in the CMS — never a template placeholder, since a
 * logo here reads as a claim of association. The grid centres itself and wraps,
 * so any count from three upwards looks deliberate rather than unfinished.
 *
 * Masters live in assets/logos/ as white-on-transparent PNGs: the canvas is
 * #0a0a0a, so a logo supplied in its brand colours disappears into it.
 */
export default function SpeakersBand({ logos }: { logos: Logo[] }) {
  if (logos.length === 0) return null;

  return (
    <section className="py-10" aria-labelledby="speakers-heading">
      <Container>
        <h2
          id="speakers-heading"
          className="mx-auto max-w-[520px] text-center font-sans text-lead font-normal text-ink"
        >
          Bringing Morocco&rsquo;s best speakers. From established enterprises
          to next-gen startups.
        </h2>

        {/*
          Capped at four logos per row: 4 × 152px + 3 × 24px of gap. Wrapping
          rather than a fixed grid, so a short last row still centres itself
          instead of leaving a hole where the empty cells would be.
        */}
        <ul className="mx-auto mt-12 flex max-w-[680px] flex-wrap items-center justify-center gap-x-6 gap-y-8">
          {logos.map((logo) => {
            const src = cloudinaryUrl(logo.image, { width: 152 });
            if (!src) return null;

            const img = (
              <img
                src={src}
                srcSet={cloudinarySrcSet(logo.image, { width: 152 })}
                alt={logo.name}
                width={152}
                height={47}
                loading="lazy"
                decoding="async"
                className="h-[47px] w-[152px] object-contain opacity-80 transition-opacity hover:opacity-100"
              />
            );

            return (
              <li key={logo._id}>
                {logo.url ? (
                  <a
                    href={logo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-badge focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime"
                  >
                    {img}
                  </a>
                ) : (
                  img
                )}
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
