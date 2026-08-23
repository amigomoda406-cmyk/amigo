// src/lib/sanity/queries.ts
// ✅ جميع queries الـ Sanity تمر هنا — مع Redis Cache + Next.js Tags
// الترتيب: Redis → Sanity CDN → Next.js ISR Cache

import { client } from './client';
import { withCache, deleteCache } from '@/lib/cache/redis';

// ─── TTL Constants ────────────────────────────────────────────────────────────
const TTL = {
  HOME: 7200,       // 2 ساعة — الرئيسية تتغير نادراً
  CATEGORY: 7200,   // 2 ساعة — الأقسام ثابتة
  PRODUCT: 3600,    // 1 ساعة — المنتج يتغير أحياناً
  TRENDING: 1800,   // 30 دقيقة — Trending يتغير أكثر
  PRODUCTS: 3600,   // 1 ساعة
};

// ─── 1. بيانات الصفحة الرئيسية ───────────────────────────────────────────────
export async function getHomeData() {
  return withCache(
    'home:main',
    () => client.fetch(
      `{
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
          _id, title, slug, price, comparePrice, inStock, isNew, isTrending, images, colorVariants, sizes
        },
        "newArrivals": *[_type == "product" && isNew == true][0...8] {
          _id, title, slug, price, comparePrice, inStock, isNew, isTrending, images, colorVariants, sizes
        },
        "categories": *[_type == "category"][0...8] {
          _id, title, slug, "imageUrl": image.asset->url
        },
        "lookbooks": *[_type == "lookbook"][0...3] {
          _id, title, image,
          products[] {
            _key, x, y,
            product->{ _id, title, slug, price, images }
          }
        }
      }`,
      {},
      {
        next: {
          revalidate: TTL.HOME,
          tags: ['home', 'products', 'categories'],
        },
      }
    ),
    TTL.HOME
  );
}

// ─── 2. منتج واحد بالـ slug ──────────────────────────────────────────────────
export async function getProduct(slug: string) {
  const cacheKey = `product:${slug}`;

  return withCache(
    cacheKey,
    () => client.fetch(
      `*[_type == "product" && slug.current == $slug][0] {
        _id, title, slug, price, comparePrice, inStock, isNew, isTrending, images, description,
        colorVariants, sizes, stockQuantity,
        parentCategory->, subCategory->
      }`,
      { slug },
      {
        next: {
          revalidate: TTL.PRODUCT,
          tags: [`product-${slug}`, 'products'],
        },
      }
    ),
    TTL.PRODUCT
  );
}

// ─── 3. المنتجات المشابهة ─────────────────────────────────────────────────────
export async function getRelatedProducts(productId: string, categoryId: string) {
  const cacheKey = `related:${productId}`;

  return withCache(
    cacheKey,
    () => client.fetch(
      `*[_type == "product" && _id != $productId && parentCategory._ref == $categoryId] 
       | order(_createdAt desc) [0...8] {
        _id, title, slug, price, comparePrice, isNew, isTrending, inStock, images, colorVariants, sizes
      }`,
      { productId, categoryId },
      {
        next: {
          revalidate: TTL.PRODUCTS,
          tags: ['products', `category-products-${categoryId}`],
        },
      }
    ),
    TTL.PRODUCTS
  );
}

// ─── 4. بيانات القسم (Category) ──────────────────────────────────────────────
export async function getCategoryData(slug: string) {
  const cacheKey = `category:${slug}`;

  return withCache(
    cacheKey,
    () => client.fetch(
      `{
        "category": *[_type == "category" && slug.current == $slug][0] {
          title, "imageUrl": image.asset->url
        },
        "subcategories": *[_type == "subcategory" && parentCategory->slug.current == $slug] {
          _id, title, "slug": slug.current, "imageUrl": image.asset->url
        },
        "products": *[_type == "product" && parentCategory->slug.current == $slug] {
          _id, title, slug, price, comparePrice, inStock, isNew, isTrending, images,
          parentCategory->, subCategory->
        }
      }`,
      { slug },
      {
        next: {
          revalidate: TTL.CATEGORY,
          tags: [`category-${slug}`, 'categories', 'products'],
        },
      }
    ),
    TTL.CATEGORY
  );
}

// ─── 5. عنوان القسم فقط (للـ metadata) ─────────────────────────────────────
export async function getCategoryTitle(slug: string): Promise<{ title: string } | null> {
  const cacheKey = `category-title:${slug}`;

  return withCache(
    cacheKey,
    () => client.fetch(
      `*[_type == "category" && slug.current == $slug][0]{title}`,
      { slug },
      {
        next: {
          revalidate: TTL.CATEGORY,
          tags: [`category-${slug}`, 'categories'],
        },
      }
    ),
    TTL.CATEGORY
  );
}

// ─── 6. مسح الكاش عند تحديث المنتج في Sanity ───────────────────────────────
export async function invalidateProduct(slug: string, categoryId?: string) {
  const keys = [`product:${slug}`, 'home:main'];
  if (categoryId) keys.push(`related:${categoryId}`);
  await deleteCache(...keys);
}

export async function invalidateCategory(slug: string) {
  await deleteCache(`category:${slug}`, `category-title:${slug}`, 'home:main');
}

export async function invalidateAll() {
  await deleteCache('home:main');
}
