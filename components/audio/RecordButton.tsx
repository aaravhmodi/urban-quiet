"use client";

import { useState, useEffect, useRef } from "react";
import { startRecording, cancelRecording } from "@/lib/audio";

interface RecordButtonProps {
  onRecordingComplete: (blob: Blob) => void;
  onRecordingStart?: () => void;
  duration: number;
}

type RecordState = "idle" | "recording" | "done";

export default function RecordButton({ onRecordingComplete, onRecordingStart, duration }: RecordButtonProps) {
  const [state, setState] = useState<RecordState>("idle");
  const [countdown, setCountdown] = useState(duration);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    setCountdown(duration);
  }, [duration]);

  async function handleRecord() {
    if (state !== "idle") return;
    cancelledRef.current = false;
    setState("recording");
    setCountdown(duration);
    onRecordingStart?.();

    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(intervalRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);

    try {
      const blob = await startRecording(duration);
      if (!cancelledRef.current) { setState("done"); onRecordingComplete(blob); }
    } catch {
      if (!cancelledRef.current) setState("idle");
    } finally {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  }

  function handleCancel() {
    cancelledRef.current = true;
    if (intervalRef.current) clearInterval(intervalRef.current);
    cancelRecording();
    setState("idle");
    setCountdown(duration);
  }

  const isRecording = state === "recording";
  const isDone = state === "done";

  return (
    <div className="flex flex-col items-center gap-5">
      <button
        onClick={handleRecord}
        disabled={isRecording || isDone}
        aria-label={isRecording ? `Recording: ${countdown}s remaining` : "Start recording"}
        className="relative w-28 h-28 rounded-full flex flex-col items-center justify-center transition-all duration-200 disabled:cursor-default"
        style={{
          background: isDone
            ? "oklch(0.58 0.14 152)"
            : "oklch(0.56 0.22 25)",
          boxShadow: isRecording
            ? "0 0 0 8px oklch(0.56 0.22 25 / 0.15), 0 8px 32px oklch(0.56 0.22 25 / 0.35)"
            : isDone
            ? "0 8px 24px oklch(0.58 0.14 152 / 0.35)"
            : "0 8px 24px oklch(0.56 0.22 25 / 0.35)",
          transform: isRecording ? "scale(1.06)" : "scale(1)",
        }}
      >
        {isRecording ? (
          <>
            <span className="text-[32px] font-semibold text-white font-mono leading-none">{countdown}</span>
            <span className="text-[11px] text-white/70 mt-1 font-medium uppercase tracking-wider">recording</span>
          </>
        ) : isDone ? (
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path d="M7 16l7 7 11-13" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <rect x="13" y="6" width="6" height="14" rx="3" fill="white"/>
            <path d="M8 17a8 8 0 0 0 16 0" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <line x1="16" y1="25" x2="16" y2="29" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <line x1="12" y1="29" x2="20" y2="29" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        )}

        {/* Pulsing ring when recording */}
        {isRecording && (
          <span className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ background: "oklch(0.56 0.22 25)" }} />
        )}
      </button>

      {isRecording && (
        <button
          onClick={handleCancel}
          className="px-5 py-2 text-[14px] text-[oklch(0.48_0.008_248)] bg-white border border-[oklch(0.88_0.004_248)] rounded-full hover:bg-[oklch(0.97_0.004_248)] transition-colors min-h-[44px]"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
