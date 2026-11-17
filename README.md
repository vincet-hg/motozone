# Scooter Land

Fast online store for motorcycle and moped accessories. Next.js, TypeScript, Tailwind CSS, Supabase.
The store and the admin panel are one app: the admin code never reaches customers' browsers, and the
database checks every admin action again on its own.

## Three environments

| Environment | What it is for | Database | Git branch |
|---|---|---|---|
| Local | Everyday work on your computer | Demo mode, or a local Supabase | any |
| Staging | Testing a change with real rules before customers see it | Its own Supabase project with test data | any branch except `main` |
| Production | Real customers | The main Supabase project | `main` |

How a change reaches customers:

1. Make a branch: `git checkout -b feature/new-filter`. Work locally.
2. Push it and open a pull request. CI checks the types and runs every migration on an empty database.
   Vercel builds a preview link that uses the staging database. Test there.
3. If the change adds a migration, apply it to staging: `npx supabase link` (pick staging), then
   `npx supabase db push --remote`.
4. Link production the same way, run `npx supabase db push --remote`, then merge the pull request.
   Vercel deploys `main`.

Apply a migration to production **before** merging code that needs it. The CLI always shows the target project
before it changes anything: check the name before you answer Yes.

## Demo mode

Leave `NEXT_PUBLIC_SUPABASE_URL` empty and `npm run dev` runs the whole store without Supabase. Sign in
at `/admin/login` with `admin@demo.local` / `demo1234`, or set `DEMO_ADMIN_EMAIL` and
`DEMO_ADMIN_PASSWORD` in `.env.local`. Data and photos are kept in `.demo-data/`; delete that folder to
start over with sample products, purchases and orders. Demo mode never runs in `npm run build` or
`npm start`, and it skips two-factor sign-in and rate limits.

Demo mode is for design and quick checks. Access rules, the order function and two-factor sign-in
only run on a real Supabase database, so test those on staging.

## Setting up a Supabase project (staging or production)

Do this once per environment.

1. Create a project at [supabase.com](https://supabase.com). Use the region closest to Georgia (Frankfurt).
2. Link this folder and apply the migrations:
   ```bash
   npx supabase login
   npx supabase link              # pick the project from the list
   npx supabase db push --remote  # CLI v3 targets a local database without --remote
   ```
   If you already ran the old `schema.sql` on this project by hand, first mark it as applied:
   `npx supabase migration repair --status applied 20261101000000 --remote`, then run `db push --remote`.
3. Create your admin login:
   - In **Authentication > Users**, click **Add user** and enter your email and a strong password.
   - In **SQL Editor**, run this with your email:
     ```sql
     insert into public.admins (user_id)
     select id from auth.users where email = 'you@example.com';
     ```
4. In **Authentication > Sign In / Providers**, turn off **Allow new users to sign up**.
5. In **Authentication > Multi-Factor**, make sure **TOTP (App Authenticator)** is enabled.
6. Sign in at `/admin/login`. The first time, the site asks you to scan a QR code with an authenticator
   app (Google Authenticator, Microsoft Authenticator, 1Password). After that every sign-in needs the
   password and the 6-digit code. The database itself refuses admin access without the second step.

## Environment variables

See `.env.example` for the full list. In Vercel (**Settings > Environment Variables**) give **Preview**
the staging values and **Production** the production values:

| Name | Preview (staging) | Production |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | staging project | production project |
| `SUPABASE_SECRET_KEY` | staging secret key (`sb_secret_...`) | production secret key |
| `NEXT_PUBLIC_SITE_URL` | not needed: previews use their own address | `https://your-domain.ge` |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | optional, a test chat | your shop chat |

The secret key bypasses all access rules. It is read only on the server; never give it a
`NEXT_PUBLIC_` prefix, never paste it in chat, and rotate it in Supabase if it leaks. A production build
stops with an error if a required variable is missing.

## Order notifications in Telegram

1. In Telegram, open **@BotFather**, send `/newbot` and follow the steps. Copy the token into `TELEGRAM_BOT_TOKEN`.
2. Send any message to your new bot (or add it to a group with your staff).
3. Open `https://api.telegram.org/bot<TOKEN>/getUpdates` in a browser and copy `chat.id` into `TELEGRAM_CHAT_ID`.

Every new order then arrives with the customer, the items, the total and a link to the order. If an
order brings a product down to its low-stock level, the message says so.

## Stock, purchase cost and profit

- Stock changes in three ways only: **purchases** (new stock arrives), **corrections** (damage, counting
  errors) and **orders**. Each is recorded, so every unit is accounted for.
- Each purchase records the cost per unit. The product's cost is the **weighted average**:
  5 units at 10 ₾ plus 5 units at 14 ₾ gives 10 units at 12 ₾.
- When new stock arrives at a different cost, the admin shows the new margin and the price that would
  keep the old one. The selling price changes only when you change it.
- Every order line stores the cost at the moment of sale, so past profit stays correct.
- **Reports** show revenue, cost and profit by month and the most profitable products. Cancelled
  orders are left out.
- For stock you had before purchases were recorded, enter its cost once on the product page under
  **Set cost by hand**. Orders placed before this have no cost and count as full profit in reports.

## Security

- Admin: password plus authenticator code, checked by the app and by the database (`is_admin()`
  requires `aal2`). Sign-in attempts are limited per address and per account.
- Checkout: the browser cannot call the order function. The server does it with the secret key,
  after limiting orders per IP. The database still checks prices, stock and phone numbers itself.
- Every admin change (prices, products, categories, stock, costs, order status) is written to an
  audit log that the admin can read but cannot change. See **History** in the admin.
- Security headers on every page: Content-Security-Policy, HSTS (on https), X-Frame-Options and others.
- `supabase/tests/rules.sql` checks the access rules on every pull request.

## Before going live

- [ ] Set your phone, email, social links and registered business details in `src/lib/site.ts`.
- [ ] Replace the draft text on the delivery, returns, privacy and terms pages with your real terms,
      and have a lawyer read the privacy and terms pages.
- [ ] Set up production Supabase (above), then the Vercel environment variables.
- [ ] Connect your domain in Vercel and set `NEXT_PUBLIC_SITE_URL` to it.
- [ ] Add the site in [Google Search Console](https://search.google.com/search-console), verify it with
      `GOOGLE_SITE_VERIFICATION`, and submit `https://your-domain.ge/sitemap.xml`.
- [ ] Turn on backups: on the Supabase Pro plan, daily backups are included. On the free plan, export the
      database regularly (**Database > Backups**, or `npx supabase db dump`).
- [ ] Place a test order on production and cancel it, so you see the Telegram message and the stock return.

## SEO

- Every product and category page has its own title, description, canonical link and share image.
- Google gets structured data: products with price and stock, breadcrumbs, the store and site search.
- `sitemap.xml` lists all categories and products with their photos and refreshes when you save in the admin.
- `robots.txt` keeps the admin, cart and wishlist out of search. Vercel previews are never indexed.
- Category descriptions (admin > Categories) appear on the category page and in Google. Write 1-3
  sentences for each: what is in it and who it is for.

## How it works

- Store pages are pre-built and cached. Saving anything in the admin panel refreshes them right away.
  Edits made directly in the Supabase dashboard appear within an hour.
- Photos are shrunk to 1600 px in the browser during upload, then served as AVIF or WebP at the size
  each screen needs.
- Orders are created in the database function `place_order`, which reads prices and stock itself and
  locks stock, so prices cannot be tampered with and the last item cannot be sold twice.
- Cancelling an order returns its items to stock.
- Database changes live in `supabase/migrations/`. Never edit a migration that is already applied;
  add a new file instead.
