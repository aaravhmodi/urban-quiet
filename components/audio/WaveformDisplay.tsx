"use client";

import { LoudnessResult } from "@/types";

interface WaveformDisplayProps {
  isRecording: boolean;
  loudnessResult?: LoudnessResult;
}

const BAR_COUNT = 12;

export default function WaveformDisplay({
  isRecording,
  loudnessResult,
}: WaveformDisplayProps) {
  if (!isRecording && !loudnessResult) {
    return (
      <div className="flex items-center justify-center h-20 text-slate-500 text-sm">
        Waveform will appear here during recording
      </div>
    );
  }

  if (isRecording) {
    return (
      <div className="flex items-end justify-center gap-1 h-20">
        {Array.from({ length: BAR_COUNT }).map((_, i) => (
          <div
            key={i}
            className="w-3 bg-red-500 rounded-t"
            style={{
              height: `${20 + Math.random() * 60}%`,
              animation: `pulse 0.${(i % 4) + 5}s ease-in-out infinite alternate`,
              animationDelay: `${i * 0.08}s`,
            }}
          />
        ))}
        <style>{`
          @keyframes waveBar {
            0% { transform: scaleY(0.3); }
            100% { transform: scaleY(1); }
          }
        `}</style>
      </div>
    );
  }

  if (loudnessResult) {
    const score = Math.round(loudnessResult.loudnessScore);
    const color =
      score < 35 ? "bg-green-500" : score <= 65 ? "bg-yellow-500" : "bg-red-500";
    const label =
      score < 35 ? "Quiet" : score <= 65 ? "Moderate" : "Loud";

    return (
      <div className="flex flex-col gap-3 px-2">
        <div className="flex justify-between text-sm text-slate-300">
          <span>Estimated Loudness: <strong className="text-white">{score}/100</strong></span>
          <span className={score < 35 ? "text-green-400" : score <= 65 ? "text-yellow-400" : "text-red-400"}>
            {label}
          </span>
        </div>
        <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${color}`}
            style={{ width: `${score}%` }}
          />
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs text-slate-400">
          <div>RMS: <span className="text-slate-200">{loudnessResult.rms.toFixed(4)}</span></div>
          <div>Peak: <span className="text-slate-200">{loudnessResult.peak.toFixed(4)}</span></div>
          <div>dBFS: <span className="text-slate-200">{loudnessResult.dbfs.toFixed(1)}</span></div>
        </div>
      </div>
    );
  }

  return null;
}
