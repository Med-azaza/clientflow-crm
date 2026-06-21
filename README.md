# ClientFlow CRM

ClientFlow CRM is a full-stack SaaS MVP for freelancers, agencies, and service teams to manage clients, projects, tasks, invoices, files, messages, team workload, and workspace settings.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase Auth, Postgres, Row Level Security, and Storage
- `@supabase/ssr` and `@supabase/supabase-js`
- Zod validation
- Biome
- lucide-react icons

## Features

- Email/password authentication
- Google OAuth authentication
- Protected dashboard routes via Next.js 16 `proxy.ts`
- Automatic profile and default workspace onboarding
- Multi-tenant organizations with owner/admin/member/client roles
- Supabase-backed clients, projects, tasks, invoices, files, messages, settings, and activity logs
- Private `client-files` storage bucket with signed download URLs
- Search, filter, modal forms, loading states, empty states, and inline feedback
- Demo billing UI only; Stripe is not connected

## Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
DEMO_EMAIL=demo@clientflow.app
DEMO_PASSWORD=your-demo-password
```

Do not expose service role or secret keys in the browser. This app uses only the public publishable key and relies on Supabase Auth + RLS.

## Demo Access

The app includes a demo workspace for portfolio review. Configure `DEMO_EMAIL` and `DEMO_PASSWORD` in the environment, create the matching Supabase Auth user manually, and click `View demo workspace` from the login or signup page.

## Supabase Setup

1. Create a Supabase project.
2. Copy the Project URL and Publishable key into `.env.local`.
3. Run `supabase/migrations/001_initial_schema.sql` in the Supabase SQL Editor or through your migration workflow.
4. Confirm the `client-files` storage bucket exists and is private.
5. Sign up through the app once. The `ensure_user_workspace()` RPC creates a profile, organization, and owner membership.
6. Optionally run `supabase/seed.sql` while authenticated in SQL Editor to add demo records for your workspace.

## Google OAuth

Enable Google in Supabase Dashboard under Auth Providers. Configure:

- Google OAuth client ID
- Google OAuth client secret
- Site URL, for example `http://localhost:3000` locally or your Vercel URL
- Redirect URL: `{SITE_URL}/auth/callback`

The app redirects successful auth to `/dashboard`.

## Local Development

Install dependencies:

```bash
npm install
```

Run checks:

```bash
npx tsc --noEmit
npm.cmd run lint
npm.cmd run build
```

Start the app only when you intend to run it locally:

```bash
npm run dev
```

## Vercel Deployment

1. Push the project to GitHub.
2. Import it in Vercel.
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
4. Add the production URL to Supabase Auth Site URL and Redirect URLs.
5. Deploy.

## Current MVP Limitations

- Billing is a demo UI; Stripe is intentionally not connected.
- Invitations are not implemented. Team members can be managed once they exist in `organization_members`.
- Client role is basic and organization-scoped.
- File previews use signed download URLs rather than an embedded previewer.
