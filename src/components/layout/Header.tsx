'use client';

import Link from 'next/link';
import { ShoppingCart, Globe, Home, LayoutGrid } from 'lucide-react';
import { useCartStore, useCartTotalItems } from '@/contexts/cart.store';
import { useLangStore } from '@/contexts/lang.store';
import FloatingCart from '@/components/cart/FloatingCart';
import { useEffect, useRef, useState } from 'react';

export default function Header() {
  const openCart = useCartStore((state) => state.openCart);
  const totalItems = useCartTotalItems();
  const prevTotal = useRef(totalItems);
  const [bounce, setBounce] = useState(false);
  const { lang, toggleLang } = useLangStore();

  // Sync lang to document
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  // Trigger bounce animation when item is added
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
        .cart-bounce {
          animation: cartBounce 0.6s ease-out forwards;
        }
        @keyframes badgePop {
          0%   { transform: scale(0); }
          60%  { transform: scale(1.4); }
          100% { transform: scale(1); }
        }
        .badge-pop {
          animation: badgePop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>

      {/* 
        Transparent background, smaller for mobile
      */}
      <header dir="ltr" translate="no" className="notranslate flex items-center justify-between px-3 md:px-6 py-2 md:py-4 sticky top-0 z-50 bg-transparent text-zinc-900 w-full backdrop-blur-sm">
        
        {/* Left Side: Logo */}
        <Link href="/" className="flex-shrink-0 group">
          <h1 className="text-xl md:text-3xl font-medium tracking-wide text-zinc-900 drop-shadow-sm" style={{ fontFamily: 'cursive' }}>
            AMIGO MODA
          </h1>
        </Link>

        {/* Middle-Left: Cart Icon (Desktop) */}
        <div className="hidden lg:flex flex-1 justify-end pr-8">
          <button
            onClick={openCart}
            className={`relative p-2 text-zinc-900 hover:text-zinc-600 transition-colors ${bounce ? 'cart-bounce' : ''}`}
          >
            <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 stroke-[1.5]" />
            {totalItems > 0 && (
              <span
                key={totalItems}
                className="badge-pop absolute 0 -right-1 bg-zinc-900 text-white text-[9px] md:text-[10px] w-3.5 h-3.5 md:w-4 md:h-4 rounded-full flex items-center justify-center font-black shadow-sm"
              >
                {totalItems}
              </span>
            )}
          </button>
        </div>

        {/* Center: Pill Navigation */}
        <nav className="hidden md:flex items-center justify-center flex-shrink-0">
          <div className="flex items-center gap-6 md:gap-10 bg-zinc-900/5 px-6 md:px-10 py-2 md:py-3 rounded-full backdrop-blur-md border border-zinc-200/50">
            <Link href="/#trending" className="text-[10px] md:text-xs font-bold tracking-widest text-zinc-900 uppercase hover:text-zinc-600 transition-colors">Tendance</Link>
            <Link href="/category/shoes" className="text-[10px] md:text-xs font-bold tracking-widest text-zinc-900 uppercase hover:text-zinc-600 transition-colors">Chaussures</Link>
            <Link href="/category/clothes" className="text-[10px] md:text-xs font-bold tracking-widest text-zinc-900 uppercase hover:text-zinc-600 transition-colors">Vêtements</Link>
          </div>
        </nav>

        {/* Right: Globe Icon */}
        <div className="hidden lg:flex flex-1 justify-end pl-8">
          <button onClick={toggleLang} className="p-2 text-zinc-900 hover:text-zinc-600 transition-colors flex items-center gap-1 font-bold text-xs uppercase tracking-widest">
            <Globe className="w-5 h-5 md:w-6 md:h-6 stroke-[1.5]" />
            {lang.toUpperCase()}
          </button>
        </div>

        {/* Mobile View: Icons next to Cart */}
        <div className="flex lg:hidden items-center gap-1 sm:gap-2 flex-shrink-0">
          <Link href="/" className="p-1.5 text-zinc-900 hover:text-zinc-600 transition-colors">
            <Home className="w-5 h-5 stroke-[1.5]" />
          </Link>
          <Link href="/#categories" className="p-1.5 text-zinc-900 hover:text-zinc-600 transition-colors">
            <LayoutGrid className="w-5 h-5 stroke-[1.5]" />
          </Link>
          <button onClick={toggleLang} className="p-1.5 text-zinc-900 hover:text-zinc-600 transition-colors flex items-center gap-0.5 font-bold text-[9px] uppercase tracking-widest">
            <Globe className="w-5 h-5 stroke-[1.5]" />
            {lang.toUpperCase()}
          </button>
          <button
            onClick={openCart}
            className={`relative p-1.5 text-zinc-900 hover:text-zinc-600 transition-colors ${bounce ? 'cart-bounce' : ''}`}
          >
            <ShoppingCart className="w-5 h-5 stroke-[1.5]" />
            {totalItems > 0 && (
              <span
                key={totalItems}
                className="badge-pop absolute -top-0.5 -right-0.5 md:0 md:-right-1 bg-zinc-900 text-white text-[9px] w-3.5 h-3.5 md:w-4 md:h-4 rounded-full flex items-center justify-center font-black shadow-sm"
              >
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </header>
      <FloatingCart />
    </>
  );
}
