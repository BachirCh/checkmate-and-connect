import Link from 'next/link'
import Image from 'next/image'
import heroImage from '@/assets/Frame 838.png'
import { client } from '@/lib/sanity/client'
import { membersQuery } from '@/lib/sanity/queries'
import { urlFor } from '@/lib/sanity/imageUrl'
import { MemberSlider } from './MemberSlider'

export default async function Hero() {
    const members = await client.fetch(membersQuery)
    const membersWithPhotos = members.filter((m: any) => m.photo)

    return (
        <>
        <section className="@container overflow-x-hidden">
            <div className="pb-24 pt-12 md:pb-32 lg:pb-56 lg:pt-44">
                <div className="relative mx-auto flex max-w-6xl flex-col px-6 lg:block">
                    <div className="mx-auto max-w-lg text-center lg:ml-0 lg:w-1/2 lg:text-left">
                        <h1 className="mt-8 max-w-2xl text-balance text-5xl font-medium md:text-6xl lg:mt-16 xl:text-7xl">Checkmate & Connect</h1>
                        <p className="mt-8 max-w-2xl text-pretty text-lg">Chess & Entrepreneurship community in Casablanca. Every Wednesday, 200+ members come together to play, network, and grow.</p>

                        <div className="mt-12 flex flex-col items-center justify-center gap-2 sm:flex-row lg:justify-start">
                            <Link
                                href="#event-details"
                                className="inline-block rounded-lg bg-white px-8 py-3 font-semibold text-black transition-colors hover:bg-gray-200 text-nowrap">
                                Join Our Next Meetup
                            </Link>
                            <Link
                                href="/members"
                                className="inline-block rounded-lg  px-8 py-3 font-semibold text-white transition-colors hover:bg-gray-800 text-nowrap">
                                Who Are We ?
                            </Link>
                            
                        </div>
                    </div>
                    <div className="lg:w-166 @max-lg:-translate-x-20 max-lg:size-120 max-lg:order-first max-lg:mx-auto max-lg:-mb-20 lg:absolute lg:inset-0 lg:-inset-y-56 lg:ml-auto lg:translate-x-28">
                        <div className="z-1 absolute inset-0 bg-zinc-950 opacity-30 mix-blend-overlay" />
                        <Image
                            className="size-full object-cover object-right"
                            src={heroImage}
                            alt="Chess pieces on a board"
                            placeholder="blur"
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                    </div>
                </div>
            </div>
        </section>

        {membersWithPhotos.length > 0 && (
            <section className="border-t border-[#333333] pb-16 pt-4 md:pb-32">
                <div className="group relative m-auto max-w-6xl px-6">
                    <div className="flex flex-col items-center md:flex-row">
                        <div className="md:max-w-44 md:border-r md:border-[#333333] md:pr-6">
                            <p className="text-end text-sm text-muted-foreground">Our community members</p>
                        </div>
                        <div className="relative py-6 md:w-[calc(100%-11rem)]">
                            <MemberSlider
                                members={membersWithPhotos.map((m: any) => ({
                                    _id: m._id,
                                    name: m.name,
                                    jobTitle: m.jobTitle,
                                    photoUrl: urlFor(m.photo).width(80).height(80).fit('crop').auto('format').url(),
                                }))}
                            />
                            <div
                                aria-hidden
                                className="bg-gradient-to-r from-black absolute inset-y-0 left-0 w-20"
                            />
                            <div
                                aria-hidden
                                className="bg-gradient-to-l from-black absolute inset-y-0 right-0 w-20"
                            />
                        </div>
                    </div>
                </div>
            </section>
        )}
        </>
    )
}
