"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ghsAmount,
  MOMO_NAME,
  MOMO_NETWORK,
  MOMO_NUMBER,
  MOMO_STEPS,
  MOMO_USSD,
  PLANS,
} from "@/lib/plans";
import { usd, usdWhole } from "@/lib/money";

export type Payment = {
  id: number;
  plan: string;
  amount: number;
  reference: string;
  status: string;
  momoTransactionId: string;
  reviewNote: string;
  activationCode: string | null;
  createdAt: string;
};

const input =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100";

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-slate-100 text-slate-600 ring-slate-200",
  submitted: "bg-amber-50 text-amber-700 ring-amber-200",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  rejected: "bg-rose-50 text-rose-700 ring-rose-200",
};
const STATUS_LABEL: Record<string, string> = {
  pending: "Awaiting payment",
  submitted: "Verifying",
  success: "Confirmed",
  rejected: "Rejected",
};

export default function BillingClient({
  plan,
  planExpiresAt,
  isPremium,
  initialPayments,
}: {
  plan: string;
  planExpiresAt: string | null;
  isPremium: boolean;
  initialPayments: Payment[];
}) {
  const router = useRouter();
  const [payments, setPayments] = useState(initialPayments);
  const [selected, setSelected] = useState("monthly");
  const [pending, setPending] = useState<Payment | null>(
    initialPayments.find((p) => p.status === "pending") ?? null,
  );
  const [txnId, setTxnId] = useState("");
  const [momo, setMomo] = useState("");
  const [payerName, setPayerName] = useState("");
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState("");
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const chosen = PLANS.find((p) => p.id === selected)!;
  const issued = payments.find((p) => p.status === "success" && p.activationCode);

  function copy(text: string, tag: string) {
    navigator.clipboard.writeText(text);
    setCopied(tag);
    setTimeout(() => setCopied(""), 1800);
  }

  async function startPayment() {
    setBusy("start");
    setMsg(null);
    const res = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: selected, momoNumber: momo, payerName }),
    });
    const data = await res.json();
    setBusy("");
    if (!res.ok) return setMsg({ kind: "err", text: data.error ?? "Could not start payment." });
    setPayments((p) => [data.payment, ...p]);
    setPending(data.payment);
  }

  async function submitProof() {
    if (!pending) return;
    setBusy("submit");
    setMsg(null);
    const res = await fetch("/api/payments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reference: pending.reference,
        transactionId: txnId,
        momoNumber: momo,
        payerName,
      }),
    });
    const data = await res.json();
    setBusy("");
    if (!res.ok) return setMsg({ kind: "err", text: data.error ?? "Could not submit payment." });
    setPayments((p) => p.map((x) => (x.reference === pending.reference ? data.payment : x)));
    setPending(null);
    setTxnId("");
    setMsg({ kind: "ok", text: data.message });
    router.refresh();
  }

  async function activate() {
    setBusy("activate");
    setMsg(null);
    const res = await fetch("/api/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    setBusy("");
    if (!res.ok) return setMsg({ kind: "err", text: data.error ?? "Activation failed." });
    setMsg({ kind: "ok", text: data.message ?? "🎉 Account activated! Pro features are unlocked." });
    setTimeout(() => {
      window.location.reload();
    }, 1200);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Payment plans & activation</h1>
          <p className="text-sm text-slate-500">
            Pay with {MOMO_NETWORK} to <span className="font-semibold">{MOMO_NUMBER}</span> — no card
            needed.
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1.5 text-sm font-medium ring-1 ${
            isPremium
              ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
              : "bg-slate-100 text-slate-600 ring-slate-200"
          }`}
        >
          {isPremium
            ? `Pro (${plan}) · expires ${planExpiresAt ? new Date(planExpiresAt).toLocaleDateString() : "—"}`
            : "Free plan"}
        </span>
      </header>

      {isPremium && (
        <section className="rounded-2xl border border-emerald-300 bg-gradient-to-r from-emerald-50 to-teal-50 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎉</span>
            <div>
              <h2 className="text-lg font-bold text-emerald-950">
                Your Account is Active on Pro ({plan})!
              </h2>
              <p className="mt-1 text-sm text-emerald-800">
                All 1,000+ NCLEX and Midwifery questions, adaptive CAT tests, full timed mock exams, care plans and the complete video learning library are unlocked{planExpiresAt ? ` until ${new Date(planExpiresAt).toLocaleDateString()}` : ""}.
              </p>
            </div>
          </div>
        </section>
      )}

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

      {/* Plans */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {PLANS.map((p) => (
          <div
            key={p.id}
            className={`flex flex-col rounded-2xl border p-5 ${
              selected === p.id && p.price > 0
                ? "border-teal-500 ring-2 ring-teal-100"
                : "border-slate-200"
            } ${p.highlight ? "bg-teal-50/40" : "bg-white"}`}
          >
            <h2 className="font-semibold">{p.name}</h2>
            <p className="text-xs text-slate-500">{p.tagline}</p>
            <p className="mt-3 text-3xl font-bold">
              {p.price === 0 ? "Free" : usdWhole(p.price)}
            </p>
            <ul className="mt-4 flex-1 space-y-1.5 text-sm text-slate-600">
              {p.features.map((f) => (
                <li key={f} className="flex gap-2">
                  <span className="text-teal-600">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <button
              disabled={p.price === 0}
              onClick={() => setSelected(p.id)}
              className={`mt-4 rounded-xl px-4 py-2 text-sm font-semibold ${
                p.price === 0
                  ? "cursor-default border border-slate-200 text-slate-400"
                  : selected === p.id
                    ? "bg-teal-600 text-white"
                    : "border border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {p.price === 0 ? "Included" : selected === p.id ? "Selected" : "Choose plan"}
            </button>
          </div>
        ))}
      </section>

      {/* Step 1 — get reference */}
      {!pending && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold">Step 1 · Get your payment reference</h2>
          <p className="mt-1 text-sm text-slate-500">
            You are paying <span className="font-semibold text-slate-800">{usdWhole(chosen.price)}</span> for{" "}
            {chosen.name} — send{" "}
            <span className="font-semibold text-slate-800">GHS {ghsAmount(chosen.price)}</span> by
            Mobile Money.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label>
              <span className="mb-1 block text-sm font-medium">Name on your MoMo account</span>
              <input
                className={input}
                value={payerName}
                onChange={(e) => setPayerName(e.target.value)}
                placeholder="Ama Serwaa"
              />
            </label>
            <label>
              <span className="mb-1 block text-sm font-medium">Your MoMo number</span>
              <input
                className={input}
                value={momo}
                onChange={(e) => setMomo(e.target.value)}
                placeholder="0244123456"
              />
            </label>
          </div>
          <button
            onClick={startPayment}
            disabled={busy === "start"}
            className="mt-4 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
          >
            {busy === "start" ? "Generating…" : `Generate reference for ${usdWhole(chosen.price)}`}
          </button>
        </section>
      )}

      {/* Step 2 — pay + submit proof */}
      {pending && (
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <h2 className="font-semibold text-amber-900">Step 2 · Send the money</h2>
            <div className="mt-3 space-y-2 rounded-xl bg-white p-4">
              <Row label="Network" value={MOMO_NETWORK} />
              <Row label="Number" value={MOMO_NUMBER} big onCopy={() => copy(MOMO_NUMBER, "num")} copied={copied === "num"} />
              <Row label="Account name" value={MOMO_NAME} />
              <Row label="Plan price" value={usd(pending.amount)} />
              <Row
                label="Send exactly"
                value={`GHS ${ghsAmount(pending.amount / 100)}`}
                big
              />
              <Row
                label="Reference"
                value={pending.reference}
                mono
                onCopy={() => copy(pending.reference, "ref")}
                copied={copied === "ref"}
              />
            </div>
            <ol className="mt-4 space-y-1.5 text-sm text-amber-900">
              {MOMO_STEPS.map((s, i) => (
                <li key={s} className="flex gap-2">
                  <span className="font-semibold">{i + 1}.</span>
                  {s}
                </li>
              ))}
            </ol>
            <a
              href={`tel:${encodeURIComponent(MOMO_USSD)}`}
              className="mt-4 block rounded-xl bg-amber-500 px-4 py-2.5 text-center text-sm font-semibold text-white sm:hidden"
            >
              Dial {MOMO_USSD} now
            </a>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="font-semibold">Step 3 · Submit your MoMo receipt</h2>
            <p className="mt-1 text-sm text-slate-500">
              After paying you get an SMS like “…Transaction ID: <b>1234567890</b>”. Enter that ID so
              we can match your payment.
            </p>
            <label className="mt-4 block">
              <span className="mb-1 block text-sm font-medium">MoMo transaction ID</span>
              <input
                className={`${input} font-mono`}
                value={txnId}
                onChange={(e) => setTxnId(e.target.value.toUpperCase())}
                placeholder="1234567890"
              />
            </label>
            <label className="mt-3 block">
              <span className="mb-1 block text-sm font-medium">Number you paid from</span>
              <input
                className={input}
                value={momo}
                onChange={(e) => setMomo(e.target.value)}
                placeholder="0244123456"
              />
            </label>
            <label className="mt-3 block">
              <span className="mb-1 block text-sm font-medium">Name on the MoMo account</span>
              <input
                className={input}
                value={payerName}
                onChange={(e) => setPayerName(e.target.value)}
                placeholder="Ama Serwaa"
              />
            </label>
            <button
              onClick={submitProof}
              disabled={busy === "submit"}
              className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {busy === "submit" ? "Submitting…" : "I have paid — submit for verification"}
            </button>
            <button
              onClick={() => setPending(null)}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <p className="mt-3 text-xs text-slate-500">
              Payments are verified manually, usually within a few hours. You will find your
              activation code here and can also send the SMS screenshot to {MOMO_NUMBER} on WhatsApp
              to speed things up.
            </p>
          </div>
        </section>
      )}

      {/* Activation */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">Step 4 · Activate with your code</h2>
            <p className="mt-1 text-sm text-slate-500">
              {isPremium
                ? "Your account is already active with Pro access. You can enter an additional code here to extend your subscription anytime."
                : "Once your payment is confirmed, your activation code appears below. Enter it to unlock Pro immediately."}
            </p>
          </div>
          {isPremium && (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
              ✓ Pro Unlocked
            </span>
          )}
        </div>

        {issued && (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-emerald-50 p-4 ring-1 ring-emerald-200">
            <div>
              <p className="text-xs uppercase tracking-wide text-emerald-700">Your latest activation code</p>
              <p className="mt-1 font-mono text-xl font-bold text-emerald-900">
                {issued.activationCode}
              </p>
            </div>
            <button
              onClick={() => setCode(issued.activationCode!)}
              className="ml-auto rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-emerald-100"
            >
              Copy to input
            </button>
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <input
            className={`${input} max-w-xs font-mono uppercase`}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s+/g, ""))}
            placeholder="PREP-XXXX-XXXX"
          />
          <button
            onClick={activate}
            disabled={busy === "activate" || !code}
            className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60 hover:bg-teal-700"
          >
            {busy === "activate" ? "Activating…" : isPremium ? "Extend subscription" : "Activate account"}
          </button>
        </div>
      </section>

      {/* History */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <h2 className="border-b border-slate-100 p-5 font-semibold">Payment history</h2>
        {payments.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-4xl">🧾</p>
            <p className="mt-2 font-medium text-slate-700">No payments yet</p>
            <p className="text-sm text-slate-500">Choose a plan above to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Plan</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Reference</th>
                  <th className="px-5 py-3">Txn ID</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Code</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="px-5 py-3">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3 capitalize">{p.plan}</td>
                    <td className="px-5 py-3">{usd(p.amount)}</td>
                    <td className="px-5 py-3 font-mono text-xs">{p.reference}</td>
                    <td className="px-5 py-3 font-mono text-xs">{p.momoTransactionId || "—"}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs ring-1 ${STATUS_STYLE[p.status]}`}
                      >
                        {STATUS_LABEL[p.status] ?? p.status}
                      </span>
                      {p.reviewNote && (
                        <p className="mt-1 text-xs text-slate-500">{p.reviewNote}</p>
                      )}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs">{p.activationCode ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Row({
  label,
  value,
  big,
  mono,
  onCopy,
  copied,
}: {
  label: string;
  value: string;
  big?: boolean;
  mono?: boolean;
  onCopy?: () => void;
  copied?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs uppercase tracking-wide text-slate-500">{label}</span>
      <span className="flex items-center gap-2">
        <span
          className={`${big ? "text-lg font-bold" : "font-medium"} ${mono ? "font-mono text-sm" : ""}`}
        >
          {value}
        </span>
        {onCopy && (
          <button
            onClick={onCopy}
            className="rounded border border-slate-300 px-2 py-0.5 text-xs text-slate-600"
          >
            {copied ? "✓" : "Copy"}
          </button>
        )}
      </span>
    </div>
  );
}
