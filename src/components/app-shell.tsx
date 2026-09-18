import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  Mail,
  ClipboardList,
  CalendarClock,
  BookOpen,
  MessageSquare,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, blurb: "Overview of your workspace" },
  { to: "/email", label: "Email Writer", icon: Mail, blurb: "Professional email in any tone" },
  { to: "/notes", label: "Meeting Notes", icon: ClipboardList, blurb: "Decisions, actions, deadlines" },
  { to: "/planner", label: "Task Planner", icon: CalendarClock, blurb: "Prioritised day or week plan" },
  { to: "/research", label: "Research", icon: BookOpen, blurb: "Summaries and recommendations" },
  { to: "/chat", label: "Ask Aria", icon: MessageSquare, blurb: "Your workplace assistant" },
] as const;

function NavList({ onNavigate }: { onNavigate?: (() => void) | undefined }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          onClick={onNavigate}
          activeOptions={{ exact: to === "/" }}
          className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground data-[status=active]:bg-primary data-[status=active]:text-primary-foreground"
        >
          <Icon className="size-4 shrink-0" />
          {label}
        </Link>
      ))}
    </nav>
  );
}

function SidebarInner({ onNavigate }: { onNavigate?: (() => void) | undefined }) {
  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <Link to="/" onClick={onNavigate} className="flex items-center gap-2 px-2 pt-2">
        <span className="grid size-9 place-items-center rounded-xl bg-primary font-display text-lg font-bold text-primary-foreground">
          W
        </span>
        <span className="font-display text-lg font-semibold tracking-tight">WorkMate AI</span>
      </Link>
      <NavList onNavigate={onNavigate} />
      <div className="mt-auto rounded-xl border border-border bg-surface p-3 text-xs leading-relaxed text-muted-foreground">
        <span className="mb-1 flex items-center gap-1.5 font-semibold text-foreground">
          <ShieldCheck className="size-3.5" /> Responsible AI
        </span>
        Responses are AI-generated and can be wrong. Review facts, names and dates before you send
        or act on anything.
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-card lg:block">
        <SidebarInner />
      </aside>

      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-card/90 px-4 py-3 backdrop-blur lg:hidden">
        <button
          aria-label="Toggle navigation"
          onClick={() => setOpen((v) => !v)}
          className="rounded-md border border-border p-2"
        >
          {open ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
        <span className="font-display text-base font-semibold">WorkMate AI</span>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            aria-label="Close navigation"
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85%] bg-card shadow-xl">
            <SidebarInner onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <main className={cn("lg:pl-64")}>
        <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:py-10">{children}</div>
      </main>
    </div>
  );
}

export function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <header className="mb-6">
      <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
    </header>
  );
}
