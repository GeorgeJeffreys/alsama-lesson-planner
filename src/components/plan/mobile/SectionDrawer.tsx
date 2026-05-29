'use client';

import { useState, useEffect, useRef } from 'react';
import { C, SANS } from '@/lib/tokens';
import { Icon } from '@/components/icon';
import { BottomSheet } from './BottomSheet';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';
import type { LessonSection } from '@/types/lesson';

interface SectionDrawerProps {
  open: boolean;
  onClose: () => void;
  section: LessonSection;
  onUpdate: (changes: Partial<LessonSection>) => void;
  onAiClick: () => void;
}

interface FieldProps {
  label: string;
  value: string;
  placeholder: string;
  multiline?: boolean;
  onSave: (v: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

function Field({ label, value, placeholder, multiline = false, onSave, onFocus, onBlur }: FieldProps) {
  const [draft, setDraft] = useState(value);
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) setDraft(value);
  }, [value]);

  const style: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    padding: '10px 12px',
    fontFamily: SANS, fontSize: 14, color: C.ink,
    background: C.cream, border: `1px solid ${C.borderSoft}`,
    borderRadius: 8, outline: 'none',
    lineHeight: 1.5,
    resize: 'none' as const,
  };

  return (
    <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}` }}>
      <div style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 600, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
        {label}
      </div>
      {multiline ? (
        <textarea
          value={draft}
          rows={4}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onFocus={() => { focused.current = true; onFocus?.(); }}
          onBlur={() => { focused.current = false; onSave(draft); onBlur?.(); }}
          style={style}
        />
      ) : (
        <input
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onFocus={() => { focused.current = true; onFocus?.(); }}
          onBlur={() => { focused.current = false; onSave(draft); onBlur?.(); }}
          style={{ ...style, height: 40 }}
        />
      )}
    </div>
  );
}

export function SectionDrawer({ open, onClose, section, onUpdate, onAiClick }: SectionDrawerProps) {
  const kbHeight = useKeyboardHeight();
  const [fieldFocused, setFieldFocused] = useState(false);

  return (
    <>
      <BottomSheet open={open} onClose={onClose} height="85vh">
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '0 16px 12px', borderBottom: `1px solid ${C.border}`,
        }}>
          <span style={{ fontFamily: SANS, fontSize: 16, fontWeight: 700, color: C.ink, flex: 1 }}>
            {section.title}
          </span>
          <span style={{
            fontFamily: SANS, fontSize: 12, color: C.faint,
            padding: '3px 8px', borderRadius: 999,
            background: C.cream, border: `1px solid ${C.borderSoft}`,
          }}>
            {section.timing_minutes === 0 ? 'Take-home' : `${section.timing_minutes} min`}
          </span>
          <button
            onClick={onAiClick}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              height: 32, padding: '0 10px',
              fontFamily: SANS, fontSize: 12, fontWeight: 500,
              color: C.pink, background: C.pinkSoft,
              border: `1px solid ${C.pinkBorder}`, borderRadius: 999,
              cursor: 'pointer',
            }}
          >
            <Icon name="sparkle" size={13} color={C.pink} />AI
          </button>
        </div>

        <Field
          label="Task"
          value={section.task}
          placeholder="What are students doing in this section?"
          onSave={(v) => onUpdate({ task: v })}
          onFocus={() => setFieldFocused(true)}
          onBlur={() => setFieldFocused(false)}
        />
        <Field
          label="Materials"
          value={section.materials}
          placeholder="Textbook p.12, flashcards, whiteboard…"
          onSave={(v) => onUpdate({ materials: v })}
          onFocus={() => setFieldFocused(true)}
          onBlur={() => setFieldFocused(false)}
        />
        <Field
          label="Teacher instructions"
          value={section.teacher_instructions}
          placeholder="Step-by-step instructions for the teacher…"
          multiline
          onSave={(v) => onUpdate({ teacher_instructions: v })}
          onFocus={() => setFieldFocused(true)}
          onBlur={() => setFieldFocused(false)}
        />
        <Field
          label="Student instructions"
          value={section.student_instructions}
          placeholder="What students see / do…"
          multiline
          onSave={(v) => onUpdate({ student_instructions: v })}
          onFocus={() => setFieldFocused(true)}
          onBlur={() => setFieldFocused(false)}
        />

        <div style={{ height: kbHeight > 0 ? kbHeight + 60 : 20 }} />
      </BottomSheet>

      {/* Floating toolbar above keyboard */}
      {open && fieldFocused && kbHeight > 0 && (
        <div style={{
          position: 'fixed', left: 0, right: 0,
          bottom: kbHeight, zIndex: 210,
          background: C.surface,
          borderTop: `1px solid ${C.border}`,
          padding: '8px 16px',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={onAiClick}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              height: 34, padding: '0 12px',
              fontFamily: SANS, fontSize: 12, fontWeight: 500,
              color: C.pink, background: C.pinkSoft,
              border: `1px solid ${C.pinkBorder}`, borderRadius: 999,
              cursor: 'pointer',
            }}
          >
            <Icon name="sparkle" size={14} color={C.pink} />Ask Aya
          </button>
          <div style={{ flex: 1 }} />
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => { (document.activeElement as HTMLElement)?.blur(); }}
            style={{
              height: 34, padding: '0 12px',
              fontFamily: SANS, fontSize: 12, fontWeight: 600,
              color: C.ink, background: C.cream,
              border: `1px solid ${C.border}`, borderRadius: 8,
              cursor: 'pointer',
            }}
          >Done</button>
        </div>
      )}
    </>
  );
}
