import { notFound } from 'next/navigation';
import { urlFor } from '@/lib/sanity/client';
import { getProduct, getRelatedProducts } from '@/lib/sanity/queries';
import ProductImageGallery from '@/components/products/ProductImageGallery';
import ProductInfo from '@/components/products/ProductInfo';
import RelatedProducts from '@/components/products/RelatedProducts';
import StoreFooter from '@/components/layout/StoreFooter';
import Breadcrumb from '@/components/ui/Breadcrumb';

// ✅ ISR: 1 ساعة
export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.slug);
  if (!product) return { title: 'Not Found' };

  const productUrl = `https://amigomoda.store/products/${resolvedParams.slug}`;
  const ogImageUrl = product.images?.[0]
    ? urlFor(product.images[0]).width(1200).height(630).auto('format').quality(85).url()
    : null;

  const description = `${product.title} — ${product.price?.toLocaleString('fr-DZ')} DA. توصيل لجميع الولايات الـ 58 في الجزائر.`;

  return {
    title: `${product.title} | Amigo Moda`,
    description,
    openGraph: {
      title: product.title,
      description,
      url: productUrl,
      siteName: 'Amigo Moda',
      type: 'website',
      images: ogImageUrl
        ? [{ url: ogImageUrl, width: 1200, height: 630, alt: product.title }]
        : [],
    },
  };
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

  const breadcrumbItems = [
    { label: 'الرئيسية', href: '/' },
    ...(product.parentCategory
      ? [{ label: product.parentCategory.title, href: `/category/${product.parentCategory.slug?.current}` }]
      : []),
    { label: product.title },
  ];

  return (
    <main className="min-h-[100svh] bg-zinc-50">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <div className="px-4 md:px-8 pt-2">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        <div className="md:grid md:grid-cols-2 md:gap-8 md:px-8 md:pb-8">
          {/* Gallery */}
          <div className="md:bg-white md:rounded-3xl md:overflow-hidden md:shadow-sm md:border md:border-zinc-100">
            <ProductImageGallery images={product.images || []} title={product.title} />
          </div>

          {/* Product Info */}
          <div className="md:bg-white md:rounded-3xl md:overflow-hidden md:shadow-sm md:border md:border-zinc-100 md:self-start">
            <ProductInfo product={product} />
          </div>
        </div>
      </div>

      {/* Related Products ONLY */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-zinc-100 mt-8 pt-8">
          <RelatedProducts products={relatedProducts} />
        </div>
      )}

      <StoreFooter />
    </main>
  );
}
