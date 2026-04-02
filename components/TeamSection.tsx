import { urlFor } from '@/lib/sanity/imageUrl';
import Link from 'next/link';
import Team from '@/components/shadcn-studio/blocks/team-section-01/team-section-01';

type SanityMember = {
  _id: string;
  name: string;
  slug: { current: string };
  photo: any;
  jobTitle: string;
  company?: string;
  linkedIn?: string;
};

type TeamSectionProps = {
  members: SanityMember[];
  title?: string;
  description?: string;
  showSeeAllButton?: boolean;
};

export default function TeamSection({
  members,
  title,
  description,
  showSeeAllButton = false
}: TeamSectionProps) {
  // Transform Sanity data to shadcn block format
  const transformedMembers = members.map((member) => ({
    image: member.photo
      ? urlFor(member.photo)
          .width(400)
          .height(400)
          .fit('crop')
          .auto('format')
          .url()
      : '/placeholder-avatar.png',
    alt: member.name,
    name: member.name,
    role: member.jobTitle,
    company: member.company,
    linkedIn: member.linkedIn,
  }));

  return (
    <div>
      {/* Optional Header */}
      {title && (
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
            {title}
          </h2>
          {description && (
            <p className="mx-auto max-w-2xl text-lg text-gray-400">
              {description}
            </p>
          )}
        </div>
      )}

      {/* Shadcn Team Block */}
      <Team teamMembers={transformedMembers} />

      {/* Optional See All Button */}
      {showSeeAllButton && (
        <div className="mt-10 text-center">
          <Link
            href="/members"
            className="inline-block rounded-lg bg-white px-8 py-3 font-semibold text-black transition-colors hover:bg-gray-200"
          >
            See All Members
          </Link>
        </div>
      )}
    </div>
  );
}
