
-- Delicious 5 Ingredients Recipes
-- Sprint 2: Multilingual recipe translations
--
-- Stores translated recipe content for English,
-- Spanish, and Brazilian Portuguese.
--
-- Original recipes remain in their existing provider.
-- This table stores reusable translations only.

create table public.recipe_translations (
  provider text not null,
  recipe_id text not null,

  locale text not null,

  title text not null,
  description text,

  ingredients jsonb not null default '[]'::jsonb,
  instructions jsonb not null default '[]'::jsonb,

  translation_method text not null default 'automatic',
  review_status text not null default 'pending',

  source_hash text not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  primary key (provider, recipe_id, locale),

  foreign key (provider, recipe_id)
    references public.recipe_catalog (provider, recipe_id)
    on delete cascade,

  check (locale in ('en', 'es', 'pt-BR')),

  check (
    translation_method in (
      'automatic',
      'manual'
    )
  ),

  check (
    review_status in (
      'pending',
      'approved',
      'rejected'
    )
  ),

  check (jsonb_typeof(ingredients) = 'array'),
  check (jsonb_typeof(instructions) = 'array'),

  check (char_length(title) > 0),
  check (char_length(source_hash) = 64)
);

-- Look up translations by recipe and language.
-- The primary key already supports this lookup.

-- Optional index for finding translations
-- awaiting human review.

create index recipe_translations_review_idx
  on public.recipe_translations (
    review_status,
    locale
  );

-- Protect translations from direct browser access.

alter table public.recipe_translations
  enable row level security;

revoke all on public.recipe_translations
  from anon, authenticated;

-- Server-side access only.

grant select, insert, update
  on public.recipe_translations
  to service_role;

-- Maintain the timestamp for all edits, including dashboard corrections.

create function public.set_recipe_translation_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke execute
  on function public.set_recipe_translation_updated_at()
  from public, anon, authenticated;

create trigger recipe_translations_set_updated_at
before update on public.recipe_translations
for each row
execute function public.set_recipe_translation_updated_at();
