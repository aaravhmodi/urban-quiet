"use client";

import { SoundCategory } from "@/types";

interface CategorySelectorProps {
  selected: SoundCategory | null;
  onChange: (cat: SoundCategory) => void;
}

const CATEGORIES: { value: SoundCategory; label: string }[] = [
  { value: "traffic", label: "Traffic" },
  { value: "construction", label: "Construction" },
  { value: "siren", label: "Siren" },
  { value: "crowd", label: "Crowd" },
  { value: "music", label: "Music" },
  { value: "nature", label: "Nature" },
  { value: "indoor", label: "Indoor" },
  { value: "quiet", label: "Quiet" },
  { value: "unknown", label: "Unknown" },
];

export default function CategorySelector({ selected, onChange }: CategorySelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {CATEGORIES.map((cat) => {
        const isSelected = selected === cat.value;
        return (
          <button
            key={cat.value}
            onClick={() => onChange(cat.value)}
            className={`
              flex items-center justify-center py-3 px-2 rounded-xl
              border transition-all min-h-[48px] text-center text-[14px] font-medium
              ${
                isSelected
                  ? "border-[oklch(0.56_0.12_188)] bg-[oklch(0.56_0.12_188/0.1)] text-[oklch(0.40_0.12_188)]"
                  : "border-[oklch(0.88_0.004_248)] bg-white text-[oklch(0.30_0.008_248)] hover:border-[oklch(0.70_0.008_248)] hover:bg-[oklch(0.97_0.004_248)]"
              }
            `}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
