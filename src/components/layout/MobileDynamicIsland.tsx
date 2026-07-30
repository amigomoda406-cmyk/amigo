'use client';

import Link from 'next/link';
import { Home, LayoutGrid, ShoppingCart, Globe } from 'lucide-react';
import { useCartStore, useCartTotalItems } from '@/contexts/cart.store';
import { useEffect, useRef, useState } from 'react';

export default function MobileDynamicIsland() {
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
        @keyframes islandBounce {
          0%, 100% { transform: translateY(0) translateX(-50%); }
          50% { transform: translateY(-5px) translateX(-50%); }
        }
        .island-bounce {
          animation: islandBounce 0.4s ease-out;
        }
      `}</style>
      {/* Mobile only floating dynamic island at the top */}
      <div className="md:hidden fixed top-14 left-1/2 -translate-x-1/2 z-[60]">
        <div className="flex items-center gap-6 bg-black/90 backdrop-blur-xl px-6 py-3.5 rounded-full shadow-2xl border border-white/10 text-white">
          
          {/* Home */}
          <Link href="/" className="flex flex-col items-center justify-center gap-1 hover:text-white/70 transition-colors">
            <Home className="w-5 h-5" />
          </Link>

          {/* Categories */}
          <Link href="/#categories" className="flex flex-col items-center justify-center gap-1 hover:text-white/70 transition-colors">
            <LayoutGrid className="w-5 h-5" />
          </Link>

          {/* Language Switcher */}
          <button className="flex flex-col items-center justify-center gap-1 hover:text-white/70 transition-colors">
            <Globe className="w-5 h-5" />
          </button>

          {/* Cart */}
          <button 
            onClick={openCart}
            className={`relative flex flex-col items-center justify-center gap-1 hover:text-white/70 transition-colors ${bounce ? 'island-bounce text-blue-400' : ''}`}
          >
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-blue-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold border-2 border-black">
                {totalItems}
              </span>
            )}
          </button>

        </div>
      </div>
    </>
  );
}
