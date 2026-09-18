import { useState, type ReactNode } from "react";
import { Copy, Check, Sparkle, AlertTriangle } from "lucide-react";

function inline(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    if (part.startsWith("`") && part.endsWith("`"))
      return (
        <code key={i} className="rounded bg-secondary px-1 py-0.5 text-[0.85em]">
          {part.slice(1, -1)}
        </code>
      );
    return <span key={i}>{part}</span>;
  });
}

const cells = (row: string) =>
  row
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());

/** Lightweight renderer for the markdown subset the assistant produces. */
export function FormattedText({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: ReactNode[] = [];
  let list: string[] = [];
  let table: string[] = [];

  const flushList = () => {
    if (!list.length) return;
    blocks.push(
      <ul key={`l${blocks.length}`} className="my-3 ml-5 list-disc space-y-1.5">
        {list.map((item, i) => (
          <li key={i}>{inline(item)}</li>
        ))}
      </ul>,
    );
    list = [];
  };

  const flushTable = () => {
    if (!table.length) return;
    const rows = table.filter((r) => !/^\|?[\s:|-]+\|?$/.test(r));
    const [head, ...body] = rows;
    blocks.push(
      <div key={`t${blocks.length}`} className="my-4 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          {head && (
            <thead className="bg-secondary">
              <tr>
                {cells(head).map((c, i) => (
                  <th key={i} className="px-3 py-2 font-semibold">
                    {inline(c)}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {body.map((r, i) => (
              <tr key={i} className="border-t border-border align-top">
                {cells(r).map((c, j) => (
                  <td key={j} className="px-3 py-2">
                    {inline(c)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>,
    );
    table = [];
  };

  lines.forEach((raw, idx) => {
    const line = raw.trimEnd();
    if (line.trim().startsWith("|")) {
      flushList();
      table.push(line);
      return;
    }
    flushTable();

    if (/^#{1,3}\s/.test(line)) {
      flushList();
      const level = line.match(/^#+/)![0].length;
      const content = line.replace(/^#+\s/, "");
      blocks.push(
        <h3
          key={idx}
          className={
            level <= 2
              ? "mt-6 mb-2 font-display text-lg font-semibold tracking-tight first:mt-0"
              : "mt-4 mb-1.5 font-display text-base font-semibold"
          }
        >
          {content}
        </h3>,
      );
      return;
    }
    if (/^\s*([-*•]|\d+\.)\s+/.test(line)) {
      list.push(line.replace(/^\s*([-*•]|\d+\.)\s+/, ""));
      return;
    }
    flushList();
    if (line.trim() === "") return;
    blocks.push(
      <p key={idx} className="my-2 leading-relaxed">
        {inline(line)}
      </p>,
    );
  });
  flushList();
  flushTable();

  return <div className="text-sm text-foreground">{blocks}</div>;
}

export function OutputPanel({
  result,
  loading,
  error,
  emptyHint,
}: {
  result: string;
  loading: boolean;
  error: string;
  emptyHint: string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <Sparkle className="size-4 text-primary" /> AI output
        </h2>
        {result && !loading && (
          <button
            onClick={() => {
              navigator.clipboard.writeText(result);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-secondary"
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        )}
      </div>

      {error && (
        <p className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}

      {loading && (
        <div className="space-y-2.5">
          {[90, 100, 75, 95, 60].map((w, i) => (
            <div
              key={i}
              className="h-3.5 animate-pulse rounded bg-secondary"
              style={{ width: `${w}%` }}
            />
          ))}
          <p className="pt-2 text-xs text-muted-foreground">Thinking through your request…</p>
        </div>
      )}

      {!loading && !result && !error && (
        <p className="text-sm text-muted-foreground">{emptyHint}</p>
      )}

      {!loading && result && <FormattedText text={result} />}

      {result && !loading && (
        <p className="mt-5 border-t border-border pt-3 text-xs text-muted-foreground">
          AI-generated — verify facts, names and dates before sharing.
        </p>
      )}
    </section>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

export const inputClass =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/25";

export function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
    >
      {loading ? "Generating…" : label}
    </button>
  );
}
