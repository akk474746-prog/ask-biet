import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { embedQuery } from "./embeddings.server";

export type RetrievedChunk = {
  id: string;
  url: string;
  title: string | null;
  content: string;
  source_type: string;
  source_priority: number;
  similarity: number;
};

// PDFs are trusted internal sources — accept weaker matches.
// Website pages need higher similarity to be considered useful.
const PDF_FLOOR = 0.15;
const PAGE_FLOOR = 0.25;

export async function retrieveBietContext(query: string, matchCount = 8) {
  const embedding = await embedQuery(query);
  const { data, error } = await supabaseAdmin.rpc("match_biet_documents_ranked", {
    query_embedding: embedding as unknown as string,
    match_count: matchCount,
  });
  if (error) throw new Error(`Retrieval failed: ${error.message}`);
  const chunks = (data ?? []) as RetrievedChunk[];
  const useful = chunks.filter((c) =>
    c.source_type === "pdf" ? c.similarity >= PDF_FLOOR : c.similarity >= PAGE_FLOOR,
  );
  // Already ordered by source_priority desc, similarity desc from SQL.
  return { chunks, useful };
}

export function formatContextForPrompt(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) return "(no relevant BIET context retrieved)";
  return chunks
    .map((c, i) => `[Source ${i + 1}] ${c.title ?? "Untitled"}\n${c.content.trim()}`)
    .join("\n\n---\n\n");
}
