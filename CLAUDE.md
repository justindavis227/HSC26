# High School Camp 2026 — PWA

Southeast Christian Church HS Camp 2026 companion app. Installable PWA for iPhone and desktop.

## Stack

- **React 18** + **TypeScript** — component framework
- **React Router 7** — client-side routing (browser router, nested under `DashboardLayout`)
- **Tailwind CSS v4** — utility-first CSS via `@tailwindcss/vite` plugin (no `tailwind.config.js`)
- **shadcn/ui** — hand-copied Radix UI component wrappers in `src/app/components/ui/`
- **vite-plugin-pwa** — PWA manifest + Workbox service worker (auto-generated on build)
- **Supabase** — backend for admin panel; client in `src/lib/supabase.ts`
- **Vercel** — deployment target

## Project Structure

```
src/
  app/
    App.tsx                 # RouterProvider + ThemeProvider
    routes.tsx              # All routes + navigationItems array
    components/
      ui/                   # shadcn/ui primitives (button, card, dialog, tabs, accordion, input)
      dashboard-layout.tsx  # Sidebar + mobile header shell
      weather-widget.tsx    # Open-Meteo API weather card
      password-modal.tsx    # Secret-page unlock modal
    context/
      theme-context.tsx     # Light/dark mode via localStorage
    data/
      camp-data.ts          # ALL editable camp content lives here (announcements, schedules, etc.)
      campus-schedules.ts   # Re-exports schedule slices by campus name
    pages/                  # One file per route
    utils/
      announcement-tracker.ts  # localStorage read-tracking for badge counts
  lib/
    supabase.ts             # Supabase client + TypeScript types
  styles/
    index.css               # Entry: imports tailwind + theme + globals
    theme.css               # CSS custom properties (primary color #38B6FF, dark mode)
    globals.css             # Base typography overrides
supabase/
  migrations/
    001_initial_schema.sql  # announcements + camp_info tables with RLS
public/
  icons/                    # PWA icons — add icon-192.png and icon-512.png here
  images/
    speakers/               # Speaker headshots (referenced by campData.speakers[].image)
    seating-charts/         # Seating chart images
    next-steps/             # Decision guide step images
```

## Getting Started

```bash
npm install
cp .env.example .env      # fill in Supabase URL + anon key
npm run dev
```

## Updating Camp Content

**All content lives in `src/app/data/camp-data.ts`** — edit it directly.

- **Announcements**: add to `campData.announcements` array with `{ id, date, title, content, priority }`
- **Schedules**: update `campData.schedules["CampusName"]` arrays
- **Contacts**: edit `campData.contacts`
- **FAQ**: edit `campData.faqs`
- **Speakers**: edit `campData.speakers` — add headshot images to `public/images/speakers/`
- **Campuses**: edit `campData.campuses` (name, description, dining, address, smallGroupZones, contact)
- **Sessions**: edit `campData.sessions`

## Image Assets

Add these to `public/` before deploying:

| Path | Purpose |
|------|---------|
| `public/icons/icon-192.png` | PWA icon (required) |
| `public/icons/icon-512.png` | PWA splash icon (required) |
| `public/images/speakers/*.jpg` | Speaker headshots |
| `public/images/seating-charts/*.png` | Seating chart images → update `seating-chart.tsx` |
| `public/Baptism_Guide.pdf` | PDF linked from Decision Guide |

## Theme & Colors

Primary: `#38B6FF` (light blue). Change in `src/styles/theme.css` → `--primary`.
Dark mode: toggled by adding `.dark` class to `<html>`. Stored in `localStorage`.

## Admin Panel (Supabase)

The Supabase schema is in `supabase/migrations/001_initial_schema.sql`.
Tables: `announcements`, `camp_info` (key/value).
RLS: public reads, authenticated writes.

To wire up live Supabase data instead of the static `camp-data.ts` file:
1. Run the migration in your Supabase project
2. Seed data from `camp-data.ts`
3. Replace page-level `campData.x` reads with `supabase.from('x').select()`

## Deployment

```bash
npm run build     # outputs to dist/
vercel --prod     # or push to GitHub and connect in Vercel dashboard
```

Vercel config: none required — Vite SPA routing needs `vercel.json`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

## PWA / iPhone

- `vite-plugin-pwa` generates manifest + service worker on build
- `index.html` has all iOS meta tags (`apple-mobile-web-app-capable`, `apple-touch-icon`)
- Add icons to `public/icons/` for full install experience
- `viewport-fit=cover` handles iPhone notch safely

## Schedule Day Labels — NEVER CHANGE

Schedule items in the `schedule_items` Supabase table **always use generic day names**: `Monday`, `Tuesday`, `Wednesday`, `Thursday`, `Friday`. Never use specific dates (e.g. "Mon Jun 29") as the `day` field value. Actual calendar dates are stored separately in `camp_info` as `camp_start_date` / `camp_end_date` and are computed at render time in `schedule.tsx`. This convention must be preserved in all future imports, seeds, and migrations.

## Secret Page

Password: `JeFFerSON` (9 chars). Change in `src/app/components/password-modal.tsx` → `CORRECT_PASSWORD`.
