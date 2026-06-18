# 04 — Reuse Manifest

> Classification of every significant file/dir for the rebuild (fresh Next.js 15 App Router + Tailwind, brand-new design, MS SSO, multi-school/subject/role, SMARTT + 9 timed blocks, approval workflow, **Word .docx** export).
>
> **PORT** = reuse ~as-is · **ADAPT** = logic useful, needs rework for new schema/structure · **DISCARD** = do not reuse (default for all UI/design/styles and the old 6-section model).
>
> Reminder: `George-Jeffreys-clean-lesson-planner-only/` is a byte-identical duplicate of the whole project → **DISCARD entirely** (don't carry the nested copy forward).

## Curriculum ingestion

| Path | What it is | Verdict | Reason |
|---|---|---|---|
| `src/data/curriculum.json` | The full baked curriculum (947 keys / 1287 rows) | **PORT** | Hard-won real data; reusable as-is, ideally migrated into a DB table. Clean out the 18 `#N/A` values and empty `L.*` rows. |
| `src/lib/curriculumUtils.ts` | In-memory index + query API over the JSON | **PORT** | Pure, design-free, well-shaped query layer. Only needs subject-awareness later (doc 03). |
| `src/lib/curriculum-actions.ts` | `'use server'` async wrappers | **PORT** | Thin, clean server-action surface; reuse directly. |
| `src/types/curriculum.ts` | `CurriculumLesson` / `CurriculumLookup` types | **PORT** | Accurate to the data. Add `subject` when multi-subject lands. |
| *(missing)* spreadsheet→JSON ingestion script | — | **(BUILD NEW)** | Not in repo; must be (re)created — see doc 03. |

## Supabase / data layer

| Path | What it is | Verdict | Reason |
|---|---|---|---|
| `src/lib/supabase.ts` | Service-role server client factory | **ADAPT** | Pattern is fine, but currently bypasses RLS with the service key on every call. Rebuild needs per-user (SSO) clients honoring RLS. |
| `src/lib/supabase-browser.ts` | Anon browser singleton | **ADAPT** | Reusable singleton pattern, but currently unused; will become the real auth'd client under SSO. |
| `supabase/migrations/001_create_lesson_plans.sql` | The only migration | **ADAPT** | Table mechanics (UUID PK, JSONB, `updated_at` trigger) are a good template, but the schema itself (6-section model, open RLS, no ownership/school/subject/approval) must be redesigned. |
| `src/app/api/lesson/[id]/route.ts` | Lesson CRUD (GET/POST upsert) | **ADAPT** | Solid REST + validation skeleton, but `validateBody` hard-codes **exactly 6 sections** and the old field names; rewrite for 9 blocks + SMARTT + ownership/approval. |
| `src/types/lesson.ts` | `LessonPlan` / `LessonSection` / `Worksheet` types + defaults | **ADAPT** | Useful as a starting structure; the section model changes (6→9, new fields, SMARTT, literate/illiterate banks). `SECTION_DEFAULTS` is partly dead (UI uses `tokens.SECTION_CONFIG`). |

## API & AI

| Path | What it is | Verdict | Reason |
|---|---|---|---|
| `src/app/api/ai/route.ts` | Streaming Anthropic section generator (SSE + tool-calling) | **PORT** (plumbing) / **ADAPT** (content) | The **transport** is excellent and directly reusable: `messages.stream`, ephemeral prompt cache, forced-tool JSON, SSE re-emit. **Adapt** the model id (`claude-sonnet-4-5` → latest, e.g. an Opus/Sonnet 4.x), the hard-coded English-only system prompt, the `{teacherInstructions, studentInstructions}` tool schema (→ SMARTT/9-block shape), and `max_tokens: 1024`. |
| `components/plan/ai-panel.tsx` (SSE client parser) | Browser-side stream reader | **ADAPT** | The UI is DISCARD, but the `\n\n`-framed SSE parsing loop (delta/done/error) is reusable logic — lift it into a hook. |

## Export

| Path | What it is | Verdict | Reason |
|---|---|---|---|
| `src/lib/pdf/export.ts` | Renders 2 PDFs, zips, downloads; HTML print fallback | **ADAPT / mostly DISCARD** | New app exports **.docx**, not PDF — the `@react-pdf/renderer` rendering is not reusable. The orchestration idea (build doc → blob → download, with fallback) and the data→document field mapping are useful references. |
| `src/lib/pdf/LessonPlanPDF.tsx` | React-PDF lesson plan layout | **DISCARD** (reference only) | Old design + old 6-section model. Its field-mapping (which lesson/section fields appear where) is a useful spec for the .docx template. |
| `src/lib/pdf/WorksheetPDF.tsx` | React-PDF worksheet | **DISCARD** | Old design **and** broken: ignores `plan.worksheet`, hard-codes intro-themed exercises. Do not port. |

## UI / components (all DISCARD by default — new design, zero old UI)

| Path | What it is | Verdict | Reason |
|---|---|---|---|
| `src/app/page.tsx` | redirect `/ → /plan/new` | **DISCARD** | Trivial; rebuild routing fresh (will need a real authed landing). |
| `src/app/layout.tsx` | Fonts + globals | **DISCARD** | Sora/Sacramento + cream/pink branding is the old design. |
| `src/app/globals.css` | Tailwind v4 `@theme` + old palette + print CSS | **DISCARD** | Old brand tokens/theme. |
| `src/app/plan/[uuid]/page.tsx` | Plan loader (server) | **ADAPT** (data wiring) | Loading pattern (Supabase by UUID + curriculum pre-resolve) is reusable; UUID-only access and the `?lessonId=` flow change under auth. |
| `src/app/plan/[uuid]/plan-editor.tsx` (600 lines) | The editor | **DISCARD** | Heavy old-design UI with autosave/DnD/resize logic baked in (see trap below). |
| `src/app/plan/[uuid]/view/*` | Read-only plan view | **DISCARD** | Old design. |
| `src/app/curriculum/*` (`curriculum-explorer.tsx`) | Curriculum browser page | **DISCARD** (UI) | The *visualizations* are old design; the underlying `curriculumUtils` queries they call are PORTed. |
| `src/components/curriculum/ce-*.tsx` (shell, calendar, journey, content, lesson-drawer ~2.3k lines) | Curriculum explorer UI | **DISCARD** | Pure old-design view layer. |
| `src/components/plan/*.tsx` (section-card, top-bar, meta-header, library-panel, ai-panel, examples-panel, lesson-selector, worksheet, timing-popover) | Editor UI | **DISCARD** | Old design. Note `library-panel.tsx` `LIBRARY_CARDS` and `examplePlans.ts` are *content* (see ADAPT row below). |
| `src/components/plan/mobile/*.tsx` (7 files) | Mobile editor variant | **DISCARD** | Old design. |
| `src/components/icon.tsx` | Inline SVG icon set | **DISCARD** | Pick a fresh icon system. |
| `src/hooks/useBreakpoint.ts`, `useKeyboardHeight.ts` | Responsive/keyboard hooks | **DISCARD** (or trivially re-derive) | Generic but tiny; not worth porting. |
| `src/data/examplePlans.ts` | 8 hand-written example lesson plans | **ADAPT** (content) | The *pedagogical content* (8 teaching approaches × 6 sections of real instructions) is valuable seed material; the 6-section structure must be remapped to the new 9-block model. |
| `components/plan/library-panel.tsx` → `LIBRARY_CARDS` | 6 exercise templates (fill-blank, matching, dialogue, etc.) | **ADAPT** (content) | Good raw material for the new "activity banks", but only **6** cards exist despite the UI label "All 124" (see trap). Extract the content, drop the component. |

## Config

| Path | Verdict | Reason |
|---|---|---|
| `package.json` | **ADAPT** | Keep Supabase + Anthropic SDK; re-evaluate `@react-pdf/renderer`+`jszip` (→ a .docx lib like `docx`), Tiptap (if worksheet RTE returns), dnd-kit (if DnD returns). Rename from `next-scaffold`. |
| `next.config.ts` | **ADAPT** | Only sets `serverExternalPackages` for react-pdf; revisit for the docx lib. |
| `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs` | **PORT** (regenerate) | Standard; regenerate fresh with the new scaffold. |
| `README.md` | **DISCARD** | Still the default create-next-app boilerplate. |
| `AGENTS.md` / `CLAUDE.md` | **PORT** | Project conventions (the Next.js-version warning) carry forward. |
| `public/*.svg`, `favicon.ico` | **DISCARD** | Scaffold assets. |
| `George-Jeffreys-clean-lesson-planner-only/**` | **DISCARD** | Duplicate of the entire project. |

## Utilities

| Path | Verdict | Reason |
|---|---|---|
| `src/lib/tokens.ts` | **DISCARD** | Brand colours/fonts = old design. `SECTION_CONFIG` here is the *de-facto* lesson model — capture it as a spec, then discard (new model is 9 blocks). |
| `src/lib/curriculumUtils.ts`, `curriculum-actions.ts` | **PORT** | (Listed above — the crown jewels.) |

---

## Recommendations

### Port first (highest value, lowest risk)
1. **`src/data/curriculum.json`** — the real curriculum data. Irreplaceable; the generator that built it is *not* in the repo.
2. **`src/lib/curriculumUtils.ts` + `curriculum-actions.ts` + `types/curriculum.ts`** — clean, pure, design-free query layer over that data. Reuse nearly verbatim.
3. **The AI transport in `src/app/api/ai/route.ts`** — SSE + forced-tool JSON + prompt caching is a strong, reusable pattern. Swap the model id and prompt/schema.

### Adapt
- **Supabase layer + lesson CRUD route** — keep the upsert/validation/`updated_at` mechanics; redesign the schema (ownership, school, subject, approval state, 9 blocks, SMARTT) and make clients honor RLS under SSO instead of using the service key everywhere.
- **Content, not code:** mine `examplePlans.ts` (8 approaches) and `LIBRARY_CARDS` (6 exercises) for the new activity banks / examples; remap from 6 sections to 9 blocks.
- **Field-mapping specs:** use `LessonPlanPDF.tsx` as the reference for what fields the new **.docx** template should surface.

### Do NOT bring into the new app
- All UI: every file in `src/components/**`, `src/app/**/*.tsx` view components, `plan-editor.tsx`, the mobile suite, `curriculum-explorer` + `ce-*`, `icon.tsx`.
- All design/theme: `src/lib/tokens.ts`, `src/app/globals.css`, `layout.tsx` fonts, `public/*.svg`.
- The PDF renderers (`LessonPlanPDF`, `WorksheetPDF`) and `@react-pdf/renderer`/`jszip` — replaced by .docx.
- The "Aya" assistant UI and single-section chat framing.
- The old **6-section** model everywhere (`SECTION_CONFIG`, `SECTION_DEFAULTS`, the API's `=== 6` check).
- The entire `George-Jeffreys-clean-lesson-planner-only/` duplicate.

### Surprises & traps
- **Duplicated project tree** — the whole app is committed twice (root + `George-Jeffreys-clean-lesson-planner-only/`), byte-identical. Easy to accidentally port the wrong copy.
- **No ingestion script** — only the *output* `curriculum.json` exists; the spreadsheet parser must be rebuilt/recovered. Biggest single gap.
- **Two competing 6-section definitions** — `types/lesson.ts:SECTION_DEFAULTS` vs `tokens.ts:SECTION_CONFIG`. The UI uses the latter; the former is largely dead. Don't assume `types/lesson.ts` is authoritative.
- **Worksheet PDF is fake** — `WorksheetPDF.tsx` ignores the `worksheet` JSONB entirely and renders hard-coded "introductions" exercises. The `worksheet` column is effectively write-only. Don't treat the worksheet export as working.
- **No auth, service-role everywhere** — RLS is enabled but fully open, *and* all access uses the service-role key, so RLS is moot. Plans are world-readable/writable by UUID. The browser anon client is dead code.
- **Messy data leaks to AI/PDF** — 18 literal `#N/A` strings and empty `L.*` rows flow unfiltered into prompts and documents.
- **UI ↔ logic coupling in the editor** — `plan-editor.tsx` (600 lines) embeds autosave (debounce + `sessionStorage` mirror + API), drag-drop merge logic (`insertLibraryCard`/`onDragEnd` build `**header**`-formatted strings), export orchestration, and panel-resize all inside one client component. The reusable *behaviors* (autosave-with-offline-fallback, SSE consumption) are worth extracting into hooks before discarding the component; they are not cleanly separable today.
- **`require()` of a 950 KB JSON** — deliberate (typed via cast to keep `tsc` fast). Fine at this size, but a DB-backed curriculum is the better long-term move for multi-school/subject scale.
- **Model string is already dated** — `claude-sonnet-4-5`; the rebuild should target the latest Claude model.
