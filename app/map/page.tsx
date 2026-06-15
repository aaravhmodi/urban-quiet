"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { getSamples } from "@/lib/supabase";
import { computeZones } from "@/lib/zones";
import { SEED_SAMPLES } from "@/lib/seedData";
import { NoiseSample, NoiseZone } from "@/types";
import MapFilters, {
  FilterState,
  defaultFilters,
  TimeOfDay,
} from "@/components/map/MapFilters";

const NoiseMap = dynamic(() => import("@/components/map/NoiseMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[oklch(0.962_0.003_248)] text-[oklch(0.62_0.006_248)] text-[15px]">
      Loading map…
    </div>
  ),
});

function getHour(d: Date): number {
  return new Date(d).getHours();
}

function matchesTimeOfDay(sample: NoiseSample, tod: TimeOfDay): boolean {
  if (tod === "all") return true;
  const h = getHour(sample.timestamp);
  if (tod === "morning") return h >= 6 && h < 12;
  if (tod === "afternoon") return h >= 12 && h < 17;
  if (tod === "evening") return h >= 17 && h < 21;
  if (tod === "night") return h >= 21 || h < 6;
  return true;
}

export default function MapPage() {
  const [samples, setSamples] = useState<NoiseSample[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(defaultFilters());

  useEffect(() => {
    getSamples()
      .then((live) => setSamples([...SEED_SAMPLES, ...live]))
      .catch(() => setSamples(SEED_SAMPLES)) // fall back to seed data if DB unavailable
      .finally(() => setLoading(false));
  }, []);

  const filteredSamples = useMemo(() => {
    return samples.filter((s) => {
      if (!filters.categories.includes(s.soundCategory)) return false;
      if (s.loudnessScore < filters.loudnessMin || s.loudnessScore > filters.loudnessMax) return false;
      if (!matchesTimeOfDay(s, filters.timeOfDay)) return false;
      return true;
    });
  }, [samples, filters]);

  const zones = useMemo(() => {
    const allZones = computeZones(filteredSamples);
    if (filters.zoneType === "all") return allZones;
    return allZones.filter((z) => z.zoneType === filters.zoneType);
  }, [filteredSamples, filters.zoneType]);

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-48px)]">
      {/* Sidebar */}
      <div className="lg:w-72 lg:overflow-y-auto border-b lg:border-b-0 lg:border-r border-[oklch(0.88_0.004_248)] bg-white p-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[17px] font-semibold text-[oklch(0.12_0.006_248)]">Noise Map</h2>
          <span className="text-[13px] text-[oklch(0.62_0.006_248)]">
            {loading ? "Loading…" : `${filteredSamples.length} samples`}
          </span>
        </div>

        {error && (
          <div className="text-[oklch(0.46_0.22_25)] text-[13px] mb-3 bg-[oklch(0.97_0.01_25)] border border-[oklch(0.85_0.06_25)] rounded-[10px] px-3 py-2">
            {error}
          </div>
        )}

        <MapFilters filters={filters} setFilters={setFilters} />
      </div>

      {/* Map area */}
      <div className="flex-1 relative min-h-[60vh] lg:min-h-0">
        <NoiseMap samples={filteredSamples} zones={zones} />

        {/* FAB */}
        <Link
          href="/record"
          className="absolute bottom-6 right-6 z-[999] w-14 h-14 rounded-full flex items-center justify-center text-white text-3xl shadow-lg shadow-[oklch(0.56_0.12_188/0.35)] transition-opacity active:opacity-80"
          style={{ background: "oklch(0.56 0.12 188)" }}
          aria-label="Add recording"
        >
          +
        </Link>
      </div>
    </div>
  );
}
