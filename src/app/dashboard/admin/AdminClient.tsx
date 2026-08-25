"use client";

import { useState } from "react";
import { ghsAmount, MOMO_NUMBER } from "@/lib/plans";
import { usd } from "@/lib/money";

export type AdminPayment = {
  id: number;
  plan: string;
  amount: number;
  reference: string;
  status: string;
  momoNumber: string;
  payerName: string;
  momoTransactionId: string;
  activationCode: string | null;
  createdAt: string;
  studentName: string | null;
  studentEmail: string | null;
};

export type AdminPayout = {
  id: number;
  userId: number;
  amount: number;
  method: string;
  destination: string;
  status: string;
  note: string;
  reviewedAt: string | null;
  createdAt: string;
  studentName: string | null;
  studentEmail: string | null;
};

export default function AdminClient({
  initialPayments,
  initialPayouts,
}: {
  initialPayments: AdminPayment[];
  initialPayouts: AdminPayout[];
}) {
  const [view, setView] = useState<"payments" | "payouts">("payments");
  const waitingPayouts = initialPayouts.filter((p) => p.status === "requested").length;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Admin</h1>
          <p className="text-sm text-slate-500">
            Verify incoming MoMo payments and send referral withdrawals.
          </p>
        </div>
        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
          <button
            onClick={() => setView("payments")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${
              view === "payments" ? "bg-slate-900 text-white" : "text-slate-600"
            }`}
          >
            Incoming payments
          </button>
          <button
            onClick={() => setView("payouts")}
            className={`relative rounded-lg px-4 py-2 text-sm font-semibold ${
              view === "payouts" ? "bg-slate-900 text-white" : "text-slate-600"
            }`}
          >
            Referral payouts
            {waitingPayouts > 0 && (
              <span className="ml-2 rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold text-amber-950">
                {waitingPayouts}
              </span>
            )}
          </button>
        </div>
      </header>

      {view === "payments" ? (
        <PaymentsPanel initial={initialPayments} />
      ) : (
        <PayoutsPanel initial={initialPayouts} />
      )}
    </div>
  );
}

function PaymentsPanel({ initial }: { initial: AdminPayment[] }) {
  const [rows, setRows] = useState(initial);
  const [tab, setTab] = useState("submitted");
  const [busy, setBusy] = useState(0);
  const [msg, setMsg] = useState("");

  const visible = rows.filter((r) => (tab === "all" ? true : r.status === tab));
  const counts = {
    submitted: rows.filter((r) => r.status === "submitted").length,
    success: rows.filter((r) => r.status === "success").length,
    pending: rows.filter((r) => r.status === "pending").length,
  };
  const revenue = rows.filter((r) => r.status === "success").reduce((s, r) => s + r.amount, 0);

  async function review(id: number, action: "approve" | "reject") {
    setBusy(id);
    setMsg("");
    const res = await fetch("/api/admin/payments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    const data = await res.json();
    setBusy(0);
    if (!res.ok) return setMsg(data.error ?? "Action failed.");
    setRows((p) => p.map((r) => (r.id === id ? { ...r, ...data.payment } : r)));
    setMsg(
      action === "approve"
        ? `Approved. Activation code ${data.code} is now visible to the student.`
        : "Payment rejected.",
    );
  }

  return (
    <>
      <section className="grid gap-4 sm:grid-cols-4">
        <Stat label="Awaiting review" value={String(counts.submitted)} accent />
        <Stat label="Approved" value={String(counts.success)} />
        <Stat label="Unpaid references" value={String(counts.pending)} />
        <Stat label="Revenue collected" value={usd(revenue)} />
      </section>

      <p className="text-sm text-slate-500">
        Match each transaction ID against your {MOMO_NUMBER} MoMo statement, then approve to release
        the activation code.
      </p>

      {msg && <p className="rounded-xl bg-slate-900 px-4 py-3 text-sm text-white">{msg}</p>}

      <div className="flex flex-wrap gap-2">
        {[
          ["submitted", "Awaiting review"],
          ["success", "Approved"],
          ["pending", "Unpaid"],
          ["rejected", "Rejected"],
          ["all", "All"],
        ].map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`rounded-xl px-4 py-2 text-sm font-medium ${
              tab === k ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <Empty icon="✅" title="Nothing here" body="No payments with this status right now." />
      ) : (
        <ul className="space-y-3">
          {visible.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {p.studentName ?? "Unknown"}{" "}
                  <span className="font-normal text-slate-500">({p.studentEmail})</span>
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  <span className="capitalize">{p.plan}</span> · {usd(p.amount)} · send GHS{" "}
                  {ghsAmount(p.amount / 100)} · {new Date(p.createdAt).toLocaleString()}
                </p>
                <div className="mt-2 grid gap-1 text-xs text-slate-500 sm:grid-cols-2">
                  <span>
                    Reference: <span className="font-mono text-slate-700">{p.reference}</span>
                  </span>
                  <span>
                    Txn ID:{" "}
                    <span className="font-mono font-semibold text-slate-900">
                      {p.momoTransactionId || "—"}
                    </span>
                  </span>
                  <span>Paid from: {p.momoNumber || "—"}</span>
                  <span>Payer name: {p.payerName || "—"}</span>
                </div>
                {p.activationCode && (
                  <p className="mt-2 font-mono text-sm font-semibold text-emerald-700">
                    {p.activationCode}
                  </p>
                )}
              </div>
              {p.status === "submitted" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => review(p.id, "approve")}
                    disabled={busy === p.id}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {busy === p.id ? "…" : "Approve & issue code"}
                  </button>
                  <button
                    onClick={() => review(p.id, "reject")}
                    disabled={busy === p.id}
                    className="rounded-xl border border-rose-200 px-4 py-2 text-sm text-rose-600"
                  >
                    Reject
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function PayoutsPanel({ initial }: { initial: AdminPayout[] }) {
  const [rows, setRows] = useState(initial);
  const [tab, setTab] = useState("requested");
  const [busy, setBusy] = useState(0);
  const [msg, setMsg] = useState("");

  const visible = rows.filter((r) => (tab === "all" ? true : r.status === tab));
  const requested = rows.filter((r) => r.status === "requested");
  const paid = rows.filter((r) => r.status === "paid");
  const owed = requested.reduce((s, r) => s + r.amount, 0);
  const sent = paid.reduce((s, r) => s + r.amount, 0);

  async function review(id: number, action: "pay" | "reject") {
    setBusy(id);
    setMsg("");
    const res = await fetch("/api/admin/payouts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    const data = await res.json();
    setBusy(0);
    if (!res.ok) return setMsg(data.error ?? "Action failed.");
    setRows((p) => p.map((r) => (r.id === id ? { ...r, ...data.payout } : r)));
    setMsg(
      action === "pay"
        ? "Marked as paid. Send the cedi amount shown to the student's MoMo number."
        : "Rejected. The amount has been returned to their wallet.",
    );
  }

  return (
    <>
      <section className="grid gap-4 sm:grid-cols-3">
        <Stat label="Waiting to send" value={String(requested.length)} accent />
        <Stat label="Amount owed" value={usd(owed)} />
        <Stat label="Already sent" value={usd(sent)} />
      </section>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">
        <p className="font-semibold">How to pay a withdrawal</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>Dial *170# → Transfer Money → MoMo User.</li>
          <li>Send the <strong>Send exactly</strong> cedi amount to the student&apos;s number.</li>
          <li>Come back here and tap <strong>Mark as paid</strong>.</li>
        </ol>
        <p className="mt-2 text-xs">
          Rejecting a request refunds their wallet so they can withdraw again. Never mark as paid
          until the transfer has gone through.
        </p>
      </div>

      {msg && <p className="rounded-xl bg-slate-900 px-4 py-3 text-sm text-white">{msg}</p>}

      <div className="flex flex-wrap gap-2">
        {[
          ["requested", "Waiting"],
          ["paid", "Paid"],
          ["rejected", "Rejected"],
          ["all", "All"],
        ].map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`rounded-xl px-4 py-2 text-sm font-medium ${
              tab === k ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <Empty icon="🏦" title="No payouts here" body="Withdrawal requests will appear in this queue." />
      ) : (
        <ul className="space-y-3">
          {visible.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {p.studentName ?? "Unknown"}{" "}
                  <span className="font-normal text-slate-500">({p.studentEmail})</span>
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {usd(p.amount)} · send <span className="font-semibold">GHS {ghsAmount(p.amount / 100)}</span>{" "}
                  · {new Date(p.createdAt).toLocaleString()}
                </p>
                <div className="mt-2 grid gap-1 text-xs text-slate-500 sm:grid-cols-2">
                  <span>
                    Send to:{" "}
                    <span className="font-mono font-semibold text-slate-900">{p.destination}</span>
                  </span>
                  <span>Method: {p.method === "mtn_momo" ? "MTN Mobile Money" : p.method}</span>
                  {p.note && <span className="sm:col-span-2">{p.note}</span>}
                </div>
              </div>
              {p.status === "requested" ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => review(p.id, "pay")}
                    disabled={busy === p.id}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {busy === p.id ? "…" : "Mark as paid"}
                  </button>
                  <button
                    onClick={() => review(p.id, "reject")}
                    disabled={busy === p.id}
                    className="rounded-xl border border-rose-200 px-4 py-2 text-sm text-rose-600"
                  >
                    Reject &amp; refund
                  </button>
                </div>
              ) : (
                <span
                  className={`rounded-full px-2.5 py-1 text-xs capitalize ring-1 ${
                    p.status === "paid"
                      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                      : "bg-rose-50 text-rose-700 ring-rose-200"
                  }`}
                >
                  {p.status}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className={`rounded-2xl border p-5 ${accent ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-white"}`}
    >
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

function Empty({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
      <p className="text-4xl">{icon}</p>
      <p className="mt-3 font-semibold text-slate-700">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{body}</p>
    </div>
  );
}
