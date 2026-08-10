'use client';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import RotatingText from '@/components/ui/RotatingText';

export default function HeroSection({ homeData }: { homeData?: any }) {
  const banner = homeData?.heroBanners?.[0];
  const bgImage = '/hero-custom.jpeg';
  const mobileImage = '/hero-custom.jpeg';
  const seasonColor = banner?.seasonColor || '#C9A96E';

  return (
    <section className="relative w-full aspect-[4/5] min-h-[500px] md:aspect-auto md:min-h-[600px] md:h-[70vh] bg-zinc-900 overflow-hidden flex flex-col md:flex-row">
      
      {/* Seasonal Background Glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vh] h-[80vh] rounded-full blur-[140px] opacity-15 z-0 pointer-events-none"
        style={{ backgroundColor: seasonColor }}
      />

      {/* Image */}
      <div className="absolute inset-0 md:relative md:w-1/2 h-full z-0">
        <Image
          src={mobileImage}
          alt={banner?.title || 'Hero Banner'}
          fill
          className="object-cover object-top md:hidden opacity-50 md:opacity-100"
          priority
        />
        <Image
          src={bgImage}
          alt={banner?.title || 'Hero Banner'}
          fill
          className="object-cover hidden md:block object-[center_30%]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/95 via-zinc-900/30 to-transparent md:hidden" />
        
        {/* Brand Seal Desktop */}
        <div className="hidden md:flex absolute top-12 left-12 w-28 h-28 text-white opacity-70 mix-blend-overlay">
          <img src="/brand-seal.svg" alt="Authentic" className="w-full h-full animate-spin-slow" />
        </div>
      </div>

      {/* Text Content */}
      <div className="relative z-10 w-full h-full md:w-1/2 flex flex-col items-start justify-end md:justify-center px-6 pb-16 md:px-16 md:pb-0 md:bg-white text-white md:text-zinc-900">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex items-center gap-3 mb-5 relative"
        >
          <div className="md:hidden absolute -top-24 right-0 w-20 h-20 opacity-90">
            <img src="/brand-seal.svg" alt="Authentic" className="w-full h-full animate-spin-slow" />
          </div>
          <div className="h-px w-10" style={{ backgroundColor: seasonColor }} />
          <span className="text-xs md:text-sm font-black tracking-[0.25em] uppercase" style={{ color: seasonColor }}>
            {banner?.subtitle || 'NEW COLLECTION'}
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-[3.5rem] md:text-[5.5rem] font-black tracking-tighter uppercase leading-[0.88] mb-6">
            {banner?.title || 'STYLE'}
            <br />
            <RotatingText />
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full sm:w-auto flex flex-col sm:flex-row gap-3"
        >
          <Link 
            href={banner?.buttonLink || "/#categories"} 
            className="group relative inline-flex items-center justify-center overflow-hidden bg-white md:bg-zinc-900 text-zinc-900 md:text-white px-8 py-4 text-xs font-black tracking-[0.15em] uppercase transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_8px_30px_rgba(0,0,0,0.15)]"
          >
            <span className="relative z-10 flex items-center gap-3">
              {banner?.buttonText || 'DISCOVER'} 
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
            </span>
            <div className="absolute inset-0 bg-[#C9A96E] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0" />
          </Link>
          <Link 
            href="/#new-arrivals"
            className="inline-flex items-center justify-center gap-2 text-white/70 md:text-zinc-400 text-[10px] font-black tracking-widest uppercase hover:text-white md:hover:text-zinc-900 transition-colors py-4"
          >
            <Sparkles className="w-3 h-3" />
            NEW ARRIVALS
          </Link>
        </motion.div>
      </div>

      {/* Sale Badge */}
      <motion.div 
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.5 }}
        className="absolute top-5 right-5 md:top-10 md:right-1/2 md:translate-x-1/2 w-[72px] h-[72px] md:w-28 md:h-28 rounded-full flex flex-col items-center justify-center shadow-2xl z-20 border-[3px] md:border-4 border-black/10"
        style={{ background: 'linear-gradient(135deg, #C9A96E 0%, #a07840 100%)' }}
      >
        <span className="text-[8px] md:text-[10px] font-black tracking-[0.12em] uppercase leading-none text-black/60">SALE</span>
        <span className="text-[1.6rem] md:text-5xl font-black leading-none text-black">50<span className="text-sm md:text-2xl">%</span></span>
      </motion.div>
    </section>
  );
}
