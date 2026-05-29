'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { C, SANS } from '@/lib/tokens';
import { Icon } from '@/components/icon';
import type { LessonSection } from '@/types/lesson';
import { useDroppable } from '@dnd-kit/core';

interface SectionCardProps {
  index: number;
  section: LessonSection;
  expanded: boolean;
  focused: boolean;
  dimmed?: boolean;
  droppable?: boolean;
  onToggle: () => void;
  onAiClick: () => void;
  onUpdate: (changes: Partial<LessonSection>) => void;
}

function Chip({ children, tone = 'neutral' }: {
  children: React.ReactNode;
  tone?: 'neutral' | 'pink' | 'ghost';
}) {
  const tones = {
    neutral: { bg: C.cream, fg: C.ink, br: C.borderSoft },
    pink:    { bg: C.pinkSoft, fg: C.pink, br: C.pinkBorder },
    ghost:   { bg: 'transparent', fg: C.faint, br: C.border },
  };
  const t = tones[tone];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      height: 20, padding: '0 7px',
      fontFamily: SANS, fontSize: 10.5, fontWeight: 500,
      color: t.fg, background: t.bg, border: `1px solid ${t.br}`,
      borderRadius: 999, whiteSpace: 'nowrap',
    }}>{children}</span>
  );
}

function AiBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      height: 28, padding: '0 10px',
      fontFamily: SANS, fontSize: 12, fontWeight: 500,
      color: C.pink, background: C.pinkSoft,
      border: `1px solid ${C.pinkBorder}`,
      borderRadius: 999, whiteSpace: 'nowrap',
      cursor: 'pointer',
    }}>
      <Icon name="sparkle" size={13} color={C.pink} />Ask AI
    </button>
  );
}

function InlineText({ value, placeholder, onSave }: {
  value: string;
  placeholder: string;
  onSave: (v: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) setDraft(value);
  }, [value, isFocused]);

  return (
    <input
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => { setIsFocused(false); onSave(draft); }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') { e.preventDefault(); (e.target as HTMLInputElement).blur(); }
        if (e.key === 'Escape') { setDraft(value); (e.target as HTMLInputElement).blur(); }
      }}
      placeholder={placeholder}
      style={{
        width: '100%', boxSizing: 'border-box',
        fontFamily: SANS, fontSize: 13.5, color: C.ink,
        background: isFocused ? `${C.pinkSoft}88` : 'transparent',
        border: isFocused ? `1px solid ${C.pink}` : '1px solid transparent',
        borderRadius: 6, padding: '5px 8px', outline: 'none', lineHeight: 1.5,
        transition: 'background 0.1s, border-color 0.1s',
      }}
    />
  );
}

function BulletEditor({ value, color, placeholder, onSave }: {
  value: string;
  color: string;
  placeholder: string;
  onSave: (v: string) => void;
}) {
  const [lines, setLines] = useState<string[]>(() =>
    value ? value.split('\n').filter(Boolean) : []
  );
  const lineRefs = useRef<(HTMLInputElement | null)[]>([]);
  const lastExternal = useRef(value);

  // Sync external value changes without causing setState during render
  useEffect(() => {
    if (lastExternal.current !== value) {
      lastExternal.current = value;
      setLines(value ? value.split('\n').filter(Boolean) : []);
    }
  }, [value]);

  const doSave = useCallback((ls: string[]) => {
    const result = ls.filter(Boolean).join('\n');
    lastExternal.current = result;
    onSave(result);
  }, [onSave]);

  function updateLine(i: number, v: string) {
    setLines((prev) => {
      const next = [...prev];
      next[i] = v;
      return next;
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>, i: number) {
    if (e.key === 'Enter') {
      e.preventDefault();
      setLines((prev) => {
        const next = [...prev.slice(0, i + 1), '', ...prev.slice(i + 1)];
        setTimeout(() => lineRefs.current[i + 1]?.focus(), 0);
        return next;
      });
    } else if (e.key === 'Backspace' && lines[i] === '' && lines.length > 1) {
      e.preventDefault();
      const next = lines.filter((_, j) => j !== i);
      setLines(next);
      doSave(next);
      setTimeout(() => lineRefs.current[Math.max(0, i - 1)]?.focus(), 0);
    }
  }

  function addLine() {
    setLines((prev) => {
      const next = [...prev, ''];
      setTimeout(() => lineRefs.current[next.length - 1]?.focus(), 0);
      return next;
    });
  }

  if (lines.length === 0) {
    return (
      <div
        style={{ fontFamily: SANS, fontSize: 12, color: C.faint2, padding: '4px 2px', cursor: 'text' }}
        onClick={addLine}
      >{placeholder}</div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {lines.map((line, i) => {
        const isHeader = line.startsWith('**');
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {!isHeader && (
              <span style={{ color, fontSize: 14, lineHeight: 1, flexShrink: 0, userSelect: 'none' }}>•</span>
            )}
            <input
              ref={(el) => { lineRefs.current[i] = el; }}
              value={line}
              onChange={(e) => updateLine(i, e.target.value)}
              onBlur={() => doSave(lines)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              placeholder={isHeader ? '' : 'Add step…'}
              style={{
                flex: 1, minWidth: 0, fontFamily: SANS,
                fontSize: isHeader ? 11.5 : 13,
                fontWeight: isHeader ? 700 : 400,
                color: C.ink,
                background: isHeader ? C.cream : 'transparent',
                border: 'none', outline: 'none',
                padding: isHeader ? '2px 6px' : '2px 0',
                lineHeight: 1.6,
                borderRadius: isHeader ? 4 : 0,
                marginTop: isHeader ? 2 : 0,
              }}
            />
          </div>
        );
      })}
      <button
        onClick={addLine}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: SANS, fontSize: 11, color: C.faint,
          textAlign: 'left', padding: '3px 2px',
        }}
      >+ Add step</button>
    </div>
  );
}

interface MaterialItem {
  label: string;
  url?: string;
  fileType?: 'pdf' | 'image' | 'doc';
}

function getFileType(name: string, mime: string): 'pdf' | 'image' | 'doc' {
  if (mime === 'application/pdf' || name.toLowerCase().endsWith('.pdf')) return 'pdf';
  if (mime.startsWith('image/')) return 'image';
  return 'doc';
}

function MaterialEditor({ value, onSave }: {
  value: string;
  onSave: (v: string) => void;
}) {
  const [items, setItems] = useState<MaterialItem[]>(() =>
    value ? value.split(',').map((m) => ({ label: m.trim() })).filter((m) => m.label) : []
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastExternal = useRef(value);

  useEffect(() => {
    if (lastExternal.current !== value) {
      lastExternal.current = value;
      setItems(value ? value.split(',').map((m) => ({ label: m.trim() })).filter((m) => m.label) : []);
    }
  }, [value]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const additions: MaterialItem[] = Array.from(files).map((file) => ({
      label: file.name,
      url: URL.createObjectURL(file),
      fileType: getFileType(file.name, file.type),
    }));
    const newItems = [...items, ...additions];
    setItems(newItems);
    const str = newItems.map((m) => m.label).join(', ');
    lastExternal.current = str;
    onSave(str);
    e.target.value = '';
  }

  function remove(i: number) {
    const item = items[i];
    if (item.url) URL.revokeObjectURL(item.url);
    const next = items.filter((_, j) => j !== i);
    setItems(next);
    const str = next.map((m) => m.label).join(', ');
    lastExternal.current = str;
    onSave(str);
  }

  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.gif,.webp"
        multiple
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      {items.map((item, i) => (
        <span key={i} style={{
          display: 'inline-flex', alignItems: 'center', gap: 3,
          height: 22, padding: '0 8px 0 7px',
          fontFamily: SANS, fontSize: 11, fontWeight: 500,
          color: C.ink, background: C.cream,
          border: `1px solid ${C.borderSoft}`, borderRadius: 999,
          maxWidth: 220,
        }}>
          {item.url ? (
            <a href={item.url} target="_blank" rel="noopener noreferrer" style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              color: C.ink, textDecoration: 'none', flex: 1, minWidth: 0,
            }}>
              <Icon name={item.fileType === 'image' ? 'image' : 'paperclip'} size={11} color={C.faint} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.label}
              </span>
            </a>
          ) : (
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.label}
            </span>
          )}
          <button
            onClick={() => remove(i)}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '0 0 0 3px', color: C.faint, fontSize: 14, lineHeight: 1, flexShrink: 0,
            }}
          >×</button>
        </span>
      ))}
      <button
        onClick={() => fileInputRef.current?.click()}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          height: 22, padding: '0 8px',
          fontFamily: SANS, fontSize: 11, fontWeight: 500,
          color: C.faint, background: 'transparent',
          border: `1px dashed ${C.border}`, borderRadius: 999,
          cursor: 'pointer',
        }}
      >
        <Icon name="plus" size={11} color={C.faint} />Add file
      </button>
    </div>
  );
}

function timingLabel(min: number) {
  if (min === 0) return 'Take-home';
  return `${min} min`;
}

export function SectionCard({
  index, section, expanded, focused, dimmed, droppable,
  onToggle, onAiClick, onUpdate,
}: SectionCardProps) {
  const { setNodeRef, isOver } = useDroppable({ id: `section-${index}` });

  return (
    <div
      ref={droppable ? setNodeRef : undefined}
      style={{
        background: C.surface,
        border: `1px solid ${isOver ? C.pink : focused ? C.pink : C.border}`,
        borderRadius: 12,
        boxShadow: focused ? `0 0 0 3px ${C.pinkSoft}` : isOver ? `0 0 0 3px ${C.pinkSoft}` : 'none',
        opacity: dimmed ? 0.65 : 1,
        overflow: 'hidden',
        transition: 'border-color 0.15s, box-shadow 0.15s, opacity 0.15s',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 16px',
          borderBottom: expanded ? `1px solid ${C.border}` : 'none',
          cursor: 'pointer',
        }}
        onClick={onToggle}
      >
        <div style={{
          width: 26, height: 26, borderRadius: 8,
          background: C.cream, color: C.faint,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: SANS, fontSize: 11, fontWeight: 600, flexShrink: 0,
        }}>
          {String(index + 1).padStart(2, '0')}
        </div>
        <span style={{ fontFamily: SANS, fontSize: 15, fontWeight: 600, color: C.ink, flex: 1 }}>
          {section.title}
        </span>
        <Chip tone="neutral">
          <Icon name="clock" size={11} />{timingLabel(section.timing_minutes)}
        </Chip>
        <div onClick={(e) => e.stopPropagation()}>
          <AiBtn onClick={onAiClick} />
        </div>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name={expanded ? 'chevronDown' : 'chevronRight'} size={16} color={C.faint} />
        </div>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Task */}
          <div>
            <div style={{
              fontFamily: SANS, fontSize: 10.5, fontWeight: 600,
              color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4,
            }}>Task</div>
            <InlineText
              value={section.task}
              placeholder="Describe the activity…"
              onSave={(v) => onUpdate({ task: v })}
            />
          </div>

          {/* Materials */}
          <div>
            <div style={{
              fontFamily: SANS, fontSize: 10.5, fontWeight: 600,
              color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6,
            }}>Materials</div>
            <MaterialEditor
              value={section.materials}
              onSave={(v) => onUpdate({ materials: v })}
            />
          </div>

          {/* Teacher / Students */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 0,
            border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden',
          }}>
            <div style={{ padding: 12, borderRight: `1px solid ${C.border}`, background: C.creamDeep + '40', minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Icon name="user" size={12} color={C.pink} />
                <span style={{
                  fontFamily: SANS, fontSize: 10.5, fontWeight: 600,
                  color: C.pink, textTransform: 'uppercase', letterSpacing: '0.08em',
                }}>Teacher does</span>
              </div>
              <BulletEditor
                value={section.teacher_instructions}
                color={C.ink}
                placeholder="Click to add teacher steps…"
                onSave={(v) => onUpdate({ teacher_instructions: v })}
              />
            </div>
            <div style={{ padding: 12, background: C.tealSoft + '50', minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Icon name="users" size={12} color={C.teal} />
                <span style={{
                  fontFamily: SANS, fontSize: 10.5, fontWeight: 600,
                  color: C.teal, textTransform: 'uppercase', letterSpacing: '0.08em',
                }}>Students do</span>
              </div>
              <BulletEditor
                value={section.student_instructions}
                color={C.ink}
                placeholder="Click to add student steps…"
                onSave={(v) => onUpdate({ student_instructions: v })}
              />
            </div>
          </div>
        </div>
      )}

      {/* Collapsed preview */}
      {!expanded && (
        <div style={{ padding: '6px 16px 12px 54px' }}>
          <span style={{ fontFamily: SANS, fontSize: 12, color: C.faint }}>
            {section.task || 'No task yet — expand to add content'}
          </span>
        </div>
      )}
    </div>
  );
}

export function DropIndicator({ label }: { label: string }) {
  return (
    <div style={{
      padding: 16,
      border: `2px dashed ${C.pink}`,
      background: `${C.pinkSoft}AA`,
      borderRadius: 12,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    }}>
      <Icon name="plus" size={14} color={C.pink} />
      <span style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 600, color: C.pink }}>{label}</span>
    </div>
  );
}
