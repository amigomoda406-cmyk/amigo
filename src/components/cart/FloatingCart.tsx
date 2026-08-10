'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, Minus, Plus, ArrowRight, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCartStore, useCartTotalItems, useCartTotalPrice } from '@/contexts/cart.store';
import { urlFor, client } from '@/lib/sanity/client';

export default function FloatingCart() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, addItem } = useCartStore();
  const totalItems = useCartTotalItems();
  const totalPrice = useCartTotalPrice();
  const router = useRouter();
  const [upsellProducts, setUpsellProducts] = useState<any[]>([]);
  // Lock scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Fetch upsell products when cart opens
  useEffect(() => {
    if (isOpen && upsellProducts.length === 0) {
      client.fetch(`*[_type == "product" && isTrending == true][0...4]{ _id, title, price, comparePrice, images, slug }`)
        .then(data => setUpsellProducts(data))
        .catch(console.error);
    }
  }, [isOpen, upsellProducts.length]);

  const handleCheckout = () => {
    closeCart();
    router.push('/checkout');
  };

  const freeShippingThreshold = 3000;
  const isFreeShipping = totalPrice >= freeShippingThreshold;
  const shippingProgress = Math.min((totalPrice / freeShippingThreshold) * 100, 100);
  const remainingForFreeShipping = freeShippingThreshold - totalPrice;

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
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[85]"
            />

            {/* Drawer Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed top-0 right-0 bottom-0 w-full sm:w-[420px] z-[90] flex flex-col bg-white shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 shrink-0 bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center shadow-lg">
                    <ShoppingBag className="w-4 h-4 text-[#C9A96E]" />
                  </div>
                  <div>
                    <h2 className="text-[12px] font-black tracking-widest uppercase text-zinc-900">
                      Votre Panier
                    </h2>
                    <p className="text-[10px] text-zinc-500 font-bold">{totalItems} articles</p>
                  </div>
                </div>
                <button
                  onClick={closeCart}
                  className="w-9 h-9 flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors"
                >
                  <X className="w-4 h-4 text-zinc-700" />
                </button>
              </div>

              {/* Free Shipping Progress (Idea 101) */}
              <div className="bg-zinc-50 px-5 py-3 border-b border-zinc-100 shrink-0">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900">
                    {isFreeShipping 
                      ? '🎉 Livraison gratuite débloquée!' 
                      : `Plus que ${remainingForFreeShipping.toLocaleString('fr-DZ')} DA pour la livraison gratuite`
                    }
                  </span>
                </div>
                <div className="h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${shippingProgress}%` }}
                    className={`h-full rounded-full transition-all duration-700 ${isFreeShipping ? 'bg-emerald-500' : 'bg-black'}`}
                  />
                </div>
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {items.length === 0 ? (
                  /* Cart Empty State (Idea 106) */
                  <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-16">
                    <div className="w-24 h-24 rounded-full bg-zinc-50 border-2 border-dashed border-zinc-200 flex items-center justify-center mb-2">
                      <ShoppingBag className="w-10 h-10 text-zinc-300" strokeWidth={1} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black tracking-widest uppercase text-zinc-900 mb-2">Votre panier est vide</h3>
                      <p className="text-[11px] font-medium text-zinc-500 max-w-[250px] mx-auto">
                        Découvrez nos nouvelles collections et trouvez votre prochain coup de cœur.
                      </p>
                    </div>
                    <button
                      onClick={closeCart}
                      className="mt-4 bg-black text-white px-8 py-4 text-[11px] font-black tracking-widest uppercase rounded-full hover:bg-[#C9A96E] transition-all flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-1"
                    >
                      Découvrir les nouveautés <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                        className="flex gap-4 bg-white p-2"
                      >
                        {/* Image */}
                        <div className="w-[80px] h-[100px] rounded-xl bg-zinc-100 overflow-hidden shrink-0 relative border border-zinc-100">
                          {item.imageUrl && item.imageUrl !== '' ? (
                            <Image
                              src={typeof item.imageUrl === 'string' ? item.imageUrl : urlFor(item.imageUrl).width(160).height(200).url()}
                              alt={item.title}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs font-bold">IMG</div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex flex-col flex-1 min-w-0 py-1">
                          <div className="flex justify-between items-start gap-2">
                            <p className="text-[11px] font-black uppercase text-zinc-900 line-clamp-2 leading-tight pr-4">
                              {item.title}
                            </p>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="shrink-0 text-zinc-400 hover:text-red-500 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Variants */}
                          <div className="flex gap-2 mt-1.5">
                            {item.selectedSize && (
                              <span className="text-[9px] font-bold text-zinc-500">
                                Taille: <span className="text-zinc-900">{item.selectedSize}</span>
                              </span>
                            )}
                            {item.selectedColor && (
                              <span className="text-[9px] font-bold text-zinc-500">
                                Couleur: <span className="text-zinc-900">{item.selectedColor}</span>
                              </span>
                            )}
                          </div>

                          {/* Price + Qty (Idea 107) */}
                          <div className="mt-auto pt-2 flex items-center justify-between">
                            <span className="text-sm font-black text-[#C9A96E]">
                              {(item.price).toLocaleString('fr-DZ')} DA
                            </span>
                            <div className="flex items-center gap-3 bg-zinc-50 rounded-full px-2 py-1 border border-zinc-100">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-5 h-5 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-zinc-100 text-zinc-900 transition-colors"
                              >
                                <Minus className="w-3 h-3" strokeWidth={3} />
                              </button>
                              <span className="text-[10px] font-black w-4 text-center text-zinc-900">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-5 h-5 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-zinc-100 text-zinc-900 transition-colors"
                              >
                                <Plus className="w-3 h-3" strokeWidth={3} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    
                    {/* Gift Wrap Option (Idea 108) */}
                    <div className="mt-4 p-3 bg-rose-50/50 border border-rose-100 rounded-xl flex items-start gap-3 cursor-pointer hover:bg-rose-50 transition-colors">
                      <input type="checkbox" id="gift-wrap" className="mt-1 w-4 h-4 rounded text-rose-500 focus:ring-rose-500 border-rose-200 cursor-pointer" />
                      <label htmlFor="gift-wrap" className="flex-1 cursor-pointer select-none">
                        <span className="text-[11px] font-black uppercase tracking-widest text-zinc-900 flex items-center gap-1.5">
                          🎁 Emballage Cadeau <span className="text-rose-500">(+500 DA)</span>
                        </span>
                        <p className="text-[9px] text-zinc-500 font-medium mt-0.5">Ajoutez un emballage premium et un message personnalisé.</p>
                      </label>
                    </div>

                    {/* In-Cart Upsell (Idea 103) */}
                    {upsellProducts.length > 0 && (
                      <div className="mt-6 border-t border-zinc-100 pt-6">
                        <h3 className="text-[10px] font-black tracking-widest uppercase text-zinc-500 mb-4 text-center">Vous aimerez aussi</h3>
                        <div className="flex overflow-x-auto gap-3 pb-4 snap-x hide-scrollbar">
                          {upsellProducts.map(prod => (
                            <div key={prod._id} className="w-[120px] shrink-0 snap-start">
                              <div className="aspect-[3/4] bg-zinc-100 rounded-xl overflow-hidden relative mb-2">
                                <Image src={urlFor(prod.images[0]).width(240).height(320).url()} alt={prod.title} fill className="object-cover" sizes="120px" />
                                <button className="absolute bottom-2 right-2 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-black hover:text-white transition-colors">
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                              <p className="text-[9px] font-black uppercase text-zinc-900 line-clamp-1">{prod.title}</p>
                              <p className="text-[10px] font-bold text-[#C9A96E]">{prod.price} DA</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </AnimatePresence>
                )}
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <div className="shrink-0 border-t border-zinc-100 bg-white p-5 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] relative z-10">
                  
                  {/* Order Summary (Idea 104) */}
                  <div className="flex flex-col gap-2 mb-4 text-[11px] font-bold text-zinc-500">
                    <div className="flex justify-between items-center">
                      <span>Sous-total</span>
                      <span className="text-zinc-900">{totalPrice.toLocaleString('fr-DZ')} DA</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Livraison</span>
                      {isFreeShipping ? (
                        <span className="text-emerald-500 font-black uppercase">Gratuite</span>
                      ) : (
                        <span>Calculée à l'étape suivante</span>
                      )}
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div className="flex justify-between items-end mb-4 pt-4 border-t border-zinc-100">
                    <span className="text-xs font-black uppercase tracking-widest text-zinc-900">Total</span>
                    <span className="text-2xl font-black text-black leading-none">{totalPrice.toLocaleString('fr-DZ')} DA</span>
                  </div>

                  {/* Checkout Button */}
                  <motion.button
                    onClick={handleCheckout}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-black text-white py-4 rounded-full text-[11px] font-black tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-[#C9A96E] transition-colors shadow-lg hover:shadow-xl"
                  >
                    Procéder au paiement <ArrowRight className="w-4 h-4" />
                  </motion.button>

                  {/* Trust Badges in Cart (Idea 105) */}
                  <div className="mt-4 flex items-center justify-center gap-4 text-zinc-400">
                    <div className="flex items-center gap-1" title="Paiement à la livraison">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                      <span className="text-[8px] font-bold uppercase tracking-widest">Paiement à la livraison</span>
                    </div>
                    <div className="flex items-center gap-1" title="Paiement Sécurisé">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                      <span className="text-[8px] font-bold uppercase tracking-widest">Sécurisé</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
