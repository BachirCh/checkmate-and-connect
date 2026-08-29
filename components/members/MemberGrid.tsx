import { urlFor } from '@/lib/sanity/imageUrl';
import { Icon } from '@/components/ui/Icon';

export type DirectoryMember = {
  _id: string;
  name: string;
  photo?: unknown;
  jobTitle: string;
  company?: string;
  linkedIn?: string;
};

/**
 * The member directory grid.
 *
 * Replaces the old shadcn team block, which carried its own type scale,
 * radii and hover colours and so read as a different product once the brand
 * tokens landed.
 *
 * Member photos live in Sanity's asset store (not Cloudinary) because they
 * arrive through the /join form's upload, so this uses `urlFor` rather than
 * the Cloudinary helper. Square crop keeps the grid even when people upload
 * portrait or landscape shots.
 */
export function MemberGrid({ members }: { members: DirectoryMember[] }) {
  return (
    <ul className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
      {members.map((member) => {
        const src = member.photo
          ? urlFor(member.photo).width(560).height(560).fit('crop').auto('format').url()
          : null;

        return (
          <li key={member._id}>
            <div className="aspect-square overflow-hidden rounded-card bg-raised">
              {src ? (
                <img
                  src={src}
                  alt={member.name}
                  width={560}
                  height={560}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              ) : (
                // Initial rather than a stock silhouette — a missing photo
                // should look deliberate, not broken.
                <div
                  aria-hidden
                  className="grid h-full w-full place-items-center font-display text-[clamp(32px,6vw,56px)] font-bold text-line"
                >
                  {member.name.trim().charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <h2 className="mt-5 text-feature font-semibold text-ink">{member.name}</h2>
            <p className="mt-1 text-caption text-muted">
              {member.jobTitle}
              {member.company ? ` · ${member.company}` : ''}
            </p>

            {member.linkedIn ? (
              <a
                href={member.linkedIn}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 rounded-badge text-caption text-secondary transition-colors hover:text-lime focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime"
              >
                <Icon name="linkedin-logo" size={16} />
                LinkedIn
                <span className="sr-only"> profile for {member.name}</span>
              </a>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
