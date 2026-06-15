"use client";

import { useState } from "react";
import { SoundCategory } from "@/types";

const ALL_CATEGORIES: SoundCategory[] = [
  "traffic", "construction", "siren", "crowd", "music",
  "nature", "indoor", "quiet", "unknown",
];

const CATEGORY_LABELS: Record<SoundCategory, string> = {
  traffic: "Traffic", construction: "Construction", siren: "Siren",
  crowd: "Crowd", music: "Music", nature: "Nature",
  indoor: "Indoor", quiet: "Quiet", unknown: "Unknown",
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
  return { categories: [...ALL_CATEGORIES], loudnessMin: 0, loudnessMax: 100, timeOfDay: "all", zoneType: "all" };
}

function FilterLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-medium text-[oklch(0.48_0.008_248)] uppercase tracking-wider mb-2">
      {children}
    </div>
  );
}

function ChipButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-[12px] font-medium capitalize min-h-[32px] transition-colors ${
        active
          ? "bg-[oklch(0.56_0.12_188)] text-white"
          : "bg-[oklch(0.94_0.004_248)] text-[oklch(0.30_0.008_248)] hover:bg-[oklch(0.88_0.004_248)]"
      }`}
    >
      {children}
    </button>
  );
}

export default function MapFilters({ filters, setFilters }: MapFiltersProps) {
  const [open, setOpen] = useState(false);

  function toggleCategory(cat: SoundCategory) {
    const has = filters.categories.includes(cat);
    setFilters({
      ...filters,
      categories: has ? filters.categories.filter((c) => c !== cat) : [...filters.categories, cat],
    });
  }

  const panel = (
    <div className="flex flex-col gap-5">
      <div>
        <FilterLabel>Categories</FilterLabel>
        <div className="grid grid-cols-3 gap-1.5">
          {ALL_CATEGORIES.map((cat) => {
            const active = filters.categories.includes(cat);
            return (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`py-1.5 px-2 rounded-[8px] text-[12px] font-medium capitalize transition-colors min-h-[36px] ${
                  active
                    ? "bg-[oklch(0.56_0.12_188/0.12)] text-[oklch(0.40_0.12_188)] border border-[oklch(0.56_0.12_188/0.3)]"
                    : "bg-[oklch(0.94_0.004_248)] text-[oklch(0.48_0.008_248)] border border-transparent"
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <FilterLabel>Loudness ({filters.loudnessMin}–{filters.loudnessMax})</FilterLabel>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            min={0}
            max={100}
            value={filters.loudnessMin}
            onChange={(e) => setFilters({ ...filters, loudnessMin: Number(e.target.value) })}
            className="w-16 bg-[oklch(0.94_0.004_248)] text-[oklch(0.12_0.006_248)] rounded-[8px] px-2 py-1.5 text-[13px] border border-[oklch(0.88_0.004_248)] outline-none focus:ring-2 focus:ring-[oklch(0.56_0.12_188/0.3)]"
          />
          <span className="text-[12px] text-[oklch(0.62_0.006_248)]">to</span>
          <input
            type="number"
            min={0}
            max={100}
            value={filters.loudnessMax}
            onChange={(e) => setFilters({ ...filters, loudnessMax: Number(e.target.value) })}
            className="w-16 bg-[oklch(0.94_0.004_248)] text-[oklch(0.12_0.006_248)] rounded-[8px] px-2 py-1.5 text-[13px] border border-[oklch(0.88_0.004_248)] outline-none focus:ring-2 focus:ring-[oklch(0.56_0.12_188/0.3)]"
          />
        </div>
      </div>

      <div>
        <FilterLabel>Time of Day</FilterLabel>
        <div className="flex flex-wrap gap-1.5">
          {(["all", "morning", "afternoon", "evening", "night"] as TimeOfDay[]).map((t) => (
            <ChipButton key={t} active={filters.timeOfDay === t} onClick={() => setFilters({ ...filters, timeOfDay: t })}>
              {t}
            </ChipButton>
          ))}
        </div>
      </div>

      <div>
        <FilterLabel>Zone Type</FilterLabel>
        <div className="flex flex-wrap gap-1.5">
          {(["all", "quiet", "moderate", "noisy"] as ZoneTypeFilter[]).map((z) => (
            <ChipButton key={z} active={filters.zoneType === z} onClick={() => setFilters({ ...filters, zoneType: z })}>
              {z}
            </ChipButton>
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
          className="w-full flex items-center justify-between px-4 py-3 bg-[oklch(0.94_0.004_248)] rounded-[12px] text-[14px] text-[oklch(0.30_0.008_248)] font-medium min-h-[44px]"
        >
          <span>Filters</span>
          <svg
            width="12"
            height="8"
            viewBox="0 0 12 8"
            fill="none"
            aria-hidden="true"
            style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
          >
            <path d="M1 1l5 5 5-5" stroke="oklch(0.48 0.008 248)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {open && <div className="mt-3">{panel}</div>}
      </div>

      {/* Desktop */}
      <div className="hidden lg:block">{panel}</div>
    </>
  );
}
