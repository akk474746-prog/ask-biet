import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";
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
  beforeLoad: ({ search }) => {
    if (typeof window === "undefined") return;
    // Always open a fresh new chat on app load / refresh.
    const fresh = createThread();
    const existing = loadThreads();
    saveThreads([fresh, ...existing]);
    throw redirect({
      to: "/chat/$threadId",
      params: { threadId: fresh.id },
      search: search.q ? { q: search.q } : {},
    });
  },
  component: () => null,
});
