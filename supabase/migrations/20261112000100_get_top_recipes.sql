create or replace function public.get_top_recipes()
returns table (
  provider text,
  recipe_id text,
  visit_count bigint
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    v.provider,
    v.recipe_id,
    count(*) as visit_count
  from public.recipe_visits as v
  group by v.provider, v.recipe_id
  order by count(*) desc, v.provider asc, v.recipe_id asc
  limit 5;
$$;

revoke execute on function public.get_top_recipes()
  from public, anon, authenticated;

grant execute on function public.get_top_recipes()
  to service_role;