// src/app/(store)/page.tsx
import { Suspense } from 'react';
import HeroSection from '@/components/home/HeroSection';
import TrendingSection from '@/components/home/TrendingSection';
import CategoriesSection from '@/components/home/CategoriesSection';
import NewArrivalsSection from '@/components/home/NewArrivalsSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import StoreFooter from '@/components/layout/StoreFooter';
import CategoryQuickPills from '@/components/home/CategoryQuickPills';
import LookbookSection from '@/components/home/LookbookSection';
import { getHomeData } from '@/lib/sanity/queries';

// ✅ ISR: يعيد بناء الصفحة كل 2 ساعة (لا كل 60 ثانية)
// Cloudflare + Redis سيغطيان 99% من الطلبات قبل أن يصل Vercel
export const revalidate = 7200;

export const metadata = {
  title: 'Amigo Moda | Modern Algerian Fashion',
  description: 'Discover the latest Algerian fashion trends at Amigo Moda. High-quality clothes, shoes and accessories with delivery to all 58 wilayas.',
  openGraph: {
    title: 'Amigo Moda | Modern Algerian Fashion',
    description: 'High-quality clothes, shoes and accessories with delivery to all 58 wilayas.',
    url: 'https://amigomoda.store',
    siteName: 'Amigo Moda',
    images: [{ url: 'https://amigomoda.store/og-image.jpg', width: 1200, height: 630 }],
    type: 'website',
  },
};

export default async function HomePage() {
  // ✅ طلب واحد فقط لـ Sanity (بدلاً من 5 طلبات منفصلة)
  // Redis → Sanity CDN → Next.js ISR
  const data = await getHomeData();
  
  const { home, trending, newArrivals, categories, lookbooks } = data || {};

  return (
    <>
      <HeroSection homeData={home} />

      {/* Quick Category Pills */}
      <CategoryQuickPills categories={categories ?? []} />

      <Suspense fallback={<div className="h-[200px] bg-zinc-100 animate-pulse" />}>
        <TrendingSection products={trending ?? []} />
      </Suspense>

      {lookbooks && lookbooks.length > 0 && <LookbookSection lookbooks={lookbooks} />}
      
      <FeaturesSection />

      <CategoriesSection categories={categories ?? []} />

      <Suspense fallback={<div className="h-[200px] bg-zinc-100 animate-pulse" />}>
        <NewArrivalsSection products={newArrivals ?? []} />
      </Suspense>
      
      <StoreFooter />
    </>
  );
}
