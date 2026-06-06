# Phase 4.3 — Supabase migration (draft for review)

Draft SQL for the first Supabase migration. **Review manually before applying.** Do not run automatically from the app.

Aligns with [phase-4-supabase-schema.md](./phase-4-supabase-schema.md).

---

## What this migration creates

| Table | Purpose |
|-------|---------|
| **`profiles`** | One app profile per teacher, linked to Supabase Auth |
| **`story_projects`** | Draft or saved story — setup JSON, metadata, status, owner |
| **`story_pages`** | Generated page text, one row per page |
| **`story_flashcards`** | Vocabulary cards for a project |
| **`story_image_prompts`** | Illustration prompts (and future image URLs) |

Also includes:

- Shared **`updated_at` trigger** function  
- **RLS enabled** on every table  
- **Owner-only policies** using `auth.uid()`  
- Child row access gated through owned **`story_projects`**

---

## RLS assumptions

Read this before applying:

1. **Authenticated teachers only** — policies use `auth.uid()`. Anonymous users cannot read or write story data.
2. **`profiles.id` = `auth.users.id`** — ownership checks assume the profile primary key matches the signed-in user.
3. **`story_projects.owner_id` → `profiles.id`** — every project belongs to exactly one teacher.
4. **Child tables never check ownership directly** — they verify the parent project is owned by `auth.uid()` via a subquery.
5. **Service role bypasses RLS** — server-side jobs (future AI generation) must use the service role key, never in the browser.
6. **No sharing yet** — another teacher cannot read your projects. Sharing needs separate tables/policies later.
7. **Profile bootstrap** — optional trigger below creates a `profiles` row on signup. Alternatively, the app can upsert on first login. **`story_projects` requires a profile row** — inserts fail FK until the profile exists.
8. **`owner_id` has no DB default** — the app (or Supabase client) must set `owner_id` to the signed-in user’s id on insert. RLS rejects any other value; omitting it fails `NOT NULL`.

---

## Manual review checklist

Before running in Supabase SQL Editor or `supabase db push`:

- [ ] Supabase project created; you are on the correct project/environment (not production by mistake).
- [ ] Auth is enabled; email or OAuth provider configured as needed.
- [ ] You understand **`auth.uid()` returns null** when not signed in — app must require auth before Supabase reads/writes.
- [ ] **`profiles` FK to `auth.users`** — deleting an auth user cascades and deletes their profile (and projects via FK chain).
- [ ] **`owner_id` on insert** — client must pass `auth.uid()` (or equivalent); there is no column default.
- [ ] **Profile exists before first project** — `story_projects.owner_id` references `profiles.id`.
- [ ] **Child `page_id` integrity** — flashcards/prompts with `page_id` set must reference a page on the same `project_id` (CHECK constraints below).
- [ ] **Status check constraints** — `story_projects`: draft/generated/saved/archived; `story_image_prompts`: prompt_only/generated/failed.
- [ ] **JSONB columns** (`setup_data`, `generated_metadata`) default to `{}` — app must merge sensibly.
- [ ] **Child cascades** — deleting a `story_project` deletes pages, flashcards, and image prompts.
- [ ] **Unique `(project_id, page_number)`** on `story_pages` and `story_image_prompts` — re-save logic must upsert, not duplicate.
- [ ] **RLS policies** tested with two test users — user A cannot see user B’s rows.
- [ ] **Signup trigger** — commented out by default; uncomment only if you want auto-profiles on signup (see SQL block).
- [ ] Migration is idempotent-safe only if run **once** — this script uses `create table`; re-running will fail (expected).
- [ ] After apply: run `supabase gen types` in a later step (not part of this doc).

---

## Draft migration SQL

Copy into Supabase SQL Editor or save as `supabase/migrations/<timestamp>_initial_story_schema.sql` when ready.

```sql
-- =============================================================================
-- Phase 4.3 — Initial story app schema (DRAFT — review before applying)
-- =============================================================================

-- Extensions (gen_random_uuid is usually available on Supabase; safe to ensure)
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Shared: auto-update updated_at on row change
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- profiles
-- One row per teacher. id matches auth.users.id.
-- -----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  email text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

comment on table public.profiles is 'App profile for each authenticated teacher.';

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid());

create policy "profiles_insert_own"
  on public.profiles
  for insert
  to authenticated
  with check (id = auth.uid());

create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- No DELETE policy on profiles — deletion happens via auth.users cascade only.

-- -----------------------------------------------------------------------------
-- OPTIONAL: auto-create profile on signup
-- Uncomment this block if you want Supabase Auth to insert profiles automatically.
-- Safe to skip if the app upserts profiles on first login instead.
-- Uses ON CONFLICT so retries / duplicate inserts do not fail signup.
-- -----------------------------------------------------------------------------
/*
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'Teacher'
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
*/

-- -----------------------------------------------------------------------------
-- story_projects
-- Aggregate root: one draft or saved story per row.
-- owner_id: app must set to auth.uid() on insert (no default — RLS enforces match).
-- -----------------------------------------------------------------------------
create table public.story_projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  title text not null default 'Untitled story',
  status text not null default 'draft'
    check (status in ('draft', 'generated', 'saved', 'archived')),
  setup_data jsonb not null default '{}'::jsonb,
  generated_metadata jsonb not null default '{}'::jsonb,
  language text not null default '',
  age_range text not null default '',
  theme text not null default '',
  page_count integer not null default 0 check (page_count >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

comment on table public.story_projects is 'Teacher-owned draft or saved story project.';
comment on column public.story_projects.setup_data is 'StorySetupInput (+ optional plan review) as JSON.';
comment on column public.story_projects.generated_metadata is 'GeneratedStory summary fields not stored in child tables.';

create index story_projects_owner_updated_idx on public.story_projects (owner_id, updated_at desc);
create index story_projects_owner_status_idx on public.story_projects (owner_id, status);

create trigger story_projects_set_updated_at
  before update on public.story_projects
  for each row
  execute function public.set_updated_at();

alter table public.story_projects enable row level security;

create policy "story_projects_select_own"
  on public.story_projects
  for select
  to authenticated
  using (owner_id = auth.uid());

create policy "story_projects_insert_own"
  on public.story_projects
  for insert
  to authenticated
  with check (owner_id = auth.uid());

create policy "story_projects_update_own"
  on public.story_projects
  for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "story_projects_delete_own"
  on public.story_projects
  for delete
  to authenticated
  using (owner_id = auth.uid());

-- -----------------------------------------------------------------------------
-- story_pages
-- Normalized generated page content for read/edit/export.
-- -----------------------------------------------------------------------------
create table public.story_pages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.story_projects (id) on delete cascade,
  page_number integer not null check (page_number > 0),
  text text not null default '',
  word_count integer not null default 0 check (word_count >= 0),
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (project_id, page_number)
);

comment on table public.story_pages is 'One generated story page; notes maps to teachingFocus in the app.';

create index story_pages_project_id_idx on public.story_pages (project_id);

create trigger story_pages_set_updated_at
  before update on public.story_pages
  for each row
  execute function public.set_updated_at();

alter table public.story_pages enable row level security;

create policy "story_pages_select_own"
  on public.story_pages
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.story_projects p
      where p.id = story_pages.project_id
        and p.owner_id = auth.uid()
    )
  );

create policy "story_pages_insert_own"
  on public.story_pages
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.story_projects p
      where p.id = story_pages.project_id
        and p.owner_id = auth.uid()
    )
  );

create policy "story_pages_update_own"
  on public.story_pages
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.story_projects p
      where p.id = story_pages.project_id
        and p.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.story_projects p
      where p.id = story_pages.project_id
        and p.owner_id = auth.uid()
    )
  );

create policy "story_pages_delete_own"
  on public.story_pages
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.story_projects p
      where p.id = story_pages.project_id
        and p.owner_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- story_flashcards
-- Vocabulary cards; optional link to a specific page.
-- -----------------------------------------------------------------------------
create table public.story_flashcards (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.story_projects (id) on delete cascade,
  page_id uuid references public.story_pages (id) on delete set null,
  word text not null,
  definition text,
  example_sentence text,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint story_flashcards_page_belongs_to_project check (
    page_id is null
    or (
      select sp.project_id
      from public.story_pages sp
      where sp.id = page_id
    ) = project_id
  )
);

comment on table public.story_flashcards is 'Vocabulary flashcards for a story project.';

create index story_flashcards_project_id_idx on public.story_flashcards (project_id);
create index story_flashcards_project_sort_idx on public.story_flashcards (project_id, sort_order);

create trigger story_flashcards_set_updated_at
  before update on public.story_flashcards
  for each row
  execute function public.set_updated_at();

alter table public.story_flashcards enable row level security;

create policy "story_flashcards_select_own"
  on public.story_flashcards
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.story_projects p
      where p.id = story_flashcards.project_id
        and p.owner_id = auth.uid()
    )
  );

create policy "story_flashcards_insert_own"
  on public.story_flashcards
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.story_projects p
      where p.id = story_flashcards.project_id
        and p.owner_id = auth.uid()
    )
  );

create policy "story_flashcards_update_own"
  on public.story_flashcards
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.story_projects p
      where p.id = story_flashcards.project_id
        and p.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.story_projects p
      where p.id = story_flashcards.project_id
        and p.owner_id = auth.uid()
    )
  );

create policy "story_flashcards_delete_own"
  on public.story_flashcards
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.story_projects p
      where p.id = story_flashcards.project_id
        and p.owner_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- story_image_prompts
-- Illustration prompt per page; image_url filled when generation exists.
-- -----------------------------------------------------------------------------
create table public.story_image_prompts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.story_projects (id) on delete cascade,
  page_id uuid references public.story_pages (id) on delete set null,
  page_number integer not null check (page_number > 0),
  prompt_text text not null default '',
  continuity_reminder text,
  image_url text,
  status text not null default 'prompt_only'
    check (status in ('prompt_only', 'generated', 'failed')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (project_id, page_number),
  constraint story_image_prompts_page_belongs_to_project check (
    page_id is null
    or (
      select sp.project_id
      from public.story_pages sp
      where sp.id = page_id
    ) = project_id
  )
);

comment on table public.story_image_prompts is 'Image prompt (and future image URL) per story page.';

create index story_image_prompts_project_id_idx on public.story_image_prompts (project_id);
create index story_image_prompts_page_id_idx on public.story_image_prompts (page_id);

create trigger story_image_prompts_set_updated_at
  before update on public.story_image_prompts
  for each row
  execute function public.set_updated_at();

alter table public.story_image_prompts enable row level security;

create policy "story_image_prompts_select_own"
  on public.story_image_prompts
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.story_projects p
      where p.id = story_image_prompts.project_id
        and p.owner_id = auth.uid()
    )
  );

create policy "story_image_prompts_insert_own"
  on public.story_image_prompts
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.story_projects p
      where p.id = story_image_prompts.project_id
        and p.owner_id = auth.uid()
    )
  );

create policy "story_image_prompts_update_own"
  on public.story_image_prompts
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.story_projects p
      where p.id = story_image_prompts.project_id
        and p.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.story_projects p
      where p.id = story_image_prompts.project_id
        and p.owner_id = auth.uid()
    )
  );

create policy "story_image_prompts_delete_own"
  on public.story_image_prompts
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.story_projects p
      where p.id = story_image_prompts.project_id
        and p.owner_id = auth.uid()
    )
  );
```

---

## Table notes (quick reference)

### `profiles`

- **Why:** Supabase Auth stores login data; the app needs a stable `profiles` row for display name and future settings.
- **Ownership:** Row `id` must equal `auth.uid()`. Select/insert/update policies only — no client DELETE (auth user delete cascades).
- **On signup:** Optional commented trigger inserts a profile; app upsert on first login is the alternative.

### `story_projects`

- **Why:** Central record for each draft or saved story — matches app `StoryProject`.
- **`owner_id`:** Required on insert; must equal `auth.uid()`. No DB default — RLS blocks wrong owner, `NOT NULL` blocks omission.
- **JSONB:** `setup_data` holds the full setup form; `generated_metadata` holds summary/timestamps not duplicated in child rows.
- **Status:** `draft` (setup only) → `generated` (output exists) → `saved` (teacher confirmed) → `archived` (hidden).
- **Filters:** `theme`, `language`, `age_range` duplicated for list queries without parsing JSONB.

### `story_pages`

- **Why:** Edit mode changes page text — normalized rows are easier to update than one big JSON blob.
- **Uniqueness:** One row per `(project_id, page_number)`.

### `story_flashcards`

- **Why:** Vocabulary cards edited separately in the app.
- **`page_id`:** Optional — null means story-wide; when set, CHECK ensures the page belongs to the same `project_id`.

### `story_image_prompts`

- **Why:** Prompts per page now; `image_url` and `status` reserved for future image generation.
- **`page_number`:** Unique per project (like `story_pages`); kept even when `page_id` is set.
- **`page_id`:** Optional; CHECK ensures page belongs to the same project when set.

---

## After applying (later phases)

Not in this migration:

- Supabase client in the app  
- Replacing `story-storage.ts` with Supabase calls  
- Importing existing `localStorage` drafts  
- Generated TypeScript types (`supabase gen types typescript`)

See [phase-4-supabase-schema.md](./phase-4-supabase-schema.md) §6 for the localStorage adapter plan.

---

## Related docs

- [phase-4-supabase-planning.md](./phase-4-supabase-planning.md) — persistence goals  
- [phase-4-supabase-schema.md](./phase-4-supabase-schema.md) — schema design (no SQL)

---

## Review notes

**What was checked**

- Profile RLS (select/insert/update own row; no delete — cascade from auth only)
- `story_projects.owner_id` — no default; insert policy `with check (owner_id = auth.uid())`; profile FK prerequisite
- Child table RLS — all CRUD gated via `exists (... story_projects.owner_id = auth.uid())`
- Child INSERT policies — present on all three child tables; subquery can read owned parent under RLS
- `updated_at` triggers — all five tables use `set_updated_at()`
- Status checks — `story_projects.status` and `story_image_prompts.status`
- Nullable vs required fields — aligned with app types (`notes`, `definition`, `page_id`, etc.)
- Indexes — list reads by `(owner_id, updated_at desc)` and `(owner_id, status)`; child fetches by `project_id`; flashcards ordered by `(project_id, sort_order)`
- `handle_new_user` — optional, commented out, `security definer` + `search_path`, `ON CONFLICT DO NOTHING`, safer display name fallback

**What was changed**

- Documented that **`owner_id` must be set by the client** (no `auth.uid()` column default)
- **Commented out** signup trigger by default; hardened with `ON CONFLICT` and null-safe display name
- Added note: **no DELETE policy on profiles** (intentional)
- Added **`story_flashcards_page_belongs_to_project`** and **`story_image_prompts_page_belongs_to_project`** CHECK constraints — prevents linking a child row to another teacher’s page UUID while owning the project
- Added **`unique (project_id, page_number)`** on `story_image_prompts`
- Replaced redundant indexes with **`(owner_id, status)`** composite and **`(project_id, sort_order)`** for flashcards
- Expanded checklist and table notes for profile-before-project and `page_id` integrity

**Ready for Supabase SQL Editor?**

**Yes, with two manual steps before testing the app:**

1. **Create or uncomment profile bootstrap** — either uncomment the `handle_new_user` block or ensure the app upserts `profiles` before the first `story_projects` insert.
2. **Smoke-test RLS** — sign in as two users; confirm user A cannot read user B’s projects or children.

No app code changes required to apply the schema itself.
