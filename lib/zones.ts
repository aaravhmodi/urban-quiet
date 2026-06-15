import { NoiseSample, NoiseZone, SoundCategory } from "@/types";

export function computeZones(samples: NoiseSample[]): NoiseZone[] {
  const cells = new Map<
    string,
    { samples: NoiseSample[]; lat: number; lng: number }
  >();

  for (const sample of samples) {
    const roundedLat = Math.round(sample.latitude * 100) / 100;
    const roundedLng = Math.round(sample.longitude * 100) / 100;
    const cellId = `${roundedLat},${roundedLng}`;

    if (!cells.has(cellId)) {
      cells.set(cellId, { samples: [], lat: roundedLat, lng: roundedLng });
    }
    cells.get(cellId)!.samples.push(sample);
  }

  const zones: NoiseZone[] = [];

  for (const [cellId, cell] of cells.entries()) {
    if (cell.samples.length < 3) continue;

    const avgLoudnessScore =
      cell.samples.reduce((sum, s) => sum + s.loudnessScore, 0) /
      cell.samples.length;

    const categoryCounts = new Map<SoundCategory, number>();
    for (const s of cell.samples) {
      categoryCounts.set(
        s.soundCategory,
        (categoryCounts.get(s.soundCategory) ?? 0) + 1
      );
    }
    const topCategories = [...categoryCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([cat]) => cat);

    const zoneType: NoiseZone["zoneType"] =
      avgLoudnessScore < 35
        ? "quiet"
        : avgLoudnessScore <= 65
        ? "moderate"
        : "noisy";

    zones.push({
      cellId,
      centerLatitude: cell.lat,
      centerLongitude: cell.lng,
      avgLoudnessScore,
      sampleCount: cell.samples.length,
      topCategories,
      zoneType,
    });
  }

  return zones;
}
