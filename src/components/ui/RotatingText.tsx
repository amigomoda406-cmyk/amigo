'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const words = ['الجديد', 'المميز', 'الأنيق', 'الفاخر', 'الأصيل'];

export default function RotatingText() {
  const [idx, setIdx] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const timer = setInterval(() => setIdx(i => (i + 1) % words.length), 2500);
    return () => clearInterval(timer);
  }, []);

  if (!isClient) return <span className="text-[#C9A96E]">{words[0]}</span>;

  return (
    <span className="relative inline-block overflow-hidden" style={{ minWidth: '120px' }}>
      <AnimatePresence mode="wait">
        <motion.span
          key={idx}
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -24, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="inline-block text-[#C9A96E]"
        >
          {words[idx]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
