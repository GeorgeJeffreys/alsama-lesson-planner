'use client';

import { useState, useRef, useMemo, useCallback, useEffect, useLayoutEffect } from 'react';
import { useRouter } from 'next/navigation';
import { C, SANS } from '@/lib/tokens';
import { Icon } from '@/components/icon';
import {
  CeLeftPanel, NavRow, Chip, Label, HiBtn,
  ZoomControls, SKILL_COLOR, skillKey,
} from './ce-shell';
import type { CurriculumLesson } from '@/types/curriculum';

export interface SkillLO { ref: string; lo: string; skill: string; count: number }
export interface KnowledgeLO { ref: string; lo: string; count: number; weeks: number[] }

// ── Dashed vertical connector ─────────────────────────────────────────────────

function TreeConnector({ height = 24 }: { height?: number }) {
  return (
    <div style={{
      width: 2, height,
      flexShrink: 0,
      background: 'repeating-linear-gradient(to bottom, #D8CECC 0, #D8CECC 4px, transparent 4px, transparent 8px)',
    }} />
  );
}

// ── Cards ─────────────────────────────────────────────────────────────────────

function RootCard({ totalLessons, year }: { totalLessons: number; year: number }) {
  const lo = `By the end of Year ${year}, students will communicate confidently, read and write short familiar texts, and recognise themselves as learners.`;
  return (
    <div style={{
      width: 540,
      background: `linear-gradient(135deg, ${C.pink}, #8E1F49)`,
      color: '#fff', borderRadius: 14,
      padding: '14px 22px',
      boxShadow: '0 12px 28px rgba(182,42,92,0.24),0 4px 8px rgba(182,42,92,0.14)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', right: -20, top: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '3px 8px', borderRadius: 999,
        background: 'rgba(255,255,255,0.18)',
        fontFamily: SANS, fontSize: 10, fontWeight: 600,
        letterSpacing: '0.08em', textTransform: 'uppercase', color: '#fff',
      }}>
        <Icon name="target" size={11} color="#fff" /> Total LO · Year {year}
      </div>
      <p style={{
        fontFamily: SANS, fontSize: 14.5, color: '#fff', marginTop: 6, lineHeight: 1.4,
        fontWeight: 600, letterSpacing: '-0.005em',
        overflow: 'hidden', wordBreak: 'break-word',
        display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
      } as React.CSSProperties}>
        {lo}
      </p>
      <span style={{
        fontFamily: SANS, fontSize: 10, color: 'rgba(255,255,255,0.6)',
        display: 'block', marginTop: 6,
      }}>{totalLessons} lessons total</span>
    </div>
  );
}

function SkillCard({ s, focused, faded, onClick }: {
  s: SkillLO; focused?: boolean; faded?: boolean; onClick: () => void;
}) {
  const col = SKILL_COLOR[skillKey(s.skill)];
  return (
    <div
      onClick={onClick}
      style={{
        width: 200, background: '#FFFFFF',
        border: `2px solid ${focused ? C.pink : '#E5DDD3'}`,
        borderRadius: 12, padding: 10,
        opacity: faded ? 0.3 : 1,
        boxShadow: focused
          ? `0 0 0 3px ${C.pinkSoft},0 6px 18px rgba(56,30,30,0.06)`
          : '0 1px 0 rgba(56,30,30,0.02)',
        display: 'flex', flexDirection: 'column', position: 'relative',
        cursor: 'pointer', overflow: 'hidden',
        transition: 'opacity 0.15s, border-color 0.15s, box-shadow 0.15s',
        flexShrink: 0,
      }}
    >
      <span style={{
        fontFamily: SANS, fontSize: 9, fontWeight: 700, color: '#6E6863',
        textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block',
      }}>
        {s.skill || col.label}
      </span>
      <span style={{
        fontFamily: SANS, fontSize: 10, fontWeight: 700,
        color: col.fg, background: col.bg,
        padding: '1px 5px', borderRadius: 4,
        alignSelf: 'flex-start', marginTop: 2,
      }}>
        {s.ref}
      </span>
      <span style={{
        fontFamily: SANS, fontSize: 10.5, color: C.ink, lineHeight: 1.35,
        display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
        overflow: 'hidden', wordBreak: 'break-word',
        flex: 1, marginTop: 4,
      } as React.CSSProperties}>
        {s.lo}
      </span>
      <div style={{
        marginTop: 4, paddingTop: 6, borderTop: `1px dashed ${C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontFamily: SANS, fontSize: 10, color: '#6E6863' }}>{s.count} lessons</span>
        {focused
          ? <Chip tone="pink" size="sm" style={{ height: 16, fontSize: 9.5 }}>Focus</Chip>
          : <Icon name="chevronDown" size={11} color={C.faint2} />
        }
      </div>
    </div>
  );
}

function KloCard({ k, focused, faded, onClick }: {
  k: KnowledgeLO; focused?: boolean; faded?: boolean; onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        width: 190,
        background: C.amberSoft, border: `2px solid ${focused ? '#E8A636' : '#EFD9A5'}`,
        borderRadius: 12, padding: '8px 10px',
        opacity: faded ? 0.3 : 1,
        boxShadow: focused ? '0 0 0 3px rgba(232,166,54,0.18)' : 'none',
        display: 'flex', flexDirection: 'column', gap: 3,
        cursor: 'pointer', overflow: 'hidden',
        transition: 'opacity 0.15s, border-color 0.15s',
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Chip tone="amber" size="sm" style={{ height: 16, fontSize: 9.5 }}>{k.ref}</Chip>
        {focused && (
          <span style={{
            fontFamily: SANS, fontSize: 9, color: '#7A5A11',
            fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>Focus</span>
        )}
      </div>
      <span style={{
        fontFamily: SANS, fontSize: 11, fontWeight: 600, lineHeight: 1.25,
        display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
        overflow: 'hidden', wordBreak: 'break-word',
      } as React.CSSProperties}>
        {k.lo}
      </span>
      <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginTop: 'auto' }}>
        {k.weeks.slice(0, 4).map(wk => (
          <span key={wk} style={{
            fontFamily: SANS, fontSize: 9.5, color: C.faint,
            background: 'rgba(255,255,255,0.6)', padding: '0 4px', borderRadius: 3,
          }}>Wk {wk}</span>
        ))}
      </div>
    </div>
  );
}

function DailyChip({ lesson, onClick }: {
  lesson: CurriculumLesson; onClick: () => void;
}) {
  const [hover, setHover] = useState(false);
  const words = lesson.dailyLO.split(/\s+/);
  const preview = words.slice(0, 6).join(' ') + (words.length > 6 ? '…' : '');
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 160, background: '#FFFFFF',
        border: `1px solid ${hover ? C.pink : '#E5DDD3'}`,
        borderRadius: 8, padding: '5px 8px',
        display: 'flex', flexDirection: 'column', gap: 2,
        boxShadow: hover ? '0 4px 12px rgba(56,30,30,0.1)' : '0 1px 0 rgba(56,30,30,0.02)',
        cursor: 'pointer', transition: 'all 0.12s',
        flexShrink: 0,
      }}
    >
      <span style={{
        fontFamily: SANS, fontSize: 9, fontWeight: 700,
        color: C.faint, fontVariantNumeric: 'tabular-nums',
      }}>{lesson.id}</span>
      <span style={{
        fontFamily: SANS, fontSize: 10.5, color: C.ink, lineHeight: 1.3,
        overflow: 'hidden', display: '-webkit-box',
        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        wordBreak: 'break-word',
      } as React.CSSProperties}>{preview}</span>
    </div>
  );
}

// ── Lesson Modal ──────────────────────────────────────────────────────────────

function LessonModal({ lesson, onClose }: { lesson: CurriculumLesson; onClose: () => void }) {
  const router = useRouter();
  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100,
      }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 101, background: '#fff', borderRadius: 16,
        padding: '28px 28px 24px',
        width: 480, maxWidth: '90vw', maxHeight: '80vh', overflowY: 'auto',
        boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 12, right: 12,
          width: 28, height: 28, borderRadius: 999,
          border: `1px solid ${C.border}`, background: C.cream,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="x" size={14} color={C.faint} />
        </button>

        <Chip tone="pink" size="sm">{lesson.id}</Chip>

        <p style={{
          fontFamily: SANS, fontSize: 15, fontWeight: 600, color: C.ink,
          lineHeight: 1.5, margin: '12px 0 16px',
        }}>{lesson.dailyLO}</p>

        {lesson.knowledgeLO && (
          <div style={{ marginBottom: 12 }}>
            <Label>Knowledge LO</Label>
            <p style={{
              fontFamily: SANS, fontSize: 12.5, color: C.ink,
              margin: '4px 0 0', lineHeight: 1.45,
            }}>{lesson.knowledgeLO}</p>
          </div>
        )}

        {(lesson.grammarFocus || lesson.vocabFocus) && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
            {lesson.grammarFocus && (
              <div style={{
                background: C.cream, border: `1px solid ${C.border}`,
                borderRadius: 8, padding: '8px 10px',
              }}>
                <Label>Grammar</Label>
                <p style={{ fontFamily: SANS, fontSize: 12.5, color: C.ink, margin: '4px 0 0', lineHeight: 1.4 }}>
                  {lesson.grammarFocus}
                </p>
              </div>
            )}
            {lesson.vocabFocus && (
              <div style={{
                background: C.cream, border: `1px solid ${C.border}`,
                borderRadius: 8, padding: '8px 10px',
              }}>
                <Label>Vocab</Label>
                <p style={{ fontFamily: SANS, fontSize: 12.5, color: C.ink, margin: '4px 0 0', lineHeight: 1.4 }}>
                  {lesson.vocabFocus}
                </p>
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
          {lesson.theme && <Chip tone="neutral" size="sm">{lesson.theme}</Chip>}
          {lesson.week != null && <Chip tone="neutral" size="sm">Week {lesson.week}</Chip>}
          {lesson.periodNum != null && <Chip tone="neutral" size="sm">Period {lesson.periodNum}</Chip>}
        </div>

        <HiBtn
          variant="primary" size="md"
          icon={<Icon name="arrowRight" size={14} color="#fff" />}
          onClick={() => router.push(`/plan/new?lessonId=${encodeURIComponent(lesson.id)}`)}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          Plan this lesson →
        </HiBtn>
      </div>
    </>
  );
}

// ── Left navigator ────────────────────────────────────────────────────────────

interface JourneyLeftProps {
  year: number;
  totalLessons: number;
  skillLOs: SkillLO[];
  focusedSkillRef: string | null;
  expandedSkillRef: string | null;
  focusedKRef: string | null;
  klosBySkill: Map<string, KnowledgeLO[]>;
  onFocusSkill: (ref: string | null) => void;
  onFocusKRef: (ref: string | null) => void;
}

export function JourneyLeft({
  year, totalLessons, skillLOs, focusedSkillRef, expandedSkillRef,
  focusedKRef, klosBySkill, onFocusSkill, onFocusKRef,
}: JourneyLeftProps) {
  return (
    <CeLeftPanel
      title="Outcome hierarchy"
      sublabel="Total → Skill → Knowledge → Daily"
      footerHint="Click a Skill LO to reveal its Knowledge LOs, then click a KLO for daily lessons."
    >
      <div style={{
        margin: '6px 12px 8px', padding: '8px 10px', borderRadius: 8,
        background: `linear-gradient(135deg, ${C.pink}, #8E1F49)`,
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <Icon name="target" size={12} color="#fff" />
        <span style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700, color: '#fff',
          textTransform: 'uppercase', letterSpacing: '0.08em', flex: 1,
        }}>Total LO</span>
        <span style={{ fontFamily: SANS, fontSize: 10, color: '#fff', opacity: 0.7 }}>Year {year}</span>
      </div>

      <div style={{ padding: '2px 16px 4px' }}>
        <span style={{
          fontFamily: SANS, fontSize: 9.5, fontWeight: 700, color: C.faint,
          textTransform: 'uppercase', letterSpacing: '0.1em',
        }}>
          Skill LOs · {skillLOs.length}
        </span>
      </div>

      {skillLOs.map(s => {
        const isFocus = s.ref === focusedSkillRef;
        const klos = klosBySkill.get(s.ref) ?? [];
        return (
          <div key={s.ref}>
            <NavRow
              depth={0}
              label={`${s.ref} · ${s.lo || s.skill}`}
              count={s.count}
              active={isFocus}
              expanded={isFocus}
              onClick={() => onFocusSkill(isFocus ? null : s.ref)}
            />
            {isFocus && klos.length > 0 && (
              <>
                <div style={{ padding: '4px 16px 2px 36px' }}>
                  <span style={{
                    fontFamily: SANS, fontSize: 9, fontWeight: 700, color: C.amber,
                    textTransform: 'uppercase', letterSpacing: '0.1em',
                  }}>
                    Knowledge · {klos.length}
                  </span>
                </div>
                {klos.map(k => (
                  <NavRow
                    key={k.ref}
                    depth={1}
                    label={`${k.ref} · ${k.lo}`}
                    count={k.count}
                    active={focusedKRef === k.ref}
                    expanded={focusedKRef === k.ref}
                    leaf={focusedKRef !== k.ref}
                    dot={C.amber}
                    onClick={() => onFocusKRef(focusedKRef === k.ref ? null : k.ref)}
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

// ── Journey Org Chart — ref-based centering with overlap resolution ───────────

const KLO_W = 190, KLO_GAP = 12, GROUP_GAP = 16;
const DAILY_W = 160, DAILY_GAP = 8, DAILY_GROUP_GAP = 16;

export function JourneyOrgChart({
  skillLOs, klosBySkill, allLessons, focusedSkillRef, focusedKRef,
  totalLessons, year, onFocusSkill, onFocusKRef,
}: {
  skillLOs: SkillLO[];
  klosBySkill: Map<string, KnowledgeLO[]>;
  allLessons: CurriculumLesson[];
  focusedSkillRef: string | null;
  focusedKRef: string | null;
  totalLessons: number;
  year: number;
  onFocusSkill: (ref: string | null) => void;
  onFocusKRef: (ref: string | null) => void;
}) {
  const [zoom, setZoom] = useState(1.0);
  const [cursorMode, setCursorMode] = useState<'grab' | 'grabbing'>('grab');
  const [modalLesson, setModalLesson] = useState<CurriculumLesson | null>(null);
  const [expandedSkills, setExpandedSkills] = useState<Set<string>>(new Set());
  const [expandedKlos, setExpandedKlos] = useState<Set<string>>(new Set());
  const [kloPositions, setKloPositions] = useState<Map<string, number>>(new Map());
  const [dailyPositions, setDailyPositions] = useState<Map<string, number>>(new Map());

  const outerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const skillCardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const kloCardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const panRef = useRef({ active: false, moved: false, startX: 0, startY: 0, scrollLeft: 0, scrollTop: 0 });

  // Tier row refs for sticky label overlay measurement
  const tier1Ref = useRef<HTMLDivElement>(null);
  const tier2Ref = useRef<HTMLDivElement>(null);
  const tier3Ref = useRef<HTMLDivElement>(null);
  const tier4Ref = useRef<HTMLDivElement>(null);
  const [tierTops, setTierTops] = useState<Record<string, number>>({});

  // Stable refs for ResizeObserver callback
  const expandedSkillsRef = useRef(expandedSkills);
  const expandedKlosRef = useRef(expandedKlos);
  const zoomRef = useRef(zoom);
  useEffect(() => { expandedSkillsRef.current = expandedSkills; }, [expandedSkills]);
  useEffect(() => { expandedKlosRef.current = expandedKlos; }, [expandedKlos]);
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);

  const dailyByKey = useMemo(() => {
    const m = new Map<string, CurriculumLesson[]>();
    allLessons.forEach(l => {
      if (!l.skillLORef || !l.knowledgeLORef) return;
      const key = `${l.skillLORef}|${l.knowledgeLORef}`;
      const arr = m.get(key) ?? [];
      arr.push(l);
      m.set(key, arr);
    });
    return m;
  }, [allLessons]);

  // KLO groups with overlap-resolved left positions
  const adjustedKloLayout = useMemo(() => {
    const groups = [...expandedSkills]
      .filter(ref => kloPositions.has(ref))
      .map(ref => {
        const klos = klosBySkill.get(ref) ?? [];
        const w = klos.length * KLO_W + Math.max(0, klos.length - 1) * KLO_GAP;
        const center = kloPositions.get(ref)!;
        return { skillRef: ref, klos, w, center, left: center - w / 2 };
      })
      .sort((a, b) => a.center - b.center);

    for (let i = 1; i < groups.length; i++) {
      const prev = groups[i - 1];
      const cur = groups[i];
      const minLeft = prev.left + prev.w + GROUP_GAP;
      if (cur.left < minLeft) cur.left = minLeft;
    }
    return groups;
  }, [expandedSkills, kloPositions, klosBySkill]);

  // Daily groups with overlap-resolved left positions
  const adjustedDailyLayout = useMemo(() => {
    const groups = [...expandedKlos]
      .filter(ref => dailyPositions.has(ref))
      .map(ref => {
        let lessons: CurriculumLesson[] = [];
        klosBySkill.forEach((klos, skillRef) => {
          if (klos.some(k => k.ref === ref)) {
            lessons = dailyByKey.get(`${skillRef}|${ref}`) ?? [];
          }
        });
        const w = lessons.length * DAILY_W + Math.max(0, lessons.length - 1) * DAILY_GAP;
        const center = dailyPositions.get(ref)!;
        return { kloRef: ref, lessons, w, center, left: center - w / 2 };
      })
      .sort((a, b) => a.center - b.center);

    for (let i = 1; i < groups.length; i++) {
      const prev = groups[i - 1];
      const cur = groups[i];
      const minLeft = prev.left + prev.w + DAILY_GROUP_GAP;
      if (cur.left < minLeft) cur.left = minLeft;
    }
    return groups;
  }, [expandedKlos, dailyPositions, klosBySkill, dailyByKey]);

  // Re-measure all expanded items (called on resize and zoom change)
  const recomputePositions = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const canvasRect = canvas.getBoundingClientRect();
    const z = zoomRef.current;

    const newKlo = new Map<string, number>();
    expandedSkillsRef.current.forEach(ref => {
      const el = skillCardRefs.current.get(ref);
      if (el) {
        const r = el.getBoundingClientRect();
        newKlo.set(ref, (r.left - canvasRect.left + r.width / 2) / z);
      }
    });
    setKloPositions(newKlo);

    const newDaily = new Map<string, number>();
    expandedKlosRef.current.forEach(ref => {
      const el = kloCardRefs.current.get(ref);
      if (el) {
        const r = el.getBoundingClientRect();
        newDaily.set(ref, (r.left - canvasRect.left + r.width / 2) / z);
      }
    });
    setDailyPositions(newDaily);
  }, []);

  // ResizeObserver on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(recomputePositions);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [recomputePositions]);

  // Recompute when zoom changes
  useEffect(() => { recomputePositions(); }, [zoom, recomputePositions]);

  // Measure tier row tops for sticky label overlay
  const measureTierTops = useCallback(() => {
    const outer = outerRef.current;
    if (!outer) return;
    const outerTop = outer.getBoundingClientRect().top;
    const tops: Record<string, number> = {};
    if (tier1Ref.current) tops.t1 = tier1Ref.current.getBoundingClientRect().top - outerTop;
    if (tier2Ref.current) tops.t2 = tier2Ref.current.getBoundingClientRect().top - outerTop;
    if (tier3Ref.current) tops.t3 = tier3Ref.current.getBoundingClientRect().top - outerTop;
    if (tier4Ref.current) tops.t4 = tier4Ref.current.getBoundingClientRect().top - outerTop;
    setTierTops(tops);
  }, []);

  useLayoutEffect(() => {
    measureTierTops();
  }, [measureTierTops, zoom, expandedSkills.size, expandedKlos.size]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', measureTierTops);
    return () => el.removeEventListener('scroll', measureTierTops);
  }, [measureTierTops]);

  // Pinch-to-zoom: ctrl+wheel = Mac trackpad pinch
  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    function handleWheel(e: WheelEvent) {
      if (e.ctrlKey) {
        e.preventDefault();
        setZoom(z => Math.min(1.5, Math.max(0.3, z - e.deltaY * 0.005)));
      }
    }
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  function handleSkillClick(ref: string) {
    const isExpanding = !expandedSkills.has(ref);

    if (isExpanding) {
      const cardEl = skillCardRefs.current.get(ref);
      const canvas = canvasRef.current;
      if (cardEl && canvas) {
        const cardRect = cardEl.getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();
        const centerX = (cardRect.left - canvasRect.left + cardRect.width / 2) / zoom;
        setKloPositions(m => new Map(m).set(ref, centerX));
      }
    } else {
      const kloRefs = (klosBySkill.get(ref) ?? []).map(k => k.ref);
      setExpandedKlos(prev => {
        const next = new Set(prev);
        kloRefs.forEach(r => next.delete(r));
        return next;
      });
      setDailyPositions(m => {
        const n = new Map(m);
        kloRefs.forEach(r => n.delete(r));
        return n;
      });
      setKloPositions(m => { const n = new Map(m); n.delete(ref); return n; });
    }

    setExpandedSkills(prev => {
      const next = new Set(prev);
      if (next.has(ref)) next.delete(ref); else next.add(ref);
      return next;
    });

    onFocusSkill(ref);
  }

  const handleKloClick = useCallback((ref: string) => {
    const isExpanding = !expandedKlosRef.current.has(ref);

    if (isExpanding) {
      const kloEl = kloCardRefs.current.get(ref);
      const canvas = canvasRef.current;
      if (kloEl && canvas) {
        const r = kloEl.getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();
        const centerX = (r.left - canvasRect.left + r.width / 2) / zoomRef.current;
        setDailyPositions(m => new Map(m).set(ref, centerX));
      }
    } else {
      setDailyPositions(m => { const n = new Map(m); n.delete(ref); return n; });
    }

    setExpandedKlos(prev => {
      const next = new Set(prev);
      if (next.has(ref)) next.delete(ref); else next.add(ref);
      return next;
    });

    onFocusKRef(ref);
  }, [onFocusKRef]);

  function onPanStart(e: React.MouseEvent) {
    if (e.button !== 0 || !scrollRef.current) return;
    panRef.current = {
      active: true, moved: false,
      startX: e.clientX, startY: e.clientY,
      scrollLeft: scrollRef.current.scrollLeft,
      scrollTop: scrollRef.current.scrollTop,
    };
  }

  function onPanMove(e: React.MouseEvent) {
    const p = panRef.current;
    if (!p.active || !scrollRef.current) return;
    const dx = e.clientX - p.startX;
    const dy = e.clientY - p.startY;
    if (!p.moved && Math.abs(dx) + Math.abs(dy) > 4) {
      p.moved = true;
      setCursorMode('grabbing');
    }
    if (p.moved) {
      scrollRef.current.scrollLeft = p.scrollLeft - dx;
      scrollRef.current.scrollTop = p.scrollTop - dy;
    }
  }

  function onPanEnd() {
    if (!panRef.current.active) return;
    panRef.current.active = false;
    if (panRef.current.moved) setCursorMode('grab');
  }

  function onClickCapture(e: React.MouseEvent) {
    if (panRef.current.moved) {
      e.stopPropagation();
      panRef.current.moved = false;
    }
  }

  return (
    <>
      <div
        ref={outerRef}
        style={{
          flex: 1, position: 'relative', overflow: 'hidden',
          background: C.cream, cursor: cursorMode, userSelect: 'none',
          touchAction: 'none', minWidth: 0, width: '100%',
        }}
        onMouseDown={onPanStart}
        onMouseMove={onPanMove}
        onMouseUp={onPanEnd}
        onMouseLeave={onPanEnd}
        onClickCapture={onClickCapture}
      >
        <div
          ref={scrollRef}
          style={{ position: 'absolute', inset: 0, overflowY: 'auto', overflowX: 'auto' }}
        >
          {/* Canvas: flow layout — tiers stack naturally, no absolute positioning on tiers */}
          <div
            ref={canvasRef}
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top center',
              // width: max-content so skill row never wraps; min-width: 100% to fill viewport
              width: 'max-content',
              minWidth: '100%',
              paddingBottom: 80,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* Tier 1: Total LO */}
            <div ref={tier1Ref} style={{ padding: '28px 40px 24px', width: '100%', display: 'flex', justifyContent: 'center' }}>
              <div style={{ maxWidth: 500, width: '100%' }}>
                <RootCard totalLessons={totalLessons} year={year} />
              </div>
            </div>

            {/* Tier 2: Skill LOs — flex row, never wraps, min-width: max-content */}
            <div ref={tier2Ref} style={{ padding: '0 24px 24px', display: 'flex', justifyContent: 'center', width: '100%', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', flexDirection: 'row', gap: 16, flexWrap: 'nowrap', minWidth: 'max-content' }}>
                {skillLOs.map(s => (
                  <div
                    key={s.ref}
                    ref={el => { if (el) skillCardRefs.current.set(s.ref, el); else skillCardRefs.current.delete(s.ref); }}
                  >
                    <SkillCard
                      s={s}
                      focused={expandedSkills.has(s.ref)}
                      faded={false}
                      onClick={() => handleSkillClick(s.ref)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Tier 3: KLO groups — absolutely positioned under parent Skill cards */}
            {expandedSkills.size > 0 && (
              <div ref={tier3Ref} style={{
                position: 'relative',
                minHeight: 120,
                width: '100%',
                boxSizing: 'border-box',
                overflow: 'visible',
              }}>
                {adjustedKloLayout.map(({ skillRef, klos, left }) => (
                  <div
                    key={skillRef}
                    style={{
                      position: 'absolute',
                      left,
                      top: 8,
                      display: 'flex',
                      gap: KLO_GAP,
                      flexWrap: 'nowrap',
                    }}
                  >
                    {klos.length === 0 ? (
                      <span style={{ fontFamily: SANS, fontSize: 11, color: C.faint, fontStyle: 'italic', whiteSpace: 'nowrap' }}>
                        Loading…
                      </span>
                    ) : klos.map(k => (
                      <div
                        key={k.ref}
                        ref={el => { if (el) kloCardRefs.current.set(k.ref, el); else kloCardRefs.current.delete(k.ref); }}
                      >
                        <KloCard
                          k={k}
                          focused={expandedKlos.has(k.ref)}
                          faded={false}
                          onClick={() => handleKloClick(k.ref)}
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* Tier 4: Daily chips — absolutely positioned under parent KLO cards */}
            {expandedKlos.size > 0 && (
              <div ref={tier4Ref} style={{
                position: 'relative',
                minHeight: 120,
                width: '100%',
                boxSizing: 'border-box',
                overflow: 'visible',
                paddingBottom: 24,
              }}>
                {adjustedDailyLayout.map(({ kloRef, lessons, left }) => (
                  <div
                    key={kloRef}
                    style={{
                      position: 'absolute',
                      left,
                      top: 8,
                      display: 'flex',
                      gap: DAILY_GAP,
                      flexWrap: 'nowrap',
                    }}
                  >
                    {lessons.length === 0 ? (
                      <span style={{ fontFamily: SANS, fontSize: 11, color: C.faint, fontStyle: 'italic', whiteSpace: 'nowrap' }}>
                        No lessons
                      </span>
                    ) : lessons.map(l => (
                      <DailyChip key={l.id} lesson={l} onClick={() => setModalLesson(l)} />
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tier label overlay — sticky-left pills that stay at the left edge on horizontal scroll */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: 92, pointerEvents: 'none', zIndex: 10, overflow: 'hidden',
        }}>
          {([
            { key: 't1', text: 'TOTAL LO',   accent: C.pink,  show: true },
            { key: 't2', text: 'SKILL LO',   accent: C.amber, show: true },
            { key: 't3', text: 'KNOWLEDGE',  accent: C.teal,  show: expandedSkills.size > 0 },
            { key: 't4', text: 'DAILY LO',   accent: C.faint, show: expandedKlos.size > 0 },
          ] as const).filter(l => l.show && tierTops[l.key] != null && tierTops[l.key] > -10).map(l => (
            <div
              key={l.key}
              style={{
                position: 'absolute',
                left: 8,
                top: tierTops[l.key] + 10,
                width: 80,
                background: 'rgba(245, 237, 229, 0.72)',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
                border: `1px solid ${C.border}`,
                borderRadius: 6,
                padding: '6px 10px 6px 13px',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              {/* Coloured left accent bar */}
              <div style={{
                position: 'absolute', left: 0, top: 4, bottom: 4,
                width: 3, background: l.accent, borderRadius: '2px 0 0 2px',
              }} />
              <span style={{
                fontFamily: SANS, fontSize: 10, fontWeight: 700,
                color: '#6E6863', textTransform: 'uppercase', letterSpacing: '0.08em',
                whiteSpace: 'nowrap',
              }}>{l.text}</span>
            </div>
          ))}
        </div>

        <ZoomControls
          zoom={zoom}
          onZoomIn={() => setZoom(z => Math.min(1.5, parseFloat((z + 0.1).toFixed(1))))}
          onZoomOut={() => setZoom(z => Math.max(0.3, parseFloat((z - 0.1).toFixed(1))))}
          onFit={() => setZoom(1.0)}
          onFocus={() => setZoom(1.2)}
        />
      </div>

      {modalLesson && <LessonModal lesson={modalLesson} onClose={() => setModalLesson(null)} />}
    </>
  );
}
