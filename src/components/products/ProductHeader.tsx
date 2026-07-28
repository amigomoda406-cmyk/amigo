'use client';

import { ChevronLeft, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/contexts/cart.store';

export default function ProductHeader() {
  const router = useRouter();
  const { openCart, totalItems } = useCartStore();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-transparent pointer-events-none">
      <button 
        onClick={() => router.back()}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/30 transition-colors shadow-sm pointer-events-auto"
        aria-label="Retour"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      
      <button 
        onClick={openCart}
        className="relative w-10 h-10 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/30 transition-colors shadow-sm pointer-events-auto"
        aria-label="Ouvrir le panier"
      >
        <ShoppingBag className="w-5 h-5" />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
            {totalItems}
          </span>
        )}
      </button>
    </header>
  );
}
