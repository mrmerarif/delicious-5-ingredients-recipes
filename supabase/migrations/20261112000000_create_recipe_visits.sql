create table public.recipe_catalog (
  provider text not null,
  recipe_id text not null,
  created_at timestamptz not null default now(),

  primary key (provider, recipe_id),

  check (char_length(provider) between 1 and 40),
  check (char_length(recipe_id) between 1 and 100)
);

create table public.recipe_visits (
  event_id uuid primary key,
  provider text not null,
  recipe_id text not null,
  visited_at timestamptz not null default now(),

  foreign key (provider, recipe_id)
    references public.recipe_catalog (provider, recipe_id)
);

create index recipe_visits_recipe_idx
  on public.recipe_visits (provider, recipe_id);

-- Browser clients cannot access these tables directly.
alter table public.recipe_catalog enable row level security;
alter table public.recipe_visits enable row level security;

revoke all on public.recipe_catalog from anon, authenticated;
revoke all on public.recipe_visits from anon, authenticated;

-- The Next.js server needs only these operations.
grant select, insert on public.recipe_catalog to service_role;
grant select, insert on public.recipe_visits to service_role;