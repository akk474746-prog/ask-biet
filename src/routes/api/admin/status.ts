import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/admin/status")({
  server: {
    handlers: {
      GET: async () => {
        const [{ data: jobs }, { count }] = await Promise.all([
          supabaseAdmin
            .from("biet_crawl_jobs")
            .select("*")
            .order("started_at", { ascending: false })
            .limit(5),
          supabaseAdmin
            .from("biet_documents")
            .select("*", { count: "exact", head: true }),
        ]);
        return Response.json({
          totalChunks: count ?? 0,
          jobs: jobs ?? [],
        });
      },
    },
  },
});
