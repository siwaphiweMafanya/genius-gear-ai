import { useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Save, RefreshCw, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { ResponsibleAIDisclaimer } from "./responsible-ai-disclaimer";
import type { ToolKind } from "@/lib/system-prompts";
import { TOOL_META } from "@/lib/system-prompts";

type Field = {
  name: string;
  label: string;
  placeholder?: string;
  type?: "input" | "textarea";
  rows?: number;
};

export function ToolWorkspace({
  kind,
  fields,
  defaultTitle,
}: {
  kind: ToolKind;
  fields: Field[];
  defaultTitle?: (input: Record<string, string>) => string;
}) {
  const meta = TOOL_META[kind];
  const { user } = useAuth();
  const [input, setInput] = useState<Record<string, string>>({});
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const canGenerate = useMemo(() => fields.some((f) => (input[f.name] ?? "").trim()), [input, fields]);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind, input }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 429) toast.error("Rate limit reached. Try again in a moment.");
        else if (res.status === 402) toast.error("AI credits exhausted. Add credits in workspace settings.");
        else toast.error(data?.error || "Generation failed");
        return;
      }
      setOutput(data.text || "");
    } catch (e) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    if (!user || !output.trim()) return;
    const title = defaultTitle ? defaultTitle(input) : meta.label;
    const { error } = await supabase.from("saved_outputs").insert({
      user_id: user.id,
      kind,
      title,
      input,
      output,
    });
    if (error) toast.error(error.message);
    else toast.success("Saved to your library");
  };

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{meta.label}</CardTitle>
          <CardDescription>{meta.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((f) => (
            <div key={f.name} className="space-y-1.5">
              <Label htmlFor={f.name}>{f.label}</Label>
              {f.type === "textarea" ? (
                <Textarea
                  id={f.name}
                  rows={f.rows ?? 4}
                  placeholder={f.placeholder}
                  value={input[f.name] ?? ""}
                  onChange={(e) => setInput({ ...input, [f.name]: e.target.value })}
                />
              ) : (
                <Input
                  id={f.name}
                  placeholder={f.placeholder}
                  value={input[f.name] ?? ""}
                  onChange={(e) => setInput({ ...input, [f.name]: e.target.value })}
                />
              )}
            </div>
          ))}
          <Button onClick={generate} disabled={!canGenerate || loading} className="w-full">
            {loading ? (
              <><Loader2 className="size-4 mr-2 animate-spin" /> Generating…</>
            ) : (
              <>Generate</>
            )}
          </Button>
          <ResponsibleAIDisclaimer compact />
        </CardContent>
      </Card>

      <Card className="flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Output</CardTitle>
            <CardDescription>Edit before saving or sharing.</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={generate} disabled={!canGenerate || loading}>
              <RefreshCw className="size-4 mr-1.5" /> Regenerate
            </Button>
            <Button size="sm" variant="outline" onClick={copy} disabled={!output}>
              {copied ? <Check className="size-4 mr-1.5" /> : <Copy className="size-4 mr-1.5" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button size="sm" onClick={save} disabled={!output || !user}>
              <Save className="size-4 mr-1.5" /> Save
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 space-y-3">
          <Textarea
            value={output}
            onChange={(e) => setOutput(e.target.value)}
            placeholder="AI output will appear here. You can edit it before saving."
            className="min-h-[280px] font-mono text-sm"
          />
          {output && (
            <details className="rounded-md border bg-muted/30 p-3">
              <summary className="cursor-pointer text-sm font-medium">Preview formatted</summary>
              <div className="prose prose-sm dark:prose-invert max-w-none mt-3">
                <ReactMarkdown>{output}</ReactMarkdown>
              </div>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
