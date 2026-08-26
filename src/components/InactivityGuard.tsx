"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Auto sign-out after inactivity.
 *
 * Server side (`src/lib/auth.ts`) revokes the session after 20 idle minutes.
 * This component mirrors that window so the student gets a friendly warning
 * and a chance to stay signed in — rather than being silently dumped at the
 * login screen mid-question.
 *
 * Activity = mouse move, key press, click, scroll or touch. While any of those
 * happen the client keeps the session alive; only genuine absence counts.
 */
const LIMIT_MS = 20 * 60 * 1000; // must match INACTIVITY_LIMIT_MS
const WARN_BEFORE_MS = 2 * 60 * 1000; // show the warning 2 minutes before
const HEARTBEAT_MS = 60 * 1000; // ping at most once a minute while active

export default function InactivityGuard() {
  const [idleMs, setIdleMs] = useState(0);
  const [warningOpen, setWarningOpen] = useState(false);
  const lastActivity = useRef(Date.now());
  const signingOut = useRef(false);

  const doSignOut = useCallback(() => {
    if (signingOut.current) return;
    signingOut.current = true;
    // Full navigation drops the protected page and any cached state.
    window.location.href = "/login?reason=inactivity";
  }, []);

  // Track genuine user activity.
  useEffect(() => {
    const mark = () => {
      lastActivity.current = Date.now();
    };
    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click"];
    events.forEach((e) => window.addEventListener(e, mark, { passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, mark));
  }, []);

  // Idle timer + warning window.
  useEffect(() => {
    const tick = setInterval(() => {
      const idle = Date.now() - lastActivity.current;
      setIdleMs(idle);

      if (idle >= LIMIT_MS) {
        setWarningOpen(true);
        doSignOut();
      } else if (idle >= LIMIT_MS - WARN_BEFORE_MS) {
        setWarningOpen(true);
      } else if (warningOpen) {
        setWarningOpen(false);
      }
    }, 1000);
    return () => clearInterval(tick);
  }, [doSignOut, warningOpen]);

  // Keep the server session fresh while the user is active.
  useEffect(() => {
    const ping = () => {
      const idle = Date.now() - lastActivity.current;
      if (idle < LIMIT_MS - WARN_BEFORE_MS) {
        void fetch("/api/security/heartbeat", { method: "POST" }).catch(() => {});
      }
    };
    ping();
    const t = setInterval(ping, HEARTBEAT_MS);
    return () => clearInterval(t);
  }, []);

  // Extend the session when the user responds to the warning.
  function staySignedIn() {
    lastActivity.current = Date.now();
    setIdleMs(0);
    setWarningOpen(false);
    void fetch("/api/security/heartbeat", { method: "POST" }).catch(() => {});
  }

  if (!warningOpen) return null;

  const secondsLeft = Math.max(0, Math.ceil((LIMIT_MS - idleMs) / 1000));
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-900/85 p-4 backdrop-blur-md">
      <div className="w-full max-w-md rounded-2xl bg-white p-7 text-center shadow-2xl">
        <p className="text-4xl">⏳</p>
        <h2 className="mt-3 text-lg font-bold text-slate-900">Still studying?</h2>
        <p className="mt-2 text-sm text-slate-600">
          You have been inactive for a while. For your security on shared computers, you will be
          signed out automatically.
        </p>

        <p className="mt-4 font-mono text-3xl font-bold text-teal-700">
          {mins}:{String(secs).padStart(2, "0")}
        </p>
        <p className="text-xs text-slate-500">until automatic sign-out</p>

        <button
          onClick={staySignedIn}
          className="mt-5 w-full rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-700"
        >
          I&apos;m still here — keep me signed in
        </button>

        <button
          onClick={doSignOut}
          className="mt-2 w-full rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Sign out now
        </button>
      </div>
    </div>
  );
}
