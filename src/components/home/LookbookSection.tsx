'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { urlFor } from '@/lib/sanity/client';
import Link from 'next/link';
import { ShoppingBag, X } from 'lucide-react';
import { useCartStore } from '@/contexts/cart.store';

interface Hotspot {
  _key: string;
  x: number;
  y: number;
  product: any;
}

interface LookbookProps {
  lookbooks: {
    _id: string;
    title: string;
    image: any;
    products: Hotspot[];
  }[];
}

export default function LookbookSection({ lookbooks }: LookbookProps) {
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const { addItem } = useCartStore();

  if (!lookbooks || lookbooks.length === 0) return null;

  // For simplicity, we just take the first lookbook. 
  // You could make this a carousel in the future.
  const lookbook = lookbooks[0];

  const handleQuickAdd = (product: any) => {
    addItem({
      _id: product._id,
      title: product.title,
      price: product.price,
      image: product.images?.[0] ? urlFor(product.images[0]).url() : '',
      quantity: 1,
      slug: product.slug?.current,
    });
  };

  return (
    <section className="py-12 bg-white overflow-hidden">
      <div className="px-4 mb-8 text-center">
        <h2 className="text-3xl font-black uppercase tracking-tighter text-zinc-900 mb-2">تسوّق الإطلالة</h2>
        <p className="text-sm font-medium text-zinc-500">استلهم من أحدث تشكيلاتنا وتسوقها بضغطة زر</p>
      </div>

      <div className="relative w-full max-w-4xl mx-auto px-4">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[3/4] md:aspect-[16/9]">
          <img 
            src={urlFor(lookbook.image).width(1200).url()} 
            alt={lookbook.title || 'Lookbook'} 
            className="w-full h-full object-cover"
          />
          
          {/* Dark Overlay for better contrast */}
          <div className="absolute inset-0 bg-black/10 pointer-events-none" />

          {/* Hotspots */}
          {lookbook.products?.map((hotspot) => (
            <div 
              key={hotspot._key}
              className="absolute"
              style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
            >
              {/* Pulse Dot */}
              <button
                onClick={() => setActiveHotspot(activeHotspot?._key === hotspot._key ? null : hotspot)}
                className="relative -translate-x-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center group"
                aria-label="View product"
              >
                <span className="absolute w-full h-full bg-white rounded-full opacity-40 animate-ping group-hover:opacity-60 transition-opacity"></span>
                <span className="relative w-3 h-3 bg-white rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] border-2 border-zinc-900"></span>
              </button>

              {/* Product Popup */}
              <AnimatePresence>
                {activeHotspot?._key === hotspot._key && hotspot.product && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    className="absolute z-10 w-48 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-3 border border-white/50"
                    style={{ 
                      // Simple positioning logic to keep popup inside bounds (left/right)
                      left: hotspot.x > 50 ? 'auto' : '100%',
                      right: hotspot.x > 50 ? '100%' : 'auto',
                      marginLeft: hotspot.x > 50 ? '0' : '12px',
                      marginRight: hotspot.x > 50 ? '12px' : '0',
                      top: '50%',
                      transform: 'translateY(-50%)'
                    }}
                  >
                    <button 
                      onClick={() => setActiveHotspot(null)}
                      className="absolute top-2 right-2 w-5 h-5 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-500 hover:text-zinc-900 z-20"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    
                    <Link href={`/products/${hotspot.product.slug?.current}`} className="block relative aspect-square rounded-xl overflow-hidden mb-2">
                      <img 
                        src={hotspot.product.images?.[0] ? urlFor(hotspot.product.images[0]).width(200).url() : ''}
                        alt={hotspot.product.title}
                        className="w-full h-full object-cover"
                      />
                    </Link>
                    
                    <div>
                      <Link href={`/products/${hotspot.product.slug?.current}`}>
                        <h3 className="text-[11px] font-bold text-zinc-900 line-clamp-1 mb-1">{hotspot.product.title}</h3>
                      </Link>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-zinc-900">{hotspot.product.price} DA</span>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            handleQuickAdd(hotspot.product);
                            setActiveHotspot(null);
                          }}
                          className="w-7 h-7 bg-zinc-900 text-white rounded-full flex items-center justify-center hover:bg-zinc-800 transition-colors shadow-lg"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
