import type { Metadata } from 'next';
import TalkProposalForm from '@/components/forms/TalkProposalForm';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
import { site, upcomingMeetupDates } from '@/lib/site';

// The dropdown holds the next four Wednesdays, so the page cannot be cached
// past the day one of them stops being upcoming.
export const revalidate = 3600;

const title = 'Suggest a talk';
const description =
  'Tell us what you would talk about on a Wednesday at Checkmate & Connect in Casablanca, and pick a date.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/speak' },
  openGraph: {
    title: `${title} | ${site.name}`,
    description,
    url: `${site.url}/speak`,
    type: 'website',
  },
};

const STEPS = [
  'We read every suggestion.',
  'We reply in the next few days.',
  'If it is a yes, we confirm your Wednesday.',
];

export default function SpeakPage() {
  const dates = upcomingMeetupDates();

  return (
    <main>
      <PageHeader
        eyebrow="Speak"
        title="Suggest a talk."
        lead="Got something worth sharing? Tell us what it is and pick a Wednesday. Anyone can suggest one. You do not have to be a member."
      />

      <section className="pb-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-16">
            <div className="rounded-card border border-line bg-surface p-6 md:p-10">
              <TalkProposalForm dates={dates} />
            </div>

            <aside className="lg:pt-2">
              <h2 className="text-eyebrow font-semibold uppercase text-lime">
                What happens next
              </h2>
              <ol className="mt-6 space-y-5">
                {STEPS.map((step, i) => (
                  <li key={step} className="flex gap-4">
                    <span
                      aria-hidden
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-pill border border-line font-display text-caption font-semibold text-secondary"
                    >
                      {i + 1}
                    </span>
                    <span className="text-caption text-secondary">{step}</span>
                  </li>
                ))}
              </ol>

              <p className="mt-8 border-t border-line pt-6 text-micro text-muted">
                Talks are short and informal. We meet at{' '}
                {site.event.venueName}, {site.event.addressLocality}, every
                Wednesday at {site.event.startHour}:00.
              </p>
            </aside>
          </div>
        </Container>
      </section>
    </main>
  );
}
