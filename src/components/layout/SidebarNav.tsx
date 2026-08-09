'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Globe, TrendingUp, LayoutGrid, ChevronRight, Home, Sparkles, Store } from 'lucide-react';
import Link from 'next/link';
import { useLangStore, langs, langLabels } from '@/contexts/lang.store';

export default function SidebarNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { lang, setLang, t } = useLangStore();
  const isRtl = lang === 'ar';

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const cycleLanguage = () => {
    const currentIdx = langs.indexOf(lang);
    const nextLang = langs[(currentIdx + 1) % langs.length];
    setLang(nextLang);
  };

  const navLinks = [
    { href: '/', icon: Home, label: isRtl ? 'الرئيسية' : 'Home' },
    { href: '/#new-arrivals', icon: Sparkles, label: isRtl ? 'وصل حديثاً' : 'New Arrivals' },
    { href: '/#trending', icon: TrendingUp, label: isRtl ? 'الأكثر رواجاً' : 'Trending Now' },
    { href: '/#categories', icon: LayoutGrid, label: isRtl ? 'الأقسام' : 'Categories' },
    { href: '/products', icon: Store, label: isRtl ? 'البوتيك' : 'Boutique' },
  ];

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="p-2 -mx-2 text-zinc-900 hover:text-zinc-600 transition-colors">
        <Menu className="w-6 h-6 stroke-[1.5]" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
            />
            
            {/* Sidebar */}
            <motion.div
              initial={{ x: isRtl ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: isRtl ? '100%' : '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className={`fixed inset-y-0 ${isRtl ? 'right-0' : 'left-0'} w-[85%] max-w-[340px] bg-white z-[9999] flex flex-col shadow-2xl`}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-zinc-100 shrink-0">
                <h2 className="text-xl font-bold tracking-widest text-zinc-900 uppercase" style={{ fontFamily: 'var(--font-outfit)' }}>
                  Amigo Moda
                </h2>
                <button onClick={() => setIsOpen(false)} className="p-2 bg-zinc-100 rounded-xl hover:bg-zinc-200 transition-colors">
                  <X className="w-5 h-5 text-zinc-900" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 overflow-y-auto p-6 space-y-2">
                <p className="text-[10px] font-black tracking-widest uppercase text-zinc-400 mb-4 px-2">{isRtl ? 'القائمة الرئيسية' : 'Main Menu'}</p>
                
                {navLinks.map((link, idx) => (
                  <Link 
                    key={idx} 
                    href={link.href} 
                    onClick={() => setIsOpen(false)} 
                    className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-zinc-50 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center group-hover:bg-zinc-900 group-hover:text-white transition-all duration-300 text-zinc-700">
                        <link.icon className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-sm text-zinc-900">{link.label}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-zinc-300 group-hover:text-zinc-600 transition-colors ${isRtl ? 'rotate-180' : ''}`} />
                  </Link>
                ))}
              </nav>

              {/* Language Switcher Footer */}
              <div className="p-6 border-t border-zinc-100 bg-zinc-50 shrink-0">
                <button
                  onClick={cycleLanguage}
                  className="w-full flex items-center justify-between p-4 bg-white border border-zinc-200 rounded-2xl hover:border-zinc-300 shadow-sm transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-zinc-500 group-hover:text-zinc-900 transition-colors" />
                    <span className="font-bold text-sm text-zinc-900">{isRtl ? 'تغيير اللغة' : 'Change Language'}</span>
                  </div>
                  <span className="text-[10px] font-black tracking-widest text-zinc-700 uppercase bg-zinc-100 px-3 py-1.5 rounded-lg group-hover:bg-zinc-200 transition-colors">
                    {langLabels[lang]}
                  </span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
