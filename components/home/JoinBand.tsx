import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { site } from '@/lib/site';

export default function JoinBand() {
  return (
    <section className="pb-24" aria-labelledby="join-heading">
      <Container>
        <div className="rounded-card border border-line bg-surface px-6 py-16 text-center md:px-20 md:py-[72px]">
          <h2
            id="join-heading"
            className="font-display text-[clamp(32px,5.5vw,56px)] font-bold leading-[1.07] tracking-[-0.02em]"
          >
            Come on Wednesday.
          </h2>

          <p className="mx-auto mt-5 max-w-[680px] text-body text-secondary">
            No ticket, no pitch, no membership. Doors open at{' '}
            {site.event.startHour}:00 at {site.event.venueName}. Come when you can.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
            <ButtonLink href={site.social.meetup}>Join on Meetup</ButtonLink>
            <ButtonLink href={site.social.linkedin} variant="secondary">
              Follow on LinkedIn
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
