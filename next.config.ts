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

  // ✅ Cache-Control Headers — القلب الحقيقي لتحمّل 40k زائر/يوم
  // هذه Headers تُخبر Cloudflare بحفظ الصفحات
  async headers() {
    return [
      // ── الأمان: قواعد عامة لكل الصفحات ────────────────────────────────────
      {
        source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' https://cdn.sanity.io",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https://cdn.sanity.io https://lh3.googleusercontent.com",
              "connect-src 'self' https://*.sanity.io https://*.supabase.co https://api.telegram.org https://*.upstash.io",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },

      // ── الرئيسية: كاش 2 ساعة في Cloudflare ─────────────────────────────────
      {
        source: '/',
        headers: [
          {
            key: 'Cache-Control',
            // s-maxage = CDN cache (Cloudflare)
            // stale-while-revalidate = يرسل القديم بينما يجدد في الخلفية
            value: 'public, s-maxage=7200, stale-while-revalidate=86400',
          },
          { key: 'Cache-Tag', value: 'home-page' },
        ],
      },

      // ── صفحات المنتجات: كاش 4 ساعات ─────────────────────────────────────────
      {
        source: '/products/:slug*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=14400, stale-while-revalidate=86400',
          },
          { key: 'Cache-Tag', value: 'product-pages' },
        ],
      },

      // ── صفحات الأقسام: كاش 2 ساعة ───────────────────────────────────────────
      {
        source: '/category/:slug*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=7200, stale-while-revalidate=43200',
          },
          { key: 'Cache-Tag', value: 'category-pages' },
        ],
      },

      // ── ملفات CSS/JS الثابتة: كاش سنة كاملة ──────────────────────────────
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },

      // ── صور في /public: كاش سنة ──────────────────────────────────────────
      {
        source: '/(.*).(jpg|jpeg|png|webp|svg|ico|gif)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },

      // ── API Checkout: لا كاش أبداً (بيانات حساسة) ──────────────────────────
      {
        source: '/api/checkout',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
        ],
      },

      // ── API عام: كاش قصير ────────────────────────────────────────────────
      {
        source: '/api/delivery-fees',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=3600, stale-while-revalidate=7200' },
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
