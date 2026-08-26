"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: "◎" },
  { href: "/dashboard/tasks", label: "Study Tasks", icon: "☑" },
  { href: "/dashboard/questions", label: "Question Bank", icon: "❓" },
  { href: "/dashboard/practice", label: "Practice Quiz", icon: "✎" },
  { href: "/dashboard/cat", label: "CAT Adaptive Test", icon: "🧠" },
  { href: "/dashboard/mock", label: "Mock Exam", icon: "⏱" },
  { href: "/dashboard/careplans", label: "Care Plans", icon: "📋" },
  { href: "/dashboard/library", label: "Learning Library", icon: "🎬" },
  { href: "/dashboard/progress", label: "Progress", icon: "📈" },
  { href: "/dashboard/strategies", label: "Exam Strategies", icon: "🎯" },
  { href: "/dashboard/refer", label: "Refer & Earn", icon: "🎁" },
  { href: "/dashboard/security", label: "Security", icon: "🛡" },
  { href: "/dashboard/faq", label: "FAQ", icon: "💬" },
  { href: "/dashboard/billing", label: "Billing & Plans", icon: "💳" },
];

export default function Sidebar({
  user,
}: {
  user: { name: string; email: string; plan: string; isPremium: boolean; isAdmin: boolean };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const items = user.isAdmin
    ? [...NAV, { href: "/dashboard/admin", label: "Verify Payments", icon: "🛡" }]
    : NAV;

  const nav = (
    <nav className="flex flex-1 flex-col gap-1">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              active ? "bg-teal-500/15 text-teal-300" : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span className="w-5 text-center">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const footer = (
    <div className="border-t border-white/10 pt-4">
      <div className="mb-3 flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-teal-500 text-sm font-bold text-slate-900">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">{user.name}</p>
          <p className="truncate text-xs text-slate-400">{user.email}</p>
        </div>
      </div>
      <div className="mb-3">
        {user.isPremium ? (
          <span className="block rounded-lg bg-emerald-500/15 px-3 py-1.5 text-center text-xs font-semibold capitalize text-emerald-300">
            ★ Pro · {user.plan}
          </span>
        ) : (
          <Link
            href="/dashboard/billing"
            onClick={() => setOpen(false)}
            className="block rounded-lg bg-teal-500 px-3 py-1.5 text-center text-xs font-semibold text-slate-900 hover:bg-teal-400"
          >
            Upgrade to Pro
          </Link>
        )}
      </div>
      <button
        onClick={logout}
        className="w-full rounded-lg border border-white/15 px-3 py-2 text-sm text-slate-300 hover:bg-white/5"
      >
        Sign out
      </button>
    </div>
  );

  return (
    <>
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <span className="flex items-center gap-2 font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-teal-500 text-white">✚</span>
          All Nursing Exams Prep Hub
        </span>
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      <aside
        className={`${open ? "flex" : "hidden"} w-full flex-col gap-4 bg-slate-900 p-4 lg:flex lg:h-screen lg:w-64 lg:flex-shrink-0 lg:sticky lg:top-0`}
      >
        <div className="hidden items-center gap-2 px-2 py-2 text-white lg:flex">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-500">✚</span>
          <span className="font-semibold">All Nursing Exams Prep Hub</span>
        </div>
        {nav}
        {footer}
      </aside>
    </>
  );
}
