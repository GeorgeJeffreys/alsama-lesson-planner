'use client';

import { useState } from 'react';
import { C, SANS } from '@/lib/tokens';
import { Icon } from '@/components/icon';
import { BottomSheet } from './BottomSheet';
import { LIBRARY_CARDS } from '@/components/plan/library-panel';
import type { LibraryCard } from '@/components/plan/library-panel';
import { SECTION_CONFIG } from '@/lib/tokens';

interface MobileLibraryProps {
  onInsert: (card: LibraryCard, sectionIndex: number) => void;
}

function SectionPicker({ card, onPick, onClose }: {
  card: LibraryCard;
  onPick: (i: number) => void;
  onClose: () => void;
}) {
  return (
    <BottomSheet open onClose={onClose} height="60vh">
      <div style={{ padding: '4px 16px 14px', borderBottom: `1px solid ${C.border}` }}>
        <span style={{ fontFamily: SANS, fontSize: 15, fontWeight: 700, color: C.ink }}>
          Insert "{card.type}" into…
        </span>
      </div>
      {SECTION_CONFIG.map((cfg, i) => (
        <button
          key={i}
          onClick={() => { onPick(i); onClose(); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            width: '100%', padding: '14px 16px',
            background: 'transparent', border: 'none',
            borderBottom: `1px solid ${C.border}`,
            fontFamily: SANS, fontSize: 14, color: C.ink, cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: C.cream, border: `1px solid ${C.borderSoft}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: SANS, fontSize: 11, fontWeight: 600, color: C.faint, flexShrink: 0,
          }}>
            {String(i + 1).padStart(2, '0')}
          </div>
          <span>{cfg.title}</span>
          <div style={{ flex: 1 }} />
          <Icon name="arrowRight" size={16} color={C.faint2} />
        </button>
      ))}
    </BottomSheet>
  );
}

export function MobileLibrary({ onInsert }: MobileLibraryProps) {
  const [query, setQuery] = useState('');
  const [pickerCard, setPickerCard] = useState<LibraryCard | null>(null);

  const filtered = query.trim()
    ? LIBRARY_CARDS.filter((c) =>
        c.type.toLowerCase().includes(query.toLowerCase()) ||
        c.skill.toLowerCase().includes(query.toLowerCase())
      )
    : LIBRARY_CARDS;

  return (
    <>
      <div style={{ padding: '14px 14px 8px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          height: 40, padding: '0 12px',
          background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8,
        }}>
          <Icon name="search" size={15} color={C.faint2} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cards…"
            style={{ flex: 1, border: 'none', outline: 'none', fontFamily: SANS, fontSize: 14, color: C.ink, background: 'transparent' }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
              <Icon name="x" size={14} color={C.faint2} />
            </button>
          )}
        </div>
      </div>

      <div style={{ padding: '0 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map((card) => (
          <div
            key={card.id}
            style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 12, padding: '12px 12px',
              display: 'flex', alignItems: 'center', gap: 10,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 2 }}>
                {card.type}
              </div>
              <div style={{ fontFamily: SANS, fontSize: 11, color: C.faint }}>
                {card.skill} · {card.level} · {card.minutes} min
              </div>
            </div>
            <button
              onClick={() => setPickerCard(card)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                height: 34, padding: '0 12px',
                fontFamily: SANS, fontSize: 12, fontWeight: 600,
                background: C.pink, color: '#fff',
                border: 'none', borderRadius: 8, cursor: 'pointer', flexShrink: 0,
              }}
            >
              <Icon name="plus" size={13} color="#fff" />Insert
            </button>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 32 }}>
            <span style={{ fontFamily: SANS, fontSize: 13, color: C.faint2 }}>No cards found</span>
          </div>
        )}
      </div>

      {pickerCard && (
        <SectionPicker
          card={pickerCard}
          onPick={(i) => onInsert(pickerCard, i)}
          onClose={() => setPickerCard(null)}
        />
      )}
    </>
  );
}
