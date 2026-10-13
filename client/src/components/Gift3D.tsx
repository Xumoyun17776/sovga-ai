import { useEffect, useRef, useState } from "react";

function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch {
    return false;
  }
}

/**
 * Decorative real-time 3D gift box. three.js is only downloaded when this
 * scrolls into view, and nothing renders if WebGL isn't available.
 */
export default function Gift3D({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !webglAvailable()) return;
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    const start = () => {
      import("./three/giftScene").then(({ mountGiftScene }) => {
        if (cancelled || !ref.current) return;
        cleanup = mountGiftScene(ref.current, {
          reducedMotion: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
        });
        requestAnimationFrame(() => setReady(true));
      }).catch(() => {});
    };
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        start();
      }
    }, { rootMargin: "200px" });
    io.observe(el);
    return () => {
      cancelled = true;
      io.disconnect();
      cleanup?.();
    };
  }, []);

  return (
    <div className={`absolute pointer-events-none select-none ${className}`} aria-hidden="true">
      <div className={`gift3d inset-0 ${ready ? "is-ready" : ""}`}>
        <div className="gift3d-shadow" />
        <div ref={ref} className="absolute inset-0" />
      </div>
    </div>
  );
}
