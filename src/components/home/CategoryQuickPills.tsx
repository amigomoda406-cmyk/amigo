'use client';

import Link from 'next/link';

interface QuickLink {
  label: string;
  href: string;
  highlight?: boolean;
}

const quickLinks: QuickLink[] = [
  { label: '✨ New Arrivals', href: '/#new-arrivals', highlight: true },
  { label: '🔥 Trending', href: '/#trending' },
];

interface CategoryPillsProps {
  categories?: { _id: string; title: string; slug: { current: string } }[];
}

export default function CategoryQuickPills({ categories = [] }: CategoryPillsProps) {
  const allLinks: QuickLink[] = [
    ...quickLinks,
    ...categories.map(cat => ({
      label: cat.title,
      href: `/category/${cat.slug.current}`,
    })),
  ];

  return (
    <div className="overflow-x-auto scrollbar-none border-b border-zinc-100 bg-white">
      <div className="flex gap-2 px-4 py-3 min-w-max">
        {allLinks.map((link, i) => (
          <Link
            key={i}
            href={link.href}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${
              link.highlight
                ? 'bg-zinc-900 text-white hover:bg-zinc-700'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
