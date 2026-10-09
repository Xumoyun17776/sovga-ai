import { useMemo } from "react";

export default function CyberParticleCanvas() {
  // Pre-calculated deterministic star constellation points (Zero JS loop, zero lag)
  const nodes = useMemo(() => [
    { cx: 80, cy: 90, r: 2.2, color: "#f59e0b" },
    { cx: 220, cy: 140, r: 1.8, color: "#6366f1" },
    { cx: 340, cy: 70, r: 2.5, color: "#06b6d4" },
    { cx: 500, cy: 120, r: 1.5, color: "#f59e0b" },
    { cx: 620, cy: 80, r: 2.0, color: "#a855f7" },
    { cx: 780, cy: 150, r: 2.4, color: "#06b6d4" },
    { cx: 920, cy: 95, r: 1.8, color: "#f59e0b" },
    { cx: 1040, cy: 160, r: 2.2, color: "#6366f1" },
    { cx: 160, cy: 260, r: 1.6, color: "#06b6d4" },
    { cx: 290, cy: 310, r: 2.2, color: "#f59e0b" },
    { cx: 460, cy: 250, r: 1.8, color: "#6366f1" },
    { cx: 640, cy: 300, r: 2.5, color: "#f59e0b" },
    { cx: 790, cy: 270, r: 1.6, color: "#06b6d4" },
    { cx: 960, cy: 320, r: 2.0, color: "#6366f1" },
    { cx: 1100, cy: 260, r: 1.5, color: "#f59e0b" },
  ], []);

  const lines = useMemo(() => [
    { x1: 80, y1: 90, x2: 220, y2: 140 },
    { x1: 220, y1: 140, x2: 340, y2: 70 },
    { x1: 340, y1: 70, x2: 500, y2: 120 },
    { x1: 500, y1: 120, x2: 620, y2: 80 },
    { x1: 620, y1: 80, x2: 780, y2: 150 },
    { x1: 780, y1: 150, x2: 920, y2: 95 },
    { x1: 920, y1: 95, x2: 1040, y2: 160 },
    { x1: 160, y1: 260, x2: 290, y2: 310 },
    { x1: 290, y1: 310, x2: 460, y2: 250 },
    { x1: 460, y1: 250, x2: 640, y2: 300 },
    { x1: 640, y1: 300, x2: 790, y2: 270 },
    { x1: 790, y1: 270, x2: 960, y2: 320 },
    { x1: 960, y1: 320, x2: 1100, y2: 260 },
    { x1: 220, y1: 140, x2: 290, y2: 310 },
    { x1: 620, y1: 80, x2: 640, y2: 300 },
    { x1: 780, y1: 150, x2: 790, y2: 270 },
  ], []);

  return (
    <div className="absolute inset-0 pointer-events-none opacity-40 overflow-hidden z-0 select-none">
      <svg
        viewBox="0 0 1200 420"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full"
      >
        <defs>
          <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Constellation Link Lines */}
        {lines.map((l, i) => (
          <line
            key={i}
            x1={l.x1}
            y1={l.y1}
            x2={l.x2}
            y2={l.y2}
            stroke="rgba(180, 150, 110, 0.18)"
            strokeWidth="0.8"
            strokeDasharray="4 4"
          />
        ))}

        {/* Constellation Star Nodes */}
        {nodes.map((n, i) => (
          <g key={i}>
            <circle cx={n.cx} cy={n.cy} r={n.r * 2.2} fill="url(#starGlow)" opacity="0.3" />
            <circle cx={n.cx} cy={n.cy} r={n.r} fill={n.color} />
          </g>
        ))}
      </svg>
    </div>
  );
}
