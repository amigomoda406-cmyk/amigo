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
import { motion } from 'framer-motion';

export default function Header() {
  const openCart = useCartStore((state) => state.openCart);
  const totalItems = useCartTotalItems();
  const prevTotal = useRef(totalItems);
  const [bounce, setBounce] = useState(false);
  const { lang } = useLangStore();
  const { user, isLoading } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 50);
      
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
        className={`sticky top-0 z-50 w-full transition-all duration-500 ease-out ${isVisible ? 'translate-y-0' : '-translate-y-full'} ${scrolled ? 'bg-white/85 backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.03)] border-b border-zinc-100/50 py-1' : 'bg-white/95 backdrop-blur-xl py-3'}`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-[52px] md:h-[60px]">
          
          {/* Left: Mobile Menu (Hidden on large screens) */}
          <div className="lg:hidden flex-1 flex items-center justify-start">
            <SidebarNav />
          </div>

          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center justify-center lg:justify-start gap-2 group flex-1 lg:flex-none">
            <motion.img 
              initial={{ opacity: 0, rotate: -90, scale: 0 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
              src="/am-monogram.svg" 
              alt="AM" 
              className="w-5 h-5 md:w-6 md:h-6 text-[#C9A96E] hidden md:block" 
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.1 }}
              className="flex flex-col items-center lg:items-start"
            >
              <h1 className="text-xl md:text-2xl font-black tracking-[0.2em] text-zinc-900 group-hover:text-[#C9A96E] transition-colors duration-500 uppercase leading-none whitespace-nowrap" style={{ fontFamily: 'var(--font-outfit)' }}>
                Amigo Moda
              </h1>
              <div className="w-0 h-[2px] bg-[#C9A96E] mt-1 group-hover:w-full transition-all duration-500 ease-out hidden lg:block" />
            </motion.div>
          </Link>

          {/* Center: Desktop Mega Menu (Hidden on mobile) */}
          <nav className="hidden lg:flex flex-1 items-center justify-center gap-10">
            {/* Mega Menu Item: Femme */}
            <div className="group/nav relative h-full flex items-center">
              <Link href="/category/femme" className="text-[11px] font-black uppercase tracking-widest text-zinc-900 hover:text-[#C9A96E] transition-colors py-4">Femme</Link>
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 pointer-events-none group-hover/nav:opacity-100 group-hover/nav:pointer-events-auto transition-all duration-300 translate-y-2 group-hover/nav:translate-y-0 z-50">
                <div className="bg-white rounded-3xl shadow-2xl shadow-black/5 border border-zinc-100 p-8 w-[600px] flex gap-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9A96E]/5 rounded-bl-full -z-10" />
                  <div className="flex-1 space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">Vêtements</h4>
                    <Link href="#" className="block text-xs font-bold text-zinc-900 hover:text-[#C9A96E] transition-colors">Robes de Soirée</Link>
                    <Link href="#" className="block text-xs font-bold text-zinc-900 hover:text-[#C9A96E] transition-colors">Vestes & Manteaux</Link>
                    <Link href="#" className="block text-xs font-bold text-zinc-900 hover:text-[#C9A96E] transition-colors">Pulls & Gilets</Link>
                    <Link href="#" className="block text-xs font-bold text-zinc-900 hover:text-[#C9A96E] transition-colors">Ensembles</Link>
                  </div>
                  <div className="flex-1 space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">Accessoires</h4>
                    <Link href="#" className="block text-xs font-bold text-zinc-900 hover:text-[#C9A96E] transition-colors">Sacs à main</Link>
                    <Link href="#" className="block text-xs font-bold text-zinc-900 hover:text-[#C9A96E] transition-colors">Bijoux</Link>
                    <Link href="#" className="block text-xs font-bold text-zinc-900 hover:text-[#C9A96E] transition-colors">Chaussures</Link>
                  </div>
                  <div className="flex-1 bg-zinc-900 rounded-2xl p-4 flex flex-col justify-end relative overflow-hidden group/card border border-zinc-800">
                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 z-0" />
                    <div className="relative z-20">
                      <span className="text-[8px] font-black uppercase tracking-widest text-white/80 bg-white/20 backdrop-blur-md px-2 py-1 rounded-md mb-2 inline-block">New</span>
                      <h5 className="text-white text-sm font-black uppercase tracking-widest">Spring Collection</h5>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mega Menu Item: Homme */}
            <div className="group/nav relative h-full flex items-center">
              <Link href="/category/homme" className="text-[11px] font-black uppercase tracking-widest text-zinc-900 hover:text-[#C9A96E] transition-colors py-4">Homme</Link>
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 pointer-events-none group-hover/nav:opacity-100 group-hover/nav:pointer-events-auto transition-all duration-300 translate-y-2 group-hover/nav:translate-y-0 z-50">
                <div className="bg-white rounded-3xl shadow-2xl shadow-black/5 border border-zinc-100 p-8 w-[600px] flex gap-8">
                   <div className="flex-1 space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">Vêtements</h4>
                    <Link href="#" className="block text-xs font-bold text-zinc-900 hover:text-[#C9A96E] transition-colors">T-shirts & Polos</Link>
                    <Link href="#" className="block text-xs font-bold text-zinc-900 hover:text-[#C9A96E] transition-colors">Chemises</Link>
                    <Link href="#" className="block text-xs font-bold text-zinc-900 hover:text-[#C9A96E] transition-colors">Pantalons & Jeans</Link>
                  </div>
                  <div className="flex-1 space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">Chaussures</h4>
                    <Link href="#" className="block text-xs font-bold text-zinc-900 hover:text-[#C9A96E] transition-colors">Sneakers</Link>
                    <Link href="#" className="block text-xs font-bold text-zinc-900 hover:text-[#C9A96E] transition-colors">Mocassins</Link>
                    <Link href="#" className="block text-xs font-bold text-zinc-900 hover:text-[#C9A96E] transition-colors">Classique</Link>
                  </div>
                  <div className="flex-1 bg-zinc-900 rounded-2xl p-4 flex flex-col justify-end relative overflow-hidden group/card">
                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-700 to-zinc-900 z-0" />
                    <div className="relative z-20">
                      <h5 className="text-white text-sm font-black uppercase tracking-widest">Custom Suits</h5>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Link href="/category/enfants" className="text-[11px] font-black uppercase tracking-widest text-zinc-900 hover:text-[#C9A96E] transition-colors py-4">Enfants</Link>
            <Link href="/promotions" className="text-[11px] font-black uppercase tracking-widest text-red-600 hover:text-red-700 transition-colors py-4">Promotions</Link>
          </nav>

          {/* Right: Cart */}
          <div className="flex-1 flex items-center justify-end gap-1 sm:gap-2">

            <button 
              onClick={openCart}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-zinc-100 transition-all active:scale-95 relative group"
              aria-label="Panier"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-zinc-900 group-hover:-translate-y-0.5 transition-transform duration-300" />
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-0.5 bg-black/20 rounded-full blur-[1px] group-hover:scale-110 opacity-0 group-hover:opacity-100 transition-all duration-300" />
              </div>
              {totalItems > 0 && (
                <span className={`absolute top-1.5 right-1.5 w-[18px] h-[18px] bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-[2px] border-white shadow-sm ${bounce ? 'cart-bounce' : ''}`}>
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
