/**
 * @deprecated This component has been replaced by TeamSection (using shadcn/ui patterns).
 * Will be removed after successful deployment. Use TeamSection instead.
 */
import { urlFor } from '@/lib/sanity/imageUrl';

type MemberCardProps = {
  member: {
    _id: string;
    name: string;
    slug: { current: string };
    photo: any;
    jobTitle: string;
    company?: string;
    linkedIn?: string;
  };
};

export default function MemberCard({ member }: MemberCardProps) {
  const imageUrl = member.photo
    ? urlFor(member.photo)
        .width(400)
        .height(400)
        .fit('crop')
        .auto('format')
        .url()
    : null;

  return (
    <div className="group relative overflow-hidden rounded-xl aspect-square bg-[#1a1a1a] border border-[#333333] hover:border-white transition-all duration-500">
      {/* Member Photo with Grayscale Hover Effect */}
      {imageUrl && (
        <img
          src={imageUrl}
          alt={member.name}
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
        />
      )}

      {/* Hover Overlay with Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-white font-semibold text-sm mb-1">
            {member.name}
          </p>
          <p className="text-gray-300 text-xs mb-1">
            {member.jobTitle}
          </p>
          {member.company && (
            <p className="text-[#9ca3af] text-xs mb-2">
              {member.company}
            </p>
          )}
          {member.linkedIn && (
            <a
              href={member.linkedIn}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 text-xs hover:underline inline-block"
              onClick={(e) => e.stopPropagation()}
            >
              LinkedIn →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
