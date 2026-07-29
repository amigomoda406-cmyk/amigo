'use client';
import ProductCard from '@/components/products/ProductCard';

export default function TrendingSection({ products }: { products: any[] }) {
  if (!products || products.length === 0) return null;
  
  return (
    <section id="trending" className="p-4 border-b border-zinc-200 bg-white scroll-mt-[50px]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm md:text-xl font-black tracking-widest uppercase text-zinc-900">Trending Now</h3>
      </div>
      <div className="flex overflow-x-auto snap-x snap-mandatory gap-2 md:gap-4 no-scrollbar pb-2">
        {products.slice(0, 8).map((product, i) => (
          <div key={product._id} className="w-[31%] md:w-[23%] shrink-0 snap-start">
            <ProductCard product={product} index={i} />
          </div>
        ))}
      </div>
    </section>
  );
}
