"use client";

import { SoundCategory } from "@/types";

interface CategorySelectorProps {
  selected: SoundCategory | null;
  onChange: (cat: SoundCategory) => void;
}

const CATEGORIES: { value: SoundCategory; emoji: string; label: string }[] = [
  { value: "traffic", emoji: "🚗", label: "Traffic" },
  { value: "construction", emoji: "🏗️", label: "Construction" },
  { value: "siren", emoji: "🚨", label: "Siren" },
  { value: "crowd", emoji: "👥", label: "Crowd" },
  { value: "music", emoji: "🎵", label: "Music" },
  { value: "nature", emoji: "🌿", label: "Nature" },
  { value: "indoor", emoji: "🏠", label: "Indoor" },
  { value: "quiet", emoji: "🤫", label: "Quiet" },
  { value: "unknown", emoji: "❓", label: "Unknown" },
];

export default function CategorySelector({
  selected,
  onChange,
}: CategorySelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {CATEGORIES.map((cat) => {
        const isSelected = selected === cat.value;
        return (
          <button
            key={cat.value}
            onClick={() => onChange(cat.value)}
            className={`
              flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-xl
              border-2 transition-all min-h-[72px] text-center
              ${
                isSelected
                  ? "border-blue-500 bg-blue-500/20 text-white"
                  : "border-slate-600 bg-slate-800 text-slate-300 hover:border-slate-400"
              }
            `}
          >
            <span className="text-2xl" role="img" aria-label={cat.label}>
              {cat.emoji}
            </span>
            <span className="text-xs font-medium">{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}
