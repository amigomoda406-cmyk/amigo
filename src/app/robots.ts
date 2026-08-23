import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/_next/',
          '/private/',
        ],
      },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://amigomoda.store'}/sitemap.xml`,
    host: process.env.NEXT_PUBLIC_SITE_URL || 'https://amigomoda.store',
  };
}
