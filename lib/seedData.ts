import { NoiseSample } from "@/types";

// Seed samples around Waterloo, ON — representative noise conditions
// Based on known land-use: UW campus, uptown, parks, arterials
export const SEED_SAMPLES: NoiseSample[] = [
  // University of Waterloo — Ring Road (traffic, moderate)
  { id: "seed-1", latitude: 43.4723, longitude: -80.5449, timestamp: new Date("2025-09-10T08:30:00"), durationSeconds: 5, rms: 0.042, peak: 0.61, dbfs: -27.5, loudnessScore: 54, soundCategory: "traffic", userConfirmedCategory: true, createdAt: new Date("2025-09-10T08:30:00") },
  // Waterloo Park — quiet, nature
  { id: "seed-2", latitude: 43.4635, longitude: -80.5267, timestamp: new Date("2025-09-10T09:00:00"), durationSeconds: 10, rms: 0.009, peak: 0.14, dbfs: -40.9, loudnessScore: 32, soundCategory: "nature", userConfirmedCategory: true, createdAt: new Date("2025-09-10T09:00:00") },
  // Uptown Waterloo (King & Erb) — crowd, moderate-loud
  { id: "seed-3", latitude: 43.4516, longitude: -80.4985, timestamp: new Date("2025-09-10T12:15:00"), durationSeconds: 5, rms: 0.055, peak: 0.74, dbfs: -25.2, loudnessScore: 62, soundCategory: "crowd", userConfirmedCategory: true, createdAt: new Date("2025-09-10T12:15:00") },
  // Weber St N (major arterial) — traffic, loud
  { id: "seed-4", latitude: 43.4759, longitude: -80.5150, timestamp: new Date("2025-09-10T17:15:00"), durationSeconds: 10, rms: 0.078, peak: 0.92, dbfs: -22.2, loudnessScore: 79, soundCategory: "traffic", userConfirmedCategory: true, createdAt: new Date("2025-09-10T17:15:00") },
  // Columbia St W (near UW) — traffic, moderate
  { id: "seed-5", latitude: 43.4855, longitude: -80.5438, timestamp: new Date("2025-09-10T08:00:00"), durationSeconds: 5, rms: 0.038, peak: 0.54, dbfs: -28.4, loudnessScore: 50, soundCategory: "traffic", userConfirmedCategory: true, createdAt: new Date("2025-09-10T08:00:00") },
  // Silver Lake Park — quiet, nature
  { id: "seed-6", latitude: 43.4595, longitude: -80.5234, timestamp: new Date("2025-09-10T10:00:00"), durationSeconds: 10, rms: 0.007, peak: 0.10, dbfs: -43.1, loudnessScore: 28, soundCategory: "nature", userConfirmedCategory: true, createdAt: new Date("2025-09-10T10:00:00") },
  // Conestoga Mall area — traffic/crowd
  { id: "seed-7", latitude: 43.5009, longitude: -80.5311, timestamp: new Date("2025-09-10T14:30:00"), durationSeconds: 5, rms: 0.047, peak: 0.68, dbfs: -26.5, loudnessScore: 58, soundCategory: "crowd", userConfirmedCategory: true, createdAt: new Date("2025-09-10T14:30:00") },
  // UW Davis Centre — indoor, quiet
  { id: "seed-8", latitude: 43.4718, longitude: -80.5418, timestamp: new Date("2025-09-10T11:00:00"), durationSeconds: 5, rms: 0.012, peak: 0.19, dbfs: -38.4, loudnessScore: 35, soundCategory: "indoor", userConfirmedCategory: true, createdAt: new Date("2025-09-10T11:00:00") },
  // Erb St W construction zone
  { id: "seed-9", latitude: 43.4640, longitude: -80.5320, timestamp: new Date("2025-09-10T10:30:00"), durationSeconds: 10, rms: 0.091, peak: 0.99, dbfs: -20.8, loudnessScore: 86, soundCategory: "construction", userConfirmedCategory: true, createdAt: new Date("2025-09-10T10:30:00") },
  // Waterloo Rec Complex area — indoor
  { id: "seed-10", latitude: 43.4687, longitude: -80.5178, timestamp: new Date("2025-09-10T19:00:00"), durationSeconds: 5, rms: 0.021, peak: 0.33, dbfs: -33.5, loudnessScore: 44, soundCategory: "indoor", userConfirmedCategory: true, createdAt: new Date("2025-09-10T19:00:00") },
  // Laurel Creek Conservation Area — nature, very quiet
  { id: "seed-11", latitude: 43.4901, longitude: -80.5601, timestamp: new Date("2025-09-11T07:30:00"), durationSeconds: 10, rms: 0.005, peak: 0.08, dbfs: -46.0, loudnessScore: 23, soundCategory: "nature", userConfirmedCategory: true, createdAt: new Date("2025-09-11T07:30:00") },
  // King St N (ION LRT corridor) — traffic
  { id: "seed-12", latitude: 43.4781, longitude: -80.5100, timestamp: new Date("2025-09-11T08:45:00"), durationSeconds: 5, rms: 0.051, peak: 0.70, dbfs: -25.8, loudnessScore: 57, soundCategory: "traffic", userConfirmedCategory: true, createdAt: new Date("2025-09-11T08:45:00") },
  // Uptown square evening — music/crowd
  { id: "seed-13", latitude: 43.4526, longitude: -80.4978, timestamp: new Date("2025-09-11T20:00:00"), durationSeconds: 5, rms: 0.063, peak: 0.84, dbfs: -24.0, loudnessScore: 67, soundCategory: "music", userConfirmedCategory: true, createdAt: new Date("2025-09-11T20:00:00") },
  // UW Engineering buildings — quiet campus
  { id: "seed-14", latitude: 43.4706, longitude: -80.5396, timestamp: new Date("2025-09-11T14:00:00"), durationSeconds: 5, rms: 0.011, peak: 0.17, dbfs: -39.2, loudnessScore: 33, soundCategory: "quiet", userConfirmedCategory: true, createdAt: new Date("2025-09-11T14:00:00") },
  // Fischer-Hallman Rd (busy) — traffic, loud
  { id: "seed-15", latitude: 43.4560, longitude: -80.5540, timestamp: new Date("2025-09-11T17:30:00"), durationSeconds: 10, rms: 0.082, peak: 0.95, dbfs: -21.7, loudnessScore: 81, soundCategory: "traffic", userConfirmedCategory: true, createdAt: new Date("2025-09-11T17:30:00") },
  // Waterloo Spur trail — nature, quiet
  { id: "seed-16", latitude: 43.4670, longitude: -80.5390, timestamp: new Date("2025-09-12T09:15:00"), durationSeconds: 10, rms: 0.008, peak: 0.13, dbfs: -41.9, loudnessScore: 30, soundCategory: "nature", userConfirmedCategory: true, createdAt: new Date("2025-09-12T09:15:00") },
  // University Ave — moderate traffic
  { id: "seed-17", latitude: 43.4684, longitude: -80.5282, timestamp: new Date("2025-09-12T12:00:00"), durationSeconds: 5, rms: 0.035, peak: 0.50, dbfs: -29.1, loudnessScore: 48, soundCategory: "traffic", userConfirmedCategory: true, createdAt: new Date("2025-09-12T12:00:00") },
  // Kitchener-Waterloo border (Bridgeport) — traffic
  { id: "seed-18", latitude: 43.4430, longitude: -80.4930, timestamp: new Date("2025-09-12T16:00:00"), durationSeconds: 5, rms: 0.059, peak: 0.80, dbfs: -24.6, loudnessScore: 65, soundCategory: "traffic", userConfirmedCategory: true, createdAt: new Date("2025-09-12T16:00:00") },
  // Northdale neighborhood — quiet residential
  { id: "seed-19", latitude: 43.4790, longitude: -80.5330, timestamp: new Date("2025-09-12T22:00:00"), durationSeconds: 10, rms: 0.006, peak: 0.09, dbfs: -44.4, loudnessScore: 26, soundCategory: "quiet", userConfirmedCategory: true, createdAt: new Date("2025-09-12T22:00:00") },
  // UW PAC (athletics) — crowd
  { id: "seed-20", latitude: 43.4745, longitude: -80.5480, timestamp: new Date("2025-09-13T18:00:00"), durationSeconds: 5, rms: 0.044, peak: 0.62, dbfs: -27.1, loudnessScore: 55, soundCategory: "crowd", userConfirmedCategory: true, createdAt: new Date("2025-09-13T18:00:00") },
];
