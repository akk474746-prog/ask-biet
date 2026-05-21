import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ChatWorkspace } from "@/components/chat/chat-workspace";

export const Route = createFileRoute("/chat/$threadId")({
  validateSearch: z.object({ q: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Chat — Ask BIET" },
      { name: "description", content: "Chat with Ask BIET, the AI assistant for Bapuji Institute of Engineering & Technology." },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  const { threadId } = Route.useParams();
  const { q } = Route.useSearch();
  return <ChatWorkspace threadId={threadId} initialQuery={q} key={threadId} />;
}
