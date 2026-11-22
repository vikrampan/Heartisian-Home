-- Sample data for local development only (never run on the live database).
-- Publishes the seeded workshop with sample dates and a fee, fills most of its places with made-up people,
-- and adds a small, full sample workshop so the waitlist can be tried.

update public.settings set
  upi_id = 'heartisanhome@upi',
  payee_name = 'Heartisan Home',
  team_email = 'team@example.com',
  reply_to = 'hello@example.com';

update public.workshops set
  status = 'published',
  published_at = now(),
  starts_on = public._today() + 24,
  ends_on = public._today() + 25,
  daily_start = '09:30',
  daily_end = '17:30',
  seats = 20,
  fee_inr = 3500
where slug = 'introduction-to-earth-based-building';

insert into public.registrations (
  workshop_id, status, name, email, phone, city, background, experience, emergency_name, emergency_phone,
  age_confirmed, rules_agreed, safety_agreed, amount_inr, confirmed_at, payment_reference, payment_submitted_at,
  hold_until, created_at
)
select w.id,
  case when n <= 12 then 'confirmed' when n = 13 then 'verifying' else 'held' end,
  'Sample Person ' || n, 'sample' || n || '@example.com', '98765 432' || lpad(n::text, 2, '0'),
  (array['Hyderabad', 'Bengaluru', 'Pune', 'Chennai', 'Mumbai'])[1 + n % 5],
  (array['student', 'mason', 'architect_engineer', 'homeowner', 'entrepreneur'])[1 + n % 5],
  (array['none', 'some', 'professional'])[1 + n % 3],
  'Sample Contact', '91234 567' || lpad(n::text, 2, '0'),
  true, true, true, 3500,
  case when n <= 12 then now() - (n || ' hours')::interval end,
  case when n <= 13 then 'UTR4401223' || lpad(n::text, 3, '0') end,
  case when n = 13 then now() - interval '2 hours' end,
  case when n = 14 then now() + interval '30 hours' end,
  now() - ((20 - n) || ' hours')::interval
from public.workshops w, generate_series(1, 14) n
where w.slug = 'introduction-to-earth-based-building';

insert into public.workshops (
  slug, status, published_at, title, subtitle, summary, level, format, starts_on, ends_on, daily_start, daily_end,
  venue, venue_address, seats, fee_inr, outcomes, schedule
) values (
  'sample-earth-plaster-day', 'published', now(),
  'Sample: Earth Plaster Practice Day',
  'Local sample only, to try the waitlist. It never appears on the live site.',
  'A short, full sample workshop used to test the waitlist while developing the site.',
  'Introductory', '1 day · Hands-on practice',
  public._today() + 40, public._today() + 40, '10:00', '16:00',
  'Kanha Shanti Vanam', 'Kanha Shanti Vanam, Telangana', 6, 0,
  array['Prepare and apply a sample earth plaster panel'],
  '[{"title": "Earth plaster", "sessions": [{"title": "Natural earth plaster", "content": "Substrate preparation; base and finish coats; curing.", "method": "Hands-on"}], "outputs": ["An earth plaster sample panel"]}]'
);

insert into public.workshop_trainers (workshop_id, trainer_id, sort)
select w.id, t.id, 0 from public.workshops w, public.trainers t
where w.slug = 'sample-earth-plaster-day' and t.slug = 'dil';

insert into public.registrations (
  workshop_id, status, name, email, phone, city, background, experience, emergency_name, emergency_phone,
  age_confirmed, rules_agreed, safety_agreed, confirmed_at
)
select w.id, 'confirmed', 'Plaster Sample ' || n, 'plaster' || n || '@example.com', '99887 766' || lpad(n::text, 2, '0'),
  'Hyderabad', 'homeowner', 'none', 'Sample Contact', '91234 000' || lpad(n::text, 2, '0'), true, true, true, now()
from public.workshops w, generate_series(1, 6) n
where w.slug = 'sample-earth-plaster-day';
