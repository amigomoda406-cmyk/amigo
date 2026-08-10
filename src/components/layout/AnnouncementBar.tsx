'use client';

import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const messages = [
  { text: '🚚 Livraison gratuite dès 3 000 DA — 58 wilayas', highlight: '3 000 DA' },
  { text: '⚡ Traitement des commandes en 24h', highlight: '24h' },
  { text: '✅ Retours gratuits sous 7 jours — sans conditions', highlight: '7 jours' },
  { text: '🔥 Nouveautés : découvrez la collection Été 2025', highlight: 'Été 2025' },
];

export default function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false);
  const [msgIdx, setMsgIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ h: 23, m: 59, s: 59 });
  const [isClient, setIsClient] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setIsClient(true);

    const msgInterval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setMsgIdx(i => (i + 1) % messages.length);
        setVisible(true);
      }, 300);
    }, 4500);
    
    const timerInterval = setInterval(() => {
      const now = new Date();
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      const diff = endOfDay.getTime() - now.getTime();
      if (diff > 0) {
        setTimeLeft({
          h: Math.floor((diff / (1000 * 60 * 60)) % 24),
          m: Math.floor((diff / 1000 / 60) % 60),
          s: Math.floor((diff / 1000) % 60),
        });
      }
    }, 1000);

    return () => { clearInterval(msgInterval); clearInterval(timerInterval); };
  }, []);

  const prev = () => setMsgIdx(i => (i - 1 + messages.length) % messages.length);
  const next = () => setMsgIdx(i => (i + 1) % messages.length);

  if (dismissed) return null;

  return (
    <div
      className="relative overflow-hidden flex items-center justify-center gap-3 py-2 px-10 min-h-[38px] text-white"
      style={{ background: 'linear-gradient(90deg, #111 0%, #1a1a1a 50%, #111 100%)' }}
    >
      {/* Golden accent line top */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#C9A96E] to-transparent opacity-70" />

      {/* Prev button */}
      <button onClick={prev} className="absolute left-7 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/80 transition-colors hidden md:flex">
        <ChevronLeft className="w-3 h-3" />
      </button>

      {/* Message */}
      <p
        className={`text-[10px] md:text-[11px] font-bold tracking-wide text-center transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
      >
        {messages[msgIdx].text}
      </p>

      {/* Countdown */}
      {isClient && (
        <div className="hidden md:flex items-center gap-1.5 bg-white/8 px-2.5 py-1 rounded-full border border-white/10">
          <span className="text-[8px] uppercase tracking-widest font-black text-white/50">Offre expire:</span>
          <span className="text-[10px] font-black tracking-widest text-[#C9A96E] font-mono">
            {String(timeLeft.h).padStart(2, '0')}:{String(timeLeft.m).padStart(2, '0')}:{String(timeLeft.s).padStart(2, '0')}
          </span>
        </div>
      )}

      {/* Dots indicator */}
      <div className="flex items-center gap-1 md:hidden absolute bottom-1 left-1/2 -translate-x-1/2">
        {messages.map((_, i) => (
          <button key={i} onClick={() => setMsgIdx(i)} className={`w-1 h-1 rounded-full transition-all ${i === msgIdx ? 'bg-[#C9A96E] w-2' : 'bg-white/30'}`} />
        ))}
      </div>

      {/* Next button */}
      <button onClick={next} className="absolute right-7 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/80 transition-colors hidden md:flex">
        <ChevronRight className="w-3 h-3" />
      </button>

      {/* Close */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors p-1"
        aria-label="Fermer"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}
