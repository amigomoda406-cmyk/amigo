import { notFound } from 'next/navigation';
import { client } from '@/lib/sanity/client';
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

async function getSubCategoryDetails(parentSlug: string, subSlug: string) {
  const query = `
    *[_type == "subcategory" && parentCategory->slug.current == $parentSlug && slug.current == $subSlug][0] {
      title
    }
  `;
  return await client.fetch(query, { parentSlug, subSlug });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string, sub: string }> }) {
  const resolvedParams = await params;
  const subCat = await getSubCategoryDetails(resolvedParams.slug, resolvedParams.sub);
  
  if (!subCat) return { title: 'Not Found' };

  return { title: `${subCat.title} | Amigo Moda` };
}

export default async function SubCategoryPage({ params }: { params: Promise<{ slug: string, sub: string }> }) {
  const resolvedParams = await params;
  
  const subCat = await getSubCategoryDetails(resolvedParams.slug, resolvedParams.sub);
  if (!subCat) notFound();

  // Fetch products from Sanity matching this subcategory
  const products = await getProductsBySubCategory(resolvedParams.slug, resolvedParams.sub);

  return (
    <ProductListingPage 
      parentCategory={resolvedParams.slug}
      subCategoryName={subCat.title}
      products={products}
    />
  );
}
