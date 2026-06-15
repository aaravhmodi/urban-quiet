export interface TimeBaseline {
  expectedMin: number;
  expectedMax: number;
  label: string;
  description: string;
}

const HOURLY_BASELINES: TimeBaseline[] = [
  // 0 – 5am: night quiet
  { expectedMin: 10, expectedMax: 30, label: "Very quiet", description: "Late night — minimal activity expected." },
  { expectedMin: 10, expectedMax: 30, label: "Very quiet", description: "Late night — minimal activity expected." },
  { expectedMin: 10, expectedMax: 30, label: "Very quiet", description: "Late night — minimal activity expected." },
  { expectedMin: 10, expectedMax: 30, label: "Very quiet", description: "Late night — minimal activity expected." },
  { expectedMin: 10, expectedMax: 30, label: "Very quiet", description: "Late night — minimal activity expected." },
  { expectedMin: 15, expectedMax: 35, label: "Very quiet", description: "Pre-dawn — city is waking up." },
  // 6am: early morning
  { expectedMin: 25, expectedMax: 50, label: "Waking up", description: "Early morning — light traffic starting." },
  // 7am: morning rush starts
  { expectedMin: 40, expectedMax: 65, label: "Morning rush", description: "Rush hour starting — expect moderate to loud traffic." },
  // 8am: peak morning rush
  { expectedMin: 50, expectedMax: 70, label: "Peak rush hour", description: "Busiest commute period — traffic, transit, crowds." },
  // 9am: tapering
  { expectedMin: 40, expectedMax: 60, label: "Moderate", description: "Post-rush settling — still active." },
  // 10am
  { expectedMin: 35, expectedMax: 55, label: "Moderate", description: "Mid-morning — steady urban background." },
  // 11am
  { expectedMin: 40, expectedMax: 58, label: "Moderate", description: "Late morning — activity picking up." },
  // 12pm: lunch
  { expectedMin: 45, expectedMax: 65, label: "Lunch hour", description: "Lunch hour — more pedestrians and traffic." },
  // 1pm
  { expectedMin: 40, expectedMax: 60, label: "Moderate", description: "Early afternoon — typical urban activity." },
  // 2pm
  { expectedMin: 35, expectedMax: 55, label: "Moderate", description: "Quieter afternoon window." },
  // 3pm: school out
  { expectedMin: 40, expectedMax: 60, label: "Moderate", description: "Schools letting out — more pedestrian traffic." },
  // 4pm: evening rush starts
  { expectedMin: 50, expectedMax: 68, label: "Evening rush", description: "Rush hour building — traffic and transit volumes rising." },
  // 5pm: peak evening rush
  { expectedMin: 55, expectedMax: 72, label: "Peak rush hour", description: "Heaviest traffic of the day." },
  // 6pm
  { expectedMin: 45, expectedMax: 65, label: "Evening activity", description: "Dinner hour — restaurants, pedestrians active." },
  // 7pm
  { expectedMin: 40, expectedMax: 60, label: "Evening activity", description: "Evening out — social noise still present." },
  // 8pm
  { expectedMin: 35, expectedMax: 58, label: "Winding down", description: "Evening tapering — quieter neighbourhoods settling." },
  // 9pm
  { expectedMin: 25, expectedMax: 50, label: "Quieting", description: "Late evening — noise levels dropping." },
  // 10pm
  { expectedMin: 20, expectedMax: 42, label: "Late evening", description: "City quieting — residential areas calm." },
  // 11pm
  { expectedMin: 15, expectedMax: 35, label: "Night", description: "Late night — expect quiet except near bars or transit." },
];

export function getTimeBaseline(hour?: number): TimeBaseline {
  const h = hour ?? new Date().getHours();
  return HOURLY_BASELINES[h] ?? HOURLY_BASELINES[0];
}

export function loudnessVsBaseline(
  score: number,
  baseline: TimeBaseline
): { label: string; color: string } {
  if (score < baseline.expectedMin - 10) return { label: "Much quieter than expected", color: "oklch(0.46 0.14 152)" };
  if (score < baseline.expectedMin) return { label: "Quieter than expected", color: "oklch(0.52 0.14 152)" };
  if (score <= baseline.expectedMax) return { label: "Within normal range", color: "oklch(0.48 0.008 248)" };
  if (score <= baseline.expectedMax + 10) return { label: "Louder than expected", color: "oklch(0.55 0.17 72)" };
  return { label: "Much louder than expected", color: "oklch(0.46 0.22 25)" };
}
