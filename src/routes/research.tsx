import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Field, OutputPanel, SubmitButton, inputClass } from "@/components/ai-output";
import { researchTopic } from "@/lib/ai.functions";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant | WorkMate AI" },
      {
        name: "description",
        content:
          "Summarise a topic or a pasted article into an executive brief with insights, recommendations and confidence gaps.",
      },
      { property: "og:title", content: "AI Research Assistant | WorkMate AI" },
      {
        property: "og:description",
        content: "Executive summaries, insights and next steps — with the gaps named honestly.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResearchPage,
});

function ResearchPage() {
  const call = useServerFn(researchTopic);
  const [topic, setTopic] = useState("");
  const [depth, setDepth] = useState<"brief" | "standard" | "deep">("standard");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim()) return;
    setLoading(true);
    setError("");
    setResult("");
    try {
      setResult(await call({ data: { topic, depth } }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="AI Research Assistant"
        description="Paste an article or name a topic. Get a summary, insights, recommendations and an honest confidence check."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm"
        >
          <Field label="Topic or article text">
            <textarea
              className={`${inputClass} min-h-64 resize-y`}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="How four-day work weeks affect productivity in knowledge teams — or paste a full article here."
            />
          </Field>
          <Field label="Depth">
            <select
              className={inputClass}
              value={depth}
              onChange={(e) => setDepth(e.target.value as "brief" | "standard" | "deep")}
            >
              <option value="brief">Brief — the headline only</option>
              <option value="standard">Standard — balanced brief</option>
              <option value="deep">Deep — thorough analysis</option>
            </select>
          </Field>
          <SubmitButton loading={loading} label="Research this" />
          <p className="text-xs text-muted-foreground">
            No live web access: the assistant works from the text you paste and general knowledge,
            and will tell you what to verify.
          </p>
        </form>

        <OutputPanel
          result={result}
          loading={loading}
          error={error}
          emptyHint="Your research brief will appear here."
        />
      </div>
    </AppShell>
  );
}
