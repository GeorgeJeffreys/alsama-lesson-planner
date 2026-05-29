import { createServerClient } from '@/lib/supabase';
import { getLessonById } from '@/lib/curriculumUtils';
import type { LessonPlan } from '@/types/lesson';
import type { CurriculumLesson } from '@/types/curriculum';
import { PlanView } from './plan-view';

function isUUID(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export default async function PlanViewPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;

  let plan: LessonPlan | null = null;
  let lesson: CurriculumLesson | null = null;

  if (isUUID(uuid)) {
    const supabase = createServerClient();
    const { data } = await supabase
      .from('lesson_plans')
      .select('*')
      .eq('id', uuid)
      .maybeSingle();

    if (data) plan = data as LessonPlan;
  }

  if (plan?.lesson_id) {
    const raw = getLessonById(plan.lesson_id);
    lesson = raw ? (Array.isArray(raw) ? raw[0] : raw) : null;
  }

  return <PlanView plan={plan} lesson={lesson} />;
}
