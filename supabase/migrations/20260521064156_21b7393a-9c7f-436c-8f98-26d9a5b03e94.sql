
create extension if not exists vector;

create table if not exists public.biet_documents (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  title text,
  content text not null,
  chunk_index int not null default 0,
  source_type text not null default 'page',
  embedding vector(1536) not null,
  created_at timestamptz not null default now()
);

create index if not exists biet_documents_embedding_idx
  on public.biet_documents using hnsw (embedding vector_cosine_ops);
create index if not exists biet_documents_url_idx on public.biet_documents(url);

alter table public.biet_documents enable row level security;

create policy "Public can read BIET knowledge base"
  on public.biet_documents for select
  to anon, authenticated
  using (true);

create table if not exists public.biet_crawl_jobs (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'pending',
  pages_indexed int not null default 0,
  chunks_indexed int not null default 0,
  error text,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

alter table public.biet_crawl_jobs enable row level security;

create policy "Public can read crawl job status"
  on public.biet_crawl_jobs for select
  to anon, authenticated
  using (true);

create or replace function public.match_biet_documents(
  query_embedding vector(1536),
  match_count int default 6
)
returns table (
  id uuid,
  url text,
  title text,
  content text,
  similarity float
)
language sql stable
set search_path = public
as $$
  select
    d.id,
    d.url,
    d.title,
    d.content,
    1 - (d.embedding <=> query_embedding) as similarity
  from public.biet_documents d
  order by d.embedding <=> query_embedding
  limit match_count;
$$;
