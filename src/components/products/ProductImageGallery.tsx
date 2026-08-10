'use client';
import { useState, useRef, useCallback } from 'react';
import { ZoomIn } from 'lucide-react';
import { urlFor } from '@/lib/sanity/client';

export default function ProductImageGallery({ images = [], title }: { images: any[], title: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isZooming, setIsZooming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Default fallback image if no images provided
  const displayImages = images.length > 0 ? images : [{ _id: 'fallback', asset: null }];
  const activeImage = displayImages[activeIndex];
  const activeImageUrl = activeImage?.asset ? urlFor(activeImage).width(1200).height(1500).url() : '';

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollPosition = scrollRef.current.scrollLeft;
    const width = scrollRef.current.offsetWidth;
    const newIndex = Math.round(scrollPosition / width);
    setActiveIndex(newIndex);
  };

  const scrollTo = (index: number) => {
    setActiveIndex(index);
    if (!scrollRef.current) return;
    const width = scrollRef.current.offsetWidth;
    scrollRef.current.scrollTo({ left: width * index, behavior: 'smooth' });
  };

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - left) / width) * 100,
      y: ((e.clientY - top) / height) * 100,
    });
  }, []);

  return (
    <div className="flex flex-col gap-3">
      {/* Main Image — Desktop: clickable zoom; Mobile: swipeable */}
      <div className="relative bg-zinc-100 rounded-2xl overflow-hidden group/gallery">
        {/* Mobile: scroll gallery */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex md:hidden overflow-x-auto snap-x snap-mandatory aspect-[4/5] cursor-pointer"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {displayImages.map((img, idx) => {
            const url = img.asset ? urlFor(img).width(800).height(1000).url() : '';
            return (
              <div key={idx} className="shrink-0 w-full h-full snap-center relative overflow-hidden">
                {img.asset ? (
                  <img src={url} alt={`${title} - ${idx + 1}`} className="w-full h-full object-cover object-top" />
                ) : (
                  <div className="w-full h-full bg-zinc-200 flex items-center justify-center text-zinc-400 text-xs">No Image</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Desktop: single image with zoom */}
        <div
          className="hidden md:block aspect-[4/5] overflow-hidden cursor-crosshair relative"
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsZooming(true)}
          onMouseLeave={() => setIsZooming(false)}
        >
          {activeImage?.asset ? (
            <>
              {/* Normal image */}
              <img
                src={activeImageUrl}
                alt={`${title}`}
                className={`w-full h-full object-cover object-top transition-opacity duration-300 ${isZooming ? 'opacity-0' : 'opacity-100'}`}
              />
              {/* Zoomed layer */}
              <div
                className={`absolute inset-0 transition-opacity duration-200 ${isZooming ? 'opacity-100' : 'opacity-0'}`}
                style={{
                  backgroundImage: `url(${activeImageUrl})`,
                  backgroundPosition: `${mousePos.x}% ${mousePos.y}%`,
                  backgroundSize: '220%',
                  backgroundRepeat: 'no-repeat',
                }}
              />
            </>
          ) : (
            <div className="w-full h-full bg-zinc-200 flex items-center justify-center text-zinc-400 text-xs">No Image</div>
          )}
          {/* Zoom hint */}
          <div className={`absolute bottom-4 left-4 flex items-center gap-1.5 bg-white/80 backdrop-blur-md text-zinc-600 text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-full transition-opacity duration-300 ${isZooming ? 'opacity-0' : 'opacity-100 group-hover/gallery:opacity-100'}`}>
            <ZoomIn className="w-3 h-3" /> Zoom
          </div>
        </div>

        {/* Image counter */}
        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md text-white text-[9px] font-black px-2.5 py-1 rounded-full z-10 tracking-widest">
          {activeIndex + 1} / {displayImages.length}
        </div>

        {/* Mobile dots */}
        {displayImages.length > 1 && (
          <div className="md:hidden absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
            {displayImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => scrollTo(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${idx === activeIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/50'}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails strip — Desktop only */}
      {displayImages.length > 1 && (
        <div className="hidden md:flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {displayImages.map((img, idx) => {
            const thumbUrl = img.asset ? urlFor(img).width(120).height(150).url() : '';
            return (
              <button
                key={idx}
                onClick={() => scrollTo(idx)}
                className={`shrink-0 w-[72px] h-[90px] rounded-xl overflow-hidden relative transition-all duration-200 border-2 ${
                  idx === activeIndex
                    ? 'border-black shadow-md scale-[1.03]'
                    : 'border-transparent opacity-60 hover:opacity-90 hover:border-zinc-300'
                }`}
              >
                {img.asset ? (
                  <img src={thumbUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover object-top" />
                ) : (
                  <div className="w-full h-full bg-zinc-100" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
