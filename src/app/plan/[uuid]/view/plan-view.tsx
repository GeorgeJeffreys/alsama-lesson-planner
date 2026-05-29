'use client';

import { useState } from 'react';
import { C, SANS, SCRIPT, SECTION_CONFIG } from '@/lib/tokens';
import { Icon } from '@/components/icon';
import type { LessonPlan, LessonSection } from '@/types/lesson';
import type { CurriculumLesson } from '@/types/curriculum';
import { emptySection } from '@/types/lesson';

interface PlanViewProps {
  plan: LessonPlan | null;
  lesson: CurriculumLesson | null;
}

function buildDefaultSections(): LessonSection[] {
  return SECTION_CONFIG.map((cfg, i) => ({
    ...emptySection(i),
    title: cfg.title,
    timing_minutes: cfg.timing_minutes,
  }));
}

const SECTION_PALETTE = [C.pink, '#E8A636', C.teal, '#7B5EA7', '#3B82F6', '#059669'];

function AlsamaMark() {
  return (
    <div style={{
      fontFamily: SCRIPT, fontSize: 28, color: C.pink,
      lineHeight: 1, display: 'inline-flex', alignItems: 'baseline', gap: 2,
    }}>
      Alsama
      <svg width={14} height={11} viewBox="0 0 20 16" fill="none" style={{ marginLeft: 2, marginBottom: 1 }}>
        <path d="M2 8 C2 4, 6 2, 8 6 C10 2, 14 4, 14 8 C14 11, 10 12, 8 9 C6 12, 2 11, 2 8 Z" fill={C.pink} opacity="0.85" />
        <circle cx="16" cy="6" r="0.9" fill={C.pink} />
        <circle cx="17.5" cy="9" r="0.7" fill={C.pink} />
        <circle cx="18.5" cy="11.5" r="0.5" fill={C.pink} />
      </svg>
    </div>
  );
}

function SectionBlock({ section, index }: { section: LessonSection; index: number }) {
  const color = SECTION_PALETTE[index] ?? C.pink;
  return (
    <div style={{
      background: C.surface, borderRadius: 12,
      border: `1px solid ${C.border}`,
      borderLeft: `3px solid ${color}`,
      overflow: 'hidden', breakInside: 'avoid' as const,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 16px', background: '#FAFAFA',
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{
          width: 26, height: 26, borderRadius: 7, background: C.cream,
          border: `1px solid ${C.borderSoft}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: SANS, fontSize: 11, fontWeight: 700, color: C.faint,
        }}>
          {String(index + 1).padStart(2, '0')}
        </div>
        <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: C.ink, flex: 1 }}>
          {section.title}
        </span>
        <span style={{
          fontFamily: SANS, fontSize: 12, color: C.faint,
          padding: '3px 9px', borderRadius: 999,
          background: C.cream, border: `1px solid ${C.borderSoft}`,
        }}>
          {section.timing_minutes === 0 ? 'Take-home' : `${section.timing_minutes} min`}
        </span>
      </div>

      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {section.task && (
          <div>
            <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 600, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Task</div>
            <p style={{ fontFamily: SANS, fontSize: 13, color: C.ink, margin: 0, lineHeight: 1.5 }}>{section.task}</p>
          </div>
        )}
        {section.materials && (
          <div>
            <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 600, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Materials</div>
            <p style={{ fontFamily: SANS, fontSize: 13, color: C.ink, margin: 0, lineHeight: 1.5 }}>{section.materials}</p>
          </div>
        )}
        {section.teacher_instructions && (
          <div>
            <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 600, color: C.pink, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Teacher does</div>
            <p style={{ fontFamily: SANS, fontSize: 13, color: C.ink, margin: 0, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{section.teacher_instructions}</p>
          </div>
        )}
        {section.student_instructions && (
          <div>
            <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 600, color: C.teal, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Students do</div>
            <p style={{ fontFamily: SANS, fontSize: 13, color: C.ink, margin: 0, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{section.student_instructions}</p>
          </div>
        )}
        {!section.task && !section.teacher_instructions && !section.student_instructions && (
          <p style={{ fontFamily: SANS, fontSize: 13, color: C.faint2, margin: 0, fontStyle: 'italic' }}>No content yet</p>
        )}
      </div>
    </div>
  );
}

export function PlanView({ plan, lesson }: PlanViewProps) {
  const [copied, setCopied] = useState(false);
  const sections: LessonSection[] = plan?.sections?.length === 6
    ? plan.sections.map((s, i) => ({ ...s, title: s.title || SECTION_CONFIG[i].title }))
    : buildDefaultSections();

  const totalMin = sections.reduce((sum, s) => sum + (s.timing_minutes || 0), 0);

  function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div style={{ minHeight: '100vh', background: C.cream, fontFamily: SANS }}>
      {/* Top bar — hidden in print */}
      <div className="no-print" style={{
        display: 'flex', alignItems: 'center', gap: 16,
        height: 56, padding: '0 24px',
        background: C.surface,
        borderBottom: `1px solid ${C.border}`,
      }}>
        <AlsamaMark />
        <div style={{ width: 1, height: 20, background: C.border }} />
        <span style={{ fontFamily: SANS, fontSize: 12, color: C.faint }}>View-only</span>
        <div style={{ flex: 1 }} />
        <a
          href={typeof window !== 'undefined' ? window.location.href.replace('/view', '') : '#'}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            height: 34, padding: '0 12px',
            fontFamily: SANS, fontSize: 13, fontWeight: 500,
            color: C.ink, background: 'transparent',
            border: `1px solid ${C.border}`, borderRadius: 8,
            textDecoration: 'none',
          }}
        >
          <Icon name="edit" size={13} color={C.faint} />Edit plan
        </a>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 840, margin: '0 auto', padding: '28px 24px 120px' }}>
        {/* Lesson meta */}
        {lesson && (
          <div style={{
            background: C.surface, borderRadius: 12,
            border: `1px solid ${C.border}`,
            borderLeft: `3px solid ${C.pink}`,
            padding: '16px 20px', marginBottom: 24,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 600, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Lesson ID</div>
                <div style={{ fontFamily: SANS, fontSize: 22, fontWeight: 700, color: C.ink }}>{lesson.id}</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                  {[lesson.year, lesson.week !== null && `Week ${lesson.week}`, lesson.period].filter(Boolean).map((c) => (
                    <span key={String(c)} style={{ height: 22, padding: '0 8px', display: 'inline-flex', alignItems: 'center', fontFamily: SANS, fontSize: 11, color: C.faint, background: C.cream, border: `1px solid ${C.borderSoft}`, borderRadius: 999 }}>{c}</span>
                  ))}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 600, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Learning Objective</div>
                <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 500, color: C.ink, lineHeight: 1.45 }}>{lesson.dailyLO}</div>
              </div>
              {(lesson.theme || lesson.grammarFocus) && (
                <div>
                  <div style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 600, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Theme / Focus</div>
                  <div style={{ fontFamily: SANS, fontSize: 13, color: C.ink }}>{lesson.theme || lesson.grammarFocus}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Section heading */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <h2 style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: C.ink, margin: 0 }}>Lesson structure</h2>
          <span style={{ fontFamily: SANS, fontSize: 12, color: C.faint }}>· {totalMin} min · {sections.length} sections</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sections.map((s, i) => <SectionBlock key={i} section={s} index={i} />)}
        </div>
      </div>

      {/* Sticky bottom bar — hidden in print */}
      <div className="no-print" style={{
        position: 'fixed', left: 0, right: 0, bottom: 0,
        height: 'calc(60px + env(safe-area-inset-bottom))',
        paddingBottom: 'env(safe-area-inset-bottom)',
        background: C.surface,
        borderTop: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        padding: '0 24px',
        boxShadow: '0 -4px 16px rgba(56,30,30,0.06)',
      }}>
        <button
          onClick={() => window.print()}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            height: 40, padding: '0 18px',
            fontFamily: SANS, fontSize: 13, fontWeight: 500,
            background: 'transparent', color: C.ink,
            border: `1px solid ${C.border}`, borderRadius: 8, cursor: 'pointer',
          }}
        >
          <Icon name="download" size={15} color={C.ink} />Print / Export PDF
        </button>
        <button
          onClick={copyLink}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            height: 40, padding: '0 18px',
            fontFamily: SANS, fontSize: 13, fontWeight: 500,
            background: copied ? C.tealSoft : C.pink,
            color: copied ? C.teal : '#fff',
            border: `1px solid ${copied ? '#BCDED6' : C.pink}`, borderRadius: 8, cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <Icon name="share" size={15} color={copied ? C.teal : '#fff'} />
          {copied ? 'Copied!' : 'Copy share link'}
        </button>
      </div>
    </div>
  );
}
