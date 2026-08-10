'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const messages = [
  '🚚 توصيل مجاني لجميع الولايات الـ 58 عند الشراء فوق 3000 DA',
  '⚡ معالجة الطلبات خلال 24 ساعة',
  '✅ ضمان الإرجاع 7 أيام بدون شروط',
  '🔥 جديد: اكتشف أحدث صيحات الموضة الجزائرية',
];

export default function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false);
  const [msgIdx, setMsgIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ h: 23, m: 59, s: 59 });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Carousel interval
    const msgInterval = setInterval(() => {
      setMsgIdx(i => (i + 1) % messages.length);
    }, 4000);
    
    // Countdown interval (End of day)
    const timerInterval = setInterval(() => {
      const now = new Date();
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      const diff = endOfDay.getTime() - now.getTime();
      
      if (diff > 0) {
        setTimeLeft({
          h: Math.floor((diff / (1000 * 60 * 60)) % 24),
          m: Math.floor((diff / 1000 / 60) % 60),
          s: Math.floor((diff / 1000) % 60)
        });
      }
    }, 1000);

    return () => {
      clearInterval(msgInterval);
      clearInterval(timerInterval);
    };
  }, []);

  if (dismissed) return null;

  return (
    <div className="bg-zinc-900 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-center gap-1 md:gap-4 py-2 px-8 min-h-[40px]">
      <p
        key={msgIdx}
        className="text-[10px] md:text-xs font-bold tracking-wide text-center animate-fadeIn"
      >
        {messages[msgIdx]}
      </p>
      
      {isClient && (
        <div className="flex items-center gap-1.5 bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/5">
          <span className="text-[9px] uppercase tracking-widest font-black text-white/80">ينتهي العرض خلال:</span>
          <span className="text-[10px] font-black tracking-widest text-emerald-400 font-mono">
            {String(timeLeft.h).padStart(2, '0')}:{String(timeLeft.m).padStart(2, '0')}:{String(timeLeft.s).padStart(2, '0')}
          </span>
        </div>
      )}

      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-1"
        aria-label="إغلاق"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}
