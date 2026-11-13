import type { Metadata } from 'next';
import ChapterControls from '@/components/terms/ChapterControls';
import { Container } from '@/components/ui/Container';
import { Icon } from '@/components/ui/Icon';
import { PageHeader } from '@/components/ui/PageHeader';
import { RULE_KINDS, TERMS_VERSION, chapters, priorities } from '@/lib/content/terms';
import { site } from '@/lib/site';

export const revalidate = 86400;

const title = 'Terms & Conditions';
const description =
  'The community guidelines for Checkmate & Connect: how we treat each other, how private contact works, when to ask before acting in our name, and how events are photographed.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/terms' },
  openGraph: {
    title: `${title} | ${site.name}`,
    description,
    url: `${site.url}/terms`,
    type: 'website',
  },
};

const chapterTitle = (id: string) => chapters.find((chapter) => chapter.id === id)?.title ?? id;

/** 1 → "01". The index is decoration, so it stays out of the accessible name. */
const pad = (n: number) => String(n + 1).padStart(2, '0');

export default function TermsPage() {
  return (
    <main>
      <PageHeader
        eyebrow={`Community guidelines · Version ${TERMS_VERSION}`}
        title={title}
        lead="We bring founders, professionals, students, investors and curious people together in Casablanca to meet, learn and build. These are the terms that make room for good conversations and respectful connections, online and in person."
      />

      <section aria-labelledby="priorities" className="pb-20 md:pb-28">
        <Container>
          <p className="text-eyebrow font-semibold uppercase text-lime">Before you join</p>
          <h2
            id="priorities"
            className="mt-5 font-display text-[clamp(30px,4.5vw,48px)] font-bold leading-[1.1] tracking-[-0.02em]"
          >
            Three things to know
          </h2>

          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            {priorities.map((priority, index) => (
              <li
                key={priority.chapter}
                className="flex flex-col rounded-card border border-line bg-surface p-7 md:p-8"
              >
                <span aria-hidden="true" className="font-display text-stat font-bold text-faint">
                  {pad(index)}
                </span>
                <h3 className="mt-6 font-display text-feature font-semibold leading-tight">
                  {priority.title}
                </h3>
                <p className="mt-3 text-ui leading-6 text-secondary">{priority.body}</p>
                <a
                  href={`#${priority.chapter}`}
                  data-chapter={priority.chapter}
                  className="mt-auto inline-flex items-center gap-1.5 pt-7 text-ui font-medium text-lime transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime rounded-badge"
                >
                  {chapterTitle(priority.chapter)}
                  <Icon name="caret-right" size={16} />
                </a>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section aria-labelledby="handbook" className="pb-20 md:pb-28">
        <Container>
          <div className="h-px w-full bg-hairline" />

          <div className="mt-16 max-w-[720px]">
            <p className="text-eyebrow font-semibold uppercase text-lime">The terms</p>
            <h2
              id="handbook"
              className="mt-5 font-display text-[clamp(30px,4.5vw,48px)] font-bold leading-[1.1] tracking-[-0.02em]"
            >
              Community guidelines
            </h2>
            <p className="mt-5 text-body text-secondary">
              These terms apply in our WhatsApp spaces, at events and in exchanges that begin
              through the community. Six chapters set out what is expected and how to act in
              common situations. By checking in at a meetup, you agree to them.
            </p>
          </div>

          <div className="mt-14 grid gap-12 lg:grid-cols-[260px_1fr] lg:gap-16">
            <nav aria-label="On this page" className="lg:sticky lg:top-28 lg:self-start">
              <p className="text-eyebrow font-semibold uppercase text-faint">On this page</p>
              <ol className="mt-5 flex flex-col gap-1">
                {chapters.map((chapter, index) => (
                  <li key={chapter.id}>
                    <a
                      href={`#${chapter.id}`}
                      data-chapter={chapter.id}
                      className="flex items-baseline gap-3 rounded-badge py-2 text-ui text-secondary transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
                    >
                      <span aria-hidden="true" className="w-5 shrink-0 text-micro text-faint">
                        {pad(index)}
                      </span>
                      {chapter.title}
                    </a>
                  </li>
                ))}
              </ol>
              <div className="mt-6">
                <ChapterControls />
              </div>
            </nav>

            <div className="flex flex-col gap-4">
              {chapters.map((chapter, index) => (
                <details
                  key={chapter.id}
                  id={chapter.id}
                  data-chapter={chapter.id}
                  open={index === 0}
                  className="group scroll-mt-28 rounded-card border border-line bg-surface"
                >
                  <summary className="flex cursor-pointer list-none items-start gap-5 rounded-card p-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime md:p-8 [&::-webkit-details-marker]:hidden">
                    <span
                      aria-hidden="true"
                      className="pt-1 font-display text-stat font-bold text-faint"
                    >
                      {pad(index)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-feature font-semibold leading-tight">
                        {chapter.title}
                      </span>
                      <span className="mt-2 block text-ui leading-6 text-muted">
                        {chapter.summary}
                      </span>
                    </span>
                    <Icon
                      name="caret-down"
                      size={22}
                      className="mt-1.5 shrink-0 text-secondary transition-transform group-open:rotate-180"
                    />
                  </summary>

                  <ol className="border-t border-line">
                    {chapter.rules.map((rule) => (
                      <li
                        key={rule.id}
                        className="border-b border-line px-6 py-7 last:border-b-0 md:px-8"
                      >
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-micro font-semibold tracking-wide text-ink">
                            {rule.id}
                          </span>
                          <span className="rounded-badge border border-line px-2.5 py-1 text-micro text-secondary">
                            {RULE_KINDS[rule.kind]}
                          </span>
                        </div>
                        <h3 className="mt-3 font-display text-feature font-semibold leading-tight">
                          {rule.title}
                        </h3>
                        <p className="mt-2.5 max-w-[68ch] text-ui leading-6 text-secondary">
                          {rule.description}
                        </p>
                        {rule.example ? (
                          <p className="mt-4 max-w-[68ch] rounded-input border border-line bg-raised p-4 text-caption leading-[22px] text-secondary">
                            <span className="font-semibold text-ink">In practice. </span>
                            {rule.example}
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ol>
                </details>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section aria-labelledby="report" className="pb-24 md:pb-32">
        <Container>
          <div className="rounded-media border border-line bg-surface p-8 md:p-12">
            <p className="text-eyebrow font-semibold uppercase text-lime">Reporting</p>
            <h2
              id="report"
              className="mt-5 max-w-[20ch] font-display text-[clamp(28px,4vw,44px)] font-bold leading-[1.1] tracking-[-0.02em]"
            >
              Need to raise a concern?
            </h2>
            <p className="mt-5 max-w-[60ch] text-body text-secondary">
              Speak to an organizer at the event or message a WhatsApp admin privately. Share
              details only with the people handling the report.
            </p>
          </div>
        </Container>
      </section>
    </main>
  );
}
