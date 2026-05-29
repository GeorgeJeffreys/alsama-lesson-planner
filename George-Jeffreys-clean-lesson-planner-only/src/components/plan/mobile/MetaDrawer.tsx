'use client';

import { C, SANS } from '@/lib/tokens';
import { Icon } from '@/components/icon';
import { BottomSheet } from './BottomSheet';
import type { CurriculumLesson } from '@/types/curriculum';

interface MetaDrawerProps {
  lesson: CurriculumLesson | null;
  open: boolean;
  onClose: () => void;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: '12px 18px', borderBottom: `1px solid ${C.border}` }}>
      <div style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 600, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontFamily: SANS, fontSize: 14, color: C.ink, lineHeight: 1.4 }}>{value || '—'}</div>
    </div>
  );
}

export function MetaDrawer({ lesson, open, onClose }: MetaDrawerProps) {
  return (
    <BottomSheet open={open} onClose={onClose} height="70vh">
      <div style={{ padding: '4px 18px 14px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            height: 20, padding: '0 7px',
            fontFamily: SANS, fontSize: 10.5, fontWeight: 600,
            color: C.pink, background: C.pinkSoft,
            border: `1px solid ${C.pinkBorder}`, borderRadius: 999,
          }}>
            <Icon name="lock" size={10} color={C.pink} /> From curriculum
          </div>
          <span style={{ fontFamily: SANS, fontSize: 15, fontWeight: 700, color: C.ink }}>
            {lesson?.id ?? 'No lesson'}
          </span>
        </div>
      </div>

      {lesson ? (
        <>
          <Row label="Daily Learning Objective" value={lesson.dailyLO} />
          <Row label="Grammar / Vocab Focus" value={lesson.grammarFocus || lesson.vocabFocus || ''} />
          <Row label="Theme" value={lesson.theme || ''} />
          <Row label="Linguistic Skill" value={lesson.linguisticSkill || ''} />
          <div style={{ padding: '12px 18px' }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[
                lesson.year && `Year ${lesson.year}`,
                lesson.week !== null && `Week ${lesson.week}`,
                lesson.period,
              ].filter(Boolean).map((chip) => (
                <span key={String(chip)} style={{
                  height: 24, padding: '0 9px', display: 'inline-flex', alignItems: 'center',
                  fontFamily: SANS, fontSize: 11.5, fontWeight: 500,
                  color: C.faint, background: C.cream, border: `1px solid ${C.borderSoft}`, borderRadius: 999,
                }}>{chip}</span>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div style={{ padding: 24, textAlign: 'center' }}>
          <span style={{ fontFamily: SANS, fontSize: 13, color: C.faint2 }}>No lesson selected</span>
        </div>
      )}
    </BottomSheet>
  );
}
