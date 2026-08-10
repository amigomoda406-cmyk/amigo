'use client';

import { useEffect, useState } from 'react';

export default function PageLoader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hide the loader after 800ms to allow the site to show
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 bg-white z-[9999] flex items-center justify-center pointer-events-none transition-opacity duration-500 ease-out">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <img src="/am-monogram.svg" alt="Amigo Moda" className="w-16 h-16 text-[#C9A96E]" />
        <span className="text-[10px] tracking-[0.3em] font-black text-zinc-400 uppercase">
          Amigo Moda
        </span>
      </div>
    </div>
  );
}
