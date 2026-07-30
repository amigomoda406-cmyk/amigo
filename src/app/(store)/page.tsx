// src/app/(store)/page.tsx
import { Suspense } from 'react';
import HeroSection from '@/components/home/HeroSection';
import TrendingSection from '@/components/home/TrendingSection';
import CategoriesSection from '@/components/home/CategoriesSection';
import NewArrivalsSection from '@/components/home/NewArrivalsSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import StoreFooter from '@/components/layout/StoreFooter';
import { client } from '@/lib/sanity/client';

export const revalidate = 60; // Revalidate every 60 seconds

export const metadata = {
  title: 'Amigo Moda | Accueil',
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
      "trending": *[_type == "product" && isTrending == true][0...4] {
        _id, title, slug, price, comparePrice, inStock, isNew, isTrending, images,
        parentCategory->, subCategory->
      },
      "newArrivals": *[_type == "product" && isNew == true][0...4] {
        _id, title, slug, price, comparePrice, inStock, isNew, isTrending, images,
        parentCategory->, subCategory->
      }
    }
  `;
  return await client.fetch(query);
}

export default async function HomePage() {
  const { home, trending, newArrivals } = await getHomeData();

  return (
    <>
      <HeroSection homeData={home} />
      
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
