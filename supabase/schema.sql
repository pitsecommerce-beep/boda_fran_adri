-- ============================================================
--  Boda Fran & Adri – Supabase Schema
--  Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- ─── Extensiones ─────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ─── Tabla: wedding_config ────────────────────────────────────────────────────
-- Tabla singleton (siempre id = 1)
create table if not exists public.wedding_config (
  id               integer primary key default 1,
  bride_name       text    not null default 'Adriana',
  groom_name       text    not null default 'Francisco',
  wedding_date     timestamptz,
  ceremony_time    text,
  ceremony_venue   text,
  ceremony_address text,
  ceremony_maps_url text,
  reception_time   text,
  reception_venue  text,
  reception_address text,
  reception_maps_url text,
  welcome_message  text,
  dress_code       text,
  cover_photo_url  text,
  gallery_urls     text[]  not null default '{}',
  account_number   text,
  gift_registry_url text,
  favicon_url      text,
  music_url        text,
  dress_code_image_url text,
  seal_image_url   text,
  itinerary        jsonb   not null default '[]',
  accommodations   jsonb   not null default '[]',
  updated_at       timestamptz not null default now()
);

-- Registrar fila inicial
insert into public.wedding_config (id) values (1) on conflict (id) do nothing;

-- ─── Tabla: guests ───────────────────────────────────────────────────────────
create table if not exists public.guests (
  id               uuid        primary key default gen_random_uuid(),
  name             text        not null,
  phone            text,
  token            text        not null unique default gen_random_uuid()::text,
  max_companions   integer     not null default 0,
  -- family_id agrupa invitados que van juntos (mismo valor = misma familia).
  -- NULL indica invitado sin grupo familiar.
  family_id        uuid,
  -- is_family_head: este invitado puede confirmar asistencia por toda su familia.
  is_family_head   boolean     not null default false,
  -- group_id: grupo de amigos para facilitar asignación de mesas.
  group_id         uuid,
  created_at       timestamptz not null default now()
);

create index if not exists guests_token_idx    on public.guests (token);
create index if not exists guests_family_idx   on public.guests (family_id);
create index if not exists guests_name_idx     on public.guests using gin(to_tsvector('spanish', name));

-- ─── Tabla: rsvps ────────────────────────────────────────────────────────────
create table if not exists public.rsvps (
  id                   uuid        primary key default gen_random_uuid(),
  guest_id             uuid        not null references public.guests (id) on delete cascade,
  attending            boolean     not null,
  companion_count      integer     not null default 0,
  dietary_notes        text,
  needs_accommodation  boolean     not null default false,
  message              text,
  submitted_at         timestamptz not null default now()
);

-- Migración si ya existe la tabla (ejecutar sólo si actualizas un esquema previo):
-- alter table public.guests add column if not exists family_id uuid;
-- alter table public.guests add column if not exists is_family_head boolean not null default false;
-- alter table public.rsvps  add column if not exists needs_accommodation boolean not null default false;
-- alter table public.wedding_config add column if not exists gift_registry_url text;
-- alter table public.wedding_config add column if not exists favicon_url text;
-- alter table public.wedding_config add column if not exists music_url text;
-- alter table public.wedding_config add column if not exists dress_code_image_url text;
-- alter table public.wedding_config add column if not exists accommodations jsonb not null default '[]';
-- alter table public.wedding_config add column if not exists dress_code_forbidden_text text;
-- alter table public.wedding_config add column if not exists dress_code_forbidden_image_url text;
-- alter table public.wedding_config add column if not exists parents_phrase text;
-- alter table public.wedding_config add column if not exists bride_parents  text;
-- alter table public.wedding_config add column if not exists groom_parents  text;
-- alter table public.guests add column if not exists group_id uuid;

create index if not exists rsvps_guest_id_idx on public.rsvps (guest_id);

-- ─── Row Level Security ───────────────────────────────────────────────────────

alter table public.wedding_config enable row level security;
alter table public.guests          enable row level security;
alter table public.rsvps           enable row level security;

-- wedding_config: lectura y escritura pública (admin sin autenticación)
create policy "wedding_config: public read"
  on public.wedding_config for select
  using (true);

create policy "wedding_config: public write"
  on public.wedding_config for all
  using (true)
  with check (true);

-- guests: acceso público total
create policy "guests: public read"
  on public.guests for select
  using (true);

create policy "guests: public all"
  on public.guests for all
  using (true)
  with check (true);

-- rsvps: cualquiera puede insertar, leer y borrar (para re-submit)
create policy "rsvps: public insert"
  on public.rsvps for insert
  with check (true);

create policy "rsvps: public read own"
  on public.rsvps for select
  using (true);

create policy "rsvps: public delete"
  on public.rsvps for delete
  using (true);

-- ─── Storage bucket ──────────────────────────────────────────────────────────
-- PASO MANUAL: Supabase Dashboard → Storage → New bucket
--   Nombre: wedding-photos   Visibilidad: Public ✓
--
-- Luego en Storage → wedding-photos → Policies agregar:

-- Lectura pública:
--   create policy "public read photos"
--     on storage.objects for select
--     using (bucket_id = 'wedding-photos');

-- Subida pública (admin sin auth):
--   create policy "public upload photos"
--     on storage.objects for insert
--     with check (bucket_id = 'wedding-photos');

-- Borrado público (admin sin auth):
--   create policy "public delete photos"
--     on storage.objects for delete
--     using (bucket_id = 'wedding-photos');

-- ─── Tabla: guest_groups ─────────────────────────────────────────────────────
-- Grupos de amigos / familia para facilitar la asignación de mesas
create table if not exists public.guest_groups (
  id         uuid        primary key default gen_random_uuid(),
  name       text        not null,
  color      text        not null default '#B8966E',
  created_at timestamptz not null default now()
);

alter table public.guest_groups enable row level security;

create policy "guest_groups: public read"
  on public.guest_groups for select using (true);
create policy "guest_groups: public all"
  on public.guest_groups for all using (true) with check (true);

-- Columna group_id en guests (grupo de amigos)
-- alter table public.guests add column if not exists group_id uuid references public.guest_groups(id) on delete set null;

-- ─── Tabla: seating_tables ───────────────────────────────────────────────────
-- Mesas del banquete con forma, posición y capacidad
create table if not exists public.seating_tables (
  id         uuid        primary key default gen_random_uuid(),
  name       text        not null,
  shape      text        not null default 'circle' check (shape in ('circle','square','rectangle')),
  capacity   integer     not null default 8,
  x          double precision not null default 100,
  y          double precision not null default 100,
  width      double precision not null default 120,
  height     double precision not null default 120,
  rotation   double precision not null default 0,
  created_at timestamptz not null default now()
);

alter table public.seating_tables enable row level security;

create policy "seating_tables: public read"
  on public.seating_tables for select using (true);
create policy "seating_tables: public all"
  on public.seating_tables for all using (true) with check (true);

-- ─── Tabla: seat_assignments ─────────────────────────────────────────────────
-- Asignación de invitados a mesas
create table if not exists public.seat_assignments (
  id         uuid        primary key default gen_random_uuid(),
  guest_id   uuid        not null references public.guests(id) on delete cascade,
  table_id   uuid        not null references public.seating_tables(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(guest_id)
);

create index if not exists seat_assignments_table_idx on public.seat_assignments(table_id);
create index if not exists seat_assignments_guest_idx on public.seat_assignments(guest_id);

alter table public.seat_assignments enable row level security;

create policy "seat_assignments: public read"
  on public.seat_assignments for select using (true);
create policy "seat_assignments: public all"
  on public.seat_assignments for all using (true) with check (true);

-- ─── Función helper: updated_at automático ───────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger wedding_config_updated_at
  before update on public.wedding_config
  for each row execute procedure public.set_updated_at();
