'use client';

import { useState, useEffect } from 'react';

export type Breakpoint = 'phone' | 'tablet' | 'desktop';

export function useBreakpoint() {
  const [bp, setBp] = useState<Breakpoint>('desktop');

  useEffect(() => {
    function measure() {
      const w = window.innerWidth;
      setBp(w < 768 ? 'phone' : w < 1024 ? 'tablet' : 'desktop');
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  return { breakpoint: bp, isPhone: bp === 'phone', isTablet: bp === 'tablet', isDesktop: bp === 'desktop' };
}
