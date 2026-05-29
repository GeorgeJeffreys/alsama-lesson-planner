'use client';

import Link from 'next/link';
import { C, SANS } from '@/lib/tokens';
import { Icon } from '@/components/icon';

export type CeMode = 'calendar' | 'journey' | 'content';

export const SKILL_COLOR: Record<string, { fg: string; bg: string; label: string; line: string }> = {
  read:   { fg: C.teal,    bg: C.tealSoft,  label: 'Reading',        line: '#1F7A6C' },
  write:  { fg: C.pink,    bg: C.pinkSoft,  label: 'Writing',        line: '#B62A5C' },
  listen: { fg: '#7A5A11', bg: C.amberSoft, label: 'Listening',      line: '#E8A636' },
  speak:  { fg: '#5E3A8C', bg: '#EDE5F5',   label: 'Speaking',       line: '#7C5BA4' },
  basic:  { fg: C.faint,   bg: '#EFE8DF',   label: 'Basic Literacy', line: '#A39C95' },
};

export function skillKey(skill: string): string {
  const s = (skill ?? '').toLowerCase();
  if (s.includes('read')) return 'read';
  if (s.includes('writ')) return 'write';
  if (s.includes('listen')) return 'listen';
  if (s.includes('speak')) return 'speak';
  return 'basic';
}

// ── Primitives ────────────────────────────────────────────────────────────────

export function Label({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <span style={{
      fontFamily: SANS, fontSize: 10.5, fontWeight: 700,
      color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em',
      ...style,
    }}>{children}</span>
  );
}

interface ChipProps {
  children: React.ReactNode;
  tone: 'pink' | 'neutral' | 'amber' | 'teal';
  size?: 'sm' | 'md';
  style?: React.CSSProperties;
}

export function Chip({ children, tone, size = 'md', style }: ChipProps) {
  const sm = size === 'sm';
  const s = {
    pink:    { background: C.pinkSoft,  color: C.pink,     border: `1px solid ${C.pinkBorder}` },
    neutral: { background: C.cream,     color: C.faint,    border: `1px solid ${C.borderSoft}` },
    amber:   { background: C.amberSoft, color: '#7A5A11',  border: '1px solid #EFD9A5' },
    teal:    { background: C.tealSoft,  color: C.teal,     border: '1px solid #BCDED6' },
  }[tone];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      height: sm ? 20 : 24, padding: sm ? '0 6px' : '0 8px',
      fontFamily: SANS, fontSize: sm ? 10.5 : 12, fontWeight: 500,
      borderRadius: 999, whiteSpace: 'nowrap', ...s, ...style,
    }}>{children}</span>
  );
}

interface HiBtnProps {
  children: React.ReactNode;
  variant?: 'primary' | 'ghost';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function HiBtn({ children, variant = 'ghost', size = 'md', icon, onClick, style }: HiBtnProps) {
  const sm = size === 'sm';
  const isPrimary = variant === 'primary';
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: sm ? 4 : 6,
      height: sm ? 28 : 34, padding: sm ? '0 10px' : '0 14px',
      fontFamily: SANS, fontSize: sm ? 12 : 13, fontWeight: 500,
      color: isPrimary ? '#fff' : C.ink,
      background: isPrimary ? C.pink : 'transparent',
      border: isPrimary ? 'none' : `1px solid ${C.border}`,
      borderRadius: sm ? 7 : 8, cursor: 'pointer',
      boxShadow: isPrimary ? '0 1px 0 rgba(0,0,0,0.04),inset 0 -1px 0 rgba(0,0,0,0.08)' : 'none',
      ...style,
    }}>
      {icon}{children}
    </button>
  );
}

// ── NavRow ────────────────────────────────────────────────────────────────────

interface NavRowProps {
  depth?: number;
  label: string;
  count?: number | null;
  badge?: string;
  active?: boolean;
  expanded?: boolean;
  leaf?: boolean;
  dot?: string;
  onClick?: () => void;
}

export function NavRow({ depth = 0, label, count, badge, active, expanded, leaf, dot, onClick }: NavRowProps) {
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '6px 12px 6px 0',
      paddingLeft: 12 + (depth ?? 0) * 14,
      background: active ? C.pinkSoft : 'transparent',
      borderLeft: active ? `3px solid ${C.pink}` : '3px solid transparent',
      cursor: 'pointer',
    }}>
      {!leaf ? (
        <Icon name={expanded ? 'chevronDown' : 'chevronRight'} size={12} color={C.faint2} />
      ) : (
        <div style={{
          width: 6, height: 6, borderRadius: 999,
          background: dot || C.faint2, marginLeft: 3, marginRight: 3,
        }} />
      )}
      <span style={{
        fontFamily: SANS, fontSize: depth === 0 ? 13 : 12.5,
        fontWeight: active ? 600 : depth === 0 ? 600 : 400,
        color: active ? C.pink : C.ink,
        flex: 1, lineHeight: 1.3,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>{label}</span>
      {badge && <span style={{ fontFamily: SANS, fontSize: 10.5, color: C.faint, fontWeight: 500 }}>{badge}</span>}
      {count != null && (
        <div style={{
          minWidth: 22, padding: '0 6px', height: 18, borderRadius: 999,
          background: active ? '#fff' : C.cream,
          border: `1px solid ${active ? C.pinkBorder : C.borderSoft}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: SANS, fontSize: 10.5, fontWeight: 600,
          color: active ? C.pink : C.faint, fontVariantNumeric: 'tabular-nums',
        }}>{count}</div>
      )}
    </div>
  );
}

// ── CeTopBar ──────────────────────────────────────────────────────────────────

interface CeTopBarProps {
  year: number;
  search: string;
  onYearChange: (y: number) => void;
  onSearchChange: (s: string) => void;
}

export function CeTopBar({ year, search, onYearChange, onSearchChange }: CeTopBarProps) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      height: 60, padding: '0 20px', flexShrink: 0,
      background: C.surface, borderBottom: `1px solid ${C.border}`,
    }}>
      <div style={{
        fontFamily: '"Sacramento", cursive', fontSize: 30, color: C.pink,
        lineHeight: 1, display: 'inline-flex', alignItems: 'baseline', gap: 2,
      }}>
        Alsama
        <svg width={15} height={12} viewBox="0 0 20 16" fill="none" style={{ marginLeft: 2, marginBottom: 2 }}>
          <path d="M2 8 C2 4, 6 2, 8 6 C10 2, 14 4, 14 8 C14 11, 10 12, 8 9 C6 12, 2 11, 2 8 Z" fill={C.pink} opacity="0.85"/>
          <circle cx="16" cy="6" r="0.9" fill={C.pink}/><circle cx="17.5" cy="9" r="0.7" fill={C.pink}/><circle cx="18.5" cy="11.5" r="0.5" fill={C.pink}/>
        </svg>
      </div>

      <div style={{ width: 1, height: 24, background: C.border, margin: '0 4px' }} />

      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
        <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: C.ink }}>Curriculum Explorer</span>
        <span style={{ fontFamily: SANS, fontSize: 11, color: C.faint }}>Browse, plan, and connect lessons</span>
      </div>

      <div style={{ width: 16 }} />

      {/* Subject pill */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, height: 36, padding: '0 12px',
        background: C.cream, border: `1px solid ${C.borderSoft}`, borderRadius: 10, cursor: 'pointer',
      }}>
        <Icon name="book" size={14} color={C.pink} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.15 }}>
          <span style={{ fontFamily: SANS, fontSize: 10, color: C.faint }}>Subject</span>
          <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: C.ink }}>English</span>
        </div>
        <Icon name="chevronDown" size={14} color={C.faint} />
      </div>

      {/* Year pill — overlay a transparent select for interaction */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, height: 36, padding: '0 12px',
        background: C.cream, border: `1px solid ${C.borderSoft}`, borderRadius: 10,
        cursor: 'pointer', position: 'relative',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.15 }}>
          <span style={{ fontFamily: SANS, fontSize: 10, color: C.faint }}>Year</span>
          <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: C.ink }}>Year {year}</span>
        </div>
        <Icon name="chevronDown" size={14} color={C.faint} />
        <select
          value={year}
          onChange={e => onYearChange(Number(e.target.value))}
          style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%' }}
        >
          {[0,1,2,3,4,5,6].map(y => <option key={y} value={y}>Year {y}</option>)}
        </select>
      </div>

      {/* Search */}
      <div style={{ flex: 1, maxWidth: 360 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          height: 34, padding: '0 10px 0 12px',
          background: C.cream, border: `1px solid ${C.borderSoft}`, borderRadius: 8,
        }}>
          <Icon name="search" size={13} color={C.faint2} />
          <input
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Jump to lesson, theme, or skill…"
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: SANS, fontSize: 12, color: C.ink }}
          />
          <div style={{
            display: 'flex', alignItems: 'center', gap: 2, padding: '2px 6px',
            border: `1px solid ${C.borderSoft}`, borderRadius: 6,
            fontFamily: SANS, fontSize: 10.5, fontWeight: 600, color: C.faint, background: C.cream,
          }}>⌘K</div>
        </div>
      </div>

      <div style={{ flex: 1 }} />

      <Link href="/plan/new" style={{ textDecoration: 'none' }}>
        <HiBtn variant="ghost" icon={<Icon name="chevronLeft" size={14} color={C.ink} />}>
          Lesson Planner
        </HiBtn>
      </Link>
      <HiBtn variant="primary" icon={<Icon name="arrowRight" size={13} color="#fff" />}>
        Open lesson
      </HiBtn>

      <div style={{
        width: 34, height: 34, borderRadius: 999,
        background: `linear-gradient(135deg, ${C.pink}, ${C.amber})`,
        color: '#fff', fontFamily: SANS, fontSize: 12, fontWeight: 600,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `2px solid ${C.surface}`, boxShadow: `0 0 0 1px ${C.border}`, flexShrink: 0,
      }}>NT</div>
    </div>
  );
}

// ── CeModeTabs ────────────────────────────────────────────────────────────────

interface CeModeTabsProps {
  mode: CeMode;
  onModeChange: (m: CeMode) => void;
  totalLessons?: number;
}

const MODES = [
  { id: 'calendar' as CeMode, label: 'Calendar', desc: 'Week by week, period by period.', icon: 'calendar' as const },
  { id: 'journey'  as CeMode, label: 'Journey',  desc: 'How every lesson connects.',      icon: 'target'   as const },
  { id: 'content'  as CeMode, label: 'Content',  desc: 'By theme, topic and skill.',      icon: 'book'     as const },
];

export function CeModeTabs({ mode, onModeChange, totalLessons = 100 }: CeModeTabsProps) {
  return (
    <div style={{
      display: 'flex', alignItems: 'stretch', padding: '0 20px', height: 64,
      background: C.surface, borderBottom: `1px solid ${C.border}`, flexShrink: 0,
    }}>
      {MODES.map(m => {
        const active = m.id === mode;
        return (
          <button
            key={m.id}
            onClick={() => onModeChange(m.id)}
            style={{
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
              padding: '0 22px', background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: `3px solid ${active ? C.pink : 'transparent'}`,
              marginBottom: -1,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Icon name={m.icon} size={14} color={active ? C.pink : C.faint2} />
              <span style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: active ? 600 : 500, color: active ? C.ink : C.faint }}>
                {m.label}
              </span>
            </div>
            <span style={{ fontFamily: SANS, fontSize: 11, color: C.faint2, marginTop: 2, textAlign: 'left' }}>
              {m.desc}
            </span>
          </button>
        );
      })}
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Chip tone="teal" size="sm">
          <Icon name="cloudCheck" size={11} color={C.teal} />
          0 / {totalLessons} plans saved
        </Chip>
      </div>
    </div>
  );
}

// ── CeLeftPanel ───────────────────────────────────────────────────────────────

interface CeLeftPanelProps {
  title: string;
  sublabel?: string;
  footerHint?: string;
  children: React.ReactNode;
}

export function CeLeftPanel({ title, sublabel, footerHint, children }: CeLeftPanelProps) {
  return (
    <div style={{
      width: 256, flexShrink: 0,
      background: C.surface, borderRight: `1px solid ${C.border}`,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <div style={{ padding: '14px 16px 12px', borderBottom: `1px solid ${C.border}` }}>
        <Label>{title}</Label>
        {sublabel && (
          <div style={{ marginTop: 4 }}>
            <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 500, color: C.ink }}>{sublabel}</span>
          </div>
        )}
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '8px 0' }}>{children}</div>
      {footerHint && (
        <div style={{
          padding: '10px 14px', borderTop: `1px solid ${C.border}`,
          background: C.cream, display: 'flex', alignItems: 'flex-start', gap: 6,
        }}>
          <Icon name="target" size={12} color={C.pink} />
          <span style={{ fontFamily: SANS, fontSize: 11, color: C.faint, lineHeight: 1.4 }}>{footerHint}</span>
        </div>
      )}
    </div>
  );
}

// ── CeRightSidebar ────────────────────────────────────────────────────────────

const CEFR: Record<number, { from: string; to: string }> = {
  0: { from: 'Pre-A1', to: 'A1' }, 1: { from: 'A1', to: 'A2' },
  2: { from: 'A2', to: 'B1' },     3: { from: 'B1', to: 'B1+' },
  4: { from: 'B1+', to: 'B2' },    5: { from: 'B2', to: 'B2+' },
  6: { from: 'B2+', to: 'C1' },
};

interface CeRightSidebarProps {
  year: number;
  totalLessons: number;
  totalWeeks: number;
  skillBreakdown: { skill: string; skillKey: string; count: number; pct: number }[];
  themes: { theme: string; count: number }[];
}

export function CeRightSidebar({ year, totalLessons, totalWeeks, skillBreakdown, themes }: CeRightSidebarProps) {
  const cefr = CEFR[year] ?? { from: 'Pre-A1', to: 'A1' };
  const maxTheme = Math.max(...themes.map(t => t.count), 1);

  return (
    <div style={{
      width: 296, flexShrink: 0,
      background: C.surface, borderLeft: `1px solid ${C.border}`,
      display: 'flex', flexDirection: 'column', overflowY: 'auto',
    }}>
      {/* Year header */}
      <div style={{ padding: '18px 18px 16px', borderBottom: `1px solid ${C.border}` }}>
        <span style={{ fontFamily: SANS, fontSize: 18, fontWeight: 700, color: C.ink, display: 'block' }}>
          Year {year} · English
        </span>
        <span style={{ fontFamily: SANS, fontSize: 11.5, color: C.faint, display: 'block', marginTop: 4 }}>
          CEFR {cefr.from} → {cefr.to} · {totalWeeks} weeks · {totalLessons} lessons
        </span>

        {/* Plans saved */}
        <div style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <Label>Plans saved</Label>
            <span style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 600, color: C.ink }}>0 / {totalLessons} · 0%</span>
          </div>
          <div style={{ height: 6, borderRadius: 999, background: C.cream, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, width: '0%', background: `linear-gradient(90deg, ${C.pink}, #D34F7E)`, borderRadius: 999 }} />
          </div>
        </div>

        {/* CEFR trajectory */}
        <div style={{ marginTop: 14 }}>
          <Label style={{ display: 'block', marginBottom: 6 }}>CEFR trajectory</Label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Chip tone="neutral" size="sm">{cefr.from}</Chip>
            <div style={{ flex: 1, height: 1, borderTop: `1px dashed ${C.faint2}` }} />
            <Icon name="arrowRight" size={11} color={C.faint2} />
            <div style={{ flex: 1, height: 1, borderTop: `1px dashed ${C.faint2}` }} />
            <Chip tone="pink" size="sm">{cefr.to}</Chip>
          </div>
        </div>
      </div>

      {/* Skill bars */}
      <div style={{ padding: '16px 18px', borderBottom: `1px solid ${C.border}` }}>
        <Label style={{ display: 'block', marginBottom: 10 }}>By linguistic skill</Label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {skillBreakdown.filter(s => s.count > 0).map(s => {
            const col = SKILL_COLOR[s.skillKey] ?? SKILL_COLOR.basic;
            return (
              <div key={s.skill}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: col.line }} />
                    <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 500, color: C.ink }}>{col.label}</span>
                  </div>
                  <span style={{ fontFamily: SANS, fontSize: 11, color: C.faint, fontVariantNumeric: 'tabular-nums' }}>
                    {s.count} · {s.pct}%
                  </span>
                </div>
                <div style={{ height: 5, borderRadius: 999, background: C.cream, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', inset: 0, width: `${Math.min(s.pct * 3.6, 100)}%`, background: col.line, borderRadius: 999 }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Themes */}
      <div style={{ padding: '16px 18px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
          <Label>Themes covered</Label>
          <div style={{ flex: 1 }} />
          <span style={{ fontFamily: SANS, fontSize: 10.5, color: C.faint }}>{themes.length} themes</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {themes.slice(0, 8).map(t => (
            <div key={t.theme} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                flex: 1, height: 22, background: C.cream, border: `1px solid ${C.borderSoft}`,
                borderRadius: 6, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center',
              }}>
                <div style={{
                  position: 'absolute', inset: 0,
                  width: `${(t.count / maxTheme) * 100}%`,
                  background: `linear-gradient(90deg, ${C.pinkSoft}, ${C.creamDeep})`,
                }} />
                <span style={{ position: 'relative', paddingLeft: 8, fontFamily: SANS, fontSize: 11.5, color: C.ink }}>
                  {t.theme}
                </span>
              </div>
              <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: C.faint, width: 22, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                {t.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <Icon name="target" size={13} color={C.pink} />
        <span style={{ fontFamily: SANS, fontSize: 11.5, color: C.faint, lineHeight: 1.45 }}>
          Same overview across every view — what you're browsing is always within these {totalLessons} lessons.
        </span>
      </div>
    </div>
  );
}

// ── Cascade canvas ────────────────────────────────────────────────────────────

export const TIER_RAIL_W = 96;

export interface TierDef { id: string; label: string; sub: string; accent: string }

export function TierBand({ tier, children, faded, minHeight, last }: {
  tier: TierDef; children: React.ReactNode; faded?: boolean; minHeight?: number; last?: boolean;
}) {
  return (
    <div style={{
      position: 'relative',
      borderBottom: last ? 'none' : `1px solid ${C.borderSoft}`,
      background: faded ? 'rgba(245,237,229,0.55)' : 'transparent',
      display: 'flex', minHeight,
    }}>
      <div style={{
        width: TIER_RAIL_W, flexShrink: 0,
        padding: '14px 12px 14px 16px',
        display: 'flex', flexDirection: 'column', gap: 4,
        position: 'sticky', left: 0, top: 0, zIndex: 4, background: 'inherit',
        borderRight: `1px dashed ${C.borderSoft}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 3, height: 14, borderRadius: 2, background: tier.accent }} />
          <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: C.ink, textTransform: 'uppercase', letterSpacing: '0.1em', lineHeight: 1.1 }}>
            {tier.label}
          </span>
        </div>
        <span style={{ fontFamily: SANS, fontSize: 10, color: C.faint, lineHeight: 1.4 }}>{tier.sub}</span>
      </div>
      <div style={{ flex: 1, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 3 }}>
        {children}
      </div>
    </div>
  );
}

interface ConnPath { d: string; color?: string; weight?: number; dashed?: boolean; opacity?: number }

export function CascadeCanvas({ children, connectors, totalHeight }: {
  children: React.ReactNode; connectors?: ConnPath[]; totalHeight?: number;
}) {
  return (
    <div style={{ flex: 1, position: 'relative', overflowY: 'auto', background: C.cream }}>
      {connectors && totalHeight && (
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: totalHeight, pointerEvents: 'none', zIndex: 0 }}>
          {connectors.map((p, i) => (
            <path key={i} d={p.d}
              stroke={p.color || C.faint2} strokeWidth={p.weight || 1.5}
              fill="none" strokeDasharray={p.dashed ? '4 4' : undefined}
              opacity={p.opacity ?? 0.6} strokeLinecap="round"
            />
          ))}
        </svg>
      )}
      {children}
    </div>
  );
}

export function ZoomControls({ zoom = 1, onZoomIn, onZoomOut, onFit, onFocus }: {
  zoom?: number;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFit?: () => void;
  onFocus?: () => void;
}) {
  return (
    <div style={{
      position: 'absolute', right: 16, bottom: 16, zIndex: 10,
      display: 'flex', flexDirection: 'column', padding: 4, gap: 2,
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 10, boxShadow: '0 4px 12px rgba(56,30,30,0.08)',
    }}>
      {(['plus', 'minus', 'fit', 'focus'] as const).map((k, i) => (
        <button key={i}
          onClick={k === 'plus' ? onZoomIn : k === 'minus' ? onZoomOut : k === 'fit' ? onFit : onFocus}
          title={k === 'plus' ? 'Zoom in' : k === 'minus' ? 'Zoom out' : k === 'fit' ? `Fit (${zoom.toFixed(1)}×)` : 'Focus (1.2×)'}
          style={{ width: 32, height: 32, borderRadius: 7, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {k === 'plus'  && <Icon name="plus" size={14} color={C.faint} />}
          {k === 'minus' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.faint} strokeWidth="1.8" strokeLinecap="round"><path d="M5 12h14"/></svg>}
          {k === 'fit'   && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.faint} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4"/></svg>}
          {k === 'focus' && <Icon name="target" size={14} color={C.faint} />}
        </button>
      ))}
    </div>
  );
}

export function Minimap({ viewport, tiers }: { viewport: { x: number; y: number; w: number; h: number }; tiers: TierDef[] }) {
  return (
    <div style={{
      position: 'absolute', right: 16, bottom: 68, zIndex: 10,
      width: 200, height: 130, background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 10, padding: 10, boxShadow: '0 4px 12px rgba(56,30,30,0.08)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
        <Label>Minimap</Label>
        <div style={{ flex: 1 }} />
        <span style={{ fontFamily: SANS, fontSize: 10, color: C.faint }}>0.7×</span>
      </div>
      <div style={{ position: 'relative', height: 96, background: C.cream, border: `1px solid ${C.borderSoft}`, borderRadius: 6, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {tiers.map((t, i) => (
          <div key={i} style={{ flex: 1, borderBottom: i < tiers.length - 1 ? `1px solid ${C.borderSoft}` : 'none', background: i % 2 === 0 ? 'transparent' : 'rgba(245,237,229,0.5)', position: 'relative' }}>
            <div style={{ position: 'absolute', left: 2, top: 2, width: 3, height: 3, borderRadius: 1, background: t.accent }} />
          </div>
        ))}
        <div style={{
          position: 'absolute',
          left: `${viewport.x * 100}%`, top: `${viewport.y * 100}%`,
          width: `${viewport.w * 100}%`, height: `${viewport.h * 100}%`,
          border: `2px solid ${C.pink}`, background: 'rgba(182,42,92,0.12)', borderRadius: 2,
        }} />
      </div>
    </div>
  );
}

export function TopChrome({ label, badge }: { label: string; badge?: string }) {
  return (
    <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 10, display: 'flex', gap: 6 }}>
      {badge && <Chip tone="pink" size="sm" style={{ fontWeight: 600 }}>{badge}</Chip>}
      <Chip tone="neutral" size="sm" style={{ background: C.surface, fontWeight: 600 }}>
        <Icon name="target" size={11} color={C.faint} /> {label}
      </Chip>
    </div>
  );
}

// ── CeShell ───────────────────────────────────────────────────────────────────

export function CeShell({ topBar, modeTabs, leftPanel, main, rightSidebar }: {
  topBar: React.ReactNode; modeTabs: React.ReactNode;
  leftPanel: React.ReactNode; main: React.ReactNode; rightSidebar: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: C.creamDeep, fontFamily: SANS, color: C.ink }}>
      {topBar}
      {modeTabs}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        {leftPanel}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, background: C.cream }}>
          {main}
        </div>
        {rightSidebar}
      </div>
    </div>
  );
}
