import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Remove 'export' to use dynamic server
  images: {
    unoptimized: true
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
