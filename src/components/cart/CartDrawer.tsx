'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/contexts/cart.store';
import Link from 'next/link';

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem } = useCartStore();
  const router = useRouter();

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Close drawer on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [closeCart]);

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleCheckout = () => {
    closeCart();
    router.push('/checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[400px] bg-zinc-50 z-[100] flex flex-col shadow-2xl border-l-8 border-zinc-900"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-white border-b border-zinc-200 shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-zinc-900" />
                <h2 className="text-sm font-black tracking-widest uppercase text-zinc-900">
                  Votre Panier ({totalItems})
                </h2>
              </div>
              <button
                onClick={closeCart}
                className="w-8 h-8 flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 rounded-full transition-colors"
                aria-label="Fermer le panier"
              >
                <X className="w-4 h-4 text-zinc-900" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 text-zinc-300" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black tracking-widest uppercase text-zinc-900 mb-1">Votre panier est vide</h3>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Découvrez nos nouveautés</p>
                  </div>
                  <button 
                    onClick={closeCart}
                    className="bg-[#111] text-white px-6 py-3 text-[10px] font-black tracking-widest uppercase flex items-center gap-2 hover:bg-zinc-800 transition-colors"
                  >
                    Continuer vos achats <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-3 bg-white p-2 rounded-xl border border-zinc-200 shadow-sm relative group">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-600 shadow-md"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    
                    <div className="w-20 h-24 relative bg-zinc-100 rounded-lg overflow-hidden shrink-0">
                      {item.imageUrl && item.imageUrl.trim() !== '' ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-400">
                          <ShoppingBag className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col flex-1 py-1">
                      <div className="flex justify-between items-start mb-1">
                        <Link href={`/products/${item.slug}`} onClick={closeCart} className="text-[11px] font-black tracking-widest uppercase text-zinc-900 line-clamp-1 hover:text-blue-600">
                          {item.title}
                        </Link>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-2">
                        {item.selectedSize && (
                          <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-600 bg-zinc-100 px-1.5 py-0.5 rounded-md">
                            Taille: {item.selectedSize}
                          </span>
                        )}
                        {item.selectedColor && (
                          <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-600 bg-zinc-100 px-1.5 py-0.5 rounded-md">
                            Couleur: {item.selectedColor}
                          </span>
                        )}
                      </div>

                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-2 bg-zinc-100 rounded-lg p-0.5 border border-zinc-200">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center bg-white rounded-md text-zinc-900 shadow-sm"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center bg-white rounded-md text-zinc-900 shadow-sm"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-[11px] font-black text-blue-600">{item.price.toLocaleString('fr-DZ')} DA</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="bg-white border-t border-zinc-200 p-4 shrink-0 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Sous-total</span>
                  <span className="text-lg font-black text-zinc-900">{totalPrice.toLocaleString('fr-DZ')} DA</span>
                </div>
                
                <button
                  onClick={handleCheckout}
                  className="w-full bg-[#111] text-white py-4 text-xs font-black tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors shadow-xl"
                >
                  Commander <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-[8px] font-bold text-zinc-400 text-center uppercase tracking-widest">
                  Frais de livraison calculés à l'étape suivante
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
