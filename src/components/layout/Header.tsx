'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header className="flex items-center justify-between px-4 md:px-8 py-3 bg-white sticky top-0 z-50 border-b border-zinc-100">
      <Link href="/" className="flex items-center group relative">
        <h1 className="text-sm md:text-xl font-black tracking-tighter text-zinc-900 animate-pulse group-hover:animate-none drop-shadow-[0_0_8px_rgba(37,99,235,0.4)]">
          AMIGO MODA
        </h1>
        {/* Glow effect behind the logo */}
        <div className="absolute inset-0 bg-blue-600/20 blur-xl rounded-full opacity-50 animate-pulse -z-10"></div>
      </Link>
      
      <nav className="flex items-center gap-2 md:gap-8 text-[8px] md:text-sm font-bold tracking-widest text-zinc-900 uppercase overflow-x-auto no-scrollbar whitespace-nowrap">
        <Link href="/#trending" className="hover:text-blue-600 transition-colors">Trending</Link>
        <Link href="/category/shoes" className="hover:text-blue-600 transition-colors">Shoes</Link>
        <Link href="/category/clothes" className="hover:text-blue-600 transition-colors">Vêtements</Link>
        <Link href="/category/accessories" className="hover:text-blue-600 transition-colors">Accessoires</Link>
        <Link href="/#new" className="text-blue-600 hover:text-blue-800 transition-colors">New</Link>
      </nav>
    </header>
  );
}

