import React from 'react';
import { Document, Page, View, Text, StyleSheet, Font } from '@react-pdf/renderer';
import type { LessonPlan, LessonSection } from '@/types/lesson';
import type { CurriculumLesson } from '@/types/curriculum';

// Register Sora from Google Fonts static CDN (ttf, CORS-open).
// Falls back gracefully to Helvetica if unavailable at render time.
Font.register({
  family: 'Sora',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/sora/v12/xMQOuFFYT72X5wkB_18qmnndmSdSnk-DkAAAAA.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://fonts.gstatic.com/s/sora/v12/xMQOuFFYT72X5wkB_18qmnndmSdSnk-DiAAAAA.ttf',
      fontWeight: 600,
    },
    {
      src: 'https://fonts.gstatic.com/s/sora/v12/xMQOuFFYT72X5wkB_18qmnndmSdSnk-DjAAAAA.ttf',
      fontWeight: 700,
    },
  ],
});

const PINK  = '#B62A5C';
const CREAM = '#F5EDE5';
const TEAL  = '#1F7A6C';
const INK   = '#1A1A1A';
const FAINT = '#6E6863';
const BORDER = '#E5DDD3';
const BORDER_SOFT = '#EFE8DF';
const PINK_SOFT   = '#FBE9F0';
const PINK_BORDER = '#F0CCD9';
const CREAM_DEEP  = '#EFE5DA';
const TEAL_SOFT   = '#E0F0EC';
const AMBER_SOFT  = '#FBF1DD';
const AMBER       = '#E8A636';

const S = StyleSheet.create({
  page: {
    fontFamily: 'Sora',
    fontSize: 10,
    color: INK,
    backgroundColor: '#FFFFFF',
    paddingTop: 44,
    paddingBottom: 44,
    paddingLeft: 44,
    paddingRight: 44,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingBottom: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: INK,
    borderBottomStyle: 'solid',
  },
  headerLeft: { flex: 1 },
  wordmark: { fontSize: 20, color: PINK, fontWeight: 700, marginBottom: 4 },
  headerTitle: { fontSize: 16, fontWeight: 700, letterSpacing: -0.3, marginBottom: 2 },
  headerSub: { fontSize: 9, color: FAINT },
  headerMeta: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 4,
    minWidth: 120,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaLabel: { fontSize: 8, color: FAINT, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6 },
  metaValue: { fontSize: 9, color: INK, fontWeight: 500 },

  // ── Overview box ──
  overviewBox: {
    borderLeftWidth: 3,
    borderLeftColor: PINK,
    borderLeftStyle: 'solid',
    borderWidth: 1,
    borderColor: BORDER,
    borderStyle: 'solid',
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  overviewTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  overviewBadge: {
    backgroundColor: PINK_SOFT,
    borderWidth: 1, borderColor: PINK_BORDER, borderStyle: 'solid',
    borderRadius: 99, paddingHorizontal: 7, paddingVertical: 2, marginRight: 6,
  },
  overviewBadgeText: { fontSize: 8, color: PINK, fontWeight: 600 },
  overviewLabel: { fontSize: 8, fontWeight: 600, color: FAINT, textTransform: 'uppercase', letterSpacing: 0.6 },
  overviewCols: { flexDirection: 'row', gap: 16 },
  overviewColId: { width: 120 },
  overviewColLo: { flex: 1 },
  overviewColFocus: { width: 160 },
  fieldLabel: { fontSize: 8, fontWeight: 600, color: FAINT, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 3 },
  lessonIdText: { fontSize: 16, fontWeight: 700, letterSpacing: 0.4, marginBottom: 6 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  chip: {
    borderWidth: 1, borderColor: BORDER_SOFT, borderStyle: 'solid',
    borderRadius: 99, paddingHorizontal: 6, paddingVertical: 2,
    backgroundColor: CREAM,
  },
  chipText: { fontSize: 7.5, fontWeight: 500, color: INK },
  chipPink: {
    borderWidth: 1, borderColor: PINK_BORDER, borderStyle: 'solid',
    borderRadius: 99, paddingHorizontal: 6, paddingVertical: 2,
    backgroundColor: PINK_SOFT,
  },
  chipPinkText: { fontSize: 7.5, fontWeight: 500, color: PINK },
  chipAmber: {
    borderWidth: 1, borderColor: '#EFD9A5', borderStyle: 'solid',
    borderRadius: 99, paddingHorizontal: 6, paddingVertical: 2,
    backgroundColor: AMBER_SOFT,
  },
  chipAmberText: { fontSize: 7.5, fontWeight: 500, color: '#7A5A11' },
  loText: { fontSize: 10, fontWeight: 500, lineHeight: 1.5 },

  // ── Section structure label ──
  structureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  structureTitle: { fontSize: 11, fontWeight: 600 },
  structureSub: { fontSize: 9, color: FAINT, marginLeft: 6 },

  // ── Section card ──
  sectionCard: {
    borderWidth: 1,
    borderColor: BORDER,
    borderStyle: 'solid',
    borderRadius: 8,
    marginBottom: 10,
    overflow: 'hidden',
  },
  sectionCardFocused: { borderColor: PINK },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 11,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    borderBottomStyle: 'solid',
    backgroundColor: '#FAFAFA',
  },
  badge: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: CREAM,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  badgeText: { fontSize: 9, fontWeight: 600, color: FAINT },
  sectionTitle: { fontSize: 11, fontWeight: 600, flex: 1 },
  timeChip: {
    fontSize: 8.5, fontWeight: 500, color: FAINT,
    borderWidth: 1, borderColor: BORDER_SOFT, borderStyle: 'solid',
    borderRadius: 99, paddingHorizontal: 7, paddingVertical: 2,
    backgroundColor: CREAM,
  },
  sectionBody: { padding: 12 },
  sectionFieldRow: { marginBottom: 10 },
  bodyText: { fontSize: 9.5, lineHeight: 1.5, color: INK },

  // ── Two-col teacher/student ──
  twoCol: {
    flexDirection: 'row',
    borderWidth: 1, borderColor: BORDER, borderStyle: 'solid',
    borderRadius: 6, overflow: 'hidden',
    marginTop: 4,
  },
  teacherCol: {
    flex: 2,
    padding: 9,
    borderRightWidth: 1, borderRightColor: BORDER, borderRightStyle: 'solid',
    backgroundColor: CREAM_DEEP + '40',
  },
  studentCol: {
    flex: 1,
    padding: 9,
    backgroundColor: TEAL_SOFT + '50',
  },
  colLabel: { fontSize: 7.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 5 },
  bulletItem: { fontSize: 9, lineHeight: 1.5, marginBottom: 2 },

  // ── Footer ──
  footer: {
    position: 'absolute',
    bottom: 28,
    left: 44,
    right: 44,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: BORDER,
    borderTopStyle: 'solid',
    paddingTop: 6,
  },
  footerText: { fontSize: 8, color: FAINT },
});

function timingLabel(min: number) {
  if (min === 0) return 'Take-home';
  return `${min} min`;
}

function SectionCard({ index, section }: { index: number; section: LessonSection }) {
  const hasContent = section.task || section.teacher_instructions || section.student_instructions;
  const teacherLines = section.teacher_instructions?.split('\n').filter(Boolean) ?? [];
  const studentLines = section.student_instructions?.split('\n').filter(Boolean) ?? [];
  const materials    = section.materials ? section.materials.split(',').map((m) => m.trim()).filter(Boolean) : [];

  return (
    <View style={S.sectionCard} wrap={false}>
      {/* Header */}
      <View style={S.sectionHeader}>
        <View style={S.badge}>
          <Text style={S.badgeText}>{String(index + 1).padStart(2, '0')}</Text>
        </View>
        <Text style={S.sectionTitle}>{section.title}</Text>
        <Text style={S.timeChip}>{timingLabel(section.timing_minutes)}</Text>
      </View>

      {hasContent && (
        <View style={S.sectionBody}>
          {/* Task */}
          {!!section.task && (
            <View style={S.sectionFieldRow}>
              <Text style={S.fieldLabel}>Task</Text>
              <Text style={S.bodyText}>{section.task}</Text>
            </View>
          )}

          {/* Materials */}
          {materials.length > 0 && (
            <View style={S.sectionFieldRow}>
              <Text style={S.fieldLabel}>Materials</Text>
              <View style={S.chipRow}>
                {materials.map((m, i) => (
                  <View key={i} style={S.chip}>
                    <Text style={S.chipText}>{m}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Teacher / Students two-column */}
          {(teacherLines.length > 0 || studentLines.length > 0) && (
            <View style={S.twoCol}>
              <View style={S.teacherCol}>
                <Text style={[S.colLabel, { color: PINK }]}>Teacher Does</Text>
                {teacherLines.map((l, i) => (
                  <Text key={i} style={S.bulletItem}>• {l}</Text>
                ))}
              </View>
              <View style={S.studentCol}>
                <Text style={[S.colLabel, { color: TEAL }]}>Students Do</Text>
                {studentLines.map((l, i) => (
                  <Text key={i} style={S.bulletItem}>• {l}</Text>
                ))}
              </View>
            </View>
          )}
        </View>
      )}

      {/* Empty state */}
      {!hasContent && (
        <View style={{ padding: '8px 12px 12px 42px' }}>
          <Text style={{ fontSize: 9, color: FAINT }}>No content yet</Text>
        </View>
      )}
    </View>
  );
}

interface Props {
  plan: LessonPlan;
  lesson: CurriculumLesson | null;
  teacherName?: string;
  date?: string;
}

export function LessonPlanPDF({ plan, lesson, teacherName = 'Teacher', date }: Props) {
  const totalMin = plan.sections.reduce((sum, s) => sum + (s.timing_minutes ?? 0), 0);
  const today = date ?? new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <Document title={`Alsama Lesson Plan – ${lesson?.id ?? plan.lesson_id}`} author="Alsama Project">
      <Page size="A4" style={S.page}>

        {/* ── Page header ── */}
        <View style={S.header} fixed>
          <View style={S.headerLeft}>
            <Text style={S.wordmark}>Alsama</Text>
            <Text style={S.headerTitle}>
              {lesson?.dailyLO ?? plan.lesson_id}
            </Text>
            <Text style={S.headerSub}>
              {[lesson?.year, lesson?.week != null && `Week ${lesson.week}`, lesson?.period]
                .filter(Boolean)
                .join(' · ')}
            </Text>
          </View>
          <View style={S.headerMeta}>
            <View style={S.metaRow}>
              <Text style={S.metaLabel}>Lesson ID</Text>
              <Text style={S.metaValue}>{plan.lesson_id}</Text>
            </View>
            <View style={S.metaRow}>
              <Text style={S.metaLabel}>Teacher</Text>
              <Text style={S.metaValue}>{teacherName}</Text>
            </View>
            <View style={S.metaRow}>
              <Text style={S.metaLabel}>Date</Text>
              <Text style={S.metaValue}>{today}</Text>
            </View>
            <View style={S.metaRow}>
              <Text style={S.metaLabel}>Duration</Text>
              <Text style={S.metaValue}>{totalMin} min</Text>
            </View>
          </View>
        </View>

        {/* ── Lesson overview ── */}
        {lesson && (
          <View style={S.overviewBox}>
            <View style={S.overviewTopRow}>
              <View style={S.overviewBadge}>
                <Text style={S.overviewBadgeText}>From curriculum</Text>
              </View>
              <Text style={[S.overviewLabel, { marginLeft: 6 }]}>Lesson overview</Text>
            </View>

            <View style={S.overviewCols}>
              {/* ID block */}
              <View style={S.overviewColId}>
                <Text style={S.fieldLabel}>Lesson ID</Text>
                <Text style={S.lessonIdText}>{lesson.id}</Text>
                <View style={S.chipRow}>
                  <View style={S.chipPink}><Text style={S.chipPinkText}>{lesson.year}</Text></View>
                  {lesson.week != null && (
                    <View style={S.chip}><Text style={S.chipText}>Week {lesson.week}</Text></View>
                  )}
                  <View style={S.chip}><Text style={S.chipText}>{lesson.period}</Text></View>
                </View>
              </View>

              {/* Daily LO */}
              <View style={S.overviewColLo}>
                <Text style={S.fieldLabel}>Daily Learning Objective</Text>
                <Text style={S.loText}>{lesson.dailyLO}</Text>
              </View>

              {/* Focus & Theme */}
              <View style={S.overviewColFocus}>
                {(lesson.grammarFocus || lesson.vocabFocus) && (
                  <View style={{ marginBottom: 8 }}>
                    <Text style={S.fieldLabel}>Grammar / Vocab</Text>
                    <Text style={{ fontSize: 9, lineHeight: 1.4 }}>
                      {[lesson.grammarFocus, lesson.vocabFocus].filter(Boolean).join(' · ')}
                    </Text>
                  </View>
                )}
                {lesson.theme && (
                  <View>
                    <Text style={S.fieldLabel}>Theme</Text>
                    <View style={S.chipAmber}>
                      <Text style={S.chipAmberText}>{lesson.theme}</Text>
                    </View>
                  </View>
                )}
                {lesson.linguisticSkill && (
                  <View style={{ marginTop: 8 }}>
                    <Text style={S.fieldLabel}>Skill</Text>
                    <Text style={{ fontSize: 9 }}>{lesson.linguisticSkill}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {/* ── Lesson structure label ── */}
        <View style={S.structureRow}>
          <Text style={S.structureTitle}>Lesson structure</Text>
          <Text style={S.structureSub}>· {totalMin} min · {plan.sections.length} sections</Text>
        </View>

        {/* ── Six section cards ── */}
        {plan.sections.map((section, i) => (
          <SectionCard key={i} index={i} section={section} />
        ))}

        {/* ── Footer ── */}
        <View style={S.footer} fixed>
          <Text style={S.footerText}>
            Alsama Project · Lesson Plan · {plan.lesson_id}
          </Text>
          <Text style={S.footerText} render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          } />
        </View>
      </Page>
    </Document>
  );
}
