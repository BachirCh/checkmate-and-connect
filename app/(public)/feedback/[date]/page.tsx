import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import EventFeedbackForm from '@/components/forms/EventFeedbackForm';
import { Container } from '@/components/ui/Container';
import { formatEventDate, parseEventSlug } from '@/lib/event-date';

type Props = { params: Promise<{ date: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { date } = await params;
  const isoDate = parseEventSlug(date);

  return {
    title: isoDate ? `Feedback · ${formatEventDate(isoDate)}` : 'Feedback',
    // One link, one evening, handed out in the room. Nothing for search to do
    // here, and an indexed form for a past session is worse than none.
    robots: { index: false, follow: false },
  };
}

export default async function FeedbackPage({ params }: Props) {
  const { date } = await params;
  const isoDate = parseEventSlug(date);

  // A mistyped DDMMYY should 404 rather than quietly file feedback against a
  // session that never happened.
  if (!isoDate) notFound();

  return (
    <main>
      <section className="py-16 md:py-24">
        <Container>
          <div className="mx-auto max-w-[560px]">
            <p className="text-eyebrow font-semibold uppercase text-lime">
              {formatEventDate(isoDate)}
            </p>

            <h1 className="mt-5 font-display text-[clamp(34px,6vw,56px)] font-bold leading-[1.05] tracking-[-0.02em]">
              How was tonight?
            </h1>

            <p className="mt-5 text-body text-secondary">
              Two questions. Takes a minute.
            </p>

            <div className="mt-10 rounded-card border border-line bg-surface p-6 md:p-10">
              <EventFeedbackForm eventDate={isoDate} />
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
