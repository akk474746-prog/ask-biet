import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Loader2,
  RefreshCw,
  Database,
  AlertTriangle,
  CheckCircle2,
  Upload,
  FileText,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin — Ask BIET" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminPage,
});

type Job = {
  id: string;
  status: string;
  pages_indexed: number;
  chunks_indexed: number;
  error: string | null;
  started_at: string;
  finished_at: string | null;
};

type UploadedDoc = {
  id: string;
  filename: string;
  department: string | null;
  size_bytes: number;
  chunks_indexed: number;
  uploaded_at: string;
};

type Status = { totalChunks: number; jobs: Job[]; uploadedDocs: UploadedDoc[] };

const DEPARTMENTS = [
  "General",
  "CSE",
  "ISE",
  "AI & ML",
  "ECE",
  "EEE",
  "Mechanical",
  "Civil",
  "Biotechnology",
  "MBA",
  "MCA",
];

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

function AdminPage() {
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(false);
  const [crawling, setCrawling] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [department, setDepartment] = useState("General");
  const [token, setToken] = useState("");
  const [limit, setLimit] = useState(400);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/status");
      if (res.ok) setStatus(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    const id = setInterval(load, 10000);
    return () => clearInterval(id);
  }, []);

  const triggerCrawl = async () => {
    setCrawling(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/crawl", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "x-admin-token": token } : {}),
        },
        body: JSON.stringify({ limit }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setMessage({ type: "err", text: data.error ?? `Request failed (${res.status})` });
      } else {
        setMessage({
          type: "ok",
          text: `Indexed ${data.pagesIndexed} pages → ${data.chunksIndexed} chunks.`,
        });
        await load();
      }
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Network error" });
    } finally {
      setCrawling(false);
    }
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setMessage(null);
    let uploadedCount = 0;
    let totalChunks = 0;
    try {
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.append("file", file);
        form.append("department", department);
        const res = await fetch("/api/admin/upload-pdf", {
          method: "POST",
          headers: token ? { "x-admin-token": token } : {},
          body: form,
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) {
          throw new Error(data.error ?? `Upload of ${file.name} failed (${res.status})`);
        }
        uploadedCount += 1;
        totalChunks += data.chunksIndexed ?? 0;
      }
      setMessage({
        type: "ok",
        text: `Uploaded ${uploadedCount} document${uploadedCount === 1 ? "" : "s"} → ${totalChunks} chunks indexed.`,
      });
      await load();
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Upload error" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const deleteDoc = async (id: string, filename: string) => {
    if (!confirm(`Delete "${filename}" and its embeddings?`)) return;
    try {
      const res = await fetch(`/api/admin/upload-pdf?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: token ? { "x-admin-token": token } : {},
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setMessage({ type: "err", text: data.error ?? `Delete failed (${res.status})` });
      } else {
        await load();
      }
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Delete error" });
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Knowledge base</p>
          <h1 className="font-display text-3xl font-bold mt-1">Admin · Knowledge base</h1>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={loading ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} />
          Refresh
        </Button>
      </header>

      <div className="mt-8 rounded-2xl border bg-card p-6 shadow-soft">
        <div className="flex items-center gap-3">
          <Database className="h-5 w-5 text-brand" />
          <div>
            <p className="text-sm text-muted-foreground">Total indexed chunks</p>
            <p className="font-display text-3xl font-bold">{status?.totalChunks ?? "—"}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border bg-card p-6 shadow-soft">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-lg font-semibold">Department documents</h2>
          <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand">
            Highest priority
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Upload department PDFs (faculty lists, brochures, reports). The chatbot prefers these over
          scraped website data.
        </p>

        <div className="mt-5 grid sm:grid-cols-[1fr_180px] gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Admin token (if set)</label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Leave blank if no ADMIN_TOKEN secret"
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Tag department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf"
            multiple
            onChange={(e) => handleUpload(e.target.files)}
            className="hidden"
          />
          <Button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="h-11 px-6"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploading ? "Uploading & embedding…" : "Upload PDF(s)"}
          </Button>
        </div>

        <div className="mt-5 divide-y divide-border border-t border-border">
          {(status?.uploadedDocs ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground py-4">No documents uploaded yet.</p>
          )}
          {status?.uploadedDocs?.map((d) => (
            <div key={d.id} className="py-3 flex items-center justify-between gap-3 text-sm">
              <div className="flex items-start gap-3 min-w-0">
                <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium truncate">{d.filename}</p>
                  <p className="text-xs text-muted-foreground">
                    {d.department ?? "Untagged"} · {formatBytes(d.size_bytes)} ·{" "}
                    {d.chunks_indexed} chunks ·{" "}
                    {new Date(d.uploaded_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => deleteDoc(d.id, d.filename)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                title="Delete document"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border bg-card p-6 shadow-soft">
        <h2 className="font-display text-lg font-semibold">Crawl bietdvg.edu</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Scrapes the BIET website and rebuilds its chunks. Used as a fallback when documents above
          don't have the answer.
        </p>

        <div className="mt-5">
          <label className="text-xs font-medium text-muted-foreground">Page limit</label>
          <input
            type="number"
            min={10}
            max={1000}
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value) || 400)}
            className="mt-1 w-40 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand"
          />
        </div>

        <Button onClick={triggerCrawl} disabled={crawling} className="mt-5 h-11 px-6">
          {crawling ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          {crawling ? "Crawling & embedding… (a few minutes)" : "Start full re-index"}
        </Button>
      </div>

      {message && (
        <div
          className={`mt-4 flex items-start gap-2 rounded-lg border p-3 text-sm ${
            message.type === "ok"
              ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300"
              : "border-destructive/30 bg-destructive/5 text-destructive"
          }`}
        >
          {message.type === "ok" ? (
            <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="mt-6 rounded-2xl border bg-card p-6 shadow-soft">
        <h2 className="font-display text-lg font-semibold">Recent crawl jobs</h2>
        <div className="mt-3 divide-y divide-border">
          {(status?.jobs ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground py-4">No crawl jobs yet.</p>
          )}
          {status?.jobs.map((j) => (
            <div key={j.id} className="py-3 flex flex-wrap items-center justify-between gap-2 text-sm">
              <div>
                <span
                  className={`inline-block rounded px-2 py-0.5 text-[11px] font-medium ${
                    j.status === "completed"
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                      : j.status === "failed"
                        ? "bg-destructive/15 text-destructive"
                        : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                  }`}
                >
                  {j.status}
                </span>
                <span className="ml-3 text-muted-foreground">
                  {new Date(j.started_at).toLocaleString()}
                </span>
              </div>
              <div className="text-muted-foreground">
                {j.pages_indexed} pages · {j.chunks_indexed} chunks
                {j.error && <span className="ml-2 text-destructive">· {j.error.slice(0, 80)}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        Tip: Set an <code className="rounded bg-secondary px-1">ADMIN_TOKEN</code> secret to lock
        upload/crawl endpoints in production.
      </p>
    </div>
  );
}
