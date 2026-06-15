"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { getSamples } from "@/lib/supabase";
import { computeZones } from "@/lib/zones";
import { NoiseSample, NoiseZone } from "@/types";
import MapFilters, {
  FilterState,
  defaultFilters,
  TimeOfDay,
} from "@/components/map/MapFilters";

const NoiseMap = dynamic(() => import("@/components/map/NoiseMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-400">
      Loading map...
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
      .then(setSamples)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredSamples = useMemo(() => {
    return samples.filter((s) => {
      if (!filters.categories.includes(s.soundCategory)) return false;
      if (s.loudnessScore < filters.loudnessMin || s.loudnessScore > filters.loudnessMax)
        return false;
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
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-56px)]">
      {/* Sidebar — desktop */}
      <div className="lg:w-72 lg:overflow-y-auto lg:border-r lg:border-slate-800 p-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-semibold">Noise Map</h2>
          <span className="text-xs text-slate-400">{filteredSamples.length} samples</span>
        </div>

        {loading && (
          <div className="text-slate-400 text-sm py-4">Loading samples...</div>
        )}
        {error && (
          <div className="text-red-400 text-sm py-2">{error}</div>
        )}

        <MapFilters filters={filters} setFilters={setFilters} />
      </div>

      {/* Map area */}
      <div className="flex-1 relative min-h-[60vh] lg:min-h-0">
        <NoiseMap samples={filteredSamples} zones={zones} />

        {/* FAB */}
        <Link
          href="/record"
          className="absolute bottom-6 right-6 z-[999] w-14 h-14 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center text-white text-2xl shadow-xl transition-colors"
          aria-label="Add recording"
        >
          +
        </Link>
      </div>
    </div>
  );
}
