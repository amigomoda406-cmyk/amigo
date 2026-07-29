'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { useCartStore, useCartTotalItems } from '@/contexts/cart.store';

export default function Header() {
  const openCart = useCartStore((state) => state.openCart);
  const totalItems = useCartTotalItems();

  return (
    <header className="flex items-center justify-between px-4 md:px-8 py-3 bg-white sticky top-0 z-50 border-b border-zinc-100">
      <Link href="/" className="flex items-center group relative">
        <style>{`
          @keyframes waveGlow {
            0%, 100% { color: #18181b; text-shadow: none; }
            50% { color: #2563eb; text-shadow: 0 0 12px rgba(37,99,235,0.8); }
          }
          .letter {
            display: inline-block;
            animation: waveGlow 2s infinite;
          }
        `}</style>
        <h1 className="text-[12px] md:text-xl font-black tracking-tighter flex">
          {Array.from("AMIGO MODA").map((char, i) => (
            <span 
              key={i} 
              className={char === " " ? "w-1" : "letter"} 
              style={{ animationDelay: \`\${i * 0.1}s\` }}
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
          className="relative ml-1 p-1 text-zinc-900 hover:text-blue-600 transition-colors"
        >
          <ShoppingBag className="w-3.5 h-3.5 md:w-5 md:h-5" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[7px] w-3 h-3 rounded-full flex items-center justify-center font-bold">
              {totalItems}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}

