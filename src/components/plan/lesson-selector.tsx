'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { C, SANS } from '@/lib/tokens';
import { Icon } from '@/components/icon';
import { fetchWeeksForYear, fetchLessonsForWeek } from '@/lib/curriculum-actions';
import type { CurriculumLesson } from '@/types/curriculum';
import { emptySection } from '@/types/lesson';
import { SECTION_CONFIG } from '@/lib/tokens';

const YEARS = [
  { num: 0, label: 'Year 0', sub: 'Foundations' },
  { num: 1, label: 'Year 1', sub: 'Build-up' },
  { num: 2, label: 'Year 2', sub: 'Confidence' },
  { num: 3, label: 'Year 3', sub: 'Mastery' },
  { num: 4, label: 'Year 4', sub: 'Fluency' },
  { num: 5, label: 'Year 5', sub: 'Advanced' },
  { num: 6, label: 'Year 6', sub: 'B2 Ready' },
];

interface LessonSelectorProps {
  onClose: () => void;
}

export function LessonSelector({ onClose }: LessonSelectorProps) {
  const router = useRouter();
  const [selectedYear, setSelectedYear] = useState(0);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<CurriculumLesson | null>(null);
  const [weeks, setWeeks] = useState<number[]>([]);
  const [lessons, setLessons] = useState<CurriculumLesson[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [opening, setOpening] = useState(false);
  const [openError, setOpenError] = useState<string | null>(null);

  useEffect(() => {
    fetchWeeksForYear(selectedYear).then(setWeeks);
    setSelectedWeek(null);
    setSelectedLesson(null);
    setLessons([]);
  }, [selectedYear]);

  const selectWeek = useCallback(async (week: number) => {
    setSelectedWeek(week);
    setSelectedLesson(null);
    setLoading(true);
    const data = await fetchLessonsForWeek(selectedYear, week);
    setLessons(data);
    setLoading(false);
  }, [selectedYear]);

  async function openLesson() {
    if (!selectedLesson || opening) return;
    setOpening(true);
    setOpenError(null);

    const sections = SECTION_CONFIG.map((cfg, i) => ({
      ...emptySection(i),
      title: cfg.title,
      timing_minutes: cfg.timing_minutes,
    }));

    let planId: string | null = null;

    try {
      const res = await fetch('/api/lesson/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lesson_id: selectedLesson.id, sections, worksheet: null }),
      });
      const json = await res.json();
      if (res.ok && json.data?.id) {
        planId = json.data.id;
      }
    } catch (err) {
      console.error('Failed to reach lesson API:', err);
    }

    if (!planId) {
      // Supabase unavailable — persist plan locally and continue
      planId = crypto.randomUUID();
      sessionStorage.setItem(`plan_local_${planId}`, JSON.stringify({
        id: planId,
        lesson_id: selectedLesson.id,
        lesson: selectedLesson,
        sections,
        worksheet: null,
      }));
    }

    setOpening(false);
    router.push(`/plan/${planId}`);
  }

  const filteredLessons = query.trim()
    ? lessons.filter((l) =>
        l.id.toLowerCase().includes(query.toLowerCase()) ||
        l.dailyLO.toLowerCase().includes(query.toLowerCase()) ||
        (l.theme && l.theme.toLowerCase().includes(query.toLowerCase()))
      )
    : lessons;

  return (
    /* Backdrop */
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(245, 237, 229, 0.55)',
        backdropFilter: 'blur(2px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        width: 820, maxWidth: 'calc(100vw - 32px)', maxHeight: '86vh',
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        boxShadow: '0 24px 60px rgba(56, 30, 30, 0.18), 0 6px 16px rgba(56, 30, 30, 0.08)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 18px', borderBottom: `1px solid ${C.border}`,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <h1 style={{ fontFamily: SANS, fontSize: 16, fontWeight: 700, color: C.ink, margin: 0 }}>Open lesson</h1>
          <div style={{ flex: 1 }} />
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            height: 36, padding: '0 12px',
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, width: 320,
          }}>
            <Icon name="search" size={15} color={C.faint2} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Jump by lesson ID, theme, or skill…"
              style={{ flex: 1, border: 'none', outline: 'none', fontFamily: SANS, fontSize: 13, color: C.ink, background: 'transparent' }}
            />
            <span style={{ height: 20, padding: '0 7px', fontFamily: SANS, fontSize: 10.5, background: C.cream, border: `1px solid ${C.borderSoft}`, borderRadius: 999, display: 'inline-flex', alignItems: 'center' }}>⌘K</span>
          </div>
        </div>

        {/* Three-column body */}
        <div style={{ display: 'flex', flex: 1, minHeight: 420, overflow: 'hidden' }}>
          {/* Year column */}
          <div style={{ width: 140, borderRight: `1px solid ${C.border}`, background: C.cream, flexShrink: 0, overflowY: 'auto' }}>
            <div style={{ padding: '12px 14px 6px', fontFamily: SANS, fontSize: 10.5, fontWeight: 600, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Year</div>
            {YEARS.map((y) => {
              const active = y.num === selectedYear;
              return (
                <div
                  key={y.num}
                  onClick={() => setSelectedYear(y.num)}
                  style={{
                    padding: '10px 14px',
                    background: active ? C.surface : 'transparent',
                    borderLeft: `3px solid ${active ? C.pink : 'transparent'}`,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: active ? 600 : 500, color: C.ink }}>{y.label}</div>
                  <div style={{ fontFamily: SANS, fontSize: 11, color: C.faint }}>{y.sub}</div>
                </div>
              );
            })}
          </div>

          {/* Week column */}
          <div style={{ width: 200, borderRight: `1px solid ${C.border}`, padding: 12, overflowY: 'auto', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 600, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Week</span>
              <span style={{ fontFamily: SANS, fontSize: 11, color: C.faint }}>{weeks.length} weeks</span>
            </div>
            {weeks.length === 0 ? (
              <span style={{ fontFamily: SANS, fontSize: 12, color: C.faint2 }}>No weeks found</span>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
                {weeks.map((w) => {
                  const isSelected = w === selectedWeek;
                  return (
                    <div
                      key={w}
                      onClick={() => selectWeek(w)}
                      style={{
                        aspectRatio: '1 / 1',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: `1px solid ${isSelected ? C.pink : C.borderSoft}`,
                        background: isSelected ? C.pink : C.surface,
                        color: isSelected ? '#fff' : C.ink,
                        borderRadius: 6,
                        fontFamily: SANS, fontSize: 11, fontWeight: isSelected ? 700 : 500,
                        cursor: 'pointer',
                      }}
                    >{w}</div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Lessons column */}
          <div style={{ flex: 1, padding: '12px 14px', overflowY: 'auto' }}>
            {!selectedWeek ? (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: SANS, fontSize: 13, color: C.faint2 }}>Select a week →</span>
              </div>
            ) : loading ? (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: SANS, fontSize: 13, color: C.faint2 }}>Loading…</span>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 600, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Week {selectedWeek}
                  </span>
                  <span style={{ fontFamily: SANS, fontSize: 11, color: C.faint }}>{filteredLessons.length} periods</span>
                </div>
                {filteredLessons.map((l) => {
                  const isSelected = l.id === selectedLesson?.id;
                  return (
                    <div
                      key={l.id}
                      onClick={() => { setSelectedLesson(l); setOpenError(null); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '12px 12px',
                        background: isSelected ? C.pinkSoft : 'transparent',
                        border: `1px solid ${isSelected ? C.pinkBorder : 'transparent'}`,
                        borderRadius: 10, marginBottom: 4, cursor: 'pointer',
                      }}
                    >
                      <div style={{
                        width: 24, height: 24, borderRadius: 999,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: isSelected ? C.pink : C.cream,
                        flexShrink: 0,
                      }}>
                        {isSelected && <div style={{ width: 6, height: 6, borderRadius: 999, background: '#fff' }} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: isSelected ? 700 : 500, color: C.ink }}>
                            {l.dailyLO.length > 50 ? l.dailyLO.slice(0, 50) + '…' : l.dailyLO}
                          </span>
                        </div>
                        <span style={{ fontFamily: SANS, fontSize: 11, color: C.faint, display: 'block', marginTop: 2 }}>
                          {l.period} · {l.id}
                        </span>
                      </div>
                      {isSelected && <Icon name="arrowRight" size={16} color={C.pink} />}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 18px', borderTop: `1px solid ${C.border}`,
          background: C.cream, display: 'flex', alignItems: 'center', gap: 8,
          flexShrink: 0,
        }}>
          <span style={{ fontFamily: SANS, fontSize: 11, color: C.faint }}>
            <kbd style={{ fontFamily: SANS, fontSize: 10, padding: '2px 6px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 4 }}>↑↓</kbd> navigate ·{' '}
            <kbd style={{ fontFamily: SANS, fontSize: 10, padding: '2px 6px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 4 }}>↵</kbd> open
          </span>
          <div style={{ flex: 1 }} />
          {openError && (
            <span style={{ fontFamily: SANS, fontSize: 12, color: C.pink, maxWidth: 280, textAlign: 'right', lineHeight: 1.3 }}>
              {openError}
            </span>
          )}
          <button
            onClick={onClose}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              height: 34, padding: '0 14px',
              fontFamily: SANS, fontSize: 13, fontWeight: 500,
              background: 'transparent', color: C.ink,
              border: `1px solid ${C.border}`, borderRadius: 8,
              cursor: 'pointer',
            }}
          >Cancel</button>
          <button
            onClick={openLesson}
            disabled={!selectedLesson || opening}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              height: 34, padding: '0 14px',
              fontFamily: SANS, fontSize: 13, fontWeight: 500,
              background: !selectedLesson || opening ? C.faint2 : C.pink, color: '#fff',
              border: 'none', borderRadius: 8,
              cursor: !selectedLesson || opening ? 'default' : 'pointer',
              transition: 'background 0.15s',
            }}
          >
            <Icon name="arrowRight" size={12} color="#fff" />
            {opening ? 'Opening…' : 'Open lesson'}
          </button>
        </div>
      </div>
    </div>
  );
}
