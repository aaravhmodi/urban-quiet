"use client";

import { useState } from "react";
import { SoundCategory } from "@/types";

const ALL_CATEGORIES: SoundCategory[] = [
  "traffic", "construction", "siren", "crowd", "music",
  "nature", "indoor", "quiet", "unknown",
];

const CATEGORY_LABELS: Record<SoundCategory, string> = {
  traffic: "Traffic",
  construction: "Construction",
  siren: "Siren",
  crowd: "Crowd",
  music: "Music",
  nature: "Nature",
  indoor: "Indoor",
  quiet: "Quiet",
  unknown: "Unknown",
};

export type TimeOfDay = "all" | "morning" | "afternoon" | "evening" | "night";
export type ZoneTypeFilter = "all" | "quiet" | "moderate" | "noisy";

export interface FilterState {
  categories: SoundCategory[];
  loudnessMin: number;
  loudnessMax: number;
  timeOfDay: TimeOfDay;
  zoneType: ZoneTypeFilter;
}

interface MapFiltersProps {
  filters: FilterState;
  setFilters: (f: FilterState) => void;
}

export function defaultFilters(): FilterState {
  return {
    categories: [...ALL_CATEGORIES],
    loudnessMin: 0,
    loudnessMax: 100,
    timeOfDay: "all",
    zoneType: "all",
  };
}

export default function MapFilters({ filters, setFilters }: MapFiltersProps) {
  const [open, setOpen] = useState(false);

  function toggleCategory(cat: SoundCategory) {
    const has = filters.categories.includes(cat);
    setFilters({
      ...filters,
      categories: has
        ? filters.categories.filter((c) => c !== cat)
        : [...filters.categories, cat],
    });
  }

  const panel = (
    <div className="flex flex-col gap-4 p-4 bg-slate-800 rounded-xl">
      <div>
        <div className="text-xs uppercase text-slate-400 font-semibold mb-2">Categories</div>
        <div className="grid grid-cols-3 gap-1">
          {ALL_CATEGORIES.map((cat) => (
            <label key={cat} className="flex items-center gap-1.5 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={filters.categories.includes(cat)}
                onChange={() => toggleCategory(cat)}
                className="accent-blue-500"
              />
              <span className="text-slate-300">{CATEGORY_LABELS[cat]}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <div className="text-xs uppercase text-slate-400 font-semibold mb-2">
          Loudness Range ({filters.loudnessMin}–{filters.loudnessMax})
        </div>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            min={0}
            max={100}
            value={filters.loudnessMin}
            onChange={(e) =>
              setFilters({ ...filters, loudnessMin: Number(e.target.value) })
            }
            className="w-16 bg-slate-700 text-white rounded px-2 py-1 text-sm"
          />
          <span className="text-slate-500">to</span>
          <input
            type="number"
            min={0}
            max={100}
            value={filters.loudnessMax}
            onChange={(e) =>
              setFilters({ ...filters, loudnessMax: Number(e.target.value) })
            }
            className="w-16 bg-slate-700 text-white rounded px-2 py-1 text-sm"
          />
        </div>
      </div>

      <div>
        <div className="text-xs uppercase text-slate-400 font-semibold mb-2">Time of Day</div>
        <div className="flex flex-wrap gap-1">
          {(["all", "morning", "afternoon", "evening", "night"] as TimeOfDay[]).map((t) => (
            <button
              key={t}
              onClick={() => setFilters({ ...filters, timeOfDay: t })}
              className={`px-2 py-1 rounded text-xs capitalize min-h-[32px] ${
                filters.timeOfDay === t
                  ? "bg-blue-600 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-xs uppercase text-slate-400 font-semibold mb-2">Zone Type</div>
        <div className="flex gap-1">
          {(["all", "quiet", "moderate", "noisy"] as ZoneTypeFilter[]).map((z) => (
            <button
              key={z}
              onClick={() => setFilters({ ...filters, zoneType: z })}
              className={`px-2 py-1 rounded text-xs capitalize min-h-[32px] ${
                filters.zoneType === z
                  ? "bg-blue-600 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              {z}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <div className="lg:hidden">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-4 py-3 bg-slate-800 rounded-xl text-sm text-white min-h-[44px]"
        >
          <span>Filters</span>
          <span>{open ? "▲" : "▼"}</span>
        </button>
        {open && <div className="mt-2">{panel}</div>}
      </div>

      {/* Desktop always visible */}
      <div className="hidden lg:block">{panel}</div>
    </>
  );
}
