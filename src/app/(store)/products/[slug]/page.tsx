import { notFound } from 'next/navigation';
import { client, urlFor } from '@/lib/sanity/client';
import ProductImageGallery from '@/components/products/ProductImageGallery';
import ProductInfo from '@/components/products/ProductInfo';
import RelatedProducts from '@/components/products/RelatedProducts';
import RecentlyViewed from '@/components/products/RecentlyViewed';
import StoreFooter from '@/components/layout/StoreFooter';
import Breadcrumb from '@/components/ui/Breadcrumb';
import TrustBadges from '@/components/ui/TrustBadges';

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
      _id, title, slug, price, comparePrice, isNew, isTrending, inStock, images, colors, sizes
    }
  `;
  return await client.fetch(query, { productId, categoryId });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.slug);
  if (!product) return { title: 'Not Found' };

  const productUrl = `https://amigo-moda-app.vercel.app/products/${resolvedParams.slug}`;
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
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description,
      images: ogImageUrl ? [ogImageUrl] : [],
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

  const productUrl = `https://amigo-moda-app.vercel.app/products/${resolvedParams.slug}`;

  // Structured Data JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: typeof product.description === 'string' ? product.description : product.title,
    image: product.images?.map((img: any) =>
      urlFor(img).width(800).height(1067).url()
    ) ?? [],
    offers: {
      '@type': 'Offer',
      priceCurrency: 'DZD',
      price: product.price,
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: productUrl,
      seller: { '@type': 'Organization', name: 'Amigo Moda' },
    },
    brand: { '@type': 'Brand', name: 'Amigo Moda' },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: 'https://amigo-moda-app.vercel.app' },
      ...(product.parentCategory ? [{
        '@type': 'ListItem',
        position: 2,
        name: product.parentCategory.title,
        item: `https://amigo-moda-app.vercel.app/category/${product.parentCategory.slug?.current}`,
      }] : []),
      { '@type': 'ListItem', position: 3, name: product.title },
    ],
  };

  const breadcrumbItems = [
    { label: 'الرئيسية', href: '/' },
    ...(product.parentCategory
      ? [{ label: product.parentCategory.title, href: `/category/${product.parentCategory.slug?.current}` }]
      : []),
    { label: product.title },
  ];

  return (
    <main className="min-h-[100svh] bg-zinc-50">
      {/* Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

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

          {/* Product Details */}
          <div className="md:bg-white md:rounded-3xl md:overflow-hidden md:shadow-sm md:border md:border-zinc-100 md:self-start">
            <ProductInfo product={product} />
            {/* Trust Badges + Share */}
            <div className="px-4 pb-6">
              <TrustBadges
                productName={product.title}
                productPrice={product.price}
                productUrl={productUrl}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-zinc-100 mt-4">
          <RelatedProducts products={relatedProducts} />
        </div>
      )}

      {/* Recently Viewed */}
      <RecentlyViewed currentProductId={product._id} />

      <StoreFooter />
    </main>
  );
}
