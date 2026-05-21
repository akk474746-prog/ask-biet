import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { embedQuery } from "./embeddings.server";

export type RetrievedChunk = {
  id: string;
  url: string;
  title: string | null;
  content: string;
  similarity: number;
};

const SIMILARITY_FLOOR = 0.25; // below this we treat retrieval as "no useful match"

export async function retrieveBietContext(query: string, matchCount = 6) {
  const embedding = await embedQuery(query);
  const { data, error } = await supabaseAdmin.rpc("match_biet_documents", {
    query_embedding: embedding as unknown as string,
    match_count: matchCount,
  });
  if (error) throw new Error(`Retrieval failed: ${error.message}`);
  const chunks = (data ?? []) as RetrievedChunk[];
  const useful = chunks.filter((c) => c.similarity >= SIMILARITY_FLOOR);
  return { chunks, useful };
}

export function formatContextForPrompt(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) return "(no relevant BIET context retrieved)";
  return chunks
    .map(
      (c, i) =>
        `[Source ${i + 1}] ${c.title ?? "Untitled"} — ${c.url}\n${c.content.trim()}`,
    )
    .join("\n\n---\n\n");
}
