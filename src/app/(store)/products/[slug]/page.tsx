import { notFound } from 'next/navigation';
import { client } from '@/lib/sanity/client';
import ProductImageGallery from '@/components/products/ProductImageGallery';
import ProductInfo from '@/components/products/ProductInfo';
import RelatedProducts from '@/components/products/RelatedProducts';
import StoreFooter from '@/components/layout/StoreFooter';

// Revalidate every 60 seconds
export const revalidate = 60;

async function getProduct(slug: string) {
  const query = `
    *[_type == "product" && slug.current == $slug][0] {
      _id, title, slug, price, comparePrice, inStock, isNew, isTrending, images, description,
      colors, sizes,
      parentCategory->, subCategory->
    }
  `;
  return await client.fetch(query, { slug });
}

async function getRelatedProducts(productId: string, categoryId: string) {
  const query = `
    *[_type == "product" && _id != $productId && parentCategory._ref == $categoryId] | order(_createdAt desc) [0...8] {
      _id, title, slug, price, comparePrice, isNew, isTrending, images
    }
  `;
  return await client.fetch(query, { productId, categoryId });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.slug);
  if (!product) return { title: 'Not Found' };
  return { title: `${product.title} | Amigo Moda` };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.slug);
  
  if (!product) {
    notFound();
  }

  const relatedProducts = product.parentCategory?._id
    ? await getRelatedProducts(product._id, product.parentCategory._id)
    : [];

  return (
    <main className="min-h-[100svh] bg-zinc-50 pb-[10px]">

      <div className="max-w-5xl mx-auto md:grid md:grid-cols-2 md:gap-8 md:p-8">
        {/* Gallery */}
        <div className="md:bg-white md:rounded-3xl md:overflow-hidden md:shadow-sm md:border md:border-zinc-100">
          <ProductImageGallery images={product.images || []} title={product.title} />
        </div>

        {/* Product Details (Info, Pricing, Variants, Add to Cart) */}
        <div className="md:bg-white md:rounded-3xl md:overflow-hidden md:shadow-sm md:border md:border-zinc-100 md:self-start">
          <ProductInfo product={product} />
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-zinc-100 mt-4">
          <RelatedProducts products={relatedProducts} />
        </div>
      )}

      <StoreFooter />
    </main>
  );
}

