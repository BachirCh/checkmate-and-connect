import { defineField } from 'sanity';
import type { CloudinaryAsset } from 'sanity-plugin-cloudinary';

/**
 * Cloudinary folder each content type is allowed to draw from.
 *
 * The Cloudinary media library widget itself has no per-field folder lock —
 * it's configured once for the whole Studio. So we enforce the boundary here
 * instead: an asset whose public_id doesn't sit under the expected folder
 * fails validation and the document can't be published. That's what stops a
 * logo ending up in the testimonials carousel.
 */
export const CLOUDINARY_FOLDERS = {
  logos: 'checkmate/logos',
  pastEvents: 'checkmate/past-events',
  testimonials: 'checkmate/testimonials',
  upcomingPosts: 'checkmate/upcoming-posts',
} as const;

type FolderKey = keyof typeof CLOUDINARY_FOLDERS;

/**
 * A required `cloudinary.asset` field pinned to one folder.
 */
export function cloudinaryImageField(folder: FolderKey) {
  const prefix = CLOUDINARY_FOLDERS[folder];

  return defineField({
    name: 'image',
    title: 'Image',
    type: 'cloudinary.asset',
    description: `Pick from the ${prefix} folder in the Cloudinary media library.`,
    validation: (Rule) =>
      Rule.required().custom((value) => {
        const asset = value as CloudinaryAsset | undefined;
        if (!asset?.public_id) return 'Choose an image from Cloudinary.';
        if (!asset.public_id.startsWith(`${prefix}/`)) {
          return `This image lives in "${asset.public_id}". It must come from the ${prefix} folder.`;
        }
        return true;
      }),
  });
}

/**
 * Manual sort key. Lower sorts first; ties fall back to creation date.
 */
export const orderField = defineField({
  name: 'order',
  title: 'Order',
  type: 'number',
  description: 'Lower numbers appear first. Leave blank to sort by date added.',
  validation: (Rule) => Rule.min(0).integer(),
});
