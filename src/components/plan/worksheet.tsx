'use client';

import { useEditor, EditorContent, NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { useRef, useCallback, useEffect } from 'react';
import type { NodeViewProps } from '@tiptap/react';
import { C, SANS, SCRIPT } from '@/lib/tokens';
import { Icon } from '@/components/icon';
import type { CurriculumLesson } from '@/types/curriculum';

// ── Resizable image node view ──────────────────────────────────────────────────

function ResizableImageNodeView({ node, updateAttributes, selected }: NodeViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  function startResize(e: React.MouseEvent) {
    e.preventDefault();
    const startX = e.clientX;
    const startW = (containerRef.current?.querySelector('img') as HTMLImageElement | null)?.offsetWidth ?? 200;
    const containerW = containerRef.current?.parentElement?.offsetWidth ?? 400;

    const onMove = (me: MouseEvent) => {
      const newW = Math.max(60, Math.min(containerW, startW + me.clientX - startX));
      updateAttributes({ width: `${Math.round((newW / containerW) * 100)}%` });
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  return (
    <NodeViewWrapper>
      <div
        ref={containerRef}
        style={{ display: 'inline-block', position: 'relative', maxWidth: '100%', lineHeight: 0 }}
        contentEditable={false}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={node.attrs.src}
          alt={node.attrs.alt ?? ''}
          style={{
            width: node.attrs.width ?? '100%',
            display: 'block',
            borderRadius: 4,
            outline: selected ? `2px solid ${C.pink}` : 'none',
          }}
        />
        {selected && (
          <div
            onMouseDown={startResize}
            style={{
              position: 'absolute', bottom: -4, right: -4,
              width: 10, height: 10, borderRadius: 999,
              background: C.pink, border: '2px solid #fff',
              cursor: 'ew-resize', zIndex: 1,
            }}
          />
        )}
      </div>
    </NodeViewWrapper>
  );
}

const ResizableImage = ImageExtension.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: { default: '100%', renderHTML: (a) => ({ style: `width:${a.width}` }), parseHTML: (el) => el.style.width || '100%' },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageNodeView);
  },
});

// ── Toolbar ────────────────────────────────────────────────────────────────────

type TiptapEditor = ReturnType<typeof useEditor>;

function ToolbarBtn({
  active, onClick, children, title,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 28, height: 28, borderRadius: 6,
        background: active ? C.pinkSoft : 'transparent',
        border: active ? `1px solid ${C.pinkBorder}` : '1px solid transparent',
        cursor: 'pointer', color: active ? C.pink : C.ink,
        transition: 'background 0.1s',
      }}
    >{children}</button>
  );
}

function Divider() {
  return <div style={{ width: 1, height: 16, background: C.border, margin: '0 2px' }} />;
}

function Toolbar({ editor, onImageUpload }: { editor: TiptapEditor; onImageUpload: () => void }) {
  if (!editor) return null;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap',
      padding: '6px 10px', background: C.surface,
      border: `1px solid ${C.border}`, borderRadius: 10,
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    }}>
      {/* Text format */}
      <ToolbarBtn title="Heading 1" active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
        <Icon name="heading1" size={14} />
      </ToolbarBtn>
      <ToolbarBtn title="Heading 2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        <Icon name="heading2" size={14} />
      </ToolbarBtn>
      <ToolbarBtn title="Body" active={editor.isActive('paragraph')} onClick={() => editor.chain().focus().setParagraph().run()}>
        <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600 }}>P</span>
      </ToolbarBtn>

      <Divider />

      {/* Marks */}
      <ToolbarBtn title="Bold (⌘B)" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Icon name="bold" size={13} />
      </ToolbarBtn>
      <ToolbarBtn title="Italic (⌘I)" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Icon name="italic" size={13} />
      </ToolbarBtn>
      <ToolbarBtn title="Underline (⌘U)" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <Icon name="underline" size={13} />
      </ToolbarBtn>

      <Divider />

      {/* Lists */}
      <ToolbarBtn title="Bullet list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <Icon name="listBullet" size={14} />
      </ToolbarBtn>
      <ToolbarBtn title="Numbered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <Icon name="listOrdered" size={14} />
      </ToolbarBtn>

      <Divider />

      {/* Alignment */}
      <ToolbarBtn title="Align left" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}>
        <Icon name="alignLeft" size={14} />
      </ToolbarBtn>
      <ToolbarBtn title="Align center" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}>
        <Icon name="alignCenter" size={14} />
      </ToolbarBtn>

      <Divider />

      {/* Insert image */}
      <ToolbarBtn title="Insert image" onClick={onImageUpload}>
        <Icon name="image" size={14} color={C.faint} />
      </ToolbarBtn>

      <Divider />

      {/* Exercise blocks */}
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().insertContent(`
            <p><strong>Exercise: Fill in the blank</strong></p>
            <p>1. Hello, my ___ is ___.</p>
            <p>2. I am ___ years old.</p>
            <p><em>Word bank: name · am · is</em></p>
          `).run();
        }}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          height: 26, padding: '0 9px',
          fontFamily: SANS, fontSize: 10.5, fontWeight: 500,
          color: C.pink, background: C.pinkSoft,
          border: `1px solid ${C.pinkBorder}`, borderRadius: 6,
          cursor: 'pointer',
        }}
      >+ Fill-in-blank</button>

      <button
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().insertContent(`
            <p><strong>Exercise: Matching</strong></p>
            <p>Draw a line to match the question with the answer.</p>
            <p>What is your name? &nbsp;&nbsp;&nbsp; I am 12 years old.</p>
            <p>How old are you? &nbsp;&nbsp;&nbsp;&nbsp; My name is ___.</p>
          `).run();
        }}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          height: 26, padding: '0 9px',
          fontFamily: SANS, fontSize: 10.5, fontWeight: 500,
          color: C.teal, background: C.tealSoft,
          border: `1px solid #BCDED6`, borderRadius: 6,
          cursor: 'pointer',
        }}
      >+ Matching</button>
    </div>
  );
}

// ── Default worksheet content ──────────────────────────────────────────────────

const DEFAULT_CONTENT = `
<h2>Exercise 1 — Match the question with the answer</h2>
<p>Draw a line to connect each question to the correct answer.</p>
<p>What is your name? &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; I'm fine, thank you.</p>
<p>How old are you? &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; My name is Layla.</p>
<p>Where are you from? &nbsp;&nbsp;&nbsp; I'm 12 years old.</p>
<p>How are you? &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; I'm from Aleppo.</p>

<h2>Exercise 2 — Complete the sentences</h2>
<p>1. Hello, ___ name is Layla.</p>
<p>2. I ___ from Syria.</p>
<p>3. How ___ you? I am fine.</p>
<p>4. What ___ your name?</p>
<p><em>Word bank: my · am · are · is · how</em></p>

<h2>Exercise 3 — Introduce yourself</h2>
<p>Write 3 sentences about yourself:</p>
<p>1. ___________________________________________</p>
<p>2. ___________________________________________</p>
<p>3. ___________________________________________</p>
`;

// ── Main component ─────────────────────────────────────────────────────────────

interface WorksheetProps {
  lesson: CurriculumLesson | null;
  initialContent?: string;
  onSave?: (html: string) => void;
}

export function WorksheetView({ lesson, initialContent, onSave }: WorksheetProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const title = lesson?.dailyLO ?? 'Student Worksheet';
  const yearLabel = lesson?.year ?? 'Year';
  const weekLabel = lesson?.week != null ? `Week ${lesson.week}` : '';
  const periodLabel = lesson?.period ?? '';
  const lessonId = lesson?.id ?? '';

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      ResizableImage,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: 'Start typing or insert an exercise block…' }),
    ],
    content: initialContent || DEFAULT_CONTENT,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      if (!onSave) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => onSave(editor.getHTML()), 1500);
    },
    editorProps: {
      handleDrop(view, event, _slice, moved) {
        if (!moved && event.dataTransfer?.files.length) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
              if (e.target?.result) {
                const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });
                view.dispatch(view.state.tr.insert(
                  pos?.pos ?? view.state.doc.content.size,
                  view.state.schema.nodes.image.create({ src: e.target.result as string })
                ));
              }
            };
            reader.readAsDataURL(file);
            return true;
          }
        }
        return false;
      },
    },
  });

  // Sync if initialContent changes from parent (e.g., plan loads)
  useEffect(() => {
    if (editor && initialContent && editor.getHTML() !== initialContent) {
      editor.commands.setContent(initialContent, { emitUpdate: false });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialContent]);

  const handleImageUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        editor.chain().focus().setImage({ src: ev.target.result as string }).run();
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  return (
    <div style={{
      flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column',
      backgroundColor: C.creamDeep,
      backgroundImage: 'repeating-linear-gradient(45deg, rgba(0,0,0,0.018) 0 1px, transparent 1px 14px)',
    }}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={onFileChange}
      />

      {/* Sticky toolbar */}
      {editor && (
        <div style={{
          position: 'sticky', top: 0, zIndex: 10,
          background: C.surface, borderBottom: `1px solid ${C.border}`,
          padding: '8px 16px', display: 'flex', justifyContent: 'center',
        }}>
          <Toolbar editor={editor} onImageUpload={handleImageUpload} />
        </div>
      )}

      {/* Scrollable content */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '28px 0 40px' }}>
        {/* A4 Paper */}
        <div style={{
          width: 560, minHeight: 800,
          background: '#FFFFFF',
          border: `1px solid ${C.border}`,
          borderRadius: 4,
          padding: 44,
          boxShadow: '0 18px 60px rgba(82,50,30,0.10), 0 2px 8px rgba(82,50,30,0.06)',
          display: 'flex', flexDirection: 'column', gap: 18,
        }}>
          {/* Static header */}
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 16,
            paddingBottom: 14, borderBottom: `2px solid ${C.ink}`,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontFamily: SCRIPT, fontSize: 20, color: C.pink, lineHeight: 1 }}>Alsama</span>
                <span style={{ fontFamily: SANS, fontSize: 11, color: C.faint }}>· {yearLabel} English</span>
              </div>
              <h1 style={{ fontFamily: SANS, fontSize: 22, fontWeight: 700, color: C.ink, margin: 0, letterSpacing: '-0.01em' }}>
                {title}
              </h1>
              <span style={{ fontFamily: SANS, fontSize: 12, color: C.faint }}>
                {[weekLabel, periodLabel, lessonId].filter(Boolean).join(' · ')}
              </span>
            </div>
            <div style={{
              border: `1px solid ${C.border}`, padding: 8, borderRadius: 6,
              fontFamily: SANS, fontSize: 11, color: C.faint, minWidth: 150,
            }}>
              <div style={{ marginBottom: 6 }}>
                Name: <span style={{ borderBottom: `1px solid ${C.ink}`, display: 'inline-block', minWidth: 90 }}>&nbsp;</span>
              </div>
              <div>
                Date: <span style={{ borderBottom: `1px solid ${C.ink}`, display: 'inline-block', minWidth: 90 }}>&nbsp;</span>
              </div>
            </div>
          </div>

          {/* Tiptap editor area */}
          <div style={{ flex: 1 }}>
            <style>{`
              .tiptap-worksheet .ProseMirror {
                outline: none;
                font-family: ${SANS};
                font-size: 13.5px;
                line-height: 1.7;
                color: ${C.ink};
                min-height: 600px;
              }
              .tiptap-worksheet .ProseMirror h1 {
                font-size: 18px; font-weight: 700; margin: 16px 0 8px;
                color: ${C.ink}; letter-spacing: -0.01em;
              }
              .tiptap-worksheet .ProseMirror h2 {
                font-size: 14px; font-weight: 700; margin: 14px 0 6px;
                color: ${C.ink};
              }
              .tiptap-worksheet .ProseMirror p {
                margin: 0 0 6px;
              }
              .tiptap-worksheet .ProseMirror ul,
              .tiptap-worksheet .ProseMirror ol {
                padding-left: 20px; margin: 4px 0 8px;
              }
              .tiptap-worksheet .ProseMirror li {
                margin-bottom: 3px;
              }
              .tiptap-worksheet .ProseMirror strong { font-weight: 700; }
              .tiptap-worksheet .ProseMirror em { font-style: italic; }
              .tiptap-worksheet .ProseMirror u { text-decoration: underline; }
              .tiptap-worksheet .ProseMirror .is-editor-empty:first-child::before {
                content: attr(data-placeholder);
                float: left; color: ${C.faint2}; pointer-events: none; height: 0;
              }
            `}</style>
            <div className="tiptap-worksheet">
              <EditorContent editor={editor} />
            </div>
          </div>

          {/* Footer */}
          <div style={{
            marginTop: 'auto', paddingTop: 14,
            borderTop: `1px solid ${C.border}`,
            display: 'flex', justifyContent: 'space-between',
          }}>
            <span style={{ fontFamily: SANS, fontSize: 10, color: C.faint }}>
              Alsama · {yearLabel} Eng · {weekLabel}
            </span>
            <span style={{ fontFamily: SANS, fontSize: 10, color: C.faint }}>Student Worksheet</span>
          </div>
        </div>
      </div>
    </div>
  );
}
