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
  itinerary        jsonb   not null default '[]',
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
  created_at       timestamptz not null default now()
);

create index if not exists guests_token_idx on public.guests (token);

-- ─── Tabla: rsvps ────────────────────────────────────────────────────────────
create table if not exists public.rsvps (
  id               uuid        primary key default gen_random_uuid(),
  guest_id         uuid        not null references public.guests (id) on delete cascade,
  attending        boolean     not null,
  companion_count  integer     not null default 0,
  dietary_notes    text,
  message          text,
  submitted_at     timestamptz not null default now()
);

create index if not exists rsvps_guest_id_idx on public.rsvps (guest_id);

-- ─── Row Level Security ───────────────────────────────────────────────────────

alter table public.wedding_config enable row level security;
alter table public.guests          enable row level security;
alter table public.rsvps           enable row level security;

-- wedding_config: lectura pública, escritura sólo autenticados
create policy "wedding_config: public read"
  on public.wedding_config for select
  using (true);

create policy "wedding_config: admin write"
  on public.wedding_config for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- guests: lectura pública (necesitan el token), gestión sólo autenticados
create policy "guests: public read"
  on public.guests for select
  using (true);

create policy "guests: admin all"
  on public.guests for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- rsvps: cualquiera puede insertar, sólo autenticados pueden leer todo
create policy "rsvps: public insert"
  on public.rsvps for insert
  with check (true);

create policy "rsvps: public read own"
  on public.rsvps for select
  using (true);

create policy "rsvps: admin delete"
  on public.rsvps for delete
  using (auth.role() = 'authenticated');

-- ─── Storage bucket ──────────────────────────────────────────────────────────
-- Crear en Supabase Dashboard → Storage → New bucket
-- Nombre: wedding-photos
-- Visibilidad: Public
-- Después agregar estas políticas en Storage → wedding-photos → Policies:

-- Lectura pública:
--   create policy "public read photos"
--     on storage.objects for select
--     using (bucket_id = 'wedding-photos');

-- Escritura sólo autenticados:
--   create policy "admin upload photos"
--     on storage.objects for insert
--     with check (bucket_id = 'wedding-photos' and auth.role() = 'authenticated');

--   create policy "admin delete photos"
--     on storage.objects for delete
--     using (bucket_id = 'wedding-photos' and auth.role() = 'authenticated');

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
