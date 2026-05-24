import { useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Plus, Trash2, MessageSquare, Square, GraduationCap, Briefcase, BookOpen, Users, Mic, MicOff, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { loadThreads, saveThreads, createThread, deriveTitle, type ChatThread } from "@/lib/chat-storage";
import bietLogo from "@/assets/biet-logo.png";

function WatermarkLogo() {
  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden z-0"
      aria-hidden
    >
      <img
        src={bietLogo}
        alt=""
        className="w-[min(70vw,560px)] h-auto opacity-[0.08] dark:opacity-[0.12] select-none"
        style={{ filter: "blur(0.5px)" }}
      />
    </div>
  );
}

const SUGGESTIONS = [
  { icon: Users, text: "Who is the principal of BIET?" },
  { icon: Briefcase, text: "BIET placement information" },
  { icon: BookOpen, text: "Courses offered at BIET" },
  { icon: GraduationCap, text: "Admission process" },
];

export function ChatWorkspace({ threadId, initialQuery }: { threadId: string; initialQuery?: string }) {
  const navigate = useNavigate();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  useEffect(() => {
    if (hydrated && activeThread && activeThread.messages.length && messages.length === 0) {
      setMessages(activeThread.messages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, activeThread?.id]);

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
    setSidebarOpen(false);
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
    <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] h-[calc(100vh-3.5rem)]">
      {/* Sidebar */}
      <aside
        className={cn(
          "border-r border-border/60 bg-muted/30 flex-col",
          "md:flex",
          sidebarOpen ? "flex absolute inset-0 z-40 bg-background w-72" : "hidden",
        )}
      >
        <div className="p-3">
          <Button
            onClick={handleNewChat}
            variant="outline"
            className="w-full justify-start gap-2 bg-background hover:bg-accent"
          >
            <Plus className="h-4 w-4" />
            New chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-0.5">
          {threads.length === 0 && (
            <p className="text-xs text-muted-foreground px-3 py-2">No conversations yet.</p>
          )}
          {threads.map((t) => (
            <div
              key={t.id}
              className={cn(
                "group flex items-center gap-2 rounded-md px-2.5 py-2 text-sm cursor-pointer transition",
                t.id === threadId
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
              )}
            >
              <Link
                to="/chat/$threadId"
                params={{ threadId: t.id }}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-2 flex-1 min-w-0"
              >
                <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-60" />
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
      </aside>

      {/* Chat panel */}
      <section className="flex flex-col overflow-hidden relative">
        <WatermarkLogo />
        <div className="relative z-10 flex flex-col flex-1 overflow-hidden">
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
        </div>
      </section>
    </div>
  );
}

function EmptyState({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="flex-1 overflow-y-auto relative">
      <div className="relative max-w-2xl mx-auto px-6 pt-16 pb-10 text-center">
        <img src={bietLogo} alt="BIET Davangere" className="mx-auto h-16 w-16 object-contain mb-4" />
        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
          Ask <span className="text-primary">BIET</span>
        </h1>
        <p className="mt-3 text-[15px] text-muted-foreground">
          Hi! I'm Ask BIET — your AI assistant for BIET Davangere. Ask me anything about departments, admissions, placements, faculty, courses, or campus information.
        </p>

        <div className="mt-10 grid sm:grid-cols-2 gap-2.5">
          {SUGGESTIONS.map(({ icon: Icon, text }) => (
            <button
              key={text}
              onClick={() => onPick(text)}
              className="group text-left rounded-xl border border-border bg-card/80 backdrop-blur-sm p-3.5 hover:border-foreground/30 hover:bg-card transition"
            >
              <div className="flex items-start gap-3">
                <Icon className="h-4 w-4 mt-0.5 text-muted-foreground group-hover:text-foreground transition" />
                <span className="text-sm text-foreground/80 group-hover:text-foreground">{text}</span>
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
    <div ref={scrollerRef} className="flex-1 overflow-y-auto px-4 sm:px-8 py-8">
      <div className="mx-auto max-w-3xl flex flex-col gap-6">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="inline-flex gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-foreground/40 animate-bounce" />
              <span className="h-1.5 w-1.5 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: "0.15s" }} />
              <span className="h-1.5 w-1.5 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: "0.3s" }} />
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
        <div className="max-w-[85%] rounded-2xl bg-muted text-foreground px-4 py-2.5 text-[15px] whitespace-pre-wrap">
          {text}
        </div>
      </div>
    );
  }

  return (
    <div className="text-[15px] leading-relaxed text-foreground prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-headings:mt-4 prose-headings:mb-2 prose-pre:bg-muted prose-code:bg-muted prose-code:px-1 prose-code:rounded">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
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
  const [listening, setListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

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

  const toggleVoice = () => {
    const SR =
      (typeof window !== "undefined" &&
        ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)) ||
      null;
    if (!SR) {
      alert("Voice input is not supported in this browser. Try Chrome or Edge.");
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const rec = new SR();
    rec.lang = "en-IN";
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (e: any) => {
      const transcript = Array.from(e.results)
        .map((r: any) => r[0].transcript)
        .join(" ");
      setValue(transcript);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    setListening(true);
    rec.start();
  };

  return (
    <div className="px-3 sm:px-4 pb-4 pt-2 bg-gradient-to-t from-background via-background to-transparent">
      <div className="mx-auto max-w-3xl">
        <div className="relative rounded-3xl border border-border bg-card shadow-sm focus-within:border-foreground/30 focus-within:shadow-md transition">
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
            placeholder="Ask anything about BIET…"
            rows={1}
            className="w-full resize-none bg-transparent px-5 py-4 pr-24 text-[15px] outline-none placeholder:text-muted-foreground max-h-44"
            style={{ minHeight: "56px" }}
          />
          <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1.5">
            <Button
              onClick={toggleVoice}
              size="icon-sm"
              variant="ghost"
              className={cn("rounded-full text-muted-foreground hover:text-foreground", listening && "text-destructive animate-pulse")}
              aria-label={listening ? "Stop voice input" : "Start voice input"}
              type="button"
            >
              {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            {isLoading ? (
              <Button
                onClick={onStop}
                size="icon-sm"
                className="bg-foreground text-background hover:opacity-90 rounded-full"
                aria-label="Stop"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
              </Button>
            ) : (
              <Button
                onClick={submit}
                size="icon-sm"
                disabled={!value.trim()}
                className="bg-foreground text-background hover:opacity-90 rounded-full disabled:opacity-30"
                aria-label="Send"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Ask BIET only answers questions about BIET Davangere. Verify important details with the college office.
        </p>
      </div>
    </div>
  );
}
