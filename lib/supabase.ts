import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { NoiseSample, SoundCategory } from "@/types";

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase credentials not configured. Copy .env.local.example to .env.local and fill in your values."
    );
  }
  _client = createClient(url, key);
  return _client;
}

export async function submitSample(
  sample: Omit<NoiseSample, "id" | "createdAt">
): Promise<void> {
  const { error } = await getClient()
    .from("noise_samples")
    .insert({
      latitude: sample.latitude,
      longitude: sample.longitude,
      timestamp: sample.timestamp.toISOString(),
      duration_seconds: sample.durationSeconds,
      rms: sample.rms,
      peak: sample.peak,
      dbfs: sample.dbfs,
      loudness_score: sample.loudnessScore,
      sound_category: sample.soundCategory,
      user_confirmed_category: sample.userConfirmedCategory,
      note: sample.note ?? null,
    });
  if (error) throw new Error(error.message);
}

export async function getSamples(): Promise<NoiseSample[]> {
  const { data, error } = await getClient()
    .from("noise_samples")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((row: any) => ({
    id: row.id,
    latitude: row.latitude,
    longitude: row.longitude,
    timestamp: new Date(row.timestamp),
    durationSeconds: row.duration_seconds,
    rms: row.rms,
    peak: row.peak,
    dbfs: row.dbfs,
    loudnessScore: row.loudness_score,
    soundCategory: row.sound_category as SoundCategory,
    userConfirmedCategory: row.user_confirmed_category,
    note: row.note ?? undefined,
    createdAt: new Date(row.created_at),
  }));
}
