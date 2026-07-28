// src/components/layout/BottomNav.tsx

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Package, ShoppingCart, User } from 'lucide-react';
import { useCartTotalItems } from '@/contexts/cart.store';
import { cn } from '@/lib/utils';
import '@/styles/bottom-nav.css';

const NAV_ITEMS = [
  {
    id: 'home',
    href: '/',
    label: 'Accueil',
    labelAr: 'الرئيسية',
    icon: Home,
    exact: true,
  },
  {
    id: 'categories',
    href: '/shoes', // Default category or could be /categories
    label: 'Produits',
    labelAr: 'المنتجات',
    icon: Package,
    exact: false,
  },
  {
    id: 'cart',
    href: '/cart',
    label: 'Panier',
    labelAr: 'السلة',
    icon: ShoppingCart,
    exact: false,
    badge: true,
  },
  {
    id: 'account',
    href: '/login', // Will point to login for admin, or account if we add user auth later
    label: 'Compte',
    labelAr: 'حسابي',
    icon: User,
    exact: false,
  },
] as const;

// إخفاء الـ BottomNav في هذه الصفحات
const HIDDEN_ROUTES = ['/checkout', '/thank-you', '/studio', '/admin', '/login'];

export default function BottomNav() {
  const pathname = usePathname();
  const totalItems = useCartTotalItems();

  // إخفاء في صفحات معينة
  const shouldHide = HIDDEN_ROUTES.some(route =>
    pathname.startsWith(route)
  );
  if (shouldHide) return null;

  return (
    <nav
      className="bottom-nav md:hidden"
      id="bottom-nav"
      aria-label="Navigation principale"
    >
      <div className="bottom-nav__inner">
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          const Icon = item.icon;

          const content = (
            <>
              {/* Icon Wrapper */}
              <span className="bottom-nav__icon-wrapper">
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className="bottom-nav__icon"
                />
                
                {/* Cart Badge */}
                {'badge' in item && item.badge && totalItems > 0 && (
                  <motion.span
                    className="bottom-nav__badge"
                    key={totalItems}
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 12 }}
                  >
                    {totalItems > 9 ? '9+' : totalItems}
                  </motion.span>
                )}

                {/* Active Indicator */}
                {isActive && (
                  <motion.span
                    className="bottom-nav__active-dot"
                    layoutId="active-nav-dot"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </span>

              {/* Label */}
              <span className="bottom-nav__label">{item.label}</span>
            </>
          );

          if (item.id === 'cart') {
            return (
              <button
                key={item.id}
                onClick={() => useCartStore.getState().openCart()}
                className={cn('bottom-nav__item', isActive && 'bottom-nav__item--active')}
                aria-current={isActive ? 'page' : undefined}
                aria-label={item.label}
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={item.id}
              href={item.href}
              id={`bottom-nav-${item.id}`}
              className={cn('bottom-nav__item', isActive && 'bottom-nav__item--active')}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.label}
            >
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
