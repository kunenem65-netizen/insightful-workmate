import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { RotateCcw, Send } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { FormattedText } from "@/components/ai-output";
import { chatWithAssistant } from "@/lib/ai.functions";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Ask Aria — AI Workplace Assistant | WorkMate AI" },
      {
        name: "description",
        content:
          "Chat with Aria, an AI workplace assistant for writing, planning, meetings and everyday work questions.",
      },
      { property: "og:title", content: "Ask Aria — AI Workplace Assistant" },
      {
        property: "og:description",
        content: "An interactive assistant for everyday workplace questions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChatPage,
});

type Msg = { role: "user" | "assistant"; content: string };

const STARTERS = [
  "How do I say no to a meeting request politely?",
  "Give me an agenda for a 30-minute project kickoff.",
  "Help me prepare for a difficult performance conversation.",
];

function ChatPage() {
  const call = useServerFn(chatWithAssistant);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (!loading) inputRef.current?.focus();
  }, [loading, messages.length]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;
    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setError("");
    setLoading(true);
    try {
      const reply = await call({ data: { messages: next } });
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Aria could not reply. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title="Ask Aria"
          description="Your interactive AI workplace assistant — writing, planning, meetings and everything between."
        />
        {messages.length > 0 && (
          <button
            onClick={() => {
              setMessages([]);
              setError("");
            }}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium transition hover:bg-secondary"
          >
            <RotateCcw className="size-3.5" /> New chat
          </button>
        )}
      </div>

      <section className="flex h-[65vh] min-h-[420px] flex-col rounded-2xl border border-border bg-card shadow-sm">
        <div ref={boxRef} className="flex-1 space-y-5 overflow-y-auto p-5">
          {messages.length === 0 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Ask anything about your workday. Try one of these:
              </p>
              <div className="flex flex-wrap gap-2">
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border border-border bg-surface px-3 py-1.5 text-left text-xs transition hover:bg-secondary"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                  {m.content}
                </div>
              </div>
            ) : (
              <div key={i} className="max-w-[92%]">
                <span className="mb-1 block font-display text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Aria
                </span>
                <FormattedText text={m.content} />
              </div>
            ),
          )}

          {loading && (
            <p className="animate-pulse text-sm text-muted-foreground">Aria is thinking…</p>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-end gap-2 border-t border-border p-3"
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={2}
            placeholder="Ask Aria anything about your work…"
            className="min-h-11 flex-1 resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/25"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Send message"
            className="grid size-11 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            <Send className="size-4" />
          </button>
        </form>
      </section>

      <p className="mt-3 text-xs text-muted-foreground">
        Aria is AI-generated and can be wrong. Don't share confidential personal data, and check
        anything important with a human.
      </p>
    </AppShell>
  );
}
