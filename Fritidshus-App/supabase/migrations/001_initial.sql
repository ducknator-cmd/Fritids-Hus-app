-- Fritidshus Finder – initial schema
-- Run in Supabase SQL editor to migrate from localStorage to Supabase

create table if not exists properties (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  title           text,
  source_url      text,
  address         text,
  lat             float,
  lng             float,
  price           integer,
  living_area_m2  integer,
  plot_area_m2    integer,
  rooms           integer,
  build_year      integer,
  heating_source  text,
  heating_score   integer,
  is_flexbolig    boolean default false,
  flexbolig_possible boolean default false,
  condition       text,
  condition_score integer,
  rural_score     integer,
  noise_score     integer,
  drive_time_minutes integer,
  match_score     float,
  category        text check (category in ('top_pick','maybe','no_go') or category is null),
  notes           text,
  status          text not null default 'active' check (status in ('active','sold','archived'))
);

create table if not exists settings (
  id                  integer primary key default 1,
  home_address        text,
  max_drive_minutes   integer default 60,
  weight_quiet        float default 0.40,
  weight_distance     float default 0.30,
  weight_condition    float default 0.20,
  weight_price        float default 0.10,
  max_budget          integer
);

-- Insert default settings row
insert into settings (id) values (1) on conflict (id) do nothing;
