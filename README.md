# UrbanQuiet

**Map the silence. Find your quiet.**

A crowdsourced city noise mapping app. Record a short ambient audio sample anywhere in the city, and it appears on a live interactive map — classified, loudness-scored, and pinned to your location. Browse quiet zones, noisy corridors, and trends over time.

Live: [urban-quiet.vercel.app](https://urban-quiet.vercel.app)

---

## What it does

1. **Record** — Press record on your phone. The app captures 5–10 seconds of ambient sound using your microphone.
2. **Analyze** — Loudness is estimated in-browser (RMS amplitude → dBFS → 0–100 score). No audio is ever uploaded.
3. **Classify** — Google's YAMNet model (via TensorFlow.js) runs locally in the browser and suggests a sound category: traffic, construction, nature, crowd, music, siren, indoor, quiet, or unknown. You confirm or override.
4. **Locate** — GPS coordinates are captured via the browser Geolocation API. If GPS is denied, you can manually drop a pin on a map.
5. **Submit** — Only the computed features (loudness score, category, coordinates, timestamp) are saved. Raw audio is never stored.
6. **Explore** — All samples appear on a live Leaflet map. Filter by category, loudness, time of day, and zone type. Quiet and noisy zones are computed automatically from clusters of nearby samples.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Map | Leaflet + react-leaflet (CARTO light tiles) |
| Audio | Web Audio API + MediaRecorder API |
| AI classification | TensorFlow.js + YAMNet (in-browser, no server) |
| Database | Supabase (PostgreSQL + Row Level Security) |
| Deployment | Vercel |

---

## Features

- Mobile-first, works in Safari and Chrome on iOS/Android
- In-browser AI audio classification — no API key, no server round-trip
- Time-of-day noise baseline — shows expected loudness for the current hour before you record
- Quiet zone detection — grid-based clustering (0.01° cells, min 3 samples) with moderate/quiet/noisy labels
- Seed data pre-populated around Waterloo, ON so the map isn't empty on first load
- Manual location pin fallback when GPS is denied
- No raw audio stored at any point — privacy by design
- Insights page with category breakdown and 24-hour loudness histogram

---

## Local development

```bash
git clone https://github.com/aaravhmodi/urban-quiet
cd urban-quiet
npm install
```

Copy the env file and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Run the database migration in your Supabase SQL Editor (`supabase/migrations/001_noise_samples.sql`), then:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Database schema

```sql
create table noise_samples (
  id                      uuid primary key default gen_random_uuid(),
  latitude                double precision not null,
  longitude               double precision not null,
  timestamp               timestamptz not null default now(),
  duration_seconds        int not null,
  rms                     double precision not null,
  peak                    double precision not null,
  dbfs                    double precision not null,
  loudness_score          double precision not null,
  sound_category          text not null,
  user_confirmed_category boolean default true,
  note                    text,
  created_at              timestamptz default now()
);
```

Row Level Security is enabled. Anyone can read and insert — no auth required for MVP.

---

## Loudness scoring

Loudness is estimated from the raw audio waveform entirely in the browser:

```
RMS amplitude → dBFS = 20 × log10(RMS) → loudnessScore = clamp((dBFS + 60) / 60 × 100, 0, 100)
```

This is a relative estimate, not a calibrated decibel reading. Results vary by device microphone sensitivity.

---

## Privacy

- Microphone is accessed only when the user presses Record
- Raw audio is never uploaded or stored
- Only computed features are saved: loudness score, category, approximate coordinates, and timestamp
- No user accounts or identifying information in MVP
- GPS coordinates are stored as-is; consider rounding to ~100m precision for higher-privacy deployments

---

## Project structure

```
/app
  page.tsx          — Landing page with how-it-works
  /record           — 3-step recording flow
  /map              — Live noise map with filters
  /insights         — Aggregate stats and charts
/components
  /audio            — RecordButton, WaveformDisplay, CategorySelector
  /map              — NoiseMap, MapFilters, LocationPicker
/lib
  audio.ts          — MediaRecorder wrapper
  loudness.ts       — Web Audio API analysis
  geolocation.ts    — GPS wrapper
  supabase.ts       — DB client, submitSample, getSamples
  zones.ts          — Quiet zone clustering algorithm
  yamnet.ts         — TensorFlow.js + YAMNet classification
  seedData.ts       — 20 pre-populated Waterloo, ON samples
  timeBaseline.ts   — Hour-by-hour expected loudness baselines
/types
  index.ts          — NoiseSample, NoiseZone, LoudnessResult types
/supabase
  /migrations       — SQL migration files
```

---

Built by [Aarav Modi](https://github.com/aaravhmodi) · Systems Design Engineering, University of Waterloo
