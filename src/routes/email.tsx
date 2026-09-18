import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Field, OutputPanel, SubmitButton, inputClass } from "@/components/ai-output";
import { generateEmail } from "@/lib/ai.functions";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Writer | WorkMate AI" },
      {
        name: "description",
        content:
          "Draft professional workplace emails in a formal, friendly, persuasive, apologetic or concise tone.",
      },
      { property: "og:title", content: "Smart Email Writer | WorkMate AI" },
      {
        property: "og:description",
        content: "Turn a rough intention into a polished, ready-to-send email in seconds.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EmailPage,
});

const TONES = ["formal", "friendly", "persuasive", "apologetic", "concise"] as const;
const LENGTHS = ["short", "medium", "detailed"] as const;

function EmailPage() {
  const call = useServerFn(generateEmail);
  const [recipient, setRecipient] = useState("");
  const [purpose, setPurpose] = useState("");
  const [tone, setTone] = useState<(typeof TONES)[number]>("formal");
  const [length, setLength] = useState<(typeof LENGTHS)[number]>("medium");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!purpose.trim()) return;
    setLoading(true);
    setError("");
    setResult("");
    try {
      setResult(await call({ data: { recipient, purpose, tone, length } }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Smart Email Writer"
        description="Describe what you need to say. Pick a tone. Get a send-ready email."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm"
        >
          <Field label="Recipient" hint="Optional — who is this going to?">
            <input
              className={inputClass}
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Thandi, Head of Operations"
            />
          </Field>
          <Field label="What should the email achieve?">
            <textarea
              className={`${inputClass} min-h-40 resize-y`}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Ask for a two-week extension on the Q4 report because the data team is short-staffed. Offer a partial draft on Friday."
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tone">
              <select
                className={inputClass}
                value={tone}
                onChange={(e) => setTone(e.target.value as (typeof TONES)[number])}
              >
                {TONES.map((t) => (
                  <option key={t} value={t}>
                    {t[0]!.toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Length">
              <select
                className={inputClass}
                value={length}
                onChange={(e) => setLength(e.target.value as (typeof LENGTHS)[number])}
              >
                {LENGTHS.map((l) => (
                  <option key={l} value={l}>
                    {l[0]!.toUpperCase() + l.slice(1)}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <SubmitButton loading={loading} label="Write email" />
        </form>

        <OutputPanel
          result={result}
          loading={loading}
          error={error}
          emptyHint="Your drafted email will appear here, subject line first."
        />
      </div>
    </AppShell>
  );
}
