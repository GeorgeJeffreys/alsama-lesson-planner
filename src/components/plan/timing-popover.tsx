'use client';

import { useRef, useEffect } from 'react';
import { C, SANS } from '@/lib/tokens';
import { Icon } from '@/components/icon';
import type { LessonSection } from '@/types/lesson';

interface TimingPopoverProps {
  sections: LessonSection[];
  onUpdate: (index: number, minutes: number) => void;
  onClose: () => void;
  anchorRect: DOMRect | null;
}

export function TimingPopover({ sections, onUpdate, onClose, anchorRect }: TimingPopoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const total = sections.reduce((sum, s) => sum + (s.timing_minutes ?? 0), 0);
  const overLimit = total > 50;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  const POPOVER_W = 320;
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  const rawTop = anchorRect ? anchorRect.bottom + 8 : 200;
  const rawLeft = anchorRect ? anchorRect.left - 180 : 100;
  const left = Math.min(Math.max(8, rawLeft), vw - POPOVER_W - 8);
  const maxH = vh - rawTop - 16;
  const top = maxH < 200 && anchorRect
    ? Math.max(8, anchorRect.top - Math.min(480, vh - 32) - 8)
    : rawTop;

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed', top, left, zIndex: 200,
        width: POPOVER_W, background: C.surface,
        border: `1px solid ${C.border}`, borderRadius: 12,
        boxShadow: '0 8px 24px rgba(56,30,30,0.12), 0 2px 6px rgba(56,30,30,0.06)',
        padding: '14px 16px',
        maxHeight: vh - top - 16, overflowY: 'auto',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <Icon name="clock" size={14} color={C.pink} />
        <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: C.ink, flex: 1 }}>
          Adjust timing
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: C.faint, fontSize: 18, lineHeight: 1, padding: 0,
          }}
        >×</button>
      </div>

      {/* Sliders */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {sections.map((s, i) => (
          <div key={i}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 500, color: C.ink, flex: 1 }}>
                {s.title}
              </span>
              <span style={{
                fontFamily: SANS, fontSize: 11, fontWeight: 600,
                color: s.timing_minutes === 0 ? C.faint : C.pink, minWidth: 72, textAlign: 'right',
              }}>
                {s.timing_minutes === 0 ? 'Take-home' : `${s.timing_minutes} min`}
              </span>
            </div>
            <input
              type="range" min={0} max={45} step={1}
              value={s.timing_minutes}
              onChange={(e) => onUpdate(i, Number(e.target.value))}
              style={{ width: '100%', accentColor: C.pink, cursor: 'pointer' }}
            />
          </div>
        ))}
      </div>

      {/* Total */}
      <div style={{
        marginTop: 14, padding: '8px 10px',
        background: overLimit ? '#FFF3CD' : C.tealSoft,
        border: `1px solid ${overLimit ? '#FFD980' : '#BCDED6'}`,
        borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <Icon name="clock" size={13} color={overLimit ? '#856404' : C.teal} />
        <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, color: overLimit ? '#856404' : C.teal }}>
          Total: {total} min
          {overLimit && ' — exceeds 50 min'}
        </span>
      </div>
    </div>
  );
}
