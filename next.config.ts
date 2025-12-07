import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Allow 127.0.0.1 for Firebase Phone Auth development
  allowedDevOrigins: ['http://127.0.0.1:3001', 'http://127.0.0.1:3000'],
  // Allow Supabase Storage images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
