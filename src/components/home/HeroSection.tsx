'use client';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HeroSection({ homeData }: { homeData?: any }) {
  const banner = homeData?.heroBanners?.[0];
  const bgImage = banner?.imageUrl || 'https://res.cloudinary.com/doxg77zqk/image/upload/v1785160624/Remove_basket_increase_quality_2K_202607271454.jpg';

  return (
    <section 
      className="relative flex h-[190px] md:h-[500px] border-b border-zinc-200 bg-cover bg-center bg-no-repeat transition-all duration-500"
      style={{ backgroundImage: `url('${bgImage}')` }}
    >
      {/* Discount Badge */}
      <div className="absolute top-4 right-3 md:top-8 md:right-8 w-[46px] h-[46px] md:w-[100px] md:h-[100px] rounded-full bg-blue-600 flex flex-col items-center justify-center border-2 border-white shadow-sm z-20">
        <span className="text-[5px] md:text-xs font-bold tracking-widest text-white uppercase">Up to</span>
        <span className="text-[14px] md:text-3xl font-black leading-[0.9] text-white my-[1px] md:my-1">50%</span>
        <span className="text-[5px] md:text-xs font-bold text-white">OFF</span>
      </div>

      {/* Left Content */}
      <div className="w-[70%] pl-4 pt-6 pb-8 md:pl-16 md:pt-16 md:pb-16 flex flex-col items-start justify-center z-10 relative">
        <div className="flex items-center gap-2 mb-2 md:mb-6">
          <span className="text-[5px] md:text-sm font-bold tracking-widest text-blue-600 uppercase">{banner?.subtitle || 'New Collection'}</span>
          <div className="h-px w-6 md:w-16 bg-blue-600"></div>
        </div>
        <h2 className="text-[32px] md:text-[80px] font-black tracking-tighter uppercase leading-[0.85] text-zinc-900 mb-3 md:mb-8" dangerouslySetInnerHTML={{ __html: banner?.title || 'Summer<br/><span class="text-blue-600">Essentials</span>' }} />
        <div className="flex items-center gap-2 w-full mb-5 md:mb-10 z-20 md:max-w-md">
          <div className="h-px bg-zinc-300 flex-1"></div>
          <span className="text-[5px] md:text-sm font-bold tracking-widest text-zinc-900 uppercase shrink-0">Drop Now Live</span>
          <div className="h-px bg-zinc-300 w-8 md:w-24"></div>
        </div>
        <Link href={banner?.buttonLink || "/#categories"} className="bg-[#111] text-white px-4 py-2 md:px-8 md:py-4 text-[6px] md:text-base font-bold tracking-widest uppercase flex items-center gap-1.5 md:gap-3 hover:bg-zinc-800 transition-colors">
          {banner?.buttonText || 'Shop Now'} <ArrowRight className="w-2 h-2 md:w-5 md:h-5" />
        </Link>
      </div>
    </section>
  );
}
