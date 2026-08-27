"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MIN_PAYOUT, REFEREE_BONUS_DAYS, REFERRAL_RATE, REFERRAL_STEPS } from "@/lib/referrals";
import { usd } from "@/lib/money";

export type Referral = {
  id: number;
  refereeName: string;
  refereeEmail: string;
  status: string;
  rewardAmount: number;
  plan: string | null;
  createdAt: string;
};

export type Payout = {
  id: number;
  amount: number;
  destination: string;
  status: string;
  createdAt: string;
};



export default function ReferClient({
  code,
  balance,
  referrals,
  payouts,
  name,
}: {
  code: string;
  balance: number;
  referrals: Referral[];
  payouts: Payout[];
  name: string;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState("");
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState((balance / 100).toFixed(2));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [localBalance, setLocalBalance] = useState(balance);
  const [localPayouts, setLocalPayouts] = useState(payouts);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const link = `${origin}/register?ref=${code}`;
  const share = `Hi! I'm using All Nursing Exams Prep Hub to prepare for the NCLEX — 1,000+ unique practice questions, video lessons and timed mock exams. Sign up with my link and get ${REFEREE_BONUS_DAYS} days of Pro free: ${link}`;

  const converted = referrals.filter((r) => r.status !== "signed_up");
  const lifetime = referrals.reduce((s, r) => s + r.rewardAmount, 0);

  function copy(text: string, tag: string) {
    navigator.clipboard.writeText(text);
    setCopied(tag);
    setTimeout(() => setCopied(""), 1800);
  }

  async function withdraw() {
    setBusy(true);
    setMsg(null);
    const cents = Math.round(Number(amount) * 100);
    const res = await fetch("/api/referrals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ destination, amount: cents }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return setMsg({ kind: "err", text: data.error ?? "Withdrawal failed." });
    setLocalPayouts((p) => [data.payout, ...p]);
    setLocalBalance((b) => b - cents);
    setMsg({ kind: "ok", text: "Withdrawal requested. MoMo transfer arrives within 48 hours." });
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header>
        <h1 className="text-2xl font-bold">Refer &amp; Earn</h1>
        <p className="text-sm text-slate-500">
          Earn {Math.round(REFERRAL_RATE * 100)}% cash every time a classmate you invite activates a
          paid plan.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Rewards wallet" value={usd(localBalance)} accent />
        <Stat label="Lifetime earned" value={usd(lifetime)} />
        <Stat label="Friends invited" value={String(referrals.length)} />
        <Stat label="Converted to Pro" value={String(converted.length)} />
      </section>

      <section className="rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 to-white p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Your referral code</p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <span className="rounded-xl bg-white px-4 py-2 font-mono text-2xl font-bold tracking-widest text-slate-900 ring-1 ring-teal-200">
            {code}
          </span>
          <button
            onClick={() => copy(code, "code")}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
          >
            {copied === "code" ? "Copied ✓" : "Copy code"}
          </button>
        </div>

        <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-teal-700">Your link</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <input
            readOnly
            value={link}
            className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
          />
          <button
            onClick={() => copy(link, "link")}
            className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
          >
            {copied === "link" ? "Copied ✓" : "Copy link"}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(share)}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl bg-[#25D366] px-4 py-2 text-sm font-semibold text-white"
          >
            Share on WhatsApp
          </a>
          <a
            href={`sms:?body=${encodeURIComponent(share)}`}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium"
          >
            Share via SMS
          </a>
          <a
            href={`mailto:?subject=${encodeURIComponent("Join me on All Nursing Exams Prep Hub")}&body=${encodeURIComponent(share)}`}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium"
          >
            Share via Email
          </a>
          <button
            onClick={() => copy(share, "msg")}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium"
          >
            {copied === "msg" ? "Message copied ✓" : "Copy invite message"}
          </button>
        </div>
        <p className="mt-3 text-xs text-slate-500">Invites are tracked automatically for {name}.</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {REFERRAL_STEPS.map((s, i) => (
          <div key={s.title} className="rounded-2xl border border-slate-200 bg-white p-5">
            <span className="text-2xl">{s.icon}</span>
            <p className="mt-2 text-xs font-semibold text-teal-700">STEP {i + 1}</p>
            <h3 className="font-semibold">{s.title}</h3>
            <p className="mt-1 text-sm text-slate-500">{s.body}</p>
          </div>
        ))}
      </section>

      {msg && (
        <p
          className={`rounded-xl px-4 py-3 text-sm ring-1 ${
            msg.kind === "ok"
              ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
              : "bg-rose-50 text-rose-700 ring-rose-200"
          }`}
        >
          {msg.text}
        </p>
      )}

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold">Withdraw to Mobile Money</h2>
          <p className="mt-1 text-sm text-slate-500">
            Available: <span className="font-semibold text-slate-800">{usd(localBalance)}</span> ·
            minimum withdrawal {usd(MIN_PAYOUT)}
          </p>
          <label className="mt-4 block">
            <span className="mb-1 block text-sm font-medium">MoMo number</span>
            <input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="0244123456"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </label>
          <label className="mt-3 block">
            <span className="mb-1 block text-sm font-medium">Amount (USD)</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </label>
          <button
            onClick={withdraw}
            disabled={busy || localBalance < MIN_PAYOUT}
            className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy
              ? "Requesting…"
              : localBalance < MIN_PAYOUT
                ? `Reach ${usd(MIN_PAYOUT)} to withdraw`
                : "Request withdrawal"}
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold">Withdrawal history</h2>
          {localPayouts.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-slate-300 p-8 text-center">
              <p className="text-3xl">🏦</p>
              <p className="mt-2 text-sm font-medium text-slate-700">No withdrawals yet</p>
              <p className="text-xs text-slate-500">Your MoMo payouts will appear here.</p>
            </div>
          ) : (
            <ul className="mt-4 space-y-2 text-sm">
              {localPayouts.map((p) => (
                <li key={p.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                  <span>
                    {usd(p.amount)} → {p.destination}
                  </span>
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs capitalize text-amber-700 ring-1 ring-amber-200">
                    {p.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <h2 className="border-b border-slate-100 p-5 font-semibold">Your referrals</h2>
        {referrals.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-4xl">🤝</p>
            <p className="mt-3 font-semibold text-slate-700">No referrals yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Share your link with your cohort — you earn on every plan they activate.
            </p>
            <button
              onClick={() => copy(link, "link")}
              className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
              Copy my referral link
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Student</th>
                  <th className="px-5 py-3">Joined</th>
                  <th className="px-5 py-3">Plan</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Reward</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {referrals.map((r) => (
                  <tr key={r.id}>
                    <td className="px-5 py-3">
                      <p className="font-medium">{r.refereeName}</p>
                      <p className="text-xs text-slate-500">{r.refereeEmail}</p>
                    </td>
                    <td className="px-5 py-3">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3 capitalize">{r.plan ?? "—"}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs ring-1 ${
                          r.status === "signed_up"
                            ? "bg-slate-100 text-slate-600 ring-slate-200"
                            : "bg-emerald-50 text-emerald-700 ring-emerald-200"
                        }`}
                      >
                        {r.status === "signed_up" ? "Signed up" : "Converted"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-medium">
                      {r.rewardAmount ? usd(r.rewardAmount) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        <h2 className="font-semibold text-slate-900">Programme terms</h2>
        <ul className="mt-3 space-y-1.5">
          <li>▸ Rewards are credited only when a referred student activates a paid plan.</li>
          <li>▸ Each new student may use one referral code, applied at sign-up only.</li>
          <li>▸ Self-referrals and duplicate accounts are removed and forfeit rewards.</li>
          <li>▸ Minimum withdrawal is {usd(MIN_PAYOUT)}; payouts are sent to mobile money within 48 hours.</li>
          <li>▸ Rewards have no expiry and can be accumulated across unlimited referrals.</li>
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className={`rounded-2xl border p-5 ${accent ? "border-teal-200 bg-teal-50" : "border-slate-200 bg-white"}`}
    >
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
    </div>
  );
}
