'use client';
import { useCartStore } from '@/contexts/cart.store';
import Link from 'next/link';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export default function EmptyCart() {
  const { toggleCart } = useCartStore(); // If used in a drawer
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mb-6">
        <ShoppingBag className="w-8 h-8 text-zinc-400" />
      </div>
      <h2 className="text-xl font-black uppercase tracking-tighter text-zinc-900 mb-2">Votre panier est vide</h2>
      <p className="text-sm text-zinc-500 font-medium mb-8">
        Découvrez nos nouvelles collections et trouvez votre style.
      </p>
      <Link 
        href="/"
        onClick={() => toggleCart?.()}
        className="bg-zinc-900 text-white px-8 py-4 rounded-full text-xs font-black tracking-widest uppercase flex items-center gap-2 hover:bg-zinc-800 transition-colors"
      >
        Continuer vos achats <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
