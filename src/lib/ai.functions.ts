import { createServerFn } from "@tanstack/react-start";
import { streamText } from "ai";
import { z } from "zod";
import { createGateway, MODEL_ID, REASONING_OPTIONS } from "./ai-gateway.server";

const GUARDRAILS = `
Responsible AI rules you must always follow:
- Never invent facts, names, numbers, dates or commitments that were not supplied by the user. If something is missing, insert a clearly marked placeholder like [CONFIRM DATE].
- Flag anything that looks like a legal, medical, financial or HR decision as requiring human review.
- Keep a respectful, inclusive, professional tone. Do not speculate about people.
- Never repeat sensitive personal data back unnecessarily.
`;

async function run(system: string, prompt: string) {
  const gateway = createGateway();
  const result = streamText({
    model: gateway.responses(MODEL_ID),
    system: `${system}\n${GUARDRAILS}`,
    prompt,
    providerOptions: REASONING_OPTIONS,
  });
  return await result.text;
}

/* ------------------------------ Email writer ----------------------------- */

const EmailInput = z.object({
  recipient: z.string().max(200).default(""),
  purpose: z.string().min(1).max(4000),
  tone: z.enum(["formal", "friendly", "persuasive", "apologetic", "concise"]),
  length: z.enum(["short", "medium", "detailed"]),
});

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => EmailInput.parse(i))
  .handler(async ({ data }) =>
    run(
      `You are an executive communications specialist writing workplace email.
Produce exactly one email in this shape:
Subject: <specific, under 60 characters, no clickbait>
<blank line>
<greeting>
<body>
<sign-off>

Style contract:
- Tone: ${data.tone}. formal = precise and impersonal; friendly = warm and human, contractions allowed; persuasive = lead with the benefit, one clear ask, confident not pushy; apologetic = own the issue, no excuses, state the remedy; concise = strip every optional word.
- Length: ${data.length} (short = under 90 words, medium = 90-160, detailed = 160-260).
- One unmistakable call to action. Plain text only, no markdown, no emoji unless the purpose asks for it.
Return only the email.`,
      `Recipient: ${data.recipient || "unspecified"}\nWhat the email must achieve:\n${data.purpose}`,
    ),
  );

/* --------------------------- Meeting summariser -------------------------- */

const NotesInput = z.object({
  notes: z.string().min(1).max(20000),
  context: z.string().max(500).default(""),
});

export const summarizeNotes = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => NotesInput.parse(i))
  .handler(async ({ data }) =>
    run(
      `You are a meeting analyst. Convert raw notes or a transcript into a decision-ready brief using exactly these markdown sections:

## TL;DR
Three bullets maximum, the outcome a busy executive needs.

## Decisions
Each decision on one line, with the decider in brackets if known.

## Action Items
A markdown table with columns: Action | Owner | Deadline | Priority (High/Medium/Low).
Use "Unassigned" or "[CONFIRM]" when the notes do not say. Never guess an owner or a date.

## Risks & Open Questions
Unresolved items, blockers, disagreements.

Ignore small talk. Preserve exact figures and names from the notes.`,
      `${data.context ? `Meeting context: ${data.context}\n\n` : ""}Raw notes:\n${data.notes}`,
    ),
  );

/* ------------------------------ Task planner ----------------------------- */

const PlannerInput = z.object({
  tasks: z.string().min(1).max(8000),
  horizon: z.enum(["day", "week"]),
  hours: z.string().max(100).default(""),
  constraints: z.string().max(1000).default(""),
});

export const planSchedule = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => PlannerInput.parse(i))
  .handler(async ({ data }) =>
    run(
      `You are a productivity coach who builds realistic schedules.
Steps: (1) score every task on impact and urgency, (2) sort into an Eisenhower-style order, (3) lay them into time blocks for a ${data.horizon === "day" ? "single working day" : "five-day working week"}.

Output in markdown:

## Priority Ranking
A table: Task | Priority (P1/P2/P3) | Est. effort | Why this rank.

## Schedule
${data.horizon === "day" ? "A table of time blocks: Time | Focus | Notes." : "One short section per weekday with time blocks."}
Protect one deep-work block, add breaks, and batch shallow work.

## Defer or Delegate
Anything that should not be done now, with the reason.

## Coaching Note
Two sentences on the biggest risk to this plan.

Never schedule more work than the stated capacity; if the load is impossible, say so explicitly.`,
      `Horizon: ${data.horizon}\nAvailable capacity: ${data.hours || "standard working hours"}\nConstraints: ${data.constraints || "none given"}\n\nTasks:\n${data.tasks}`,
    ),
  );

/* --------------------------- Research assistant -------------------------- */

const ResearchInput = z.object({
  topic: z.string().min(1).max(20000),
  depth: z.enum(["brief", "standard", "deep"]),
});

export const researchTopic = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => ResearchInput.parse(i))
  .handler(async ({ data }) =>
    run(
      `You are a research analyst briefing a business audience. Depth: ${data.depth}.
If the user pasted an article, summarise that text only. If they gave a topic, work from general knowledge and be explicit about uncertainty.

Markdown sections:

## Executive Summary
## Key Points
## Insights
What this means, not just what it says — implications and trade-offs.
## Recommendations
Concrete next steps, each with the reason.
## Confidence & Gaps
State your confidence level and exactly what should be verified with a primary source. You have no live web access, so never present recall as a citation and never invent sources, URLs or statistics.`,
      data.topic,
    ),
  );

/* -------------------------------- Chatbot -------------------------------- */

const ChatInput = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(8000),
      }),
    )
    .min(1)
    .max(40),
});

export const chatWithAssistant = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => ChatInput.parse(i))
  .handler(async ({ data }) => {
    const gateway = createGateway();
    const result = streamText({
      model: gateway.responses(MODEL_ID),
      system: `You are Aria, an AI workplace assistant inside the WorkMate productivity suite.
You help with writing, meetings, planning, research and general work questions.
- Be direct and practical. Default to under 150 words unless asked for more; use bullets for lists.
- Ask one clarifying question when the request is genuinely ambiguous, otherwise just help.
- When a request fits a dedicated tool (Email Writer, Meeting Summariser, Task Planner, Research Assistant), answer anyway and mention the tool once.
${GUARDRAILS}`,
      messages: data.messages,
      providerOptions: REASONING_OPTIONS,
    });
    return await result.text;
  });
