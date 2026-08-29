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
 * Renders exactly what is in the CMS. The Figma artboard shows twelve slots,
 * but nine of those were template placeholders for companies with no relation
 * to C&C — publishing them would be a false claim of association. The grid
 * centres itself so three logos look deliberate rather than unfinished, and
 * grows to six-up as real ones are added.
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
          Bringing Morocco&rsquo;s best speakers. From next-gen startups to
          established enterprises.
        </h2>

        <ul className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-8">
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
