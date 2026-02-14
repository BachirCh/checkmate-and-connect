import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https' as const, hostname: 'cdn.sanity.io' },
    ],
    formats: ['image/avif', 'image/webp'] as const,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Increased for photo uploads (default 1mb too small)
    },
  },
};

export default nextConfig;
