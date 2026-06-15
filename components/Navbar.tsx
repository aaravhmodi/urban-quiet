"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/map", label: "Map" },
  { href: "/record", label: "Record" },
  { href: "/insights", label: "Insights" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-black/[0.06]">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-12">
        <Link
          href="/"
          className="font-semibold text-[oklch(0.12_0.006_248)] text-[15px] tracking-tight"
        >
          UrbanQuiet
        </Link>
        <div className="flex items-center gap-0.5">
          {NAV_LINKS.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors min-h-[36px] flex items-center
                  ${
                    isActive
                      ? "bg-[oklch(0.56_0.12_188/0.12)] text-[oklch(0.46_0.12_188)]"
                      : "text-[oklch(0.48_0.008_248)] hover:text-[oklch(0.12_0.006_248)] hover:bg-black/[0.04]"
                  }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
