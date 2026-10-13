/** Sovg'a wordmark: the name set in the display serif with a red full stop. Used in the navbar and footer. */
export default function BrandMark({ size = "md", tone = "ink" }: { size?: "md" | "lg"; tone?: "ink" | "paper" }) {
  const word = size === "lg" ? "text-[2.25rem]" : "text-[1.75rem]";
  return (
    <span className={`font-lux ${word} leading-none tracking-[-0.03em] ${tone === "paper" ? "text-white" : "text-[var(--ink)]"}`}>
      Sovg'a<span className="text-[var(--anor)]">.</span>
    </span>
  );
}
