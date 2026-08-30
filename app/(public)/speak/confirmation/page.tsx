import type { Metadata } from 'next';
import { MarkShape } from '@/components/brand/MarkShape';
import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

export const metadata: Metadata = {
  // Reachable only by submitting the form, and worthless in search either way.
  title: 'Talk suggestion sent',
  robots: { index: false, follow: false },
};

const STEPS = [
  'We read your suggestion.',
  'We reply in the next few days.',
  'If it is accepted, we confirm your date.',
];

export default function SpeakConfirmationPage() {
  return (
    <main>
      <section className="py-24">
        <Container>
          <div className="relative isolate overflow-hidden rounded-card border border-line bg-surface px-6 py-16 md:px-16 md:py-20">
            <MarkShape
              origin="top-right"
              className="-z-10 right-0 top-0 w-[420px] text-lime opacity-10 md:w-[560px]"
            />

            <p className="text-eyebrow font-semibold uppercase text-lime">
              Message sent
            </p>

            <h1 className="mt-6 max-w-[16ch] font-display text-[clamp(32px,5vw,56px)] font-bold leading-[1.07] tracking-[-0.02em]">
              Thanks, we got it.
            </h1>

            <p className="mt-6 max-w-[560px] text-body text-secondary">
              We will review your talk and contact you in the next few days if
              it is accepted. Nothing else is needed from you right now.
            </p>

            <ol className="mt-12 max-w-[560px] space-y-6 border-t border-line pt-10">
              {STEPS.map((step, i) => (
                <li key={step} className="flex gap-4">
                  <span
                    aria-hidden
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-pill border border-line font-display text-caption font-semibold text-secondary"
                  >
                    {i + 1}
                  </span>
                  <span className="pt-1 text-body text-secondary">{step}</span>
                </li>
              ))}
            </ol>

            <div className="mt-12 flex flex-col gap-3.5 sm:flex-row">
              <ButtonLink href="/">Back to the homepage</ButtonLink>
              <ButtonLink href="/members" variant="secondary">
                See the directory
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
