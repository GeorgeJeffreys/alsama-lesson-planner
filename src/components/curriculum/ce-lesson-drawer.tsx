'use client';

import { useRouter } from 'next/navigation';
import { C, SANS } from '@/lib/tokens';
import { Icon } from '@/components/icon';
import { SKILL_COLOR, skillKey } from './ce-shell';
import type { CurriculumLesson } from '@/types/curriculum';


interface CeLessonDrawerProps {
  lesson: CurriculumLesson | null;
  onClose: () => void;
}

export function CeLessonDrawer({ lesson, onClose }: CeLessonDrawerProps) {
  const router = useRouter();

  if (!lesson) return null;

  const sk = skillKey(lesson.linguisticSkill);
  const col = SKILL_COLOR[sk];

  const FIELD: React.CSSProperties = {
    fontFamily: SANS, fontSize: 10, fontWeight: 700,
    color: C.faint2, textTransform: 'uppercase', letterSpacing: '0.08em',
    marginBottom: 4,
  };

  const rows: { label: string; value: string | null }[] = [
    { label: 'Linguistic Skill', value: lesson.linguisticSkill },
    { label: 'Skill LO',         value: lesson.skillLO },
    { label: 'Knowledge LO',     value: lesson.knowledgeLO },
    { label: 'Daily LO',         value: lesson.dailyLO },
    { label: 'Grammar / Vocab',  value: lesson.grammarFocus || lesson.vocabFocus || null },
    { label: 'Theme',            value: lesson.theme || null },
    { label: 'Resources',        value: lesson.resources || null },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 40,
          background: 'rgba(0,0,0,0.15)',
        }}
      />

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 440, zIndex: 50,
        background: C.surface,
        borderLeft: `1px solid ${C.border}`,
        boxShadow: '-4px 0 24px rgba(0,0,0,0.08)',
        display: 'flex', flexDirection: 'column',
        overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: `1px solid ${C.border}`,
          borderLeft: `4px solid ${col.fg}`,
          display: 'flex', alignItems: 'flex-start', gap: 12,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{
                fontFamily: SANS, fontSize: 11, fontWeight: 700,
                color: col.fg, background: col.bg,
                padding: '2px 7px', borderRadius: 5,
              }}>
                {lesson.id}
              </span>
              <span style={{
                fontFamily: SANS, fontSize: 11, fontWeight: 600,
                color: C.faint2,
              }}>
                {lesson.year} · Week {lesson.week} · {lesson.period}
              </span>
            </div>
            <div style={{
              fontFamily: SANS, fontSize: 15, fontWeight: 600, color: C.ink,
              lineHeight: 1.4,
            }}>
              {lesson.dailyLO}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28, borderRadius: 6,
              background: C.cream, border: `1px solid ${C.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0,
            }}
          >
            <Icon name="x" size={13} color={C.faint} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {rows.filter(r => r.value).map(r => (
            <div key={r.label}>
              <div style={FIELD}>{r.label}</div>
              <div style={{ fontFamily: SANS, fontSize: 13, color: C.ink, lineHeight: 1.5 }}>
                {r.value}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{
          padding: '16px 20px',
          borderTop: `1px solid ${C.border}`,
        }}>
          <button
            onClick={() => router.push(`/plan/new?lessonId=${encodeURIComponent(lesson.id)}`)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              width: '100%', height: 40,
              fontFamily: SANS, fontSize: 13, fontWeight: 600,
              color: '#fff', background: C.pink,
              border: 'none', borderRadius: 8, cursor: 'pointer',
              boxShadow: '0 1px 0 rgba(0,0,0,0.04), inset 0 -1px 0 rgba(0,0,0,0.08)',
            }}
          >
            <Icon name="plus" size={14} color="#fff" />
            Plan this lesson
          </button>
        </div>
      </div>
    </>
  );
}
