'use client';

import Link from 'next/link';
import { ShoppingCart, Home, LayoutGrid } from 'lucide-react';
import { useCartStore, useCartTotalItems } from '@/contexts/cart.store';
import { useLangStore, langs, langLabels, type Lang } from '@/contexts/lang.store';
import FloatingCart from '@/components/cart/FloatingCart';
import { useEffect, useRef, useState } from 'react';

export default function Header() {
  const openCart = useCartStore((state) => state.openCart);
  const totalItems = useCartTotalItems();
  const prevTotal = useRef(totalItems);
  const [bounce, setBounce] = useState(false);
  const { lang, setLang, t } = useLangStore();

  // Sync lang/dir to document (but never affect the header itself)
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  // Cycle through FR → EN → AR → FR
  const cycleLanguage = () => {
    const currentIdx = langs.indexOf(lang);
    const nextLang = langs[(currentIdx + 1) % langs.length];
    setLang(nextLang);
  };

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
        .cart-bounce { animation: cartBounce 0.6s ease-out forwards; }
        @keyframes badgePop {
          0%   { transform: scale(0); }
          60%  { transform: scale(1.4); }
          100% { transform: scale(1); }
        }
        .badge-pop { animation: badgePop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
      `}</style>

      {/* Always LTR, never translated */}
      <header
        dir="ltr"
        translate="no"
        className="notranslate flex items-center justify-between px-4 md:px-8 py-2.5 md:py-4 sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100 text-zinc-900 w-full"
      >
        {/* Left: Logo */}
        <Link href="/" className="flex-shrink-0">
          <h1 className="text-lg md:text-2xl font-bold tracking-wider text-zinc-900" style={{ fontFamily: 'serif', letterSpacing: '0.15em' }}>
            AMIGO MODA
          </h1>
        </Link>

        {/* Center: Desktop pill nav */}
        <nav className="hidden md:flex items-center justify-center flex-1">
          <div className="flex items-center gap-8 bg-zinc-100 px-8 py-2.5 rounded-full">
            <Link href="/#trending" className="text-[11px] font-bold tracking-widest text-zinc-700 uppercase hover:text-zinc-900 transition-colors whitespace-nowrap">
              {t('trending')}
            </Link>
            <Link href="/category/shoes" className="text-[11px] font-bold tracking-widest text-zinc-700 uppercase hover:text-zinc-900 transition-colors whitespace-nowrap">
              {t('shoes')}
            </Link>
            <Link href="/category/clothes" className="text-[11px] font-bold tracking-widest text-zinc-700 uppercase hover:text-zinc-900 transition-colors whitespace-nowrap">
              {t('clothes')}
            </Link>
          </div>
        </nav>

        {/* Right: Lang + Cart (Desktop) */}
        <div className="hidden md:flex items-center gap-3 flex-shrink-0">
          <button
            onClick={cycleLanguage}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 transition-colors text-xs font-black tracking-widest text-zinc-700 uppercase"
          >
            {langLabels[lang]}
          </button>
          <button
            onClick={openCart}
            className={`relative p-2 text-zinc-700 hover:text-zinc-900 transition-colors ${bounce ? 'cart-bounce' : ''}`}
          >
            <ShoppingCart className="w-5 h-5 stroke-[1.5]" />
            {totalItems > 0 && (
              <span key={totalItems} className="badge-pop absolute -top-0.5 -right-0.5 bg-zinc-900 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-black">
                {totalItems}
              </span>
            )}
          </button>
        </div>

        {/* Mobile: Icons right side */}
        <div className="flex md:hidden items-center gap-0.5 flex-shrink-0">
          <Link href="/" className="p-2 text-zinc-700 hover:text-zinc-900 transition-colors">
            <Home className="w-[18px] h-[18px] stroke-[1.5]" />
          </Link>
          <Link href="/#categories" className="p-2 text-zinc-700 hover:text-zinc-900 transition-colors">
            <LayoutGrid className="w-[18px] h-[18px] stroke-[1.5]" />
          </Link>
          <button
            onClick={cycleLanguage}
            className="px-2 py-1 text-[10px] font-black tracking-widest text-zinc-700 hover:text-zinc-900 transition-colors"
          >
            {langLabels[lang]}
          </button>
          <button
            onClick={openCart}
            className={`relative p-2 text-zinc-700 hover:text-zinc-900 transition-colors ${bounce ? 'cart-bounce' : ''}`}
          >
            <ShoppingCart className="w-[18px] h-[18px] stroke-[1.5]" />
            {totalItems > 0 && (
              <span key={totalItems} className="badge-pop absolute -top-0.5 -right-0.5 bg-zinc-900 text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-black">
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
