import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import type { LessonPlan, LessonPlanResponse, UpsertLessonPlanBody } from "@/types/lesson";

type RouteContext = { params: Promise<{ id: string }> };

// ── GET /api/lesson/[id] ──────────────────────────────────────────────────────
// Returns the lesson plan for the given UUID, or 404 if not found.
export async function GET(
  _req: NextRequest,
  { params }: RouteContext
): Promise<NextResponse<LessonPlanResponse>> {
  const { id } = await params;

  if (!isUUID(id)) {
    return NextResponse.json({ data: null, error: "Invalid plan ID." }, { status: 400 });
  }

  let data: unknown = null;
  try {
    const supabase = createServerClient();
    const result = await supabase
      .from("lesson_plans")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (result.error) {
      console.error("[GET /api/lesson]", result.error);
      return NextResponse.json({ data: null, error: result.error.message }, { status: 500 });
    }
    data = result.data;
  } catch (err) {
    console.error("[GET /api/lesson] Supabase unavailable:", err);
    return NextResponse.json({ data: null, error: "Database unavailable" }, { status: 503 });
  }

  if (!data) {
    return NextResponse.json({ data: null }, { status: 404 });
  }

  return NextResponse.json({ data: data as LessonPlan });
}

// ── POST /api/lesson/[id] ─────────────────────────────────────────────────────
// Creates or fully replaces a lesson plan.
// Body: UpsertLessonPlanBody { lesson_id, sections, worksheet? }
//
// Pass "new" as the [id] segment to have Supabase generate the UUID;
// the created plan's UUID is returned in the response body.
export async function POST(
  req: NextRequest,
  { params }: RouteContext
): Promise<NextResponse<LessonPlanResponse>> {
  const { id } = await params;

  const isNew = id === "new";
  if (!isNew && !isUUID(id)) {
    return NextResponse.json({ data: null, error: "Invalid plan ID." }, { status: 400 });
  }

  let body: UpsertLessonPlanBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ data: null, error: "Invalid JSON body." }, { status: 400 });
  }

  const validationError = validateBody(body);
  if (validationError) {
    return NextResponse.json({ data: null, error: validationError }, { status: 422 });
  }

  const payload: Record<string, unknown> = {
    lesson_id: body.lesson_id,
    sections:  body.sections,
    worksheet: body.worksheet ?? null,
  };
  if (!isNew) payload.id = id;

  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("lesson_plans")
      .upsert(payload, { onConflict: "id" })
      .select()
      .single();

    if (error) {
      console.error("[POST /api/lesson]", error);
      return NextResponse.json({ data: null, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data as LessonPlan }, { status: isNew ? 201 : 200 });
  } catch (err) {
    console.error("[POST /api/lesson] Supabase unavailable:", err);
    return NextResponse.json({ data: null, error: "Database unavailable" }, { status: 503 });
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function isUUID(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function validateBody(body: unknown): string | null {
  if (!body || typeof body !== "object") return "Body must be a JSON object.";
  const b = body as Record<string, unknown>;

  if (typeof b.lesson_id !== "string" || !b.lesson_id.trim()) {
    return "lesson_id must be a non-empty string.";
  }

  if (!Array.isArray(b.sections)) {
    return "sections must be an array.";
  }

  if (b.sections.length !== 6) {
    return "sections must contain exactly 6 entries.";
  }

  for (let i = 0; i < b.sections.length; i++) {
    const s = b.sections[i] as Record<string, unknown>;
    if (typeof s !== "object" || s === null) return `sections[${i}] must be an object.`;
    if (typeof s.title !== "string") return `sections[${i}].title must be a string.`;
    if (typeof s.task !== "string") return `sections[${i}].task must be a string.`;
    if (typeof s.materials !== "string") return `sections[${i}].materials must be a string.`;
    if (typeof s.teacher_instructions !== "string") return `sections[${i}].teacher_instructions must be a string.`;
    if (typeof s.student_instructions !== "string") return `sections[${i}].student_instructions must be a string.`;
    if (typeof s.timing_minutes !== "number" || s.timing_minutes < 0) {
      return `sections[${i}].timing_minutes must be a non-negative number.`;
    }
  }

  if (b.worksheet !== undefined && b.worksheet !== null) {
    const w = b.worksheet as Record<string, unknown>;
    if (typeof w !== "object") return "worksheet must be an object or null.";
    if (typeof w.title !== "string") return "worksheet.title must be a string.";
    if (typeof w.instructions !== "string") return "worksheet.instructions must be a string.";
    if (!Array.isArray(w.questions)) return "worksheet.questions must be an array.";
  }

  return null;
}
