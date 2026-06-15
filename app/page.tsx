import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 py-16 text-center">
      <div className="max-w-md w-full">
        <div className="text-6xl mb-6">🔇</div>
        <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
          UrbanQuiet
        </h1>
        <p className="text-xl text-blue-400 font-medium mb-4">
          Map the silence. Find your quiet.
        </p>
        <p className="text-slate-400 text-sm mb-10 leading-relaxed">
          Contribute to a crowdsourced map of city noise levels. Record ambient
          sound anywhere, see where it&apos;s loud — and discover hidden pockets of
          quiet in your city.
        </p>

        <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
          <Link
            href="/record"
            className="flex items-center justify-center h-14 px-6 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-base transition-colors"
          >
            🎙 Start Recording
          </Link>
          <Link
            href="/map"
            className="flex items-center justify-center h-14 px-6 rounded-lg border border-slate-600 text-white hover:bg-slate-800 text-base transition-colors"
          >
            🗺 Explore Map
          </Link>
        </div>

        <p className="text-xs text-slate-600 mt-10">
          No audio is stored — only loudness metrics and location. Your
          microphone access is used only during active recording.
        </p>
      </div>
    </div>
  );
}
