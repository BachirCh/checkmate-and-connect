import type { CloudinaryAsset } from 'sanity-plugin-cloudinary';

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

export type { CloudinaryAsset };

type TransformOptions = {
  /** Delivered pixel width. Height follows the aspect ratio unless `aspect` is set. */
  width: number;
  /** Crop to a square (`1:1`) or leave the source ratio alone. */
  aspect?: '1:1';
  /** 1–100. Defaults to Cloudinary's automatic quality. */
  quality?: number | 'auto';
};

/**
 * Build a Cloudinary delivery URL for an asset picked in Sanity Studio.
 *
 * We rewrite rather than use `asset.secure_url` directly because the stored URL
 * is the full-size original — a 4000px event photo behind a 720px slot. Every
 * transform here is capped, which matters: the account is on the free plan and
 * bandwidth is metered.
 */
export function cloudinaryUrl(
  asset: CloudinaryAsset | undefined | null,
  { width, aspect, quality = 'auto' }: TransformOptions
): string | null {
  if (!asset?.public_id || !CLOUD_NAME) return null;

  const transforms = [
    `w_${width}`,
    aspect === '1:1' ? 'ar_1:1,c_fill,g_auto' : 'c_limit',
    `q_${quality}`,
    'f_auto',
    'dpr_auto',
  ].join(',');

  const format = asset.format ? `.${asset.format}` : '';
  return `https://res.cloudinary.com/${CLOUD_NAME}/${asset.resource_type ?? 'image'}/upload/${transforms}/v${asset.version}/${asset.public_id}${format}`;
}

/**
 * `srcset` for a fixed-width slot, covering 1x and 2x displays.
 *
 * The 2x entry is omitted when the source isn't big enough for it. Without
 * that check Cloudinary happily upscales — a 720px testimonial card served at
 * w_1440 comes back soft, and costs bandwidth to do it.
 */
export function cloudinarySrcSet(
  asset: CloudinaryAsset | undefined | null,
  options: TransformOptions
): string | undefined {
  const one = cloudinaryUrl(asset, options);
  if (!one) return undefined;

  const retinaWidth = options.width * 2;
  // For a square crop the limiting dimension is the shorter edge
  const available =
    options.aspect === '1:1'
      ? Math.min(asset?.width ?? 0, asset?.height ?? 0)
      : (asset?.width ?? 0);

  if (available < retinaWidth) return undefined;

  const two = cloudinaryUrl(asset, { ...options, width: retinaWidth });
  return two ? `${one} 1x, ${two} 2x` : undefined;
}
