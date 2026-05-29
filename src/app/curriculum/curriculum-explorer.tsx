'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import {
  CeShell, CeTopBar, CeModeTabs, CeRightSidebar,
  type CeMode,
} from '@/components/curriculum/ce-shell';
import { CalendarLeft, MonthView, WeekView, YearOverview } from '@/components/curriculum/ce-calendar';
import {
  JourneyLeft, JourneyOrgChart,
  type SkillLO, type KnowledgeLO,
} from '@/components/curriculum/ce-journey';
import {
  ContentLeft, ContentGrid,
  type SkillData, type ThemeData,
} from '@/components/curriculum/ce-content';
import type { CurriculumLesson } from '@/types/curriculum';
import type { CurriculumYearData } from '@/lib/curriculum-actions';
import {
  fetchCurriculumYearData,
  fetchLessonsForWeek,
  fetchKnowledgeLOs,
} from '@/lib/curriculum-actions';
import { getLessonsByYear } from '@/lib/curriculumUtils';

interface Props {
  initialYear: number;
  initialYearData: CurriculumYearData;
}

export function CurriculumExplorer({ initialYear, initialYearData }: Props) {
  const [year, setYear]           = useState(initialYear);
  const [yearData, setYearData]   = useState(initialYearData);
  const [mode, setMode]           = useState<CeMode>('calendar');
  const [search, setSearch]       = useState('');

  // Calendar state
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek]   = useState<number | null>(null);
  const [weekLessons, setWeekLessons]     = useState<Map<number, CurriculumLesson[]>>(new Map());

  // Journey state
  const [focusedSkillRef, setFocusedSkillRef]     = useState<string | null>(null);
  const [focusedKRef, setFocusedKRef]             = useState<string | null>(null);
  const [klosBySkill, setKlosBySkill]             = useState<Map<string, KnowledgeLO[]>>(new Map());

  // Track which skill KLO loads have been requested (avoids re-fetching when klosBySkill updates)
  const klosRequested = useRef(new Set<string>());

  // Content state
  const [focusedSkill, setFocusedSkill]   = useState<string | null>(null);
  const [focusedTheme, setFocusedTheme]   = useState<string | null>(null);

  // All lessons for the year (client-side)
  const allLessons = useMemo(() => getLessonsByYear(year), [year]);

  // Themes for focused skill (content mode)
  const themesForSkill = useMemo(() => {
    if (!focusedSkill) return yearData.themes as ThemeData[];
    const skillLessons = allLessons.filter(l => l.linguisticSkill === focusedSkill);
    const counts = new Map<string, number>();
    skillLessons.forEach(l => { if (l.theme) counts.set(l.theme, (counts.get(l.theme) ?? 0) + 1); });
    return [...counts.entries()].map(([theme, count]) => ({ theme, count })).sort((a, b) => b.count - a.count);
  }, [focusedSkill, allLessons, yearData.themes]);

  // Lessons for focused theme (content lesson tier)
  const themeLessons = useMemo(() => {
    if (!focusedTheme) return [];
    return allLessons.filter(l => l.theme === focusedTheme && (!focusedSkill || l.linguisticSkill === focusedSkill));
  }, [focusedTheme, focusedSkill, allLessons]);

  // Themes-by-skill map for left nav
  const themesBySkill = useMemo(() => {
    const m = new Map<string, ThemeData[]>();
    const skills = [...new Set(allLessons.map(l => l.linguisticSkill).filter(Boolean))];
    skills.forEach(sk => {
      const skLessons = allLessons.filter(l => l.linguisticSkill === sk);
      const counts = new Map<string, number>();
      skLessons.forEach(l => { if (l.theme) counts.set(l.theme, (counts.get(l.theme) ?? 0) + 1); });
      m.set(sk, [...counts.entries()].map(([theme, count]) => ({ theme, count })).sort((a, b) => b.count - a.count));
    });
    return m;
  }, [allLessons]);

  // Reset on year change
  useEffect(() => {
    if (year === initialYear) return;
    let cancelled = false;
    klosRequested.current = new Set();
    fetchCurriculumYearData(year).then(data => {
      if (!cancelled) {
        setYearData(data);
        setSelectedMonth(null); setSelectedWeek(null); setWeekLessons(new Map());
        setFocusedSkillRef(null); setFocusedKRef(null); setKlosBySkill(new Map());
        setFocusedSkill(null); setFocusedTheme(null);
      }
    });
    return () => { cancelled = true; };
  }, [year, initialYear]);

  // Load week lessons
  useEffect(() => {
    if (selectedWeek === null || weekLessons.has(selectedWeek)) return;
    fetchLessonsForWeek(year, selectedWeek).then(lessons => {
      setWeekLessons(prev => { const next = new Map(prev); next.set(selectedWeek, lessons); return next; });
    });
  }, [selectedWeek, year, weekLessons]);

  // Pre-load all weeks for month overview
  useEffect(() => {
    if (!selectedMonth) return;
    const monthData = yearData.months.find(m => m.month === selectedMonth);
    if (!monthData) return;
    monthData.weeks.forEach(w => {
      if (!weekLessons.has(w)) {
        fetchLessonsForWeek(year, w).then(lessons => {
          setWeekLessons(prev => { const next = new Map(prev); next.set(w, lessons); return next; });
        });
      }
    });
  }, [selectedMonth, year, yearData.months, weekLessons]);

  // Fix #1 — pre-load ALL skill KLOs when in journey mode so the full tree is visible
  useEffect(() => {
    if (mode !== 'journey') return;
    (yearData.skillLOs as SkillLO[]).forEach(s => {
      const key = `${year}:${s.ref}`;
      if (klosRequested.current.has(key)) return;
      klosRequested.current.add(key);
      fetchKnowledgeLOs(year, s.ref).then(klos => {
        setKlosBySkill(prev => { const next = new Map(prev); next.set(s.ref, klos); return next; });
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, year, yearData.skillLOs]);

  function handleFocusSkill(ref: string | null) {
    setFocusedSkillRef(ref);
    setFocusedKRef(null);
  }

  function renderLeft() {
    if (mode === 'calendar') {
      return (
        <CalendarLeft
          months={yearData.months}
          selectedMonth={selectedMonth}
          selectedWeek={selectedWeek}
          onSelectMonth={m => { setSelectedMonth(m); setSelectedWeek(null); }}
          onSelectWeek={w => setSelectedWeek(w)}
        />
      );
    }
    if (mode === 'journey') {
      return (
        <JourneyLeft
          year={year}
          totalLessons={yearData.totalLessons}
          skillLOs={yearData.skillLOs as SkillLO[]}
          focusedSkillRef={focusedSkillRef}
          expandedSkillRef={focusedSkillRef}
          focusedKRef={focusedKRef}
          klosBySkill={klosBySkill}
          onFocusSkill={handleFocusSkill}
          onFocusKRef={setFocusedKRef}
        />
      );
    }
    return (
      <ContentLeft
        year={year}
        totalLessons={yearData.totalLessons}
        skillBreakdown={yearData.skillBreakdown as SkillData[]}
        themes={yearData.themes as ThemeData[]}
        focusedSkill={focusedSkill}
        focusedTheme={focusedTheme}
        themesBySkill={themesBySkill}
        onFocusSkill={s => { setFocusedSkill(s); setFocusedTheme(null); }}
        onFocusTheme={setFocusedTheme}
      />
    );
  }

  function renderMain() {
    if (mode === 'calendar') {
      if (selectedWeek !== null && selectedMonth) {
        const month = yearData.months.find(m => m.weeks.includes(selectedWeek))?.month ?? selectedMonth;
        return (
          <WeekView
            week={selectedWeek}
            month={month}
            lessons={weekLessons.get(selectedWeek) ?? []}
            onBack={() => setSelectedWeek(null)}
          />
        );
      }
      if (selectedMonth) {
        const monthData = yearData.months.find(m => m.month === selectedMonth);
        return (
          <MonthView
            month={selectedMonth}
            weeks={monthData?.weeks ?? []}
            weekLessons={weekLessons}
            onSelectWeek={w => setSelectedWeek(w)}
          />
        );
      }
      return <YearOverview months={yearData.months} onSelectMonth={m => setSelectedMonth(m)} />;
    }

    if (mode === 'journey') {
      return (
        <JourneyOrgChart
          skillLOs={yearData.skillLOs as SkillLO[]}
          klosBySkill={klosBySkill}
          allLessons={allLessons}
          focusedSkillRef={focusedSkillRef}
          focusedKRef={focusedKRef}
          totalLessons={yearData.totalLessons}
          year={year}
          onFocusSkill={handleFocusSkill}
          onFocusKRef={setFocusedKRef}
        />
      );
    }

    // Content mode — simple lesson card grid (Fix #4)
    return (
      <ContentGrid
        lessons={themeLessons}
        focusedSkill={focusedSkill}
        focusedTheme={focusedTheme}
        skillBreakdown={yearData.skillBreakdown as SkillData[]}
        themes={themesForSkill}
      />
    );
  }

  return (
    <CeShell
      topBar={<CeTopBar year={year} search={search} onYearChange={setYear} onSearchChange={setSearch} />}
      modeTabs={<CeModeTabs mode={mode} onModeChange={m => { setMode(m); setSearch(''); }} totalLessons={yearData.totalLessons} />}
      leftPanel={renderLeft()}
      main={renderMain()}
      rightSidebar={
        <CeRightSidebar
          year={year}
          totalLessons={yearData.totalLessons}
          totalWeeks={yearData.totalWeeks}
          skillBreakdown={yearData.skillBreakdown as SkillData[]}
          themes={yearData.themes as ThemeData[]}
        />
      }
    />
  );
}
