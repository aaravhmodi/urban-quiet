import Link from "next/link";

const STEPS = [
  {
    number: "1",
    title: "Record",
    description: "Tap Record Sample. Allow mic and location access, then hold for 5–10 seconds of ambient sound.",
  },
  {
    number: "2",
    title: "Classify",
    description: "The app estimates loudness automatically. Confirm the sound type — traffic, nature, crowd, and more.",
  },
  {
    number: "3",
    title: "Explore",
    description: "Your sample appears on the map instantly. Browse quiet zones and noisy areas across the city.",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col items-center flex-1 px-5">
      {/* Hero */}
      <div className="flex flex-col items-center text-center pt-16 pb-10 max-w-sm w-full">
        <div className="w-20 h-20 mx-auto mb-7 rounded-[22px] bg-[oklch(0.56_0.12_188)] flex items-center justify-center shadow-lg shadow-[oklch(0.56_0.12_188/0.25)]">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
            <circle cx="18" cy="18" r="7" fill="white" fillOpacity="0.25" />
            <circle cx="18" cy="18" r="3.5" fill="white" />
            <circle cx="18" cy="18" r="12" stroke="white" strokeWidth="1.5" strokeOpacity="0.35" fill="none" />
            <circle cx="18" cy="18" r="17" stroke="white" strokeWidth="1" strokeOpacity="0.15" fill="none" />
          </svg>
        </div>

        <h1 className="text-[34px] font-bold text-[oklch(0.12_0.006_248)] mb-2 tracking-tight">
          UrbanQuiet
        </h1>
        <p className="text-[17px] text-[oklch(0.46_0.12_188)] font-medium mb-4">
          Map the silence. Find your quiet.
        </p>
        <p className="text-[15px] text-[oklch(0.48_0.008_248)] leading-relaxed">
          A crowdsourced noise map built by people like you. Record a short clip anywhere in the city — see where it&apos;s loud, and discover hidden pockets of quiet.
        </p>

        <div className="flex flex-col gap-3 w-full mt-8">
          <Link
            href="/record"
            className="flex items-center justify-center h-[54px] px-6 rounded-[14px] bg-[oklch(0.56_0.12_188)] text-white font-semibold text-[17px] transition-opacity active:opacity-80 shadow-md shadow-[oklch(0.56_0.12_188/0.3)]"
          >
            Start Recording
          </Link>
          <Link
            href="/map"
            className="flex items-center justify-center h-[54px] px-6 rounded-[14px] bg-white text-[oklch(0.46_0.12_188)] font-semibold text-[17px] border border-[oklch(0.88_0.004_248)] transition-colors hover:bg-[oklch(0.97_0.004_248)] active:opacity-80"
          >
            Explore Map
          </Link>
        </div>
      </div>

      {/* How it works */}
      <div className="w-full max-w-sm pb-12">
        <h2 className="text-[13px] font-medium text-[oklch(0.48_0.008_248)] uppercase tracking-wider mb-3 px-1">
          How it works
        </h2>
        <div className="bg-white rounded-[16px] border border-[oklch(0.88_0.004_248)] overflow-hidden">
          {STEPS.map((step, i) => (
            <div
              key={step.number}
              className={`flex gap-4 px-4 py-4 ${i > 0 ? "border-t border-[oklch(0.92_0.004_248)]" : ""}`}
            >
              <div className="w-8 h-8 rounded-full bg-[oklch(0.56_0.12_188/0.1)] flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[13px] font-bold text-[oklch(0.46_0.12_188)]">{step.number}</span>
              </div>
              <div>
                <div className="text-[15px] font-semibold text-[oklch(0.12_0.006_248)] mb-0.5">{step.title}</div>
                <div className="text-[13px] text-[oklch(0.48_0.008_248)] leading-relaxed">{step.description}</div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-[12px] text-[oklch(0.62_0.006_248)] text-center mt-6 leading-relaxed px-2">
          No audio is stored — only loudness metrics and location.
          <br />
          Microphone access is used only during active recording.
        </p>
      </div>
    </div>
  );
}
