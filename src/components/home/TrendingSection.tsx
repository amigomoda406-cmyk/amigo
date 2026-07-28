'use client';
import ProductCard from '@/components/products/ProductCard';

export default function TrendingSection({ products }: { products: any[] }) {
  if (!products || products.length === 0) return null;
  
  return (
    <section id="trending" className="p-4 border-b border-zinc-200 bg-white scroll-mt-[50px]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm md:text-xl font-black tracking-widest uppercase text-zinc-900">Trending Now</h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {products.slice(0, 4).map((product, i) => (
          <ProductCard key={product._id} product={product} index={i} />
        ))}
      </div>
    </section>
  );
}
