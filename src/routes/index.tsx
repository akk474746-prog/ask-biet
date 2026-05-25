import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { useEffect, useState } from "react";
import { ChatWorkspace } from "@/components/chat/chat-workspace";
import { createThread, loadThreads, saveThreads } from "@/lib/chat-storage";

export const Route = createFileRoute("/")({
  validateSearch: z.object({ q: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Ask BIET — Official AI Assistant for BIET Davangere" },
      {
        name: "description",
        content:
          "Ask BIET is the official AI assistant for Bapuji Institute of Engineering & Technology, Davangere. Get instant answers about admissions, departments, placements and campus life.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { q } = Route.useSearch();
  const [threadId, setThreadId] = useState<string | null>(null);

  useEffect(() => {
    const fresh = createThread();
    const existing = loadThreads();
    saveThreads([fresh, ...existing]);
    setThreadId(fresh.id);
  }, []);

  if (!threadId) {
    return (
      <div className="h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="h-2 w-2 rounded-full bg-primary animate-bounce" />
          <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.15s" }} />
          <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.3s" }} />
        </div>
      </div>
    );
  }

  return <ChatWorkspace threadId={threadId} initialQuery={q} key={threadId} />;
}
