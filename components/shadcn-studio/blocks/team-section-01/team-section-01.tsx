import Image from 'next/image'

import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

type TeamMember = {
  image: string
  alt: string
  name: string
  role: string
  company?: string
  linkedIn?: string
}[]

const Team = ({ teamMembers }: { teamMembers: TeamMember }) => {
  return (
    <section className='py-8 sm:py-16 lg:py-24'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        {/* Team Members Grid */}
        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-y-10 xl:grid-cols-4'>
          {teamMembers.map((member, index) => (
            <Card
              key={index}
              className='group bg-[#1a1a1a] border-[#333333] hover:border-white overflow-hidden py-0 shadow-none transition-all duration-500'
            >
              <CardContent className='px-0'>
                <img
                  src={member.image}
                  alt={member.alt}
                  className='mx-auto h-60 w-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500'
                />
                <div className='space-y-3 p-6'>
                  <CardTitle className='text-lg text-white'>{member.name}</CardTitle>
                  <Separator className='border-[#333333] border h-px' />
                  <div className="flex justify-between">
                    <div className='text-[#9ca3af]'>
                      <p className='mb-1 font-medium'>{member.role}</p>
                      {member.company && <p className='text-sm'>{member.company}</p>}
                    </div>
                    {member.linkedIn && (
                      <div className='flex gap-3'>
                        <a
                          href={member.linkedIn}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-[#9ca3af] hover:text-white transition-colors'
                        >
                          <Image src="/assets/linkedin-icon.svg" alt="LinkedIn" width={20} height={20} />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Team
