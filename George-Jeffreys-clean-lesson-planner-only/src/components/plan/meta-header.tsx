'use client';

import { useState } from 'react';
import { C, SANS } from '@/lib/tokens';
import { Icon } from '@/components/icon';
import type { CurriculumLesson } from '@/types/curriculum';

interface MetaHeaderProps {
  lesson: CurriculumLesson | null;
}

const LABEL: React.CSSProperties = {
  fontFamily: SANS, fontSize: 10.5, fontWeight: 600,
  color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em',
};

const ACTION_VERB_RE = /\b(write|read|recognise|recognize|speak|listen|identify|describe|use|introduce|ask|answer)\b/gi;

function highlightVerbs(text: string): React.ReactNode {
  const result: React.ReactNode[] = [];
  const re = new RegExp(ACTION_VERB_RE.source, ACTION_VERB_RE.flags);
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) result.push(text.slice(last, m.index));
    result.push(
      <span key={m.index} style={{ background: C.pinkSoft, padding: '0 4px', borderRadius: 3, color: C.pink, fontWeight: 600 }}>
        {m[0]}
      </span>
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) result.push(text.slice(last));
  return result.length ? result : text;
}

function Chip({ children, tone }: { children: React.ReactNode; tone: 'pink' | 'neutral' | 'amber' }) {
  const s = {
    pink:    { background: C.pinkSoft,  color: C.pink,     border: `1px solid ${C.pinkBorder}` },
    neutral: { background: C.cream,     color: C.faint,    border: `1px solid ${C.borderSoft}` },
    amber:   { background: '#FBF1DD',   color: '#7A5A11',  border: '1px solid #EFD9A5' },
  }[tone];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', height: 20, padding: '0 7px',
      fontFamily: SANS, fontSize: 10.5, fontWeight: 500, borderRadius: 999,
      whiteSpace: 'nowrap', ...s,
    }}>
      {children}
    </span>
  );
}

export function MetaHeader({ lesson }: MetaHeaderProps) {
  const [expanded, setExpanded] = useState(false);

  if (!lesson) return null;

  return (
    <div style={{
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderLeft: `3px solid ${C.pink}`,
      borderRadius: 12,
      boxShadow: '0 1px 0 rgba(56,30,30,0.02)',
    }}>
      <div style={{ padding: '14px 18px' }}>

        {/* ── Top row ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            height: 20, padding: '0 7px', flexShrink: 0,
            fontFamily: SANS, fontSize: 10.5, fontWeight: 500,
            color: C.pink, background: C.pinkSoft,
            border: `1px solid ${C.pinkBorder}`, borderRadius: 999,
          }}>
            <Icon name="lock" size={10} color={C.pink} /> From curriculum
          </span>
          <span style={LABEL}>Lesson Overview</span>
          <div style={{ flex: 1 }} />
          <span style={{ fontFamily: SANS, fontSize: 11, color: C.faint }}>
            Auto-populated · edits happen at the curriculum level
          </span>
        </div>

        {/* ── Main metadata grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 220px', gap: 24 }}>

          {/* Left: ID + chips */}
          <div>
            <div style={{
              fontFamily: SANS, fontSize: 20, fontWeight: 700, color: C.ink,
              fontFeatureSettings: '"tnum"', letterSpacing: '0.01em',
              lineHeight: 1.1, marginBottom: 8,
            }}>
              {lesson.id}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <Chip tone="pink">{lesson.year}</Chip>
              {lesson.week !== null && <Chip tone="neutral">Week {lesson.week}</Chip>}
              <Chip tone="neutral">{lesson.period}</Chip>
            </div>
          </div>

          {/* Middle: Daily LO with verb highlighting */}
          <div>
            <div style={{ ...LABEL, marginBottom: 6 }}>Daily Learning Objective</div>
            <p style={{ fontFamily: SANS, fontSize: 14, fontWeight: 500, color: C.ink, lineHeight: 1.45, margin: 0 }}>
              {highlightVerbs(lesson.dailyLO)}
            </p>
          </div>

          {/* Right: Grammar, Theme, Linguistic Skill */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div>
              <div style={{ ...LABEL, marginBottom: 3 }}>Grammar / Vocab</div>
              <span style={{ fontFamily: SANS, fontSize: 13, color: C.ink }}>
                {lesson.grammarFocus || lesson.vocabFocus || '—'}
              </span>
            </div>
            <div>
              <div style={{ ...LABEL, marginBottom: 3 }}>Theme</div>
              {lesson.theme
                ? <Chip tone="amber">{lesson.theme}</Chip>
                : <span style={{ fontFamily: SANS, fontSize: 13, color: C.faint2 }}>—</span>
              }
            </div>
            <div>
              <div style={{ ...LABEL, marginBottom: 3 }}>Linguistic Skill</div>
              <span style={{ fontFamily: SANS, fontSize: 13, color: C.faint }}>
                {lesson.linguisticSkill || '—'}
              </span>
            </div>
          </div>
        </div>

        {/* ── Divider + LO cards (expanded only) ── */}
        {expanded && (
          <>
            <div style={{ height: 1, background: '#F0E8E0', margin: '12px 0' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              {([
                { label: 'Monthly LO', value: lesson.skillLO },
                { label: 'Weekly LO',  value: lesson.knowledgeLO },
                { label: 'Daily LO',   value: lesson.dailyLO },
              ] as const).map(({ label, value }) => (
                <div key={label} style={{
                  background: '#FEF2F6', border: '1px solid #F5D5E2',
                  borderRadius: 8, padding: '8px 10px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                    <Icon name="lock" size={9} color={C.pink} />
                    <span style={{
                      fontFamily: SANS, fontSize: 10, fontWeight: 600,
                      color: '#B62A5C', textTransform: 'uppercase', letterSpacing: '0.08em',
                    }}>
                      {label}
                    </span>
                  </div>
                  <span style={{ fontFamily: SANS, fontSize: 12, color: value ? C.ink : C.faint2, lineHeight: 1.4 }}>
                    {value || '—'}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Bottom toggle (always visible) ── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => setExpanded(v => !v)}
            style={{
              fontFamily: SANS, fontSize: 11, color: C.faint,
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '4px 0 0 0',
            }}
          >
            {expanded ? 'Hide learning journey ▴' : 'Show learning journey ▾'}
          </button>
        </div>

      </div>
    </div>
  );
}
