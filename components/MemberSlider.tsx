'use client'

import Image from 'next/image'
import { InfiniteSlider } from '@/components/motion-primitives/infinite-slider'

type SliderMember = {
    _id: string
    name: string
    jobTitle: string
    photoUrl: string
}

export function MemberSlider({ members }: { members: SliderMember[] }) {
    return (
        <InfiniteSlider speedOnHover={20} speed={40} gap={48}>
            {members.map((member) => (
                <div key={member._id} className="flex items-center gap-3">
                    <Image
                        src={member.photoUrl}
                        alt={member.name}
                        width={40}
                        height={40}
                        className="size-10 rounded-full object-cover grayscale"
                    />
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-white whitespace-nowrap">{member.name}</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{member.jobTitle}</span>
                    </div>
                </div>
            ))}
        </InfiniteSlider>
    )
}
