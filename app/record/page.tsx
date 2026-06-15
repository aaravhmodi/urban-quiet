"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import RecordButton from "@/components/audio/RecordButton";
import WaveformDisplay from "@/components/audio/WaveformDisplay";
import CategorySelector from "@/components/audio/CategorySelector";
import { analyzeLoudness } from "@/lib/loudness";
import { getCurrentLocation } from "@/lib/geolocation";
import { submitSample } from "@/lib/supabase";
import { LoudnessResult, SoundCategory } from "@/types";

type Step = "permissions" | "record" | "categorize" | "submitting";

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-[16px] border border-[oklch(0.88_0.004_248)] overflow-hidden">
      {children}
    </div>
  );
}

function SectionRow({
  children,
  hasDivider = false,
}: {
  children: React.ReactNode;
  hasDivider?: boolean;
}) {
  return (
    <div className={`px-4 py-4 ${hasDivider ? "border-t border-[oklch(0.92_0.004_248)]" : ""}`}>
      {children}
    </div>
  );
}

export default function RecordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("permissions");
  const [micGranted, setMicGranted] = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);
  const [duration, setDuration] = useState<5 | 10>(5);
  const [isRecording, setIsRecording] = useState(false);
  const [loudnessResult, setLoudnessResult] = useState<LoudnessResult | null>(null);
  const [category, setCategory] = useState<SoundCategory | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

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
      setError(null);
    } catch {
      setError("Location access denied. Please allow location access to tag your recording.");
    }
  }

  function proceedToRecord() {
    if (micGranted && locationGranted) {
      setError(null);
      setStep("record");
    }
  }

  async function handleRecordingComplete(blob: Blob) {
    setIsRecording(false);
    try {
      const result = await analyzeLoudness(blob);
      setLoudnessResult(result);
      setStep("categorize");
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
        timestamp: new Date(),
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
        <h1 className="text-[28px] font-bold text-[oklch(0.12_0.006_248)] tracking-tight">
          Record Sample
        </h1>
        <p className="text-[15px] text-[oklch(0.48_0.008_248)] mt-1">
          Capture ambient sound and contribute to the noise map.
        </p>
      </div>

      {error && (
        <div className="bg-[oklch(0.97_0.01_25)] border border-[oklch(0.85_0.06_25)] text-[oklch(0.46_0.22_25)] rounded-[12px] px-4 py-3 text-[14px]">
          {error}
        </div>
      )}

      {/* Step 1: Permissions */}
      {step === "permissions" && (
        <div className="flex flex-col gap-3">
          <p className="text-[13px] text-[oklch(0.48_0.008_248)] font-medium uppercase tracking-wider px-1">
            Permissions needed
          </p>
          <SectionCard>
            <SectionRow>
              <button
                onClick={requestMic}
                disabled={micGranted}
                className="flex items-center justify-between w-full min-h-[48px] disabled:cursor-default"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-[9px] bg-[oklch(0.56_0.22_25/0.1)] flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                      <rect x="7" y="2" width="4" height="8" rx="2" fill="oklch(0.56 0.22 25)"/>
                      <path d="M4 9a5 5 0 0 0 10 0" stroke="oklch(0.56 0.22 25)" strokeWidth="1.5" strokeLinecap="round"/>
                      <line x1="9" y1="14" x2="9" y2="16" stroke="oklch(0.56 0.22 25)" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="text-[15px] font-medium text-[oklch(0.12_0.006_248)]">Microphone</div>
                    <div className="text-[13px] text-[oklch(0.48_0.008_248)]">
                      {micGranted ? "Access granted" : "Tap to allow"}
                    </div>
                  </div>
                </div>
                {micGranted ? (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <circle cx="10" cy="10" r="9" fill="oklch(0.58 0.14 152)"/>
                    <path d="M6 10l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="7" height="13" viewBox="0 0 7 13" fill="none" aria-hidden="true">
                    <path d="M1 1l5 5.5L1 12" stroke="oklch(0.70 0.004 248)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </SectionRow>
            <SectionRow hasDivider>
              <button
                onClick={requestLocation}
                disabled={locationGranted}
                className="flex items-center justify-between w-full min-h-[48px] disabled:cursor-default"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-[9px] bg-[oklch(0.56_0.12_188/0.1)] flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                      <path d="M9 2a5 5 0 0 1 5 5c0 3.5-5 9-5 9S4 10.5 4 7a5 5 0 0 1 5-5z" fill="oklch(0.56 0.12 188)" fillOpacity="0.8"/>
                      <circle cx="9" cy="7" r="2" fill="white"/>
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="text-[15px] font-medium text-[oklch(0.12_0.006_248)]">Location</div>
                    <div className="text-[13px] text-[oklch(0.48_0.008_248)]">
                      {locationGranted ? "Access granted" : "Tap to allow"}
                    </div>
                  </div>
                </div>
                {locationGranted ? (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <circle cx="10" cy="10" r="9" fill="oklch(0.58 0.14 152)"/>
                    <path d="M6 10l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="7" height="13" viewBox="0 0 7 13" fill="none" aria-hidden="true">
                    <path d="M1 1l5 5.5L1 12" stroke="oklch(0.70 0.004 248)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </SectionRow>
          </SectionCard>

          <button
            onClick={proceedToRecord}
            disabled={!micGranted || !locationGranted}
            className="flex items-center justify-center h-[54px] rounded-[14px] bg-[oklch(0.56_0.12_188)] text-white font-semibold text-[17px] disabled:opacity-40 disabled:cursor-not-allowed transition-opacity active:opacity-80 mt-1"
          >
            Continue
          </button>
        </div>
      )}

      {/* Step 2: Record */}
      {step === "record" && (
        <div className="flex flex-col gap-4">
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
                <RecordButton duration={duration} onRecordingComplete={handleRecordingComplete} />
                <WaveformDisplay isRecording={isRecording} />
              </div>
            </SectionRow>
          </SectionCard>
        </div>
      )}

      {/* Step 3: Categorize */}
      {step === "categorize" && loudnessResult && (
        <div className="flex flex-col gap-4">
          <SectionCard>
            <SectionRow>
              <div className="text-[13px] text-[oklch(0.48_0.008_248)] font-medium mb-4">Analysis</div>
              <WaveformDisplay isRecording={false} loudnessResult={loudnessResult} />
            </SectionRow>
          </SectionCard>

          <SectionCard>
            <SectionRow>
              <div className="text-[13px] text-[oklch(0.48_0.008_248)] font-medium mb-3">What did you hear?</div>
              <CategorySelector selected={category} onChange={setCategory} />
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

      {/* Submitting */}
      {step === "submitting" && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-12 h-12 rounded-full border-2 border-[oklch(0.88_0.004_248)] border-t-[oklch(0.56_0.12_188)] animate-spin" />
          <div className="text-[15px] text-[oklch(0.48_0.008_248)]">Submitting sample…</div>
        </div>
      )}
    </div>
  );
}
