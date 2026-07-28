import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        pathname: '/images/li03k134/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [375, 390, 414, 430, 768],
    imageSizes: [64, 100, 150, 200, 300],
    minimumCacheTTL: 86400,
  },
  
  async headers() {
    return [
      {
        source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },

  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'swiper'],
  },
  
  // السماح لـ Sanity Studio بالعمل داخل Next.js
  transpilePackages: ['next-sanity'],
};

export default nextConfig;
