# 02 — Supabase Schema

> Source of truth audited: `supabase/migrations/001_create_lesson_plans.sql` (the only migration) and the TypeScript row types in `src/types/lesson.ts`. There is **no** `database.types.ts` / generated `supabase.ts` in the repo — types are hand-written.

## Tables

There is exactly **one** table: `public.lesson_plans`. No other tables, views, or enums are defined anywhere in the repo. There is no `schools`, `subjects`, `users`, `roles`, or `approvals` table — the multi-school / multi-role / approval model in the rebuild is entirely green-field.

### `public.lesson_plans`

| Column | Type | Constraints / Default | Notes |
|---|---|---|---|
| `id` | `UUID` | **PK**, `DEFAULT gen_random_uuid()` | Plan UUID; reached directly via the URL. |
| `lesson_id` | `TEXT` | `NOT NULL` | **Logical** reference to a `curriculum.json` key (e.g. `"0.S1.K1.H3"`). **No DB foreign key** — the curriculum lives in a flat file, so this is unenforced. |
| `sections` | `JSONB` | `NOT NULL DEFAULT '[]'::jsonb` | Ordered array of lesson sections (shape below). |
| `worksheet` | `JSONB` | `DEFAULT NULL` | Optional worksheet (shape below). |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Auto-maintained by trigger. |

**Indexes:** `lesson_plans_lesson_id_idx` on `(lesson_id)`.

**Triggers / functions:** `public.set_updated_at()` (plpgsql) bumps `updated_at = now()` on every `UPDATE`, wired via `BEFORE UPDATE` trigger `lesson_plans_set_updated_at`.

**Enums:** none.

## JSONB shapes (from `src/types/lesson.ts`)

These are not enforced by Postgres (it's plain JSONB); they are enforced only by the API route's `validateBody` (`src/app/api/lesson/[id]/route.ts`).

### `sections` — `LessonSection[]`

```ts
interface LessonSection {
  title: string;                 // e.g. "Warm-Up"
  task: string;                  // what teacher/students do
  materials: string;             // comma-separated in practice (PDF splits on ",")
  teacher_instructions: string;  // newline-separated steps; "**x**" lines render as headings
  student_instructions: string;  // newline-separated prompts
  timing_minutes: number;        // 0 = "Take-home"
}
```

### `worksheet` — `Worksheet | null`

```ts
interface Worksheet {
  title: string;
  instructions: string;          // editor stores Tiptap HTML here
  questions: WorksheetQuestion[]; // { question: string; answer_hint?: string }
}
```

> **Important mismatch / trap:** The migration comment says `sections` is an array of **6**, and the API `validateBody` **hard-requires exactly 6 sections**. But two different 6-section vocabularies exist in code:
> - `SECTION_DEFAULTS` in `src/types/lesson.ts`: *Warm-Up, Presentation/Input, Guided Practice, Independent Practice, Assessment/Feedback, Wrap-Up & Homework*.
> - `SECTION_CONFIG` in `src/lib/tokens.ts` (the one the UI actually uses): *Warm-up & Recap, New Content, Check for Understanding, Independent Practice, Exit Ticket, Homework*.
>
> The editor and `LessonSelector` build sections from `SECTION_CONFIG`; `emptyLessonPlan`/`SECTION_DEFAULTS` are dead-ish defaults. The rebuild's "SMARTT objective + nine timed blocks" replaces both — note the count changes from **6 → 9**, so the API's hard `=== 6` check and the section model must change.
>
> **Also:** in practice the `worksheet` column is written by the editor (Tiptap HTML into `worksheet.instructions`, `questions: []`) but **never read back into the worksheet PDF** (the PDF is hard-coded). So the column is effectively write-only today.

## Row-level security / auth

- RLS **is enabled** on the table (`ALTER TABLE … ENABLE ROW LEVEL SECURITY`), but the two policies make it fully open:
  ```sql
  CREATE POLICY "public_read"  ON public.lesson_plans FOR SELECT USING (true);
  CREATE POLICY "public_write" ON public.lesson_plans FOR ALL    USING (true) WITH CHECK (true);
  ```
  The migration explicitly notes these are placeholders to "Replace … with user-scoped policies when auth is added."
- Moreover, **all application DB access uses the service-role key** (`createServerClient`), which bypasses RLS entirely regardless of policy.

## Authentication — confirmed finding

**There is no authentication of any kind.** Confirmed:
- No `@supabase/auth-helpers` / `@supabase/ssr`, no NextAuth, no middleware (`middleware.ts` absent), no login route, no session/cookie handling, no `auth.users` references.
- Plans are addressed **solely by UUID in the URL** (`/plan/{uuid}`, `/plan/{uuid}/view`). Anyone with the UUID can read or overwrite a plan. There is no user/owner column on `lesson_plans`.
- The API route validates the body and that `id` is a UUID, but performs **no authorization**.

This matches the stated expectation: the old app has no auth and plans are reached by UUID. Microsoft SSO + a real RLS/ownership model is entirely new work for the rebuild.
