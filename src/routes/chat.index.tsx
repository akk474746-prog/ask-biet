import { createFileRoute, redirect } from "@tanstack/react-router";
import { createThread, loadThreads, saveThreads } from "@/lib/chat-storage";
import { z } from "zod";

export const Route = createFileRoute("/chat/")({
  validateSearch: z.object({ q: z.string().optional() }),
  beforeLoad: ({ search }) => {
    if (typeof window === "undefined") return;
    const threads = loadThreads();
    let target = threads[0];
    if (!target) {
      target = createThread();
      saveThreads([target]);
    }
    throw redirect({
      to: "/chat/$threadId",
      params: { threadId: target.id },
      search: search.q ? { q: search.q } : {},
    });
  },
  component: () => null,
});
