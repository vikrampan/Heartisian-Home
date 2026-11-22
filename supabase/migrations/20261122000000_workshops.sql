-- Heartisan Home workshops: tables, rules and the first workshop.
-- Run once in Supabase (SQL editor → paste → Run), or with `supabase db push`.
--
-- How it is protected:
--   • Every table has row-level security switched on and no policies, so the browser can never read or write
--     them directly, with or without a login.
--   • The website's server routes (api/) use the service-role key and call only the functions below. Those
--     functions hold every rule: seat counting, holds, the waitlist and status changes. Each one locks the
--     workshop's row first, so two people can never be given the same last seat.
--   • The functions can be called by the service role only (see the grants at the end).
-- All functions take and return a single jsonb value, so the server calls every one the same way.

-- ---------------------------------------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------------------------------------

create table public.settings (
  id int primary key default 1 check (id = 1),
  upi_id text not null default '',
  payee_name text not null default 'Heartisan Home',
  team_email text not null default '',
  reply_to text not null default '',
  default_hold_hours int not null default 48 check (default_hold_hours between 1 and 336),
  updated_at timestamptz not null default now()
);
insert into public.settings default values;

create table public.admins (
  email text primary key check (email = lower(email) and email like '%@%'),
  created_at timestamptz not null default now()
);

create table public.trainers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (length(trim(name)) > 0),
  title text not null default '',
  experience text not null default '',
  bio text not null default '',
  expertise text[] not null default '{}',
  photo_url text,
  sort int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workshops (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  status text not null default 'draft' check (status in ('draft', 'published', 'closed', 'cancelled')),
  title text not null check (length(trim(title)) > 0),
  subtitle text not null default '',
  summary text not null default '',
  level text not null default '',
  format text not null default '',
  starts_on date,
  ends_on date,
  daily_start time,
  daily_end time,
  venue text not null default 'Kanha Shanti Vanam',
  venue_address text not null default '',
  seats int not null default 20 check (seats between 1 and 500),
  -- 0 means free. Above 0, people pay by UPI and the team confirms the payment by hand.
  fee_inr int not null default 0 check (fee_inr between 0 and 10000000),
  -- how long an unpaid place is kept; empty uses the default in settings
  hold_hours int check (hold_hours between 1 and 336),
  -- empty means registration closes when the workshop starts
  registration_closes_at timestamptz,
  outcomes text[] not null default '{}',
  -- [{ "title": "…", "sessions": [{ "title", "content", "method" }], "outputs": ["…"] }]
  schedule jsonb not null default '[]' check (jsonb_typeof(schedule) = 'array'),
  provided text[] not null default '{}',
  bring text[] not null default '{}',
  safety_note text not null default '',
  cover_url text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_on >= starts_on),
  check (daily_end > daily_start),
  -- only drafts may be missing their dates
  check (status = 'draft' or (starts_on is not null and ends_on is not null))
);

create table public.workshop_trainers (
  workshop_id uuid not null references public.workshops (id) on delete cascade,
  trainer_id uuid not null references public.trainers (id) on delete cascade,
  sort int not null default 0,
  primary key (workshop_id, trainer_id)
);

-- held: a place is kept while they pay · verifying: they sent a payment reference · confirmed · waitlisted
-- cancelled: by them or the team · expired: the hold ran out unpaid
create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  workshop_id uuid not null references public.workshops (id) on delete restrict,
  -- the secret in each person's private booking link
  token text not null unique
    default (replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')),
  status text not null check (status in ('held', 'verifying', 'confirmed', 'waitlisted', 'cancelled', 'expired')),
  name text not null check (length(trim(name)) between 2 and 120),
  email text not null check (email = lower(email) and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text not null check (length(phone) between 6 and 30),
  city text not null default '',
  background text not null check (background in ('student', 'mason', 'architect_engineer', 'homeowner', 'entrepreneur', 'other')),
  background_other text not null default '',
  experience text not null default 'none' check (experience in ('none', 'some', 'professional')),
  organisation text not null default '',
  motivation text not null default '',
  heard_from text not null default '',
  needs_stay boolean not null default false,
  food_needs text not null default '',
  emergency_name text not null check (length(trim(emergency_name)) >= 2),
  emergency_phone text not null check (length(emergency_phone) between 6 and 30),
  age_confirmed boolean not null check (age_confirmed),
  rules_agreed boolean not null check (rules_agreed),
  safety_agreed boolean not null check (safety_agreed),
  photo_consent boolean not null default false,
  -- the fee when they registered, so later fee changes don't affect them
  amount_inr int not null default 0,
  payment_reference text,
  payment_submitted_at timestamptz,
  hold_until timestamptz,
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  cancel_reason text,
  checked_in_at timestamptz,
  reminder_sent_at timestamptz,
  admin_note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- one live registration per email per workshop
create unique index registrations_one_live_per_email
  on public.registrations (workshop_id, email)
  where status in ('held', 'verifying', 'confirmed', 'waitlisted');
create index registrations_by_workshop on public.registrations (workshop_id, status, created_at);
create index registrations_holds on public.registrations (hold_until) where status = 'held';

create table public.registration_events (
  id bigint generated always as identity primary key,
  registration_id uuid not null references public.registrations (id) on delete cascade,
  at timestamptz not null default now(),
  actor text not null,
  kind text not null,
  from_status text,
  to_status text,
  detail text
);
create index registration_events_by_registration on public.registration_events (registration_id, at);

create table public.email_log (
  id bigint generated always as identity primary key,
  registration_id uuid references public.registrations (id) on delete set null,
  to_email text not null,
  template text not null,
  subject text not null,
  provider_id text,
  ok boolean not null,
  error text,
  created_at timestamptz not null default now()
);
create index email_log_by_registration on public.email_log (registration_id, created_at);

alter table public.settings enable row level security;
alter table public.admins enable row level security;
alter table public.trainers enable row level security;
alter table public.workshops enable row level security;
alter table public.workshop_trainers enable row level security;
alter table public.registrations enable row level security;
alter table public.registration_events enable row level security;
alter table public.email_log enable row level security;

-- Covers and trainer photos. Public to read; uploads only through short-lived links made by the server.
do $$
begin
  if to_regclass('storage.buckets') is not null then
    insert into storage.buckets (id, name, public) values ('media', 'media', true) on conflict (id) do nothing;
  end if;
end $$;

-- ---------------------------------------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------------------------------------

-- Today in India, where every workshop takes place.
create function public._today() returns date
language sql stable as $$ select (now() at time zone 'Asia/Kolkata')::date $$;

create function public._closes_at(w public.workshops) returns timestamptz
language sql stable as $$
  select coalesce(
    w.registration_closes_at,
    ((w.starts_on + coalesce(w.daily_start, time '00:00'))::timestamp at time zone 'Asia/Kolkata')
  )
$$;

-- Places in use: held (still within its hold), being verified, or confirmed.
create function public._seats_taken(wid uuid) returns int
language sql stable as $$
  select count(*)::int from public.registrations
  where workshop_id = wid and status in ('held', 'verifying', 'confirmed')
$$;

create function public._hold_until(w public.workshops) returns timestamptz
language sql stable as $$
  select least(
    now() + make_interval(hours => coalesce(w.hold_hours, (select default_hold_hours from public.settings where id = 1))),
    coalesce(public._closes_at(w), 'infinity'::timestamptz)
  )
$$;

create function public._workshop_json(w public.workshops) returns jsonb
language sql stable as $$
  select to_jsonb(w) || jsonb_build_object(
    'seats_taken', public._seats_taken(w.id),
    'seats_left', greatest(w.seats - public._seats_taken(w.id), 0),
    'waitlist', (select count(*) from public.registrations r where r.workshop_id = w.id and r.status = 'waitlisted'),
    'closes_at', public._closes_at(w),
    'hold_hours_effective', coalesce(w.hold_hours, (select default_hold_hours from public.settings where id = 1)),
    'registration_open', w.status = 'published' and now() < coalesce(public._closes_at(w), 'infinity'::timestamptz),
    'trainers', coalesce((
      select jsonb_agg(to_jsonb(t) order by wt.sort, t.sort, t.name)
      from public.workshop_trainers wt join public.trainers t on t.id = wt.trainer_id
      where wt.workshop_id = w.id
    ), '[]'::jsonb)
  )
$$;

-- Adds a count of registrations by status, for the admin.
create function public._workshop_admin_json(w public.workshops) returns jsonb
language sql stable as $$
  select public._workshop_json(w) || jsonb_build_object(
    'counts', coalesce((
      select jsonb_object_agg(status, n) from (
        select status, count(*) n from public.registrations where workshop_id = w.id group by status
      ) c
    ), '{}'::jsonb),
    'checked_in', (select count(*) from public.registrations where workshop_id = w.id and checked_in_at is not null)
  )
$$;

create function public._reg_json(r public.registrations) returns jsonb
language sql stable as $$
  select to_jsonb(r) || jsonb_build_object(
    'waitlist_position', case when r.status = 'waitlisted' then (
      select count(*) from public.registrations x
      where x.workshop_id = r.workshop_id and x.status = 'waitlisted' and x.created_at <= r.created_at
    ) end
  )
$$;

-- A registration with its workshop: what the server needs to write an email.
create function public._reg_out(r public.registrations) returns jsonb
language sql stable as $$
  select public._reg_json(r) || jsonb_build_object(
    'workshop', (select public._workshop_json(w) from public.workshops w where w.id = r.workshop_id)
  )
$$;

create function public._log(rid uuid, actor text, kind text, from_s text, to_s text, detail text) returns void
language sql as $$
  insert into public.registration_events (registration_id, actor, kind, from_status, to_status, detail)
  values (rid, actor, kind, from_s, to_s, nullif(detail, ''))
$$;

-- Ends every hold that has run out (for one workshop, or all when wid is null) and returns those registrations,
-- so the server can tell each person. Callers lock the workshop first.
create function public._expire_holds(wid uuid) returns jsonb
language plpgsql as $$
declare
  out jsonb := '[]';
  r public.registrations;
begin
  for r in
    update public.registrations set status = 'expired', updated_at = now()
    where (wid is null or workshop_id = wid) and status = 'held' and hold_until < now()
    returning *
  loop
    perform public._log(r.id, 'system', 'hold_expired', 'held', 'expired', null);
    out := out || jsonb_build_array(public._reg_out(r));
  end loop;
  return out;
end $$;

create function public._lock_workshop(wid uuid) returns public.workshops
language plpgsql as $$
declare w public.workshops;
begin
  select * into w from public.workshops where id = wid for update;
  if not found then raise exception 'workshop_not_found'; end if;
  return w;
end $$;

create function public._text_array(v jsonb) returns text[]
language sql immutable as $$
  select coalesce(array(
    select trim(e) from jsonb_array_elements_text(case when jsonb_typeof(v) = 'array' then v else '[]' end) e
    where length(trim(e)) > 0
  ), '{}')
$$;

-- ---------------------------------------------------------------------------------------------------------
-- Public: workshop pages
-- ---------------------------------------------------------------------------------------------------------

-- Upcoming workshops for the website: open for registration, or closed but not over yet.
create function public.public_workshops(p jsonb) returns jsonb
language sql stable as $$
  select coalesce(jsonb_agg(public._workshop_json(w) order by w.starts_on, w.title), '[]'::jsonb)
  from public.workshops w
  where w.status in ('published', 'closed') and w.ends_on >= public._today()
$$;

create function public.public_workshop(p jsonb) returns jsonb
language plpgsql stable as $$
declare w public.workshops;
begin
  select * into w from public.workshops where slug = p->>'slug' and status <> 'draft';
  if not found then raise exception 'workshop_not_found'; end if;
  return public._workshop_json(w);
end $$;

-- ---------------------------------------------------------------------------------------------------------
-- Participants
-- ---------------------------------------------------------------------------------------------------------

-- Free workshop with a place: confirmed straight away. Paid with a place: held while they pay.
-- No place left: waitlisted. Someone already registered with that email gets their existing booking back.
create function public.register(p jsonb) returns jsonb
language plpgsql as $$
declare
  w public.workshops;
  r public.registrations;
  expired jsonb;
  new_status text;
  hold timestamptz;
  email_ text := lower(trim(p->>'email'));
begin
  select * into w from public.workshops where slug = p->>'slug' for update;
  if not found or w.status <> 'published' then raise exception 'workshop_unavailable'; end if;
  if now() >= public._closes_at(w) then raise exception 'registration_closed'; end if;
  expired := public._expire_holds(w.id);

  select * into r from public.registrations
  where workshop_id = w.id and email = email_ and status in ('held', 'verifying', 'confirmed', 'waitlisted');
  if found then
    return jsonb_build_object('duplicate', true, 'registration', public._reg_out(r), 'expired', expired);
  end if;

  if public._seats_taken(w.id) < w.seats then
    if w.fee_inr = 0 then
      new_status := 'confirmed';
    else
      new_status := 'held';
      hold := public._hold_until(w);
    end if;
  else
    new_status := 'waitlisted';
  end if;

  insert into public.registrations (
    workshop_id, status, name, email, phone, city, background, background_other, experience, organisation,
    motivation, heard_from, needs_stay, food_needs, emergency_name, emergency_phone, age_confirmed, rules_agreed,
    safety_agreed, photo_consent, amount_inr, hold_until, confirmed_at
  ) values (
    w.id, new_status, trim(p->>'name'), email_, trim(p->>'phone'), trim(coalesce(p->>'city', '')),
    p->>'background', trim(coalesce(p->>'background_other', '')), coalesce(p->>'experience', 'none'),
    trim(coalesce(p->>'organisation', '')), trim(coalesce(p->>'motivation', '')), trim(coalesce(p->>'heard_from', '')),
    coalesce((p->>'needs_stay')::boolean, false), trim(coalesce(p->>'food_needs', '')),
    trim(p->>'emergency_name'), trim(p->>'emergency_phone'),
    coalesce((p->>'age_confirmed')::boolean, false), coalesce((p->>'rules_agreed')::boolean, false),
    coalesce((p->>'safety_agreed')::boolean, false), coalesce((p->>'photo_consent')::boolean, false),
    w.fee_inr, hold, case when new_status = 'confirmed' then now() end
  ) returning * into r;

  perform public._log(r.id, 'participant', 'registered', null, new_status, null);
  return jsonb_build_object('duplicate', false, 'registration', public._reg_out(r), 'expired', expired);
end $$;

-- The private booking page. The team's private note is never included.
create function public.booking(p jsonb) returns jsonb
language plpgsql as $$
declare
  r public.registrations;
  s public.settings;
  expired jsonb;
begin
  select * into r from public.registrations where token = p->>'token';
  if not found then raise exception 'booking_not_found'; end if;
  perform public._lock_workshop(r.workshop_id);
  expired := public._expire_holds(r.workshop_id);
  select * into r from public.registrations where id = r.id;
  select * into s from public.settings where id = 1;
  return jsonb_build_object(
    'registration', public._reg_out(r) - 'admin_note',
    'payment', jsonb_build_object('upi_id', s.upi_id, 'payee_name', s.payee_name),
    'contact_email', nullif(s.reply_to, ''),
    'expired', expired
  );
end $$;

-- Loads a booking by its link and locks its workshop, after ending any holds that ran out.
create function public._booking_for_update(token_ text, out r public.registrations, out expired jsonb)
language plpgsql as $$
begin
  select * into r from public.registrations where token = token_;
  if not found then raise exception 'booking_not_found'; end if;
  perform public._lock_workshop(r.workshop_id);
  expired := public._expire_holds(r.workshop_id);
  select * into r from public.registrations where id = r.id for update;
end $$;

create function public.submit_payment(p jsonb) returns jsonb
language plpgsql as $$
declare
  b record;
  r public.registrations;
  ref text := trim(coalesce(p->>'reference', ''));
begin
  b := public._booking_for_update(p->>'token');
  r := b.r;
  if r.status <> 'held' or r.amount_inr = 0 then raise exception 'not_awaiting_payment'; end if;
  if length(ref) < 4 or length(ref) > 64 then raise exception 'invalid_reference'; end if;
  update public.registrations
  set status = 'verifying', payment_reference = ref, payment_submitted_at = now(), updated_at = now()
  where id = r.id returning * into r;
  perform public._log(r.id, 'participant', 'payment_submitted', 'held', 'verifying', ref);
  return jsonb_build_object('registration', public._reg_out(r), 'expired', b.expired);
end $$;

-- A place offered to someone on the waitlist of a free workshop: they confirm it themselves.
create function public.accept_place(p jsonb) returns jsonb
language plpgsql as $$
declare
  b record;
  r public.registrations;
begin
  b := public._booking_for_update(p->>'token');
  r := b.r;
  if r.status <> 'held' or r.amount_inr > 0 then raise exception 'nothing_to_accept'; end if;
  update public.registrations
  set status = 'confirmed', confirmed_at = now(), hold_until = null, updated_at = now()
  where id = r.id returning * into r;
  perform public._log(r.id, 'participant', 'accepted_place', 'held', 'confirmed', null);
  return jsonb_build_object('registration', public._reg_out(r), 'expired', b.expired);
end $$;

create function public.participant_cancel(p jsonb) returns jsonb
language plpgsql as $$
declare
  b record;
  r public.registrations;
  prev text;
begin
  b := public._booking_for_update(p->>'token');
  r := b.r;
  prev := r.status;
  if prev not in ('held', 'verifying', 'confirmed', 'waitlisted') then raise exception 'cannot_cancel'; end if;
  update public.registrations
  set status = 'cancelled', cancelled_at = now(), cancel_reason = 'Cancelled by the participant', hold_until = null,
      updated_at = now()
  where id = r.id returning * into r;
  perform public._log(r.id, 'participant', 'cancelled', prev, 'cancelled', null);
  return jsonb_build_object(
    'registration', public._reg_out(r),
    'previous_status', prev,
    'freed_place', prev in ('held', 'verifying', 'confirmed'),
    'waitlist', (select count(*) from public.registrations where workshop_id = r.workshop_id and status = 'waitlisted'),
    'expired', b.expired
  );
end $$;

-- ---------------------------------------------------------------------------------------------------------
-- Scheduled job (daily): end lapsed holds, and find who needs a reminder 2 days before.
-- ---------------------------------------------------------------------------------------------------------

create function public.cron_tick(p jsonb) returns jsonb
language plpgsql as $$
declare expired jsonb;
begin
  expired := public._expire_holds(null);
  return jsonb_build_object(
    'expired', expired,
    'reminders', coalesce((
      select jsonb_agg(public._reg_out(r) order by r.created_at)
      from public.registrations r join public.workshops w on w.id = r.workshop_id
      where r.status = 'confirmed' and r.reminder_sent_at is null and w.status in ('published', 'closed')
        and w.starts_on - public._today() between 0 and 2
    ), '[]'::jsonb)
  );
end $$;

create function public.mark_reminded(p jsonb) returns jsonb
language sql as $$
  update public.registrations set reminder_sent_at = now()
  where id in (select (jsonb_array_elements_text(p->'ids'))::uuid);
  select '{}'::jsonb;
$$;

create function public.log_email(p jsonb) returns jsonb
language sql as $$
  insert into public.email_log (registration_id, to_email, template, subject, provider_id, ok, error)
  values ((p->>'registration_id')::uuid, p->>'to_email', p->>'template', p->>'subject', p->>'provider_id',
          coalesce((p->>'ok')::boolean, false), p->>'error');
  select '{}'::jsonb;
$$;

create function public.get_settings(p jsonb) returns jsonb
language sql stable as $$ select to_jsonb(s) from public.settings s where id = 1 $$;

-- ---------------------------------------------------------------------------------------------------------
-- Admin (the server checks the login and the allowlist before calling any of these)
-- ---------------------------------------------------------------------------------------------------------

create function public.admin_is_admin(p jsonb) returns jsonb
language sql stable as $$
  select jsonb_build_object('admin', exists (select 1 from public.admins where email = lower(p->>'email')))
$$;

create function public.admin_overview(p jsonb) returns jsonb
language sql stable as $$
  select jsonb_build_object(
    'workshops', coalesce((
      select jsonb_agg(public._workshop_admin_json(w) order by w.starts_on nulls last, w.created_at)
      from public.workshops w
      where w.status <> 'cancelled' and (w.ends_on is null or w.ends_on >= public._today())
    ), '[]'::jsonb),
    'payments', coalesce((
      select jsonb_agg(public._reg_json(r) || jsonb_build_object('workshop_title', w.title) order by r.payment_submitted_at)
      from public.registrations r join public.workshops w on w.id = r.workshop_id where r.status = 'verifying'
    ), '[]'::jsonb),
    'latest', coalesce((
      select jsonb_agg(x.j order by x.created_at desc) from (
        select public._reg_json(r) || jsonb_build_object('workshop_title', w.title) j, r.created_at
        from public.registrations r join public.workshops w on w.id = r.workshop_id
        order by r.created_at desc limit 12
      ) x
    ), '[]'::jsonb)
  )
$$;

create function public.admin_workshops(p jsonb) returns jsonb
language sql stable as $$
  select coalesce(jsonb_agg(public._workshop_admin_json(w) order by w.starts_on desc nulls first, w.created_at desc), '[]'::jsonb)
  from public.workshops w
$$;

create function public.admin_workshop(p jsonb) returns jsonb
language plpgsql stable as $$
declare w public.workshops;
begin
  select * into w from public.workshops where id = (p->>'id')::uuid;
  if not found then raise exception 'workshop_not_found'; end if;
  return public._workshop_admin_json(w);
end $$;

create function public.admin_save_workshop(p jsonb) returns jsonb
language plpgsql as $$
declare
  w public.workshops;
  wid uuid := nullif(p->>'id', '')::uuid;
  tid text;
  i int := 0;
begin
  if wid is null then
    insert into public.workshops (slug, title) values (p->>'slug', p->>'title') returning * into w;
    wid := w.id;
  else
    w := public._lock_workshop(wid);
    if (p->>'seats')::int < public._seats_taken(wid) then raise exception 'seats_below_taken'; end if;
  end if;

  update public.workshops set
    slug = p->>'slug',
    title = trim(p->>'title'),
    subtitle = trim(coalesce(p->>'subtitle', '')),
    summary = trim(coalesce(p->>'summary', '')),
    level = trim(coalesce(p->>'level', '')),
    format = trim(coalesce(p->>'format', '')),
    starts_on = nullif(p->>'starts_on', '')::date,
    ends_on = nullif(p->>'ends_on', '')::date,
    daily_start = nullif(p->>'daily_start', '')::time,
    daily_end = nullif(p->>'daily_end', '')::time,
    venue = trim(coalesce(p->>'venue', '')),
    venue_address = trim(coalesce(p->>'venue_address', '')),
    seats = coalesce((p->>'seats')::int, 20),
    fee_inr = coalesce((p->>'fee_inr')::int, 0),
    hold_hours = nullif(p->>'hold_hours', '')::int,
    registration_closes_at = nullif(p->>'registration_closes_at', '')::timestamptz,
    outcomes = public._text_array(p->'outcomes'),
    schedule = coalesce(p->'schedule', '[]'::jsonb),
    provided = public._text_array(p->'provided'),
    bring = public._text_array(p->'bring'),
    safety_note = trim(coalesce(p->>'safety_note', '')),
    cover_url = nullif(p->>'cover_url', ''),
    updated_at = now()
  where id = wid returning * into w;

  delete from public.workshop_trainers where workshop_id = wid;
  for tid in select jsonb_array_elements_text(coalesce(p->'trainer_ids', '[]'::jsonb)) loop
    insert into public.workshop_trainers (workshop_id, trainer_id, sort) values (wid, tid::uuid, i);
    i := i + 1;
  end loop;

  return public._workshop_admin_json(w);
end $$;

-- Publish, close, reopen, cancel or move back to draft. Cancelling a workshop cancels every live registration
-- and returns them, so the server can tell each person.
create function public.admin_workshop_status(p jsonb) returns jsonb
language plpgsql as $$
declare
  w public.workshops;
  to_ text := p->>'status';
  affected jsonb := '[]';
  r public.registrations;
begin
  w := public._lock_workshop((p->>'id')::uuid);
  if to_ not in ('draft', 'published', 'closed', 'cancelled') then raise exception 'invalid_status'; end if;
  if to_ = 'published' then
    if w.starts_on is null or w.ends_on is null then raise exception 'dates_missing'; end if;
    if w.fee_inr > 0 and (select upi_id from public.settings where id = 1) = '' then raise exception 'upi_not_set'; end if;
  end if;
  if to_ = 'cancelled' then
    for r in
      update public.registrations
      set status = 'cancelled', cancelled_at = now(), cancel_reason = 'The workshop was cancelled', hold_until = null,
          updated_at = now()
      where workshop_id = w.id and status in ('held', 'verifying', 'confirmed', 'waitlisted')
      returning *
    loop
      perform public._log(r.id, p->>'actor', 'workshop_cancelled', null, 'cancelled', null);
      affected := affected || jsonb_build_array(public._reg_out(r));
    end loop;
  end if;
  update public.workshops
  set status = to_, updated_at = now(),
      published_at = case when to_ = 'published' then coalesce(published_at, now()) else published_at end
  where id = w.id returning * into w;
  return jsonb_build_object('workshop', public._workshop_admin_json(w), 'cancelled_registrations', affected);
end $$;

create function public.admin_duplicate_workshop(p jsonb) returns jsonb
language plpgsql as $$
declare
  w public.workshops;
  copy public.workshops;
  n int := 2;
  new_slug text;
begin
  select * into w from public.workshops where id = (p->>'id')::uuid;
  if not found then raise exception 'workshop_not_found'; end if;
  loop
    new_slug := w.slug || '-' || n;
    exit when not exists (select 1 from public.workshops where slug = new_slug);
    n := n + 1;
  end loop;
  insert into public.workshops (
    slug, status, title, subtitle, summary, level, format, daily_start, daily_end, venue, venue_address, seats,
    fee_inr, hold_hours, outcomes, schedule, provided, bring, safety_note, cover_url
  ) values (
    new_slug, 'draft', w.title, w.subtitle, w.summary, w.level, w.format, w.daily_start, w.daily_end, w.venue,
    w.venue_address, w.seats, w.fee_inr, w.hold_hours, w.outcomes, w.schedule, w.provided, w.bring, w.safety_note,
    w.cover_url
  ) returning * into copy;
  insert into public.workshop_trainers (workshop_id, trainer_id, sort)
  select copy.id, trainer_id, sort from public.workshop_trainers where workshop_id = w.id;
  return public._workshop_admin_json(copy);
end $$;

create function public.admin_registrations(p jsonb) returns jsonb
language plpgsql stable as $$
declare w public.workshops;
begin
  select * into w from public.workshops where id = (p->>'workshop_id')::uuid;
  if not found then raise exception 'workshop_not_found'; end if;
  return jsonb_build_object(
    'workshop', public._workshop_admin_json(w),
    'registrations', coalesce((
      select jsonb_agg(public._reg_json(r) order by r.created_at) from public.registrations r where r.workshop_id = w.id
    ), '[]'::jsonb)
  );
end $$;

create function public.admin_registration(p jsonb) returns jsonb
language plpgsql stable as $$
declare r public.registrations;
begin
  select * into r from public.registrations where id = (p->>'id')::uuid;
  if not found then raise exception 'registration_not_found'; end if;
  return jsonb_build_object(
    'registration', public._reg_out(r),
    'events', coalesce((
      select jsonb_agg(to_jsonb(e) order by e.at, e.id) from public.registration_events e where e.registration_id = r.id
    ), '[]'::jsonb),
    'emails', coalesce((
      select jsonb_agg(to_jsonb(m) order by m.created_at, m.id) from public.email_log m where m.registration_id = r.id
    ), '[]'::jsonb)
  );
end $$;

-- confirm · reject_payment · cancel · offer_place · check_in · undo_check_in · note
create function public.admin_action(p jsonb) returns jsonb
language plpgsql as $$
declare
  r public.registrations;
  w public.workshops;
  expired jsonb;
  prev text;
  act text := p->>'action';
  note text := trim(coalesce(p->>'note', ''));
begin
  select * into r from public.registrations where id = (p->>'id')::uuid;
  if not found then raise exception 'registration_not_found'; end if;
  w := public._lock_workshop(r.workshop_id);
  expired := public._expire_holds(w.id);
  select * into r from public.registrations where id = r.id for update;
  prev := r.status;

  if act = 'confirm' then
    if prev = 'confirmed' then raise exception 'already_confirmed'; end if;
    -- someone without a place yet needs a free one
    if prev not in ('held', 'verifying') and public._seats_taken(w.id) >= w.seats then raise exception 'no_place_free'; end if;
    update public.registrations
    set status = 'confirmed', confirmed_at = now(), hold_until = null, cancelled_at = null, cancel_reason = null
    where id = r.id returning * into r;
  elsif act = 'reject_payment' then
    if prev <> 'verifying' then raise exception 'not_verifying'; end if;
    update public.registrations
    set status = 'held', hold_until = public._hold_until(w), payment_submitted_at = null
    where id = r.id returning * into r;
  elsif act = 'cancel' then
    if prev not in ('held', 'verifying', 'confirmed', 'waitlisted') then raise exception 'cannot_cancel'; end if;
    update public.registrations
    set status = 'cancelled', cancelled_at = now(), hold_until = null,
        cancel_reason = coalesce(nullif(note, ''), 'Cancelled by the Heartisan Home team')
    where id = r.id returning * into r;
  elsif act = 'offer_place' then
    if prev not in ('waitlisted', 'expired', 'cancelled') then raise exception 'cannot_offer'; end if;
    if public._seats_taken(w.id) >= w.seats then raise exception 'no_place_free'; end if;
    update public.registrations
    set status = 'held', hold_until = public._hold_until(w), cancelled_at = null, cancel_reason = null,
        payment_reference = null, payment_submitted_at = null
    where id = r.id returning * into r;
  elsif act = 'check_in' then
    if prev <> 'confirmed' then raise exception 'not_confirmed'; end if;
    update public.registrations set checked_in_at = now() where id = r.id returning * into r;
  elsif act = 'undo_check_in' then
    update public.registrations set checked_in_at = null where id = r.id returning * into r;
  elsif act = 'note' then
    update public.registrations set admin_note = note where id = r.id returning * into r;
  else
    raise exception 'unknown_action';
  end if;

  update public.registrations set updated_at = now() where id = r.id returning * into r;
  perform public._log(r.id, coalesce(p->>'actor', 'admin'), act, prev, r.status,
                      case when act = 'note' then 'Note updated' else note end);
  return jsonb_build_object('registration', public._reg_out(r), 'previous_status', prev, 'expired', expired);
end $$;

create function public.admin_trainers(p jsonb) returns jsonb
language sql stable as $$
  select coalesce(jsonb_agg(to_jsonb(t) || jsonb_build_object(
    'workshops', (select count(*) from public.workshop_trainers wt where wt.trainer_id = t.id)
  ) order by t.sort, t.name), '[]'::jsonb)
  from public.trainers t
$$;

create function public.admin_save_trainer(p jsonb) returns jsonb
language plpgsql as $$
declare
  t public.trainers;
  tid uuid := nullif(p->>'id', '')::uuid;
begin
  if tid is null then
    insert into public.trainers (slug, name) values (p->>'slug', p->>'name') returning * into t;
    tid := t.id;
  end if;
  update public.trainers set
    slug = p->>'slug',
    name = trim(p->>'name'),
    title = trim(coalesce(p->>'title', '')),
    experience = trim(coalesce(p->>'experience', '')),
    bio = trim(coalesce(p->>'bio', '')),
    expertise = public._text_array(p->'expertise'),
    photo_url = nullif(p->>'photo_url', ''),
    sort = coalesce((p->>'sort')::int, 0),
    updated_at = now()
  where id = tid returning * into t;
  if not found then raise exception 'trainer_not_found'; end if;
  return to_jsonb(t);
end $$;

create function public.admin_delete_trainer(p jsonb) returns jsonb
language sql as $$
  delete from public.trainers where id = (p->>'id')::uuid;
  select '{}'::jsonb;
$$;

create function public.admin_save_settings(p jsonb) returns jsonb
language sql as $$
  update public.settings set
    upi_id = trim(coalesce(p->>'upi_id', '')),
    payee_name = trim(coalesce(p->>'payee_name', '')),
    team_email = lower(trim(coalesce(p->>'team_email', ''))),
    reply_to = lower(trim(coalesce(p->>'reply_to', ''))),
    default_hold_hours = coalesce((p->>'default_hold_hours')::int, 48),
    updated_at = now()
  where id = 1;
  select to_jsonb(s) from public.settings s where id = 1;
$$;

create function public.admin_admins(p jsonb) returns jsonb
language sql stable as $$
  select coalesce(jsonb_agg(to_jsonb(a) order by a.created_at), '[]'::jsonb) from public.admins a
$$;

create function public.admin_set_admin(p jsonb) returns jsonb
language plpgsql as $$
declare email_ text := lower(trim(p->>'email'));
begin
  if coalesce((p->>'remove')::boolean, false) then
    if email_ = lower(p->>'actor') then raise exception 'cannot_remove_self'; end if;
    delete from public.admins where email = email_;
  else
    insert into public.admins (email) values (email_) on conflict do nothing;
  end if;
  return public.admin_admins('{}');
end $$;

-- ---------------------------------------------------------------------------------------------------------
-- Only the website's server (service role) may call these functions.
-- ---------------------------------------------------------------------------------------------------------

do $$
declare f record;
begin
  for f in
    select p.oid::regprocedure as sig
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname in (
      '_today', '_closes_at', '_seats_taken', '_hold_until', '_workshop_json', '_workshop_admin_json', '_reg_json',
      '_reg_out', '_log', '_expire_holds', '_lock_workshop', '_text_array', '_booking_for_update',
      'public_workshops', 'public_workshop', 'register', 'booking', 'submit_payment', 'accept_place',
      'participant_cancel', 'cron_tick', 'mark_reminded', 'log_email', 'get_settings', 'admin_is_admin',
      'admin_overview', 'admin_workshops', 'admin_workshop', 'admin_save_workshop', 'admin_workshop_status',
      'admin_duplicate_workshop', 'admin_registrations', 'admin_registration', 'admin_action', 'admin_trainers',
      'admin_save_trainer', 'admin_delete_trainer', 'admin_save_settings', 'admin_admins', 'admin_set_admin'
    )
  loop
    execute format('revoke all on function %s from public, anon, authenticated', f.sig);
    execute format('grant execute on function %s to service_role', f.sig);
  end loop;
end $$;

revoke all on public.settings, public.admins, public.trainers, public.workshops, public.workshop_trainers,
  public.registrations, public.registration_events, public.email_log from anon, authenticated;
revoke all on sequence public.registration_events_id_seq, public.email_log_id_seq from anon, authenticated;

-- the server's role, granted explicitly rather than relying on the project's defaults
grant usage on schema public to service_role;
grant select, insert, update, delete on public.settings, public.admins, public.trainers, public.workshops,
  public.workshop_trainers, public.registrations, public.registration_events, public.email_log to service_role;
grant usage, select on sequence public.registration_events_id_seq, public.email_log_id_seq to service_role;
