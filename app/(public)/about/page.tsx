import type { Metadata } from 'next';
import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { JsonLd } from '@/components/seo/JsonLd';
import { organizationJsonLd } from '@/lib/seo/jsonLd';
import { site } from '@/lib/site';

export const revalidate = 86400;

const title = 'About';
const description =
  "Checkmate & Connect is a free weekly gathering of founders, investors and builders in Casablanca. Here's what it is, who it's for and how it runs.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/about' },
  openGraph: {
    title: `${title} | ${site.name}`,
    description,
    url: `${site.url}/about`,
    type: 'website',
  },
};

/**
 * Every claim on this page is traceable to something public: the Meetup group,
 * the venue, the event artwork, the partner logos in the CMS. Deliberately
 * absent: a founding date, founder names, and an organisers section — none of
 * those have been confirmed, and inventing them would put false facts on a
 * page whose whole job is to be the trustworthy answer to "what is C&C?".
 */
const SECTIONS = [
  {
    heading: 'What it is',
    body: [
      "Checkmate & Connect is a community of people building things in Casablanca — founders, investors, engineers, designers, students, and a fair number of people who just wanted to see what was going on. It runs as a weekly meetup, and several times a year it scales up into workshops, bootcamps and hackathons.",
      "The format is deliberately low-friction. There is no ticket, no membership, no application and no obligation to pitch anything. You turn up, you talk to people, you leave with something you did not have before. That is the whole model.",
    ],
  },
  {
    heading: 'How a Wednesday runs',
    body: [
      `Doors open at ${site.event.startHour}:00 at ${site.event.venueName}. The first stretch is open networking — the part most people actually come for. Somewhere in the middle there is usually a talk or a workshop from someone who has built the thing they are talking about, which tends to be more useful than a panel about building things.`,
      "Then the room goes back to talking. There are chess boards and games on the tables, which exist to give people who do not know anyone an easy way in. Nobody has to play.",
    ],
  },
  {
    heading: 'Who comes',
    body: [
      `The Meetup group has ${site.stats.members} members. A typical Wednesday is a few dozen people; the larger events run into the hundreds. It skews early-stage — people at the idea, first-hire or first-customer stage — but there is no filter on who is welcome.`,
      "Past events have brought in speakers and partners from across Moroccan industry and academia, including OCP, UM6P and Bewize.",
    ],
  },
];

export default function AboutPage() {
  return (
    <>
      <JsonLd
        graphs={[
          organizationJsonLd(),
          {
            '@context': 'https://schema.org',
            '@type': 'AboutPage',
            name: `${title} — ${site.name}`,
            description,
            url: `${site.url}/about`,
            mainEntity: { '@id': `${site.url}/#organization` },
          },
        ]}
      />

      <main>
        <section className="pb-16 pt-24">
          <Container>
            <p className="text-eyebrow font-semibold uppercase text-lime">About</p>
            <h1 className="mt-6 max-w-[18ch] font-display text-[clamp(40px,6.4vw,88px)] font-bold leading-none tracking-[-0.02em]">
              A room where Casablanca builds.
            </h1>
            <p className="mt-7 max-w-[720px] text-lead text-secondary">
              {site.name} brings founders, investors and builders together every
              Wednesday evening. Free, open to anyone, and running every week.
            </p>
          </Container>
        </section>

        <section className="pb-24">
          <Container>
            <div className="max-w-[760px] border-t border-line">
              {SECTIONS.map((section) => (
                <div key={section.heading} className="border-b border-line py-12">
                  <h2 className="font-display text-[clamp(28px,4vw,40px)] font-bold leading-tight tracking-[-0.02em]">
                    {section.heading}
                  </h2>
                  {section.body.map((paragraph) => (
                    <p key={paragraph.slice(0, 40)} className="mt-6 text-body text-secondary">
                      {paragraph}
                    </p>
                  ))}
                </div>
              ))}
            </div>

            <dl className="mt-16 grid max-w-[760px] grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
              {[
                { v: site.stats.members, l: 'members on Meetup' },
                { v: site.stats.cadence, l: 'every Wednesday, 18:00' },
                { v: site.stats.price, l: 'no ticket, no pitch' },
                { v: site.stats.venue, l: 'Casablanca' },
              ].map((s) => (
                <div key={s.l}>
                  <dt className="sr-only">{s.l}</dt>
                  <dd>
                    <span className="block font-display text-stat font-semibold tracking-[-0.01em]">
                      {s.v}
                    </span>
                    <span className="mt-1.5 block text-caption text-muted">{s.l}</span>
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-16 flex flex-col gap-3.5 sm:flex-row">
              <ButtonLink href={site.social.meetup}>Join on Meetup</ButtonLink>
              <ButtonLink href="/members" variant="secondary">
                See the members
              </ButtonLink>
            </div>
          </Container>
        </section>
      </main>
    </>
  );
}
