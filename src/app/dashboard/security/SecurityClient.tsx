"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type Device = {
  id: string;
  deviceLabel: string;
  ip: string;
  lastSeenAt: string;
  createdAt: string;
  revoked: boolean;
};

export type Event = {
  id: number;
  kind: string;
  detail: string;
  ip: string;
  createdAt: string;
};

const KIND_LABEL: Record<string, { label: string; style: string }> = {
  login: { label: "Sign-in", style: "bg-slate-100 text-slate-700 ring-slate-200" },
  session_evicted: {
    label: "Other device signed out",
    style: "bg-amber-50 text-amber-800 ring-amber-200",
  },
  screenshot_attempt: {
    label: "Screenshot blocked",
    style: "bg-rose-50 text-rose-700 ring-rose-200",
  },
  copy_attempt: { label: "Copy blocked", style: "bg-rose-50 text-rose-700 ring-rose-200" },
  save_attempt: { label: "Save blocked", style: "bg-rose-50 text-rose-700 ring-rose-200" },
};

export default function SecurityClient({
  currentSessionId,
  devices,
  events,
}: {
  currentSessionId: string;
  devices: Device[];
  events: Event[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });

  const active = devices.filter((d) => !d.revoked);

  async function signOutOthers() {
    setBusy(true);
    setMsg("");
    const res = await fetch("/api/security/sessions", { method: "DELETE" });
    const data = await res.json();
    setBusy(false);
    setMsg(
      res.ok
        ? `Signed out ${data.revoked} other device(s).`
        : (data.error ?? "Could not sign out other devices."),
    );
    router.refresh();
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pw.next !== pw.confirm) return setMsg("New passwords do not match.");
    setBusy(true);
    setMsg("");
    const res = await fetch("/api/security/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current: pw.current, next: pw.next }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return setMsg(data.error ?? "Could not change password.");
    setPw({ current: "", next: "", confirm: "" });
    setMsg("Password changed. All other devices have been signed out.");
    router.refresh();
  }

  const input =
    "w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Account security</h1>
        <p className="text-sm text-slate-500">
          Your subscription is for one person. Only one device can be signed in at a time.
        </p>
      </header>

      {msg && (
        <p className="rounded-xl bg-slate-900 px-4 py-3 text-sm text-white">{msg}</p>
      )}

      <section className="rounded-2xl border border-teal-200 bg-teal-50 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold text-teal-900">Single-device protection is on</h2>
            <ul className="mt-2 space-y-1 text-sm text-teal-900">
              <li>▸ Signing in anywhere else immediately signs this device out.</li>
              <li>▸ Study pages are watermarked with your name and email.</li>
              <li>▸ Copying, printing and right-click are disabled on content.</li>
              <li>▸ Content is hidden whenever the tab loses focus.</li>
            </ul>
          </div>
          <span className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-teal-700 ring-1 ring-teal-300">
            {active.length} active device{active.length === 1 ? "" : "s"}
          </span>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
          <h2 className="font-semibold">Devices</h2>
          <button
            onClick={signOutOthers}
            disabled={busy}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-60"
          >
            Sign out all other devices
          </button>
        </div>
        <ul className="divide-y divide-slate-100">
          {devices.map((d) => (
            <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 p-5">
              <div>
                <p className="font-medium">
                  {d.deviceLabel}
                  {d.id === currentSessionId && (
                    <span className="ml-2 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs text-emerald-700 ring-1 ring-emerald-200">
                      This device
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {d.ip ? `IP ${d.ip} · ` : ""}last active {new Date(d.lastSeenAt).toLocaleString()}
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs ring-1 ${
                  d.revoked
                    ? "bg-slate-100 text-slate-500 ring-slate-200"
                    : "bg-emerald-50 text-emerald-700 ring-emerald-200"
                }`}
              >
                {d.revoked ? "Signed out" : "Active"}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold">Change password</h2>
        <p className="mt-1 text-sm text-slate-500">
          Changing your password signs out every other device immediately.
        </p>
        <form onSubmit={changePassword} className="mt-4 grid gap-3 sm:grid-cols-3">
          <input
            type="password"
            className={input}
            placeholder="Current password"
            value={pw.current}
            onChange={(e) => setPw({ ...pw, current: e.target.value })}
            required
          />
          <input
            type="password"
            className={input}
            placeholder="New password"
            minLength={6}
            value={pw.next}
            onChange={(e) => setPw({ ...pw, next: e.target.value })}
            required
          />
          <input
            type="password"
            className={input}
            placeholder="Confirm new password"
            minLength={6}
            value={pw.confirm}
            onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
            required
          />
          <button
            disabled={busy}
            className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60 sm:col-span-1"
          >
            {busy ? "Saving…" : "Update password"}
          </button>
        </form>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <h2 className="border-b border-slate-100 p-5 font-semibold">Recent security activity</h2>
        {events.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-3xl">🛡</p>
            <p className="mt-2 text-sm font-medium text-slate-700">No activity recorded yet</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {events.map((e) => {
              const k = KIND_LABEL[e.kind] ?? {
                label: e.kind,
                style: "bg-slate-100 text-slate-600 ring-slate-200",
              };
              return (
                <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
                  <div className="min-w-0">
                    <span className={`rounded-full px-2.5 py-1 text-xs ring-1 ${k.style}`}>
                      {k.label}
                    </span>
                    <p className="mt-1 text-sm text-slate-600">{e.detail}</p>
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(e.createdAt).toLocaleString()}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
