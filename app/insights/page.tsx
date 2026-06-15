"use client";

import { useEffect, useState, useMemo } from "react";
import { getSamples } from "@/lib/supabase";
import { computeZones } from "@/lib/zones";
import { NoiseSample, SoundCategory } from "@/types";

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

function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-white rounded-[16px] border border-[oklch(0.88_0.004_248)] p-5">
      <div className="text-[34px] font-bold text-[oklch(0.12_0.006_248)] leading-none">{value}</div>
      <div className="text-[13px] text-[oklch(0.48_0.008_248)] mt-1.5">{label}</div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[13px] font-medium text-[oklch(0.48_0.008_248)] uppercase tracking-wider px-1">
      {children}
    </div>
  );
}

export default function InsightsPage() {
  const [samples, setSamples] = useState<NoiseSample[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSamples()
      .then(setSamples)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const zones = useMemo(() => computeZones(samples), [samples]);
  const quietestZones = useMemo(
    () => [...zones].sort((a, b) => a.avgLoudnessScore - b.avgLoudnessScore).slice(0, 3),
    [zones]
  );
  const noisestZones = useMemo(
    () => [...zones].sort((a, b) => b.avgLoudnessScore - a.avgLoudnessScore).slice(0, 3),
    [zones]
  );
  const categoryBreakdown = useMemo(() => {
    const counts: Partial<Record<SoundCategory, number>> = {};
    for (const s of samples) counts[s.soundCategory] = (counts[s.soundCategory] ?? 0) + 1;
    return Object.entries(counts).sort(([, a], [, b]) => (b as number) - (a as number)) as [SoundCategory, number][];
  }, [samples]);
  const hourlyAvg = useMemo(() => {
    const sums = new Array(24).fill(0);
    const counts = new Array(24).fill(0);
    for (const s of samples) {
      const h = new Date(s.timestamp).getHours();
      sums[h] += s.loudnessScore;
      counts[h]++;
    }
    return sums.map((sum, h) => (counts[h] > 0 ? sum / counts[h] : 0));
  }, [samples]);
  const maxHourlyAvg = Math.max(...hourlyAvg, 1);
  const maxCategoryCount = Math.max(...categoryBreakdown.map(([, c]) => c), 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center flex-1 gap-3 text-[oklch(0.48_0.008_248)]">
        <div className="w-5 h-5 rounded-full border-2 border-[oklch(0.88_0.004_248)] border-t-[oklch(0.56_0.12_188)] animate-spin" />
        <span className="text-[15px]">Loading insights…</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full px-4 py-6 flex flex-col gap-6">
      <div>
        <h1 className="text-[28px] font-bold text-[oklch(0.12_0.006_248)] tracking-tight">Insights</h1>
        <p className="text-[15px] text-[oklch(0.48_0.008_248)] mt-1">City noise at a glance.</p>
      </div>

      {error && (
        <div className="bg-[oklch(0.97_0.01_25)] border border-[oklch(0.85_0.06_25)] text-[oklch(0.46_0.22_25)] rounded-[12px] px-4 py-3 text-[14px]">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard value={samples.length} label="Total Samples" />
        <StatCard value={zones.length} label="Mapped Zones" />
      </div>

      {/* Quietest zones */}
      <div className="flex flex-col gap-2">
        <SectionTitle>Quietest Zones</SectionTitle>
        <div className="bg-white rounded-[16px] border border-[oklch(0.88_0.004_248)] overflow-hidden">
          {quietestZones.length === 0 ? (
            <div className="px-4 py-5 text-[14px] text-[oklch(0.62_0.006_248)]">
              No zones yet — need 3+ samples per area.
            </div>
          ) : (
            quietestZones.map((z, i) => (
              <div
                key={z.cellId}
                className={`flex items-center justify-between px-4 py-3.5 ${i > 0 ? "border-t border-[oklch(0.92_0.004_248)]" : ""}`}
              >
                <div>
                  <div className="text-[15px] font-medium text-[oklch(0.12_0.006_248)]">{z.cellId}</div>
                  <div className="text-[12px] text-[oklch(0.62_0.006_248)]">{z.sampleCount} samples</div>
                </div>
                <div className="text-[17px] font-semibold text-[oklch(0.46_0.14_152)] font-mono">
                  {z.avgLoudnessScore.toFixed(0)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Noisiest zones */}
      <div className="flex flex-col gap-2">
        <SectionTitle>Noisiest Zones</SectionTitle>
        <div className="bg-white rounded-[16px] border border-[oklch(0.88_0.004_248)] overflow-hidden">
          {noisestZones.length === 0 ? (
            <div className="px-4 py-5 text-[14px] text-[oklch(0.62_0.006_248)]">No zones yet.</div>
          ) : (
            noisestZones.map((z, i) => (
              <div
                key={z.cellId}
                className={`flex items-center justify-between px-4 py-3.5 ${i > 0 ? "border-t border-[oklch(0.92_0.004_248)]" : ""}`}
              >
                <div>
                  <div className="text-[15px] font-medium text-[oklch(0.12_0.006_248)]">{z.cellId}</div>
                  <div className="text-[12px] text-[oklch(0.62_0.006_248)]">{z.sampleCount} samples</div>
                </div>
                <div className="text-[17px] font-semibold text-[oklch(0.46_0.22_25)] font-mono">
                  {z.avgLoudnessScore.toFixed(0)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Category breakdown */}
      <div className="flex flex-col gap-2">
        <SectionTitle>Sound Categories</SectionTitle>
        <div className="bg-white rounded-[16px] border border-[oklch(0.88_0.004_248)] p-4">
          {categoryBreakdown.length === 0 ? (
            <div className="text-[14px] text-[oklch(0.62_0.006_248)] py-2">No data yet.</div>
          ) : (
            <div className="flex flex-col gap-3">
              {categoryBreakdown.map(([cat, count]) => (
                <div key={cat} className="flex items-center gap-3">
                  <span className="w-[90px] text-[13px] text-[oklch(0.30_0.008_248)] font-medium capitalize flex-shrink-0">
                    {CATEGORY_LABELS[cat]}
                  </span>
                  <div className="flex-1 h-2 bg-[oklch(0.94_0.004_248)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(count / maxCategoryCount) * 100}%`,
                        background: "oklch(0.56 0.12 188)",
                      }}
                    />
                  </div>
                  <span className="w-6 text-right text-[12px] text-[oklch(0.62_0.006_248)] font-mono flex-shrink-0">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Hourly chart */}
      <div className="flex flex-col gap-2">
        <SectionTitle>Average Loudness by Hour</SectionTitle>
        <div className="bg-white rounded-[16px] border border-[oklch(0.88_0.004_248)] p-4">
          <div className="flex items-end gap-[2px] h-20">
            {hourlyAvg.map((avg, h) => {
              const heightPct = (avg / maxHourlyAvg) * 100;
              const barColor =
                avg === 0
                  ? "oklch(0.94 0.004 248)"
                  : avg < 35
                  ? "oklch(0.58 0.14 152)"
                  : avg <= 65
                  ? "oklch(0.72 0.17 72)"
                  : "oklch(0.56 0.22 25)";
              return (
                <div
                  key={h}
                  className="flex-1 flex flex-col justify-end"
                  title={`${h}:00 — ${avg > 0 ? avg.toFixed(1) : "no data"}`}
                >
                  <div
                    className="w-full rounded-t-[2px] transition-all"
                    style={{
                      height: `${Math.max(heightPct, avg > 0 ? 4 : 0)}%`,
                      background: barColor,
                    }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-[11px] text-[oklch(0.62_0.006_248)] mt-2">
            <span>12am</span>
            <span>6am</span>
            <span>12pm</span>
            <span>6pm</span>
            <span>11pm</span>
          </div>
        </div>
      </div>
    </div>
  );
}
