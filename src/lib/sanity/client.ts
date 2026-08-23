// src/lib/sanity/client.ts
import { createClient } from 'next-sanity';
import { createImageUrlBuilder } from '@sanity/image-url';

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'li03k134',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  // ✅ CDN في production يعني 0 تكلفة على الـ API للقراءة
  // بيانات محفوظة في Edge Nodes حول العالم (أسرع + مجاني)
  useCdn: process.env.NODE_ENV === 'production',
  stega: false,
});

// Client مع token للكتابة فقط (checkout, orders)
export const clientWithToken = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'li03k134',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  useCdn: false, // لا كاش للكتابة
  token: process.env.SANITY_API_TOKEN,
});

const builder = createImageUrlBuilder(client);

export function urlFor(source: any) {
  return builder.image(source);
}
