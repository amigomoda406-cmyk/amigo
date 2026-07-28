'use client';
import { useCartStore } from '@/contexts/cart.store';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { urlFor } from '@/lib/sanity/client';
import Link from 'next/link';

export default function CartItem({ item }: { item: any }) {
  const { removeItem, updateQuantity } = useCartStore();

  const handleRemove = () => {
    if ('vibrate' in navigator) navigator.vibrate(10);
    removeItem(item.id);
  };

  const handleQuantity = (newQty: number) => {
    if ('vibrate' in navigator) navigator.vibrate(5);
    updateQuantity(item.id, newQty);
  };

  return (
    <div className="flex gap-4 p-4 border-b border-zinc-100 bg-white">
      {/* Image */}
      <Link href={`/products/${item.slug || item._id}`} className="shrink-0 w-24 h-28 bg-zinc-100 rounded-xl overflow-hidden relative">
        {item.image?.asset ? (
          <img 
            src={urlFor(item.image).width(200).height(240).url()} 
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-400">No Img</div>
        )}
      </Link>

      {/* Details */}
      <div className="flex-1 flex flex-col min-w-0 py-1">
        <div className="flex justify-between items-start gap-2">
          <Link href={`/products/${item.slug || item._id}`} className="block">
            <h3 className="text-xs font-bold text-zinc-900 leading-snug line-clamp-2">{item.title}</h3>
          </Link>
          <button onClick={handleRemove} className="shrink-0 text-zinc-400 hover:text-red-500 transition-colors p-1">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Variants */}
        <div className="flex flex-wrap gap-2 mt-2">
          {item.selectedColor && (
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">
              {item.selectedColor}
            </span>
          )}
          {item.selectedSize && (
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">
              Taille: {item.selectedSize}
            </span>
          )}
        </div>

        <div className="mt-auto pt-3 flex items-end justify-between">
          <span className="text-sm font-black text-zinc-900">
            {(item.price * item.quantity).toLocaleString('fr-DZ')} DA
          </span>

          <div className="flex items-center gap-3 bg-zinc-100 rounded-full p-1">
            <button 
              className="w-6 h-6 flex items-center justify-center rounded-full bg-white text-zinc-900 shadow-sm disabled:opacity-50"
              onClick={() => handleQuantity(item.quantity - 1)}
              disabled={item.quantity <= 1}
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-[11px] font-black w-3 text-center">{item.quantity}</span>
            <button 
              className="w-6 h-6 flex items-center justify-center rounded-full bg-white text-zinc-900 shadow-sm disabled:opacity-50"
              onClick={() => handleQuantity(item.quantity + 1)}
              disabled={item.quantity >= 10}
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
