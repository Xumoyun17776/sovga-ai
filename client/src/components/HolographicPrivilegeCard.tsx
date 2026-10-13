import { Link } from "wouter";
import { ArrowRight, Check } from "../lib/icons";
import { useTranslation } from "../lib/i18n";
import { PLANS, PAID_PLANS } from "@shared/plans";
import SectionHeader, { sectionActionCls } from "./SectionHeader";

/** Homepage plans block: three pricing cards (Plus highlighted) and a line about the free tier. */
export default function HolographicPrivilegeCard() {
  const { language } = useTranslation();
  const lang = (language === "ru" || language === "en" ? language : "uz") as "uz" | "ru" | "en";
  const L = (uz: string, ru: string, en: string) => (lang === "ru" ? ru : lang === "en" ? en : uz);
  const n = (v: number) => (v === -1 ? L("Cheksiz", "Без лимита", "Unlimited") : String(v));

  return (
    <div id="vip-card-section">
      <SectionHeader
        kicker={L("Tariflar", "Тарифы", "Pricing")}
        title={L("Bepul boshlang. Kerak bo'lsa — kengaytiring.", "Начните бесплатно. Расширьте, когда нужно.", "Start free. Upgrade when you need more.")}
        subtitle={L(
          "Bepul: kuniga 5 ta qidiruv va 2 ta narx kuzatuvi. Oylik tariflar avtomatik yechib olinmaydi.",
          "Бесплатно: 5 поисков в день и 2 отслеживания цены. Месячные тарифы без автосписаний.",
          "Free: 5 searches a day and 2 price alerts. Monthly plans are never charged automatically."
        )}
        action={
          <Link href="/subscription" className={sectionActionCls}>
            {L("Batafsil solishtirish", "Подробное сравнение", "Compare in detail")} <ArrowRight className="w-4 h-4" />
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
        {PAID_PLANS.map((id) => {
          const p = PLANS[id];
          const featured = id === "plus";
          const features = [
            L(`${n(p.searchesPerDay)} ta qidiruv kuniga`, `${n(p.searchesPerDay)} поисков в день`, `${n(p.searchesPerDay)} searches a day`),
            L(`${n(p.trackers)} ta narx kuzatuvi`, `${n(p.trackers)} отслеживаний цены`, `${n(p.trackers)} price alerts`),
            L("Rasm orqali qidiruv", "Поиск по фото", "Search by photo"),
            ...(p.registry ? [L("To'y ro'yxati", "Свадебный список", "Wedding registry")] : []),
            ...(p.prioritySupport ? [L("Ustuvor yordam", "Приоритетная поддержка", "Priority support")] : []),
          ];
          return (
            <div
              key={id}
              className={`relative flex flex-col rounded-3xl p-6 sm:p-8 ${
                featured
                  ? "bg-[var(--anor)] text-white shadow-[0_24px_60px_-24px_rgba(31,76,168,.6)]"
                  : "bg-white border border-[var(--rule-soft)]"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-lux text-[1.35rem]">{p.name[lang]}</h3>
                {featured && (
                  <span className="h-7 px-3 rounded-full bg-white/15 text-[12px] font-semibold inline-flex items-center">
                    {L("Ko'p tanlanadi", "Популярный", "Most popular")}
                  </span>
                )}
              </div>
              <p className={`mt-2 text-[14px] leading-snug ${featured ? "text-white/75" : "text-[var(--ink-2)]"}`}>{p.tagline[lang]}</p>
              <p className="mt-6 flex items-baseline gap-2">
                <span className="price text-[2.5rem] leading-none">{p.price.toLocaleString("ru-RU")}</span>
                <span className={`text-[14px] ${featured ? "text-white/75" : "text-[var(--ink-2)]"}`}>{L("so'm / oy", "сум / мес", "UZS / mo")}</span>
              </p>
              <Link
                href={`/subscription?plan=${id}`}
                className={`mt-6 inline-flex items-center justify-center gap-2 h-12 rounded-xl text-[15px] font-semibold transition ${
                  featured ? "bg-[#fff] text-[#1F4CA8] hover:bg-[#EAF0FB]" : "bg-[var(--paper-2)] text-[var(--ink)] hover:bg-[var(--accent-soft)]"
                }`}
              >
                {L("Tanlash", "Выбрать", "Choose")} {p.name[lang]}
              </Link>
              <ul className={`mt-7 pt-6 space-y-3 text-[15px] border-t ${featured ? "border-white/20" : "border-[var(--rule-soft)]"}`}>
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-3">
                    <span className={`w-5 h-5 rounded-full inline-flex items-center justify-center flex-shrink-0 ${featured ? "bg-[#fff] text-[#1F4CA8]" : "bg-[var(--accent-soft)] text-[var(--anor)]"}`}>
                      <Check className="w-3 h-3" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
