-- =====================================================================
-- Kinetik portfolio — Supabase setup
-- Paste this whole file into Supabase → SQL Editor → New query → Run.
-- It is safe to run more than once.
-- =====================================================================

-- ---------- Admins -----------------------------------------------------
-- Only users listed here can manage the portfolio.
-- The FIRST account created in Authentication becomes admin automatically.

create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

create or replace function public.handle_first_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.admins) then
    insert into public.admins (user_id) values (new.id);
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_make_admin on auth.users;
create trigger on_auth_user_created_make_admin
  after insert on auth.users
  for each row execute function public.handle_first_user();

-- If you created your account BEFORE running this script, make it admin:
insert into public.admins (user_id)
select id from auth.users
where not exists (select 1 from public.admins)
order by created_at
limit 1;

drop policy if exists "admins read own row" on public.admins;
create policy "admins read own row" on public.admins
  for select using (user_id = auth.uid());

-- ---------- Videos -----------------------------------------------------

create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  client text default '',
  year text default '',
  category text not null default 'editing'
    check (category in ('saas', 'reels', 'cinematic', 'events', 'editing')),
  role text default '',
  duration text default '',
  aspect text default '16:9',
  description text default '',
  tags text[] not null default '{}',
  video_url text,
  thumbnail_url text,
  external_url text,
  featured boolean not null default false,
  published boolean not null default true,
  sort_order integer not null default 0,
  views integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create index if not exists videos_sort_idx on public.videos (sort_order);

alter table public.videos enable row level security;

drop policy if exists "public reads published videos" on public.videos;
create policy "public reads published videos" on public.videos
  for select using (published or public.is_admin());

drop policy if exists "admins insert videos" on public.videos;
create policy "admins insert videos" on public.videos
  for insert with check (public.is_admin());

drop policy if exists "admins update videos" on public.videos;
create policy "admins update videos" on public.videos
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins delete videos" on public.videos;
create policy "admins delete videos" on public.videos
  for delete using (public.is_admin());

-- Visitors can count a play without being allowed to edit videos.
create or replace function public.increment_view(video_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.videos set views = views + 1 where id = video_id and published;
$$;

grant execute on function public.increment_view(uuid) to anon, authenticated;

-- ---------- Contact messages -------------------------------------------

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (email ~* '^\S+@\S+\.\S+$' and char_length(email) <= 200),
  company text default '' check (char_length(company) <= 120),
  service text default '' check (char_length(service) <= 60),
  budget text default '' check (char_length(budget) <= 60),
  message text not null check (char_length(message) between 1 and 5000),
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

drop policy if exists "anyone can send a message" on public.messages;
create policy "anyone can send a message" on public.messages
  for insert with check (read = false);

drop policy if exists "admins read messages" on public.messages;
create policy "admins read messages" on public.messages
  for select using (public.is_admin());

drop policy if exists "admins update messages" on public.messages;
create policy "admins update messages" on public.messages
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins delete messages" on public.messages;
create policy "admins delete messages" on public.messages
  for delete using (public.is_admin());

-- ---------- Storage (video + thumbnail files) --------------------------
-- Public bucket: anyone can watch, only admins can upload or delete.
-- 50 MB is the per-file maximum on Supabase's free plan.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 52428800, array['video/*', 'image/*'])
on conflict (id) do update
  set public = true,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public reads media" on storage.objects;
create policy "public reads media" on storage.objects
  for select using (bucket_id = 'media');

drop policy if exists "admins upload media" on storage.objects;
create policy "admins upload media" on storage.objects
  for insert with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "admins update media" on storage.objects;
create policy "admins update media" on storage.objects
  for update using (bucket_id = 'media' and public.is_admin());

drop policy if exists "admins delete media" on storage.objects;
create policy "admins delete media" on storage.objects
  for delete using (bucket_id = 'media' and public.is_admin());

-- ---------- Sample projects (only added when the table is empty) -------

insert into public.videos (slug, title, client, year, category, role, duration, aspect, description, tags, featured, sort_order)
select * from (values
  ('flowdesk-product-launch', 'Flowdesk — Product Launch', 'Flowdesk', '2026', 'saas', 'Script, 2D animation, sound design', '1:12', '16:9',
   'A launch film that turns a dense workflow tool into a 70-second story: one problem, one product, one clear next step.',
   array['Launch', '2D', 'UI animation'], true, 0),
  ('northline-brand-reel', 'Northline — Brand Reel', 'Northline Coffee', '2026', 'reels', 'Edit, motion typography', '0:30', '9:16',
   'A vertical reel series built for Instagram and TikTok — fast hooks, kinetic captions, and a loop-friendly ending.',
   array['Vertical', 'Social', 'Typography'], true, 1),
  ('atlas-cinematic-trailer', 'Atlas — Cinematic Trailer', 'Atlas Outdoor', '2025', 'cinematic', 'Edit, colour grade, sound', '2:04', '21:9',
   'A cinematic brand trailer cut from three days of mountain footage, graded for a cold, quiet, epic mood.',
   array['Colour', 'Trailer', 'Sound design'], true, 2),
  ('summit-26-event-recap', 'Summit ''26 — Event Recap', 'Kova Summit', '2026', 'events', 'On-site capture, same-day edit', '1:45', '16:9',
   'A same-day recap of a 2,000-person tech conference: keynotes, crowd energy and speaker soundbites, delivered before the after-party.',
   array['Same-day edit', 'Conference'], true, 3),
  ('ledgerly-explainer', 'Ledgerly — Explainer', 'Ledgerly', '2025', 'saas', 'Storyboard, 2D/3D animation', '1:30', '16:9',
   'An explainer for a fintech API that makes invisible infrastructure tangible through simple, modular shapes.',
   array['Explainer', '3D', 'Fintech'], false, 4),
  ('wedding-film-amira-and-sam', 'Amira & Sam — Wedding Film', 'Private', '2025', 'editing', 'Edit, colour, audio mix', '4:20', '16:9',
   'A documentary-style wedding film with natural colour and story-led editing around the vows.',
   array['Wedding', 'Documentary'], false, 5)
) as seed (slug, title, client, year, category, role, duration, aspect, description, tags, featured, sort_order)
where not exists (select 1 from public.videos);
