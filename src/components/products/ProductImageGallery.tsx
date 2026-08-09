'use client';
import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { urlFor } from '@/lib/sanity/client';

export default function ProductImageGallery({ images = [], title }: { images: any[], title: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Default fallback image if no images provided
  const displayImages = images.length > 0 ? images : [{ _id: 'fallback', asset: null }];

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollPosition = scrollRef.current.scrollLeft;
    const width = scrollRef.current.offsetWidth;
    const newIndex = Math.round(scrollPosition / width);
    setActiveIndex(newIndex);
  };

  const scrollTo = (index: number) => {
    if (!scrollRef.current) return;
    const width = scrollRef.current.offsetWidth;
    scrollRef.current.scrollTo({ left: width * index, behavior: 'smooth' });
  };

  return (
    <div className="relative bg-zinc-100 group/gallery">
      {/* Main Gallery */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar w-full aspect-[4/5] cursor-crosshair"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {displayImages.map((img, idx) => {
          const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
          const [isHovering, setIsHovering] = useState(false);

          const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
            const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
            const x = ((e.clientX - left) / width) * 100;
            const y = ((e.clientY - top) / height) * 100;
            setMousePos({ x, y });
          };

          const imageUrl = img.asset ? urlFor(img).width(1000).height(1250).url() : '';

          return (
            <div 
              key={idx} 
              className="shrink-0 w-full h-full snap-center relative overflow-hidden group"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              onMouseMove={handleMouseMove}
            >
              {img.asset ? (
                <>
                  {/* الصورة الأساسية */}
                  <img 
                    src={imageUrl} 
                    alt={`${title} - Image ${idx + 1}`}
                    className={`w-full h-full object-cover object-top transition-opacity duration-300 ${isHovering ? 'md:opacity-0' : 'opacity-100'}`}
                  />
                  {/* صورة التكبير تظهر فقط في الديسكتوب وعند الـ Hover */}
                  <div 
                    className="absolute inset-0 w-full h-full hidden md:block opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      backgroundImage: `url(${imageUrl})`,
                      backgroundPosition: `${mousePos.x}% ${mousePos.y}%`,
                      backgroundSize: '200%',
                      backgroundRepeat: 'no-repeat',
                    }}
                  />
                </>
              ) : (
                <div className="w-full h-full bg-zinc-200 flex items-center justify-center text-zinc-400">
                  No Image
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Counter Badge */}
      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full z-10">
        {activeIndex + 1} / {displayImages.length}
      </div>

      {/* Dots Indicator */}
      {displayImages.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
          {displayImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => scrollTo(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === activeIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
