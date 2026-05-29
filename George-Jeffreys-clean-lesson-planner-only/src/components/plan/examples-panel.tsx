'use client';

import { useState } from 'react';
import { C, SANS } from '@/lib/tokens';
import { Icon } from '@/components/icon';
import { RightTabs } from './library-panel';
import type { RightTab } from './library-panel';
import { EXAMPLE_PLANS } from '@/data/examplePlans';
import type { ExamplePlan } from '@/data/examplePlans';
import type { LessonSection } from '@/types/lesson';

const LEVEL_COLORS: Record<string, { bg: string; fg: string; br: string }> = {
  'Pre-A1': { bg: C.tealSoft,  fg: C.teal,    br: '#BCDED6' },
  'A1':     { bg: C.pinkSoft,  fg: C.pink,    br: C.pinkBorder },
  'A2':     { bg: C.amberSoft, fg: '#7A5A11', br: '#EFD9A5' },
  'B1':     { bg: C.cream,     fg: C.faint,   br: C.borderSoft },
};

function LevelBadge({ level }: { level: string }) {
  const c = LEVEL_COLORS[level] ?? LEVEL_COLORS['A1'];
  return (
    <span style={{
      height: 20, padding: '0 7px',
      fontFamily: SANS, fontSize: 10.5, fontWeight: 600,
      color: c.fg, background: c.bg, border: `1px solid ${c.br}`,
      borderRadius: 999, display: 'inline-flex', alignItems: 'center',
    }}>{level}</span>
  );
}

function ExampleCard({ plan, onClick }: { plan: ExamplePlan; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 12, padding: 12,
        display: 'flex', flexDirection: 'column', gap: 6,
        cursor: 'pointer', transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = C.pink;
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 0 3px ${C.pinkSoft}`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = C.border;
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <LevelBadge level={plan.level} />
        <div style={{ flex: 1 }} />
        <span style={{ fontFamily: SANS, fontSize: 10, color: C.faint2 }}>Year {plan.year}</span>
      </div>
      <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: C.pink, lineHeight: 1.3 }}>
        {plan.approach}
      </div>
      <div style={{ fontFamily: SANS, fontSize: 11, color: C.faint, lineHeight: 1.4 }}>
        {plan.description.length > 65 ? plan.description.slice(0, 65) + '…' : plan.description}
      </div>
    </div>
  );
}

function SectionPreview({ section, index }: { section: LessonSection; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 10 }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 8,
          padding: '9px 12px', background: '#FAFAFA',
          borderBottom: open ? `1px solid ${C.border}` : 'none',
          border: 'none', cursor: 'pointer', textAlign: 'left',
          borderRadius: open ? '9px 9px 0 0' : 9,
        }}
      >
        <div style={{
          width: 22, height: 22, borderRadius: 6, background: C.cream,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: SANS, fontSize: 10.5, fontWeight: 600, color: C.faint, flexShrink: 0,
        }}>
          {String(index + 1).padStart(2, '0')}
        </div>
        <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: C.ink, flex: 1 }}>
          {section.title}
        </span>
        <span style={{
          fontFamily: SANS, fontSize: 11, color: C.faint,
          padding: '2px 7px', borderRadius: 999,
          background: C.cream, border: `1px solid ${C.borderSoft}`,
        }}>
          {section.timing_minutes === 0 ? 'Take-home' : `${section.timing_minutes} min`}
        </span>
        <Icon name={open ? 'chevronDown' : 'chevronRight'} size={13} color={C.faint} />
      </button>
      {open && (
        <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {section.task && (
            <div>
              <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 600, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>Task</div>
              <p style={{ fontFamily: SANS, fontSize: 12, color: C.ink, margin: 0, lineHeight: 1.5 }}>{section.task}</p>
            </div>
          )}
          {section.teacher_instructions && (
            <div>
              <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 600, color: C.pink, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>Teacher does</div>
              <p style={{ fontFamily: SANS, fontSize: 12, color: C.ink, margin: 0, lineHeight: 1.5, whiteSpace: 'pre-line' }}>{section.teacher_instructions}</p>
            </div>
          )}
          {section.student_instructions && (
            <div>
              <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 600, color: C.teal, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>Students do</div>
              <p style={{ fontFamily: SANS, fontSize: 12, color: C.ink, margin: 0, lineHeight: 1.5, whiteSpace: 'pre-line' }}>{section.student_instructions}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ExamplePreviewModal({ plan, onClose, onLoad }: {
  plan: ExamplePlan;
  onClose: () => void;
  onLoad: (sections: LessonSection[]) => void;
}) {
  const [loading, setLoading] = useState(false);

  function handleLoad() {
    setLoading(true);
    onLoad(plan.sections);
    onClose();
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(26,26,26,0.35)', backdropFilter: 'blur(2px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        width: 600, maxHeight: '85vh',
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 16,
        boxShadow: '0 24px 60px rgba(56,30,30,0.2)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 18px', borderBottom: `1px solid ${C.border}`,
          display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <span style={{ fontFamily: SANS, fontSize: 15, fontWeight: 700, color: C.pink }}>
                {plan.approach}
              </span>
              <LevelBadge level={plan.level} />
            </div>
            <span style={{ fontFamily: SANS, fontSize: 12, color: C.faint }}>
              {plan.title}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 28, height: 28, borderRadius: 8,
              background: C.cream, border: `1px solid ${C.border}`,
              cursor: 'pointer',
            }}
          >
            <Icon name="x" size={14} color={C.faint} />
          </button>
        </div>

        {/* Description */}
        <div style={{ padding: '10px 18px', background: C.cream, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          <p style={{ fontFamily: SANS, fontSize: 12.5, color: C.faint, margin: 0 }}>{plan.description}</p>
        </div>

        {/* Section list — expandable */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {plan.sections.map((s, i) => (
            <SectionPreview key={i} section={s} index={i} />
          ))}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 18px', borderTop: `1px solid ${C.border}`,
          background: C.cream, display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
        }}>
          <span style={{ fontFamily: SANS, fontSize: 11.5, color: C.faint }}>
            Loads all 6 sections — replaces current content
          </span>
          <div style={{ flex: 1 }} />
          <button
            onClick={onClose}
            style={{
              height: 34, padding: '0 14px',
              fontFamily: SANS, fontSize: 13, fontWeight: 500,
              background: 'transparent', color: C.ink,
              border: `1px solid ${C.border}`, borderRadius: 8, cursor: 'pointer',
            }}
          >Cancel</button>
          <button
            onClick={handleLoad}
            disabled={loading}
            style={{
              height: 34, padding: '0 14px',
              fontFamily: SANS, fontSize: 13, fontWeight: 600,
              background: loading ? C.faint2 : C.pink, color: '#fff',
              border: 'none', borderRadius: 8, cursor: loading ? 'default' : 'pointer',
            }}
          >
            <Icon name="copy" size={13} color="#fff" />
            {' '}Load as starting point
          </button>
        </div>
      </div>
    </div>
  );
}

interface ExamplesPanelProps {
  activeTab: RightTab;
  onTabChange: (tab: RightTab) => void;
  onLoadPlan: (sections: LessonSection[]) => void;
}

export function ExamplesPanel({ activeTab, onTabChange, onLoadPlan }: ExamplesPanelProps) {
  const [previewPlan, setPreviewPlan] = useState<ExamplePlan | null>(null);
  const [query, setQuery] = useState('');

  const filtered = query.trim()
    ? EXAMPLE_PLANS.filter((p) => {
        const q = query.toLowerCase();
        return p.approach.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(q) ||
          p.theme.toLowerCase().includes(q) ||
          p.level.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q);
      })
    : EXAMPLE_PLANS;

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 14, padding: '16px 18px' }}>
        <RightTabs active={activeTab} onChange={onTabChange} />

        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          height: 36, padding: '0 12px',
          background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8,
        }}>
          <Icon name="search" size={15} color={C.faint2} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search example plans…"
            style={{ flex: 1, border: 'none', outline: 'none', fontFamily: SANS, fontSize: 13, color: C.ink, background: 'transparent' }}
          />
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, marginBottom: -6,
        }}>
          <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {filtered.length} approach{filtered.length !== 1 ? 'es' : ''}
          </span>
        </div>

        {/* Card grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
          overflow: 'auto', flex: 1, paddingRight: 2, alignContent: 'start',
        }}>
          {filtered.map((p) => (
            <ExampleCard key={p.id} plan={p} onClick={() => setPreviewPlan(p)} />
          ))}
        </div>
      </div>

      {previewPlan && (
        <ExamplePreviewModal
          plan={previewPlan}
          onClose={() => setPreviewPlan(null)}
          onLoad={onLoadPlan}
        />
      )}
    </>
  );
}
