'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { C, SANS, SECTION_CONFIG } from '@/lib/tokens';
import { emptySection } from '@/types/lesson';
import { LessonSelector } from '@/components/plan/lesson-selector';

function PlanNewInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lessonId = searchParams.get('lessonId');

  useEffect(() => {
    if (!lessonId) return;

    async function createAndRedirect() {
      const sections = SECTION_CONFIG.map((cfg, i) => ({
        ...emptySection(i),
        title: cfg.title,
        timing_minutes: cfg.timing_minutes,
      }));

      let planId: string | null = null;
      try {
        const res = await fetch('/api/lesson/new', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lesson_id: lessonId, sections, worksheet: null }),
        });
        const json = await res.json();
        if (res.ok && json.data?.id) planId = json.data.id;
      } catch { /* Supabase unavailable */ }

      if (!planId) {
        planId = crypto.randomUUID();
        sessionStorage.setItem(`plan_local_${planId}`, JSON.stringify({
          id: planId,
          lesson_id: lessonId,
          sections,
          worksheet: null,
        }));
      }

      router.replace(`/plan/${planId}`);
    }

    createAndRedirect();
  }, [lessonId, router]);

  // lessonId present — show loading while plan is created and redirect fires
  if (lessonId) {
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#FAF6F2', flexDirection: 'column', gap: 12,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 999,
          border: `3px solid ${C.pinkSoft}`,
          borderTopColor: C.pink,
          animation: 'spin 0.8s linear infinite',
        }} />
        <span style={{ fontFamily: SANS, fontSize: 14, color: C.faint }}>Opening lesson…</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // No lessonId — show full lesson selector modal
  return (
    <div style={{ height: '100vh', background: '#FAF6F2' }}>
      <LessonSelector onClose={() => router.back()} />
    </div>
  );
}

export default function PlanNewPage() {
  return (
    <Suspense fallback={
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#FAF6F2',
      }}>
        <span style={{ fontFamily: 'sans-serif', fontSize: 14, color: '#888' }}>Loading…</span>
      </div>
    }>
      <PlanNewInner />
    </Suspense>
  );
}
