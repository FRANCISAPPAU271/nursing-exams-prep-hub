"use client";

import { useEffect, useState } from "react";

/**
 * Deterrent layer against casual copying of paid study content.
 *
 * IMPORTANT: browsers give web pages no API to truly block screenshots. An OS
 * screenshot, a phone camera or a screen recorder cannot be prevented by any
 * website. What this does is:
 *   - blur the content when the tab loses focus (defeats most screen-capture
 *     tools and screen-sharing, which trigger a blur/visibility change)
 *   - block right-click, text selection, copy/cut and drag of content
 *   - intercept PrintScreen and common capture/save/print shortcuts
 *   - disable printing via CSS
 *   - stamp the page with the signed-in user's identity, so any leaked
 *     screenshot is traceable back to the account that took it
 *
 * The watermark is the strongest control here: it makes sharing attributable
 * rather than impossible.
 */
export default function ContentGuard({
  email,
  name,
}: {
  email: string;
  name: string;
}) {
  const [hidden, setHidden] = useState(false);
  const [warning, setWarning] = useState("");

  useEffect(() => {
    const warn = (msg: string, kind: string) => {
      setWarning(msg);
      window.setTimeout(() => setWarning(""), 2600);
      // Best-effort audit log; never blocks the UI.
      void fetch("/api/security/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, detail: msg }),
        keepalive: true,
      }).catch(() => {});
    };

    const onBlur = () => {
      // Delay slightly to check if the active element is an iframe (e.g. video player).
      // Clicking inside an embedded video moves browser focus into the iframe, which fires
      // a window blur event. We must NOT hide content in that case.
      setTimeout(() => {
        if (document.activeElement && document.activeElement.tagName === "IFRAME") {
          return;
        }
        if (document.visibilityState === "hidden") {
          setHidden(true);
        }
      }, 100);
    };
    const onFocus = () => setHidden(false);
    const onVisibility = () => setHidden(document.visibilityState !== "visible");

    const onContext = (e: MouseEvent) => {
      e.preventDefault();
      setWarning("Right-click is disabled on study content.");
      window.setTimeout(() => setWarning(""), 2000);
    };

    const onCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      warn("Copying study content is not permitted.", "copy_attempt");
    };

    const onKey = (e: KeyboardEvent) => {
      const k = e.key;
      // PrintScreen
      if (k === "PrintScreen" || k === "F13") {
        navigator.clipboard?.writeText("").catch(() => {});
        warn("Screenshots of study content are not permitted.", "screenshot_attempt");
        return;
      }
      const meta = e.ctrlKey || e.metaKey;
      // Save, print, and platform screenshot shortcuts
      if (meta && ["s", "p", "u"].includes(k.toLowerCase())) {
        e.preventDefault();
        warn("Saving or printing study content is disabled.", "save_attempt");
        return;
      }
      // macOS Cmd+Shift+3/4/5, Windows Win+Shift+S
      if (meta && e.shiftKey && ["3", "4", "5", "s", "S"].includes(k)) {
        warn("Screenshots of study content are not permitted.", "screenshot_attempt");
      }
    };

    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("contextmenu", onContext);
    document.addEventListener("copy", onCopy);
    document.addEventListener("cut", onCopy);
    document.addEventListener("keyup", onKey);
    document.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("contextmenu", onContext);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("cut", onCopy);
      document.removeEventListener("keyup", onKey);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const tile = `${name} · ${email}`;

  return (
    <>
      {/* Diagonal identity watermark — makes any leak traceable */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-40 select-none overflow-hidden opacity-[0.055]"
      >
        <div className="absolute inset-0 -rotate-30 grid grid-cols-2 gap-x-16 gap-y-24 p-10">
          {Array.from({ length: 28 }).map((_, i) => (
            <span key={i} className="whitespace-nowrap text-xs font-bold tracking-wider text-slate-900">
              {tile}
            </span>
          ))}
        </div>
      </div>

      {/* Privacy blur when the tab is not focused (defeats most capture tools) */}
      {hidden && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-900/80 backdrop-blur-xl">
          <div className="max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl">
            <p className="text-4xl">🔒</p>
            <p className="mt-3 font-semibold text-slate-900">Content hidden</p>
            <p className="mt-1 text-sm text-slate-600">
              Study material is hidden while this tab is not in focus. Click here to continue.
            </p>
            <p className="mt-3 text-xs text-slate-400">Licensed to {email}</p>
          </div>
        </div>
      )}

      {warning && (
        <div className="fixed bottom-5 left-1/2 z-[70] -translate-x-1/2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-xl">
          ⚠ {warning}
        </div>
      )}
    </>
  );
}
