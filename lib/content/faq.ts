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
 * Every answer is grounded in something verifiable (the LinkedIn page, the
 * venue, the format). Nothing here is aspirational marketing.
 */
export const faq = [
  {
    question: 'Who can come to Checkmate & Connect?',
    answer:
      'Anyone. Founders, investors, engineers, designers, students and people who are simply curious about the Casablanca startup scene. There is no application, no membership and no vetting. If you want to be in the room, you are welcome in the room.',
  },
  {
    question: 'Do I need to know how to play chess?',
    answer:
      'No. Chess is in our name and there are boards on the tables, but you never have to play. Most people come to meet others, hear a talk or just see what is happening.',
  },
  {
    question: 'Is it free?',
    answer:
      'Yes. There is no ticket, no membership fee, no registration and no obligation to pitch anything. Just turn up.',
  },
  {
    question: 'When and where does it happen?',
    answer: `Every Wednesday at ${site.event.startHour}:00 at ${site.event.venueName} in ${site.event.addressLocality}. Doors are open from then on, so come when you can, even if you are late.`,
  },
  {
    question: 'What actually happens at a meetup?',
    answer:
      'A mix of open networking, a talk or workshop from someone who has built something, and games. Sessions are practical rather than theoretical, and the room stays open for conversation afterwards.',
  },
  {
    question: 'How big is the community?',
    answer: `Checkmate & Connect is ${site.stats.members} people, with a few dozen at a typical Wednesday and several hundred at larger events like our hackathons.`,
  },
  {
    question: 'Do I need to register, and how do I stay in the loop?',
    answer:
      'You do not need to register. There is no sign-up list and no RSVP: turn up on a Wednesday and you are in. Follow us on LinkedIn and Instagram if you want the announcements, recaps and speaker news, or send us a message and we will answer.',
  },
] as const;
