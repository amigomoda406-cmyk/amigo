import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import SubCategoryCard from '@/components/categories/SubCategoryCard';
import CategoryFilters from '@/components/categories/CategoryFilters';
import { client } from '@/lib/sanity/client';
import ProductCard from '@/components/products/ProductCard';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const query = `*[_type == "category" && slug.current == $slug][0]{title}`;
  const category = await client.fetch(query, { slug: resolvedParams.slug });
  if (!category) return { title: 'Not Found' };
  return { title: `${category.title} | Amigo Moda` };
}

async function getCategoryData(slug: string) {
  const query = `
    {
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
    }
  `;
  return await client.fetch(query, { slug });
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  
  const data = await getCategoryData(resolvedParams.slug);
  
  if (!data.category) {
    notFound();
  }

  const { category, subcategories, products } = data;
  const accentColor = '#C9A96E'; // Using the global brand accent color

  return (
    <main className="min-h-[100svh] bg-zinc-50 pb-0">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center gap-3 px-4 py-3 bg-white/80 backdrop-blur-md border-b border-zinc-100">
        <Link 
          href="/" 
          className="w-8 h-8 flex items-center justify-center rounded-[10px] bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-sm font-black tracking-widest uppercase text-zinc-900">{category.title}</h1>
      </header>

      {/* Hero Banner */}
      <div className="relative h-[30vh] min-h-[250px] w-full overflow-hidden">
        {category.imageUrl && (
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${category.imageUrl}')` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/90 via-zinc-900/40 to-transparent" />
        <div className="absolute bottom-6 left-6">
          <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-2">{category.title}</h2>
          <span className="text-[10px] font-bold text-white/90 uppercase tracking-widest px-3 py-1 bg-white/10 rounded-full backdrop-blur-md border border-white/20">
            {subcategories.length} Collections
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
          {subcategories.map((sub: any) => (
            <SubCategoryCard key={sub._id} sub={sub} accentColor={accentColor} />
          ))}
        </div>

        {/* All Products in Category */}
        <div className="mb-4">
          <h3 className="text-[11px] font-black uppercase text-zinc-900 tracking-widest">Tous les produits</h3>
          <p className="text-[10px] text-zinc-500 font-medium mt-0.5">Dernières nouveautés</p>
        </div>

        <CategoryFilters />

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
          <div className="py-12 flex flex-col items-center justify-center bg-white rounded-xl border border-zinc-100 text-center px-4" style={{ borderColor: accentColor + '33' }}>
            <span className="text-3xl mb-3">🛒</span>
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900 mb-1" style={{ color: accentColor }}>Aucun produit</h3>
            <p className="text-[10px] text-zinc-500 font-bold max-w-[200px]">Nous ajoutons de nouveaux produits bientôt.</p>
          </div>
        )}
      </div>
    </main>
  );
}
