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
export default function CarouselSection({
  id,
  heading,
  label,
  items,
}: {
  id: string;
  heading: string;
  label: string;
  items: CarouselItem[];
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
          const src = cloudinaryUrl(item.image, { width: 720, aspect: '1:1' });
          if (!src) return null;
          return (
            <img
              key={item._id}
              src={src}
              srcSet={cloudinarySrcSet(item.image, { width: 720, aspect: '1:1' })}
              sizes="(max-width: 768px) 85vw, 720px"
              alt={item.alt}
              width={720}
              height={720}
              loading="lazy"
              decoding="async"
              className="aspect-square w-[85vw] max-w-[720px] object-cover md:w-[720px]"
            />
          );
        })}
      </Carousel>
    </section>
  );
}
