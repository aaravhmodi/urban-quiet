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
import { Card } from "@/components/ui/card";

type Step = "permissions" | "record" | "categorize" | "submitting";

export default function RecordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("permissions");
  const [micGranted, setMicGranted] = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);
  const [duration, setDuration] = useState<5 | 10>(5);
  const [isRecording, setIsRecording] = useState(false);
  const [loudnessResult, setLoudnessResult] = useState<LoudnessResult | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [category, setCategory] = useState<SoundCategory | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  async function requestMic() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setMicGranted(true);
    } catch {
      setError("Microphone access denied. Please allow mic access in your browser settings.");
    }
  }

  async function requestLocation() {
    try {
      const loc = await getCurrentLocation();
      setLocation(loc);
      setLocationGranted(true);
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
      setAudioBlob(blob);
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
    <div className="max-w-lg mx-auto w-full px-4 py-8 flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-white">Record Noise Sample</h1>

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {step === "permissions" && (
        <Card className="bg-slate-800 border-slate-700 p-6 flex flex-col gap-4">
          <h2 className="text-white font-semibold text-lg">Step 1: Permissions</h2>
          <p className="text-slate-400 text-sm">We need microphone and location access to record and tag your sample.</p>

          <button
            onClick={requestMic}
            disabled={micGranted}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border min-h-[52px] text-left transition-colors ${
              micGranted
                ? "border-green-600 bg-green-900/30 text-green-300"
                : "border-slate-600 bg-slate-700 text-white hover:bg-slate-600"
            }`}
          >
            <span className="text-xl">{micGranted ? "✅" : "🎙"}</span>
            <div>
              <div className="font-medium text-sm">Microphone</div>
              <div className="text-xs text-slate-400">{micGranted ? "Granted" : "Tap to allow"}</div>
            </div>
          </button>

          <button
            onClick={requestLocation}
            disabled={locationGranted}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border min-h-[52px] text-left transition-colors ${
              locationGranted
                ? "border-green-600 bg-green-900/30 text-green-300"
                : "border-slate-600 bg-slate-700 text-white hover:bg-slate-600"
            }`}
          >
            <span className="text-xl">{locationGranted ? "✅" : "📍"}</span>
            <div>
              <div className="font-medium text-sm">Location</div>
              <div className="text-xs text-slate-400">{locationGranted ? "Granted" : "Tap to allow"}</div>
            </div>
          </button>

          <button
            onClick={proceedToRecord}
            disabled={!micGranted || !locationGranted}
            className="flex items-center justify-center h-12 mt-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-colors w-full"
          >
            Continue
          </button>
        </Card>
      )}

      {step === "record" && (
        <Card className="bg-slate-800 border-slate-700 p-6 flex flex-col gap-6">
          <h2 className="text-white font-semibold text-lg">Step 2: Record</h2>

          <div>
            <div className="text-sm text-slate-400 mb-2">Recording duration</div>
            <div className="flex gap-2">
              {([5, 10] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  disabled={isRecording}
                  className={`px-5 py-2 rounded-lg text-sm font-medium min-h-[44px] transition-colors ${
                    duration === d
                      ? "bg-blue-600 text-white"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  {d}s
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <RecordButton
              duration={duration}
              onRecordingComplete={handleRecordingComplete}
            />
            <WaveformDisplay isRecording={isRecording} />
          </div>
        </Card>
      )}

      {step === "categorize" && loudnessResult && (
        <div className="flex flex-col gap-4">
          <Card className="bg-slate-800 border-slate-700 p-4">
            <h2 className="text-white font-semibold text-base mb-3">Recording Analysis</h2>
            <WaveformDisplay isRecording={false} loudnessResult={loudnessResult} />
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-4">
            <h2 className="text-white font-semibold text-base mb-3">Step 3: What did you hear?</h2>
            <CategorySelector selected={category} onChange={setCategory} />
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-4">
            <label className="block text-sm text-slate-400 mb-2">
              Note <span className="text-slate-600">(optional)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any additional context..."
              rows={3}
              className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm resize-none border border-slate-600 focus:border-blue-500 focus:outline-none"
            />
          </Card>

          <button
            onClick={handleSubmit}
            disabled={!category}
            className="flex items-center justify-center h-14 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-base transition-colors w-full"
          >
            Submit Sample
          </button>
        </div>
      )}

      {step === "submitting" && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400">
          <div className="text-4xl animate-spin">⏳</div>
          <div>Submitting your sample...</div>
        </div>
      )}
    </div>
  );
}
