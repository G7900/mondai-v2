-- ══════════════════════════════════════════════════════════════════════════════
-- MondAI Split — Supabase Schema
-- Ejecutar en: supabase.gvfokinserver.store → SQL Editor
-- ══════════════════════════════════════════════════════════════════════════════

-- ── Extensions ───────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Split Sessions ────────────────────────────────────────────────────────────
create table if not exists split_sessions (
  id            uuid primary key default uuid_generate_v4(),
  split_id      text unique not null,           -- short code: ABCD123
  host_id       uuid references auth.users(id),
  title         text not null,
  status        text not null default 'active'  -- active | completed | expired
                check (status in ('active', 'completed', 'expired')),
  division_mode text not null default 'exact'   -- exact | equal | hybrid
                check (division_mode in ('exact', 'equal', 'hybrid')),
  receipt_url   text,
  receipt_data  jsonb,
  total_amount  numeric(12,2) not null default 0,
  tax_amount    numeric(12,2) default 0,
  tip_amount    numeric(12,2) default 0,
  tip_percentage numeric(5,2) default 0,
  payers        jsonb default '[]',
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  expires_at    timestamptz default now() + interval '24 hours'
);

-- ── Participants ──────────────────────────────────────────────────────────────
create table if not exists participants (
  id               uuid primary key default uuid_generate_v4(),
  session_id       uuid references split_sessions(id) on delete cascade,
  name             text not null,
  is_host          boolean default false,
  is_present       boolean default true,
  status           text default 'pending'        -- pending | selecting | done
                   check (status in ('pending', 'selecting', 'done')),
  payment_methods  jsonb default '[]',
  represented_by   uuid,                          -- another participant id
  represents       jsonb default '[]',            -- array of participant ids
  subtotal         numeric(12,2) default 0,
  tax_share        numeric(12,2) default 0,
  tip_share        numeric(12,2) default 0,
  total_owed       numeric(12,2) default 0,
  last_seen        timestamptz default now(),
  joined_at        timestamptz default now()
);

-- ── Receipt Items ─────────────────────────────────────────────────────────────
create table if not exists receipt_items (
  id           uuid primary key default uuid_generate_v4(),
  session_id   uuid references split_sessions(id) on delete cascade,
  name         text not null,
  qty          integer not null default 1,
  unit_price   numeric(12,2) not null,
  total_price  numeric(12,2) not null,
  category     text,
  is_shared    boolean default false,
  assigned_to  jsonb default '[]'               -- array of participant ids
);

-- ── Debts ─────────────────────────────────────────────────────────────────────
create table if not exists debts (
  id                    uuid primary key default uuid_generate_v4(),
  session_id            uuid references split_sessions(id) on delete cascade,
  from_participant_id   uuid references participants(id),
  to_participant_id     uuid references participants(id),
  amount                numeric(12,2) not null,
  is_settled            boolean default false,
  settled_at            timestamptz
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
create index if not exists idx_split_sessions_split_id on split_sessions(split_id);
create index if not exists idx_participants_session_id on participants(session_id);
create index if not exists idx_receipt_items_session_id on receipt_items(session_id);
create index if not exists idx_debts_session_id on debts(session_id);

-- ── Updated at trigger ────────────────────────────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger split_sessions_updated_at
  before update on split_sessions
  for each row execute function update_updated_at();

-- ── RLS (Row Level Security) ──────────────────────────────────────────────────
alter table split_sessions enable row level security;
alter table participants enable row level security;
alter table receipt_items enable row level security;
alter table debts enable row level security;

-- Public read access (anyone with the split_id can see the session)
create policy "Public read split_sessions" on split_sessions
  for select using (true);

create policy "Public read participants" on participants
  for select using (true);

create policy "Public read receipt_items" on receipt_items
  for select using (true);

create policy "Public read debts" on debts
  for select using (true);

-- Public write for participants (guest join)
create policy "Anyone can join as participant" on participants
  for insert with check (true);

create policy "Participants can update themselves" on participants
  for update using (true);

-- Items can be updated by anyone in the session (assignment)
create policy "Anyone can assign items" on receipt_items
  for update using (true);

-- Host creates sessions (requires auth)
create policy "Authenticated users create sessions" on split_sessions
  for insert with check (auth.uid() is not null);

create policy "Host can update session" on split_sessions
  for update using (auth.uid() = host_id);

-- ── Realtime ──────────────────────────────────────────────────────────────────
-- Habilitar realtime para estas tablas en Supabase Dashboard:
-- Table Editor → split_sessions, participants, receipt_items, debts → Enable Realtime

-- ══════════════════════════════════════════════════════════════════════════════
-- DATOS DE PRUEBA (opcional — borrar en producción)
-- ══════════════════════════════════════════════════════════════════════════════
insert into split_sessions (split_id, title, status, division_mode, total_amount, tax_amount, tip_amount, tip_percentage)
values ('TEST001', 'Cena en El Corral 🍔', 'active', 'hybrid', 95000, 15200, 9500, 10)
on conflict (split_id) do nothing;
