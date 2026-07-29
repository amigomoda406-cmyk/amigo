'use client';

import Image from 'next/image';
import Link from 'next/link';
import { urlFor } from '@/lib/sanity/client';

interface Product {
  _id: string;
  title: string;
  slug: { current: string };
  price: number;
  comparePrice?: number;
  images?: any[];
  isNew?: boolean;
  isTrending?: boolean;
}

export default function RelatedProducts({ products }: { products: Product[] }) {
  if (!products || products.length === 0) return null;

  return (
    <section className="px-4 py-8 max-w-5xl mx-auto">
      <h2 className="text-[11px] font-black tracking-widest uppercase text-zinc-900 mb-4">
        Vous aimerez aussi
      </h2>
      <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 no-scrollbar pb-2">
        {products.map((product) => {
          const img = product.images?.[0];
          const imageUrl = img?.asset ? urlFor(img).width(300).height(375).url() : null;
          const discount = product.comparePrice
            ? Math.round((1 - product.price / product.comparePrice) * 100)
            : null;

          return (
            <Link
              key={product._id}
              href={`/products/${product.slug.current}`}
              className="shrink-0 w-[42vw] md:w-[200px] snap-start group"
            >
              <div className="relative aspect-[4/5] bg-zinc-100 rounded-xl overflow-hidden mb-2">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={product.title}
                    fill
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 42vw, 200px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-300 text-xs font-bold">IMG</div>
                )}
                {discount && (
                  <span className="absolute top-2 left-2 text-[8px] font-black text-white bg-blue-600 px-1.5 py-0.5 rounded-md">
                    -{discount}%
                  </span>
                )}
                {product.isNew && (
                  <span className="absolute top-2 right-2 text-[8px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-md">
                    Nouveau
                  </span>
                )}
              </div>
              <p className="text-[10px] font-black tracking-widest uppercase text-zinc-900 line-clamp-1 mb-0.5">
                {product.title}
              </p>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-black text-zinc-900">{product.price.toLocaleString('fr-DZ')} DA</span>
                {product.comparePrice && (
                  <span className="text-[9px] font-bold text-zinc-400 line-through">{product.comparePrice.toLocaleString('fr-DZ')} DA</span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
