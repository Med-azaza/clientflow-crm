# ClientFlow CRM

ClientFlow CRM is a polished mock SaaS dashboard for agencies and freelancers. It presents a realistic client portal and project management workspace using local mock data only.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Biome
- lucide-react icons

## Features

- Fixed desktop sidebar with mobile drawer navigation
- Dashboard metrics, action queue, team workload, and recent projects
- Client search, filtering, sorting, and demo client creation
- Project Kanban/List views, filters, and project detail tabs
- Task, invoice, file, message, and settings demo interactions
- Empty states, hover states, responsive cards, and scroll-safe tables
- Static/mock-data implementation ready for portfolio deployment

## Routes

- `/` redirects to `/dashboard`
- `/dashboard`
- `/clients`
- `/projects`
- `/projects/website-redesign`
- `/tasks`
- `/invoices`
- `/files`
- `/messages`
- `/settings`

## Local Development

Install dependencies:

```bash
npm install
```

Run checks:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

Run locally when needed:

```bash
npm run dev
```

## Deployment

This project is ready to deploy on Vercel as a standard Next.js app. No environment variables are required for the current portfolio demo.

## Demo Status

ClientFlow CRM intentionally uses mock data and local React state. Supabase, authentication, billing, and persistent backend workflows are not connected in this version.
