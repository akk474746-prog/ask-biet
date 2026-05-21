import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway";

const SYSTEM_PROMPT = `You are "Ask BIET", the official AI assistant for Bapuji Institute of Engineering and Technology (BIET), Davangere, Karnataka, India.

Be warm, concise, and helpful. Help students, parents, and visitors with:
- Admissions (eligibility, application process, KCET/COMEDK)
- Courses & departments (CSE, ISE, ECE, EEE, ME, CE, AI&ML, etc.)
- Fees structure (give general guidance, point to office for exact figures)
- Placements (top recruiters, packages, training)
- Campus life, events, hostel, facilities
- Faculty, timetable, exam details
- Contact information & how to reach the right office

Tone: friendly, professional, slightly modern. Use short paragraphs and bullet points. Format with markdown.
When you don't know a specific real-time fact (live cut-offs, current fees, today's timetable), say so clearly and recommend contacting the admissions office or visiting the official website.
Never invent specific numbers, dates, or names that you are not confident about.`;

type ChatRequestBody = { messages?: unknown };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const { messages } = (await request.json()) as ChatRequestBody;
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        const key = process.env.LOVABLE_API_KEY;
        if (!key) {
          return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        }

        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-3-flash-preview");

        try {
          const result = streamText({
            model,
            system: SYSTEM_PROMPT,
            messages: await convertToModelMessages(messages as UIMessage[]),
          });
          return result.toUIMessageStreamResponse({
            originalMessages: messages as UIMessage[],
          });
        } catch (err) {
          console.error("AI gateway error", err);
          return new Response("AI service unavailable", { status: 502 });
        }
      },
    },
  },
});
