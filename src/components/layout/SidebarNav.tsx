'use client';

import { useState, useEffect, useRef } from 'react';
import { Menu, X, Home, Sparkles, TrendingUp, LayoutGrid, Store, Tag } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';

export default function SidebarNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const close = () => setIsOpen(false);

  const navLinks = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/#new-arrivals', icon: Sparkles, label: 'New Arrivals' },
    { href: '/#trending', icon: TrendingUp, label: 'Trending Now' },
    { href: '/promotions', icon: Tag, label: 'Sale 🔥' },
    { href: '/products', icon: Store, label: 'Full Boutique' },
  ];

  const categoryLinks = [
    { href: '/category/clothes', label: 'Vêtements' },
    { href: '/category/shoes', label: 'Chaussures' },
    { href: '/category/accessories', label: 'Accessoires' },
  ];

  const sidebarContent = (
    <>
      {/* Overlay */}
      <div
        onClick={close}
        className={`fixed inset-0 bg-black/50 z-[9998] transition-opacity duration-200 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />

      {/* Sidebar Panel */}
      <div
        className={`fixed inset-y-0 left-0 w-[85%] max-w-[340px] z-[9999] flex flex-col bg-white shadow-2xl transition-transform duration-200 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 shrink-0">
          <h2 className="text-3xl text-zinc-900" style={{ fontFamily: 'var(--font-heading)' }}>
            Amigo Moda
          </h2>
          <button
            onClick={close}
            className="p-2 bg-zinc-100 rounded-xl hover:bg-zinc-200 transition-colors"
          >
            <X className="w-5 h-5 text-zinc-900" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* Main Navigation */}
          <nav className="p-4">
            <p className="text-[10px] font-black tracking-widest uppercase text-zinc-400 mb-3 px-2">Menu</p>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={close}
                className="flex items-center gap-3 px-3 py-3.5 rounded-xl hover:bg-zinc-50 transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center group-hover:bg-zinc-900 group-hover:text-white transition-colors text-zinc-600">
                  <link.icon className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm text-zinc-900">{link.label}</span>
              </Link>
            ))}
          </nav>

          {/* Categories */}
          <div className="px-4 pb-4">
            <p className="text-[10px] font-black tracking-widest uppercase text-zinc-400 mb-3 px-2">Categories</p>
            <div className="grid grid-cols-2 gap-2">
              {categoryLinks.map((cat) => (
                <Link
                  key={cat.href}
                  href={cat.href}
                  onClick={close}
                  className="flex items-center justify-center px-3 py-3 rounded-xl border border-zinc-200 hover:border-zinc-900 hover:bg-zinc-900 hover:text-white transition-all text-sm font-bold text-zinc-900 text-center"
                >
                  {cat.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-100 shrink-0">
          <p className="text-[10px] text-zinc-400 text-center font-medium">© 2026 Amigo Moda</p>
        </div>
      </div>
    </>
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 -mx-2 text-zinc-900"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6 stroke-[1.5]" />
      </button>

      {mounted && createPortal(sidebarContent, document.body)}
    </>
  );
}
