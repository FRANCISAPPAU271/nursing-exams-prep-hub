"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { REFEREE_BONUS_DAYS } from "@/lib/referrals";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const isRegister = mode === "register";
  const [name, setName] = useState("");
  const [email, setEmail] = useState(isRegister ? "" : "demo@nursingprep.app");
  const [password, setPassword] = useState(isRegister ? "" : "demo1234");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const params = useSearchParams();
  const [ref, setRef] = useState((params.get("ref") ?? "").toUpperCase());
  const inactivityReason = params.get("reason") === "inactivity";
  // Forgot-password flow: request -> verify code -> set new password
  const [flow, setFlow] = useState<"signin" | "forgot" | "reset">("signin");
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [resetMsg, setResetMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [resetBusy, setResetBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (isRegister && password !== confirmPassword) {
      setConfirmError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");
    setConfirmError("");
    const res = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, ref }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  async function requestReset(e: React.FormEvent) {
    e.preventDefault();
    setResetBusy(true);
    setResetMsg(null);
    const res = await fetch("/api/auth/forgot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: resetEmail }),
    });
    const data = await res.json();
    setResetBusy(false);
    if (!res.ok) return setResetMsg({ kind: "err", text: data.error ?? "Could not start reset." });
    setResetMsg({ kind: "ok", text: data.message });
    setFlow("reset");
  }

  async function completeReset(e: React.FormEvent) {
    e.preventDefault();
    setResetBusy(true);
    setResetMsg(null);
    const res = await fetch("/api/auth/forgot", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: resetCode, password: newPassword }),
    });
    const data = await res.json();
    setResetBusy(false);
    if (!res.ok) return setResetMsg({ kind: "err", text: data.error ?? "Could not reset password." });
    setResetMsg({ kind: "ok", text: data.message });
    setTimeout(() => setFlow("signin"), 2200);
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-6 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 flex items-center justify-center gap-2 text-lg font-semibold text-slate-900">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-500 text-white">✚</span>
          All Nursing Exams Prep Hub
        </Link>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          {inactivityReason && (
            <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">
              ⏳ You were signed out automatically after a period of inactivity. Please sign in again
              to continue studying.
            </p>
          )}
          <h1 className="text-2xl font-bold">{isRegister ? "Create your account" : "Welcome back"}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {isRegister
              ? "Start planning your NMC or NCLEX prep in minutes."
              : "Sign in to continue your study plan."}
          </p>

          {flow === "forgot" && (
            <form onSubmit={requestReset} className="mt-6 space-y-4">
              <p className="text-sm text-slate-600">
                Enter the email on your account. A 6-digit code will be created and our support team
                will verify your identity and send it to you on WhatsApp.
              </p>
              <Field label="Email address">
                <input
                  type="email"
                  className={inputCls}
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
              </Field>
              {resetMsg && (
                <p
                  className={`rounded-lg px-3 py-2 text-sm ring-1 ${
                    resetMsg.kind === "ok"
                      ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
                      : "bg-rose-50 text-rose-700 ring-rose-200"
                  }`}
                >
                  {resetMsg.text}
                </p>
              )}
              <button
                type="submit"
                disabled={resetBusy}
                className="w-full rounded-xl bg-teal-600 px-4 py-2.5 font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
              >
                {resetBusy ? "Creating code…" : "Get a reset code"}
              </button>
              <p className="text-center text-sm text-slate-500">
                <button
                  type="button"
                  onClick={() => {
                    setFlow("signin");
                    setResetMsg(null);
                  }}
                  className="font-medium text-teal-700 hover:underline"
                >
                  Back to sign in
                </button>
              </p>
            </form>
          )}

          {flow === "reset" && (
            <form onSubmit={completeReset} className="mt-6 space-y-4">
              <Field label="6-digit reset code">
                <input
                  className={`${inputCls} font-mono tracking-[0.3em]`}
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="123456"
                  inputMode="numeric"
                  required
                />
              </Field>
              <Field label="New password">
                <input
                  type="password"
                  className={inputCls}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </Field>
              {resetMsg && (
                <p
                  className={`rounded-lg px-3 py-2 text-sm ring-1 ${
                    resetMsg.kind === "ok"
                      ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
                      : "bg-rose-50 text-rose-700 ring-rose-200"
                  }`}
                >
                  {resetMsg.text}
                </p>
              )}
              <button
                type="submit"
                disabled={resetBusy || resetCode.length !== 6}
                className="w-full rounded-xl bg-teal-600 px-4 py-2.5 font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
              >
                {resetBusy ? "Updating…" : "Set new password"}
              </button>
              <p className="text-center text-sm text-slate-500">
                <button
                  type="button"
                  onClick={() => {
                    setFlow("signin");
                    setResetMsg(null);
                  }}
                  className="font-medium text-teal-700 hover:underline"
                >
                  Back to sign in
                </button>
              </p>
            </form>
          )}

          {flow === "signin" && (
          <form onSubmit={submit} className="mt-6 space-y-4">
            {isRegister && (
              <Field label="Full name">
                <input
                  className={inputCls}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jordan Rivera"
                  required
                />
              </Field>
            )}
            <Field label="Email">
              <input
                type="email"
                className={inputCls}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Field>
            <Field label="Password">
              <input
                type="password"
                className={inputCls}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (confirmPassword) {
                    setConfirmError(
                      confirmPassword !== e.target.value ? "Passwords do not match." : "",
                    );
                  }
                }}
                minLength={6}
                required
              />
            </Field>
            {isRegister && (
              <Field label="Confirm password">
                <input
                  type="password"
                  className={`${inputCls} ${
                    confirmPassword && confirmPassword !== password
                      ? "border-rose-400 focus:border-rose-400 focus:ring-rose-100"
                      : ""
                  }`}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setConfirmError(
                      e.target.value !== password ? "Passwords do not match." : "",
                    );
                  }}
                  minLength={6}
                  required
                />
              </Field>
            )}
            {isRegister && confirmPassword && confirmPassword !== password && (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">
                Passwords do not match.
              </p>
            )}

            {isRegister && (
              <Field label="Referral code (optional)">
                <input
                  className={`${inputCls} font-mono uppercase`}
                  value={ref}
                  onChange={(e) => setRef(e.target.value.toUpperCase())}
                  placeholder="AMARA7XQ2"
                />
                <span className="mt-1 block text-xs text-teal-700">
                  Join with a friend&apos;s code and get {REFEREE_BONUS_DAYS} days of Pro free.
                </span>
              </Field>
            )}

            {error && (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-teal-600 px-4 py-2.5 font-semibold text-white transition hover:bg-teal-700 disabled:opacity-60"
            >
              {loading ? "Please wait…" : isRegister ? "Create account" : "Sign in"}
            </button>
          </form>
          )}

          {flow === "signin" && !isRegister && (
            <p className="mt-3 text-center text-sm">
              <button
                type="button"
                onClick={() => {
                  setFlow("forgot");
                  setResetMsg(null);
                }}
                className="font-medium text-slate-500 hover:text-teal-700 hover:underline"
              >
                Forgot your password?
              </button>
            </p>
          )}

          <p className="mt-4 rounded-xl bg-slate-50 px-3 py-2.5 text-xs text-slate-600">
            🛡 One account, one device. Signing in here will sign you out everywhere else.
          </p>

          <p className="mt-6 text-center text-sm text-slate-500">
            {isRegister ? "Already have an account? " : "New here? "}
            <Link href={isRegister ? "/login" : "/register"} className="font-medium text-teal-700 hover:underline">
              {isRegister ? "Sign in" : "Create an account"}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

const inputCls =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}
