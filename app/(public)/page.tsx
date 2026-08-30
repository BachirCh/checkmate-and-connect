import { MarkShape } from '@/components/brand/MarkShape';
import Hero from '@/components/home/Hero';
import SpeakersBand, { type Logo } from '@/components/home/SpeakersBand';
import Features from '@/components/home/Features';
import CarouselSection, { type CarouselItem } from '@/components/home/CarouselSection';
import Faq from '@/components/home/Faq';
import JoinBand from '@/components/home/JoinBand';
import { JsonLd } from '@/components/seo/JsonLd';
import { client } from '@/lib/sanity/client';
import {
  logosQuery,
  pastEventsQuery,
  testimonialsQuery,
} from '@/lib/sanity/queries';
import {
  eventJsonLd,
  faqJsonLd,
  organizationJsonLd,
  reviewsJsonLd,
} from '@/lib/seo/jsonLd';
import type { CloudinaryAsset } from '@/lib/cloudinary/url';

// Rebuilt on demand by the Sanity webhook (app/api/revalidate), with a daily
// floor so the "next Wednesday" in the Event schema never goes stale.
export const revalidate = 86400;

type Testimonial = {
  _id: string;
  quote: string;
  authorName: string;
  authorRole?: string;
  image: CloudinaryAsset;
};

type PastEvent = {
  _id: string;
  caption: string;
  eventDate?: string;
  image: CloudinaryAsset;
};

export default async function HomePage() {
  const [logos, testimonials, pastEvents] = await Promise.all([
    client.fetch<Logo[]>(logosQuery),
    client.fetch<Testimonial[]>(testimonialsQuery),
    client.fetch<PastEvent[]>(pastEventsQuery),
  ]);

  // The testimonial cards are uploaded graphics, so the quote only reaches a
  // crawler through the alt text and the Review markup below.
  const testimonialItems: CarouselItem[] = testimonials.map((t) => ({
    _id: t._id,
    image: t.image,
    alt: `“${t.quote}”, ${t.authorName}${t.authorRole ? `, ${t.authorRole}` : ''}`,
  }));

  const pastEventItems: CarouselItem[] = pastEvents.map((e) => ({
    _id: e._id,
    image: e.image,
    alt: e.caption,
  }));

  return (
    <>
      <JsonLd
        graphs={[
          organizationJsonLd(),
          eventJsonLd(),
          faqJsonLd(),
          reviewsJsonLd(testimonials),
        ]}
      />

      {/*
        `isolate` keeps the -z-10 decorations behind every section but still
        above the body canvas; `overflow-hidden` stops the ones that bleed past
        the edges from creating horizontal scroll.

        The shapes are placed as percentages of the page rather than at fixed
        offsets, so they stay proportionally positioned as the CMS adds logos
        or carousel cards and the page grows.
      */}
      <main className="relative isolate overflow-hidden">
        <MarkShape
          origin="top-left"
          className="-z-10 -left-[10%] top-[20%] w-[60vw] max-w-[760px] text-lime opacity-5"
        />
        <MarkShape
          origin="top-right"
          className="-z-10 -right-[8%] top-[62%] w-[68vw] max-w-[880px] text-lime opacity-5"
        />

        <Hero />
        <SpeakersBand logos={logos} />
        <Features />
        <CarouselSection
          id="testimonials"
          heading="We heard that"
          label="testimonials"
          items={testimonialItems}
          cardSize={640}
          cardClassName="border border-line"
        />
        <CarouselSection
          id="past-events"
          heading="Something, Somewhere"
          label="past events"
          items={pastEventItems}
        />
        <Faq />
        <JoinBand />
      </main>
    </>
  );
}
