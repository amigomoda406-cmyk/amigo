'use client';

import { useEffect } from 'react';
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

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

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
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className={`fixed inset-0 bg-black/50 z-[85] transition-opacity duration-200 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />

      {/* Drawer Panel */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-full sm:w-[420px] z-[90] flex flex-col bg-white shadow-2xl transition-transform duration-200 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-[#C9A96E]" />
            </div>
            <div>
              <h2 className="text-[12px] font-black tracking-widest uppercase text-zinc-900">Your Cart</h2>
              <p className="text-[10px] text-zinc-500 font-bold">{totalItems} {totalItems === 1 ? 'item' : 'items'}</p>
            </div>
          </div>
          <button
            onClick={closeCart}
            className="w-9 h-9 flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors"
          >
            <X className="w-4 h-4 text-zinc-700" />
          </button>
        </div>

        {/* Free Shipping Progress */}
        <div className="bg-zinc-50 px-5 py-3 border-b border-zinc-100 shrink-0">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900">
              {isFreeShipping
                ? '🎉 Free shipping unlocked!'
                : `${remainingForFreeShipping.toLocaleString()} DA left for free shipping`}
            </span>
          </div>
          <div className="h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${isFreeShipping ? 'bg-emerald-500' : 'bg-black'}`}
              style={{ width: `${shippingProgress}%` }}
            />
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-16">
              <div className="w-24 h-24 rounded-full bg-zinc-50 border-2 border-dashed border-zinc-200 flex items-center justify-center mb-2">
                <ShoppingBag className="w-10 h-10 text-zinc-300" strokeWidth={1} />
              </div>
              <div>
                <h3 className="text-sm font-black tracking-widest uppercase text-zinc-900 mb-2">Your cart is empty</h3>
                <p className="text-[11px] font-medium text-zinc-500 max-w-[250px] mx-auto">
                  Discover our new collections and find your next favorite piece.
                </p>
              </div>
              <button
                onClick={closeCart}
                className="mt-4 bg-black text-white px-8 py-4 text-[11px] font-black tracking-widest uppercase rounded-full hover:bg-[#C9A96E] transition-all flex items-center gap-2"
              >
                Shop Now <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 bg-white">
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
                          Size: <span className="text-zinc-900">{item.selectedSize}</span>
                        </span>
                      )}
                      {item.selectedColor && (
                        <span className="text-[9px] font-bold text-zinc-500">
                          Color: <span className="text-zinc-900">{item.selectedColor}</span>
                        </span>
                      )}
                    </div>

                    {/* Price + Qty */}
                    <div className="mt-auto pt-2 flex items-center justify-between">
                      <span className="text-sm font-black text-[#C9A96E]">
                        {(item.price).toLocaleString()} DA
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
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="shrink-0 border-t border-zinc-100 bg-white p-5">
            <div className="flex flex-col gap-2 mb-4 text-[11px] font-bold text-zinc-500">
              <div className="flex justify-between items-center">
                <span>Subtotal</span>
                <span className="text-zinc-900">{totalPrice.toLocaleString()} DA</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Shipping</span>
                {isFreeShipping ? (
                  <span className="text-emerald-500 font-black uppercase">Free</span>
                ) : (
                  <span>Calculated at next step</span>
                )}
              </div>
            </div>

            <div className="flex justify-between items-end mb-4 pt-4 border-t border-zinc-100">
              <span className="text-xs font-black uppercase tracking-widest text-zinc-900">Total</span>
              <span className="text-2xl font-black text-black leading-none">{totalPrice.toLocaleString()} DA</span>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-black text-white py-4 text-[11px] font-black tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-[#C9A96E] transition-colors"
            >
              Checkout <ArrowRight className="w-4 h-4" />
            </button>

            <div className="mt-4 flex items-center justify-center gap-4 text-zinc-400">
              <span className="text-[8px] font-bold uppercase tracking-widest">Cash on delivery</span>
              <span className="text-zinc-200">|</span>
              <span className="text-[8px] font-bold uppercase tracking-widest">58 Wilayas</span>
              <span className="text-zinc-200">|</span>
              <span className="text-[8px] font-bold uppercase tracking-widest">7-day return</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
