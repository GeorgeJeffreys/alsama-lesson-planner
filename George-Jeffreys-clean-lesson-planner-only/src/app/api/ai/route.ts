import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getLessonById } from "@/lib/curriculumUtils";
import type { CurriculumLesson } from "@/types/curriculum";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MODEL = "claude-sonnet-4-5";

const SYSTEM_PROMPT = `You are an expert lesson plan writer for the Alsama Project, a refugee education NGO based in Lebanon that teaches English to displaced communities. Students range from absolute beginners (CEFR pre-A1) to upper-intermediate (CEFR B2), with most learners at A1–A2. Classes are delivered by volunteer teachers in informal settings. Lessons must be practical, low-resource, trauma-informed, and immediately usable in a classroom with minimal materials.

Your job is to generate clear, actionable content for a specific section of a lesson plan. Write teacher instructions in plain language a non-specialist volunteer can follow. Write student instructions as direct prompts the teacher can read aloud or display.`;

const TOOL_NAME = "generate_section_content";

interface RequestBody {
  sectionName: string;
  lessonId: string;
  existingContent?: string;
}

export async function POST(req: NextRequest): Promise<Response> {
  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { sectionName, lessonId, existingContent } = body;

  if (typeof sectionName !== "string" || !sectionName.trim()) {
    return NextResponse.json({ error: "sectionName must be a non-empty string." }, { status: 422 });
  }
  if (typeof lessonId !== "string" || !lessonId.trim()) {
    return NextResponse.json({ error: "lessonId must be a non-empty string." }, { status: 422 });
  }

  const lessonRaw = getLessonById(lessonId);
  if (!lessonRaw) {
    return NextResponse.json({ error: `Lesson not found: ${lessonId}` }, { status: 404 });
  }

  // If the ID returns an array (exam-slot rows), use the first entry
  const lesson: CurriculumLesson = Array.isArray(lessonRaw) ? lessonRaw[0] : lessonRaw;

  const userPrompt = buildUserPrompt(lesson, sectionName, existingContent ?? "");

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();

      const send = (data: string) => {
        controller.enqueue(enc.encode(`data: ${data}\n\n`));
      };

      try {
        const anthropicStream = client.messages.stream({
          model: MODEL,
          max_tokens: 1024,
          system: [
            {
              type: "text",
              text: SYSTEM_PROMPT,
              cache_control: { type: "ephemeral" },
            },
          ],
          tools: [
            {
              name: TOOL_NAME,
              description:
                "Generate teacher and student instructions for a lesson plan section.",
              input_schema: {
                type: "object" as const,
                properties: {
                  teacherInstructions: {
                    type: "string",
                    description:
                      "Step-by-step instructions for the teacher to deliver this section of the lesson.",
                  },
                  studentInstructions: {
                    type: "string",
                    description:
                      "Clear prompts or tasks for the students, written so the teacher can read them aloud.",
                  },
                },
                required: ["teacherInstructions", "studentInstructions"],
              },
            },
          ],
          tool_choice: { type: "tool", name: TOOL_NAME },
          messages: [{ role: "user", content: userPrompt }],
        });

        let jsonBuffer = "";

        for await (const event of anthropicStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "input_json_delta"
          ) {
            jsonBuffer += event.delta.partial_json;
            send(JSON.stringify({ type: "delta", partial: event.delta.partial_json }));
          }
        }

        // Parse and send the final structured result
        try {
          const parsed = JSON.parse(jsonBuffer) as {
            teacherInstructions: string;
            studentInstructions: string;
          };
          send(JSON.stringify({ type: "done", result: parsed }));
        } catch {
          send(JSON.stringify({ type: "error", error: "Failed to parse AI response." }));
        }
      } catch (err) {
        const message =
          err instanceof Anthropic.APIError
            ? `Anthropic API error ${err.status}: ${err.message}`
            : "Unexpected error generating content.";
        send(JSON.stringify({ type: "error", error: message }));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

function buildUserPrompt(
  lesson: CurriculumLesson,
  sectionName: string,
  existingContent: string
): string {
  const lines: string[] = [
    `Lesson: ${lesson.id} — ${lesson.year}`,
    `Daily Learning Outcome: ${lesson.dailyLO}`,
    `Linguistic Skill: ${lesson.linguisticSkill}`,
    `Skill LO: ${lesson.skillLO}`,
    `Knowledge LO: ${lesson.knowledgeLO}`,
    `Grammar Focus: ${lesson.grammarFocus || "None specified"}`,
    `Vocabulary Focus: ${lesson.vocabFocus || "None specified"}`,
    `Theme: ${lesson.theme || "None specified"}`,
    `Resources: ${lesson.resources || "None specified"}`,
    "",
    `Section to generate: "${sectionName}"`,
  ];

  if (existingContent.trim()) {
    lines.push("", `Existing content (refine or replace as appropriate):`, existingContent);
  }

  lines.push(
    "",
    `Generate concise, practical teacher and student instructions for the "${sectionName}" section of this lesson.`
  );

  return lines.join("\n");
}
