import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ✅ إخفاء X-Powered-By: Next.js لأسباب أمنية
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        pathname: '/images/li03k134/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [375, 390, 414, 430, 768, 1024],
    imageSizes: [64, 100, 150, 200, 300],
    // ✅ الصور تُكَّش لمدة 24 ساعة في Vercel Image Optimization
    minimumCacheTTL: 86400,
  },

  async redirects() {
    return [];
  },

  async headers() {
    return [
      // ── الأمان: لكل الصفحات والـ API ─────────────────────────────────────
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' https://cdn.sanity.io",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: https://cdn.sanity.io https://lh3.googleusercontent.com blob:",
              "connect-src 'self' https://*.sanity.io https://*.supabase.co https://api.telegram.org https://*.upstash.io",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },

      // ── API: no-cache + security headers ──────────────────────────────────
      {
        source: '/api/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, private' },
          { key: 'Pragma', value: 'no-cache' },
        ],
      },

      // ── الرئيسية ────────────────────────────────────────────────────────────
      {
        source: '/',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=7200, stale-while-revalidate=86400' },
          { key: 'Cache-Tag', value: 'home-page' },
        ],
      },

      // ── ملفات ثابتة ─────────────────────────────────────────────────────────
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },

      {
        source: '/(.*).(jpg|jpeg|png|webp|svg|ico|gif)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },


      // ── Admin: خاص تماماً لا كاش ──────────────────────────────────────────
      {
        source: '/(admin)/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, private' },
        ],
      },

      // ── Sanity Studio: لا كاش ─────────────────────────────────────────────
      {
        source: '/studio/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, private' },
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
