-- Blue Envelope — Supabase schema.
-- Run this in the Supabase SQL editor after connecting (see README "Connect Supabase").
-- Holds ONLY shared summaries and coordination state: no images, no OCR text,
-- no letter content. All demo data is synthetic.

-- ---------------------------------------------------------------------------
-- Community + referrals
-- ---------------------------------------------------------------------------

create table if not exists members (
  id                  uuid primary key,
  town_id             text,
  language            text not null,
  helper_code         text not null unique,
  referred_by_code    text,
  display_name_optin  jsonb,            -- { "firstName": "..." } or null
  created_at          timestamptz not null default now()
);

create index if not exists members_helper_code_idx on members (helper_code);
create index if not exists members_referred_by_idx  on members (referred_by_code);

create table if not exists events (
  id          bigint generated always as identity primary key,
  member_id   uuid not null references members (id) on delete cascade,
  type        text not null check (type in
                ('started','xray_done','packet_ready','marked_sent',
                 'contact_updated','referral_opened')),
  town_id     text,
  created_at  timestamptz not null default now()
);

create index if not exists events_member_idx on events (member_id);
create index if not exists events_type_idx   on events (type);

-- ---------------------------------------------------------------------------
-- Phase B coordination: packets (shared summaries) + partner sign-offs
-- ---------------------------------------------------------------------------

create table if not exists packets (
  id             text primary key,            -- e.g. "maria"
  first_name     text not null,
  status         text not null check (status in
                   ('not_started','notice_received','proof_gathered','submitted')),
  shared_with    text[] not null default '{}',-- viewer ids with consent (readForViewer gate)
  organization   text,
  month          text,
  hours          integer,
  partner        text check (partner in ('none','sent','confirmed')),
  earnings_total integer,                      -- summary only, never OCR text / images
  path           text,
  updated_at     timestamptz not null default now()
);

create table if not exists partner_signoffs (
  token        text primary key,               -- opaque demo token (packetId:viewerId)
  packet_id    text not null references packets (id) on delete cascade,
  viewer_id    text not null,
  hours        integer,
  confirmed_at timestamptz
);

create index if not exists partner_signoffs_packet_idx on partner_signoffs (packet_id);

-- ---------------------------------------------------------------------------
-- Notes
-- ---------------------------------------------------------------------------
-- * The app reads/writes these tables SERVER-SIDE only, through the service
--   role key. Every navigator/partner read goes through readForViewer, which
--   checks `shared_with` before returning anything.
-- * Aggregates leaving the server are small-cell suppressed (counts 1-9 ->
--   "fewer than 10"); no member id, phone, address or answer is ever exposed.
-- * With no Supabase connection, the app uses an in-memory demo store with the
--   same interface, so the demo works fully offline.
