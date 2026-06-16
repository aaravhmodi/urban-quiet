"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import RecordButton from "@/components/audio/RecordButton";
import WaveformDisplay from "@/components/audio/WaveformDisplay";
import CategorySelector from "@/components/audio/CategorySelector";
import { analyzeLoudness } from "@/lib/loudness";
import { getCurrentLocation } from "@/lib/geolocation";
import { submitSample } from "@/lib/supabase";
import { getTimeBaseline, loudnessVsBaseline } from "@/lib/timeBaseline";
import { LoudnessResult, SoundCategory } from "@/types";
import type { ClassificationResult } from "@/lib/yamnet";
import dynamic from "next/dynamic";

const LocationPicker = dynamic(() => import("@/components/map/LocationPicker"), { ssr: false });

type Step = "permissions" | "record" | "categorize" | "submitting";

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-[16px] border border-[oklch(0.88_0.004_248)] overflow-hidden">
      {children}
    </div>
  );
}

function SectionRow({ children, hasDivider = false }: { children: React.ReactNode; hasDivider?: boolean }) {
  return (
    <div className={`px-4 py-4 ${hasDivider ? "border-t border-[oklch(0.92_0.004_248)]" : ""}`}>
      {children}
    </div>
  );
}

function PermissionRow({
  icon, label, granted, onRequest, hasDivider = false,
}: {
  icon: React.ReactNode; label: string; granted: boolean; onRequest: () => void; hasDivider?: boolean;
}) {
  return (
    <SectionRow hasDivider={hasDivider}>
      <button
        onClick={onRequest}
        disabled={granted}
        className="flex items-center justify-between w-full min-h-[48px] disabled:cursor-default"
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-[9px] flex items-center justify-center ${granted ? "bg-[oklch(0.58_0.14_152/0.1)]" : "bg-[oklch(0.94_0.004_248)]"}`}>
            {icon}
          </div>
          <div className="text-left">
            <div className="text-[15px] font-medium text-[oklch(0.12_0.006_248)]">{label}</div>
            <div className="text-[13px] text-[oklch(0.48_0.008_248)]">
              {granted ? "Access granted" : "Tap to allow"}
            </div>
          </div>
        </div>
        {granted ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" fill="oklch(0.58 0.14 152)" />
            <path d="M6 10l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="7" height="13" viewBox="0 0 7 13" fill="none">
            <path d="M1 1l5 5.5L1 12" stroke="oklch(0.70 0.004 248)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
    </SectionRow>
  );
}

export default function RecordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("permissions");
  const [micGranted, setMicGranted] = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);
  const [duration, setDuration] = useState<5 | 10>(5);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAt, setRecordedAt] = useState<Date | null>(null);
  const [loudnessResult, setLoudnessResult] = useState<LoudnessResult | null>(null);
  const [aiResult, setAiResult] = useState<ClassificationResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [category, setCategory] = useState<SoundCategory | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [baseline] = useState(() => getTimeBaseline());

  // Preload YAMNet model in background when mic is granted
  useEffect(() => {
    if (micGranted) {
      import("@/lib/yamnet").then(({ isYamnetAvailable, classifyAudio: _ }) => {
        if (isYamnetAvailable()) {
          // Warm up TF.js silently
          import("@tensorflow/tfjs").catch(() => {});
        }
      });
    }
  }, [micGranted]);

  async function requestMic() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setMicGranted(true);
      setError(null);
    } catch {
      setError("Microphone access denied. Please allow mic access in your browser settings.");
    }
  }

  async function requestLocation() {
    try {
      const loc = await getCurrentLocation();
      setLocation(loc);
      setLocationGranted(true);
      setLocationDenied(false);
      setError(null);
    } catch {
      setLocationDenied(true);
      setError(null);
    }
  }

  async function handleRecordingComplete(blob: Blob) {
    setIsRecording(false);
    try {
      const result = await analyzeLoudness(blob);
      setLoudnessResult(result);
      setStep("categorize");

      // Run AI classification in background
      setAiLoading(true);
      try {
        const { classifyAudio, isYamnetAvailable } = await import("@/lib/yamnet");
        if (isYamnetAvailable()) {
          const ai = await classifyAudio(blob);
          setAiResult(ai);
          setCategory(ai.category); // pre-select AI suggestion
        }
      } catch {
        // AI classification is optional — silently skip
      } finally {
        setAiLoading(false);
      }
    } catch {
      setError("Failed to analyze audio. Please try again.");
      setStep("record");
    }
  }

  async function handleSubmit() {
    if (!category || !loudnessResult || !location) return;
    setStep("submitting");
    setError(null);
    try {
      await submitSample({
        latitude: location.lat,
        longitude: location.lng,
        timestamp: recordedAt ?? new Date(),
        durationSeconds: duration,
        rms: loudnessResult.rms,
        peak: loudnessResult.peak,
        dbfs: loudnessResult.dbfs,
        loudnessScore: loudnessResult.loudnessScore,
        soundCategory: category,
        userConfirmedCategory: true,
        note: note.trim() || undefined,
      });
      router.push("/map");
    } catch (e) {
      setError(`Submission failed: ${e instanceof Error ? e.message : "Unknown error"}`);
      setStep("categorize");
    }
  }

  return (
    <div className="max-w-lg mx-auto w-full px-4 py-6 flex flex-col gap-5">
      <div>
        <h1 className="text-[28px] font-bold text-[oklch(0.12_0.006_248)] tracking-tight">Record Sample</h1>
        <p className="text-[15px] text-[oklch(0.48_0.008_248)] mt-1">Capture ambient sound and contribute to the noise map.</p>
      </div>

      {/* Time baseline context */}
      <div className="bg-[oklch(0.56_0.12_188/0.07)] border border-[oklch(0.56_0.12_188/0.2)] rounded-[12px] px-4 py-3 flex items-start gap-3">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 flex-shrink-0">
          <circle cx="8" cy="8" r="7" stroke="oklch(0.46 0.12 188)" strokeWidth="1.5" fill="none" />
          <path d="M8 5v4l2.5 2.5" stroke="oklch(0.46 0.12 188)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <div>
          <span className="text-[13px] font-medium text-[oklch(0.40_0.12_188)]">{baseline.label}</span>
          <span className="text-[13px] text-[oklch(0.48_0.008_248)]"> — {baseline.description}</span>
          <div className="text-[12px] text-[oklch(0.56_0.008_248)] mt-0.5">
            Expected loudness: {baseline.expectedMin}–{baseline.expectedMax}/100
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-[oklch(0.97_0.01_25)] border border-[oklch(0.85_0.06_25)] text-[oklch(0.46_0.22_25)] rounded-[12px] px-4 py-3 text-[14px]">
          {error}
        </div>
      )}

      {/* Step 1: Permissions */}
      {step === "permissions" && (
        <div className="flex flex-col gap-3">
          <p className="text-[13px] text-[oklch(0.48_0.008_248)] font-medium uppercase tracking-wider px-1">Permissions needed</p>
          <SectionCard>
            <PermissionRow
              label="Microphone"
              granted={micGranted}
              onRequest={requestMic}
              icon={
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <rect x="7" y="2" width="4" height="8" rx="2" fill={micGranted ? "oklch(0.58 0.14 152)" : "oklch(0.56 0.22 25)"} />
                  <path d="M4 9a5 5 0 0 0 10 0" stroke={micGranted ? "oklch(0.58 0.14 152)" : "oklch(0.56 0.22 25)"} strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="9" y1="14" x2="9" y2="16" stroke={micGranted ? "oklch(0.58 0.14 152)" : "oklch(0.56 0.22 25)"} strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              }
            />
            {!locationDenied ? (
              <PermissionRow
                label="Location"
                granted={locationGranted}
                onRequest={requestLocation}
                hasDivider
                icon={
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M9 2a5 5 0 0 1 5 5c0 3.5-5 9-5 9S4 10.5 4 7a5 5 0 0 1 5-5z" fill={locationGranted ? "oklch(0.58 0.14 152)" : "oklch(0.56 0.12 188)"} fillOpacity="0.8" />
                    <circle cx="9" cy="7" r="2" fill="white" />
                  </svg>
                }
              />
            ) : (
              <SectionRow hasDivider>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[15px] font-medium text-[oklch(0.12_0.006_248)]">Location</div>
                  <span className="text-[12px] text-[oklch(0.46_0.22_25)] bg-[oklch(0.97_0.01_25)] px-2 py-0.5 rounded-full">
                    GPS denied — pin manually
                  </span>
                </div>
                <LocationPicker
                  value={location}
                  onChange={(loc) => { setLocation(loc); setLocationGranted(true); }}
                />
              </SectionRow>
            )}
          </SectionCard>
          <button
            onClick={() => { if (micGranted && locationGranted) { setError(null); setStep("record"); } }}
            disabled={!micGranted || !locationGranted}
            className="flex items-center justify-center h-[54px] rounded-[14px] bg-[oklch(0.56_0.12_188)] text-white font-semibold text-[17px] disabled:opacity-40 disabled:cursor-not-allowed transition-opacity active:opacity-80 mt-1"
          >
            Continue
          </button>
        </div>
      )}

      {/* Step 2: Record */}
      {step === "record" && (
        <SectionCard>
          <SectionRow>
            <div className="text-[13px] text-[oklch(0.48_0.008_248)] font-medium mb-3">Duration</div>
            <div className="flex gap-2">
              {([5, 10] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  disabled={isRecording}
                  className={`px-5 py-2 rounded-[10px] text-[15px] font-medium min-h-[44px] transition-colors ${
                    duration === d
                      ? "bg-[oklch(0.56_0.12_188)] text-white"
                      : "bg-[oklch(0.94_0.004_248)] text-[oklch(0.30_0.008_248)] hover:bg-[oklch(0.88_0.004_248)]"
                  }`}
                >
                  {d}s
                </button>
              ))}
            </div>
          </SectionRow>
          <SectionRow hasDivider>
            <div className="flex flex-col items-center gap-6 py-4">
              <RecordButton duration={duration} onRecordingComplete={handleRecordingComplete} onRecordingStart={() => setRecordedAt(new Date())} />
              <WaveformDisplay isRecording={isRecording} />
            </div>
          </SectionRow>
        </SectionCard>
      )}

      {/* Step 3: Categorize */}
      {step === "categorize" && loudnessResult && (
        <div className="flex flex-col gap-4">
          {/* Loudness + baseline comparison */}
          <SectionCard>
            <SectionRow>
              <div className="flex items-center justify-between mb-4">
                <div className="text-[13px] text-[oklch(0.48_0.008_248)] font-medium">Analysis</div>
                {recordedAt && (
                  <div className="text-[12px] text-[oklch(0.62_0.006_248)]">
                    Recorded at {recordedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                )}
              </div>
              <WaveformDisplay isRecording={false} loudnessResult={loudnessResult} />
              {(() => {
                const cmp = loudnessVsBaseline(loudnessResult.loudnessScore, baseline);
                return (
                  <div className="mt-3 flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="6" fill={cmp.color} fillOpacity="0.15" />
                      <circle cx="7" cy="7" r="2.5" fill={cmp.color} />
                    </svg>
                    <span className="text-[13px]" style={{ color: cmp.color }}>{cmp.label}</span>
                    <span className="text-[13px] text-[oklch(0.62_0.006_248)]">for this time of day</span>
                  </div>
                );
              })()}
            </SectionRow>
          </SectionCard>

          {/* AI classification */}
          <SectionCard>
            <SectionRow>
              <div className="flex items-center justify-between mb-3">
                <div className="text-[13px] text-[oklch(0.48_0.008_248)] font-medium">What did you hear?</div>
                {aiLoading && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full border border-[oklch(0.88_0.004_248)] border-t-[oklch(0.56_0.12_188)] animate-spin" />
                    <span className="text-[12px] text-[oklch(0.56_0.12_188)]">AI classifying…</span>
                  </div>
                )}
                {aiResult && !aiLoading && (
                  <div className="flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <circle cx="6" cy="6" r="5" fill="oklch(0.58 0.14 152)" />
                      <path d="M3.5 6l2 2 3-4" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-[12px] text-[oklch(0.46_0.14_152)]">
                      AI: {aiResult.label} ({Math.round(aiResult.confidence * 100)}%)
                    </span>
                  </div>
                )}
              </div>
              <CategorySelector selected={category} onChange={setCategory} />
              {aiResult && !aiLoading && (
                <p className="text-[12px] text-[oklch(0.62_0.006_248)] mt-2">
                  AI suggested <strong>{aiResult.category}</strong> — confirm or change above.
                </p>
              )}
            </SectionRow>
          </SectionCard>

          <SectionCard>
            <SectionRow>
              <label className="block text-[13px] text-[oklch(0.48_0.008_248)] font-medium mb-2">
                Note <span className="text-[oklch(0.62_0.006_248)]">(optional)</span>
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Any additional context..."
                rows={3}
                className="w-full bg-[oklch(0.94_0.004_248)] text-[oklch(0.12_0.006_248)] rounded-[10px] px-3 py-2.5 text-[15px] resize-none border-0 outline-none focus:ring-2 focus:ring-[oklch(0.56_0.12_188/0.3)] placeholder:text-[oklch(0.62_0.006_248)]"
              />
            </SectionRow>
          </SectionCard>

          <button
            onClick={handleSubmit}
            disabled={!category}
            className="flex items-center justify-center h-[54px] rounded-[14px] bg-[oklch(0.56_0.12_188)] text-white font-semibold text-[17px] disabled:opacity-40 disabled:cursor-not-allowed transition-opacity active:opacity-80"
          >
            Submit to Map
          </button>
        </div>
      )}

      {step === "submitting" && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-12 h-12 rounded-full border-2 border-[oklch(0.88_0.004_248)] border-t-[oklch(0.56_0.12_188)] animate-spin" />
          <div className="text-[15px] text-[oklch(0.48_0.008_248)]">Submitting sample…</div>
        </div>
      )}
    </div>
  );
}
