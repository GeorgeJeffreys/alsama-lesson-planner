-- Migration: 001_create_lesson_plans
-- Creates the lesson_plans table used by the Alsama lesson plan editor.
--
-- lesson_id is a logical reference to a curriculum lesson identifier
-- (e.g. "0.S1.K1.H3") stored in curriculum.json. There is no enforced
-- FK to a database table since the curriculum lives in a flat file.

CREATE TABLE IF NOT EXISTS public.lesson_plans (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Logical FK to curriculum.json lesson identifier (e.g. "0.S1.K1.H3")
  lesson_id   TEXT        NOT NULL,

  -- Ordered array of 6 lesson sections. Each element matches LessonSection:
  -- { title, task, materials, teacher_instructions, student_instructions, timing_minutes }
  sections    JSONB       NOT NULL DEFAULT '[]'::jsonb,

  -- Optional worksheet attached to the lesson plan.
  -- Shape: { title, instructions, questions: [{ question, answer_hint? }] }
  worksheet   JSONB       DEFAULT NULL,

  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast look-up by curriculum lesson ID
CREATE INDEX IF NOT EXISTS lesson_plans_lesson_id_idx
  ON public.lesson_plans (lesson_id);

-- Automatically keep updated_at current on every row update
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS lesson_plans_set_updated_at ON public.lesson_plans;
CREATE TRIGGER lesson_plans_set_updated_at
  BEFORE UPDATE ON public.lesson_plans
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Row-level security (disabled for now — plans are accessed by UUID)
ALTER TABLE public.lesson_plans ENABLE ROW LEVEL SECURITY;

-- Allow unrestricted read/write while auth is not yet implemented.
-- Replace these with user-scoped policies when auth is added.
CREATE POLICY "public_read"  ON public.lesson_plans FOR SELECT USING (true);
CREATE POLICY "public_write" ON public.lesson_plans FOR ALL    USING (true) WITH CHECK (true);
