'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import ProductCard from '@/components/products/ProductCard';

interface ProductListingPageProps {
  parentCategory: string;
  subCategoryName: string;
  products: any[];
}

export default function ProductListingPage({ parentCategory, subCategoryName, products }: ProductListingPageProps) {
  const [sortBy, setSortBy] = useState('newest');

  // Basic client-side sorting
  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    return 0; // fallback to newest/default
  });

  return (
    <main className="min-h-[100svh] bg-zinc-50 pb-[80px]">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-md border-b border-zinc-100">
        <div className="flex items-center gap-3">
          <Link 
            href={`/category/${parentCategory}`} 
            className="w-8 h-8 flex items-center justify-center rounded-[10px] bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-sm font-black tracking-widest uppercase text-zinc-900">{subCategoryName}</h1>
        </div>
        
        {/* Simple Sort Dropdown */}
        <div className="relative">
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="appearance-none bg-zinc-100 text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-[8px] border-none outline-none pr-8 cursor-pointer text-zinc-700"
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Prix Croissant</option>
            <option value="price-desc">Prix Décroissant</option>
          </select>
          <SlidersHorizontal className="w-3 h-3 text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </header>

      {/* Title & Count */}
      <div className="px-4 py-5 flex items-end justify-between">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tighter text-zinc-900">{subCategoryName}</h2>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">
            {products.length} {products.length === 1 ? 'Article' : 'Articles'}
          </p>
        </div>
      </div>

      {/* Grid */}
      {products.length > 0 ? (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.1 }
            }
          }}
          className="px-4 grid grid-cols-2 gap-2"
        >
          {sortedProducts.map((product, i) => (
            <motion.div
              key={product._id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
              }}
            >
              <ProductCard product={product} index={i} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="w-16 h-16 bg-zinc-200 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">😕</span>
          </div>
          <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest mb-2">Aucun Produit</h3>
          <p className="text-xs text-zinc-500">Revenez plus tard pour découvrir nos nouveautés.</p>
        </div>
      )}
    </main>
  );
}
