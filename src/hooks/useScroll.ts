// src/hooks/useScroll.ts

import { useState, useEffect, useRef } from 'react';

export function useScroll(threshold = 10) {
  const [scrollY, setScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const prevScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      setScrollY(current);
      setIsScrolled(current > threshold);
      setScrollDirection(
        current > prevScrollY.current ? 'down' : 'up'
      );
      prevScrollY.current = current;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return { scrollY, scrollDirection, isScrolled };
}
