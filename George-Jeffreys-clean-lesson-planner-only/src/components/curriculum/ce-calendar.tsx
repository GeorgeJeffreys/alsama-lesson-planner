'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { C, SANS } from '@/lib/tokens';
import { Icon } from '@/components/icon';
import { CeLeftPanel, NavRow, HiBtn, Chip, Label, SKILL_COLOR, skillKey } from './ce-shell';
import type { CurriculumLesson } from '@/types/curriculum';

// ── Left navigator ────────────────────────────────────────────────────────────

interface CalendarLeftProps {
  months: { month: string; weeks: number[] }[];
  selectedMonth: string | null;
  selectedWeek: number | null;
  onSelectMonth: (m: string) => void;
  onSelectWeek: (w: number) => void;
}

export function CalendarLeft({ months, selectedMonth, selectedWeek, onSelectMonth, onSelectWeek }: CalendarLeftProps) {
  return (
    <CeLeftPanel
      title="Browse term"
      sublabel="Month › Week"
      footerHint="Click a week to drill into its 5 periods."
    >
      {months.map(m => {
        const isMonthActive = m.month === selectedMonth;
        return (
          <div key={m.month}>
            <NavRow
              depth={0}
              label={m.month}
              count={m.weeks.length * 5}
              expanded={isMonthActive}
              active={isMonthActive && !selectedWeek}
              onClick={() => onSelectMonth(m.month)}
            />
            {isMonthActive && m.weeks.map(w => (
              <NavRow
                key={w}
                depth={1}
                label={`Week ${w}`}
                leaf
                active={selectedWeek === w}
                dot={selectedWeek === w ? C.pink : C.faint2}
                onClick={() => onSelectWeek(w)}
              />
            ))}
          </div>
        );
      })}
    </CeLeftPanel>
  );
}

// ── Skill bar at bottom of cell ───────────────────────────────────────────────

function SkillBar({ skill }: { skill: string }) {
  const col = SKILL_COLOR[skillKey(skill)];
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 4, background: col.line }} />
  );
}

// ── Calendar cell ─────────────────────────────────────────────────────────────

function CalCell({ lesson, onLessonClick }: { lesson: CurriculumLesson | undefined; onLessonClick: (l: CurriculumLesson) => void }) {
  const [hover, setHover] = useState(false);
  if (!lesson) return <div style={{ minHeight: 116, borderRadius: 8, background: 'rgba(255,255,255,0.4)', border: `1px dashed ${C.borderSoft}` }} />;

  const sk = skillKey(lesson.linguisticSkill);
  const col = SKILL_COLOR[sk];

  return (
    <div
      onClick={() => onLessonClick(lesson)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        background: hover ? C.pinkSoft : C.surface,
        border: `1px solid ${hover ? C.pink : C.border}`,
        borderLeft: hover ? `3px solid ${C.pink}` : `1px solid ${C.border}`,
        borderRadius: 8,
        padding: '10px 12px 12px',
        display: 'flex', flexDirection: 'column', gap: 6,
        minHeight: 116, cursor: 'pointer',
        boxShadow: hover ? '0 8px 24px rgba(56,30,30,0.12),0 2px 6px rgba(56,30,30,0.06)' : '0 1px 0 rgba(56,30,30,0.02)',
        transform: hover ? 'translateY(-1px)' : 'none',
        transition: 'transform 0.15s, box-shadow 0.15s',
        overflow: 'hidden',
      }}
    >
      {/* Top row: ID + plan badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 600, color: C.faint, fontVariantNumeric: 'tabular-nums', letterSpacing: '0.02em' }}>
          {lesson.id}
        </span>
        <div style={{ flex: 1 }} />
        {/* Plan badge placeholder — false for now */}
      </div>

      {/* LO — 2-line clamp */}
      <span style={{
        fontFamily: SANS, fontSize: 12.5, fontWeight: 500, color: C.ink, lineHeight: 1.35,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>
        {lesson.dailyLO}
      </span>

      <div style={{ flex: 1 }} />

      {/* Skill chip + theme */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center',
          padding: '1px 7px', background: col.bg, color: col.fg,
          border: `1px solid ${col.bg}`, borderRadius: 999,
          fontFamily: SANS, fontSize: 10, fontWeight: 600,
        }}>{col.label}</span>
        {lesson.theme && (
          <span style={{ fontFamily: SANS, fontSize: 10.5, color: C.faint, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {lesson.theme}
          </span>
        )}
      </div>

      <SkillBar skill={lesson.linguisticSkill} />
    </div>
  );
}

// ── CalendarLegend ────────────────────────────────────────────────────────────

function CalendarLegend() {
  return (
    <div style={{
      padding: '10px 24px', borderTop: `1px solid ${C.border}`,
      background: C.surface, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
    }}>
      <Label>Skill key</Label>
      {Object.entries(SKILL_COLOR).map(([id, meta]) => (
        <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 14, height: 4, borderRadius: 2, background: meta.line }} />
          <span style={{ fontFamily: SANS, fontSize: 11, color: C.faint }}>{meta.label}</span>
        </div>
      ))}
      <div style={{ width: 1, height: 16, background: C.border, margin: '0 8px' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <div style={{ padding: '1px 6px', borderRadius: 999, background: C.tealSoft, border: '1px solid #BCDED6', display: 'flex', alignItems: 'center', gap: 3 }}>
          <div style={{ width: 5, height: 5, borderRadius: 999, background: C.teal }} />
          <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 600, color: C.teal }}>Plan</span>
        </div>
        <span style={{ fontFamily: SANS, fontSize: 11, color: C.faint }}>= lesson plan saved</span>
      </div>
    </div>
  );
}

// ── Month view ────────────────────────────────────────────────────────────────

interface MonthViewProps {
  month: string;
  weeks: number[];
  weekLessons: Map<number, CurriculumLesson[]>;
  onSelectWeek: (w: number) => void;
}

export function MonthView({ month, weeks, weekLessons, onSelectWeek }: MonthViewProps) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        padding: '14px 24px', background: C.surface, borderBottom: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
      }}>
        <span style={{ fontFamily: SANS, fontSize: 20, fontWeight: 700, color: C.ink }}>{month}</span>
        <Chip tone="neutral" size="sm">{weeks.length} weeks · {weeks.length * 5} lessons</Chip>
        <div style={{ flex: 1 }} />
      </div>

      {/* Week summary cards */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', background: C.cream }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {weeks.map(w => {
            const lessons = weekLessons.get(w) ?? [];
            const skillCounts: Record<string, number> = {};
            lessons.forEach(l => {
              const k = skillKey(l.linguisticSkill);
              skillCounts[k] = (skillCounts[k] ?? 0) + 1;
            });
            return (
              <button
                key={w}
                onClick={() => onSelectWeek(w)}
                style={{
                  display: 'flex', flexDirection: 'column', gap: 8,
                  padding: '12px 14px', background: C.surface,
                  border: `1px solid ${C.border}`, borderRadius: 10,
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'border-color 0.12s, box-shadow 0.12s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.pink; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(56,30,30,0.08)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.border; (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: C.ink }}>Week {w}</span>
                  <Icon name="arrowRight" size={13} color={C.faint2} />
                </div>
                <span style={{ fontFamily: SANS, fontSize: 11.5, color: C.faint }}>{lessons.length} lessons</span>
                <div style={{ display: 'flex', height: 4, borderRadius: 2, overflow: 'hidden', gap: 1 }}>
                  {Object.entries(skillCounts).map(([sk, cnt]) => (
                    <div key={sk} style={{ flex: cnt, background: SKILL_COLOR[sk]?.line ?? C.faint2, borderRadius: 2 }} />
                  ))}
                  {lessons.length === 0 && <div style={{ flex: 1, background: C.borderSoft, borderRadius: 2 }} />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <CalendarLegend />
    </div>
  );
}

// ── Week view (period grid) ───────────────────────────────────────────────────

interface WeekViewProps {
  week: number;
  month: string;
  lessons: CurriculumLesson[];
  onBack: () => void;
}

export function WeekView({ week, month, lessons, onBack }: WeekViewProps) {
  const router = useRouter();
  const [expandedPeriod, setExpandedPeriod] = useState<number | null>(null);

  const weekLO = lessons[0]?.knowledgeLO ?? '';

  function togglePeriod(p: number, hasLesson: boolean, hasExtra: boolean) {
    if (!hasLesson || !hasExtra) return;
    setExpandedPeriod(prev => prev === p ? null : p);
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '14px 24px', background: C.surface, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <HiBtn variant="ghost" size="sm" icon={<Icon name="chevronLeft" size={13} color={C.ink} />} onClick={onBack}>
          Back to {month}
        </HiBtn>
        <div style={{ width: 1, height: 18, background: C.border }} />
        <span style={{ fontFamily: SANS, fontSize: 11.5, color: C.faint }}>{month}</span>
        <Icon name="chevronRight" size={12} color={C.faint2} />
        <span style={{ fontFamily: SANS, fontSize: 20, fontWeight: 700, color: C.ink }}>Week {week}</span>
        {weekLO && <Chip tone="pink" size="sm">{weekLO.slice(0, 50)}{weekLO.length > 50 ? '…' : ''}</Chip>}
        <div style={{ flex: 1 }} />
      </div>

      {/* Weekly / Monthly LO context */}
      {lessons[0] && (
        <div style={{
          padding: '14px 24px', background: C.surface, borderBottom: `1px solid ${C.border}`,
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, flexShrink: 0,
        }}>
          <div>
            <Label style={{ display: 'block', marginBottom: 4 }}>Weekly LO</Label>
            <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 500, color: C.ink, lineHeight: 1.4 }}>
              {lessons[0].knowledgeLO || '—'}
            </span>
          </div>
          <div>
            <Label style={{ display: 'block', marginBottom: 4 }}>Skill LO</Label>
            <span style={{ fontFamily: SANS, fontSize: 13, color: C.ink, lineHeight: 1.4 }}>
              {lessons[0].skillLO || '—'}
            </span>
          </div>
        </div>
      )}

      {/* 5 period cards (accordion) */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 10, background: C.cream }}>
        {[1, 2, 3, 4, 5].map(p => {
          const lesson = lessons.find(l => l.periodNum === p);
          // Diagnostic: log all fields so teachers can see what data is present
          if (lesson) console.log('cell data:', lesson);
          const sk = lesson ? skillKey(lesson.linguisticSkill) : 'basic';
          const col = SKILL_COLOR[sk] ?? SKILL_COLOR.basic;
          const isExpanded = expandedPeriod === p;
          const hasExtra = !!(lesson?.grammarFocus || lesson?.vocabFocus);

          return (
            <div
              key={p}
              onClick={() => togglePeriod(p, !!lesson, hasExtra)}
              style={{
                background: '#FFFFFF',
                border: `1px solid ${isExpanded ? col.line : '#E5DDD3'}`,
                borderLeft: isExpanded ? `3px solid ${col.line}` : `1px solid #E5DDD3`,
                borderRadius: 12,
                cursor: (lesson && hasExtra) ? 'pointer' : 'default',
                position: 'relative', overflow: 'hidden',
                boxShadow: isExpanded ? '0 4px 16px rgba(56,30,30,0.08)' : '0 1px 0 rgba(56,30,30,0.02)',
                opacity: lesson ? 1 : 0.5,
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
            >
              {/* Always-visible row: period number left, lesson ID top-right, LO, chips */}
              <div style={{ padding: '12px 16px 16px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                {/* Period badge — large number on left */}
                <div style={{
                  width: 48, flexShrink: 0,
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  paddingTop: 2,
                }}>
                  <span style={{ fontFamily: SANS, fontSize: 9.5, fontWeight: 700, color: C.faint2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>P</span>
                  <span style={{ fontFamily: SANS, fontSize: 40, fontWeight: 800, color: isExpanded ? col.fg : C.ink, lineHeight: 1 }}>{p}</span>
                </div>

                {/* Main content column */}
                {lesson ? (
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {/* Lesson ID — top right */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      <span style={{
                        fontFamily: 'monospace', fontSize: 10.5, fontWeight: 600,
                        color: C.faint2, letterSpacing: '0.02em',
                      }}>
                        {lesson.id}
                      </span>
                    </div>
                    {/* Daily LO — 2-line clamp */}
                    <span style={{
                      fontFamily: SANS, fontSize: 13, fontWeight: 500, color: C.ink, lineHeight: 1.4,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    } as React.CSSProperties}>
                      {lesson.dailyLO}
                    </span>
                    {/* Chips row + chevron */}
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
                        <div style={{
                          transform: isExpanded ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.2s',
                        }}>
                          <Icon name="chevronDown" size={14} color={C.faint2} />
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', paddingTop: 8 }}>
                    <span style={{ fontFamily: SANS, fontSize: 12, color: C.faint2 }}>No lesson scheduled</span>
                  </div>
                )}
              </div>

              {/* Expanded panel: full LO unclamped + grammar/vocab + navigate button */}
              {isExpanded && lesson && (
                <div
                  onClick={e => e.stopPropagation()}
                  style={{
                    borderTop: `1px solid #E5DDD3`,
                    padding: '14px 16px 16px',
                    display: 'flex', flexDirection: 'column', gap: 12,
                    background: '#FDFAF7',
                  }}
                >
                  {/* Full LO unclamped */}
                  <div>
                    <Label style={{ display: 'block', marginBottom: 4 }}>Full learning outcome</Label>
                    <span style={{ fontFamily: SANS, fontSize: 13, color: C.ink, lineHeight: 1.5 }}>{lesson.dailyLO}</span>
                  </div>

                  {/* Grammar / Vocab */}
                  {(lesson.grammarFocus || lesson.vocabFocus) && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      {lesson.grammarFocus && (
                        <div>
                          <Label style={{ display: 'block', marginBottom: 3 }}>Grammar focus</Label>
                          <span style={{ fontFamily: SANS, fontSize: 12, color: C.ink, lineHeight: 1.4 }}>{lesson.grammarFocus}</span>
                        </div>
                      )}
                      {lesson.vocabFocus && (
                        <div>
                          <Label style={{ display: 'block', marginBottom: 3 }}>Vocab focus</Label>
                          <span style={{ fontFamily: SANS, fontSize: 12, color: C.ink, lineHeight: 1.4 }}>{lesson.vocabFocus}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Single CTA — navigate directly to plan editor */}
                  <button
                    onClick={() => router.push(`/plan/new?lessonId=${encodeURIComponent(lesson.id)}`)}
                    style={{
                      alignSelf: 'flex-start',
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      height: 32, padding: '0 14px',
                      fontFamily: SANS, fontSize: 12.5, fontWeight: 600,
                      color: '#fff', background: C.pink,
                      border: 'none', borderRadius: 8, cursor: 'pointer',
                      boxShadow: '0 1px 0 rgba(0,0,0,0.06),inset 0 -1px 0 rgba(0,0,0,0.1)',
                    }}
                  >
                    Open lesson plan →
                  </button>
                </div>
              )}

              {/* Skill colour bar at bottom */}
              {lesson && <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 4, background: col.line }} />}
            </div>
          );
        })}
      </div>

      <CalendarLegend />
    </div>
  );
}

// ── Full-year overview (no month selected) ────────────────────────────────────

interface YearOverviewProps {
  months: { month: string; weeks: number[] }[];
  onSelectMonth: (m: string) => void;
}

export function YearOverview({ months, onSelectMonth }: YearOverviewProps) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', background: C.cream }}>
      <span style={{ fontFamily: SANS, fontSize: 22, fontWeight: 700, color: C.ink, display: 'block', marginBottom: 20 }}>
        Full Year Overview
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {months.map(m => (
          <button
            key={m.month}
            onClick={() => onSelectMonth(m.month)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 16px', background: C.surface,
              border: `1px solid ${C.border}`, borderRadius: 10,
              cursor: 'pointer', textAlign: 'left',
              transition: 'border-color 0.12s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.pink; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.border; }}
          >
            <span style={{ fontFamily: SANS, fontSize: 15, fontWeight: 700, color: C.ink, width: 80 }}>{m.month}</span>
            <span style={{ fontFamily: SANS, fontSize: 12, color: C.faint }}>{m.weeks.length} weeks · {m.weeks.length * 5} lessons</span>
            <div style={{ display: 'flex', gap: 4 }}>
              {m.weeks.map(w => (
                <span key={w} style={{
                  fontFamily: SANS, fontSize: 10.5, color: C.faint2,
                  background: C.cream, border: `1px solid ${C.borderSoft}`,
                  padding: '1px 6px', borderRadius: 4,
                }}>Wk {w}</span>
              ))}
            </div>
            <div style={{ flex: 1 }} />
            <Icon name="arrowRight" size={13} color={C.faint2} />
          </button>
        ))}
      </div>
    </div>
  );
}
