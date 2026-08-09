// src/app/(store)/page.tsx
import { Suspense } from 'react';
import HeroSection from '@/components/home/HeroSection';
import TrendingSection from '@/components/home/TrendingSection';
import CategoriesSection from '@/components/home/CategoriesSection';
import NewArrivalsSection from '@/components/home/NewArrivalsSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import StoreFooter from '@/components/layout/StoreFooter';
import CategoryQuickPills from '@/components/home/CategoryQuickPills';
import { client } from '@/lib/sanity/client';

export const revalidate = 60;

export const metadata = {
  title: 'Amigo Moda | أزياء جزائرية عصرية',
  description: 'اكتشف أحدث صيحات الموضة الجزائرية في Amigo Moda. ملابس، أحذية وإكسسوارات عالية الجودة مع توصيل لجميع الولايات الـ 58.',
  openGraph: {
    title: 'Amigo Moda | أزياء جزائرية عصرية',
    description: 'ملابس، أحذية وإكسسوارات عالية الجودة مع توصيل لجميع الولايات الـ 58.',
    url: 'https://amigo-moda-app.vercel.app',
    siteName: 'Amigo Moda',
    images: [{ url: 'https://amigo-moda-app.vercel.app/og-image.jpg', width: 1200, height: 630 }],
    type: 'website',
  },
};

async function getHomeData() {
  const query = `
    {
      "home": *[_type == "homePage"][0] {
        title,
        heroBanners[] {
          title, subtitle, buttonText, buttonLink,
          "imageUrl": image.asset->url,
          "mobileImageUrl": mobileImage.asset->url
        },
        featuredCategories[]->{
          _id, title, slug, "imageUrl": image.asset->url
        }
      },
      "trending": *[_type == "product" && isTrending == true][0...8] {
        _id, title, slug, price, comparePrice, inStock, isNew, isTrending, images, colors, sizes
      },
      "newArrivals": *[_type == "product" && isNew == true][0...8] {
        _id, title, slug, price, comparePrice, inStock, isNew, isTrending, images, colors, sizes
      },
      "categories": *[_type == "category"][0...8] {
        _id, title, slug
      }
    }
  `;
  return await client.fetch(query);
}

export default async function HomePage() {
  const { home, trending, newArrivals, categories } = await getHomeData();

  return (
    <>
      <HeroSection homeData={home} />

      {/* Quick Category Pills */}
      <CategoryQuickPills categories={categories} />

      <Suspense fallback={<div className="h-[200px] bg-zinc-100 animate-pulse" />}>
        <TrendingSection products={trending} />
      </Suspense>

      <FeaturesSection />
      
      <CategoriesSection />

      <Suspense fallback={<div className="h-[200px] bg-zinc-100 animate-pulse" />}>
        <NewArrivalsSection products={newArrivals} />
      </Suspense>
      
      <StoreFooter />
    </>
  );
}

