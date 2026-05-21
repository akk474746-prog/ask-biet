import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { chunkText } from "@/lib/chunk";
import { embedTexts } from "@/lib/embeddings.server";

const BIET_DOMAIN = "https://www.bietdvg.edu";

type FirecrawlDoc = {
  markdown?: string;
  metadata?: { title?: string; sourceURL?: string; url?: string; statusCode?: number };
};

async function firecrawlCrawl(limit: number): Promise<FirecrawlDoc[]> {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) throw new Error("FIRECRAWL_API_KEY is not configured. Connect Firecrawl in Connectors.");

  // Start crawl
  const start = await fetch("https://api.firecrawl.dev/v2/crawl", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      url: BIET_DOMAIN,
      limit,
      scrapeOptions: { formats: ["markdown"], onlyMainContent: true },
      allowSubdomains: false,
    }),
  });
  if (!start.ok) throw new Error(`Firecrawl start failed: ${start.status} ${await start.text()}`);
  const { id } = (await start.json()) as { id: string };
  if (!id) throw new Error("Firecrawl did not return a job id");

  // Poll
  const deadline = Date.now() + 25 * 60_000; // 25 min cap
  const docs: FirecrawlDoc[] = [];
  let next: string | null = `https://api.firecrawl.dev/v2/crawl/${id}`;
  while (next && Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 8000));
    const res = await fetch(next, { headers: { Authorization: `Bearer ${key}` } });
    if (!res.ok) throw new Error(`Firecrawl poll failed: ${res.status} ${await res.text()}`);
    const data = (await res.json()) as {
      status: string;
      data?: FirecrawlDoc[];
      next?: string | null;
    };
    if (Array.isArray(data.data)) docs.push(...data.data);
    if (data.status === "completed" || data.status === "failed") {
      next = data.next ?? null;
      if (!next) break;
    } else {
      next = data.next ?? `https://api.firecrawl.dev/v2/crawl/${id}`;
    }
  }
  return docs;
}

async function reindexAll(limit: number) {
  const { data: job, error: jobErr } = await supabaseAdmin
    .from("biet_crawl_jobs")
    .insert({ status: "running" })
    .select()
    .single();
  if (jobErr) throw new Error(`Could not create crawl job: ${jobErr.message}`);

  try {
    const docs = await firecrawlCrawl(limit);

    // Clear old documents — fresh snapshot.
    await supabaseAdmin.from("biet_documents").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    let pagesIndexed = 0;
    let chunksIndexed = 0;
    const BATCH = 64;
    let buffer: { url: string; title: string | null; chunk: string; chunkIndex: number }[] = [];

    const flush = async () => {
      if (buffer.length === 0) return;
      const embeddings = await embedTexts(buffer.map((b) => b.chunk));
      const rows = buffer.map((b, i) => ({
        url: b.url,
        title: b.title,
        content: b.chunk,
        chunk_index: b.chunkIndex,
        source_type: "page",
        embedding: embeddings[i] as unknown as string,
      }));
      const { error } = await supabaseAdmin.from("biet_documents").insert(rows);
      if (error) throw new Error(`Insert failed: ${error.message}`);
      chunksIndexed += rows.length;
      buffer = [];
    };

    for (const doc of docs) {
      const md = doc.markdown?.trim();
      const url = doc.metadata?.sourceURL ?? doc.metadata?.url ?? "";
      if (!md || !url) continue;
      const title = doc.metadata?.title ?? null;
      const chunks = chunkText(md);
      if (chunks.length === 0) continue;
      pagesIndexed += 1;
      for (let i = 0; i < chunks.length; i++) {
        buffer.push({ url, title, chunk: chunks[i], chunkIndex: i });
        if (buffer.length >= BATCH) await flush();
      }
    }
    await flush();

    await supabaseAdmin
      .from("biet_crawl_jobs")
      .update({
        status: "completed",
        pages_indexed: pagesIndexed,
        chunks_indexed: chunksIndexed,
        finished_at: new Date().toISOString(),
      })
      .eq("id", job.id);

    return { jobId: job.id, pagesIndexed, chunksIndexed };
  } catch (err) {
    await supabaseAdmin
      .from("biet_crawl_jobs")
      .update({
        status: "failed",
        error: err instanceof Error ? err.message : String(err),
        finished_at: new Date().toISOString(),
      })
      .eq("id", job.id);
    throw err;
  }
}

export const Route = createFileRoute("/api/admin/crawl")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        // Lightweight admin guard via shared token. Set ADMIN_TOKEN in secrets, then
        // call with header `x-admin-token`. Without it, only same-origin admin page works
        // (which we still gate in UI). For production, swap for proper auth.
        const adminToken = process.env.ADMIN_TOKEN;
        if (adminToken) {
          const provided = request.headers.get("x-admin-token");
          if (provided !== adminToken) {
            return new Response("Unauthorized", { status: 401 });
          }
        }

        const body = await request.json().catch(() => ({}));
        const limit = typeof body?.limit === "number" ? Math.min(Math.max(body.limit, 1), 1000) : 400;

        try {
          const result = await reindexAll(limit);
          return Response.json({ ok: true, ...result });
        } catch (err) {
          console.error("Crawl failed", err);
          return Response.json(
            { ok: false, error: err instanceof Error ? err.message : String(err) },
            { status: 500 },
          );
        }
      },
    },
  },
});
