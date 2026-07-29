'use client';

import Link from 'next/link';
import { ShoppingCart, Globe } from 'lucide-react';
import { useCartStore, useCartTotalItems } from '@/contexts/cart.store';
import FloatingCart from '@/components/cart/FloatingCart';
import { useEffect, useRef, useState } from 'react';

export default function Header() {
  const openCart = useCartStore((state) => state.openCart);
  const totalItems = useCartTotalItems();
  const prevTotal = useRef(totalItems);
  const [bounce, setBounce] = useState(false);

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
        Exact reproduction of the second image's header bar:
        - Dusty pink background
        - White text and icons
        - Pill shaped center menu with bg-white/20
      */}
      <header className="flex items-center justify-between px-6 py-4 sticky top-0 z-50 bg-[#d7a7af] text-white shadow-md">
        
        {/* Left Side: Logo */}
        <Link href="/" className="flex-shrink-0 group">
          {/* We keep AMIGO MODA but make it cursive/elegant to match the vibe of "Cookiza" in the picture if possible, or just a very clean font */}
          <h1 className="text-3xl font-medium tracking-wide text-white drop-shadow-sm" style={{ fontFamily: 'cursive' }}>
            AMIGO MODA
          </h1>
        </Link>

        {/* Middle-Left: Cart Icon (as positioned in the image) */}
        <div className="hidden lg:flex flex-1 justify-end pr-8">
          <button
            onClick={openCart}
            className={`relative p-2 text-white hover:text-white/80 transition-colors ${bounce ? 'cart-bounce' : ''}`}
          >
            <ShoppingCart className="w-6 h-6 stroke-[1.5]" />
            {totalItems > 0 && (
              <span
                key={totalItems}
                className="badge-pop absolute 0 -right-1 bg-white text-[#d7a7af] text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-black shadow-sm"
              >
                {totalItems}
              </span>
            )}
          </button>
        </div>

        {/* Center: Pill Navigation */}
        <nav className="hidden md:flex items-center justify-center flex-shrink-0">
          <div className="flex items-center gap-10 bg-white/20 px-10 py-3 rounded-full backdrop-blur-sm">
            <Link href="/#trending" className="text-xs font-bold tracking-widest text-white uppercase hover:text-white/80 transition-colors">Tendance</Link>
            <Link href="/category/shoes" className="text-xs font-bold tracking-widest text-white uppercase hover:text-white/80 transition-colors">Chaussures</Link>
            <Link href="/category/clothes" className="text-xs font-bold tracking-widest text-white uppercase hover:text-white/80 transition-colors">Vêtements</Link>
          </div>
        </nav>

        {/* Right: Globe Icon */}
        <div className="hidden lg:flex flex-1 justify-end pl-8">
          <button className="p-2 text-white hover:text-white/80 transition-colors">
            <Globe className="w-6 h-6 stroke-[1.5]" />
          </button>
        </div>

        {/* Mobile View: Keep it simple */}
        <div className="flex lg:hidden items-center gap-4 flex-shrink-0">
          <button
            onClick={openCart}
            className={`relative p-2 text-white hover:text-white/80 transition-colors ${bounce ? 'cart-bounce' : ''}`}
          >
            <ShoppingCart className="w-6 h-6 stroke-[1.5]" />
            {totalItems > 0 && (
              <span
                key={totalItems}
                className="badge-pop absolute 0 -right-1 bg-white text-[#d7a7af] text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-black shadow-sm"
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
