import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Crown, X, ArrowRight, Check } from "../lib/icons";
import { useTranslation } from "../lib/i18n";
import { PLANS, PAID_PLANS, type PlanId } from "@shared/plans";

type LimitDetail = {
  error?: string;
  kind?: "search" | "trackers" | "registry";
  plan?: PlanId;
  limit?: number;
  used?: number;
  signedIn?: boolean;
};

/**
 * Opens whenever the server answers PLAN_LIMIT (see lib/api.ts), explains which
 * allowance ran out and offers the plans that lift it.
 */
export default function UpgradeModal() {
  const [detail, setDetail] = useState<LimitDetail | null>(null);
  const [, navigate] = useLocation();
  const { language } = useTranslation();
  const queryClient = useQueryClient();
  const L = (uz: string, ru: string, en: string) => (language === "ru" ? ru : language === "en" ? en : uz);
  const lang = (language === "ru" || language === "en" ? language : "uz") as "uz" | "ru" | "en";

  useEffect(() => {
    const onLimit = (e: Event) => {
      setDetail((e as CustomEvent<LimitDetail>).detail || {});
      queryClient.invalidateQueries({ queryKey: ["plan-status"] });
    };
    window.addEventListener("plan-limit", onLimit);
    return () => window.removeEventListener("plan-limit", onLimit);
  }, [queryClient]);

  useEffect(() => {
    if (!detail) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDetail(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [detail]);

  if (!detail) return null;

  const current = detail.plan && PLANS[detail.plan] ? PLANS[detail.plan] : PLANS.free;
  // Only offer plans that actually lift the limit that was hit.
  const options = PAID_PLANS.map((id) => PLANS[id]).filter((p) => {
    if (p.price <= current.price) return false;
    if (detail.kind === "registry") return p.registry;
    return true;
  });
  const signedIn = detail.signedIn !== false;

  const go = (planId: PlanId) => {
    const target = `/subscription?plan=${planId}`;
    setDetail(null);
    navigate(signedIn ? target : `/auth?redirect=${encodeURIComponent(target)}`);
  };

  const limitLine = (p: (typeof PLANS)[PlanId]) => {
    const n = (v: number) => (v === -1 ? L("cheksiz", "без лимита", "unlimited") : String(v));
    if (detail.kind === "trackers") return L(`${n(p.trackers)} ta narx kuzatuvi`, `${n(p.trackers)} отслеживаний`, `${n(p.trackers)} price alerts`);
    if (detail.kind === "registry") return L("To'y ro'yxati + " + n(p.searchesPerDay) + " qidiruv/kun", "Свадебный список + " + n(p.searchesPerDay) + " поисков/день", "Wedding registry + " + n(p.searchesPerDay) + " searches/day");
    return L(`${n(p.searchesPerDay)} ta AI qidiruv / kun`, `${n(p.searchesPerDay)} AI-поисков в день`, `${n(p.searchesPerDay)} AI searches / day`);
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
      onClick={() => setDetail(null)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-title"
    >
      <div
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-2xl p-6 sm:p-7 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setDetail(null)}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
          aria-label={L("Yopish", "Закрыть", "Close")}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-[var(--gold-soft)] text-[var(--gold)]">
          <Crown className="w-5 h-5" />
        </div>
        <h2 id="upgrade-title" className="mt-4 font-lux text-[1.9rem] leading-tight text-slate-900 dark:text-white">
          {detail.kind === "registry"
            ? L("Bu Plus tarifida", "Это в тарифе «Плюс»", "This is a Plus feature")
            : L("Limit tugadi", "Лимит исчерпан", "You've hit your limit")}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{detail.error}</p>

        {typeof detail.limit === "number" && detail.limit > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>{current.name[lang]}</span>
              <span className="tabular-nums">
                {detail.used ?? detail.limit} / {detail.limit}
              </span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-slate-200/70 dark:bg-white/[0.06] overflow-hidden">
              <div className="h-full w-full rounded-full bg-rose-500" />
            </div>
          </div>
        )}

        <div className="mt-5 space-y-2.5">
          {options.map((p) => (
            <button
              key={p.id}
              onClick={() => go(p.id)}
              className={`w-full text-left rounded-2xl border px-4 py-3 flex items-center gap-3 transition cursor-pointer hover:-translate-y-0.5 ${
                p.id === "plus" ? "border-[color-mix(in_srgb,var(--gold)_55%,transparent)] bg-[var(--gold-soft)]" : "border-[var(--line)] hover:border-[var(--line-strong)]"
              }`}
            >
              <span className={`bullet-check ${p.id === "plus" ? "is-gold" : ""}`}>
                <Check className="w-3 h-3" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-semibold text-slate-900 dark:text-white">{p.name[lang]}</span>
                <span className="block text-xs text-slate-500 dark:text-slate-400 truncate">{limitLine(p)}</span>
              </span>
              <span className="text-sm font-semibold tabular-nums text-slate-900 dark:text-white whitespace-nowrap">
                {p.price.toLocaleString("en-US")} <span className="text-[11px] font-normal text-slate-500">{L("so'm", "сум", "UZS")}</span>
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={() => go(options.find((o) => o.id === "plus")?.id || options[0]?.id || "premium")}
          className="mt-5 w-full h-12 rounded-xl btn-luxury-gold inline-flex items-center justify-center gap-2 text-sm cursor-pointer"
        >
          {signedIn ? L("Tariflarni ko'rish", "Смотреть тарифы", "See plans") : L("Kirish va tarif tanlash", "Войти и выбрать тариф", "Sign in & choose a plan")}
          <ArrowRight className="w-4 h-4" />
        </button>
        {detail.kind === "search" && (
          <p className="mt-3 text-center text-[11px] text-slate-500 dark:text-slate-400">
            {L("Kunlik limit har kuni yarim tunda (Toshkent vaqti) yangilanadi.", "Дневной лимит обновляется в полночь по Ташкенту.", "Daily limits reset at midnight, Tashkent time.")}
          </p>
        )}
      </div>
    </div>
  );
}
