import { faq } from '@/lib/content/faq';
import { nextMeetupISO, site } from '@/lib/site';

/**
 * Structured data.
 *
 * Three graphs, all describing the same real-world facts as the visible page:
 *  - Organization: who C&C is, so search engines can build an entity for it
 *  - Event: the recurring Wednesday meetup, which is the thing people search
 *  - FAQPage: mirrors the visible accordion exactly (Google requires the
 *    answer to be on the page, so these must be generated from one source)
 *
 * Testimonials are uploaded images, so their quote text is surfaced here as
 * Review nodes — that is the only way an answer engine can read them.
 */

const ORG_ID = `${site.url}/#organization`;

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORG_ID,
    name: site.name,
    alternateName: site.shortName,
    url: site.url,
    slogan: site.tagline,
    description: site.description,
    foundingLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: site.event.addressLocality,
        addressCountry: site.event.addressCountry,
      },
    },
    sameAs: [site.social.linkedin, site.social.instagram],
  };
}

export function eventJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: `${site.name} weekly meetup`,
    description:
      'A weekly gathering of founders, investors and builders in Casablanca. Open to anyone, free to attend.',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    startDate: nextMeetupISO(),
    eventSchedule: {
      '@type': 'Schedule',
      repeatFrequency: 'P1W',
      byDay: 'https://schema.org/Wednesday',
      startTime: `${String(site.event.startHour).padStart(2, '0')}:00`,
      scheduleTimezone: 'Africa/Casablanca',
    },
    location: {
      '@type': 'Place',
      name: site.event.venueName,
      address: {
        '@type': 'PostalAddress',
        addressLocality: site.event.addressLocality,
        addressCountry: site.event.addressCountry,
      },
    },
    isAccessibleForFree: true,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'MAD',
      availability: 'https://schema.org/InStock',
      url: site.url,
    },
    organizer: { '@id': ORG_ID },
  };
}

export function faqJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

type ReviewSource = {
  quote: string;
  authorName: string;
  authorRole?: string;
};

export function reviewsJsonLd(testimonials: ReviewSource[]) {
  if (testimonials.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: testimonials.map((t, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Review',
        reviewBody: t.quote,
        author: {
          '@type': 'Person',
          name: t.authorName,
          ...(t.authorRole ? { jobTitle: t.authorRole } : {}),
        },
        itemReviewed: { '@id': ORG_ID },
      },
    })),
  };
}
