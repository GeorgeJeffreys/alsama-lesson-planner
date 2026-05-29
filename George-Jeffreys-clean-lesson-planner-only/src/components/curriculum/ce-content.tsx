'use client';

import { C, SANS } from '@/lib/tokens';
import { Icon } from '@/components/icon';
import {
  CeLeftPanel, NavRow, Chip,
  SKILL_COLOR, skillKey,
} from './ce-shell';
import { LessonCard } from './lesson-card';
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

// ── Content grid ─────────────────────────────────────────────────────────────

interface ContentGridProps {
  lessons: CurriculumLesson[];
  focusedSkill: string | null;
  focusedTheme: string | null;
  skillBreakdown: SkillData[];
  themes: ThemeData[];
  onFocusTheme: (t: string | null) => void;
}

export function ContentGrid({
  lessons, focusedSkill, focusedTheme, skillBreakdown, themes, onFocusTheme,
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
                onClick={() => onFocusTheme(t.theme)}
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
