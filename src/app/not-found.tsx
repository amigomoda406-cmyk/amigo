import Link from 'next/link';
import { Home, Search, ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-4 text-center">
      {/* الرقم الكبير */}
      <div className="relative mb-8">
        <span
          className="text-[10rem] md:text-[16rem] font-black text-zinc-100 leading-none select-none"
          aria-hidden="true"
        >
          404
        </span>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <h1 className="text-xl md:text-3xl font-black uppercase tracking-tighter text-zinc-900">
            هذه الصفحة اختفت
          </h1>
          <p className="text-zinc-400 text-sm font-medium mt-2 max-w-xs">
            يبدو أن هذه القطعة لم تعد في المخزون — لكن عندنا الكثير من الجميل!
          </p>
        </div>
      </div>

      {/* الأزرار */}
      <div className="flex flex-col sm:flex-row gap-3 mt-4">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 bg-zinc-900 text-white px-8 py-3.5 text-xs font-black tracking-widest uppercase rounded-full hover:bg-zinc-800 transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          العودة للرئيسية
        </Link>
        <Link
          href="/products"
          className="flex items-center justify-center gap-2 bg-zinc-100 text-zinc-900 px-8 py-3.5 text-xs font-black tracking-widest uppercase rounded-full hover:bg-zinc-200 transition-colors"
        >
          <Search className="w-3.5 h-3.5" />
          تصفح المنتجات
        </Link>
      </div>

      {/* Brand text */}
      <p className="mt-12 text-[10px] tracking-[0.3em] uppercase font-bold text-zinc-300">
        Amigo Moda
      </p>
    </main>
  );
}
