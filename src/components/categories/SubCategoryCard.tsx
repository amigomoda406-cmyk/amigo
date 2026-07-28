'use client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';

interface SubCategoryCardProps {
  sub: {
    id: string;
    name: string;
    description: string;
    href: string;
    icon: string;
  };
  accentColor: string;
}

export default function SubCategoryCard({ sub, accentColor }: SubCategoryCardProps) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <Link
      href={sub.href}
      className={`relative flex items-center gap-3 p-3 bg-white border border-zinc-100 rounded-[16px] overflow-hidden transition-all duration-300 shadow-sm ${isPressed ? 'scale-[0.98]' : 'hover:shadow-md hover:border-zinc-200'}`}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
    >
      <div 
        className="w-10 h-10 rounded-[12px] flex items-center justify-center text-lg shrink-0 transition-transform duration-300 group-hover:scale-110"
        style={{ backgroundColor: `${accentColor}15` }}
      >
        <span>{sub.icon}</span>
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-zinc-900 truncate">{sub.name}</h3>
        <p className="text-[10px] text-zinc-500 truncate mt-0.5 font-medium">{sub.description}</p>
      </div>

      <div 
        className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center opacity-70 transition-transform group-hover:translate-x-1"
        style={{ color: accentColor, backgroundColor: `${accentColor}10` }}
      >
        <ArrowRight className="w-3 h-3" />
      </div>
    </Link>
  );
}
