'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="breadcrumb" className="flex items-center gap-1 flex-wrap py-1">
      {/* Home icon always first */}
      <Link href="/" className="text-zinc-300 hover:text-zinc-600 transition-colors duration-200 flex items-center">
        <Home className="w-3 h-3" />
      </Link>

      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1">
          <ChevronRight className="w-2.5 h-2.5 text-zinc-200 flex-shrink-0" />
          {item.href && i < items.length - 1 ? (
            <Link
              href={item.href}
              className="text-[10px] text-zinc-400 hover:text-zinc-900 transition-colors duration-200 font-bold uppercase tracking-wider leading-none"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-[10px] text-zinc-900 font-black uppercase tracking-wider truncate max-w-[160px] leading-none">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
