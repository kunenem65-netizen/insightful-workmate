import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, Zap, Users } from "lucide-react";
import { AppShell, NAV } from "@/components/app-shell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WorkMate AI — Your AI Workplace Productivity Suite" },
      {
        name: "description",
        content:
          "WorkMate AI writes your emails, summarises meeting notes, plans your week and answers workplace questions — all in one dashboard.",
      },
      { property: "og:title", content: "WorkMate AI — AI Workplace Productivity Suite" },
      {
        property: "og:description",
        content:
          "Email writer, meeting summariser, task planner, research assistant and a workplace chatbot.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const STATS = [
  { icon: Zap, label: "5 AI tools", sub: "One workspace" },
  { icon: Users, label: "Built for teams", sub: "Email, meetings, planning" },
  { icon: ShieldCheck, label: "Human in the loop", sub: "Every output reviewable" },
];

function Dashboard() {
  const tools = NAV.filter((n) => n.to !== "/");

  return (
    <AppShell>
      <section className="overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-9">
        <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
          AI workplace productivity suite
        </span>
        <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Do the work. Let WorkMate handle the writing, summarising and planning.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Five focused AI tools for the admin that eats your day — drafting emails, turning messy
          meeting notes into action items, building a realistic schedule, researching a topic, and
          answering the questions in between.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/email"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Write an email <ArrowRight className="size-4" />
          </Link>
          <Link
            to="/chat"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold transition hover:bg-secondary"
          >
            Ask Aria
          </Link>
        </div>
      </section>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {STATS.map(({ icon: Icon, label, sub }) => (
          <div key={label} className="rounded-2xl border border-border bg-surface p-4">
            <Icon className="size-5 text-primary" />
            <p className="mt-2 font-display text-sm font-semibold">{label}</p>
            <p className="text-xs text-muted-foreground">{sub}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-10 mb-4 font-display text-xl font-semibold tracking-tight">Your tools</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {tools.map(({ to, label, blurb, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-secondary text-primary">
              <Icon className="size-5" />
            </span>
            <p className="mt-3 font-display text-base font-semibold">{label}</p>
            <p className="mt-1 text-sm text-muted-foreground">{blurb}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
              Open <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>

      <section className="mt-10 rounded-2xl border border-accent/40 bg-accent/10 p-5">
        <h2 className="flex items-center gap-2 font-display text-base font-semibold">
          <ShieldCheck className="size-4" /> Responsible AI
        </h2>
        <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
          <li>
            Everything here is AI-generated and can be wrong — a person reviews and approves before
            anything is sent or acted on.
          </li>
          <li>
            The assistant is instructed never to invent names, figures or dates; missing details are
            marked as [CONFIRM] instead of guessed.
          </li>
          <li>
            Don't paste confidential personal data, ID numbers or credentials. Legal, medical,
            financial and HR matters need qualified human judgement.
          </li>
          <li>Drafts are not stored on a server — they live in your browser session only.</li>
        </ul>
      </section>
    </AppShell>
  );
}
