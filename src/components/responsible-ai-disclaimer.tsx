import { ShieldAlert } from "lucide-react";

export function ResponsibleAIDisclaimer({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
        <ShieldAlert className="size-3.5" />
        AI-generated. Review for accuracy before sharing or acting on it.
      </p>
    );
  }
  return (
    <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground flex gap-2">
      <ShieldAlert className="size-4 shrink-0 mt-0.5 text-primary" />
      <div>
        <strong className="text-foreground">Responsible AI use:</strong> Outputs may be incomplete or
        inaccurate. Always review, fact-check, and edit AI-generated content before sending, sharing,
        or making decisions. Do not paste confidential personal data, secrets, or regulated information.
      </div>
    </div>
  );
}
