// Server-only helper that calls the Lovable AI embeddings endpoint.
// Uses openai/text-embedding-3-small at 1536 dims (matches biet_documents.embedding).
const EMBEDDING_MODEL = "openai/text-embedding-3-small";
const EMBEDDING_DIMS = 1536;
const GATEWAY = "https://ai.gateway.lovable.dev/v1/embeddings";

export async function embedTexts(inputs: string[]): Promise<number[][]> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY is not configured");
  if (inputs.length === 0) return [];

  // The gateway accepts up to 256 items / 32KB per string. We assume callers chunk.
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key,
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: inputs,
      dimensions: EMBEDDING_DIMS,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Embeddings ${res.status}: ${body}`);
  }

  const json = (await res.json()) as { data: { embedding: number[]; index: number }[] };
  // Ensure order matches input order.
  const sorted = [...json.data].sort((a, b) => a.index - b.index);
  return sorted.map((d) => d.embedding);
}

export async function embedQuery(query: string): Promise<number[]> {
  const [v] = await embedTexts([query]);
  return v;
}
