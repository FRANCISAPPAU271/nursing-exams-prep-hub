"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "#exams", label: "Exams" },
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it works" },
  { href: "#library", label: "Library" },
  { href: "#pricing", label: "Pricing" },
  { href: "#refer", label: "Refer & Earn" },
  { href: "#security", label: "Security" },
  { href: "#faq", label: "FAQ" },
];

export default function SiteNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition ${
        scrolled ? "border-b border-slate-200 bg-white/90 backdrop-blur" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-slate-900">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-600 text-white">✚</span>
          <span>
            All Nursing Exams Prep Hub
            <span className="block text-[10px] font-medium uppercase tracking-wider text-teal-700">
              For student nurses
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 sm:flex">
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
          >
            Start free
          </Link>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          className="rounded-lg border border-slate-300 p-2 lg:hidden"
        >
          <span className="block h-0.5 w-5 bg-slate-700" />
          <span className="mt-1 block h-0.5 w-5 bg-slate-700" />
          <span className="mt-1 block h-0.5 w-5 bg-slate-700" />
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white px-5 py-3 lg:hidden">
          <nav className="flex flex-col">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link
              href="/login"
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-center text-sm font-medium"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-teal-600 px-4 py-2.5 text-center text-sm font-semibold text-white"
            >
              Start free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
