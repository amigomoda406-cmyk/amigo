import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { CATEGORY_CONFIG } from '@/lib/config/categories';
import SubCategoryCard from '@/components/categories/SubCategoryCard';
import { client } from '@/lib/sanity/client';
import ProductCard from '@/components/products/ProductCard';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const config = CATEGORY_CONFIG[resolvedParams.slug as keyof typeof CATEGORY_CONFIG];
  if (!config) return { title: 'Not Found' };
  return { title: `${config.nameFr} | Amigo Moda` };
}

async function getProductsByCategory(parentSlug: string) {
  const query = `
    *[_type == "product" && parentCategory->slug.current == $parentSlug] {
      _id, title, slug, price, comparePrice, inStock, isNew, isTrending, images,
      parentCategory->, subCategory->
    }
  `;
  return await client.fetch(query, { parentSlug });
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const config = CATEGORY_CONFIG[resolvedParams.slug as keyof typeof CATEGORY_CONFIG];
  
  if (!config) {
    notFound();
  }

  const products = await getProductsByCategory(resolvedParams.slug);

  return (
    <main className="min-h-[100svh] bg-zinc-50 pb-[80px]">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center gap-3 px-4 py-3 bg-white/80 backdrop-blur-md border-b border-zinc-100">
        <Link 
          href="/" 
          className="w-8 h-8 flex items-center justify-center rounded-[10px] bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-sm font-black tracking-widest uppercase text-zinc-900">{config.nameFr}</h1>
      </header>

      {/* Hero Banner */}
      <div className="relative h-[120px] w-full overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${config.featuredImage}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-4 left-4">
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-1">{config.nameFr}</h2>
          <span className="text-[9px] font-bold text-white/80 uppercase tracking-widest px-2 py-0.5 bg-white/10 rounded-full backdrop-blur-sm border border-white/20">
            {config.subCategories.length} Collections
          </span>
        </div>
      </div>

      {/* Sub Categories List */}
      <div className="p-4">
        <div className="mb-4">
          <h3 className="text-[11px] font-black uppercase text-zinc-900 tracking-widest">Explorez</h3>
          <p className="text-[10px] text-zinc-500 font-medium mt-0.5">Choisissez votre catégorie</p>
        </div>
        
        <div className="flex flex-col gap-2.5 mb-8">
          {config.subCategories.map((sub) => (
            <SubCategoryCard key={sub.id} sub={sub} accentColor={config.accentColor} />
          ))}
        </div>

        {/* All Products in Category */}
        <div className="mb-4">
          <h3 className="text-[11px] font-black uppercase text-zinc-900 tracking-widest">Tous les produits</h3>
          <p className="text-[10px] text-zinc-500 font-medium mt-0.5">Dernières nouveautés</p>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-max">
            {products.map((product: any, i: number) => {
              // Bento Grid: Make the first item larger (Editorial style)
              const isFeatured = i === 0;
              return (
                <div 
                  key={product._id} 
                  className={`${isFeatured ? 'col-span-2 row-span-2' : 'col-span-1'} transition-all`}
                >
                  <ProductCard product={product} index={i} />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center bg-white rounded-xl border border-zinc-100 text-center px-4" style={{ borderColor: config.accentColor + '33' }}>
            <span className="text-3xl mb-3">🛒</span>
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900 mb-1" style={{ color: config.accentColor }}>Aucun produit</h3>
            <p className="text-[10px] text-zinc-500 font-bold max-w-[200px]">Nous ajoutons de nouveaux produits bientôt.</p>
          </div>
        )}
      </div>
    </main>
  );
}
