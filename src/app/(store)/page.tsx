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
import { client } from '@/lib/sanity/client';

export const revalidate = 60;

export const metadata = {
  title: 'Amigo Moda | Modern Algerian Fashion',
  description: 'Discover the latest Algerian fashion trends at Amigo Moda. High-quality clothes, shoes and accessories with delivery to all 58 wilayas.',
  openGraph: {
    title: 'Amigo Moda | Modern Algerian Fashion',
    description: 'High-quality clothes, shoes and accessories with delivery to all 58 wilayas.',
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
        _id, title, slug, "imageUrl": image.asset->url
      },
      "lookbooks": *[_type == "lookbook"][0...3] {
        _id, title, image, 
        products[] {
          _key, x, y, 
          product-> { _id, title, slug, price, images }
        }
      }
    }
  `;
  return await client.fetch(query);
}

export default async function HomePage() {
  const { home, trending, newArrivals, categories, lookbooks } = await getHomeData();

  return (
    <>
      <HeroSection homeData={home} />

      {/* Quick Category Pills */}
      <CategoryQuickPills categories={categories} />

      <Suspense fallback={<div className="h-[200px] bg-zinc-100 animate-pulse" />}>
        <TrendingSection products={trending} />
      </Suspense>

      {lookbooks && lookbooks.length > 0 && <LookbookSection lookbooks={lookbooks} />}
      
      <FeaturesSection />

      <CategoriesSection categories={categories} />

      <Suspense fallback={<div className="h-[200px] bg-zinc-100 animate-pulse" />}>
        <NewArrivalsSection products={newArrivals} />
      </Suspense>
      
      <StoreFooter />
    </>
  );
}

