import type { LessonPlan } from '@/types/lesson';
import type { CurriculumLesson } from '@/types/curriculum';

function printFallback(plan: LessonPlan, lesson: CurriculumLesson | null): void {
  const sections = plan.sections ?? [];
  const today = new Date().toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const sectionsHtml = sections.map((s, i) => `
    <div class="section">
      <div class="section-header">
        <span class="section-num">${String(i + 1).padStart(2, '0')}</span>
        <span class="section-title">${s.title}</span>
        <span class="section-time">${s.timing_minutes === 0 ? 'Take-home' : `${s.timing_minutes} min`}</span>
      </div>
      ${s.task ? `<p class="task"><strong>Task:</strong> ${s.task}</p>` : ''}
      <div class="two-col">
        <div class="col teacher">
          <div class="col-label">Teacher does</div>
          <p>${s.teacher_instructions ? s.teacher_instructions.split('\n').map((l) => l.startsWith('**') ? `<strong>${l.replace(/\*\*/g, '')}</strong>` : `• ${l}`).join('<br>') : '—'}</p>
        </div>
        <div class="col student">
          <div class="col-label">Students do</div>
          <p>${s.student_instructions ? s.student_instructions.split('\n').map((l) => l.startsWith('**') ? `<strong>${l.replace(/\*\*/g, '')}</strong>` : `• ${l}`).join('<br>') : '—'}</p>
        </div>
      </div>
    </div>
  `).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Lesson Plan — ${lesson?.id ?? plan.lesson_id}</title>
<style>
  @page { size: A4; margin: 18mm 15mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 11pt; color: #1a1a1a; margin: 0; }
  h1 { font-size: 16pt; margin: 0 0 4px; color: #C44B4B; }
  .meta { font-size: 9pt; color: #6b6b6b; margin-bottom: 18px; }
  .lo-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 18px; }
  .lo-box { background: #fff5f5; border: 1px solid #f9c4c4; border-radius: 6px; padding: 8px; }
  .lo-label { font-size: 7.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #C44B4B; margin-bottom: 2px; }
  .lo-text { font-size: 9.5pt; line-height: 1.4; }
  .section { margin-bottom: 14px; border: 1px solid #e0d8d8; border-radius: 8px; overflow: hidden; page-break-inside: avoid; }
  .section-header { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: #fafafa; border-bottom: 1px solid #e0d8d8; }
  .section-num { font-size: 9pt; font-weight: 700; color: #888; min-width: 24px; }
  .section-title { font-size: 11pt; font-weight: 700; flex: 1; }
  .section-time { font-size: 9pt; color: #888; border: 1px solid #e0d8d8; border-radius: 999px; padding: 1px 7px; }
  .task { margin: 8px 12px 4px; font-size: 10pt; color: #444; }
  .two-col { display: grid; grid-template-columns: 1.5fr 1fr; }
  .col { padding: 8px 12px; }
  .teacher { border-right: 1px solid #e0d8d8; background: #fdf9f9; }
  .student { background: #f0fafa; }
  .col-label { font-size: 7.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px; }
  .teacher .col-label { color: #C44B4B; }
  .student .col-label { color: #2d8a7f; }
  .col p { margin: 0; font-size: 9.5pt; line-height: 1.55; }
  @media screen { body { max-width: 820px; margin: 0 auto; padding: 24px; } }
</style>
</head>
<body>
  <h1>${lesson?.id ?? plan.lesson_id}</h1>
  <div class="meta">${lesson?.year ?? ''} · ${lesson?.period ?? ''} · ${today}</div>
  ${lesson ? `
  <div class="lo-grid">
    <div class="lo-box"><div class="lo-label">Monthly LO</div><div class="lo-text">${lesson.skillLO || '—'}</div></div>
    <div class="lo-box"><div class="lo-label">Weekly LO</div><div class="lo-text">${lesson.knowledgeLO || '—'}</div></div>
    <div class="lo-box"><div class="lo-label">Daily LO</div><div class="lo-text">${lesson.dailyLO || '—'}</div></div>
  </div>` : ''}
  ${sectionsHtml}
</body>
</html>`;

  const win = window.open('', '_blank');
  if (!win) {
    throw new Error('Pop-up blocked. Please allow pop-ups for this site and try again.');
  }
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
  }, 400);
}

export async function exportLessonZip(
  plan: LessonPlan,
  lesson: CurriculumLesson | null,
): Promise<void> {
  try {
    const [
      { pdf },
      JSZip,
      { createElement },
      { LessonPlanPDF },
      { WorksheetPDF },
    ] = await Promise.all([
      import('@react-pdf/renderer'),
      import('jszip').then((m) => m.default),
      import('react'),
      import('./LessonPlanPDF'),
      import('./WorksheetPDF'),
    ]);

    const today = new Date().toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const toDoc = (el: unknown) => el as Parameters<typeof pdf>[0];

    const [planBlob, wsBlob] = await Promise.all([
      pdf(toDoc(createElement(LessonPlanPDF, { plan, lesson, date: today }))).toBlob(),
      pdf(toDoc(createElement(WorksheetPDF,  { plan, lesson, date: today }))).toBlob(),
    ]);

    const zip = new JSZip();
    const slug = (lesson?.id ?? plan.lesson_id).replace(/\./g, '-');
    zip.file(`alsama-lesson-plan-${slug}.pdf`,  planBlob);
    zip.file(`alsama-worksheet-${slug}.pdf`, wsBlob);

    const zipBlob = await zip.generateAsync({ type: 'blob' });

    const url = URL.createObjectURL(zipBlob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `alsama-${slug}.zip`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  } catch (pdfErr) {
    console.warn('[exportLessonZip] PDF renderer failed, falling back to print:', pdfErr);
    printFallback(plan, lesson);
  }
}
