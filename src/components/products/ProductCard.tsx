'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/contexts/cart.store';
import { urlFor } from '@/lib/sanity/client';
import { useHaptics } from '@/hooks/useHaptics';

interface ProductCardProps {
  product: any;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const addItem = useCartStore(state => state.addItem);
  const haptics = useHaptics();

  const imageUrl = product.images?.[0]?.asset?.url
    ? urlFor(product.images[0]).width(300).height(400).auto('format').quality(85).url()
    : null;

  return (
    <Link href={`/products/${product.slug?.current || '#'}`} className="flex flex-col bg-[#f5f4f1] rounded-lg overflow-hidden pb-2 group">
      <div className="aspect-[4/5] relative mb-1 md:mb-3 bg-[#eae9e4] overflow-hidden">
        {product.isNew && (
          <span className="absolute top-1 left-1 md:top-3 md:left-3 bg-[#111] text-white text-[5px] md:text-xs font-bold px-1 py-0.5 md:px-2 md:py-1 uppercase tracking-wider z-10">
            NEW
          </span>
        )}
        
        {imageUrl ? (
          <Image 
            src={imageUrl} 
            alt={product.title} 
            fill 
            className="object-cover group-hover:scale-105 transition-transform duration-500" 
            sizes="(max-width: 768px) 50vw, 25vw" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-400 text-[7px] md:text-sm uppercase font-bold tracking-widest">
            IMG
          </div>
        )}
      </div>
      <span className="text-[6px] md:text-sm font-black uppercase tracking-wider text-center text-zinc-900 px-1 md:px-2 leading-tight line-clamp-1">
        {product.title}
      </span>
      <span className="text-[6px] md:text-sm font-bold text-blue-600 text-center mt-0.5 md:mt-1 pb-2 md:pb-4">
        {product.price?.toLocaleString('fr-DZ')} DA
      </span>
    </Link>
  );
}
