import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResponsibleAIDisclaimer } from "@/components/responsible-ai-disclaimer";
import { Plus, Trash2, Send, Loader2, MessagesSquare, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/chat/$threadId")({ component: ChatThread });

type Thread = { id: string; title: string; updated_at: string };
type DBMessage = { id: string; role: string; content: string; created_at: string };

function ChatThread() {
  const { threadId } = useParams({ from: "/_app/chat/$threadId" });
  const { user } = useAuth();
  const navigate = useNavigate();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [initialMessages, setInitialMessages] = useState<UIMessage[] | null>(null);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const loadThreads = async () => {
    const { data } = await supabase
      .from("threads")
      .select("id,title,updated_at")
      .order("updated_at", { ascending: false });
    setThreads(data ?? []);
  };

  useEffect(() => {
    loadThreads();
  }, [user]);

  useEffect(() => {
    setInitialMessages(null);
    (async () => {
      const { data } = await supabase
        .from("messages")
        .select("id,role,content,created_at")
        .eq("thread_id", threadId)
        .order("created_at", { ascending: true });
      const ui: UIMessage[] = (data ?? []).map((m: DBMessage) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        parts: [{ type: "text", text: m.content }],
      }));
      setInitialMessages(ui);
    })();
  }, [threadId]);

  if (initialMessages === null) {
    return (
      <div className="grid place-items-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-4 max-w-6xl">
      <ThreadList
        threads={threads}
        activeId={threadId}
        onCreate={async () => {
          if (!user) return;
          const { data, error } = await supabase
            .from("threads")
            .insert({ user_id: user.id, title: "New conversation" })
            .select("id")
            .single();
          if (error || !data) return toast.error(error?.message || "Failed");
          await loadThreads();
          navigate({ to: "/chat/$threadId", params: { threadId: data.id } });
        }}
        onDelete={async (id) => {
          await supabase.from("threads").delete().eq("id", id);
          const rest = threads.filter((t) => t.id !== id);
          setThreads(rest);
          if (id === threadId) {
            if (rest[0]) navigate({ to: "/chat/$threadId", params: { threadId: rest[0].id } });
            else navigate({ to: "/chat" });
          }
        }}
      />
      <ChatPanel
        key={threadId}
        threadId={threadId}
        userId={user?.id ?? ""}
        initialMessages={initialMessages}
        input={input}
        setInput={setInput}
        scrollRef={scrollRef}
        textareaRef={textareaRef}
        onTitled={loadThreads}
      />
    </div>
  );
}

function ThreadList({
  threads,
  activeId,
  onCreate,
  onDelete,
}: {
  threads: Thread[];
  activeId: string;
  onCreate: () => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Card className="p-2 h-[calc(100vh-7rem)] flex flex-col">
      <div className="px-2 py-1.5 flex items-center justify-between">
        <div className="text-sm font-medium flex items-center gap-1.5">
          <MessagesSquare className="size-4" /> Conversations
        </div>
        <Button size="icon" variant="ghost" className="size-7" onClick={onCreate} title="New">
          <Plus className="size-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <ul className="space-y-1 p-1">
          {threads.map((t) => {
            const active = t.id === activeId;
            return (
              <li key={t.id} className="group flex items-center gap-1">
                <Link
                  to="/chat/$threadId"
                  params={{ threadId: t.id }}
                  className={`flex-1 truncate rounded-md px-2 py-1.5 text-sm transition-colors ${
                    active ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                  }`}
                >
                  {t.title || "New conversation"}
                </Link>
                <button
                  onClick={() => onDelete(t.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition"
                  aria-label="Delete"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </li>
            );
          })}
          {threads.length === 0 && (
            <li className="text-xs text-muted-foreground px-2 py-3">No conversations yet.</li>
          )}
        </ul>
      </ScrollArea>
    </Card>
  );
}

function ChatPanel({
  threadId,
  userId,
  initialMessages,
  input,
  setInput,
  scrollRef,
  textareaRef,
  onTitled,
}: {
  threadId: string;
  userId: string;
  initialMessages: UIMessage[];
  input: string;
  setInput: (v: string) => void;
  scrollRef: React.RefObject<HTMLDivElement>;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  onTitled: () => void;
}) {
  const transport = useRef(new DefaultChatTransport({ api: "/api/chat" })).current;

  const { messages, sendMessage, status, error } = useChat({
    id: threadId,
    messages: initialMessages,
    transport,
    onFinish: async ({ message }) => {
      const text = message.parts
        .map((p: any) => (p.type === "text" ? p.text : ""))
        .join("");
      if (text.trim() && userId) {
        const { error: insErr } = await supabase.from("messages").insert({
          thread_id: threadId,
          user_id: userId,
          role: "assistant",
          content: text,
        });
        if (insErr) console.error(insErr);
        await supabase.from("threads").update({ updated_at: new Date().toISOString() }).eq("id", threadId);
      }
    },
    onError: (e) => toast.error(e.message || "Chat error"),
  });

  useEffect(() => {
    textareaRef.current?.focus();
  }, [status, threadId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  const busy = status === "submitted" || status === "streaming";

  const submit = async () => {
    const text = input.trim();
    if (!text || busy || !userId) return;
    setInput("");
    // persist user message
    const { error: insErr } = await supabase.from("messages").insert({
      thread_id: threadId,
      user_id: userId,
      role: "user",
      content: text,
    });
    if (insErr) {
      toast.error(insErr.message);
      return;
    }
    // auto-title from first user message
    if (messages.length === 0) {
      const title = text.slice(0, 60);
      await supabase.from("threads").update({ title }).eq("id", threadId);
      onTitled();
    }
    await sendMessage({ text });
  };

  return (
    <Card className="flex flex-col h-[calc(100vh-7rem)]">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="h-full grid place-items-center text-center">
            <div className="max-w-sm space-y-2">
              <div className="size-12 rounded-xl bg-primary/10 text-primary grid place-items-center mx-auto">
                <Sparkles className="size-6" />
              </div>
              <h2 className="text-lg font-medium">How can I help today?</h2>
              <p className="text-sm text-muted-foreground">
                Draft emails, summarize notes, plan tasks, or ask anything work-related.
              </p>
            </div>
          </div>
        )}
        {messages.map((m) => {
          const text = m.parts.map((p: any) => (p.type === "text" ? p.text : "")).join("");
          if (m.role === "user") {
            return (
              <div key={m.id} className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary text-primary-foreground px-3.5 py-2 text-sm whitespace-pre-wrap">
                  {text}
                </div>
              </div>
            );
          }
          return (
            <div key={m.id} className="flex">
              <div className="max-w-[90%] prose prose-sm dark:prose-invert">
                <ReactMarkdown>{text}</ReactMarkdown>
              </div>
            </div>
          );
        })}
        {status === "submitted" && (
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" /> Thinking…
          </div>
        )}
        {error && <div className="text-sm text-destructive">{error.message}</div>}
      </div>
      <div className="border-t p-3 space-y-2">
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Message the assistant… (Shift+Enter for new line)"
            rows={2}
            className="resize-none pr-12"
            disabled={busy}
          />
          <Button
            onClick={submit}
            disabled={!input.trim() || busy}
            size="icon"
            className="absolute right-2 bottom-2 size-8"
          >
            <Send className="size-4" />
          </Button>
        </div>
        <ResponsibleAIDisclaimer compact />
      </div>
    </Card>
  );
}
