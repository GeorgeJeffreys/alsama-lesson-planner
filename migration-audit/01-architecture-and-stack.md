# 01 — Architecture & Stack

> Read-only audit of the existing ALSAMA lesson-planner. All file paths are relative to the repo root.
>
> **Repo layout note:** the project exists twice — once at the repo root (`src/`, `package.json`, …) and once duplicated under `George-Jeffreys-clean-lesson-planner-only/`. `diff -rq` shows the two `src/` trees are **byte-identical**. The nested copy appears to be a vendored snapshot and should be ignored / deleted in the rebuild. This audit describes the root copy.

## Framework & key versions (from `package.json`)

The `package.json` `name` is `next-scaffold` (it was bootstrapped from a scaffold and never renamed).

| Package | Version | Role |
|---|---|---|
| `next` | **16.2.6** | App Router framework. (Note: AGENTS.md warns this is a non-standard/breaking Next build — consult `node_modules/next/dist/docs/` before relying on training-data conventions.) |
| `react` / `react-dom` | 19.2.4 | UI runtime |
| `typescript` | ^5 | Strict mode on (`tsconfig.json`) |
| `tailwindcss` + `@tailwindcss/postcss` | ^4 | Tailwind v4 (CSS-first config via `@theme` in `globals.css`; no `tailwind.config.js`) |
| `@anthropic-ai/sdk` | ^0.98.0 | AI section generation (`src/app/api/ai/route.ts`) |
| `@supabase/supabase-js` | ^2.106.2 | Data layer (lesson plan persistence) |
| `@react-pdf/renderer` | ^4.5.1 | PDF export (lesson plan + worksheet) |
| `jszip` | ^3.10.1 | Bundles the two export PDFs into one `.zip` |
| `@dnd-kit/core` `/sortable` `/utilities` | 6/10/3 | Drag-and-drop of "exercise" cards onto sections in the editor |
| `@tiptap/*` (react, starter-kit, image, placeholder, text-align, underline, pm) | ^3.23 | Rich-text editor for the "Student Worksheet" tab |

Scripts: `dev`, `build`, `start` (all stock `next`), `lint` (`eslint`). No test runner, no seed/ingestion script.

## App structure (App Router routes)

All routes live under `src/app`. There is **no global nav** — the root redirects straight into the editor.

| Route | File | What it does |
|---|---|---|
| `/` | `app/page.tsx` | Server component; immediately `redirect('/plan/new')`. |
| `/plan/[uuid]` | `app/plan/[uuid]/page.tsx` → `plan-editor.tsx` | **The core app.** Server component loads the plan from Supabase by UUID (or treats `new`), pre-resolves the curriculum lesson via `?lessonId=`, then hands off to the client `PlanEditor`. The editor: a 6-section lesson template with autosave, a right-hand panel with three tabs (**Exercises** library / **AI** chat ("Aya") / **Lessons** example plans), drag-drop of exercise cards onto sections, a timing popover, PDF/zip export, and a separate Tiptap "Student Worksheet" view. Has a full **mobile variant** (`components/plan/mobile/MobilePlanEditor`) chosen via `useBreakpoint`. |
| `/plan/[uuid]/view` | `app/plan/[uuid]/view/page.tsx` → `plan-view.tsx` | Read-only render of a saved plan (loaded from Supabase by UUID). |
| `/curriculum` | `app/curriculum/page.tsx` → `curriculum-explorer.tsx` | A large read-only **curriculum browser** with three modes (`CeModeTabs`): **Calendar** (months → weeks → periods), **Journey** (skill-LO → knowledge-LO org chart), and **Content** (skill / theme grids). Pure visualization of `curriculum.json`; does not create plans. |
| `POST/GET /api/lesson/[id]` | `app/api/lesson/[id]/route.ts` | Lesson-plan CRUD (see Data flow). |
| `POST /api/ai` | `app/api/ai/route.ts` | Streaming AI section generation (see AI integration). |

`app/layout.tsx` registers two Google fonts (Sora as body, Sacramento for the wordmark) and imports `globals.css`. `app/favicon.ico` + `public/*.svg` are stock scaffold assets.

## Data flow (end to end)

**Curriculum (read-only reference):** `src/data/curriculum.json` (~950 KB, 947 keys) is imported directly into `src/lib/curriculumUtils.ts` via `require()` and indexed in memory. Server components and server actions (`src/lib/curriculum-actions.ts`, marked `'use server'`) call these utils. No database table backs the curriculum.

**Lesson plans (read/write):**
1. **Create:** `LessonSelector` (in the editor) picks a curriculum lesson, builds 6 empty sections from `SECTION_CONFIG`, and `POST`s to `/api/lesson/new`. The route uses the **service-role** Supabase client (`createServerClient`) to `upsert` and returns the generated UUID; the client then `router.push('/plan/{uuid}')`.
2. **Read:** `app/plan/[uuid]/page.tsx` reads the row server-side with the service-role client (`.eq('id', uuid).maybeSingle()`).
3. **Update (autosave):** `DesktopPlanEditor.scheduleSave` debounces 2 s and `POST`s the whole plan to `/api/lesson/{uuid}` (full replace, not patch).
4. **Offline fallback:** if Supabase is unreachable, plans are persisted to `sessionStorage` under `plan_local_{uuid}` and a client-side `crypto.randomUUID()` is used. The editor hydrates from `sessionStorage` when the server returns no row.

The browser anon client exists (`src/lib/supabase-browser.ts`) but is **not actually used** by any current screen — all DB access goes through the API routes / server components with the service-role key.

## Anthropic AI integration

- **Route:** `src/app/api/ai/route.ts` (`POST`). One endpoint only.
- **Model string:** `const MODEL = "claude-sonnet-4-5";`
- **SDK:** `@anthropic-ai/sdk`, instantiated once with `process.env.ANTHROPIC_API_KEY`.
- **Streaming:** yes — `client.messages.stream(...)` server-side, re-emitted to the browser as **SSE** (`Content-Type: text/event-stream`) via a `ReadableStream`. The client (`components/plan/ai-panel.tsx`) reads the body with a `ReadableStreamDefaultReader`, splits on `\n\n`, and parses `data: {…}` frames of type `delta` / `done` / `error`.
- **Structured output:** uses **tool calling** to force JSON. A single tool `generate_section_content` with `tool_choice: { type: "tool", name: ... }` and an `input_schema` of `{ teacherInstructions, studentInstructions }`. The route accumulates `input_json_delta` chunks, `JSON.parse`s the buffer at the end, and emits a `done` event with the parsed object.
- **Prompt caching:** the system prompt is sent as a `system` block with `cache_control: { type: "ephemeral" }`.
- **Prompt assembly:** `SYSTEM_PROMPT` is a hard-coded ALSAMA persona (refugee-education NGO in Lebanon, CEFR pre-A1→B2, volunteer teachers, low-resource/trauma-informed). `buildUserPrompt(lesson, sectionName, existingContent)` injects the curriculum lesson's fields (id, year, dailyLO, linguisticSkill, skillLO, knowledgeLO, grammarFocus, vocabFocus, theme, resources) plus the target section name and any existing content.
- **Request body:** `{ sectionName, lessonId, existingContent? }`. The route looks up the lesson via `getLessonById(lessonId)` (falling back to `[0]` for array/exam IDs) and 404s if not found. `max_tokens: 1024`.
- **What the feature does today:** generates teacher + student instructions for **one section at a time**. It is presented in the UI as a chat assistant named **"Aya"**, but it is single-shot per message (no multi-turn memory is sent — each call only forwards the latest `existingContent` as the user turn). The "suggested prompts" (e.g. "Add Arabic L1 scaffolding") are just text seeds passed as `existingContent`; the route always generates for the focused section regardless of prompt wording.

## Export pipeline

- **Library:** `@react-pdf/renderer` (declared in `serverExternalPackages` in `next.config.ts`), bundled with `jszip`. Output is **PDF**, not `.docx`. (The new app's Word requirement is therefore a green-field build, not a port.)
- **Entry:** `src/lib/pdf/export.ts` → `exportLessonZip(plan, lesson)`. Dynamically imports the renderer, JSZip, and the two document components, renders both to blobs, zips them as `alsama-lesson-plan-{slug}.pdf` + `alsama-worksheet-{slug}.pdf`, and triggers a browser download of `alsama-{slug}.zip` (slug = lesson id with `.`→`-`).
- **Fallback:** on any renderer error it calls `printFallback`, which builds an inline HTML string and opens a print window (`window.open` + `window.print`).
- **Documents:**
  - `src/lib/pdf/LessonPlanPDF.tsx` — maps the plan faithfully: header (wordmark, dailyLO, year/week/period, teacher, date, total minutes), a "Lesson overview" box (id, daily LO, grammar/vocab, theme, skill), then one card per section rendering `task`, `materials` (comma-split into chips), and a two-column `teacher_instructions` / `student_instructions` (newline-split into bullets, `**…**` treated as a heading).
  - `src/lib/pdf/WorksheetPDF.tsx` — **largely hard-coded.** Exercises 1–3 (matching, fill-in-the-blank, free writing) use static `MATCH_PAIRS` / `FILL_SENTENCES` constants about *introductions*, **not** `plan.worksheet`. Only Exercise 4 ("Class activities") is dynamic, derived from sections that have a `task`/`student_instructions`. **The `worksheet` JSONB column is never read by the PDF.** (See doc 04 — trap.)

## Environment variables & config (names only)

Referenced in code (`grep process.env`):

- `ANTHROPIC_API_KEY` — server only (`api/ai`).
- `NEXT_PUBLIC_SUPABASE_URL` — server + browser clients.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — browser client only.
- `SUPABASE_SERVICE_ROLE_KEY` — server client (`createServerClient`). **All current DB writes use this service-role key, bypassing RLS.**

No `.env*` file is committed (none found). No `vercel.json`. No `supabase/config.toml` — only `supabase/migrations/001_create_lesson_plans.sql`.

**Config files:** `next.config.ts` (only sets `serverExternalPackages: ['@react-pdf/renderer']`); `postcss.config.mjs` (Tailwind v4 plugin); `eslint.config.mjs` (next core-web-vitals + TS); `tsconfig.json` (strict, `@/* → ./src/*`). Build is the stock `next build`; intended for Vercel per the boilerplate README (still the default `create-next-app` README).
