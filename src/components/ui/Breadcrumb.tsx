'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="breadcrumb" className="flex items-center gap-1 flex-wrap py-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="w-3 h-3 text-zinc-300 flex-shrink-0" />}
          {item.href && i < items.length - 1 ? (
            <Link
              href={item.href}
              className="text-[10px] text-zinc-400 hover:text-zinc-900 transition-colors font-medium"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-[10px] text-zinc-900 font-bold truncate max-w-[180px]">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
