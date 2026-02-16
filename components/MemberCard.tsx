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
  // Generate optimized image URL with Sanity CDN
  // - width/height: 400x400 for consistent card sizing
  // - fit('crop'): Uses hotspot for focal point (enabled in schema)
  // - auto('format'): Serves WebP/AVIF automatically to supporting browsers
  const imageUrl = member.photo
    ? urlFor(member.photo)
        .width(400)
        .height(400)
        .fit('crop')
        .auto('format')
        .url()
    : null;

  return (
    <div className="group relative overflow-hidden rounded-xl aspect-square bg-gray-900 border border-gray-800 hover:border-gray-700 transition-all">
      {/* Member Photo with Grayscale Hover Effect */}
      {imageUrl && (
        <img
          src={imageUrl}
          alt={member.name}
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
        />
      )}

      {/* Hover Overlay with Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Member Name */}
          <p className="text-white font-semibold text-sm mb-1">
            {member.name}
          </p>

          {/* Job Title */}
          <p className="text-gray-300 text-xs mb-1">
            {member.jobTitle}
          </p>

          {/* Company (Optional) */}
          {member.company && (
            <p className="text-gray-400 text-xs mb-2">
              {member.company}
            </p>
          )}

          {/* LinkedIn Link (Optional) */}
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
