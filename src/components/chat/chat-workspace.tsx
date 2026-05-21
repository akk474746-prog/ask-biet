import { useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Plus, Trash2, MessageSquare, Sparkles, Send, Square, GraduationCap, Briefcase, BookOpen, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { loadThreads, saveThreads, createThread, deriveTitle, type ChatThread } from "@/lib/chat-storage";

const SUGGESTIONS = [
  { icon: GraduationCap, text: "What are the admission requirements for CSE?" },
  { icon: Briefcase, text: "Tell me about recent placements." },
  { icon: BookOpen, text: "Which departments and courses are offered?" },
  { icon: Users, text: "What is campus life like at BIET?" },
];

export function ChatWorkspace({ threadId, initialQuery }: { threadId: string; initialQuery?: string }) {
  const navigate = useNavigate();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Bootstrap threads & ensure active thread exists
  useEffect(() => {
    const stored = loadThreads();
    let next = stored;
    if (!next.find((t) => t.id === threadId)) {
      next = [{ id: threadId, title: "New chat", updatedAt: Date.now(), messages: [] }, ...next];
      saveThreads(next);
    }
    setThreads(next);
    setHydrated(true);
  }, [threadId]);

  const activeThread = useMemo(
    () => threads.find((t) => t.id === threadId),
    [threads, threadId],
  );

  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);
  const { messages, sendMessage, status, stop, setMessages } = useChat({
    id: threadId,
    messages: activeThread?.messages ?? [],
    transport,
    onError: (err) => console.error("Chat error", err),
  });

  // Hydrate messages once thread is loaded
  useEffect(() => {
    if (hydrated && activeThread && activeThread.messages.length && messages.length === 0) {
      setMessages(activeThread.messages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, activeThread?.id]);

  // Persist messages when stream finishes
  const lastSavedKey = useRef("");
  useEffect(() => {
    if (!hydrated) return;
    if (status === "streaming" || status === "submitted") return;
    const key = messages.map((m) => m.id).join("|") + ":" + messages.length;
    if (key === lastSavedKey.current) return;
    lastSavedKey.current = key;
    const updated: ChatThread = {
      id: threadId,
      title: deriveTitle(messages),
      updatedAt: Date.now(),
      messages,
    };
    setThreads((prev) => {
      const others = prev.filter((t) => t.id !== threadId);
      const next = [updated, ...others];
      saveThreads(next);
      return next;
    });
  }, [hydrated, messages, status, threadId]);

  // Handle ?q= initial prompt
  const consumedQuery = useRef(false);
  useEffect(() => {
    if (!hydrated || !initialQuery || consumedQuery.current) return;
    consumedQuery.current = true;
    void sendMessage({ text: initialQuery });
    navigate({ to: "/chat/$threadId", params: { threadId }, search: {}, replace: true });
  }, [hydrated, initialQuery, navigate, sendMessage, threadId]);

  const handleNewChat = useCallback(() => {
    const t = createThread();
    const next = [t, ...threads];
    saveThreads(next);
    setThreads(next);
    navigate({ to: "/chat/$threadId", params: { threadId: t.id } });
  }, [navigate, threads]);

  const handleDelete = useCallback(
    (id: string) => {
      const next = threads.filter((t) => t.id !== id);
      saveThreads(next);
      setThreads(next);
      if (id === threadId) {
        const target = next[0] ?? createThread();
        if (!next[0]) saveThreads([target]);
        navigate({ to: "/chat/$threadId", params: { threadId: target.id } });
      }
    },
    [navigate, threadId, threads],
  );

  const isLoading = status === "submitted" || status === "streaming";
  const showEmpty = messages.length === 0;

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 py-6 grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4 h-[calc(100vh-9.5rem)]">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col glass rounded-2xl border overflow-hidden">
        <div className="p-3 border-b border-border/60">
          <Button
            onClick={handleNewChat}
            className="w-full bg-gradient-brand text-brand-foreground border-0 shadow-glow hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            New chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {threads.length === 0 && (
            <p className="text-xs text-muted-foreground p-3">No conversations yet.</p>
          )}
          {threads.map((t) => (
            <div
              key={t.id}
              className={cn(
                "group flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm cursor-pointer transition border border-transparent",
                t.id === threadId
                  ? "bg-accent/60 text-foreground border-border/60"
                  : "text-muted-foreground hover:bg-accent/40 hover:text-foreground",
              )}
            >
              <Link
                to="/chat/$threadId"
                params={{ threadId: t.id }}
                className="flex items-center gap-2 flex-1 min-w-0"
              >
                <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-70" />
                <span className="truncate">{t.title}</span>
              </Link>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(t.id);
                }}
                className="opacity-0 group-hover:opacity-100 transition p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                aria-label="Delete chat"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-border/60 text-[11px] text-muted-foreground">
          Conversations are saved on this device only.
        </div>
      </aside>

      {/* Chat panel */}
      <section className="glass rounded-2xl border flex flex-col overflow-hidden">
        {showEmpty ? (
          <EmptyState onPick={(text) => sendMessage({ text })} />
        ) : (
          <MessageList messages={messages} isLoading={isLoading} />
        )}
        <Composer
          onSend={(text) => sendMessage({ text })}
          onStop={stop}
          isLoading={isLoading}
        />
      </section>
    </div>
  );
}

function EmptyState({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-10">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-brand grid place-items-center shadow-glow animate-float">
          <Sparkles className="h-7 w-7 text-brand-foreground" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-bold">
          Hi, I'm <span className="text-gradient-brand">Ask BIET</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Your AI assistant for everything about BIET Davangere. Ask about admissions, courses, placements, fees, faculty and more.
        </p>

        <div className="mt-10 grid sm:grid-cols-2 gap-3">
          {SUGGESTIONS.map(({ icon: Icon, text }) => (
            <button
              key={text}
              onClick={() => onPick(text)}
              className="group text-left rounded-xl border border-border/60 bg-card/50 p-4 hover:border-brand/50 hover:shadow-glow transition"
            >
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-secondary grid place-items-center group-hover:bg-gradient-brand transition">
                  <Icon className="h-4 w-4 text-foreground group-hover:text-brand-foreground" />
                </div>
                <span className="text-sm">{text}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function MessageList({ messages, isLoading }: { messages: UIMessage[]; isLoading: boolean }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, isLoading]);

  return (
    <div ref={scrollerRef} className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-5">
      <div className="mx-auto max-w-3xl flex flex-col gap-5">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-7 w-7 rounded-lg bg-gradient-brand grid place-items-center shadow-glow">
              <Sparkles className="h-3.5 w-3.5 text-brand-foreground" />
            </div>
            <span className="inline-flex gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-brand animate-bounce" />
              <span className="h-1.5 w-1.5 rounded-full bg-brand animate-bounce" style={{ animationDelay: "0.15s" }} />
              <span className="h-1.5 w-1.5 rounded-full bg-brand animate-bounce" style={{ animationDelay: "0.3s" }} />
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";
  const text = message.parts.map((p) => (p.type === "text" ? p.text : "")).join("");

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-gradient-brand text-brand-foreground px-4 py-2.5 text-sm shadow-glow whitespace-pre-wrap">
          {text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <div className="h-7 w-7 shrink-0 rounded-lg bg-gradient-brand grid place-items-center shadow-glow mt-0.5">
        <Sparkles className="h-3.5 w-3.5 text-brand-foreground" />
      </div>
      <div className="flex-1 min-w-0 text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-headings:mt-4 prose-headings:mb-2 prose-pre:bg-secondary/60 prose-code:bg-secondary/60 prose-code:px-1 prose-code:rounded">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
      </div>
    </div>
  );
}

function Composer({
  onSend,
  onStop,
  isLoading,
}: {
  onSend: (text: string) => void;
  onStop: () => void;
  isLoading: boolean;
}) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);
  useEffect(() => {
    if (!isLoading) textareaRef.current?.focus();
  }, [isLoading]);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setValue("");
  };

  return (
    <div className="border-t border-border/60 p-3 sm:p-4">
      <div className="mx-auto max-w-3xl">
        <div className="relative rounded-2xl border border-border bg-card/70 shadow-soft focus-within:border-brand/60 focus-within:shadow-glow transition">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Ask anything about BIET — admissions, courses, placements…"
            rows={1}
            className="w-full resize-none bg-transparent px-4 py-3.5 pr-14 text-sm outline-none placeholder:text-muted-foreground max-h-40"
            style={{ minHeight: "52px" }}
          />
          <div className="absolute right-2 bottom-2">
            {isLoading ? (
              <Button
                onClick={onStop}
                size="icon-sm"
                className="bg-destructive text-destructive-foreground hover:opacity-90 rounded-lg"
                aria-label="Stop"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
              </Button>
            ) : (
              <Button
                onClick={submit}
                size="icon-sm"
                disabled={!value.trim()}
                className="bg-gradient-brand text-brand-foreground hover:opacity-90 border-0 shadow-glow rounded-lg disabled:opacity-40 disabled:shadow-none"
                aria-label="Send"
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Ask BIET can make mistakes — always verify important details with the college office.
        </p>
      </div>
    </div>
  );
}
