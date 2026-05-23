
create or replace function public.match_biet_documents_ranked(
  query_embedding extensions.vector,
  match_count integer default 8
)
returns table (
  id uuid,
  url text,
  title text,
  content text,
  source_type text,
  source_priority integer,
  similarity double precision
)
language sql
stable
set search_path = public, extensions
as $$
  select
    d.id,
    d.url,
    d.title,
    d.content,
    d.source_type,
    case when d.source_type = 'pdf' then 2 else 1 end as source_priority,
    1 - (d.embedding operator(extensions.<=>) query_embedding) as similarity
  from public.biet_documents d
  order by
    case when d.source_type = 'pdf' then 2 else 1 end desc,
    d.embedding operator(extensions.<=>) query_embedding
  limit match_count;
$$;
