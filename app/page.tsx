import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 py-20 text-center">
      <div className="max-w-sm w-full">
        {/* Icon */}
        <div className="w-20 h-20 mx-auto mb-8 rounded-[22px] bg-[oklch(0.56_0.12_188)] flex items-center justify-center shadow-lg shadow-[oklch(0.56_0.12_188/0.25)]">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
            <path
              d="M18 6C11.373 6 6 11.373 6 18s5.373 12 12 12 12-5.373 12-12S24.627 6 18 6zm0 4a8 8 0 1 1 0 16A8 8 0 0 1 18 10zm0 3a5 5 0 1 0 0 10A5 5 0 0 0 18 13zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"
              fill="white"
              fillOpacity="0.4"
            />
            <circle cx="18" cy="18" r="3" fill="white" />
            <path d="M11 8L8 11M25 8l3 3M11 28l-3-3M25 28l3 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5"/>
          </svg>
        </div>

        <h1 className="text-[34px] font-bold text-[oklch(0.12_0.006_248)] mb-2 tracking-tight">
          UrbanQuiet
        </h1>
        <p className="text-[17px] text-[oklch(0.46_0.12_188)] font-medium mb-4">
          Map the silence. Find your quiet.
        </p>
        <p className="text-[15px] text-[oklch(0.48_0.008_248)] mb-10 leading-relaxed max-w-[280px] mx-auto">
          Contribute to a living map of city sound. Record anywhere, see where it&apos;s loud, and find hidden pockets of quiet.
        </p>

        <div className="flex flex-col gap-3 w-full">
          <Link
            href="/record"
            className="flex items-center justify-center h-[54px] px-6 rounded-[14px] bg-[oklch(0.56_0.12_188)] text-white font-semibold text-[17px] transition-opacity active:opacity-80 shadow-md shadow-[oklch(0.56_0.12_188/0.3)]"
          >
            Start Recording
          </Link>
          <Link
            href="/map"
            className="flex items-center justify-center h-[54px] px-6 rounded-[14px] bg-white text-[oklch(0.56_0.12_188)] font-semibold text-[17px] border border-[oklch(0.88_0.004_248)] transition-colors hover:bg-[oklch(0.97_0.004_248)] active:opacity-80"
          >
            Explore Map
          </Link>
        </div>

        <p className="text-[12px] text-[oklch(0.62_0.006_248)] mt-10 leading-relaxed">
          No audio is stored — only loudness metrics and location.
          <br />
          Microphone access is used only during active recording.
        </p>
      </div>
    </div>
  );
}
