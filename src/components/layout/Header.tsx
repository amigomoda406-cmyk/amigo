'use client';

import Link from 'next/link';
import { ShoppingCart, Search, ShoppingBag, UserCircle2 } from 'lucide-react';
import { useCartStore, useCartTotalItems } from '@/contexts/cart.store';
import { useLangStore } from '@/contexts/lang.store';
import { useAuth } from '@/lib/supabase/auth-context';
import FloatingCart from '@/components/cart/FloatingCart';
import SidebarNav from './SidebarNav';
import SearchModal from '@/components/ui/SearchModal';
import { useEffect, useRef, useState } from 'react';

export default function Header() {
  const openCart = useCartStore((state) => state.openCart);
  const totalItems = useCartTotalItems();
  const prevTotal = useRef(totalItems);
  const [bounce, setBounce] = useState(false);
  const { lang } = useLangStore();
  const { user, isLoading } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 100) {
        setIsVisible(currentScrollY < lastScrollY.current);
      } else {
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      <header 
        className={`sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-zinc-100/50 w-full transition-all duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}
      >
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

            {/* Right: User Account & Cart & Language */}
            <div className="flex-1 flex items-center justify-end gap-1.5 md:gap-3">
              <button 
                onClick={() => setSearchOpen(true)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-zinc-100 transition-colors"
                aria-label="Recherche"
              >
                <Search className="w-5 h-5 text-zinc-900" />
              </button>

              <Link 
                href={user ? "/account" : "/login"}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-zinc-100 transition-colors relative"
                aria-label="Mon compte"
              >
                <UserCircle2 className={`w-5 h-5 ${user ? 'text-blue-600' : 'text-zinc-900'}`} />
                {user && <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border border-white"></span>}
              </Link>

              <button 
                onClick={openCart}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-zinc-100 transition-colors relative group"
                aria-label="Panier"
              >
                <ShoppingBag className="w-5 h-5 text-zinc-900 group-hover:scale-110 transition-transform" />
                {totalItems > 0 && (
                  <span className={`absolute top-1.5 right-1.5 w-4 h-4 bg-zinc-900 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm ${bounce ? 'cart-bounce' : ''}`}>
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
        </div>
      </header>
      
      <FloatingCart />
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
