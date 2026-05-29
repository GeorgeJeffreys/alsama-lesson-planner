'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { C, SANS, SECTION_CONFIG } from '@/lib/tokens';
import { Icon } from '@/components/icon';
import { MobileTopBar } from './MobileTopBar';
import { BottomTabBar } from './BottomTabBar';
import { MetaDrawer } from './MetaDrawer';
import { SectionDrawer } from './SectionDrawer';
import { MobileLibrary } from './MobileLibrary';
import { AiPanel } from '@/components/plan/ai-panel';
import { WorksheetView } from '@/components/plan/worksheet';
import { LessonSelector } from '@/components/plan/lesson-selector';
import type { LessonPlan, LessonSection } from '@/types/lesson';
import type { CurriculumLesson } from '@/types/curriculum';
import type { LibraryCard } from '@/components/plan/library-panel';
import { emptySection } from '@/types/lesson';

interface MobilePlanEditorProps {
  uuid: string;
  initialPlan: LessonPlan | null;
  initialLesson: CurriculumLesson | null;
}

function buildDefaultSections(): LessonSection[] {
  return SECTION_CONFIG.map((cfg, i) => ({
    ...emptySection(i),
    title: cfg.title,
    timing_minutes: cfg.timing_minutes,
  }));
}

const SECTION_PALETTE = [C.pink, '#E8A636', C.teal, '#7B5EA7', '#3B82F6', '#059669'];

export function MobilePlanEditor({ uuid, initialPlan, initialLesson }: MobilePlanEditorProps) {
  const [plan, setPlan] = useState<LessonPlan | null>(initialPlan);
  const [lesson, setLesson] = useState<CurriculumLesson | null>(initialLesson);
  const [mobileTab, setMobileTab] = useState<'plan' | 'worksheet' | 'library' | 'ai'>('plan');
  const [activeSection, setActiveSection] = useState<number | null>(null);
  const [focusedSection, setFocusedSection] = useState(0);
  const [metaOpen, setMetaOpen] = useState(false);
  const [showSelector, setShowSelector] = useState(uuid === 'new');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync when parent PlanEditor resolves plan/lesson after sessionStorage hydration or lesson fetch
  useEffect(() => { if (initialPlan && !plan) setPlan(initialPlan); }, [initialPlan]);
  useEffect(() => {
    if (initialLesson && !lesson) {
      setLesson(initialLesson)
    }
  }, [initialLesson]);

  const sections: LessonSection[] = plan?.sections?.length === 6
    ? plan.sections.map((s, i) => ({ ...s, title: s.title || SECTION_CONFIG[i].title }))
    : buildDefaultSections();

  const scheduleSave = useCallback((updatedPlan: LessonPlan) => {
    setSaveStatus('saving');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/lesson/${updatedPlan.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lesson_id: updatedPlan.lesson_id,
            sections: updatedPlan.sections,
            worksheet: updatedPlan.worksheet,
          }),
        });
        const json = await res.json();
        if (json.data) { setPlan(json.data as LessonPlan); setSaveStatus('saved'); }
      } catch { setSaveStatus('idle'); }
    }, 2000);
  }, []);

  function updateSection(index: number, changes: Partial<LessonSection>) {
    if (!plan) return;
    const updatedSections = sections.map((s, i) => i === index ? { ...s, ...changes } : s);
    const updatedPlan = { ...plan, sections: updatedSections };
    setPlan(updatedPlan);
    scheduleSave(updatedPlan);
  }

  function insertAiContent(sectionIndex: number, data: { teacherInstructions: string; studentInstructions: string }) {
    updateSection(sectionIndex, {
      teacher_instructions: data.teacherInstructions,
      student_instructions: data.studentInstructions,
    });
  }

  function insertLibraryCard(card: LibraryCard, sectionIndex: number) {
    if (!plan) return;
    const s = sections[sectionIndex];
    const materials = s.materials ? `${s.materials}, ${card.type}` : card.type;
    const teacher = s.teacher_instructions
      ? `${s.teacher_instructions}\n${card.teacherInstructions}`
      : card.teacherInstructions;
    const student = s.student_instructions
      ? `${s.student_instructions}\n${card.studentInstructions}`
      : card.studentInstructions;
    updateSection(sectionIndex, { materials, teacher_instructions: teacher, student_instructions: student });
  }

  async function handleExport() {
    if (!plan || exporting) return;
    setExporting(true);
    setExportError(null);
    try {
      const { exportLessonZip } = await import('@/lib/pdf/export');
      await exportLessonZip(plan, lesson);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Export failed.');
    } finally {
      setExporting(false);
    }
  }

  const sectionName = sections[focusedSection]?.title ?? 'Section';
  const totalMin = sections.reduce((sum, s) => sum + (s.timing_minutes || 0), 0);

  function openSectionDrawer(i: number) {
    setActiveSection(i);
    setFocusedSection(i);
  }

  function openAiForSection(i: number) {
    setFocusedSection(i);
    setActiveSection(null);
    setMobileTab('ai');
  }

  return (
    <div style={{
      height: '100dvh', display: 'flex', flexDirection: 'column',
      background: C.cream, fontFamily: SANS, color: C.ink,
      overflow: 'hidden',
    }}>
      <MobileTopBar
        lesson={lesson}
        onOpenSelector={() => setShowSelector(true)}
        onExport={handleExport}
        exporting={exporting}
      />

      {/* Scrollable main area */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 'calc(56px + env(safe-area-inset-bottom) + 8px)' }}>

        {/* Plan tab */}
        {mobileTab === 'plan' && (
          <>
            {exportError && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, margin: '8px 12px 0',
                padding: '10px 12px', background: '#FEF2F2', border: '1px solid #FECACA',
                borderRadius: 8, fontFamily: SANS, fontSize: 12, color: '#991B1B',
              }}>
                <span style={{ flex: 1 }}>Export failed: {exportError}</span>
                <button onClick={() => setExportError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <Icon name="x" size={12} color="#991B1B" />
                </button>
              </div>
            )}
            {/* Collapsed meta banner */}
            <button
              onClick={() => setMetaOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '10px 14px',
                background: C.surface,
                borderBottom: `1px solid ${C.border}`,
                border: 'none', textAlign: 'left', cursor: 'pointer',
              }}
            >
              <div style={{
                width: 6, height: 6, borderRadius: 999, background: C.pink, flexShrink: 0,
              }} />
              <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 500, color: C.ink, flex: 1 }}>
                {lesson ? lesson.dailyLO.slice(0, 50) + (lesson.dailyLO.length > 50 ? '…' : '') : 'Tap to see lesson overview'}
              </span>
              <Icon name="chevronDown" size={14} color={C.faint} />
            </button>

            {/* Plan header */}
            <div style={{ padding: '12px 14px 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: C.ink }}>Lesson structure</span>
              <span style={{ fontFamily: SANS, fontSize: 12, color: C.faint }}>· {totalMin} min</span>
            </div>

            {plan ? (
              <div style={{ padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {sections.map((s, i) => {
                  const color = SECTION_PALETTE[i] ?? C.pink;
                  const hasContent = s.task || s.teacher_instructions || s.student_instructions;
                  return (
                    <div
                      key={i}
                      onClick={() => openSectionDrawer(i)}
                      style={{
                        background: C.surface, borderRadius: 12,
                        border: `1px solid ${C.border}`,
                        borderLeft: `3px solid ${color}`,
                        padding: '12px 12px',
                        cursor: 'pointer',
                        minHeight: 44,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: hasContent ? 4 : 0 }}>
                        <span style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 600, color: C.ink, flex: 1 }}>
                          {s.title}
                        </span>
                        <span style={{
                          fontFamily: SANS, fontSize: 11, color: C.faint,
                          padding: '2px 7px', borderRadius: 999,
                          background: C.cream, border: `1px solid ${C.borderSoft}`,
                        }}>
                          {s.timing_minutes === 0 ? 'Take-home' : `${s.timing_minutes} min`}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); openAiForSection(i); }}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: 30, height: 30, borderRadius: 999,
                            background: C.pinkSoft, border: `1px solid ${C.pinkBorder}`,
                            cursor: 'pointer',
                          }}
                        >
                          <Icon name="sparkle" size={13} color={C.pink} />
                        </button>
                        <Icon name="chevronRight" size={14} color={C.faint2} />
                      </div>
                      {hasContent && (
                        <p style={{
                          fontFamily: SANS, fontSize: 12, color: C.faint,
                          margin: 0, lineHeight: 1.4,
                          overflow: 'hidden', textOverflow: 'ellipsis',
                          display: '-webkit-box', WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical' as const,
                        }}>
                          {s.task || s.teacher_instructions || s.student_instructions}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: 32, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 16,
                  background: C.pinkSoft, border: `1px solid ${C.pinkBorder}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon name="book" size={24} color={C.pink} />
                </div>
                <div>
                  <h2 style={{ fontFamily: SANS, fontSize: 17, fontWeight: 700, color: C.ink, margin: '0 0 8px' }}>No lesson selected</h2>
                  <p style={{ fontFamily: SANS, fontSize: 14, color: C.faint, margin: 0 }}>Choose a lesson to get started.</p>
                </div>
                <button
                  onClick={() => setShowSelector(true)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    height: 44, padding: '0 20px', fontFamily: SANS, fontSize: 14, fontWeight: 600,
                    background: C.pink, color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer',
                  }}
                >
                  <Icon name="calendar" size={16} color="#fff" />Browse lessons
                </button>
              </div>
            )}
          </>
        )}

        {/* Worksheet tab */}
        {mobileTab === 'worksheet' && (
          <WorksheetView
            lesson={lesson}
            initialContent={plan?.worksheet?.instructions ?? ''}
            onSave={(html) => {
              if (!plan) return;
              const up = { ...plan, worksheet: { title: lesson?.dailyLO ?? 'Worksheet', instructions: html, questions: [] } };
              setPlan(up);
              scheduleSave(up);
            }}
          />
        )}

        {/* Library tab */}
        {mobileTab === 'library' && (
          <MobileLibrary onInsert={insertLibraryCard} />
        )}

        {/* AI tab — full-screen conversation */}
        {mobileTab === 'ai' && plan && (
          <div style={{ height: 'calc(100dvh - 52px - calc(56px + env(safe-area-inset-bottom)))', overflow: 'hidden' }}>
            <AiPanel
              lessonId={plan.lesson_id ?? ''}
              focusedSection={focusedSection}
              sectionName={sectionName}
              activeTab="ai"
              onTabChange={() => {}}
              onInsert={insertAiContent}
            />
          </div>
        )}
      </div>

      {/* Bottom tab bar */}
      <BottomTabBar active={mobileTab} onChange={setMobileTab} />

      {/* Section editing drawer */}
      {activeSection !== null && (
        <SectionDrawer
          open
          onClose={() => setActiveSection(null)}
          section={sections[activeSection]}
          onUpdate={(changes) => updateSection(activeSection, changes)}
          onAiClick={() => openAiForSection(activeSection)}
        />
      )}

      {/* Lesson meta drawer */}
      <MetaDrawer lesson={lesson} open={metaOpen} onClose={() => setMetaOpen(false)} />

      {/* Lesson selector */}
      {showSelector && <LessonSelector onClose={() => setShowSelector(false)} />}
    </div>
  );
}
