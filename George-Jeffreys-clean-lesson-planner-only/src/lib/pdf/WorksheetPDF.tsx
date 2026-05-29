import React from 'react';
import { Document, Page, View, Text, StyleSheet, Font } from '@react-pdf/renderer';
import type { LessonPlan } from '@/types/lesson';
import type { CurriculumLesson } from '@/types/curriculum';

// Re-use the Sora registration (safe to call multiple times).
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

const PINK        = '#B62A5C';
const CREAM       = '#F5EDE5';
const INK         = '#1A1A1A';
const FAINT       = '#6E6863';
const BORDER      = '#E5DDD3';
const BORDER_SOFT = '#EFE8DF';
const PINK_SOFT   = '#FBE9F0';
const PINK_BORDER = '#F0CCD9';
const CREAM_DEEP  = '#EFE5DA';

const S = StyleSheet.create({
  page: {
    fontFamily: 'Sora',
    fontSize: 10,
    color: INK,
    backgroundColor: '#FFFFFF',
    paddingTop: 44,
    paddingBottom: 52,
    paddingLeft: 52,
    paddingRight: 52,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingBottom: 14,
    borderBottomWidth: 2,
    borderBottomColor: INK,
    borderBottomStyle: 'solid',
    marginBottom: 20,
  },
  headerLeft: { flex: 1 },
  wordmark: { fontSize: 18, color: PINK, fontWeight: 700, marginBottom: 4 },
  headerSub: { fontSize: 8.5, color: FAINT, marginBottom: 6 },
  headerTitle: { fontSize: 18, fontWeight: 700, letterSpacing: -0.3, marginBottom: 3 },
  headerMeta: { fontSize: 9, color: FAINT },
  nameBox: {
    borderWidth: 1, borderColor: BORDER, borderStyle: 'solid',
    borderRadius: 5, padding: 10, minWidth: 160,
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  nameLabel: { fontSize: 9, color: FAINT, marginRight: 6 },
  nameLine: { flex: 1, borderBottomWidth: 1, borderBottomColor: INK, borderBottomStyle: 'solid', height: 14 },

  // ── Exercise section ──
  exerciseSection: { marginBottom: 18 },
  exerciseHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  exerciseNumBadge: {
    width: 20, height: 20, borderRadius: 99,
    backgroundColor: PINK,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 8,
  },
  exerciseNumText: { fontSize: 10, fontWeight: 700, color: '#ffffff' },
  exerciseTitle: { fontSize: 12, fontWeight: 600, flex: 1 },
  exerciseHint: { fontSize: 9, color: FAINT },

  // ── Matching exercise ──
  matchGrid: { flexDirection: 'row', alignItems: 'stretch' },
  matchCol: { flex: 1 },
  matchConnectorCol: { width: 24, alignItems: 'center', justifyContent: 'center' },
  matchCell: {
    borderWidth: 1, borderColor: INK, borderStyle: 'solid',
    padding: 9, fontSize: 11,
  },
  matchCellRight: { color: FAINT },
  matchDot: { width: 6, height: 6, borderRadius: 99, backgroundColor: INK },

  // ── Fill-in-the-blank ──
  fillRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12 },
  fillNum: { fontSize: 11, fontWeight: 500, width: 16 },
  fillText: { fontSize: 11.5, lineHeight: 1.8 },
  fillBlank: {
    borderBottomWidth: 1.5, borderBottomColor: INK, borderBottomStyle: 'solid',
    width: 90, height: 18, marginHorizontal: 4,
  },

  // ── Word bank ──
  wordBank: {
    borderWidth: 1.5, borderColor: PINK, borderStyle: 'dashed',
    borderRadius: 7, padding: 10,
    backgroundColor: PINK_SOFT + '60',
    marginTop: 14,
  },
  wordBankLabel: {
    fontSize: 8, fontWeight: 600, color: PINK,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4,
  },
  wordBankText: { fontSize: 12, fontWeight: 600, letterSpacing: 1.2 },

  // ── Free writing lines ──
  writingLine: {
    borderBottomWidth: 1, borderBottomColor: INK, borderBottomStyle: 'solid',
    height: 28, marginBottom: 14,
  },

  // ── Activities section (from lesson plan) ──
  activityCard: {
    borderWidth: 1, borderColor: BORDER, borderStyle: 'solid',
    borderRadius: 6, padding: 10, marginBottom: 8,
  },
  activityHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  activityBadge: {
    width: 18, height: 18, borderRadius: 4,
    backgroundColor: CREAM, alignItems: 'center', justifyContent: 'center',
    marginRight: 6,
  },
  activityBadgeText: { fontSize: 8, fontWeight: 600, color: FAINT },
  activityTitle: { fontSize: 10, fontWeight: 600, flex: 1 },
  activityTime: {
    fontSize: 8, color: FAINT, paddingHorizontal: 6, paddingVertical: 2,
    borderWidth: 1, borderColor: BORDER_SOFT, borderStyle: 'solid', borderRadius: 99,
    backgroundColor: CREAM,
  },
  activityTask: { fontSize: 9, color: FAINT, lineHeight: 1.4, marginBottom: 8 },
  spacesLabel: { fontSize: 7.5, fontWeight: 600, color: FAINT, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  writingSpace: {
    height: 24,
    borderBottomWidth: 1, borderBottomColor: BORDER, borderBottomStyle: 'solid',
    marginBottom: 6,
  },
  writingSpaceFirst: { marginTop: 4 },

  // ── Footer ──
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 52,
    right: 52,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1, borderTopColor: BORDER, borderTopStyle: 'solid',
    paddingTop: 6,
  },
  footerText: { fontSize: 8, color: FAINT },
});

interface Props {
  plan: LessonPlan;
  lesson: CurriculumLesson | null;
  date?: string;
}

const MATCH_PAIRS: [string, string][] = [
  ['What is your name?',   'My name is Layla.'],
  ['How old are you?',     "I'm fine, thank you."],
  ['Where are you from?',  "I'm 12 years old."],
  ['How are you?',         "I'm from Aleppo."],
];

const FILL_SENTENCES: [string, string][] = [
  ['Hello, ',   ' name is Layla.'],
  ['I ',        ' from Syria.'],
  ['How ',      ' you? I am fine.'],
  ['What ',     ' your name?'],
];

export function WorksheetPDF({ plan, lesson, date }: Props) {
  const today   = date ?? new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const title   = lesson?.dailyLO ?? plan.lesson_id;
  const yearLabel   = lesson?.year ?? '';
  const weekLabel   = lesson?.week != null ? `Week ${lesson.week}` : '';
  const periodLabel = lesson?.period ?? '';
  const lessonId    = plan.lesson_id;

  // Collect sections that have student instructions for activity spaces
  const activitySections = plan.sections.filter((s) => s.task || s.student_instructions);

  return (
    <Document title={`Alsama Worksheet – ${lessonId}`} author="Alsama Project">
      <Page size="A4" style={S.page}>

        {/* ── Header ── */}
        <View style={S.header}>
          <View style={S.headerLeft}>
            <Text style={S.wordmark}>Alsama</Text>
            <Text style={S.headerSub}>{[yearLabel, 'English'].filter(Boolean).join(' · ')}</Text>
            <Text style={S.headerTitle}>{title}</Text>
            <Text style={S.headerMeta}>
              {[weekLabel, periodLabel, lessonId].filter(Boolean).join(' · ')}
            </Text>
          </View>
          <View style={S.nameBox}>
            <View style={S.nameRow}>
              <Text style={S.nameLabel}>Name:</Text>
              <View style={S.nameLine} />
            </View>
            <View style={S.nameRow}>
              <Text style={S.nameLabel}>Date:</Text>
              <View style={S.nameLine} />
            </View>
          </View>
        </View>

        {/* ── Exercise 1 — Matching ── */}
        <View style={S.exerciseSection}>
          <View style={S.exerciseHeader}>
            <View style={S.exerciseNumBadge}><Text style={S.exerciseNumText}>1</Text></View>
            <Text style={S.exerciseTitle}>Match the question with the answer.</Text>
            <Text style={S.exerciseHint}>Draw a line ➝</Text>
          </View>
          <View style={S.matchGrid}>
            <View style={S.matchCol}>
              {MATCH_PAIRS.map(([q], i) => (
                <View key={i} style={S.matchCell}><Text>{q}</Text></View>
              ))}
            </View>
            <View style={S.matchConnectorCol}>
              {MATCH_PAIRS.map((_, i) => (
                <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                  <View style={S.matchDot} />
                </View>
              ))}
            </View>
            <View style={S.matchCol}>
              {MATCH_PAIRS.map(([, a], i) => (
                <View key={i} style={[S.matchCell, S.matchCellRight]}><Text>{a}</Text></View>
              ))}
            </View>
          </View>
        </View>

        {/* ── Exercise 2 — Fill in the blanks ── */}
        <View style={S.exerciseSection}>
          <View style={S.exerciseHeader}>
            <View style={S.exerciseNumBadge}><Text style={S.exerciseNumText}>2</Text></View>
            <Text style={S.exerciseTitle}>Complete the sentences.</Text>
          </View>
          {FILL_SENTENCES.map(([before, after], i) => (
            <View key={i} style={S.fillRow}>
              <Text style={S.fillNum}>{i + 1}.</Text>
              <Text style={S.fillText}>{before}</Text>
              <View style={S.fillBlank} />
              <Text style={S.fillText}>{after}</Text>
            </View>
          ))}
          <View style={S.wordBank}>
            <Text style={S.wordBankLabel}>Word bank</Text>
            <Text style={S.wordBankText}>am  ·  my  ·  are  ·  is  ·  how</Text>
          </View>
        </View>

        {/* ── Exercise 3 — Introduce yourself ── */}
        <View style={S.exerciseSection}>
          <View style={S.exerciseHeader}>
            <View style={S.exerciseNumBadge}><Text style={S.exerciseNumText}>3</Text></View>
            <Text style={S.exerciseTitle}>Introduce yourself. Write 3 sentences.</Text>
          </View>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={S.writingLine} />
          ))}
        </View>

        {/* ── Activity spaces (one per lesson section that has content) ── */}
        {activitySections.length > 0 && (
          <View style={S.exerciseSection}>
            <View style={S.exerciseHeader}>
              <View style={S.exerciseNumBadge}><Text style={S.exerciseNumText}>4</Text></View>
              <Text style={S.exerciseTitle}>Class activities — your notes</Text>
            </View>
            {activitySections.slice(0, 4).map((section, i) => (
              <View key={i} style={S.activityCard} wrap={false}>
                <View style={S.activityHeader}>
                  <View style={S.activityBadge}>
                    <Text style={S.activityBadgeText}>{String(i + 1).padStart(2, '0')}</Text>
                  </View>
                  <Text style={S.activityTitle}>{section.title}</Text>
                  {section.timing_minutes > 0 && (
                    <Text style={S.activityTime}>{section.timing_minutes} min</Text>
                  )}
                </View>
                {!!section.task && (
                  <Text style={S.activityTask}>{section.task}</Text>
                )}
                {/* Writing space */}
                <Text style={S.spacesLabel}>Your answer:</Text>
                {[0, 1].map((j) => (
                  <View key={j} style={[S.writingSpace, j === 0 ? S.writingSpaceFirst : {}]} />
                ))}
              </View>
            ))}
          </View>
        )}

        {/* ── Footer ── */}
        <View style={S.footer} fixed>
          <Text style={S.footerText}>
            Alsama · {yearLabel} · {weekLabel} · Student Worksheet
          </Text>
          <Text style={S.footerText} render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          } />
        </View>
      </Page>
    </Document>
  );
}
