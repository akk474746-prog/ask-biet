# Add Uploaded PDFs as Priority Knowledge Source

## Goal
Department PDFs uploaded via the admin page become the **highest-priority** retrieval source for the chatbot, ranked above the scraped BIET website data and the model's general fallback knowledge.

## Architecture

```
User question
   │
   ▼
[1] Search uploaded PDF chunks (source_type='pdf')  ─► if good matches, use these
[2] Search scraped website chunks (source_type='page')
[3] Merge top results, PDFs weighted higher
   │
   ▼
LLM answers naturally (never reveals source origin)
```

Both sources live in the same `biet_documents` table — we already have a `source_type` column, so no schema change to the documents table itself. Add a new `biet_uploaded_documents` table to track uploaded files (filename, size, department tag, uploaded_at) so admins can list/delete them.

## Steps

### 1. Database migration
- New table `biet_uploaded_documents` (id, filename, department, size_bytes, chunks_indexed, uploaded_at). RLS: public read, no client write.
- Storage bucket `biet-docs` (private) for the original PDFs so we can re-extract if needed.
- Update `match_biet_documents` RPC → `match_biet_documents_ranked` that returns chunks with a `source_priority` (pdf=2, page=1) and orders by `source_priority DESC, similarity DESC`.

### 2. Server: PDF processing
- New `src/routes/api/admin/upload-pdf.ts` POST handler (multipart): admin-token guarded, parses PDF with `pdf-parse` (pure JS, Worker-safe), chunks via existing `chunkText`, embeds via existing `embedTexts`, inserts into `biet_documents` with `source_type='pdf'`, `url=` storage path, `title=` filename, and records a row in `biet_uploaded_documents`.
- New `DELETE /api/admin/upload-pdf?id=` removes the uploaded doc and all its chunks.
- Update `biet-knowledge.server.ts` → call new ranked RPC; lower the similarity floor for PDF chunks (0.15) vs page chunks (0.25) since PDFs are the trusted source.

### 3. Chat prompt
- In `src/routes/api/chat.ts`, format retrieved chunks with implicit priority (PDFs first in context). System prompt: "Use the provided knowledge base passages as your primary source. Never reveal whether information came from a document, website, or general knowledge."

### 4. Admin UI (`src/routes/admin.tsx`)
Add an "Uploaded Documents" panel:
- File input (PDF only, multiple)
- Optional department tag dropdown (CSE, ISE, AI&ML, ECE, EEE, Mech, Civil, Biotech, MBA, MCA, General)
- Upload button → POST multipart to `/api/admin/upload-pdf`
- List of uploaded docs with filename, department, chunks, uploaded date, delete button
- "Rebuild embeddings" button → re-embeds all uploaded docs from stored files
- Existing crawl panel stays for website data

### 5. Dependencies
- Add `pdf-parse` (pure JS PDF text extractor; Worker-compatible — no native bindings).

## Technical notes
- We keep using the existing `biet_documents` + `match_biet_documents` pgvector setup; PDFs are just rows with `source_type='pdf'`.
- The LLM never sees "this came from upload X" — chunks are passed as plain `[Source N]` blocks just like website data.
- Admin token (`ADMIN_TOKEN` secret) gates both crawl and upload endpoints.
- File-size cap 10 MB/upload, 50 pages parsed max.

Approve to proceed and I'll create the migration, then wire the server + UI in one pass.