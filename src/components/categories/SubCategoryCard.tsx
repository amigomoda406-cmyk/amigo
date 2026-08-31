'use client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';

interface SubCategoryCardProps {
  sub: {
    _id: string;
    title: string;
    slug: string;
    imageUrl?: string;
  };
  parentSlug: string;
  accentColor: string;
}

export default function SubCategoryCard({ sub, parentSlug, accentColor }: SubCategoryCardProps) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <Link
      href={`/category/${parentSlug}/${sub.slug}`}
      className={`relative flex items-center gap-3 p-3 bg-white border border-zinc-100 rounded-[16px] overflow-hidden transition-all duration-300 shadow-sm ${isPressed ? 'scale-[0.98]' : 'hover:shadow-md hover:border-zinc-200'}`}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
    >
      <div 
        className="w-12 h-12 rounded-[10px] flex items-center justify-center text-lg shrink-0 overflow-hidden relative"
        style={{ backgroundColor: `${accentColor}15` }}
      >
        {sub.imageUrl ? (
          <img src={sub.imageUrl} alt={sub.title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xl" style={{ color: accentColor }}>#</span>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-zinc-900 truncate uppercase">{sub.title}</h3>
      </div>

      <div 
        className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center opacity-70 transition-transform group-hover:translate-x-1"
        style={{ color: accentColor, backgroundColor: `${accentColor}10` }}
      >
        <ArrowRight className="w-4 h-4" />
      </div>
    </Link>
  );
}
