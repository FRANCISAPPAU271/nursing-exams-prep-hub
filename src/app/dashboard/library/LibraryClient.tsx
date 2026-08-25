"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { LIBRARY_SECTIONS } from "@/lib/library";

export type Lesson = {
  id: number;
  title: string;
  description: string;
  section: string;
  topic: string;
  durationMin: number;
  searchQuery: string;
  premium: boolean;
};

export default function LibraryClient({
  lessons,
  isPremium,
}: {
  lessons: Lesson[];
  isPremium: boolean;
}) {
  const [section, setSection] = useState("App Orientation");
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Lesson | null>(null);

  const visible = useMemo(
    () =>
      lessons.filter(
        (l) =>
          l.section === section &&
          (!query || `${l.title} ${l.description}`.toLowerCase().includes(query.toLowerCase())),
      ),
    [lessons, section, query],
  );

  const locked = (l: Lesson) => l.premium && !isPremium;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Learning Library</h1>
          <p className="text-sm text-slate-500">
            {lessons.length} video lessons — body systems, common conditions, care plans and app
            orientation.
          </p>
        </div>
        {!isPremium && (
          <Link
            href="/dashboard/billing"
            className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
          >
            Unlock all videos
          </Link>
        )}
      </header>

      <div className="flex flex-wrap gap-2">
        {LIBRARY_SECTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setSection(s)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              section === s
                ? "bg-slate-900 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search lessons…"
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
      />

      {active && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="font-semibold">{active.title}</h2>
              <p className="text-sm text-slate-500">
                {active.section} · {active.durationMin} min
              </p>
            </div>
            <button
              onClick={() => setActive(null)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
            >
              Close player
            </button>
          </div>
          <div className="mt-3 aspect-video w-full overflow-hidden rounded-xl bg-black">
            <iframe
              key={active.id}
              className="h-full w-full"
              src={`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(active.searchQuery)}`}
              title={active.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <p className="mt-3 text-sm text-slate-600">{active.description}</p>
          <a
            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(active.searchQuery)}`}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block text-sm font-medium text-teal-700 hover:underline"
          >
            Open more videos on this topic ↗
          </a>
        </div>
      )}

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-4xl">🎬</p>
          <p className="mt-3 font-semibold text-slate-700">No lessons match your search</p>
          <p className="mt-1 text-sm text-slate-500">Try another keyword or switch sections.</p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((l) => (
            <li key={l.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-2 flex items-center gap-2 text-xs">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">{l.topic}</span>
                <span className="text-slate-400">{l.durationMin} min</span>
                {l.premium && (
                  <span className="ml-auto rounded-full bg-amber-50 px-2.5 py-1 text-amber-700 ring-1 ring-amber-200">
                    Pro
                  </span>
                )}
              </div>
              <h3 className="font-semibold">{l.title}</h3>
              <p className="mt-1 flex-1 text-sm text-slate-500">{l.description}</p>
              {locked(l) ? (
                <Link
                  href="/dashboard/billing"
                  className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-center text-sm font-medium text-amber-800"
                >
                  🔒 Unlock with Pro
                </Link>
              ) : (
                <button
                  onClick={() => {
                    setActive(l);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="mt-4 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
                >
                  ▶ Watch lesson
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
