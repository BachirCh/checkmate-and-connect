import { site } from '@/lib/site';

/**
 * Homepage FAQ.
 *
 * This is the page's main answer-engine surface: it is the only substantial
 * body of text a crawler or an LLM can quote, since the testimonials are
 * uploaded images. One source of truth feeds both the visible accordion and
 * the FAQPage structured data — Google requires the answer to be visible on
 * the page, so they must never diverge.
 *
 * Every answer is grounded in something verifiable (the Meetup listing, the
 * venue, the format). Nothing here is aspirational marketing.
 */
export const faq = [
  {
    question: 'Who can come to Checkmate & Connect?',
    answer:
      'Anyone. Founders, investors, engineers, designers, students and people who are simply curious about the Casablanca startup scene. There is no application, no membership and no vetting — if you want to be in the room, you are welcome in the room.',
  },
  {
    question: 'Do I need to know how to play chess?',
    answer:
      'No. Chess is in our name and there are boards on the tables, but you never have to play. Most people come to meet others, hear a talk or just see what is happening.',
  },
  {
    question: 'Is it free?',
    answer:
      'Yes. There is no ticket, no membership fee and no obligation to pitch anything. Just turn up.',
  },
  {
    question: 'When and where does it happen?',
    answer: `Every Wednesday at ${site.event.startHour}:00 at ${site.event.venueName} in ${site.event.addressLocality}. Doors are open from then on — come when you can, even if you are late.`,
  },
  {
    question: 'What actually happens at a meetup?',
    answer:
      'A mix of open networking, a talk or workshop from someone who has built something, and games. Sessions are practical rather than theoretical, and the room stays open for conversation afterwards.',
  },
  {
    question: 'How big is the community?',
    answer: `Checkmate & Connect has ${site.stats.members} members on Meetup, with a few dozen people at a typical weekly meetup and several hundred at larger events like our hackathons.`,
  },
  {
    question: 'How do I stay in the loop?',
    answer:
      'Join the group on Meetup for event announcements and RSVPs, and follow us on LinkedIn and Instagram for recaps and speaker news.',
  },
] as const;
