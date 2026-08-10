'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Plus, Heart, Flame } from 'lucide-react';
import { useCartStore } from '@/contexts/cart.store';
import { useWishlistStore } from '@/contexts/wishlist.store';
import { urlFor } from '@/lib/sanity/client';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductCardProps {
  product: any;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const addItem = useCartStore(state => state.addItem);
  const { toggle: toggleWishlist, isWished } = useWishlistStore();
  const wished = isWished(product._id);
  const [showSizes, setShowSizes] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [hovered, setHovered] = useState(false);

  const imageUrl = product.images?.[0]?.asset?.url
    ? urlFor(product.images[0]).width(400).height(533).auto('format').quality(85).url()
    : null;

  const secondImageUrl = product.images?.[1]?.asset?.url
    ? urlFor(product.images[1]).width(400).height(533).auto('format').quality(85).url()
    : null;

  const discountPercent = product.comparePrice
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : null;

  const handleQuickAdd = (e: React.MouseEvent, size?: string) => {
    e.preventDefault();
    if (product.sizes?.length > 0 && !size) {
      setShowSizes(true);
      return;
    }
    const rawImage = product.images?.[0];
    const imgUrl = rawImage?.asset ? urlFor(rawImage).width(400).height(500).url() : '';
    addItem({
      productId: product._id,
      title: product.title,
      price: product.price,
      comparePrice: product.comparePrice,
      imageUrl: imgUrl,
      slug: product.slug?.current,
      selectedSize: size,
      quantity: 1,
    });
    setShowSizes(false);
    setJustAdded(true);
    if ('vibrate' in navigator) navigator.vibrate(20);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <Link
      href={`/products/${product.slug?.current || '#'}`}
      className="flex flex-col group relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* صورة المنتج */}
      <div className={`aspect-[3/4] relative overflow-hidden rounded-xl bg-zinc-100 mb-2 transition-shadow duration-500 ${hovered ? 'shadow-[0_12px_35px_rgba(201,169,110,0.22)]' : 'shadow-sm'}`}>
        
        {/* البادجات المخصصة */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
          {discountPercent && (
            <span className="bg-red-600/90 backdrop-blur-md text-white text-[9px] font-black px-2.5 py-1 rounded-md shadow-sm border border-red-500/30 animate-pulse">
              -{discountPercent}%
            </span>
          )}
          {product.isNew && !discountPercent && (
            <span className="badge-new-shimmer text-white text-[9px] font-black px-2.5 py-1 rounded-md shadow-sm border border-zinc-700/50">
              NOUVEAU
            </span>
          )}
          {product.isTrending && (
            <span className="bg-orange-500/90 backdrop-blur-md text-white text-[9px] font-black px-2.5 py-1 rounded-md shadow-sm border border-orange-400/30 flex items-center gap-1">
              <Flame className="w-3 h-3" /> HOT
            </span>
          )}
        </div>

        {/* زر المفضلة */}
        <button
          onClick={e => { e.preventDefault(); toggleWishlist(product._id); }}
          className="absolute top-2 right-2 z-10 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
        >
          <Heart
            className={`w-3.5 h-3.5 transition-all ${wished ? 'fill-red-500 text-red-500 scale-110' : 'text-zinc-600'}`}
            strokeWidth={wished ? 0 : 1.5}
          />
        </button>

        {/* الصور */}
        {imageUrl ? (
          <>
            <Image
              src={imageUrl}
              alt={product.title}
              fill
              className={`object-cover transition-all duration-700 ${secondImageUrl ? 'group-hover:opacity-0' : 'group-hover:scale-105'}`}
              sizes="(max-width: 768px) 50vw, 25vw"
            />
            {secondImageUrl && (
              <Image
                src={secondImageUrl}
                alt={product.title}
                fill
                className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-300 text-xs uppercase font-bold tracking-widest">
            No Image
          </div>
        )}

        {/* زر Quick Add */}
        {product.inStock !== false && (
          <button
            onClick={e => handleQuickAdd(e)}
            className={`absolute bottom-2 right-2 z-10 w-9 h-9 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 ${
              justAdded ? 'bg-emerald-500 text-white scale-110' : 'bg-white text-zinc-900 hover:bg-zinc-900 hover:text-white'
            }`}
          >
            {justAdded ? (
              <span className="text-[10px] font-black">✓</span>
            ) : (
              <Plus className="w-4 h-4" strokeWidth={2} />
            )}
          </button>
        )}

        {/* Size Picker Overlay */}
        <AnimatePresence>
          {showSizes && product.sizes?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center gap-2 p-3 z-20"
              onClick={e => e.preventDefault()}
            >
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">اختر المقاس</p>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {product.sizes.map((size: any) => (
                  <button
                    key={size.label}
                    disabled={!size.inStock}
                    onClick={e => { e.preventDefault(); handleQuickAdd(e, size.label); }}
                    className={`px-3 py-1.5 text-[10px] font-black border rounded-lg transition-all ${
                      size.inStock
                        ? 'border-zinc-200 text-zinc-900 hover:bg-zinc-900 hover:text-white hover:border-zinc-900'
                        : 'border-zinc-100 text-zinc-300 line-through cursor-not-allowed'
                    }`}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
              <button
                onClick={e => { e.preventDefault(); setShowSizes(false); }}
                className="text-[8px] text-zinc-400 mt-1 underline"
              >
                إلغاء
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* نفد المخزون */}
        {product.inStock === false && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-xl">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">نفد المخزون</span>
          </div>
        )}
      </div>

      {/* معلومات المنتج */}
      <div className="px-0.5">
        <p className="text-[11px] md:text-sm font-black uppercase tracking-tight text-zinc-900 leading-tight line-clamp-1">
          {product.title}
        </p>

        {/* الألوان المتاحة */}
        {product.colors?.length > 0 && (
          <div className="flex gap-1 mt-1">
            {product.colors.slice(0, 5).map((c: any) => (
              <div
                key={c.name}
                className="w-3 h-3 rounded-full border border-zinc-200"
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
          </div>
        )}

        {/* السعر */}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[11px] md:text-sm font-black text-zinc-900">
            {product.price?.toLocaleString('fr-DZ')} DA
          </span>
          {product.comparePrice && (
            <span className="text-[10px] text-zinc-400 line-through">
              {product.comparePrice?.toLocaleString('fr-DZ')} DA
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
