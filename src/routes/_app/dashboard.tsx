import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, FileText, ListChecks, Search, MessagesSquare, ArrowRight } from "lucide-react";
import { ResponsibleAIDisclaimer } from "@/components/responsible-ai-disclaimer";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_app/dashboard")({
  component: DashboardPage,
});

const tiles = [
  { to: "/email", title: "Smart Email Generator", desc: "Draft polished emails in seconds.", icon: Mail },
  { to: "/notes", title: "Meeting Notes Summarizer", desc: "Turn raw notes into clear minutes.", icon: FileText },
  { to: "/tasks", title: "AI Task Planner", desc: "Plan goals into actionable steps.", icon: ListChecks },
  { to: "/research", title: "AI Research Assistant", desc: "Structured briefs on any topic.", icon: Search },
  { to: "/chat", title: "AI Chatbot", desc: "Ask anything. Get expert help.", icon: MessagesSquare },
] as const;

function DashboardPage() {
  const { user } = useAuth();
  return (
    <div className="space-y-6 max-w-6xl">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome{user?.email ? `, ${user.email.split("@")[0]}` : ""}.
        </h1>
        <p className="text-muted-foreground">Pick a tool to get started — outputs are saved to your library.</p>
      </div>
      <ResponsibleAIDisclaimer />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((t) => (
          <Link key={t.to} to={t.to} className="group">
            <Card className="h-full transition-colors group-hover:border-primary/40 group-hover:bg-accent/30">
              <CardHeader>
                <div className="size-10 rounded-md bg-primary/10 text-primary grid place-items-center mb-3">
                  <t.icon className="size-5" />
                </div>
                <CardTitle className="flex items-center justify-between">
                  {t.title}
                  <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </CardTitle>
                <CardDescription>{t.desc}</CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">Open tool</CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
