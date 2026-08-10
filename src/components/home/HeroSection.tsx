'use client';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import RotatingText from '@/components/ui/RotatingText';

export default function HeroSection({ homeData }: { homeData?: any }) {
  const banner = homeData?.heroBanners?.[0];
  const seasonColor = banner?.seasonColor || '#C9A96E';

  return (
    <section
      className="relative w-full h-[190px] md:h-[70vh] md:min-h-[600px] bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{ backgroundImage: "url('/hero-custom.jpeg')" }}
    >
      {/* Dark overlay on desktop only to help text readability on left */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent hidden md:block" />

      {/* Sale Badge */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.5 }}
        className="absolute top-3 right-3 md:top-10 md:right-10 w-[46px] h-[46px] md:w-28 md:h-28 rounded-full flex flex-col items-center justify-center shadow-2xl z-20 border-2 border-white/30"
        style={{ background: 'linear-gradient(135deg, #C9A96E 0%, #a07840 100%)' }}
      >
        <span className="text-[5px] md:text-[10px] font-bold tracking-widest uppercase leading-none text-black/70">SALE</span>
        <span className="text-[14px] md:text-5xl font-black leading-none text-black">50<span className="text-[8px] md:text-2xl">%</span></span>
        <span className="text-[4px] md:text-[8px] font-bold text-black/70 hidden md:block">OFF</span>
      </motion.div>

      {/* Left Content */}
      <div className="w-[70%] md:w-[45%] pl-4 pt-6 pb-8 md:pl-16 md:pt-0 flex flex-col items-start justify-center h-full z-10 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center gap-2 mb-2"
        >
          <div className="h-px w-6 md:w-10" style={{ backgroundColor: seasonColor }} />
          <span className="text-[5px] md:text-sm font-bold tracking-widest uppercase" style={{ color: seasonColor }}>
            {banner?.subtitle || 'NEW COLLECTION'}
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-[32px] md:text-[5.5rem] font-black tracking-tighter uppercase leading-[0.85] md:leading-[0.88] text-zinc-900 md:text-white mb-3 md:mb-6"
        >
          {banner?.title || 'STYLE'}
          <br />
          <RotatingText />
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-2 md:gap-3"
        >
          <Link
            href={banner?.buttonLink || '/#categories'}
            className="group relative inline-flex items-center justify-center overflow-hidden bg-zinc-900 text-white px-4 py-2 md:px-8 md:py-4 text-[6px] md:text-xs font-bold md:font-black tracking-widest uppercase transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="relative z-10 flex items-center gap-1.5 md:gap-3">
              {banner?.buttonText || 'SHOP NOW'}
              <ArrowRight className="w-2 h-2 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </span>
            <div className="absolute inset-0 bg-[#C9A96E] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0" />
          </Link>

          <Link
            href="/#new-arrivals"
            className="hidden md:inline-flex items-center justify-center gap-2 text-white/80 text-[10px] font-black tracking-widest uppercase hover:text-white transition-colors py-4"
          >
            <Sparkles className="w-3 h-3" />
            NEW ARRIVALS
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
