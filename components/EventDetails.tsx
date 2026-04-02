import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Calendar, MapPin, Users } from 'lucide-react'
import { ReactNode } from 'react'

export default function EventDetails() {
  return (
    <section id="event-details" className="py-16 md:py-32 dark:bg-transparent">
      <div className="@container mx-auto max-w-5xl px-6">
        <div className="text-center">
          <h2 className="text-balance text-4xl font-semibold lg:text-5xl">Join Us</h2>
          <p className="mt-4">Every Wednesday, chess players and entrepreneurs come together.</p>
        </div>
        <div className="@min-4xl:max-w-full @min-4xl:grid-cols-3 mx-auto mt-8 grid max-w-sm gap-6 *:text-center md:mt-16">
          <Card className="group shadow-zinc-950/5">
            <CardHeader className="pb-3">
              <CardDecorator>
                <Calendar className="size-6" aria-hidden />
              </CardDecorator>
              <h3 className="mt-6 font-medium">When</h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">Every Wednesday</p>
              <p className="text-sm text-muted-foreground">6:00 PM</p>
            </CardContent>
          </Card>

          <Card className="group shadow-zinc-950/5">
            <CardHeader className="pb-3">
              <CardDecorator>
                <MapPin className="size-6" aria-hidden />
              </CardDecorator>
              <h3 className="mt-6 font-medium">Where</h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">Commons Zerktouni, Casa</p>
              <a
                href="https://maps.app.goo.gl/K9id6TktfPycE6Bt8"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block rounded border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
              >
                Get Location
              </a>
            </CardContent>
          </Card>

          <Card className="group shadow-zinc-950/5">
            <CardHeader className="pb-3">
              <CardDecorator>
                <Users className="size-6" aria-hidden />
              </CardDecorator>
              <h3 className="mt-6 font-medium">Who</h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">200+ Members</p>
              <p className="text-sm text-muted-foreground">Chess players & entrepreneurs</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

const CardDecorator = ({ children }: { children: ReactNode }) => (
  <div className="relative mx-auto size-36 overflow-hidden" style={{ mask: 'radial-gradient(circle, black 40%, transparent 60%)' }}>
    <div
      aria-hidden
      className="absolute inset-0 opacity-15 group-hover:opacity-25 transition-opacity duration-200"
      style={{
        backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    />
    <div className="absolute inset-0 m-auto flex size-12 items-center justify-center border-l border-t border-white/20 bg-black">{children}</div>
  </div>
)
