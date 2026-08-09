'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCartStore, useCartTotalItems } from '@/contexts/cart.store';
import { useLangStore } from '@/contexts/lang.store';
import FloatingCart from '@/components/cart/FloatingCart';
import SidebarNav from './SidebarNav';
import { useEffect, useRef, useState } from 'react';

export default function Header() {
  const openCart = useCartStore((state) => state.openCart);
  const totalItems = useCartTotalItems();
  const prevTotal = useRef(totalItems);
  const [bounce, setBounce] = useState(false);
  const { lang } = useLangStore();

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  useEffect(() => {
    if (totalItems > prevTotal.current) {
      setBounce(true);
      const t = setTimeout(() => setBounce(false), 600);
      prevTotal.current = totalItems;
      return () => clearTimeout(t);
    }
    prevTotal.current = totalItems;
  }, [totalItems]);

  return (
    <>
      <style>{`
        @keyframes cartBounce {
          0%   { transform: scale(1) rotate(0deg); }
          20%  { transform: scale(1.4) rotate(-15deg); }
          40%  { transform: scale(1.2) rotate(10deg); }
          60%  { transform: scale(1.3) rotate(-8deg); }
          80%  { transform: scale(1.1) rotate(5deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        .cart-bounce { animation: cartBounce 0.6s ease-out forwards; }
        @keyframes badgePop {
          0%   { transform: scale(0); }
          60%  { transform: scale(1.4); }
          100% { transform: scale(1); }
        }
        .badge-pop { animation: badgePop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
      `}</style>

      {/* Dynamic LTR/RTL applied globally. Removed translate="no" */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-zinc-100/50 w-full transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          
          {/* Left/Right: Hamburger Menu (SidebarNav handles its own direction) */}
          <div className="flex-1 flex items-center justify-start">
            <SidebarNav />
          </div>

          {/* Center: Logo */}
          <Link href="/" className="flex-shrink-0 flex flex-col items-center justify-center group">
            <h1 className="text-xl md:text-2xl font-black tracking-[0.2em] text-zinc-900 group-hover:scale-105 transition-transform duration-500 uppercase" style={{ fontFamily: 'var(--font-outfit)' }}>
              Amigo Moda
            </h1>
            <div className="w-0 h-[2px] bg-zinc-900 mt-1 group-hover:w-full transition-all duration-500 ease-out" />
          </Link>

          {/* Right/Left: Cart */}
          <div className="flex-1 flex items-center justify-end">
            <button
              onClick={openCart}
              className={`relative p-2 -mx-2 text-zinc-900 hover:text-zinc-600 transition-colors ${bounce ? 'cart-bounce' : ''}`}
            >
              <ShoppingCart className="w-6 h-6 stroke-[1.5]" />
              {totalItems > 0 && (
                <span key={totalItems} className="badge-pop absolute top-0 right-0 bg-zinc-900 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold translate-x-1 -translate-y-1 shadow-sm">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
      
      <FloatingCart />
    </>
  );
}
