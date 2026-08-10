'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid2X2, ShoppingBag, User } from 'lucide-react';
import { useCartStore, useCartTotalItems } from '@/contexts/cart.store';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const navItems = [
  { href: '/', icon: Home, label: 'Accueil' },
  { href: '/#categories', icon: Grid2X2, label: 'Catégories' },
  { href: '/account', icon: User, label: 'Compte' },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const openCart = useCartStore((state) => state.openCart);
  const totalItems = useCartTotalItems();
  const prevTotal = useRef(totalItems);
  const [cartPulse, setCartPulse] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  // Smart hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > 80) {
        setVisible(currentY < lastScrollY.current);
      } else {
        setVisible(true);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cart item added animation
  useEffect(() => {
    if (totalItems > prevTotal.current) {
      setCartPulse(true);
      const t = setTimeout(() => setCartPulse(false), 600);
      prevTotal.current = totalItems;
      return () => clearTimeout(t);
    }
    prevTotal.current = totalItems;
  }, [totalItems]);

  // Hide on checkout / thank-you page
  if (pathname.startsWith('/checkout') || pathname.startsWith('/thank-you')) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
          key="bottom-nav"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
          className="lg:hidden fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)]"
        >
          {/* Glass bar */}
          <div className="mx-3 mb-2 rounded-[22px] bg-white/90 backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-zinc-100 overflow-hidden">
            <div className="flex items-center justify-around h-[60px] px-2">
              
              {/* Regular nav items */}
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex flex-col items-center justify-center gap-1 px-5 py-2 relative"
                  >
                    <div className={`relative transition-transform duration-200 ${isActive ? 'scale-110' : 'scale-100'}`}>
                      <item.icon
                        className={`w-[22px] h-[22px] transition-colors duration-200 ${
                          isActive ? 'text-black' : 'text-zinc-400'
                        }`}
                        strokeWidth={isActive ? 2.5 : 1.8}
                      />
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-widest transition-colors duration-200 ${
                      isActive ? 'text-black' : 'text-zinc-400'
                    }`}>
                      {item.label}
                    </span>
                    {/* Active dot indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="active-dot"
                        className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#C9A96E]"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                  </Link>
                );
              })}

              {/* Cart Button — special treatment */}
              <button
                onClick={openCart}
                className="flex flex-col items-center justify-center gap-1 px-5 py-2 relative"
                aria-label="Panier"
              >
                <div className={`relative transition-transform duration-300 ${cartPulse ? 'scale-125' : 'scale-100'}`}>
                  <ShoppingBag
                    className="w-[22px] h-[22px] text-zinc-400"
                    strokeWidth={1.8}
                  />
                  <AnimatePresence>
                    {totalItems > 0 && (
                      <motion.span
                        key={totalItems}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                        className="absolute -top-2 -right-2 w-[18px] h-[18px] bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm"
                      >
                        {totalItems > 9 ? '9+' : totalItems}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Panier</span>
              </button>

            </div>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
