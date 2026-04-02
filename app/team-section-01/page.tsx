import Team from '@/components/shadcn-studio/blocks/team-section-01/team-section-01'

const teamMembers = [
  {
    image: 'https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/team/image-1.png',
    alt: 'Phillip Bothman',
    name: 'Phillip Bothman',
    role: 'Founder & CEO',
    company: 'Tech Innovations Inc.',
    linkedIn: 'https://linkedin.com/in/example'
  },
  {
    image: 'https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/team/image-2.png',
    alt: 'James Kenter',
    name: 'James Kenter',
    role: 'Engineering Manager',
    company: 'Cloud Solutions Ltd.',
    linkedIn: 'https://linkedin.com/in/example'
  },
  {
    image: 'https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/team/image-3.png',
    alt: 'Cristofer Kenter',
    name: 'Cristofer Kenter',
    role: 'Product Designer',
    company: 'Design Studio',
    linkedIn: 'https://linkedin.com/in/example'
  },
  {
    image: 'https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/team/image-4.png',
    alt: 'Alena Lubin',
    name: 'Alena Lubin',
    role: 'Frontend Developer',
    company: 'Web Agency',
    linkedIn: 'https://linkedin.com/in/example'
  },
  {
    image: 'https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/team/image-8.png',
    alt: 'Jayden Lipshultz',
    name: 'Jayden Lipshultz',
    role: 'Sales Lead',
    company: 'Growth Partners',
    linkedIn: 'https://linkedin.com/in/example'
  },
  {
    image: 'https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/team/image-7.png',
    alt: 'Maria Donin',
    name: 'Maria Donin',
    role: 'Product Manager',
    company: 'Product Labs',
    linkedIn: 'https://linkedin.com/in/example'
  },
  {
    image: 'https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/team/image-6.png',
    alt: 'Carter Saris',
    name: 'Carter Saris',
    role: 'UX Researcher',
    company: 'Research Group',
    linkedIn: 'https://linkedin.com/in/example'
  },
  {
    image: 'https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/team/image-5.png',
    alt: 'Ahmad Donin',
    name: 'Ahmad Donin',
    role: 'Customer Success',
    company: 'Support Services',
    linkedIn: 'https://linkedin.com/in/example'
  }
]

const TeamPage = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold sm:text-5xl">Team Section Demo</h1>
          <p className="text-lg text-gray-400">
            Customized shadcn team block with dark theme and grayscale hover effects
          </p>
        </div>
        <Team teamMembers={teamMembers} />
      </div>
    </div>
  )
}

export default TeamPage
