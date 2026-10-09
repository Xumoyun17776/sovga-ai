import React from "react";

export default function CyberAmbientMesh() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Top Left Amber & Champagne Gold Nebula */}
      <div
        className="absolute -top-32 -left-32 w-96 h-96 sm:w-[540px] sm:h-[540px] rounded-full blur-3xl opacity-35 dark:opacity-20 animate-pulse-soft"
        style={{
          background: "radial-gradient(circle, rgba(245, 158, 11, 0.28) 0%, rgba(217, 119, 6, 0.08) 50%, transparent 70%)",
        }}
      />

      {/* Top Right Royal Violet & Sapphire Indigo Nebula */}
      <div
        className="absolute -top-40 -right-40 w-96 h-96 sm:w-[620px] sm:h-[620px] rounded-full blur-3xl opacity-30 dark:opacity-20"
        style={{
          background: "radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(67, 56, 202, 0.08) 50%, transparent 70%)",
        }}
      />

      {/* Mid Right Coral Rose & Warm Peach Aurora */}
      <div
        className="absolute top-1/2 -right-32 w-80 h-80 sm:w-[480px] sm:h-[480px] rounded-full blur-3xl opacity-25 dark:opacity-15 pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(244, 63, 94, 0.2) 0%, rgba(251, 113, 133, 0.06) 50%, transparent 70%)",
        }}
      />

      {/* Bottom Left Emerald Jade & Mint Breeze Nebula */}
      <div
        className="absolute -bottom-32 -left-20 w-88 h-88 sm:w-[500px] sm:h-[500px] rounded-full blur-3xl opacity-25 dark:opacity-15 pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(16, 185, 129, 0.22) 0%, rgba(5, 150, 105, 0.06) 50%, transparent 70%)",
        }}
      />

      {/* Center Subtle Prismatic Horizon Glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[360px] rounded-full blur-[100px] opacity-15 dark:opacity-20 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, rgba(6, 182, 212, 0.22) 0%, rgba(99, 102, 241, 0.12) 40%, transparent 70%)",
        }}
      />

      {/* Ambient Grid Micro-Texture */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
    </div>
  );
}
