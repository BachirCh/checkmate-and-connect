import { MarkShape } from '@/components/brand/MarkShape';
import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { site } from '@/lib/site';

export default function JoinBand() {
  return (
    <section className="pb-24" aria-labelledby="join-heading">
      <Container>
        <div className="relative isolate overflow-hidden rounded-card border border-line bg-surface px-6 py-16 text-center md:px-20 md:py-[72px]">
          {/* Arcs strike from the card's own top-right corner and sweep down
              across the copy. overflow-hidden trims them to the 24px radius. */}
          <MarkShape
            origin="top-right"
            className="-z-10 right-0 top-0 w-[420px] text-lime opacity-10 md:w-[560px]"
          />

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
