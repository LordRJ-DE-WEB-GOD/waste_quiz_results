-- =========================================================
-- ECOPULSE — CAMPUS WASTE SURVEY (CUT-DOWN)
-- Keeps only original questions 1, 4, 12, 16 and 18
-- Run this in Supabase → SQL Editor
-- =========================================================

-- ---------------------------------------------------------
-- 1) CUT DOWN THE OLD TABLE(S)
--    Your first build wrote to "waste_management_responses"
--    with columns q1..q10. Drop it (and any others you tried)
--    before creating the slim version below.
-- ---------------------------------------------------------
drop table if exists public.waste_management_responses cascade;
drop table if exists public.survey_responses            cascade;
drop table if exists public.responses                   cascade;


-- ---------------------------------------------------------
-- 2) NEW SLIM TABLE — 5 QUESTIONS
--    Column names match app.js exactly: q1, q4, q12, q16, q18
-- ---------------------------------------------------------
create table public.waste_management_responses (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),

  full_name   text not null check (char_length(trim(full_name)) >= 2),

  -- Q1 — rating of current waste management
  q1          text not null check (q1 in (
                'Very poor','Poor','Average','Good','Very good')),

  -- Q4 — how often litter is seen
  q4          text not null check (q4 in (
                'Never','Rarely','Sometimes','Often','Very often')),

  -- Q12 — what prevents recycling (multi-select)
  q12         text[] not null default '{}',
  q12_other   text,

  -- Q16 — main causes of littering (multi-select)
  q16         text[] not null default '{}',
  q16_other   text,

  -- Q18 — should the university provide more education
  q18         text not null check (q18 in (
                'Strongly agree','Agree','Neutral','Disagree','Strongly disagree'))
);

create index waste_management_responses_created_at_idx
  on public.waste_management_responses (created_at desc);


-- ---------------------------------------------------------
-- 3) ROW LEVEL SECURITY
-- ---------------------------------------------------------
alter table public.waste_management_responses enable row level security;

create policy "anon can insert responses"
  on public.waste_management_responses
  for insert to anon
  with check (true);

-- Needed if admin.html reads results with the anon key.
-- Remove this policy if you'd rather keep results private.
create policy "anon can read responses"
  on public.waste_management_responses
  for select to anon
  using (true);


-- ---------------------------------------------------------
-- 4) OPTIONAL — quick results view for the admin page
-- ---------------------------------------------------------
create or replace view public.survey_summary as
select
  count(*)                                                as total_responses,
  count(*) filter (where q1 in ('Poor','Very poor'))       as rated_poor,
  count(*) filter (where q4 in ('Often','Very often'))     as sees_litter_often,
  count(*) filter (where q18 in ('Agree','Strongly agree')) as wants_more_education
from public.waste_management_responses;
