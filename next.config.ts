import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https' as const, hostname: 'cdn.sanity.io' },
    ],
    formats: ['image/avif', 'image/webp'] as const,
  },
};

export default nextConfig;
