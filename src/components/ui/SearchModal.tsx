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
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

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
            <div className="flex items-center gap-3 px-4 py-4 border-b border-zinc-100 bg-zinc-50/50">
              <Search className="w-5 h-5 text-zinc-400 flex-shrink-0" strokeWidth={2} />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Que recherchez-vous ?"
                className="flex-1 bg-transparent text-sm font-black text-zinc-900 placeholder-zinc-400 outline-none"
              />
              {query && (
                <button onClick={() => setQuery('')} className="text-zinc-400 hover:text-zinc-900 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              )}
              {/* Voice Search Mock (Idea 132) */}
              {!query && (
                <button className="text-zinc-400 hover:text-[#C9A96E] transition-colors p-1" title="Recherche vocale">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                </button>
              )}
              <button onClick={onClose} className="text-[10px] font-black tracking-widest uppercase text-zinc-500 hover:text-zinc-900 transition-colors ml-2">
                Fermer
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1 px-4 py-6">
              {!query && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-900">
                      Recherches Tendances
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_SEARCHES.map(term => (
                      <button
                        key={term}
                        onClick={() => setQuery(term)}
                        className="bg-white border border-zinc-200 text-zinc-700 px-4 py-2 rounded-full text-[11px] font-bold hover:border-zinc-900 hover:bg-zinc-900 hover:text-white transition-all shadow-sm"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {loading && (
                <div className="flex flex-col gap-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-4 animate-pulse items-center">
                      <div className="w-16 h-20 bg-zinc-100 rounded-xl flex-shrink-0" />
                      <div className="flex-1 space-y-3 py-2">
                        <div className="h-3 bg-zinc-100 rounded-full w-3/4" />
                        <div className="h-3 bg-zinc-100 rounded-full w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loading && results.length > 0 && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">
                    Produits ({results.length})
                  </p>
                  <div className="flex flex-col gap-3">
                    {results.map(product => {
                      const imgUrl = product.images?.[0]
                        ? urlFor(product.images[0]).width(160).height(200).url()
                        : null;
                      return (
                        <Link
                          key={product._id}
                          href={`/products/${product.slug.current}`}
                          onClick={onClose}
                          className="group flex items-center gap-4 p-2 hover:bg-zinc-50 rounded-2xl transition-colors border border-transparent hover:border-zinc-100"
                        >
                          <div className="w-16 h-20 rounded-xl overflow-hidden bg-zinc-100 flex-shrink-0 relative shadow-sm group-hover:shadow-md transition-shadow">
                            {imgUrl && <Image src={imgUrl} fill className="object-cover group-hover:scale-105 transition-transform duration-500" alt={product.title} sizes="64px" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-black text-zinc-900 truncate uppercase tracking-tight">{product.title}</p>
                            <p className="text-[11px] font-bold text-[#C9A96E] mt-1">
                              {product.price?.toLocaleString('fr-DZ')} DA
                            </p>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-zinc-400 group-hover:text-zinc-900 group-hover:bg-zinc-100 transition-colors mr-2">
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {!loading && query.length >= 2 && results.length === 0 && (
                <div className="text-center py-12 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-zinc-50 flex items-center justify-center mb-4 border border-zinc-100">
                    <Search className="w-6 h-6 text-zinc-300" />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900 mb-2">Aucun résultat</h3>
                  <p className="text-[11px] font-medium text-zinc-500 mb-6 max-w-[250px]">
                    Nous n'avons rien trouvé pour "{query}". Essayez avec d'autres mots-clés.
                  </p>
                  
                  {/* No Results Suggestions (Idea 131) */}
                  <div className="w-full pt-6 border-t border-zinc-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4 text-left">
                      Découvrez nos collections
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {['Nouveautés', 'Promotions', 'Robes', 'Accessoires'].map(cat => (
                        <button key={cat} onClick={() => { setQuery(cat); }} className="bg-zinc-50 p-4 rounded-xl text-left hover:bg-zinc-100 transition-colors">
                          <span className="text-[11px] font-bold text-zinc-900">{cat}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
