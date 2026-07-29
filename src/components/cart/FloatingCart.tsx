'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, Minus, Plus, ArrowRight, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCartStore, useCartTotalItems, useCartTotalPrice } from '@/contexts/cart.store';
import { urlFor } from '@/lib/sanity/client';

export default function FloatingCart() {
  const { items, isOpen, closeCart, removeItem, updateQuantity } = useCartStore();
  const totalItems = useCartTotalItems();
  const totalPrice = useCartTotalPrice();
  const router = useRouter();
  // Lock scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleCheckout = () => {
    closeCart();
    router.push('/checkout');
  };

  return (
    <>
      {/* Cart Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeCart}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[85]"
            />

            {/* Drawer Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed top-0 right-0 bottom-0 w-full sm:w-[400px] z-[90] flex flex-col bg-white shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 shrink-0 bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-[11px] font-black tracking-widest uppercase text-zinc-900">
                      Votre Panier
                    </h2>
                    <p className="text-[9px] text-zinc-500 font-bold">{totalItems} articles</p>
                  </div>
                </div>
                <button
                  onClick={closeCart}
                  className="w-9 h-9 flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors"
                >
                  <X className="w-4 h-4 text-zinc-700" />
                </button>
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto py-3 px-4 space-y-3">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-16">
                    <div className="w-20 h-20 rounded-2xl bg-zinc-100 flex items-center justify-center">
                      <ShoppingBag className="w-8 h-8 text-zinc-300" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black tracking-widest uppercase text-zinc-900 mb-1">Panier vide</h3>
                      <p className="text-[10px] font-bold text-zinc-400">Découvrez nos nouveautés</p>
                    </div>
                    <button
                      onClick={closeCart}
                      className="mt-2 bg-zinc-900 text-white px-6 py-3 text-[10px] font-black tracking-widest uppercase rounded-xl hover:bg-zinc-800 transition-colors flex items-center gap-2"
                    >
                      Continuer vos achats <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 60, transition: { duration: 0.2 } }}
                        className="flex gap-3 bg-zinc-50 rounded-2xl p-2.5 border border-zinc-100"
                      >
                        {/* Image */}
                        <div className="w-[72px] h-[88px] rounded-xl bg-zinc-200 overflow-hidden shrink-0 relative">
                          {item.imageUrl && item.imageUrl !== '' ? (
                            <Image
                              src={typeof item.imageUrl === 'string' ? item.imageUrl : urlFor(item.imageUrl).width(144).height(176).url()}
                              alt={item.title}
                              fill
                              className="object-cover"
                              sizes="72px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs font-bold">IMG</div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex flex-col flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <p className="text-[11px] font-black tracking-widest uppercase text-zinc-900 line-clamp-2 leading-tight">
                              {item.title}
                            </p>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="shrink-0 w-6 h-6 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Variants */}
                          <div className="flex gap-1 mt-1">
                            {item.selectedSize && (
                              <span className="text-[8px] font-bold uppercase text-zinc-600 bg-white border border-zinc-200 px-1.5 py-0.5 rounded-md">
                                {item.selectedSize}
                              </span>
                            )}
                            {item.selectedColor && (
                              <span className="text-[8px] font-bold uppercase text-zinc-600 bg-white border border-zinc-200 px-1.5 py-0.5 rounded-md">
                                {item.selectedColor}
                              </span>
                            )}
                          </div>

                          {/* Price + Qty */}
                          <div className="mt-auto pt-2 flex items-center justify-between">
                            <div className="flex items-center gap-1 bg-white rounded-lg border border-zinc-200 p-0.5">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-zinc-100 text-zinc-700 transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-black w-5 text-center text-zinc-900">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-zinc-100 text-zinc-700 transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <span className="text-[12px] font-black text-zinc-900">
                              {(item.price * item.quantity).toLocaleString('fr-DZ')} DA
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <div className="shrink-0 border-t border-zinc-100 bg-white p-4 space-y-3">
                  {/* Subtotal */}
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Sous-total</span>
                    <span className="text-lg font-black text-zinc-900">{totalPrice.toLocaleString('fr-DZ')} DA</span>
                  </div>
                  <p className="text-[9px] text-zinc-400 font-medium">Frais de livraison calculés à l'étape suivante</p>

                  {/* Checkout Button */}
                  <motion.button
                    onClick={handleCheckout}
                    whileTap={{ scale: 0.97 }}
                    className="w-full bg-zinc-900 text-white py-4 rounded-2xl text-[11px] font-black tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors shadow-xl"
                  >
                    Commander <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
