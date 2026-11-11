import type { Metadata } from 'next';
import PresenceForm from '@/components/forms/PresenceForm';
import { Container } from '@/components/ui/Container';
import { formatEventDate, todaysSessionISO } from '@/lib/event-date';
import { upcomingMeetupDates } from '@/lib/site';

/**
 * /presence — check-in at the door, behind a printed QR code.
 *
 * Open on Wednesdays only, Casablanca time. The date is never in the URL, so
 * one QR code works every week; the page works out which Wednesday it is.
 *
 * force-dynamic is load-bearing for the same reason as /feedback: prerendered,
 * the page would be frozen open or closed at whatever day it was last built.
 */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Confirm your presence',
  robots: { index: false, follow: false },
};

export default function PresencePage() {
  const today = todaysSessionISO();

  return (
    <main>
      <section className="py-16 md:py-24">
        <Container>
          <div className="mx-auto max-w-[560px]">
            {today ? (
              <>
                <p className="text-eyebrow font-semibold uppercase text-lime">
                  {formatEventDate(today)}
                </p>

                <h1 className="mt-5 font-display text-[clamp(34px,6vw,56px)] font-bold leading-[1.05] tracking-[-0.02em]">
                  Confirm your presence
                </h1>

                <div className="mt-10 rounded-card border border-line bg-surface p-6 md:p-10">
                  <PresenceForm />
                </div>
              </>
            ) : (
              <>
                <p className="text-eyebrow font-semibold uppercase text-lime">
                  Check-in closed
                </p>

                <h1 className="mt-5 font-display text-[clamp(34px,6vw,56px)] font-bold leading-[1.05] tracking-[-0.02em]">
                  See you on Wednesday
                </h1>

                <p className="mt-5 text-body text-secondary">
                  Check-in opens on the day of the meetup. Next one is{' '}
                  <span className="text-ink">{upcomingMeetupDates(1)[0].label}</span>.
                </p>
              </>
            )}
          </div>
        </Container>
      </section>
    </main>
  );
}
