'use client';

import { useState } from 'react';
import { C, SANS, SCRIPT } from '@/lib/tokens';
import { Icon } from '@/components/icon';
import type { CurriculumLesson } from '@/types/curriculum';

interface MobileTopBarProps {
  lesson: CurriculumLesson | null;
  onOpenSelector: () => void;
  onExport: () => void;
  exporting?: boolean;
}

function AlsamaMark() {
  return (
    <div style={{
      fontFamily: SCRIPT, fontSize: 26, color: C.pink,
      lineHeight: 1, letterSpacing: '-0.01em',
      display: 'inline-flex', alignItems: 'baseline', gap: 1,
      flexShrink: 0,
    }}>
      Alsama
      <svg width={13} height={11} viewBox="0 0 20 16" fill="none" style={{ marginLeft: 1, marginBottom: 1 }}>
        <path d="M2 8 C2 4, 6 2, 8 6 C10 2, 14 4, 14 8 C14 11, 10 12, 8 9 C6 12, 2 11, 2 8 Z" fill={C.pink} opacity="0.85" />
        <circle cx="16" cy="6" r="0.9" fill={C.pink} />
        <circle cx="17.5" cy="9" r="0.7" fill={C.pink} />
        <circle cx="18.5" cy="11.5" r="0.5" fill={C.pink} />
      </svg>
    </div>
  );
}

export function MobileTopBar({ lesson, onOpenSelector, onExport, exporting }: MobileTopBarProps) {
  const [overflowOpen, setOverflowOpen] = useState(false);

  const lessonLabel = lesson
    ? (lesson.id + (lesson.dailyLO.length > 20 ? ' · ' + lesson.dailyLO.slice(0, 20) + '…' : ' · ' + lesson.dailyLO))
    : 'Select lesson';

  return (
    <>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        height: 52, padding: '0 14px',
        background: C.surface,
        borderBottom: `1px solid ${C.border}`,
        flexShrink: 0,
        position: 'relative',
      }}>
        <AlsamaMark />

        {/* Centred lesson pill */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={onOpenSelector}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              height: 34, padding: '0 10px',
              background: C.cream, border: `1px solid ${C.borderSoft}`,
              borderRadius: 8, fontFamily: SANS, fontSize: 11.5, fontWeight: 600,
              color: C.ink, cursor: 'pointer', maxWidth: 200,
              overflow: 'hidden', whiteSpace: 'nowrap',
            }}
          >
            <Icon name="calendar" size={13} color={C.pink} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{lessonLabel}</span>
            <Icon name="chevronDown" size={12} color={C.faint} />
          </button>
        </div>

        {/* Overflow menu button */}
        <button
          onClick={() => setOverflowOpen((v) => !v)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 36, height: 36, borderRadius: 8,
            background: overflowOpen ? C.cream : 'transparent',
            border: overflowOpen ? `1px solid ${C.border}` : '1px solid transparent',
            flexShrink: 0, cursor: 'pointer',
          }}
        >
          <Icon name="moreH" size={18} color={C.ink} />
        </button>
      </div>

      {/* Overflow dropdown */}
      {overflowOpen && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 100 }}
            onClick={() => setOverflowOpen(false)}
          />
          <div style={{
            position: 'fixed', top: 52, right: 10, zIndex: 101,
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 12, boxShadow: '0 8px 24px rgba(56,30,30,0.14)',
            padding: '6px 0', minWidth: 200,
          }}>
            {[
              { label: 'Export PDF', icon: 'download' as const, action: () => { onExport(); setOverflowOpen(false); } },
              { label: 'Send for approval', icon: 'send' as const, action: () => setOverflowOpen(false) },
              { label: 'Copy share link', icon: 'share' as const, action: () => { navigator.clipboard.writeText(window.location.href + '/view'); setOverflowOpen(false); } },
            ].map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '11px 14px',
                  background: 'transparent', border: 'none',
                  fontFamily: SANS, fontSize: 14, color: C.ink, cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <Icon name={item.icon} size={16} color={C.faint} />
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
}
