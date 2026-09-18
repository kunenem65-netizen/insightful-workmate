import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Field, OutputPanel, SubmitButton, inputClass } from "@/components/ai-output";
import { planSchedule } from "@/lib/ai.functions";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner | WorkMate AI" },
      {
        name: "description",
        content:
          "Turn a messy task list into a prioritised daily or weekly schedule with realistic time blocks.",
      },
      { property: "og:title", content: "AI Task Planner | WorkMate AI" },
      {
        property: "og:description",
        content: "Rank tasks by impact and urgency, then block them into your available hours.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PlannerPage,
});

function PlannerPage() {
  const call = useServerFn(planSchedule);
  const [tasks, setTasks] = useState("");
  const [horizon, setHorizon] = useState<"day" | "week">("day");
  const [hours, setHours] = useState("");
  const [constraints, setConstraints] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tasks.trim()) return;
    setLoading(true);
    setError("");
    setResult("");
    try {
      setResult(await call({ data: { tasks, horizon, hours, constraints } }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="AI Task Planner"
        description="List everything on your plate. Get a ranked, time-blocked plan you can actually finish."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm"
        >
          <Field label="Your tasks" hint="One per line. Add deadlines where you know them.">
            <textarea
              className={`${inputClass} min-h-52 resize-y`}
              value={tasks}
              onChange={(e) => setTasks(e.target.value)}
              placeholder={"Finish Q4 budget draft (due Thursday)\nInterview two candidates\nReply to client escalation\nPrep board slides"}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Plan for">
              <select
                className={inputClass}
                value={horizon}
                onChange={(e) => setHorizon(e.target.value as "day" | "week")}
              >
                <option value="day">A single day</option>
                <option value="week">The working week</option>
              </select>
            </Field>
            <Field label="Available hours">
              <input
                className={inputClass}
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="08:30–16:30, 6 focused hours"
              />
            </Field>
          </div>
          <Field label="Constraints" hint="Meetings, energy dips, hard deadlines, school run.">
            <input
              className={inputClass}
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              placeholder="Standup at 09:00, no meetings after 15:00"
            />
          </Field>
          <SubmitButton loading={loading} label="Build my plan" />
        </form>

        <OutputPanel
          result={result}
          loading={loading}
          error={error}
          emptyHint="Your priority ranking and time-blocked schedule will appear here."
        />
      </div>
    </AppShell>
  );
}
