# CampusOLX — setup guide

CampusOLX is a React + Vite frontend with Supabase authentication, PostgreSQL listings, and image storage.

## 1. Install prerequisites

Install:
- Node.js LTS from https://nodejs.org/
- VS Code
- A free Supabase account at https://supabase.com/

Check Node and npm in the VS Code terminal:

```bash
node -v
npm -v
```

## 2. Run the website

Extract the ZIP, open the `campusolx` folder in VS Code, then run:

```bash
npm install
npm run dev
```

Open the local URL Vite prints (usually `http://localhost:5173`).
Before Supabase is connected, the home page uses clearly labelled sample/demo listings.

## 3. Create Supabase project

1. Create a project in Supabase.
2. Open **Project Settings → API** (or Connect) and copy the Project URL and publishable/anon key.
3. Copy `.env.example` to `.env.local`.
4. Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
5. Set `VITE_COLLEGE_EMAIL_DOMAIN` to the official student email domain confirmed by your college IT/admissions team. Do not guess this domain.
6. Restart Vite after changing `.env.local` (stop with Ctrl+C, then `npm run dev`).

Only the publishable/anon key belongs in frontend environment variables. Never put a Supabase service-role key or any private API secret in this app.

## 4. Create database and storage

1. In Supabase, open **SQL Editor → New query**.
2. Copy all of `supabase/schema.sql` into the editor and run it.
3. Open **Authentication → URL Configuration**. Set your local site URL to `http://localhost:5173` and add it to allowed redirect URLs.
4. Under **Authentication → Sign In / Providers**, enable Email and configure email OTP/magic-link settings.
5. For production, set the deployed site's URL and allowed redirects too.

The schema enables Row Level Security (RLS) for listing ownership and image uploads. Read through it before using real student data.

## 5. Important authentication note

The UI checks the configured email domain as a convenience, but a frontend check is not secure on its own. Before opening registration to the public, add a trusted server-side or database-enforced college-domain verification flow and test it. Email verification proves access to an inbox, not that a person is currently enrolled. Avoid collecting student ID cards unless the college has approved the process and you have a privacy policy.

The current starter's magic-link flow and database setup should be tested in your Supabase project before inviting students. Do not use demo mode for real listings.

## 6. Build for production

```bash
npm run build
npm run preview
```

Deploy the built app to Vercel or another static host. Add the same `VITE_` environment variables in the host dashboard, and update Supabase redirect URLs to the deployed domain.

## 7. Current starter scope

Included:
- Responsive marketplace homepage and category filtering
- Sample/demo listings before database setup
- Supabase listing reads and create-listing form
- Email magic-link sign-in UI
- Listing image upload
- Listing RLS and storage policies

Next improvements:
- Make college-domain verification enforceable server-side
- Add a proper seller profile/contact workflow (avoid exposing private emails)
- Add My Listings and mark-as-sold controls
- Add favorites and in-app chat
- Add reporting/moderation, rate limits, privacy policy, and terms
- Add image cleanup when listings are deleted
