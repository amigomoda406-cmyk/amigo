'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { client, urlFor } from '@/lib/sanity/client';

interface SearchResult {
  _id: string;
  title: string;
  slug: { current: string };
  price: number;
  images: any[];
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_SEARCHES = ['قميص', 'جاكيت', 'حذاء رياضي', 'فستان', 'بنطال'];

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await client.fetch<SearchResult[]>(
          `*[_type == "product" && (title match $q || title match $q2)][0...6]{
            _id, title, slug, price, images
          }`,
          { q: `${query}*`, q2: `*${query}*` }
        );
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // إغلاق بـ Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            className="fixed top-0 left-0 right-0 z-50 bg-white shadow-2xl rounded-b-3xl max-h-[85vh] flex flex-col overflow-hidden"
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-100">
              <Search className="w-5 h-5 text-zinc-400 flex-shrink-0" strokeWidth={1.5} />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="ابحث عن منتج..."
                className="flex-1 bg-transparent text-sm font-medium text-zinc-900 placeholder-zinc-400 outline-none"
                dir="rtl"
              />
              {query && (
                <button onClick={() => setQuery('')} className="text-zinc-400 hover:text-zinc-700">
                  <X className="w-4 h-4" />
                </button>
              )}
              <button onClick={onClose} className="text-[10px] font-bold text-zinc-500 border border-zinc-200 px-2 py-1 rounded-md">
                إغلاق
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1 px-4 py-4">
              {!query && (
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-3">
                    البحث الشائع
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_SEARCHES.map(term => (
                      <button
                        key={term}
                        onClick={() => setQuery(term)}
                        className="bg-zinc-100 text-zinc-700 px-4 py-2 rounded-full text-[11px] font-bold hover:bg-zinc-200 transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {loading && (
                <div className="flex flex-col gap-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-3 animate-pulse">
                      <div className="w-14 h-16 bg-zinc-100 rounded-xl flex-shrink-0" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-3 bg-zinc-100 rounded-full w-3/4" />
                        <div className="h-3 bg-zinc-100 rounded-full w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loading && results.length > 0 && (
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-3">
                    النتائج ({results.length})
                  </p>
                  <div className="flex flex-col divide-y divide-zinc-50">
                    {results.map(product => {
                      const imgUrl = product.images?.[0]
                        ? urlFor(product.images[0]).width(120).height(160).url()
                        : null;
                      return (
                        <Link
                          key={product._id}
                          href={`/products/${product.slug.current}`}
                          onClick={onClose}
                          className="flex items-center gap-3 py-3 hover:bg-zinc-50 -mx-1 px-1 rounded-xl transition-colors"
                        >
                          <div className="w-14 h-16 rounded-xl overflow-hidden bg-zinc-100 flex-shrink-0 relative">
                            {imgUrl && <Image src={imgUrl} fill className="object-cover" alt={product.title} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-black text-zinc-900 truncate">{product.title}</p>
                            <p className="text-[11px] font-bold text-zinc-500 mt-0.5">
                              {product.price?.toLocaleString('fr-DZ')} DA
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-zinc-300 flex-shrink-0" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {!loading && query.length >= 2 && results.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-zinc-400 text-sm font-medium">لا توجد نتائج لـ "{query}"</p>
                  <p className="text-zinc-300 text-xs mt-1">جرّب كلمة أخرى</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
