'use client';

import { useState, useRef, useEffect } from 'react';
import { C, SANS } from '@/lib/tokens';
import { Icon } from '@/components/icon';
import { RightTabs } from './library-panel';
import type { RightTab } from './library-panel';
import type { LessonSection } from '@/types/lesson';

interface Message {
  role: 'user' | 'ai';
  content: string;
  streaming?: boolean;
  result?: { teacherInstructions: string; studentInstructions: string };
}

interface AiPanelProps {
  lessonId: string;
  focusedSection: number;
  sectionName: string;
  activeTab: RightTab;
  onTabChange: (tab: RightTab) => void;
  onInsert: (sectionIndex: number, data: { teacherInstructions: string; studentInstructions: string }) => void;
}

const SUGGESTED = [
  'Generate warm-up for this LO',
  'Write 5 comprehension questions',
  'Simplify for weaker students',
  'Add Arabic L1 scaffolding',
  'Make it more visual',
];

function AiBubble({ msg, onInsert, sectionName }: {
  msg: Message;
  sectionName: string;
  onInsert?: (data: { teacherInstructions: string; studentInstructions: string }) => void;
}) {
  const isUser = msg.role === 'user';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start', gap: 6 }}>
      {!isUser && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 22, height: 22, borderRadius: 999,
            background: C.pinkSoft, border: `1px solid ${C.pinkBorder}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="sparkle" size={12} color={C.pink} />
          </div>
          <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: C.faint }}>
            Aya · Aware of {sectionName}
          </span>
        </div>
      )}
      <div style={{
        maxWidth: '88%', padding: '10px 12px',
        background: isUser ? C.pink : C.surface,
        color: isUser ? '#fff' : C.ink,
        border: isUser ? 'none' : `1px solid ${C.border}`,
        borderRadius: 12,
        borderTopRightRadius: isUser ? 4 : 12,
        borderTopLeftRadius: isUser ? 12 : 4,
        fontFamily: SANS, fontSize: 13, lineHeight: 1.5,
      }}>
        {msg.streaming ? (
          <span style={{ color: C.faint }}>{msg.content || '…'}</span>
        ) : (
          <>
            {msg.result ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <div style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 600, color: C.pink, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Teacher does</div>
                  <div style={{ whiteSpace: 'pre-wrap', fontSize: 13 }}>{msg.result.teacherInstructions}</div>
                </div>
                <div>
                  <div style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 600, color: C.teal, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Students do</div>
                  <div style={{ whiteSpace: 'pre-wrap', fontSize: 13 }}>{msg.result.studentInstructions}</div>
                </div>
              </div>
            ) : (
              <span style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</span>
            )}
            {msg.result && onInsert && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}`, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button
                  onClick={() => onInsert(msg.result!)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    height: 28, padding: '0 10px',
                    fontFamily: SANS, fontSize: 12, fontWeight: 500,
                    background: C.pink, color: '#fff', border: 'none', borderRadius: 8,
                  }}
                >
                  <Icon name="plus" size={12} color="#fff" />Insert into {sectionName}
                </button>
                <button style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  height: 28, padding: '0 10px',
                  fontFamily: SANS, fontSize: 12, fontWeight: 500,
                  background: 'transparent', color: C.ink,
                  border: `1px solid ${C.border}`, borderRadius: 8,
                }}>
                  <Icon name="refresh" size={12} />Try again
                </button>
                <button
                  onClick={() => navigator.clipboard.writeText(
                    `Teacher: ${msg.result!.teacherInstructions}\n\nStudents: ${msg.result!.studentInstructions}`
                  )}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    height: 28, padding: '0 10px',
                    fontFamily: SANS, fontSize: 12, fontWeight: 500,
                    background: 'transparent', color: C.ink,
                    border: `1px solid ${C.border}`, borderRadius: 8,
                  }}
                >
                  <Icon name="copy" size={12} />Copy
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function AiPanel({ lessonId, focusedSection, sectionName, activeTab, onTabChange, onInsert }: AiPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [composer, setComposer] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function sendMessage(text: string) {
    if (!text.trim() || isStreaming) return;
    setComposer('');
    setIsStreaming(true);

    const userMsg: Message = { role: 'user', content: text };
    const aiPlaceholder: Message = { role: 'ai', content: '', streaming: true };
    setMessages((prev) => [...prev, userMsg, aiPlaceholder]);
    const aiIndex = messages.length + 1;

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionName, lessonId, existingContent: text }),
      });

      if (!res.body) throw new Error('No stream');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      let jsonAccum = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const parts = buf.split('\n\n');
        buf = parts.pop() ?? '';
        for (const part of parts) {
          if (!part.startsWith('data: ')) continue;
          try {
            const evt = JSON.parse(part.slice(6));
            if (evt.type === 'delta') {
              jsonAccum += evt.partial;
              setMessages((prev) => {
                const updated = [...prev];
                updated[aiIndex] = { role: 'ai', content: jsonAccum, streaming: true };
                return updated;
              });
            } else if (evt.type === 'done') {
              setMessages((prev) => {
                const updated = [...prev];
                updated[aiIndex] = { role: 'ai', content: '', streaming: false, result: evt.result };
                return updated;
              });
            } else if (evt.type === 'error') {
              setMessages((prev) => {
                const updated = [...prev];
                updated[aiIndex] = { role: 'ai', content: evt.error, streaming: false };
                return updated;
              });
            }
          } catch { /* partial JSON chunk — ignore */ }
        }
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[aiIndex] = { role: 'ai', content: 'Something went wrong. Please try again.', streaming: false };
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '16px 18px 0', gap: 14 }}>
      <RightTabs active={activeTab} onChange={onTabChange} />

      {/* Context banner */}
      <div style={{
        background: C.pinkSoft, border: `1px solid ${C.pinkBorder}`,
        borderRadius: 10, padding: 10,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <Icon name="target" size={14} color={C.pink} />
        <span style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 500, color: C.pink, flex: 1 }}>
          Aware of: {lessonId || '—'} · {sectionName}
        </span>
        <span style={{ fontFamily: SANS, fontSize: 11, color: C.pink, cursor: 'pointer' }}>Change ▾</span>
      </div>

      {/* Suggested prompts */}
      {messages.length === 0 && (
        <div>
          <div style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 600, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
            Suggested prompts
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {SUGGESTED.map((s, i) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  height: 20, padding: '0 7px',
                  fontFamily: SANS, fontSize: 10.5, fontWeight: 500,
                  color: i === 0 ? C.pink : C.ink,
                  background: i === 0 ? C.pinkSoft : C.cream,
                  border: `1px solid ${i === 0 ? C.pinkBorder : C.borderSoft}`,
                  borderRadius: 999, cursor: 'pointer',
                }}
              >+ {s}</button>
            ))}
          </div>
        </div>
      )}

      {/* Conversation */}
      <div ref={scrollRef} style={{
        flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 14,
        paddingRight: 4,
      }}>
        {messages.map((msg, i) => (
          <AiBubble
            key={i}
            msg={msg}
            sectionName={sectionName}
            onInsert={msg.result ? (data) => onInsert(focusedSection, data) : undefined}
          />
        ))}
      </div>

      {/* Composer */}
      <div style={{
        background: C.surface,
        borderTop: `1px solid ${C.border}`,
        padding: '12px 0',
        marginLeft: -18, marginRight: -18, paddingLeft: 18, paddingRight: 18,
        flexShrink: 0,
      }}>
        <div style={{
          display: 'flex', alignItems: 'flex-end', gap: 8,
          padding: 10, background: C.cream,
          border: `1px solid ${C.borderSoft}`, borderRadius: 12,
        }}>
          <Icon name="paperclip" size={16} color={C.faint} />
          <textarea
            value={composer}
            onChange={(e) => setComposer(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(composer);
              }
            }}
            placeholder="Ask anything about this lesson…"
            rows={1}
            disabled={isStreaming}
            style={{
              flex: 1, border: 'none', outline: 'none', resize: 'none',
              fontFamily: SANS, fontSize: 13, color: C.ink,
              background: 'transparent', minHeight: 18,
            }}
          />
          <button
            onClick={() => sendMessage(composer)}
            disabled={isStreaming || !composer.trim()}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              height: 28, padding: '0 10px',
              fontFamily: SANS, fontSize: 12, fontWeight: 500,
              background: composer.trim() && !isStreaming ? C.pink : C.faint2,
              color: '#fff', border: 'none', borderRadius: 8,
              transition: 'background 0.15s',
            }}
          >
            <Icon name="arrowUp" size={13} color="#fff" />Send
          </button>
        </div>
      </div>
    </div>
  );
}
