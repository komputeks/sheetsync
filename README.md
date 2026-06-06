# SheetSync

Turn Google Sheets into Professional Web Apps.

## Features
- Auto table view with pagination, sorting, and Rows Per Page selector
- Type-aware column sizing (images, currency, dates, links, etc.)
- Embeddable widgets (iframe + JS snippet)
- JSON & CSV API endpoints
- Google Sheets sync via Service Account
- Product tables with M-Pesa (Lipia) payments
- SEO-friendly public pages
- Admin dashboard with analytics & error logs
- PWA support with service worker
- Supabase Auth (email + Google sign-in)

## Tech Stack
- Next.js 16.2 App Router (src/ folder)
- React 19 + TypeScript 5.8
- Tailwind CSS v4 (CSS-first config)
- Supabase (Postgres + Auth + SSR)
- TanStack Table v8 + Virtual + Query
- Vercel deployment

## Getting Started
1. Clone the repo
2. `npm install`
3. Copy `.env.example` to `.env` and fill in credentials
4. `npm run dev`

## Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `LIPIA_API_KEY`
- `RESEND_API_KEY`
- `BREVO_API_KEY`
- `MAILGUN_API_KEY`

## Project Structure
```
src/
  app/            # Next.js App Router pages & API routes
  components/     # Reusable UI components
  config/         # Environment configuration
  hooks/          # Custom React hooks
  lib/            # Core libraries (Supabase clients, utils)
  providers/      # React context providers
  schemas/        # Zod validation schemas
  store/          # Zustand state stores
  types/          # TypeScript type definitions
  utils/          # Utility functions
```
