import { faq } from '@/lib/content/faq';
import { nextMeetupISO, site } from '@/lib/site';

export const revalidate = 86400;

/**
 * /llms.txt — a plain-text summary for AI assistants and answer engines.
 *
 * Generated from the same `site` and `faq` sources the pages render, so it can
 * never drift from what a human reader sees. Kept to verifiable facts.
 */
export function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || site.url;

  const body = `# ${site.name}

> ${site.description}

${site.name} (${site.shortName}) is a startup community in ${site.event.addressLocality}, Morocco.
It meets every Wednesday at ${site.event.startHour}:00 at ${site.event.venueName}, and also runs
workshops, bootcamps and hackathons through the year.

## Key facts

- Location: ${site.event.venueName}, ${site.event.addressLocality}, Morocco
- Schedule: every Wednesday, ${site.event.startHour}:00 (Africa/Casablanca)
- Next meetup: ${nextMeetupISO()}
- Cost: free — no ticket, no membership, no application
- Community size: ${site.stats.members} members on Meetup
- Open to: anyone (founders, investors, engineers, designers, students)
- Chess knowledge is not required to attend

## Pages

- [Home](${baseUrl}/): what the community is, past events, what members say
- [About](${baseUrl}/about): how a Wednesday runs and who comes
- [Members](${baseUrl}/members): the public member directory
- [Join](${baseUrl}/join): apply to be listed in the directory

## Links

- Meetup (event listings and RSVPs): ${site.social.meetup}
- LinkedIn: ${site.social.linkedin}
- Instagram: ${site.social.instagram}

## Frequently asked questions

${faq.map((item) => `### ${item.question}\n\n${item.answer}`).join('\n\n')}
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=86400',
    },
  });
}
