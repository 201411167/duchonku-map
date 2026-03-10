# Duchonku Map

A map-based pin management web application centered on Seoul, Korea.

## Architecture

- **Frontend**: React + TypeScript + Vite (client/)
- **Backend**: Express.js (server/) — serves config endpoint and static files
- **Database/Auth**: Supabase (external — https://jhuvztomhjeebqygxddq.supabase.co)
- **Maps**: Google Maps JavaScript API via @react-google-maps/api
- **Styling**: Tailwind CSS + shadcn/ui components

## Key Features

- Google Maps with Seoul center (lat: 37.5665, lng: 126.9780)
- All pins from Supabase displayed as category-colored markers
- Click marker → slide-in detail panel (name, description, category, coords)
- Admin panel at /admin for creating and deleting pins
- Supabase Auth: email/password + Google OAuth
- Admin role detection via users → roles table relationship
- Dark/light theme toggle (localStorage key: ww-app-theme)

## Pages

- `/` — Home map view
- `/login` — Login (email + Google OAuth)
- `/admin` — Admin pin management (admin role required)

## Environment Variables / Secrets

- `SUPABASE_ANON_KEY` — Supabase anon key (secret)
- `GOOGLE_MAPS_API_KEY` — Google Maps API key (secret)
- `VITE_SUPABASE_URL` — Supabase project URL (env var, shared)

Config is served via `/api/config` to expose keys to the frontend securely.

## Data Model (Supabase tables)

- `pins` — id, name, description, lat, lng, category, image_url, created_by, created_at
- `users` — id, email, full_name, role_id
- `roles` — id, name (e.g. 'admin')

## Dependencies

Notable packages:
- @supabase/supabase-js
- @react-google-maps/api
- @tanstack/react-query
- wouter (routing)
- react-hook-form + zod
- shadcn/ui components
