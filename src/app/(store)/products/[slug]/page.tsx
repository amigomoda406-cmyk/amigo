import { notFound } from 'next/navigation';
import { client } from '@/lib/sanity/client';
import ProductImageGallery from '@/components/products/ProductImageGallery';
import ProductInfo from '@/components/products/ProductInfo';
import ProductHeader from '@/components/products/ProductHeader';
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

  return (
    <main className="min-h-[100svh] bg-zinc-50 pb-[10px]">
      <ProductHeader />

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

      <StoreFooter />
    </main>
  );
}
