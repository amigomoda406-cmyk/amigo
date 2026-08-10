'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, SlidersHorizontal, X, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '@/components/products/ProductCard';

interface ProductListingPageProps {
  parentCategory: string;
  subCategoryName: string;
  products: any[];
}

export default function ProductListingPage({ parentCategory, subCategoryName, products }: ProductListingPageProps) {
  const [sortBy, setSortBy] = useState('newest');
  const [filterOpen, setFilterOpen] = useState(false);
  
  // Filter States
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(50000);
  const [priceRange, setPriceRange] = useState<number>(50000);

  // Lock scroll when filter is open
  useEffect(() => {
    document.body.style.overflow = filterOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [filterOpen]);

  // Extract available filters
  const { availableSizes, availableColors, maxAvailablePrice } = useMemo(() => {
    const sizes = new Set<string>();
    const colors = new Set<string>();
    let maxP = 0;
    
    products.forEach(p => {
      if (p.sizes) p.sizes.forEach((s: string) => sizes.add(s));
      if (p.colors) p.colors.forEach((c: string) => colors.add(c));
      if (p.price > maxP) maxP = p.price;
    });
    
    // Set initial max price dynamically based on products
    return { 
      availableSizes: Array.from(sizes), 
      availableColors: Array.from(colors), 
      maxAvailablePrice: maxP || 50000 
    };
  }, [products]);

  // Set initial price range once
  useEffect(() => {
    setMaxPrice(maxAvailablePrice);
    setPriceRange(maxAvailablePrice);
  }, [maxAvailablePrice]);

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  };

  const toggleColor = (color: string) => {
    setSelectedColors(prev => prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]);
  };

  const clearFilters = () => {
    setInStockOnly(false);
    setSelectedSizes([]);
    setSelectedColors([]);
    setPriceRange(maxAvailablePrice);
  };

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(p => {
      if (inStockOnly && !p.inStock) return false;
      if (p.price > priceRange) return false;
      if (selectedSizes.length > 0 && (!p.sizes || !p.sizes.some((s: string) => selectedSizes.includes(s)))) return false;
      if (selectedColors.length > 0 && (!p.colors || !p.colors.some((c: string) => selectedColors.includes(c)))) return false;
      return true;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return 0;
    });
  }, [products, sortBy, inStockOnly, priceRange, selectedSizes, selectedColors]);

  const activeFiltersCount = (inStockOnly ? 1 : 0) + selectedSizes.length + selectedColors.length + (priceRange < maxAvailablePrice ? 1 : 0);

  return (
    <main className="min-h-[100svh] bg-zinc-50 pb-0">
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

      {/* Title & Count & Filter Trigger */}
      <div className="px-4 py-5 flex items-end justify-between">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tighter text-zinc-900">{subCategoryName}</h2>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">
            {filteredAndSortedProducts.length} {filteredAndSortedProducts.length === 1 ? 'Article' : 'Articles'}
          </p>
        </div>
        <button 
          onClick={() => setFilterOpen(true)}
          className="flex items-center gap-2 bg-zinc-100 px-4 py-2 rounded-xl hover:bg-zinc-200 transition-colors relative"
        >
          <Filter className="w-4 h-4 text-zinc-900" />
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900">فلتر</span>
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Grid */}
      {filteredAndSortedProducts.length > 0 ? (
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
          {filteredAndSortedProducts.map((product, i) => (
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
          <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest mb-2">لا توجد منتجات</h3>
          <p className="text-xs text-zinc-500">حاول تغيير خيارات الفلترة أو الترتيب.</p>
          {activeFiltersCount > 0 && (
            <button onClick={clearFilters} className="mt-4 text-[10px] font-bold uppercase tracking-widest bg-zinc-900 text-white px-6 py-2 rounded-full">
              مسح الفلاتر
            </button>
          )}
        </div>
      )}

      {/* Filter Drawer */}
      <AnimatePresence>
        {filterOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFilterOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-[400px] bg-white z-[101] flex flex-col shadow-2xl"
              dir="rtl"
            >
              {/* Filter Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
                <h3 className="text-sm font-black tracking-widest uppercase text-zinc-900">تصفية النتائج</h3>
                <button onClick={() => setFilterOpen(false)} className="w-8 h-8 flex items-center justify-center bg-zinc-100 rounded-full hover:bg-zinc-200">
                  <X className="w-4 h-4 text-zinc-600" />
                </button>
              </div>

              {/* Filter Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* In Stock Toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-900">متوفر في المخزون فقط</span>
                  <button 
                    onClick={() => setInStockOnly(!inStockOnly)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${inStockOnly ? 'bg-blue-600' : 'bg-zinc-200'}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${inStockOnly ? 'left-1' : 'right-1'}`} />
                  </button>
                </div>

                {/* Price Range */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-zinc-900">السعر الأقصى</span>
                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                      {priceRange.toLocaleString('fr-DZ')} DA
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max={maxPrice} 
                    step="500"
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                  <div className="flex justify-between text-[8px] font-bold text-zinc-400 mt-2">
                    <span>0 DA</span>
                    <span>{maxPrice.toLocaleString('fr-DZ')} DA</span>
                  </div>
                </div>

                {/* Colors */}
                {availableColors.length > 0 && (
                  <div>
                    <span className="text-xs font-bold text-zinc-900 block mb-4">الألوان المتاحة</span>
                    <div className="flex flex-wrap gap-2">
                      {availableColors.map(color => (
                        <button
                          key={color}
                          onClick={() => toggleColor(color)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                            selectedColors.includes(color) 
                              ? 'bg-zinc-900 text-white border-zinc-900' 
                              : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sizes */}
                {availableSizes.length > 0 && (
                  <div>
                    <span className="text-xs font-bold text-zinc-900 block mb-4">المقاسات المتاحة</span>
                    <div className="flex flex-wrap gap-2">
                      {availableSizes.map(size => (
                        <button
                          key={size}
                          onClick={() => toggleSize(size)}
                          className={`w-10 h-10 flex items-center justify-center rounded-xl text-[10px] font-black uppercase transition-all border ${
                            selectedSizes.includes(size)
                              ? 'bg-zinc-900 text-white border-zinc-900'
                              : 'bg-white text-zinc-900 border-zinc-200 hover:border-zinc-300'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Filter Footer */}
              <div className="border-t border-zinc-100 p-6 flex gap-3 bg-white">
                <button 
                  onClick={clearFilters}
                  className="flex-1 py-3.5 rounded-xl border border-zinc-200 text-[10px] font-black tracking-widest uppercase text-zinc-600 hover:bg-zinc-50"
                >
                  مسح
                </button>
                <button 
                  onClick={() => setFilterOpen(false)}
                  className="flex-[2] py-3.5 rounded-xl bg-zinc-900 text-white text-[10px] font-black tracking-widest uppercase hover:bg-zinc-800 flex items-center justify-center gap-2"
                >
                  تطبيق ({filteredAndSortedProducts.length})
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
