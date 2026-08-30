import { Container } from '@/components/ui/Container';
import { faq } from '@/lib/content/faq';

/**
 * FAQ accordion.
 *
 * Native <details>/<summary>: keyboard accessible, works without JavaScript,
 * and — critically for SEO — the answer text is in the DOM whether or not the
 * item is open, so crawlers and answer engines can read all of it.
 */
export default function Faq() {
  return (
    <section className="py-24" aria-labelledby="faq-heading">
      <Container>
        {/* One centred 840px column: on a wide desktop viewport the accordion
            alone would sit flush against the left gutter of the 1440px
            container, leaving a lopsided gap on the right. Centring the
            eyebrow and heading with it keeps them aligned to the same
            left edge as the questions below them. */}
        <div className="mx-auto max-w-[840px]">
          <p className="text-eyebrow font-semibold uppercase text-lime">
            Before you come
          </p>
          <h2
            id="faq-heading"
            className="mt-6 font-display text-[clamp(32px,5vw,48px)] font-bold leading-[1.125] tracking-[-0.02em]"
          >
            Questions people ask.
          </h2>

          <div className="mt-12 border-t border-line">
            {faq.map((item) => (
              <details
                key={item.question}
                name="faq"
                className="group border-b border-line"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-feature font-semibold text-ink marker:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <span
                    aria-hidden
                    className="relative grid h-6 w-6 shrink-0 place-items-center text-lime"
                  >
                    <span className="absolute h-0.5 w-4 bg-current" />
                    <span className="absolute h-4 w-0.5 bg-current transition-transform group-open:rotate-90 group-open:opacity-0" />
                  </span>
                </summary>
                <p className="max-w-[720px] pb-7 text-body text-secondary">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
