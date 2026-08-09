'use client';

import { useEffect, useState } from 'react';
import { useRecentlyViewedStore } from '@/contexts/recently-viewed.store';
import ProductCard from './ProductCard';

export default function RecentlyViewed({ currentProductId }: { currentProductId?: string }) {
  const { items } = useRecentlyViewedStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const filteredItems = items.filter(item => item._id !== currentProductId).slice(0, 4);

  if (filteredItems.length === 0) return null;

  return (
    <div className="py-8 border-t border-zinc-100 mt-12 bg-white">
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        <h3 className="text-sm md:text-lg font-black tracking-widest uppercase text-zinc-900 mb-6">
          شاهدت مؤخراً
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {filteredItems.map((product, i) => (
            <ProductCard key={product._id} product={product} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
