import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, RefreshCw, Database, AlertTriangle, CheckCircle2 } from "lucide-react";
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

type Status = { totalChunks: number; jobs: Job[] };

function AdminPage() {
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(false);
  const [crawling, setCrawling] = useState(false);
  const [token, setToken] = useState("");
  const [limit, setLimit] = useState(400);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

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

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Knowledge base</p>
          <h1 className="font-display text-3xl font-bold mt-1">Admin · Re-index</h1>
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
        <h2 className="font-display text-lg font-semibold">Crawl bietdvg.edu</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Triggers Firecrawl, chunks every page, embeds the chunks and rebuilds the knowledge base.
          Old chunks are replaced.
        </p>

        <div className="mt-5 grid sm:grid-cols-[1fr_140px] gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Admin token (if configured)</label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Leave blank if no ADMIN_TOKEN secret"
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Page limit</label>
            <input
              type="number"
              min={10}
              max={1000}
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value) || 400)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand"
            />
          </div>
        </div>

        <Button onClick={triggerCrawl} disabled={crawling} className="mt-5 h-11 px-6">
          {crawling ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          {crawling ? "Crawling & embedding… (a few minutes)" : "Start full re-index"}
        </Button>

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
      </div>

      <div className="mt-6 rounded-2xl border bg-card p-6 shadow-soft">
        <h2 className="font-display text-lg font-semibold">Recent jobs</h2>
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
        Tip: Set an <code className="rounded bg-secondary px-1">ADMIN_TOKEN</code> secret to lock this
        endpoint. Connect Firecrawl in Connectors before running a crawl.
      </p>
    </div>
  );
}
