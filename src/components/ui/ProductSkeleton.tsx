'use client';

// Skeleton للبطاقة الواحدة
export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] bg-zinc-100 rounded-xl mb-2" />
      <div className="h-2.5 bg-zinc-100 rounded-full w-3/4 mb-1.5" />
      <div className="flex gap-1 mb-1.5">
        {[1, 2, 3].map(i => (
          <div key={i} className="w-3 h-3 rounded-full bg-zinc-100" />
        ))}
      </div>
      <div className="h-3 bg-zinc-100 rounded-full w-1/3" />
    </div>
  );
}

// Skeleton Grid
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
