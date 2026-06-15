export type SoundCategory =
  | "traffic"
  | "construction"
  | "siren"
  | "crowd"
  | "music"
  | "nature"
  | "indoor"
  | "quiet"
  | "unknown";

export interface NoiseSample {
  id: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
  durationSeconds: number;
  rms: number;
  peak: number;
  dbfs: number;
  loudnessScore: number;
  soundCategory: SoundCategory;
  userConfirmedCategory: boolean;
  note?: string;
  createdAt: Date;
}

export interface NoiseZone {
  cellId: string;
  centerLatitude: number;
  centerLongitude: number;
  avgLoudnessScore: number;
  sampleCount: number;
  topCategories: string[];
  zoneType: "quiet" | "moderate" | "noisy";
}

export interface LoudnessResult {
  rms: number;
  peak: number;
  dbfs: number;
  loudnessScore: number;
}
