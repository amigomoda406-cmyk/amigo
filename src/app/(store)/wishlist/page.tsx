'use client';

import { useWishlistStore } from '@/contexts/wishlist.store';
import Link from 'next/link';
import Image from 'next/image';
import { HeartCrack, ShoppingCart, Trash2 } from 'lucide-react';
import { useCartStore } from '@/contexts/cart.store';

export default function WishlistPage() {
  const { items, toggle } = useWishlistStore();
  const { addItem } = useCartStore();

  return (
    <main className="min-h-[100svh] bg-zinc-50 pb-20 pt-6 px-4 md:px-8 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8 border-b border-zinc-200 pb-4">
        <h1 className="text-2xl font-black uppercase tracking-tighter text-zinc-900">
          المفضلة <span className="text-zinc-400 text-lg">({items.length})</span>
        </h1>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mb-6">
            <HeartCrack className="w-8 h-8 text-zinc-300" />
          </div>
          <h2 className="text-xl font-black uppercase tracking-widest text-zinc-900 mb-2">قائمتك فارغة</h2>
          <p className="text-zinc-500 text-sm mb-8 font-medium">لم تقم بإضافة أي منتجات إلى مفضلتك بعد.</p>
          <Link
            href="/products"
            className="bg-zinc-900 text-white px-8 py-4 text-xs font-black uppercase tracking-widest rounded-full hover:bg-zinc-800 transition-colors"
          >
            تصفح المنتجات
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.productId} className="bg-white rounded-2xl p-3 flex gap-4 shadow-sm border border-zinc-100 relative group">
              {/* Image */}
              <Link href={`/products/${item.slug}`} className="w-24 h-32 relative rounded-xl overflow-hidden bg-zinc-100 flex-shrink-0">
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-zinc-400">No Img</div>
                )}
              </Link>
              
              {/* Details */}
              <div className="flex flex-col justify-between flex-1 py-1">
                <div>
                  <Link href={`/products/${item.slug}`} className="text-xs md:text-sm font-black uppercase text-zinc-900 line-clamp-2 leading-tight hover:underline">
                    {item.title}
                  </Link>
                  <p className="text-sm font-black text-blue-600 mt-1">
                    {item.price.toLocaleString('fr-DZ')} DA
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => addItem({ ...item, quantity: 1 })}
                    className="flex-1 bg-zinc-900 text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 hover:bg-zinc-800 transition-colors"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" /> أضف
                  </button>
                  <button
                    onClick={() => toggle(item)}
                    className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-100 transition-colors"
                    title="حذف من المفضلة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
