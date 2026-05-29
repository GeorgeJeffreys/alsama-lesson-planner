'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { C, SANS } from '@/lib/tokens';
import { Icon } from '@/components/icon';
import { Chip, Label, HiBtn, SKILL_COLOR, skillKey } from './ce-shell';
import type { CurriculumLesson } from '@/types/curriculum';

interface LessonCardProps {
  lesson: CurriculumLesson;
  /** If set, renders a large period number label on the left side */
  periodLabel?: number;
}

export function LessonCard({ lesson, periodLabel }: LessonCardProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const col = SKILL_COLOR[skillKey(lesson.linguisticSkill)] ?? SKILL_COLOR.basic;
  const hasExtra = !!(lesson.grammarFocus || lesson.vocabFocus);
  const planUrl = `/plan/new?lessonId=${encodeURIComponent(lesson.id)}`;

  let loText = lesson.dailyLO;
  if (!loText) {
    console.warn(`[LessonCard] dailyLO missing for lesson ${lesson.id}`);
    loText = lesson.id;
  }

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E5DDD3',
        borderRadius: 12,
        position: 'relative',
        overflow: 'hidden',
        minHeight: 120,
        display: 'flex',
        flexDirection: 'column',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = C.pinkBorder;
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 0 2px ${C.pinkSoft},0 4px 12px rgba(56,30,30,0.06)`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = '#E5DDD3';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', flex: 1 }}>
        {periodLabel != null && (
          <div style={{
            width: 56, flexShrink: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '10px 0 0',
            borderRight: '1px solid #E5DDD3',
          }}>
            <span style={{ fontFamily: SANS, fontSize: 9.5, fontWeight: 700, color: C.faint2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>P</span>
            <span style={{ fontFamily: SANS, fontSize: 36, fontWeight: 800, color: C.ink, lineHeight: 1 }}>{periodLabel}</span>
          </div>
        )}
        <div style={{ flex: 1, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 5 }}>
          {/* Top row: lesson ID left, week·period badge right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 600, color: C.faint2, letterSpacing: '0.02em' }}>
              {lesson.id}
            </span>
            <div style={{ flex: 1 }} />
            {(lesson.week != null || lesson.periodNum != null) && (
              <Chip tone="neutral" size="sm">
                {[lesson.week != null ? `Wk ${lesson.week}` : null, lesson.periodNum != null ? `P${lesson.periodNum}` : null].filter(Boolean).join(' · ')}
              </Chip>
            )}
          </div>
          {/* Daily LO — 2-line clamp, always 2 lines visible */}
          <span style={{
            fontFamily: SANS, fontSize: 13, fontWeight: 500, color: C.ink, lineHeight: 1.4,
            overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            minHeight: '2.8em',
          } as React.CSSProperties}>{loText}</span>
          {/* Skill + theme chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap', marginTop: 2 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '2px 8px', background: col.bg, color: col.fg,
              border: `1px solid ${col.bg}`, borderRadius: 999,
              fontFamily: SANS, fontSize: 10, fontWeight: 600,
            }}>{col.label}</span>
            {lesson.theme && <Chip tone="amber" size="sm">{lesson.theme}</Chip>}
            <div style={{ flex: 1 }} />
            {hasExtra && (
              <div
                onClick={e => { e.stopPropagation(); setExpanded(x => !x); }}
                style={{
                  cursor: 'pointer',
                  transform: expanded ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s',
                }}
              >
                <Icon name="chevronDown" size={13} color={C.faint2} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expanded: grammar / vocab focus */}
      {expanded && hasExtra && (
        <div style={{
          borderTop: '1px solid #E5DDD3',
          padding: '10px 14px 12px',
          background: '#FDFAF7',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          {lesson.grammarFocus && (
            <div>
              <Label style={{ display: 'block', marginBottom: 3 }}>Grammar</Label>
              <span style={{ fontFamily: SANS, fontSize: 12, color: C.ink, lineHeight: 1.4 }}>{lesson.grammarFocus}</span>
            </div>
          )}
          {lesson.vocabFocus && (
            <div>
              <Label style={{ display: 'block', marginBottom: 3 }}>Vocab</Label>
              <span style={{ fontFamily: SANS, fontSize: 12, color: C.ink, lineHeight: 1.4 }}>{lesson.vocabFocus}</span>
            </div>
          )}
        </div>
      )}

      {/* Open lesson footer */}
      <div style={{
        padding: '8px 14px 12px',
        borderTop: '1px solid #E5DDD3',
        display: 'flex', justifyContent: 'flex-end',
      }}>
        <HiBtn
          variant="primary" size="sm"
          icon={<Icon name="arrowRight" size={12} color="#fff" />}
          onClick={() => router.push(planUrl)}
        >
          Open lesson →
        </HiBtn>
      </div>

      {/* 4px skill colour bar at very bottom */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 4, background: col.line }} />
    </div>
  );
}
