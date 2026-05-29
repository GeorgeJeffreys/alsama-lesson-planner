'use client';

import { useEffect, useRef } from 'react';
import { C } from '@/lib/tokens';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** CSS height value, default '85vh' */
  height?: string;
}

export function BottomSheet({ open, onClose, children, height = '85vh' }: BottomSheetProps) {
  const kbHeight = useKeyboardHeight();
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number | null>(null);
  const dragCurrentY = useRef<number>(0);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  function handleTouchStart(e: React.TouchEvent) {
    dragStartY.current = e.touches[0].clientY;
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (dragStartY.current === null || !sheetRef.current) return;
    const dy = e.touches[0].clientY - dragStartY.current;
    dragCurrentY.current = dy;
    if (dy > 0) {
      sheetRef.current.style.transform = `translateY(calc(${dy}px - ${kbHeight}px))`;
      sheetRef.current.style.transition = 'none';
    }
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (dragStartY.current === null || !sheetRef.current) return;
    const dy = e.changedTouches[0].clientY - dragStartY.current;
    sheetRef.current.style.transition = '';
    if (dy > 100) {
      onClose();
    } else {
      sheetRef.current.style.transform = `translateY(-${kbHeight}px)`;
    }
    dragStartY.current = null;
    dragCurrentY.current = 0;
  }

  const openTransform = kbHeight > 0 ? `translateY(-${kbHeight}px)` : 'translateY(0)';

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(26,26,26,0.45)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.25s ease',
        }}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        style={{
          position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 201,
          height,
          background: C.surface,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          boxShadow: '0 -8px 40px rgba(56,30,30,0.2)',
          display: 'flex',
          flexDirection: 'column',
          transform: open ? openTransform : 'translateY(100%)',
          transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
          overflow: 'hidden',
        }}
      >
        {/* Drag handle */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ padding: '14px 0 8px', display: 'flex', justifyContent: 'center', flexShrink: 0 }}
        >
          <div style={{ width: 36, height: 4, borderRadius: 2, background: C.borderSoft }} />
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 'max(env(safe-area-inset-bottom), 20px)' }}>
          {children}
        </div>
      </div>
    </>
  );
}
