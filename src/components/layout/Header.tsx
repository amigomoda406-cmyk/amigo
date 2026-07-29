'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { useCartStore, useCartTotalItems } from '@/contexts/cart.store';
import FloatingCart from '@/components/cart/FloatingCart';
import { useEffect, useRef, useState } from 'react';

const LOGO_LETTERS = Array.from('AMIGO MODA');

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
        @keyframes waveGlow {
          0%, 100% { color: #18181b; text-shadow: 0 0 0px rgba(0,0,0,0); }
          50% { color: #9333ea; text-shadow: 0 0 15px rgba(147,51,234,1), 0 0 30px rgba(147,51,234,0.6); }
        }
        .logo-letter {
          display: inline-block;
          animation: waveGlow 1.5s infinite;
        }
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

      <header className="flex items-center justify-between px-4 md:px-8 py-3 bg-white sticky top-0 z-50 border-b border-zinc-100">
        <Link href="/" className="flex items-center group relative">
          <h1 className="text-[12px] md:text-xl font-black tracking-tighter flex">
            {LOGO_LETTERS.map((char, i) => (
              <span
                key={i}
                className={char === ' ' ? 'w-1' : 'logo-letter'}
                style={{ animationDelay: `-${(9 - i) * 0.15}s` }}
              >
                {char}
              </span>
            ))}
          </h1>
        </Link>

        <div className="flex items-center gap-2 md:gap-8">
          <nav className="flex items-center gap-1.5 md:gap-8 text-[6px] md:text-sm font-bold tracking-widest text-zinc-900 uppercase overflow-x-auto no-scrollbar whitespace-nowrap">
            <Link href="/#trending" className="hover:text-blue-600 transition-colors">Tendance</Link>
            <Link href="/category/shoes" className="hover:text-blue-600 transition-colors">Chaussures</Link>
            <Link href="/category/clothes" className="hover:text-blue-600 transition-colors">Vêtements</Link>
            <Link href="/category/accessories" className="hover:text-blue-600 transition-colors">Accessoires</Link>
            <Link href="/#new" className="text-blue-600 hover:text-blue-800 transition-colors">Nouveau</Link>
          </nav>

          <button
            onClick={openCart}
            className={`relative ml-1 p-1 text-zinc-900 hover:text-blue-600 transition-colors ${bounce ? 'cart-bounce' : ''}`}
          >
            <ShoppingBag className="w-3.5 h-3.5 md:w-5 md:h-5" />
            {totalItems > 0 && (
              <span
                key={totalItems}
                className="badge-pop absolute -top-1 -right-1 bg-blue-600 text-white text-[7px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold"
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
