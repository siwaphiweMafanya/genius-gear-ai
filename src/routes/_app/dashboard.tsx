import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Mail,
  FileText,
  ListChecks,
  ArrowRight,
  Sparkles,
  Clock,
  Zap,
  ShieldCheck,
} from "lucide-react";

export const Route = createFileRoute("/_app/dashboard")({
  component: DashboardPage,
});

const metrics = [
  { icon: Clock, value: "8.5h", label: "Hours saved per week", tint: "text-rose-400 bg-rose-500/10" },
  { icon: Zap, value: "12×", label: "Faster response time", tint: "text-orange-400 bg-orange-500/10" },
  { icon: ShieldCheck, value: "100%", label: "Editable & private", tint: "text-rose-400 bg-rose-500/10" },
];

const tools = [
  {
    to: "/email",
    title: "Smart Email Generator",
    desc: "Draft polished emails in seconds with tone control.",
    icon: Mail,
    iconBg: "bg-blue-500/15 text-blue-400",
  },
  {
    to: "/notes",
    title: "Meeting Notes Summarizer",
    desc: "Turn raw transcripts into decisions and action items.",
    icon: FileText,
    iconBg: "bg-purple-500/15 text-purple-400",
  },
  {
    to: "/tasks",
    title: "AI Task Planner",
    desc: "Prioritize your day using urgency + importance.",
    icon: ListChecks,
    iconBg: "bg-pink-500/15 text-pink-400",
  },
] as const;

function DashboardPage() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-hero p-8 sm:p-12 shadow-elegant">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
          <Sparkles className="size-3.5 text-rose-300" />
          Powered by AI
        </div>
        <h1 className="mt-5 text-4xl sm:text-5xl font-bold tracking-tight leading-tight max-w-3xl">
          Your <span className="text-gradient">AI workplace</span> assistant
        </h1>
        <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl">
          Automate emails, summarize meetings, plan your week, and research smarter — all from one
          beautifully simple workspace.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button asChild size="lg" className="bg-gradient-coral border-0 text-white shadow-lg hover:opacity-90">
            <Link to="/email">
              Start with Email <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="bg-card/40 border-white/15 backdrop-blur">
            <Link to="/chat">Open AI Chat</Link>
          </Button>
        </div>
      </section>

      {/* Metrics */}
      <section className="grid gap-4 sm:grid-cols-3">
        {metrics.map((m) => (
          <Card key={m.label} className="bg-card border-border">
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`size-12 rounded-xl grid place-items-center ${m.tint}`}>
                <m.icon className="size-5" />
              </div>
              <div>
                <div className="text-2xl font-bold tracking-tight">{m.value}</div>
                <div className="text-xs text-muted-foreground">{m.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Tools */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Productivity tools</h2>
          <p className="text-sm text-muted-foreground">Pick a tool to get started.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((t) => (
            <Card key={t.to} className="group bg-card border-border transition-colors hover:border-primary/40">
              <CardContent className="p-6 flex flex-col h-full">
                <div className={`size-11 rounded-xl grid place-items-center mb-4 ${t.iconBg}`}>
                  <t.icon className="size-5" />
                </div>
                <h3 className="text-base font-semibold text-rose-400">{t.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground flex-1">{t.desc}</p>
                <Link
                  to={t.to}
                  className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-rose-400 hover:text-rose-300"
                >
                  Open tool <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
