import { notFound } from 'next/navigation';
import { client } from '@/lib/sanity/client';
import { CATEGORY_CONFIG } from '@/lib/config/categories';
import ProductListingPage from '@/components/products/ProductListingPage';

// Optional: you could make this dynamic, but statically generating speeds up performance
export const revalidate = 60; 

async function getProductsBySubCategory(parentSlug: string, subSlug: string) {
  const query = `
    *[_type == "product" && parentCategory->slug.current == $parentSlug && subCategory->slug.current == $subSlug] {
      _id, title, slug, price, comparePrice, inStock, isNew, isTrending, images,
      parentCategory->, subCategory->
    }
  `;
  return await client.fetch(query, { parentSlug, subSlug });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string, sub: string }> }) {
  const resolvedParams = await params;
  const config = CATEGORY_CONFIG[resolvedParams.slug as keyof typeof CATEGORY_CONFIG];
  if (!config) return { title: 'Not Found' };
  
  const subCat = config.subCategories.find(s => s.id === resolvedParams.sub);
  if (!subCat) return { title: 'Not Found' };

  return { title: `${subCat.name} | Amigo Moda` };
}

export default async function SubCategoryPage({ params }: { params: Promise<{ slug: string, sub: string }> }) {
  const resolvedParams = await params;
  const config = CATEGORY_CONFIG[resolvedParams.slug as keyof typeof CATEGORY_CONFIG];
  if (!config) notFound();

  const subCat = config.subCategories.find(s => s.id === resolvedParams.sub);
  if (!subCat) notFound();

  // Fetch products from Sanity matching this subcategory
  const products = await getProductsBySubCategory(resolvedParams.slug, resolvedParams.sub);

  return (
    <ProductListingPage 
      parentCategory={params.slug}
      subCategoryName={subCat.name}
      products={products}
    />
  );
}
