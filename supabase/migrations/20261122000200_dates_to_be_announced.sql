-- Workshops can be published before everything is fixed: dates or fee "to be announced", or a fee but no UPI ID to
-- pay to yet. People then register their interest instead of taking a place. Once everything is set, the team
-- offers places to those people, in the order they registered.

-- interested: registered interest in a workshop whose dates are not set yet
alter table public.registrations drop constraint registrations_status_check;
alter table public.registrations add constraint registrations_status_check
  check (status in ('held', 'verifying', 'confirmed', 'waitlisted', 'interested', 'cancelled', 'expired'));

drop index public.registrations_one_live_per_email;
create unique index registrations_one_live_per_email
  on public.registrations (workshop_id, email)
  where status in ('held', 'verifying', 'confirmed', 'waitlisted', 'interested');

-- the team's own UPI QR image, shown on booking pages (otherwise one is drawn from the UPI ID)
alter table public.settings add column upi_qr_url text not null default '';

-- a published workshop may now be without dates
alter table public.workshops drop constraint workshops_check2;
-- the fee can be shown as "to be announced"
alter table public.workshops add column fee_tba boolean not null default false;

-- Not ready to take places yet: people register interest.
create function public._interest_only(w public.workshops) returns boolean
language sql stable as $$
  select w.starts_on is null or w.fee_tba
    or (w.fee_inr > 0 and coalesce((select upi_id from public.settings where id = 1), '') = '')
$$;

create or replace function public._workshop_json(w public.workshops) returns jsonb
language sql stable as $$
  select to_jsonb(w) || jsonb_build_object(
    'seats_taken', public._seats_taken(w.id),
    'seats_left', greatest(w.seats - public._seats_taken(w.id), 0),
    'waitlist', (select count(*) from public.registrations r where r.workshop_id = w.id and r.status = 'waitlisted'),
    'dates_tba', w.starts_on is null,
    'interest_only', public._interest_only(w),
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

create or replace function public.public_workshops(p jsonb) returns jsonb
language sql stable as $$
  select coalesce(jsonb_agg(public._workshop_json(w) order by w.starts_on nulls last, w.title), '[]'::jsonb)
  from public.workshops w
  where w.status in ('published', 'closed') and (w.ends_on is null or w.ends_on >= public._today())
$$;

create or replace function public.register(p jsonb) returns jsonb
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
  where workshop_id = w.id and email = email_ and status in ('held', 'verifying', 'confirmed', 'waitlisted', 'interested');
  if found then
    return jsonb_build_object('duplicate', true, 'registration', public._reg_out(r), 'expired', expired);
  end if;

  if public._interest_only(w) then
    new_status := 'interested';
  elsif public._seats_taken(w.id) < w.seats then
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
    case when public._interest_only(w) then 0 else w.fee_inr end, hold, case when new_status = 'confirmed' then now() end
  ) returning * into r;

  perform public._log(r.id, 'participant', 'registered', null, new_status, null);
  return jsonb_build_object('duplicate', false, 'registration', public._reg_out(r), 'expired', expired);
end $$;

create or replace function public.participant_cancel(p jsonb) returns jsonb
language plpgsql as $$
declare
  b record;
  r public.registrations;
  prev text;
begin
  b := public._booking_for_update(p->>'token');
  r := b.r;
  prev := r.status;
  if prev not in ('held', 'verifying', 'confirmed', 'waitlisted', 'interested') then raise exception 'cannot_cancel'; end if;
  update public.registrations
  set status = 'cancelled', cancelled_at = now(), cancel_reason = 'Cancelled by the participant', hold_until = null,
      updated_at = now()
  where id = r.id returning * into r;
  perform public._log(r.id, 'participant', 'cancelled', prev, 'cancelled', null);
  return jsonb_build_object(
    'registration', public._reg_out(r),
    'previous_status', prev,
    'freed_place', prev in ('held', 'verifying', 'confirmed'),
    'waitlist', (select count(*) from public.registrations where workshop_id = r.workshop_id and status in ('waitlisted', 'interested')),
    'expired', b.expired
  );
end $$;

-- Publishing no longer needs dates or a UPI ID: until they are set, people register interest.
create or replace function public.admin_workshop_status(p jsonb) returns jsonb
language plpgsql as $$
declare
  w public.workshops;
  to_ text := p->>'status';
  affected jsonb := '[]';
  r public.registrations;
begin
  w := public._lock_workshop((p->>'id')::uuid);
  if to_ not in ('draft', 'published', 'closed', 'cancelled') then raise exception 'invalid_status'; end if;
  if to_ = 'cancelled' then
    for r in
      update public.registrations
      set status = 'cancelled', cancelled_at = now(), cancel_reason = 'The workshop was cancelled', hold_until = null,
          updated_at = now()
      where workshop_id = w.id and status in ('held', 'verifying', 'confirmed', 'waitlisted', 'interested')
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

create or replace function public.admin_save_workshop(p jsonb) returns jsonb
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
    ends_on = coalesce(nullif(p->>'ends_on', '')::date, nullif(p->>'starts_on', '')::date),
    daily_start = nullif(p->>'daily_start', '')::time,
    daily_end = nullif(p->>'daily_end', '')::time,
    venue = trim(coalesce(p->>'venue', '')),
    venue_address = trim(coalesce(p->>'venue_address', '')),
    seats = coalesce((p->>'seats')::int, 20),
    fee_inr = coalesce((p->>'fee_inr')::int, 0),
    fee_tba = coalesce((p->>'fee_tba')::boolean, false),
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

create or replace function public.admin_duplicate_workshop(p jsonb) returns jsonb
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
    fee_inr, fee_tba, hold_hours, outcomes, schedule, provided, bring, safety_note, cover_url
  ) values (
    new_slug, 'draft', w.title, w.subtitle, w.summary, w.level, w.format, w.daily_start, w.daily_end, w.venue,
    w.venue_address, w.seats, w.fee_inr, w.fee_tba, w.hold_hours, w.outcomes, w.schedule, w.provided, w.bring,
    w.safety_note, w.cover_url
  ) returning * into copy;
  insert into public.workshop_trainers (workshop_id, trainer_id, sort)
  select copy.id, trainer_id, sort from public.workshop_trainers where workshop_id = w.id;
  return public._workshop_admin_json(copy);
end $$;

create or replace function public.admin_action(p jsonb) returns jsonb
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

  if act in ('confirm', 'offer_place') and w.starts_on is null then raise exception 'dates_missing'; end if;
  if act in ('confirm', 'offer_place') and w.fee_tba then raise exception 'fee_missing'; end if;
  if act = 'offer_place' and public._interest_only(w) then raise exception 'upi_not_set'; end if;

  if act = 'confirm' then
    if prev = 'confirmed' then raise exception 'already_confirmed'; end if;
    if prev not in ('held', 'verifying') and public._seats_taken(w.id) >= w.seats then raise exception 'no_place_free'; end if;
    update public.registrations
    set status = 'confirmed', confirmed_at = now(), hold_until = null, cancelled_at = null, cancel_reason = null,
        amount_inr = case when prev in ('held', 'verifying') then amount_inr else w.fee_inr end
    where id = r.id returning * into r;
  elsif act = 'reject_payment' then
    if prev <> 'verifying' then raise exception 'not_verifying'; end if;
    update public.registrations
    set status = 'held', hold_until = public._hold_until(w), payment_submitted_at = null
    where id = r.id returning * into r;
  elsif act = 'cancel' then
    if prev not in ('held', 'verifying', 'confirmed', 'waitlisted', 'interested') then raise exception 'cannot_cancel'; end if;
    update public.registrations
    set status = 'cancelled', cancelled_at = now(), hold_until = null,
        cancel_reason = coalesce(nullif(note, ''), 'Cancelled by the Heartisan Home team')
    where id = r.id returning * into r;
  elsif act = 'offer_place' then
    if prev not in ('waitlisted', 'interested', 'expired', 'cancelled') then raise exception 'cannot_offer'; end if;
    if public._seats_taken(w.id) >= w.seats then raise exception 'no_place_free'; end if;
    update public.registrations
    set status = 'held', hold_until = public._hold_until(w), cancelled_at = null, cancel_reason = null,
        payment_reference = null, payment_submitted_at = null, amount_inr = w.fee_inr
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

-- Once dates are set: offer the free places to everyone interested or waiting, in the order they registered.
create function public.admin_offer_all(p jsonb) returns jsonb
language plpgsql as $$
declare
  w public.workshops;
  r public.registrations;
  offered jsonb := '[]';
  expired jsonb;
begin
  w := public._lock_workshop((p->>'workshop_id')::uuid);
  if w.starts_on is null then raise exception 'dates_missing'; end if;
  if w.fee_tba then raise exception 'fee_missing'; end if;
  if public._interest_only(w) then raise exception 'upi_not_set'; end if;
  if w.status <> 'published' then raise exception 'workshop_unavailable'; end if;
  expired := public._expire_holds(w.id);
  for r in
    select * from public.registrations
    where workshop_id = w.id and status in ('interested', 'waitlisted')
    order by created_at
    for update
  loop
    exit when public._seats_taken(w.id) >= w.seats;
    update public.registrations
    set status = 'held', hold_until = public._hold_until(w), amount_inr = w.fee_inr, updated_at = now()
    where id = r.id returning * into r;
    perform public._log(r.id, coalesce(p->>'actor', 'admin'), 'offer_place', 'interested', 'held', null);
    offered := offered || jsonb_build_array(public._reg_out(r));
  end loop;
  return jsonb_build_object('offered', offered, 'expired', expired);
end $$;

revoke all on function public.admin_offer_all(jsonb) from public, anon, authenticated;
grant execute on function public.admin_offer_all(jsonb) to service_role;
revoke all on function public._interest_only(public.workshops) from public, anon, authenticated;
grant execute on function public._interest_only(public.workshops) to service_role;

create or replace function public.booking(p jsonb) returns jsonb
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
    'payment', jsonb_build_object('upi_id', s.upi_id, 'payee_name', s.payee_name, 'qr_url', nullif(s.upi_qr_url, '')),
    'contact_email', nullif(s.reply_to, ''),
    'expired', expired
  );
end $$;

create or replace function public.admin_save_settings(p jsonb) returns jsonb
language sql as $$
  update public.settings set
    upi_id = trim(coalesce(p->>'upi_id', '')),
    payee_name = trim(coalesce(p->>'payee_name', '')),
    upi_qr_url = trim(coalesce(p->>'upi_qr_url', '')),
    team_email = lower(trim(coalesce(p->>'team_email', ''))),
    reply_to = lower(trim(coalesce(p->>'reply_to', ''))),
    default_hold_hours = coalesce((p->>'default_hold_hours')::int, 48),
    updated_at = now()
  where id = 1;
  select to_jsonb(s) from public.settings s where id = 1;
$$;
