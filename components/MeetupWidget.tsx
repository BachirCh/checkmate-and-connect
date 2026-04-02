'use client';

export default function MeetupWidget() {
  return (
    <section className="scroll-py-16 py-16 md:scroll-py-32 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid gap-y-12 px-2 lg:[grid-template-columns:1fr_auto]">
          <div className="text-center lg:text-left">
            <h2 className="mb-4 text-3xl font-semibold md:text-4xl">
              Frequently <br className="hidden lg:block" /> Asked <br className="hidden lg:block" />
              Questions
            </h2>
            <p className="text-muted-foreground">Everything you need to know before joining.</p>
          </div>

          <div className="divide-y divide-dashed sm:mx-auto sm:max-w-lg lg:mx-0">
            <div className="pb-6">
              <h3 className="font-medium">Do I need to know how to play chess?</h3>
              <p className="text-muted-foreground mt-4">Not at all! We welcome all skill levels — from complete beginners to experienced players. Members are always happy to teach newcomers the basics.</p>
            </div>
            <div className="py-6">
              <h3 className="font-medium">Is there a fee to join?</h3>
              <p className="text-muted-foreground mt-4">Our weekly meetups are free to attend. Just show up at Commons every Wednesday at 6:00 PM. No registration required.</p>
            </div>
            <div className="py-6">
              <h3 className="font-medium">What should I bring?</h3>
              <p className="text-muted-foreground mt-4">Just yourself and a good attitude! We have chess boards and pieces available. Feel free to bring your own board or a laptop if you prefer digital chess.</p>
            </div>
            <div className="py-6">
              <h3 className="font-medium">How can I stay updated on events?</h3>
              <p className="text-muted-foreground mt-4">
                Follow us on our social media channels or join our{' '}
                <a
                  href="https://www.meetup.com/checkmate-connect-club-casablanca-chapter/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-white transition-colors"
                >
                  Meetup group
                </a>{' '}
                to get notified about upcoming events, tournaments, and special gatherings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
