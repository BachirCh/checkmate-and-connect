import { Carousel } from '@/components/ui/Carousel';
import { cloudinarySrcSet, cloudinaryUrl, type CloudinaryAsset } from '@/lib/cloudinary/url';

export type CarouselItem = {
  _id: string;
  image: CloudinaryAsset;
  alt: string;
};

/**
 * The two square-card carousels on the homepage.
 *
 * Both are 720x720 image cards that start at the page gutter and run off the
 * right edge, so the track carries the left gutter as padding rather than
 * sitting inside a centred container — otherwise the last card would stop
 * short of the edge instead of bleeding past it.
 *
 * Cards are square-cornered, matching the artboard.
 */
// Static so Tailwind's JIT scanner can see the literal class names — a
// template-interpolated size wouldn't be picked up at build time.
const SIZE_CLASSES = {
  720: 'w-[85vw] max-w-[720px] md:w-[720px]',
  640: 'w-[80vw] max-w-[640px] md:w-[640px]',
} as const;

const SIZES_ATTR = {
  720: '(max-width: 768px) 85vw, 720px',
  640: '(max-width: 768px) 80vw, 640px',
} as const;

export default function CarouselSection({
  id,
  heading,
  label,
  items,
  cardSize = 720,
  cardClassName,
}: {
  id: string;
  heading: string;
  label: string;
  items: CarouselItem[];
  /** Card width in px — controls both the rendered size and the Cloudinary source. */
  cardSize?: keyof typeof SIZE_CLASSES;
  /** Extra classes for each card, e.g. a border. */
  cardClassName?: string;
}) {
  if (items.length === 0) return null;

  return (
    <section className="py-24" aria-labelledby={`${id}-heading`}>
      <Carousel
        heading={heading}
        headingId={`${id}-heading`}
        label={label}
        trackClassName="gap-6 px-6 pb-2 md:px-10 lg:px-[120px]"
      >
        {items.map((item) => {
          const src = cloudinaryUrl(item.image, { width: cardSize, aspect: '1:1' });
          if (!src) return null;
          return (
            <img
              key={item._id}
              src={src}
              srcSet={cloudinarySrcSet(item.image, { width: cardSize, aspect: '1:1' })}
              sizes={SIZES_ATTR[cardSize]}
              alt={item.alt}
              width={cardSize}
              height={cardSize}
              loading="lazy"
              decoding="async"
              className={`aspect-square object-cover ${SIZE_CLASSES[cardSize]} ${cardClassName ?? ''}`}
            />
          );
        })}
      </Carousel>
    </section>
  );
}
