# 03 — Curriculum Ingestion

> This is the highest-value area to port. Audited: `src/data/curriculum.json`, `src/types/curriculum.ts`, `src/lib/curriculumUtils.ts`, `src/lib/curriculum-actions.ts`.

## How curriculum data gets into the app

**It doesn't get ingested at runtime — it's pre-baked.** The repo contains **only the committed output** `src/data/curriculum.json` (~950 KB). There is:

- **No** Excel/CSV/XLSX parser (`grep` for `xlsx`/`sheetjs`/`papaparse`/`csv-parse`/`exceljs` → nothing).
- **No** `scripts/` directory and **no** seed/build/ingestion script of any kind in `package.json` or the tree.
- **No** source spreadsheet committed.

So the spreadsheet → JSON conversion happened **outside this repo** and was never committed. **The rebuild will need to recreate (or recover) that conversion step** — this is the single biggest gap. What *is* here is (a) the finished JSON and (b) the consuming utilities, both of which are reusable.

`curriculumUtils.ts` loads the JSON once via `require("@/data/curriculum.json")` (deliberately `require`d, not `import`ed, with a cast — comment: avoids slow type-checking of ~950 KB) and builds in-memory indexes lazily.

## Lesson-ID / taxonomy scheme

IDs are the **keys** of `curriculum.json` and follow `{skill}.{S#}.{K#}.{H#}` (documented in `src/types/curriculum.ts`):

```
0.S1.K1.H3
│  │  │  └ H# hour/period reference within the knowledge unit
│  │  └─── K# knowledge-LO reference (K0 = none)
│  └────── S# skill-LO reference (S0 = none)
└───────── leading segment: the YEAR number (0–6) … OR a special track letter
```

The leading segment is **not always a year number**. Observed first-segment distribution across 947 keys:

| First segment | Count | Meaning |
|---|---|---|
| `0`–`4` (digits) | 0:95, 1:274, 2:169, 3:127, 4:230 | Year number |
| `E` | 30 | **Exam** rows (`E.S0.K0.H#`, `dailyLO` = "End-of-month exam" etc.) |
| `L` | 22 | A special/placeholder track (`L.S0.K0.H#`) — mostly **empty** rows (blank `linguisticSkill`/`dailyLO`/`theme`); likely "Life skills" or a spreadsheet artefact. |

> Note: years 5 and 6 have lessons (`yearNum` 5: 200 rows, 6: 190 rows) but their IDs are keyed under `E.*` / shared exam keys rather than `5.*`/`6.*` first segments — see the array-keyed entries below.

**Parsing in code:** there is essentially **no ID parser**. The app does **not** decompose the ID string into year/skill/knowledge/hour at runtime. Instead:
- `getLessonById(id)` is a plain dictionary lookup on the JSON.
- All structured fields it needs (`yearNum`, `week`, `period`, `periodNum`, `skillLORef`, `knowledgeLORef`, …) are **pre-computed and stored on each row** in the JSON.
- The only "parse" is `resolveYearNum(year)` which regex-extracts the first integer from a year label string (`"Year 0"` → `0`).

So the taxonomy is *encoded in the ID* but the app relies on the denormalized fields, not on splitting the ID. (A real parser would be `id.split('.')` → `[yearOrTrack, sRef, kRef, hRef]`.)

## Expected input format / parsing steps

Since the parser isn't in-repo, the *input* format is inferred from residue in the output:

- Source was clearly a **spreadsheet** with one row per lesson-hour, columns roughly: Year, Month, Week, Period, Daily LO, Linguistic Skill, Skill LO ref + text, Knowledge LO ref + text, Resources, Vocab focus, Grammar focus, Theme.
- **Residual artefacts confirming spreadsheet origin:**
  - Every LO field is prefixed with `". "` (a leading dot + space). `cleanLO()` strips this at read time (`/^(\.\s*)+/`).
  - `18` occurrences of literal `"#N/A"` survive as field values (e.g. `vocabFocus: "#N/A"` in exam rows) — these were **not** cleaned and leak through to the UI/AI prompts.
  - No `#REF!` strings remain (0 occurrences) — either none existed or they were stripped before commit.
  - `linguisticSkill` is inconsistent: values include `"Basic Literacy"`, `"Reading"`, `"Writing"`, `"Listening"`, `"Speaking"`, plus noise `""`, `"0"`, `"E"`, `"L"`, `"Teachers Choice"`. `getSkillBreakdown` filters `length > 1` to drop the worst noise; `skillToKey` buckets the rest.

## Output JSON shape (what the app consumes)

`curriculum.json` is a `CurriculumLookup`:

```ts
type CurriculumLookup = Record<string, CurriculumLesson | CurriculumLesson[]>;
```

- **947 keys**, expanding to **1287 lesson rows** total.
- Most keys map to a single `CurriculumLesson`. **247 keys** map to an **array** — these are IDs reused across years (e.g. `E.S0.K0.H1` appears as Year 0 Period 5 *and* Year 1 Period 5). Consumers must handle both (`Array.isArray(...) ? [0] : ...`).

Each `CurriculumLesson` (from `src/types/curriculum.ts`):

```ts
interface CurriculumLesson {
  id: string;            // "0.S1.K1.H3"
  year: string;          // "Year 0"
  yearNum: number|null;  // 0–6
  month: string;         // "February" (11 distinct months present)
  week: number|null;     // school-year week index
  period: string;        // "Period 3"
  periodNum: number|null;// 1–5
  dailyLO: string;       // daily learning outcome (". "-prefixed in raw)
  linguisticSkill: string;
  skillLORef: string;    // "S1" … "S16+"
  skillLO: string;
  knowledgeLORef: string;// "K1" / "K0"
  knowledgeLO: string;
  resources: string;
  vocabFocus: string;    // may contain newlines, or "#N/A"
  grammarFocus: string;  // often ""
  theme: string;         // e.g. "Alsama Values"; may be ""
}
```

## Public API of the curriculum utilities (`src/lib/curriculumUtils.ts`)

Every exported symbol:

| Export | Signature | Description |
|---|---|---|
| `cleanLO` | `(raw: string) => string` | Strips the leading `". "` repetition and trims. Used on all LO fields. |
| `getLessonById` | `(id: string) => CurriculumLesson \| CurriculumLesson[] \| null` | Dictionary lookup; returns array for cross-year IDs, `null` if absent. Applies `cleanLO`. |
| `getLessonsByWeek` | `(year: number\|string, week: number) => CurriculumLesson[]` | All lessons in a year+week, sorted by period. |
| `getAllWeeks` | `(year: number\|string) => number[]` | Sorted week numbers that have ≥1 lesson in the year. |
| `getLessonsByYear` | `(year: number\|string) => CurriculumLesson[]` | All lessons for a year, sorted by week then period. |
| `getWeeksForYear` | `(year: number\|string) => number[]` | **Alias** for `getAllWeeks`. |
| `getLessonsForWeek` | `(year: number\|string, week: number) => CurriculumLesson[]` | **Alias** for `getLessonsByWeek`. |
| `getMonthsWithWeeks` | `(year) => { month: string; weeks: number[] }[]` | Months in calendar order with their week numbers. |
| `getThemesForYear` | `(year) => { theme: string; count: number }[]` | Distinct themes + lesson counts, desc. |
| `getLessonsByTheme` | `(year, theme: string) => CurriculumLesson[]` | Lessons for a year+theme. |
| `getSkillBreakdown` | `(year) => { skill, skillKey, count, pct }[]` | Linguistic-skill distribution; `skillKey ∈ read/write/listen/speak/basic`. |
| `getSkillLOs` | `(year) => { ref, lo, skill, count }[]` | Skill-LO refs → text + counts, sorted by ref (numeric-aware). |
| `getKnowledgeLOsForSkill` | `(year, skillRef: string) => { ref, lo, count, weeks }[]` | Knowledge LOs under a skill ref, with week lists. |

Internal (not exported): `buildIndexes`, `resolveYearNum`, `byPeriod`, `byWeekThenPeriod`, `skillToKey`, `withCleanLOs`, and module state `_byWeek` / `_byYear`.

**Server wrapper** (`src/lib/curriculum-actions.ts`, `'use server'`) exposes async versions for client components: `fetchWeeksForYear`, `fetchLessonsForWeek`, `fetchLessonById` (collapses arrays to `[0]`), `fetchCurriculumYearData` (bundles months/themes/skillBreakdown/skillLOs + totals into `CurriculumYearData`), `fetchKnowledgeLOs`.

## Handling of messy data

- **`". "` LO prefix:** handled (`cleanLO`).
- **Cross-year duplicate IDs:** handled (array values; callers collapse or iterate).
- **Skill-label noise:** partially handled (`getSkillBreakdown` filters `length > 1`; `skillToKey` buckets unknowns to `'basic'`).
- **`null` year/week/period:** typed as `number|null`; index builder skips rows where `yearNum`/`week` is null.
- **NOT handled:** `"#N/A"` literals (18) survive into fields and would be fed verbatim into AI prompts and PDFs; empty `L.*` placeholder rows; empty `theme`/`grammarFocus` strings (filtered ad-hoc per consumer, not centrally). No dedupe of identical rows beyond the array-keying. No normalization of inconsistent month/skill casing.

## What changes to support multiple subjects (not just English)

Today everything assumes **one subject (English)**:
- `curriculum.json` has no `subject` field; the ID's first segment is year/track, never subject. The AI `SYSTEM_PROMPT` hard-codes "teaches English"; the worksheet PDF header hard-codes `"English"`.
- `linguisticSkill` values (Reading/Writing/Listening/Speaking/Basic Literacy) are English-language-skill specific.

To go multi-subject:
1. Add a `subject` dimension — either a top-level key in the lookup (`{ subject: CurriculumLookup }`) or a `subject` field on each row, and likely fold it into the ID scheme (e.g. `EN.0.S1.K1.H3`).
2. Re-key the in-memory indexes (`_byYear`/`_byWeek`) by `subject+year`.
3. Generalize `linguisticSkill`/`skillToKey` (they're English-skill buckets) into subject-aware skill taxonomies.
4. Parameterize the AI system prompt and PDF labels by subject.
5. Rebuild/own the spreadsheet→JSON ingestion (currently missing) so each subject's curriculum can be loaded — ideally moving the curriculum into a **DB table** rather than a committed flat file, given the multi-school/subject scale.
