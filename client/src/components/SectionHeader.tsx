import type { ReactNode } from "react";

/**
 * Section opener used across the site: an optional short kicker in blue, the title,
 * and the description + action. Left-aligned on desktop; `align`/`index` are kept for older callers.
 */
export default function SectionHeader({
  title,
  subtitle,
  kicker,
  action,
  className = "",
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  kicker?: ReactNode;
  index?: string;
  eyebrow?: ReactNode;
  align?: "left" | "center";
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 lg:mb-12 ${className}`}>
      <div className="max-w-2xl">
        {kicker && <p className="text-sm font-semibold text-[var(--anor)] mb-3">{kicker}</p>}
        <h2 className="lux-title text-[2rem] sm:text-[2.5rem] leading-[1.1] text-[var(--ink)]">{title}</h2>
        {subtitle && <p className="mt-4 text-[17px] text-[var(--ink-2)] leading-relaxed max-w-xl">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

/** "View all →" style link used next to section headers. */
export const sectionActionCls =
  "inline-flex items-center gap-2 h-11 px-5 rounded-xl border border-[var(--rule-soft)] bg-white text-[15px] font-semibold text-[var(--ink)] hover:border-[var(--line-strong)] transition cursor-pointer";
