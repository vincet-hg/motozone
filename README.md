# MotoZone

Fast online store for motorcycle accessories. Next.js, TypeScript, Tailwind CSS, Supabase.

## Setup

1. Create a project at [supabase.com](https://supabase.com).
2. In Supabase, open **SQL Editor**, paste all of `supabase/schema.sql`, and run it. This creates the tables, access rules, image storage and your 7 categories.
3. Copy `.env.example` to `.env.local` and fill in both values from **Project Settings > API**.
4. Create your admin login:
   - In **Authentication > Users**, click **Add user** and enter your email and a strong password.
   - In **SQL Editor**, run this with your email:
     ```sql
     insert into public.admins (user_id)
     select id from auth.users where email = 'you@example.com';
     ```
5. In **Authentication > Sign In / Providers**, turn off **Allow new users to sign up**.
6. Run it:
   ```bash
   npm install
   npm run dev
   ```
   Store: http://localhost:3000. Admin: http://localhost:3000/admin.

## Before going live

- Set your phone number and Facebook and Instagram links in `src/lib/site.ts`.
- Replace the draft text in `src/app/(store)/delivery/page.tsx` and `src/app/(store)/returns/page.tsx` with your real terms.

## Deploy to Vercel

Import the project, add the same two environment variables, and deploy. Run the database setup first, because the build reads your categories and products.

## How it works

- Store pages are pre-built and cached. Saving anything in the admin panel refreshes them right away. Edits made directly in the Supabase dashboard appear within an hour.
- Photos are shrunk to 1600 px in the browser during upload, then served as AVIF or WebP at the size each screen needs.
- Orders are created in the database function `place_order`, which reads prices and stock itself and locks stock, so prices cannot be tampered with and the last item cannot be sold twice.
- Cancelling an order returns its items to stock.
