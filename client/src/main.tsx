import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import App from "./App";
import "./index.css";
import { initPerformanceTelemetry } from "./lib/vitals";

initPerformanceTelemetry();

// ── Interaction layer ───────────────────────────────────────────────
// 1) Cursor spotlight: cards read --mx/--my to draw a soft light under the pointer.
// 2) Scroll reveal: elements with .reveal fade up the first time they enter the viewport.
if (typeof window !== "undefined") {
  const SPOT_SEL = ".spotlight, .surface-card.is-interactive, .card-luxury";
  window.addEventListener(
    "pointermove",
    (e) => {
      const el = (e.target as Element | null)?.closest?.(SPOT_SEL) as HTMLElement | null;
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    },
    { passive: true }
  );

  // Subtle 3D tilt for elements marked .tilt-3d (max ~6°).
  let tiltEl: HTMLElement | null = null;
  const resetTilt = (el: HTMLElement) => {
    el.classList.remove("is-tilting");
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };
  document.addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType === "touch") return;
      const el = (e.target as Element | null)?.closest?.(".tilt-3d") as HTMLElement | null;
      if (tiltEl && tiltEl !== el) resetTilt(tiltEl);
      tiltEl = el;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.classList.add("is-tilting");
      el.style.setProperty("--rx", `${(-py * 7).toFixed(2)}deg`);
      el.style.setProperty("--ry", `${(px * 9).toFixed(2)}deg`);
    },
    { passive: true }
  );
  document.addEventListener("pointerleave", () => tiltEl && resetTilt(tiltEl));

  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  if (!reduce) {
    document.documentElement.classList.add("reveal-ready");
    let ticking = false;
    // Reveal anything that has reached (or been scrolled past) the lower edge of the viewport.
    const check = () => {
      ticking = false;
      const limit = window.innerHeight * 0.92;
      document.querySelectorAll(".reveal:not(.is-visible)").forEach((n) => {
        if ((n as HTMLElement).getBoundingClientRect().top < limit) n.classList.add("is-visible");
      });
    };
    const schedule = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(check);
      }
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    window.addEventListener("load", schedule);
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
    setTimeout(check, 60);
  }
}

// Global broken-image fallback: when a remote product photo fails to load, the
// browser rendered the alt text on top of badges. Swap in a neat placeholder.
const makeImgPlaceholder = (dark: boolean) =>
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${dark ? "#1e293b" : "#eef3ff"}"/><stop offset="1" stop-color="${dark ? "#0f172a" : "#dfe8fb"}"/></linearGradient></defs><rect width="400" height="300" fill="url(#g)"/><g fill="none" stroke="${dark ? "#d9431f" : "#4338ca"}" stroke-opacity=".5" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" transform="translate(164 114)"><rect x="4" y="22" width="64" height="48" rx="6"/><path d="M0 22h72v-12H0zM36 10v60M36 10c-6-12-24-12-22 0 2 8 22 0 22 0zm0 0c6-12 24-12 22 0-2 8-22 0-22 0z"/></g></svg>`
  );
if (typeof window !== "undefined") {
  window.addEventListener(
    "error",
    (e) => {
      const el = e.target as HTMLImageElement | null;
      if (!el || el.tagName !== "IMG" || el.dataset.fallbackApplied) return;
      const failedSrc = el.currentSrc || el.src;
      const errors = Number(el.dataset.imgErrors || "0") + 1;
      el.dataset.imgErrors = String(errors);
      // Give the component's own onError handler a chance to swap in its fallback first.
      setTimeout(() => {
        const stillBroken = (el.currentSrc || el.src) === failedSrc;
        if (stillBroken || errors >= 2) {
          el.dataset.fallbackApplied = "1";
          el.alt = "";
          el.removeAttribute("srcset");
          el.src = makeImgPlaceholder(document.documentElement.classList.contains("dark"));
        }
      }, 0);
    },
    true
  );
}

// Initialize Telegram Mini App if opened inside Telegram
if (typeof window !== "undefined" && (window as any).Telegram?.WebApp) {
  try {
    (window as any).Telegram.WebApp.ready();
    (window as any).Telegram.WebApp.expand();
  } catch (e) {
    /* ignore */
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 60000, refetchOnWindowFocus: false },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
