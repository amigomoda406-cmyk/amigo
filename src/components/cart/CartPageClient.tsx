'use client';
import { useCartStore } from '@/contexts/cart.store';
import Link from 'next/link';
import { ChevronLeft, Trash2, ArrowRight } from 'lucide-react';
import EmptyCart from '@/components/cart/EmptyCart';
import CartItem from '@/components/cart/CartItem';

export default function CartPageClient() {
  const { items, clearCart, totalItems, totalPrice } = useCartStore();

  if (items.length === 0) {
    return (
      <main className="min-h-[100svh] bg-white">
        <header className="flex items-center px-4 py-3 border-b border-zinc-100">
          <Link href="javascript:history.back()" className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-100 text-zinc-600">
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <h1 className="flex-1 text-center text-sm font-black tracking-widest uppercase text-zinc-900 pr-8">Panier</h1>
        </header>
        <EmptyCart />
      </main>
    );
  }

  const shippingCost = 0; // Calcul dynamique plus tard
  const finalTotal = totalPrice + shippingCost;

  return (
    <main className="min-h-[100svh] bg-zinc-50 pb-[120px]">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-md border-b border-zinc-100">
        <div className="flex items-center gap-3">
          <Link href="javascript:history.back()" className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-100 text-zinc-600">
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-sm font-black tracking-widest uppercase text-zinc-900">Mon Panier</h1>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{totalItems} Article{totalItems > 1 ? 's' : ''}</p>
          </div>
        </div>
        
        <button 
          onClick={clearCart}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </header>

      {/* Items */}
      <div className="flex flex-col mb-6">
        {items.map((item) => (
          <CartItem key={item.id} item={item} />
        ))}
      </div>

      {/* Summary */}
      <div className="mx-4 p-5 bg-white rounded-2xl border border-zinc-100 mb-6 shadow-sm">
        <h2 className="text-[11px] font-black tracking-widest uppercase text-zinc-900 mb-4">Résumé de la commande</h2>
        
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-bold text-zinc-500">Sous-total</span>
          <span className="text-sm font-black text-zinc-900">{totalPrice.toLocaleString('fr-DZ')} DA</span>
        </div>
        
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-zinc-100">
          <span className="text-xs font-bold text-zinc-500">Livraison</span>
          <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Calculé à l'étape suivante</span>
        </div>
        
        <div className="flex justify-between items-end">
          <span className="text-sm font-black uppercase tracking-widest text-zinc-900">Total</span>
          <span className="text-xl font-black text-zinc-900">{finalTotal.toLocaleString('fr-DZ')} DA</span>
        </div>
      </div>

      {/* Checkout CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-zinc-100">
        <Link 
          href="/checkout"
          className="w-full flex items-center justify-between bg-zinc-900 text-white p-4 rounded-2xl transition-transform hover:scale-[0.99]"
        >
          <span className="text-[11px] font-black tracking-widest uppercase">Commander</span>
          <div className="flex items-center gap-3">
            <span className="text-sm font-black bg-white/20 px-3 py-1 rounded-full">
              {finalTotal.toLocaleString('fr-DZ')} DA
            </span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>
      </div>
    </main>
  );
}
