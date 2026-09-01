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

  const imageUrl = product.images?.[0]?.asset
    ? urlFor(product.images[0]).width(400).height(533).auto('format').quality(85).url()
    : null;

  const secondImageUrl = product.images?.[1]?.asset
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
      <div className={`aspect-[3/4] relative overflow-hidden rounded-xl bg-zinc-100 mb-2 transition-all duration-500 ${hovered ? 'shadow-[0_12px_35px_rgba(201,169,110,0.22)]' : 'shadow-sm'}`}>
        
        {/* Out of Stock Blur Overlay (Idea 62) */}
        {product.inStock === false && (
          <div className="absolute inset-0 z-20 bg-white/40 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-black text-white text-[10px] font-black px-4 py-2 uppercase tracking-widest rounded-sm rotate-[-15deg]">
              Rupture de stock
            </span>
          </div>
        )}



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
          {/* Stock Urgency (Idea 55) */}
          {product.inStock && product.stockCount && product.stockCount < 5 && (
            <span className="bg-yellow-500/90 backdrop-blur-md text-black text-[9px] font-black px-2.5 py-1 rounded-md shadow-sm border border-yellow-400/30">
              Vite, plus que {product.stockCount}!
            </span>
          )}
        </div>

        {/* أزرار الإجراءات (Hover) */}
        <div className="absolute top-12 right-2 z-10 flex flex-col gap-2 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
          {/* زر المفضلة */}
          <button
            onClick={e => { e.preventDefault(); toggleWishlist(product._id); }}
            className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full shadow-sm flex items-center justify-center hover:bg-white hover:scale-110 transition-all"
          >
            <Heart
              className={`w-3.5 h-3.5 transition-all ${wished ? 'fill-red-500 text-red-500 scale-110' : 'text-zinc-600'}`}
              strokeWidth={wished ? 0 : 1.5}
            />
          </button>
          {/* Compare Checkbox (Idea 54) */}
          <button
            onClick={e => { e.preventDefault(); }}
            className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full shadow-sm flex items-center justify-center hover:bg-white hover:scale-110 transition-all"
            title="Comparer"
          >
            <svg className="w-3.5 h-3.5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </button>
        </div>

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
                className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-300 text-xs uppercase font-bold tracking-widest">
            No Image
          </div>
        )}

        {/* Hover Add to Cart Bar (Idea 57 & 51) */}
        {product.inStock !== false && (
          <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10">
            {product.sizes?.length > 0 ? (
              <div className="bg-white/90 backdrop-blur-md rounded-lg p-2 shadow-lg border border-white/20">
                <p className="text-[9px] font-black text-center text-zinc-500 uppercase tracking-widest mb-1">Choisir Taille</p>
                <div className="flex justify-center gap-1 flex-wrap">
                  {product.sizes.map((size: any) => (
                    <button
                      key={size.label}
                      disabled={!size.inStock}
                      onClick={e => { e.preventDefault(); handleQuickAdd(e, size.label); }}
                      className={`w-7 h-7 rounded text-[10px] font-bold transition-all flex items-center justify-center ${
                        size.inStock
                          ? 'border border-zinc-200 hover:border-black hover:bg-black hover:text-white'
                          : 'border border-zinc-100 text-zinc-300 line-through cursor-not-allowed'
                      }`}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <button
                onClick={e => handleQuickAdd(e)}
                className={`w-full py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-lg ${
                  justAdded ? 'bg-emerald-500 text-white' : 'bg-black text-white hover:bg-[#C9A96E]'
                }`}
              >
                {justAdded ? 'Ajouté ✓' : 'Ajouter au Panier'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* معلومات المنتج */}
      <div className="flex flex-col gap-1.5 px-1 mt-2">
        {/* Title */}
        <h3 className="text-[11px] md:text-[12px] font-black uppercase tracking-tight text-zinc-900 leading-tight line-clamp-1">
          {product.title}
        </h3>

        {/* Rating Stars */}
        <div className="flex items-center gap-0.5">
          {[1,2,3,4,5].map(star => (
            <svg key={star} className={`w-2.5 h-2.5 ${star <= 4 ? 'text-[#C9A96E]' : 'text-zinc-200'}`} fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
          <span className="text-[9px] text-zinc-400 font-bold ml-1">({Math.floor(Math.random() * 50) + 12})</span>
        </div>

        {/* Price Row */}
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-black text-black leading-none">
            {product.price?.toLocaleString('fr-DZ')} <span className="text-[10px] font-bold text-zinc-400">DA</span>
          </span>
          {product.comparePrice && (
            <span className="text-[10px] text-zinc-300 line-through font-medium">
              {product.comparePrice?.toLocaleString('fr-DZ')}
            </span>
          )}
        </div>

        {/* Color Swatches */}
        {product.colorVariants && product.colorVariants.length > 0 ? (
          <div className="flex items-center gap-1.5">
            {product.colorVariants.slice(0, 5).map((color: any, idx: number) => (
              <div
                key={idx}
                className="w-3.5 h-3.5 rounded-full border border-zinc-200 shadow-sm"
                style={{ backgroundColor: color?.color || color }}
                title={color?.color || color}
              />
            ))}
            {product.colorVariants.length > 5 && <span className="text-[9px] text-zinc-400 font-bold">+{product.colorVariants.length - 5}</span>}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-3 h-3 rounded-full bg-black border border-zinc-200" />
            <div className="w-3 h-3 rounded-full bg-zinc-200 border border-zinc-200" />
          </div>
        )}
      </div>
    </Link>
  );
}
