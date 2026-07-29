'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
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

      <header className="flex items-center justify-between px-4 md:px-8 py-4 bg-white sticky top-0 z-50 shadow-sm">
        {/* Left: Logo */}
        <Link href="/" className="flex-shrink-0 group">
          <h1 className="text-xl md:text-2xl font-black tracking-tighter text-zinc-900 transition-transform group-hover:scale-105">
            AMIGO MODA
          </h1>
        </Link>

        {/* Center: Pill Navigation */}
        <nav className="hidden md:flex items-center justify-center flex-1 mx-8">
          <div className="flex items-center gap-8 bg-zinc-100/80 px-8 py-3.5 rounded-full backdrop-blur-md border border-zinc-200/50 shadow-sm">
            <Link href="/#trending" className="text-[11px] font-black tracking-widest text-zinc-600 uppercase hover:text-zinc-900 transition-colors">Tendance</Link>
            <Link href="/category/shoes" className="text-[11px] font-black tracking-widest text-zinc-600 uppercase hover:text-zinc-900 transition-colors">Chaussures</Link>
            <Link href="/category/clothes" className="text-[11px] font-black tracking-widest text-zinc-600 uppercase hover:text-zinc-900 transition-colors">Vêtements</Link>
            <Link href="/category/accessories" className="text-[11px] font-black tracking-widest text-zinc-600 uppercase hover:text-zinc-900 transition-colors">Accessoires</Link>
            <Link href="/#new" className="text-[11px] font-black tracking-widest text-blue-600 uppercase hover:text-blue-800 transition-colors">Nouveau</Link>
          </div>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center justify-end flex-shrink-0">
          <button
            onClick={openCart}
            className={`relative p-2 text-zinc-900 hover:text-blue-600 transition-colors bg-zinc-100 rounded-full hover:bg-zinc-200 ${bounce ? 'cart-bounce' : ''}`}
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span
                key={totalItems}
                className="badge-pop absolute -top-1 -right-1 bg-blue-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-sm border border-white"
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
