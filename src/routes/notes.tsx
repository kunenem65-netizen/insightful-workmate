import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Field, OutputPanel, SubmitButton, inputClass } from "@/components/ai-output";
import { summarizeNotes } from "@/lib/ai.functions";

export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summariser | WorkMate AI" },
      {
        name: "description",
        content:
          "Turn long meeting notes or transcripts into a TL;DR, decisions log, owned action items and open risks.",
      },
      { property: "og:title", content: "Meeting Notes Summariser | WorkMate AI" },
      {
        property: "og:description",
        content: "Extract decisions, action items, owners and deadlines from messy notes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NotesPage,
});

function NotesPage() {
  const call = useServerFn(summarizeNotes);
  const [notes, setNotes] = useState("");
  const [context, setContext] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!notes.trim()) return;
    setLoading(true);
    setError("");
    setResult("");
    try {
      setResult(await call({ data: { notes, context } }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Meeting Notes Summariser"
        description="Paste raw notes or a transcript. Get decisions, action items with owners and deadlines, plus open risks."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm"
        >
          <Field label="Meeting context" hint="Optional — team, purpose, attendees.">
            <input
              className={inputClass}
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Weekly product sync — design, engineering, support"
            />
          </Field>
          <Field label="Raw notes or transcript">
            <textarea
              className={`${inputClass} min-h-64 resize-y`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Paste everything, typos and all…"
            />
          </Field>
          <SubmitButton loading={loading} label="Summarise notes" />
        </form>

        <OutputPanel
          result={result}
          loading={loading}
          error={error}
          emptyHint="Your brief will appear here: TL;DR, decisions, an action table and open questions."
        />
      </div>
    </AppShell>
  );
}
