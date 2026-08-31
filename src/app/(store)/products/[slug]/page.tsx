import { notFound } from 'next/navigation';
import { urlFor } from '@/lib/sanity/client';
import { getProduct, getRelatedProducts } from '@/lib/sanity/queries';
import ProductImageGallery from '@/components/products/ProductImageGallery';
import ProductInfo from '@/components/products/ProductInfo';
import RelatedProducts from '@/components/products/RelatedProducts';
import RecentlyViewed from '@/components/products/RecentlyViewed';
import ProductReviews from '@/components/products/ProductReviews';
import StoreFooter from '@/components/layout/StoreFooter';
import Breadcrumb from '@/components/ui/Breadcrumb';
import TrustBadges from '@/components/ui/TrustBadges';

// ✅ ISR: 1 ساعة — Redis + Cloudflare سيغطيان الباقي
export const revalidate = 3600;

// ✅ Queries مُركزية في lib/sanity/queries.ts (مع Redis Cache)
// لا نكتب fetch مباشرة هنا

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

      {/* Trust Badges */}
      <div className="mt-8 border-t border-zinc-100 pt-8">
        <TrustBadges />
      </div>

      {/* Frequently Bought Together (Idea 88) */}
      {relatedProducts.length >= 2 && (
        <div className="mt-8 pt-8 border-t border-zinc-100 max-w-5xl mx-auto px-4 md:px-8">
          <h2 className="text-sm font-black uppercase tracking-widest text-zinc-900 mb-6">Souvent achetés ensemble</h2>
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-zinc-100 flex flex-col md:flex-row items-center gap-6">
            <div className="flex items-center gap-4 flex-1">
              {/* Current Product */}
              <div className="flex flex-col items-center gap-2 w-1/3">
                <div className="w-24 h-24 rounded-xl bg-zinc-50 overflow-hidden shrink-0">
                  {product.images?.[0] && <img src={urlFor(product.images[0]).width(200).height(200).url()} alt={product.title} className="w-full h-full object-cover" />}
                </div>
                <span className="text-[10px] font-bold text-zinc-900 text-center line-clamp-1">{product.title}</span>
                <span className="text-[10px] font-black text-[#C9A96E]">{product.price} DA</span>
              </div>
              <span className="text-xl font-black text-zinc-300">+</span>
              {/* Related Product 1 */}
              <div className="flex flex-col items-center gap-2 w-1/3">
                <div className="w-24 h-24 rounded-xl bg-zinc-50 overflow-hidden shrink-0">
                  {relatedProducts[0]?.images?.[0] && <img src={urlFor(relatedProducts[0].images[0]).width(200).height(200).url()} alt={relatedProducts[0].title} className="w-full h-full object-cover" />}
                </div>
                <span className="text-[10px] font-bold text-zinc-900 text-center line-clamp-1">{relatedProducts[0]?.title}</span>
                <span className="text-[10px] font-black text-[#C9A96E]">{relatedProducts[0]?.price} DA</span>
              </div>
              <span className="text-xl font-black text-zinc-300">+</span>
              {/* Related Product 2 */}
              <div className="flex flex-col items-center gap-2 w-1/3">
                <div className="w-24 h-24 rounded-xl bg-zinc-50 overflow-hidden shrink-0">
                  {relatedProducts[1]?.images?.[0] && <img src={urlFor(relatedProducts[1].images[0]).width(200).height(200).url()} alt={relatedProducts[1].title} className="w-full h-full object-cover" />}
                </div>
                <span className="text-[10px] font-bold text-zinc-900 text-center line-clamp-1">{relatedProducts[1]?.title}</span>
                <span className="text-[10px] font-black text-[#C9A96E]">{relatedProducts[1]?.price} DA</span>
              </div>
            </div>
            
            <div className="flex flex-col items-center md:items-start gap-3 md:pl-8 md:border-l md:border-zinc-100">
              <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Prix Total du Pack</p>
              <p className="text-2xl font-black text-red-600">
                {(product.price + relatedProducts[0].price + relatedProducts[1].price).toLocaleString('fr-DZ')} DA
              </p>
              <button className="bg-zinc-900 text-white w-full px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest hover:bg-[#C9A96E] transition-colors">
                Ajouter les 3 au Panier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reviews */}
      <ProductReviews productId={product._id} />

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-zinc-100 mt-8 pt-8">
          <RelatedProducts products={relatedProducts} />
        </div>
      )}

      {/* Recently Viewed */}
      <RecentlyViewed currentProductId={product._id} />

      <StoreFooter />
    </main>
  );
}
