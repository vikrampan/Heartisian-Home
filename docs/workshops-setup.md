# Workshops: setting up Supabase, Resend and Vercel

Everything for workshops is built and runs locally. To make it live, connect three services. Allow about 30 minutes,
plus however long your domain's DNS takes to update for email.

## 1. Supabase (the database, admin logins and photo storage)

1. Create a project at supabase.com. Choose the **Mumbai (ap-south-1)** region, so it is close to your visitors.
2. Open **SQL Editor**. Paste and run each file from `supabase/migrations/`, in name order:
   1. `20261122000000_workshops.sql`: the tables, rules and photo storage.
   2. `20261122000100_seed_workshop.sql`: the three trainers and the two-day workshop, as a draft.
3. Add yourself as the first admin. In the SQL Editor, run this with your own email:
   ```sql
   insert into public.admins (email) values ('you@example.com');
   ```
4. Create your login: **Authentication → Users → Add user → Create new user**, with the same email and a password.
5. Stop strangers making accounts: **Authentication → Sign In / Providers**, and turn off **Allow new users to sign up**.
   (Someone who signs up still could not open the admin, but this keeps the user list clean.)
6. For the "Forgot your password?" link: **Authentication → URL Configuration**. Set **Site URL** to
   `https://heartisanhome.com`, and add `https://heartisanhome.com/admin` under **Redirect URLs**.
7. Copy three values from **Project Settings → API**: the project URL, the `anon` public key, and the
   `service_role` secret key.

## 2. Resend (the emails)

1. At resend.com, open **Domains → Add domain** and enter `heartisanhome.com`.
2. Add the DNS records Resend shows at the company where you bought the domain, then wait for **Verified**.
3. Open **API Keys → Create API key** (sending access is enough) and copy it.

Until the domain is verified, Resend only delivers to your own address.

## 3. Vercel (the website)

In the project: **Settings → Environment Variables**. Add each of these for Production (and Preview, to test on a
preview link first):

| Name | Value |
|---|---|
| `VITE_SUPABASE_URL` | the Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | the `anon` public key |
| `SUPABASE_SERVICE_ROLE_KEY` | the `service_role` secret key (never share it) |
| `RESEND_API_KEY` | the Resend key |
| `EMAIL_FROM` | `Heartisan Home <workshops@heartisanhome.com>` |
| `SITE_URL` | `https://heartisanhome.com` |
| `CRON_SECRET` | any long random text, for example from a password generator |

Then redeploy, so the new values are used.

## 4. First steps in the admin (heartisanhome.com/admin)

1. **Settings**: your UPI ID, the name people see when paying, the email for team alerts and the reply-to address.
2. **Workshops → the draft workshop**: set the dates, number of places and fee (0 for free), then **Publish**.
3. Trainer photos: **Trainers → Edit → Upload photo**. Until then, their initials are shown.

## How it runs day to day

- **Free workshops**: places are confirmed straight away, with an email and calendar invite.
- **Paid workshops**: the place is held (48 hours by default) while the person pays by UPI and sends the payment
  reference. You check it in your UPI account, then press **Confirm** (or **Not found**) in the admin.
- **Full**: people join the waitlist. When a place frees up, the admin offers it to them.
- **Every morning at 8:00 (India time)**: holds that ran out are released, and confirmed people get a reminder two
  days before their workshop.
- Every change emails the person automatically; the admin shows each person's history and every email sent.

## Working on it locally

`npm run dev` without the Supabase keys uses a sample database on your computer (`.dev-db/`) with sample
registrations. The admin password is `dev`, and emails are saved as files in `.dev-mail/` instead of being sent.
Delete `.dev-db/` to start again. To use your real Supabase and Resend locally, copy `.env.example` to `.env.local`
and fill it in.
