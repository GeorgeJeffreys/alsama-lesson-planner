'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { C, SANS } from '@/lib/tokens';
import { Icon } from '@/components/icon';
import {
  CeLeftPanel, NavRow, Chip, Label, HiBtn,
  SKILL_COLOR, skillKey,
} from './ce-shell';
import type { CurriculumLesson } from '@/types/curriculum';

export interface ThemeData  { theme: string; count: number }
export interface SkillData  { skill: string; skillKey: string; count: number; pct: number }

// ── Left navigator ────────────────────────────────────────────────────────────

interface ContentLeftProps {
  year: number;
  totalLessons: number;
  skillBreakdown: SkillData[];
  themes: ThemeData[];
  focusedSkill: string | null;
  focusedTheme: string | null;
  themesBySkill: Map<string, ThemeData[]>;
  onFocusSkill: (s: string | null) => void;
  onFocusTheme: (t: string | null) => void;
}

export function ContentLeft({
  year, totalLessons, skillBreakdown, themes,
  focusedSkill, focusedTheme, themesBySkill,
  onFocusSkill, onFocusTheme,
}: ContentLeftProps) {
  return (
    <CeLeftPanel
      title="Content hierarchy"
      sublabel="Total → Skill → Theme"
      footerHint="Content is organised by skill and theme — independent of when it appears in the year."
    >
      <div style={{
        margin: '6px 12px 8px', padding: '8px 10px', borderRadius: 8,
        background: `linear-gradient(135deg, ${C.pink}, #8E1F49)`,
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <Icon name="book" size={12} color="#fff" />
        <span style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700, color: '#fff',
          textTransform: 'uppercase', letterSpacing: '0.08em', flex: 1,
        }}>Year {year} · English</span>
        <span style={{ fontFamily: SANS, fontSize: 10, color: '#fff', opacity: 0.7 }}>{totalLessons}</span>
      </div>

      <div style={{ padding: '2px 16px 4px' }}>
        <span style={{
          fontFamily: SANS, fontSize: 9.5, fontWeight: 700, color: C.faint,
          textTransform: 'uppercase', letterSpacing: '0.1em',
        }}>
          Skills · {skillBreakdown.length}
        </span>
      </div>

      {skillBreakdown.map(s => {
        const isFocus = s.skill === focusedSkill;
        const col = SKILL_COLOR[s.skillKey] ?? SKILL_COLOR.basic;
        const skillThemes = themesBySkill.get(s.skill) ?? themes;
        return (
          <div key={s.skill}>
            <NavRow
              depth={0}
              label={col.label}
              count={s.count}
              active={isFocus}
              expanded={isFocus}
              onClick={() => onFocusSkill(isFocus ? null : s.skill)}
            />
            {isFocus && (
              <>
                <div style={{ padding: '4px 16px 2px 36px' }}>
                  <span style={{
                    fontFamily: SANS, fontSize: 9, fontWeight: 700, color: C.amber,
                    textTransform: 'uppercase', letterSpacing: '0.1em',
                  }}>
                    Themes · {skillThemes.length}
                  </span>
                </div>
                {skillThemes.map(t => (
                  <NavRow
                    key={t.theme}
                    depth={1}
                    label={t.theme}
                    count={t.count}
                    active={focusedTheme === t.theme}
                    leaf={focusedTheme !== t.theme}
                    dot={C.amber}
                    onClick={() => onFocusTheme(focusedTheme === t.theme ? null : t.theme)}
                  />
                ))}
              </>
            )}
          </div>
        );
      })}
    </CeLeftPanel>
  );
}

// ── Lesson card (matches Calendar week view cell style) ───────────────────────

function LessonCard({ lesson }: { lesson: CurriculumLesson }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const col = SKILL_COLOR[skillKey(lesson.linguisticSkill)] ?? SKILL_COLOR.basic;
  const hasExtra = !!(lesson.grammarFocus || lesson.vocabFocus);
  const planUrl = `/plan/new?lessonId=${encodeURIComponent(lesson.id)}`;

  return (
    <div style={{
      background: '#FFFFFF',
      border: `1px solid #E5DDD3`,
      borderRadius: 12,
      position: 'relative', overflow: 'hidden',
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
      {/* Always-visible content */}
      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 5 }}>
        {/* Top row: lesson ID left, week/period badge right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            fontFamily: 'monospace', fontSize: 10.5, fontWeight: 600,
            color: C.faint2, letterSpacing: '0.02em',
          }}>{lesson.id}</span>
          <div style={{ flex: 1 }} />
          {(lesson.week != null || lesson.periodNum != null) && (
            <Chip tone="neutral" size="sm">
              {[lesson.week != null ? `Wk ${lesson.week}` : null, lesson.periodNum != null ? `P${lesson.periodNum}` : null].filter(Boolean).join(' · ')}
            </Chip>
          )}
        </div>
        {/* Daily LO — 2-line clamp */}
        <span style={{
          fontFamily: SANS, fontSize: 13, fontWeight: 500, color: C.ink, lineHeight: 1.4,
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        } as React.CSSProperties}>{lesson.dailyLO}</span>
        {/* Chips row + expand chevron */}
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

      {/* Expanded: grammar / vocab */}
      {expanded && hasExtra && (
        <div style={{
          borderTop: `1px solid #E5DDD3`,
          padding: '10px 14px 12px',
          background: '#FDFAF7',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          {lesson.grammarFocus && (
            <div>
              <Label style={{ display: 'block', marginBottom: 3 }}>Grammar</Label>
              <span style={{ fontFamily: SANS, fontSize: 12, color: C.ink, lineHeight: 1.4 }}>
                {lesson.grammarFocus}
              </span>
            </div>
          )}
          {lesson.vocabFocus && (
            <div>
              <Label style={{ display: 'block', marginBottom: 3 }}>Vocab</Label>
              <span style={{ fontFamily: SANS, fontSize: 12, color: C.ink, lineHeight: 1.4 }}>
                {lesson.vocabFocus}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Open lesson footer */}
      <div style={{
        padding: '8px 14px 12px',
        borderTop: `1px solid #E5DDD3`,
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

      {/* Skill colour bar at very bottom */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 4, background: col.line }} />
    </div>
  );
}

// ── Content grid (Fix #4 — replaces logic tree cascade) ──────────────────────

interface ContentGridProps {
  lessons: CurriculumLesson[];
  focusedSkill: string | null;
  focusedTheme: string | null;
  skillBreakdown: SkillData[];
  themes: ThemeData[];
}

export function ContentGrid({
  lessons, focusedSkill, focusedTheme, skillBreakdown, themes,
}: ContentGridProps) {
  if (!focusedSkill && !focusedTheme) {
    // Empty state — no selection
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: C.cream, padding: 40, gap: 16,
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 999,
          background: C.pinkSoft, border: `2px solid ${C.pinkBorder}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="book" size={22} color={C.pink} />
        </div>
        <div style={{ textAlign: 'center', maxWidth: 300 }}>
          <span style={{
            fontFamily: SANS, fontSize: 16, fontWeight: 700, color: C.ink, display: 'block', marginBottom: 6,
          }}>Browse by theme</span>
          <span style={{
            fontFamily: SANS, fontSize: 13, color: C.faint, lineHeight: 1.5, display: 'block',
          }}>
            Select a skill from the left panel, then choose a theme to see its lesson cards.
          </span>
        </div>
        {/* Skill quick-picks */}
        {skillBreakdown.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
            {skillBreakdown.map(s => {
              const col = SKILL_COLOR[s.skillKey] ?? SKILL_COLOR.basic;
              return (
                <span key={s.skill} style={{
                  fontFamily: SANS, fontSize: 11.5, fontWeight: 600,
                  color: col.fg, background: col.bg,
                  padding: '4px 12px', borderRadius: 999,
                  border: `1px solid ${col.bg}`,
                }}>{col.label} · {s.count}</span>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (focusedSkill && !focusedTheme) {
    // Skill selected, no theme — show theme picker
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{
          padding: '14px 24px', background: C.surface, borderBottom: `1px solid ${C.border}`,
          display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
        }}>
          <span style={{ fontFamily: SANS, fontSize: 18, fontWeight: 700, color: C.ink }}>
            {SKILL_COLOR[skillBreakdown.find(s => s.skill === focusedSkill)?.skillKey ?? 'basic']?.label ?? focusedSkill}
          </span>
          <Chip tone="neutral" size="sm">{themes.length} themes</Chip>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', background: C.cream }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 12,
          }}>
            {themes.map(t => (
              <div
                key={t.theme}
                style={{
                  background: C.amberSoft, border: `1px solid #EFD9A5`,
                  borderRadius: 12, padding: '12px 14px',
                  cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 4,
                  transition: 'border-color 0.12s, box-shadow 0.12s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = '#E8A636';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 0 3px rgba(232,166,54,0.18)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = '#EFD9A5';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                }}
              >
                <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: C.ink }}>{t.theme}</span>
                <span style={{ fontFamily: SANS, fontSize: 11, color: C.faint }}>{t.count} lessons</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Both skill and theme selected — show lesson grid
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 24px', background: C.surface, borderBottom: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
      }}>
        <span style={{ fontFamily: SANS, fontSize: 18, fontWeight: 700, color: C.ink }}>
          {focusedTheme}
        </span>
        <Chip tone="amber" size="sm">{focusedTheme}</Chip>
        <span style={{ fontFamily: SANS, fontSize: 12, color: C.faint }}>{lessons.length} lessons</span>
        <div style={{ flex: 1 }} />
      </div>

      {/* Lesson card grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', background: C.cream }}>
        {lessons.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 14,
          }}>
            {lessons.map(l => (
              <LessonCard key={l.id} lesson={l} />
            ))}
          </div>
        ) : (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: '100%', color: C.faint, fontFamily: SANS, fontSize: 13,
          }}>
            No lessons found for this theme.
          </div>
        )}
      </div>
    </div>
  );
}
