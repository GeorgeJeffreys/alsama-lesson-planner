'use client';

import Link from 'next/link';
import { C, SANS, SCRIPT } from '@/lib/tokens';
import { Icon } from '@/components/icon';
import type { CurriculumLesson } from '@/types/curriculum';

interface TopBarProps {
  lesson: CurriculumLesson | null;
  saveStatus: 'saved' | 'saving' | 'idle';
  onOpenSelector: () => void;
  onExport: () => void;
  exporting?: boolean;
}

function AlsamaMark() {
  return (
    <div style={{
      fontFamily: SCRIPT, fontSize: 30, color: C.pink,
      lineHeight: 1, letterSpacing: '-0.01em',
      display: 'inline-flex', alignItems: 'baseline', gap: 2,
    }}>
      Alsama
      <svg width={15} height={12} viewBox="0 0 20 16" fill="none" style={{ marginLeft: 2, marginBottom: 2 }}>
        <path d="M2 8 C2 4, 6 2, 8 6 C10 2, 14 4, 14 8 C14 11, 10 12, 8 9 C6 12, 2 11, 2 8 Z" fill={C.pink} opacity="0.85"/>
        <circle cx="16" cy="6" r="0.9" fill={C.pink}/>
        <circle cx="17.5" cy="9" r="0.7" fill={C.pink}/>
        <circle cx="18.5" cy="11.5" r="0.5" fill={C.pink}/>
      </svg>
    </div>
  );
}

export function TopBar({ lesson, saveStatus, onOpenSelector, onExport, exporting }: TopBarProps) {
  const saveIndicator = saveStatus === 'saving'
    ? { bg: C.amberSoft, border: '#EFD9A5', color: '#7A5A11', icon: 'refresh' as const, label: 'Saving…' }
    : { bg: C.tealSoft, border: '#BCDED6', color: C.teal, icon: 'cloudCheck' as const, label: 'Autosaved · just now' };

  const lessonTitle = lesson
    ? (lesson.dailyLO.length > 40 ? lesson.dailyLO.slice(0, 40) + '…' : lesson.dailyLO)
    : 'Select a lesson';
  const lessonSub = lesson
    ? `${lesson.year} · Week ${lesson.week} · ${lesson.period} · ${lesson.id}`
    : 'Click to browse the curriculum';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16,
      height: 60, padding: '0 24px',
      background: C.surface,
      borderBottom: `1px solid ${C.border}`,
      flexShrink: 0,
    }}>
      <AlsamaMark />
      <div style={{ width: 1, height: 24, background: C.border, margin: '0 4px' }} />
      <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 500, color: C.faint }}>Lesson Planner</span>
      <Link href="/curriculum" style={{
        fontFamily: SANS, fontSize: 12, fontWeight: 500,
        color: C.faint, textDecoration: 'none',
        padding: '3px 8px', borderRadius: 6,
        border: `1px solid transparent`,
        transition: 'color 0.12s',
      }}
        onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = C.pink; (e.currentTarget as HTMLAnchorElement).style.borderColor = C.pinkBorder; }}
        onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = C.faint; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'transparent'; }}
      >
        Curriculum
      </Link>

      <div style={{ width: 16 }} />

      {/* Lesson selector pill */}
      <button
        onClick={onOpenSelector}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          height: 38, padding: '0 14px',
          background: C.cream, border: `1px solid ${C.borderSoft}`,
          borderRadius: 10, fontFamily: SANS, minWidth: 320,
          cursor: 'pointer',
        }}
      >
        <Icon name="calendar" size={15} color={C.pink} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.15 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{lessonTitle}</span>
          <span style={{ fontSize: 11, color: C.faint }}>{lessonSub}</span>
        </div>
        <div style={{ flex: 1 }} />
        <Icon name="chevronDown" size={15} color={C.faint} />
      </button>

      <div style={{ flex: 1 }} />

      {/* Autosave indicator */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '6px 10px', borderRadius: 999,
        background: saveIndicator.bg,
        border: `1px solid ${saveIndicator.border}`,
      }}>
        <Icon name={saveIndicator.icon} size={13} color={saveIndicator.color} />
        <span style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 500, color: saveIndicator.color }}>
          {saveIndicator.label}
        </span>
      </div>

      <button
        onClick={onExport}
        disabled={exporting}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          height: 34, padding: '0 14px',
          fontFamily: SANS, fontSize: 13, fontWeight: 500,
          background: 'transparent', color: exporting ? C.faint2 : C.ink,
          border: `1px solid ${C.border}`, borderRadius: 8,
          cursor: exporting ? 'default' : 'pointer',
          transition: 'color 0.15s',
        }}
      >
        <Icon name="download" size={14} color={exporting ? C.faint2 : C.ink} />
        {exporting ? 'Generating…' : 'Export PDF'}
      </button>

      <button style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        height: 34, padding: '0 14px',
        fontFamily: SANS, fontSize: 13, fontWeight: 500,
        background: C.pink, color: '#fff',
        border: 'none', borderRadius: 8,
        boxShadow: '0 1px 0 rgba(0,0,0,0.04), inset 0 -1px 0 rgba(0,0,0,0.08)',
      }}>
        <Icon name="send" size={13} color="#fff" />Send for approval
      </button>

      {/* Teacher avatar */}
      <div style={{
        width: 34, height: 34, borderRadius: 999,
        background: `linear-gradient(135deg, ${C.pink}, ${C.amber})`,
        color: '#fff', fontFamily: SANS, fontSize: 12, fontWeight: 600,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `2px solid ${C.surface}`,
        boxShadow: `0 0 0 1px ${C.border}`,
        flexShrink: 0,
      }}>NT</div>
    </div>
  );
}
