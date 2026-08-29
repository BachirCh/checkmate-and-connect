import type { Metadata } from 'next';
import { RecaptchaProvider } from '@/components/RecaptchaProvider';
import MemberSubmissionForm from '@/components/forms/MemberSubmissionForm';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
import { site } from '@/lib/site';

const title = 'Join the directory';
const description =
  'Add yourself to the Checkmate & Connect member directory so other founders, investors and builders in Casablanca can find you.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/join' },
  openGraph: {
    title: `${title} | ${site.name}`,
    description,
    url: `${site.url}/join`,
    type: 'website',
  },
};

const STEPS = [
  'An organiser reviews your submission.',
  'Once approved, your profile appears in the directory.',
  'People can find you before and after Wednesday.',
];

export default function JoinPage() {
  return (
    <RecaptchaProvider>
      <main>
        <PageHeader
          eyebrow="Join"
          title="Get listed in the directory."
          lead="The directory is opt-in. Add your details and an organiser will review them. It is only for people who want to be findable, and you can ask to be removed at any time."
        />

        <section className="pb-24">
          <Container>
            <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-16">
              <div className="rounded-card border border-line bg-surface p-6 md:p-10">
                <MemberSubmissionForm />
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
                  You do not need to be in the directory to attend. Everything at{' '}
                  {site.name} is open to anyone, listed or not.
                </p>
              </aside>
            </div>
          </Container>
        </section>
      </main>
    </RecaptchaProvider>
  );
}
