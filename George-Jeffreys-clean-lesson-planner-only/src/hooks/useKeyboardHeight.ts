'use client';

import { useState, useEffect } from 'react';

export function useKeyboardHeight(): number {
  const [kbHeight, setKbHeight] = useState(0);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    function measure() {
      const offset = window.innerHeight - (vv!.height + vv!.offsetTop);
      setKbHeight(Math.max(0, Math.round(offset)));
    }

    vv.addEventListener('resize', measure);
    vv.addEventListener('scroll', measure);
    return () => {
      vv.removeEventListener('resize', measure);
      vv.removeEventListener('scroll', measure);
    };
  }, []);

  return kbHeight;
}
