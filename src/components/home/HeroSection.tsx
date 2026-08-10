'use client';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import RotatingText from '@/components/ui/RotatingText';

export default function HeroSection({ homeData }: { homeData?: any }) {
  const banner = homeData?.heroBanners?.[0];
  const bgImage = banner?.imageUrl || 'https://res.cloudinary.com/doxg77zqk/image/upload/v1785160624/Remove_basket_increase_quality_2K_202607271454.jpg';
  const mobileImage = banner?.mobileImageUrl || bgImage;

  return (
    <section className="relative w-full h-[70vh] min-h-[500px] md:h-[85vh] bg-zinc-900 overflow-hidden flex flex-col md:flex-row">
      {/* الصورة (خلفية في الموبايل، نصف الشاشة في الديسكتوب) */}
      <div className="absolute inset-0 md:relative md:w-1/2 h-full z-0">
        <Image
          src={mobileImage}
          alt={banner?.title || 'Hero Banner'}
          fill
          className="object-cover object-top md:hidden opacity-60 md:opacity-100"
          priority
        />
        <Image
          src={bgImage}
          alt={banner?.title || 'Hero Banner'}
          fill
          className="object-cover hidden md:block"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent md:hidden" />
        
        {/* Brand Seal (Desktop Only) */}
        <div className="hidden md:flex absolute top-12 left-12 w-32 h-32 text-white opacity-80 mix-blend-overlay">
          <img src="/brand-seal.svg" alt="Authentic" className="w-full h-full animate-spin-slow text-white" />
        </div>
      </div>

      {/* المحتوى النصي */}
      <div className="relative z-10 w-full h-full md:w-1/2 flex flex-col items-start justify-end md:justify-center px-6 pb-12 md:px-16 md:bg-white text-white md:text-zinc-900">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex items-center gap-3 mb-4 relative"
        >
          {/* Brand Seal (Mobile Only) */}
          <div className="md:hidden absolute -top-24 right-0 w-20 h-20 text-white opacity-90">
            <img src="/brand-seal.svg" alt="Authentic" className="w-full h-full animate-spin-slow" />
          </div>

          <div className="h-px w-8 md:w-12 bg-white md:bg-[#C9A96E]" />
          <span className="text-xs md:text-sm font-black tracking-[0.2em] uppercase text-white md:text-[#C9A96E]">
            {banner?.subtitle || 'NEW COLLECTION'}
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-5xl md:text-[5.5rem] font-black tracking-tighter uppercase leading-[0.9] mb-3">
            {banner?.title || 'STYLE'}
            <br />
            <RotatingText />
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full sm:w-auto"
        >
          <Link 
            href={banner?.buttonLink || "/#categories"} 
            className="group relative inline-flex items-center justify-center w-full sm:w-auto overflow-hidden bg-white md:bg-zinc-900 text-zinc-900 md:text-white px-8 py-4 text-xs font-black tracking-widest uppercase transition-all hover:scale-105 active:scale-95"
          >
            <span className="relative z-10 flex items-center gap-3">
              {banner?.buttonText || 'تسوق الآن'} 
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out z-0" />
          </Link>
        </motion.div>
      </div>

      {/* شارة التخفيض الدائرية (Brand Seal) */}
      <motion.div 
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.5 }}
        className="absolute top-6 right-6 md:top-10 md:right-1/2 md:translate-x-1/2 w-20 h-20 md:w-32 md:h-32 bg-blue-600 rounded-full flex flex-col items-center justify-center text-white shadow-2xl z-20 border-[3px] border-white md:border-4"
      >
        <span className="text-[8px] md:text-xs font-bold tracking-widest uppercase mb-[-2px] md:mb-[-4px]">تخفيضات</span>
        <span className="text-2xl md:text-5xl font-black leading-none">50<span className="text-base md:text-2xl">%</span></span>
      </motion.div>
    </section>
  );
}
