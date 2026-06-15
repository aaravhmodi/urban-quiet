"use client";

import { LoudnessResult } from "@/types";

interface WaveformDisplayProps {
  isRecording: boolean;
  loudnessResult?: LoudnessResult;
}

const BAR_COUNT = 24;

export default function WaveformDisplay({ isRecording, loudnessResult }: WaveformDisplayProps) {
  if (!isRecording && !loudnessResult) return null;

  if (isRecording) {
    return (
      <div className="flex items-center justify-center gap-[3px] h-16 px-4">
        {Array.from({ length: BAR_COUNT }).map((_, i) => (
          <div
            key={i}
            className="w-[3px] rounded-full bg-[oklch(0.56_0.22_25)]"
            style={{
              height: "100%",
              transformOrigin: "center",
              transform: "scaleY(0.25)",
              animation: `waveBar ${0.5 + (i % 5) * 0.1}s ease-in-out infinite alternate`,
              animationDelay: `${i * 0.04}s`,
            }}
          />
        ))}
      </div>
    );
  }

  if (loudnessResult) {
    const score = Math.round(loudnessResult.loudnessScore);
    const isQuiet = score < 35;
    const isModerate = score >= 35 && score <= 65;
    const barColor = isQuiet
      ? "oklch(0.58 0.14 152)"
      : isModerate
      ? "oklch(0.72 0.17 72)"
      : "oklch(0.56 0.22 25)";
    const label = isQuiet ? "Quiet" : isModerate ? "Moderate" : "Loud";
    const labelColor = isQuiet
      ? "text-[oklch(0.46_0.14_152)]"
      : isModerate
      ? "text-[oklch(0.55_0.17_72)]"
      : "text-[oklch(0.46_0.22_25)]";

    return (
      <div className="flex flex-col gap-4 w-full">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-[13px] text-[oklch(0.48_0.008_248)]">Estimated loudness</span>
            <span className="ml-2 text-[22px] font-semibold text-[oklch(0.12_0.006_248)] leading-none">{score}</span>
            <span className="text-[13px] text-[oklch(0.48_0.008_248)]">/100</span>
          </div>
          <span className={`text-[13px] font-medium ${labelColor}`}>{label}</span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-[oklch(0.88_0.004_248)] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${score}%`, background: barColor }}
          />
        </div>

        {/* Metadata row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "RMS", value: loudnessResult.rms.toFixed(4) },
            { label: "Peak", value: loudnessResult.peak.toFixed(4) },
            { label: "dBFS", value: loudnessResult.dbfs.toFixed(1) },
          ].map(({ label, value }) => (
            <div key={label} className="bg-[oklch(0.94_0.004_248)] rounded-xl p-3 text-center">
              <div className="text-[11px] text-[oklch(0.48_0.008_248)] uppercase tracking-wider mb-1">{label}</div>
              <div className="text-[13px] font-medium text-[oklch(0.12_0.006_248)] font-mono">{value}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
