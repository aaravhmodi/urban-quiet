"use client";

import { useEffect, useState, useMemo } from "react";
import { getSamples } from "@/lib/supabase";
import { computeZones } from "@/lib/zones";
import { NoiseSample, SoundCategory } from "@/types";
import { Card } from "@/components/ui/card";

const CATEGORY_EMOJIS: Record<SoundCategory, string> = {
  traffic: "🚗",
  construction: "🏗️",
  siren: "🚨",
  crowd: "👥",
  music: "🎵",
  nature: "🌿",
  indoor: "🏠",
  quiet: "🤫",
  unknown: "❓",
};

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
    for (const s of samples) {
      counts[s.soundCategory] = (counts[s.soundCategory] ?? 0) + 1;
    }
    return Object.entries(counts)
      .sort(([, a], [, b]) => (b as number) - (a as number)) as [SoundCategory, number][];
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
      <div className="flex items-center justify-center flex-1 text-slate-400">
        Loading insights...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full px-4 py-8 flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-white">Insights</h1>

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-slate-800 border-slate-700 p-4">
          <div className="text-3xl font-bold text-white">{samples.length}</div>
          <div className="text-slate-400 text-sm mt-1">Total Samples</div>
        </Card>
        <Card className="bg-slate-800 border-slate-700 p-4">
          <div className="text-3xl font-bold text-white">{zones.length}</div>
          <div className="text-slate-400 text-sm mt-1">Mapped Zones</div>
        </Card>
      </div>

      {/* Quietest zones */}
      <Card className="bg-slate-800 border-slate-700 p-4">
        <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
          <span>🤫</span> Quietest Zones
        </h2>
        {quietestZones.length === 0 ? (
          <p className="text-slate-500 text-sm">No zones yet (need 3+ samples per area)</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500 text-xs">
                <th className="text-left pb-2">Location</th>
                <th className="text-right pb-2">Avg Score</th>
                <th className="text-right pb-2">Samples</th>
              </tr>
            </thead>
            <tbody>
              {quietestZones.map((z) => (
                <tr key={z.cellId} className="border-t border-slate-700">
                  <td className="py-2 text-slate-300">{z.cellId}</td>
                  <td className="py-2 text-right text-green-400 font-mono">
                    {z.avgLoudnessScore.toFixed(1)}
                  </td>
                  <td className="py-2 text-right text-slate-400">{z.sampleCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* Noisiest zones */}
      <Card className="bg-slate-800 border-slate-700 p-4">
        <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
          <span>📢</span> Noisiest Zones
        </h2>
        {noisestZones.length === 0 ? (
          <p className="text-slate-500 text-sm">No zones yet</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500 text-xs">
                <th className="text-left pb-2">Location</th>
                <th className="text-right pb-2">Avg Score</th>
                <th className="text-right pb-2">Samples</th>
              </tr>
            </thead>
            <tbody>
              {noisestZones.map((z) => (
                <tr key={z.cellId} className="border-t border-slate-700">
                  <td className="py-2 text-slate-300">{z.cellId}</td>
                  <td className="py-2 text-right text-red-400 font-mono">
                    {z.avgLoudnessScore.toFixed(1)}
                  </td>
                  <td className="py-2 text-right text-slate-400">{z.sampleCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* Category breakdown */}
      <Card className="bg-slate-800 border-slate-700 p-4">
        <h2 className="text-white font-semibold mb-4">Sound Category Breakdown</h2>
        {categoryBreakdown.length === 0 ? (
          <p className="text-slate-500 text-sm">No data yet</p>
        ) : (
          <div className="flex flex-col gap-2">
            {categoryBreakdown.map(([cat, count]) => (
              <div key={cat} className="flex items-center gap-2">
                <span className="w-20 text-xs text-slate-400 flex items-center gap-1">
                  <span>{CATEGORY_EMOJIS[cat]}</span>
                  <span className="capitalize truncate">{cat}</span>
                </span>
                <div className="flex-1 h-5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${(count / maxCategoryCount) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right text-xs text-slate-400">{count}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Average loudness by hour */}
      <Card className="bg-slate-800 border-slate-700 p-4">
        <h2 className="text-white font-semibold mb-4">Average Loudness by Hour</h2>
        <div className="flex items-end gap-0.5 h-24">
          {hourlyAvg.map((avg, h) => {
            const heightPct = maxHourlyAvg > 0 ? (avg / maxHourlyAvg) * 100 : 0;
            const color =
              avg === 0
                ? "bg-slate-700"
                : avg < 35
                ? "bg-green-500"
                : avg <= 65
                ? "bg-yellow-500"
                : "bg-red-500";
            return (
              <div
                key={h}
                className="flex-1 flex flex-col items-center justify-end group relative"
                title={`${h}:00 — ${avg > 0 ? avg.toFixed(1) : "no data"}`}
              >
                <div
                  className={`w-full rounded-t ${color} transition-all`}
                  style={{ height: `${heightPct}%`, minHeight: avg > 0 ? "2px" : "0" }}
                />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-slate-600 mt-1">
          <span>12am</span>
          <span>6am</span>
          <span>12pm</span>
          <span>6pm</span>
          <span>11pm</span>
        </div>
      </Card>
    </div>
  );
}
