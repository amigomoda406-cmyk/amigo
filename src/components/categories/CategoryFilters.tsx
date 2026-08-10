'use client';

import { useState } from 'react';
import { SlidersHorizontal, ArrowUpDown, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CategoryFilters() {
  const [activeSort, setActiveSort] = useState('Nouveautés');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const sortOptions = ['Nouveautés', 'Prix croissant', 'Prix décroissant', 'Tendance'];
  
  return (
    <>
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-zinc-100 sticky top-[56px] bg-zinc-50 z-30 pt-2 px-1">
        <button 
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center gap-2 bg-white border border-zinc-200 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-900 shadow-sm hover:border-black transition-colors"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" /> Filtrer
          <span className="w-4 h-4 bg-black text-white rounded-full flex items-center justify-center text-[8px]">2</span>
        </button>

        <div className="relative">
          <button 
            onClick={() => setIsSortOpen(!isSortOpen)}
            className="flex items-center gap-2 bg-white border border-zinc-200 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-900 shadow-sm hover:border-black transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5" /> 
            <span className="hidden md:inline">{activeSort}</span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          </button>
          
          <AnimatePresence>
            {isSortOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 top-full mt-2 w-48 bg-white border border-zinc-100 shadow-xl rounded-2xl overflow-hidden z-40 flex flex-col p-2"
              >
                {sortOptions.map(opt => (
                  <button 
                    key={opt}
                    onClick={() => { setActiveSort(opt); setIsSortOpen(false); }}
                    className={`flex items-center justify-between px-3 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-colors ${activeSort === opt ? 'bg-zinc-50 text-black' : 'text-zinc-500 hover:bg-zinc-50'}`}
                  >
                    {opt}
                    {activeSort === opt && <Check className="w-3 h-3 text-emerald-500" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Filter Bottom Sheet (Mobile view mockup) */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 h-[80vh] bg-white rounded-t-3xl z-[60] flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
                <h3 className="text-sm font-black tracking-widest uppercase text-zinc-900">Filtres (2)</h3>
                <button onClick={() => setIsFilterOpen(false)} className="text-[10px] font-bold text-zinc-500 uppercase">Fermer</button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Size Filter */}
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-900 mb-4">Taille</h4>
                  <div className="flex flex-wrap gap-2">
                    {['S', 'M', 'L', 'XL', 'XXL'].map(s => (
                      <button key={s} className={`w-12 h-12 flex items-center justify-center rounded-xl border-2 text-sm font-bold transition-all ${s === 'M' || s === 'L' ? 'border-black bg-black text-white' : 'border-zinc-200 text-zinc-600 hover:border-black'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Filter */}
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-900 mb-4">Couleur</h4>
                  <div className="flex flex-wrap gap-3">
                    {['#000000', '#ffffff', '#2563eb', '#dc2626', '#16a34a', '#d97706'].map((c, i) => (
                      <button key={i} className={`w-10 h-10 rounded-full border-2 transition-all ${i === 0 ? 'border-zinc-400 p-0.5' : 'border-transparent'}`}>
                        <div className="w-full h-full rounded-full border border-zinc-200 shadow-inner" style={{ backgroundColor: c }} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-900">Prix</h4>
                    <span className="text-[10px] font-bold text-zinc-500">2,000 DA - 8,000 DA</span>
                  </div>
                  <div className="h-2 bg-zinc-100 rounded-full w-full relative">
                    <div className="absolute left-[20%] right-[30%] h-full bg-black rounded-full" />
                    <div className="w-5 h-5 bg-white border-2 border-black rounded-full absolute top-1/2 -translate-y-1/2 left-[20%] -translate-x-1/2 shadow-md" />
                    <div className="w-5 h-5 bg-white border-2 border-black rounded-full absolute top-1/2 -translate-y-1/2 right-[30%] translate-x-1/2 shadow-md" />
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-zinc-100 flex gap-3 bg-white">
                <button className="flex-1 py-4 text-[11px] font-black tracking-widest uppercase text-zinc-500 bg-zinc-100 rounded-full hover:bg-zinc-200 transition-colors">
                  Réinitialiser
                </button>
                <button onClick={() => setIsFilterOpen(false)} className="flex-[2] py-4 text-[11px] font-black tracking-widest uppercase text-white bg-black rounded-full hover:bg-[#C9A96E] transition-colors shadow-lg">
                  Appliquer (42 produits)
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
