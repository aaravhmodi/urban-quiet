create table noise_samples (
  id uuid primary key default gen_random_uuid(),
  latitude double precision not null,
  longitude double precision not null,
  timestamp timestamptz not null default now(),
  duration_seconds int not null,
  rms double precision not null,
  peak double precision not null,
  dbfs double precision not null,
  loudness_score double precision not null,
  sound_category text not null,
  user_confirmed_category boolean default true,
  note text,
  created_at timestamptz default now()
);

alter table noise_samples enable row level security;
create policy "Anyone can read samples" on noise_samples for select using (true);
create policy "Anyone can insert samples" on noise_samples for insert with check (true);
