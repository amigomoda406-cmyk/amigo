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

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIdx(i => (i + 1) % messages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  if (dismissed) return null;

  return (
    <div className="bg-zinc-900 text-white relative overflow-hidden">
      <div className="flex items-center justify-center py-2 px-8">
        <p
          key={msgIdx}
          className="text-[10px] md:text-xs font-bold tracking-wide text-center animate-fadeIn"
        >
          {messages[msgIdx]}
        </p>
      </div>
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
