# MyJobSolution — client site

Public website for MyJobSolution, a recruitment and manpower consultancy in
Khalilabad, Sant Kabir Nagar. Next.js 16 (App Router), Tailwind CSS 4, Clerk
for sign-in, Supabase for data.

## Run locally

```bash
cp .env.example .env.local   # fill in Clerk and Supabase keys
pnpm install
pnpm dev                     # http://localhost:3000
```

Without Supabase keys the site still runs; job lists show their empty state.

## Where things are

| Path | What |
|---|---|
| `app/(site)/` | Pages: `/`, `/jobs`, `/jobs/[id]`, `/applied`, `/profile`, `/about`, `/contact`, sign-in/up |
| `app/api/` | Route handlers for jobs, profile, applications, contact |
| `components/ui/` | Design-system pieces: buttons, fields, icons, logo |
| `components/site/` | Header, footer, shared state (`site-provider`), forms |
| `components/jobs/` | Job row, jobs browser with filters, apply panel |
| `lib/i18n.ts` | All UI copy, in English and Hindi |
| `lib/site.ts` | Phone, WhatsApp, email, address |
| `app/globals.css` | Colour and font tokens (taken from the logo) |
| `public/logo.png` | Logo used in header and footer; `app/icon.png` is the favicon |

Team photos: put files in `public/team/` and list them in `TEAM_PHOTOS` in
`app/(site)/about/page.tsx`.
