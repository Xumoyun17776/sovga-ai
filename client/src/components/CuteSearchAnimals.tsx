import { useEffect, useState } from "react";
import { useTranslation } from "../lib/i18n";
import { Check } from "../lib/icons";

/** Calm store-by-store progress shown while a search runs (was an animal animation; name kept for imports). */
const steps = [
  { store: "Uzum Market", uz: "Uzum Market tekshirilmoqda", ru: "Проверяем Uzum Market", en: "Checking Uzum Market" },
  { store: "Texnomart", uz: "Texnomart tekshirilmoqda", ru: "Проверяем Texnomart", en: "Checking Texnomart" },
  { store: "MediaPark", uz: "MediaPark tekshirilmoqda", ru: "Проверяем MediaPark", en: "Checking MediaPark" },
  { store: "Olcha", uz: "Olcha tekshirilmoqda", ru: "Проверяем Olcha", en: "Checking Olcha" },
  { store: "Asaxiy", uz: "Chegirmalar solishtirilmoqda", ru: "Сравниваем скидки", en: "Comparing discounts" },
];

export default function CuteSearchAnimals() {
  const { language } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % steps.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const pick = (s: (typeof steps)[number]) => (language === "uz" ? s.uz : language === "ru" ? s.ru : s.en);

  return (
    <div className="rounded-2xl border border-[var(--rule-soft)] bg-[var(--white)] p-4 sm:p-5" aria-live="polite">
      <div className="flex items-center justify-between gap-3 text-[14px]">
        <span className="font-semibold text-[var(--ink)]">{pick(steps[activeIndex])}…</span>
        <span className="tabular text-[13px] text-[var(--ink-2)]">
          {activeIndex + 1} / {steps.length}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-5 gap-1.5" aria-hidden>
        {steps.map((s, idx) => (
          <span
            key={s.store}
            className={`h-1.5 rounded-full transition-colors duration-500 ${
              idx < activeIndex ? "bg-[var(--anor)]" : idx === activeIndex ? "bg-[var(--anor)] animate-pulse" : "bg-[var(--paper-2)]"
            }`}
          />
        ))}
      </div>
      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[13px]">
        {steps.map((s, idx) => (
          <li
            key={s.store}
            className={`inline-flex items-center gap-1.5 ${idx <= activeIndex ? "text-[var(--ink)]" : "text-[var(--muted)]"}`}
          >
            {idx < activeIndex ? (
              <Check className="w-3.5 h-3.5 text-[var(--ok)]" />
            ) : (
              <span className={`w-1.5 h-1.5 rounded-full ${idx === activeIndex ? "bg-[var(--anor)]" : "bg-[var(--rule-soft)]"}`} />
            )}
            {s.store}
          </li>
        ))}
      </ul>
    </div>
  );
}
