// ── Lesson plan section ───────────────────────────────────────────────────────
// Matches the six-section Alsama lesson template.
// The sections array is always ordered:
//   0  Warm-Up
//   1  Presentation / Input
//   2  Guided Practice
//   3  Independent Practice
//   4  Assessment / Feedback
//   5  Wrap-Up & Homework

export interface LessonSection {
  /** Descriptive label for this section (e.g. "Warm-Up"). */
  title: string;
  /** What the teacher / students are doing in this section. */
  task: string;
  /** Physical or digital materials required. */
  materials: string;
  /** Step-by-step instructions for the teacher. */
  teacher_instructions: string;
  /** Instructions / prompts surfaced to students. */
  student_instructions: string;
  /** Planned duration in minutes. */
  timing_minutes: number;
}

// ── Worksheet ─────────────────────────────────────────────────────────────────

export interface WorksheetQuestion {
  question: string;
  answer_hint?: string;
}

export interface Worksheet {
  title: string;
  instructions: string;
  questions: WorksheetQuestion[];
}

// ── Lesson plan ───────────────────────────────────────────────────────────────

/** Row shape as stored in (and returned from) Supabase. */
export interface LessonPlan {
  id: string;
  /** References a lesson identifier in curriculum.json, e.g. "0.S1.K1.H3". */
  lesson_id: string;
  sections: LessonSection[];
  worksheet: Worksheet | null;
  created_at: string;
  updated_at: string;
}

// ── Request / response bodies ─────────────────────────────────────────────────

/** Body accepted by POST /api/lesson/[id] */
export interface UpsertLessonPlanBody {
  lesson_id: string;
  sections: LessonSection[];
  worksheet?: Worksheet | null;
}

/** Payload returned by both GET and POST /api/lesson/[id] */
export interface LessonPlanResponse {
  data: LessonPlan | null;
  error?: string;
}

// ── Defaults ──────────────────────────────────────────────────────────────────

export const SECTION_DEFAULTS: Pick<LessonSection, "title" | "timing_minutes">[] = [
  { title: "Warm-Up",                timing_minutes: 5  },
  { title: "Presentation / Input",   timing_minutes: 15 },
  { title: "Guided Practice",        timing_minutes: 15 },
  { title: "Independent Practice",   timing_minutes: 15 },
  { title: "Assessment / Feedback",  timing_minutes: 5  },
  { title: "Wrap-Up & Homework",     timing_minutes: 5  },
];

export function emptySection(index: number): LessonSection {
  const defaults = SECTION_DEFAULTS[index] ?? { title: `Section ${index + 1}`, timing_minutes: 10 };
  return {
    title:                defaults.title,
    task:                 "",
    materials:            "",
    teacher_instructions: "",
    student_instructions: "",
    timing_minutes:       defaults.timing_minutes,
  };
}

export function emptyLessonPlan(lessonId: string): Omit<LessonPlan, "id" | "created_at" | "updated_at"> {
  return {
    lesson_id: lessonId,
    sections:  Array.from({ length: 6 }, (_, i) => emptySection(i)),
    worksheet: null,
  };
}
