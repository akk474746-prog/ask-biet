import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { extractText, getDocumentProxy } from "unpdf";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { chunkText } from "@/lib/chunk";
import { embedTexts } from "@/lib/embeddings.server";

const BUCKET = "biet-docs";
const MAX_BYTES = 15 * 1024 * 1024; // 15 MB

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabaseAdmin as any;

function checkAdmin(request: Request): Response | null {
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) return null;
  if (request.headers.get("x-admin-token") !== adminToken) {
    return new Response("Unauthorized", { status: 401 });
  }
  return null;
}

async function embedAndStoreChunks(
  uploadedDocId: string,
  filename: string,
  storagePath: string,
  text: string,
) {
  const chunks = chunkText(text);
  if (chunks.length === 0) return 0;

  await db.from("biet_documents").delete().eq("uploaded_doc_id", uploadedDocId);

  const BATCH = 64;
  let total = 0;
  for (let i = 0; i < chunks.length; i += BATCH) {
    const slice = chunks.slice(i, i + BATCH);
    const embeddings = await embedTexts(slice);
    const rows = slice.map((content, j) => ({
      url: `pdf://${storagePath}`,
      title: filename,
      content,
      chunk_index: i + j,
      source_type: "pdf",
      uploaded_doc_id: uploadedDocId,
      embedding: embeddings[j] as unknown as string,
    }));
    const { error } = await db.from("biet_documents").insert(rows);
    if (error) throw new Error(`Insert failed: ${error.message}`);
    total += rows.length;
  }
  return total;
}

export const Route = createFileRoute("/api/admin/upload-pdf")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const denied = checkAdmin(request);
        if (denied) return denied;

        try {
          const form = await request.formData();
          const file = form.get("file");
          const department = (form.get("department") as string | null)?.trim() || null;

          if (!(file instanceof File)) {
            return Response.json({ ok: false, error: "No file provided" }, { status: 400 });
          }
          if (file.size > MAX_BYTES) {
            return Response.json(
              { ok: false, error: `File too large (max ${MAX_BYTES / 1024 / 1024} MB)` },
              { status: 400 },
            );
          }
          if (!file.name.toLowerCase().endsWith(".pdf")) {
            return Response.json({ ok: false, error: "Only PDF files are supported" }, { status: 400 });
          }

          const buffer = new Uint8Array(await file.arrayBuffer());

          const pdf = await getDocumentProxy(buffer);
          const { text } = await extractText(pdf, { mergePages: true });
          const fullText = Array.isArray(text) ? text.join("\n\n") : text;

          if (!fullText || fullText.trim().length < 30) {
            return Response.json(
              { ok: false, error: "Could not extract readable text (PDF may be a scanned image)" },
              { status: 400 },
            );
          }

          const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
          const storagePath = `${Date.now()}-${safeName}`;
          const { error: upErr } = await supabaseAdmin.storage
            .from(BUCKET)
            .upload(storagePath, buffer, { contentType: "application/pdf", upsert: false });
          if (upErr) throw new Error(`Storage upload failed: ${upErr.message}`);

          const { data: doc, error: docErr } = await db
            .from("biet_uploaded_documents")
            .insert({
              filename: file.name,
              department,
              storage_path: storagePath,
              size_bytes: file.size,
              chunks_indexed: 0,
            })
            .select()
            .single();
          if (docErr) throw new Error(`Tracking insert failed: ${docErr.message}`);

          const chunksIndexed = await embedAndStoreChunks(doc.id, file.name, storagePath, fullText);

          await db
            .from("biet_uploaded_documents")
            .update({ chunks_indexed: chunksIndexed })
            .eq("id", doc.id);

          return Response.json({ ok: true, id: doc.id, chunksIndexed });
        } catch (err) {
          console.error("Upload failed", err);
          return Response.json(
            { ok: false, error: err instanceof Error ? err.message : String(err) },
            { status: 500 },
          );
        }
      },

      DELETE: async ({ request }: { request: Request }) => {
        const denied = checkAdmin(request);
        if (denied) return denied;

        const url = new URL(request.url);
        const id = url.searchParams.get("id");
        if (!id) return Response.json({ ok: false, error: "Missing id" }, { status: 400 });

        const { data: doc } = await db
          .from("biet_uploaded_documents")
          .select("storage_path")
          .eq("id", id)
          .maybeSingle();

        if (doc?.storage_path) {
          await supabaseAdmin.storage.from(BUCKET).remove([doc.storage_path]);
        }
        const { error } = await db.from("biet_uploaded_documents").delete().eq("id", id);
        if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });
        return Response.json({ ok: true });
      },
    },
  },
});
