"use client";

import { useState, useEffect, useRef } from "react";
import { startRecording, cancelRecording } from "@/lib/audio";

interface RecordButtonProps {
  onRecordingComplete: (blob: Blob) => void;
  duration: number;
}

type RecordState = "idle" | "recording" | "done";

export default function RecordButton({
  onRecordingComplete,
  duration,
}: RecordButtonProps) {
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

    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    try {
      const blob = await startRecording(duration);
      if (!cancelledRef.current) {
        setState("done");
        onRecordingComplete(blob);
      }
    } catch {
      if (!cancelledRef.current) {
        setState("idle");
      }
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
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={handleRecord}
        disabled={isRecording || isDone}
        aria-label={isRecording ? `Recording: ${countdown}s remaining` : "Start recording"}
        className={`
          w-24 h-24 rounded-full text-white font-bold text-sm flex flex-col items-center justify-center
          transition-all duration-200 shadow-lg
          ${isRecording ? "bg-red-600 scale-110 ring-4 ring-red-400/50" : ""}
          ${isDone ? "bg-green-600" : ""}
          ${!isRecording && !isDone ? "bg-red-500 hover:bg-red-600 active:scale-95" : ""}
        `}
      >
        {isRecording ? (
          <>
            <span className="text-2xl font-mono">{countdown}</span>
            <span className="text-xs mt-1">recording</span>
          </>
        ) : isDone ? (
          <>
            <span className="text-xl">✓</span>
            <span className="text-xs mt-1">Done</span>
          </>
        ) : (
          <>
            <span className="text-2xl">🎙</span>
            <span className="text-xs mt-1">Record</span>
          </>
        )}
      </button>

      {isRecording && (
        <button
          onClick={handleCancel}
          className="px-4 py-2 text-sm text-slate-300 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors min-h-[44px]"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
