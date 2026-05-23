import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabaseAdmin as any;

export const Route = createFileRoute("/api/admin/status")({
  server: {
    handlers: {
      GET: async () => {
        const [{ data: jobs }, { count }, { data: docs }] = await Promise.all([
          supabaseAdmin
            .from("biet_crawl_jobs")
            .select("*")
            .order("started_at", { ascending: false })
            .limit(5),
          supabaseAdmin
            .from("biet_documents")
            .select("*", { count: "exact", head: true }),
          db
            .from("biet_uploaded_documents")
            .select("*")
            .order("uploaded_at", { ascending: false }),
        ]);
        return Response.json({
          totalChunks: count ?? 0,
          jobs: jobs ?? [],
          uploadedDocs: docs ?? [],
        });
      },
    },
  },
});
