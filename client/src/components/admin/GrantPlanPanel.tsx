import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PLANS, PAID_PLANS, type PlanId } from "@shared/plans";
import { admin } from "../../lib/api";
import { useTranslation } from "../../lib/i18n";
import { useToast } from "../Toast";
import { Search, Crown, Check, X } from "../../lib/icons";

export type AdminUserRow = {
  id: number;
  name?: string;
  email?: string;
  phone?: string;
  plan: PlanId;
  planExpiresAt: string | null;
  isAdmin?: boolean;
  lastPlan?: string | null;
  lastPlanExpiresAt?: string | null;
  planHistory?: { plan: string; days: number; at: string; source?: string; note?: string }[];
};

const DURATIONS = [
  { days: 7, uz: "7 kun", ru: "7 дней", en: "7 days" },
  { days: 30, uz: "1 oy", ru: "1 месяц", en: "1 month" },
  { days: 90, uz: "3 oy", ru: "3 месяца", en: "3 months" },
  { days: 180, uz: "6 oy", ru: "6 месяцев", en: "6 months" },
  { days: 365, uz: "1 yil", ru: "1 год", en: "1 year" },
];

/** Any value → a known plan id (older servers send no plan, or legacy ids like "pro_monthly"). */
export const safePlan = (p: any, role?: string): PlanId =>
  PLANS[p as PlanId] ? (p as PlanId) : p === "pro_monthly" || p === "pro_annual" || p === "pro" || role === "pro" ? "plus" : "free";

export const fmtDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString("ru-RU", { timeZone: "Asia/Tashkent", day: "2-digit", month: "2-digit", year: "numeric" }) : "—";

export const daysLeft = (iso: string | null | undefined) =>
  iso ? Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000)) : 0;

/**
 * Give, extend or cancel a user's paid plan. Used at the top of the Users tab (find anyone by email / phone / #id)
 * and inside the per-user dialog (`preset`).
 */
export default function GrantPlanPanel({ preset: rawPreset, onDone, compact = false }: { preset?: AdminUserRow | null; onDone?: () => void; compact?: boolean }) {
  const preset = rawPreset ? { ...rawPreset, plan: safePlan(rawPreset.plan) } : rawPreset;
  const { language } = useTranslation();
  const L = (uz: string, ru: string, en: string) => (language === "ru" ? ru : language === "en" ? en : uz);
  const lang = (language === "ru" || language === "en" ? language : "uz") as "uz" | "ru" | "en";
  const toast = useToast();
  const qc = useQueryClient();

  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [picked, setPicked] = useState<AdminUserRow | null>(preset || null);
  const [plan, setPlan] = useState<PlanId>(preset && preset.plan !== "free" ? preset.plan : "plus");
  const [days, setDays] = useState(30);
  const [customDays, setCustomDays] = useState("");
  const [fromNow, setFromNow] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(query.trim()), 250);
    return () => window.clearTimeout(t);
  }, [query]);

  const { data: matches = [], isFetching } = useQuery<AdminUserRow[]>({
    queryKey: ["admin-user-lookup", debounced],
    queryFn: async () => {
      const list = await admin.getUsers({ q: debounced.replace(/^#/, ""), limit: 8 });
      return (Array.isArray(list) ? list : []).map((u: any) => ({ ...u, plan: safePlan(u.plan, u.role), isAdmin: u.isAdmin ?? u.role === "admin" }));
    },
    enabled: !preset && debounced.length >= 2 && !picked,
    staleTime: 10_000,
  });

  const target = preset || picked;
  const effectiveDays = customDays ? Math.max(1, Math.min(3660, parseInt(customDays) || 0)) : days;
  const extending = !!target && !fromNow && target.plan === plan && !!target.planExpiresAt;
  const previewUntil = useMemo(() => {
    const base = extending ? Math.max(Date.now(), new Date(target!.planExpiresAt!).getTime()) : Date.now();
    return new Date(base + effectiveDays * 86_400_000).toISOString();
  }, [extending, target, effectiveDays]);
  const losesTime = !!target && target.plan !== "free" && target.plan !== plan && !!PLANS[target.plan] && daysLeft(target.planExpiresAt) > 0;

  const done = (res: any) => {
    qc.invalidateQueries({ queryKey: ["admin-users"] });
    qc.invalidateQueries({ queryKey: ["admin-stats"] });
    qc.invalidateQueries({ queryKey: ["admin-user-lookup"] });
    toast.success(res?.message || L("Saqlandi", "Сохранено", "Saved"), L("Tarif", "Тариф", "Plan"));
    if (!preset) {
      setPicked(null);
      setQuery("");
      setNote("");
    }
    onDone?.();
  };

  const grant = useMutation({
    mutationFn: (p: PlanId) =>
      target
        ? admin.setUserPlan(target.id, p, effectiveDays, { fromNow, note })
        : admin.grantPlan(query.trim(), p, effectiveDays, { fromNow, note }),
    onSuccess: done,
    onError: (e: any) => toast.error(e?.message || L("Xatolik", "Ошибка", "Error")),
  });

  const chip = (active: boolean) =>
    `h-9 px-3.5 rounded-xl text-[13px] font-semibold border transition cursor-pointer ${
      active ? "bg-[var(--anor)] border-[var(--anor)] text-white" : "bg-[var(--white)] border-[var(--rule-soft)] text-[var(--ink)] hover:border-[var(--line-strong)]"
    }`;

  return (
    <div className={compact ? "space-y-5" : "card p-5 sm:p-6 space-y-5"}>
      {!compact && (
        <div className="flex items-start gap-3">
          <span className="tile"><Crown /></span>
          <div>
            <h3 className="font-lux text-[1.25rem] text-[var(--ink)]">{L("Tarif berish", "Выдать тариф", "Give a plan")}</h3>
            <p className="text-[14px] text-[var(--ink-2)]">
              {L(
                "Foydalanuvchini email, telefon yoki #ID orqali toping, tarif va muddatni tanlang.",
                "Найдите пользователя по email, телефону или #ID, выберите тариф и срок.",
                "Find the user by email, phone or #ID, then pick a plan and how long."
              )}
            </p>
          </div>
        </div>
      )}

      {/* 1 — who */}
      {!preset && (
        <div className="relative">
          {picked ? (
            <UserChip u={picked} onClear={() => setPicked(null)} L={L} />
          ) : (
            <>
              <div className="flex items-center h-12 rounded-xl border border-[var(--rule-soft)] bg-[var(--white)] focus-within:border-[var(--anor)] px-3">
                <Search className="w-4 h-4 text-[var(--ink-2)]" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={L("Email, telefon yoki #ID", "Email, телефон или #ID", "Email, phone or #ID")}
                  className="flex-1 min-w-0 h-full bg-transparent outline-none px-2.5 text-[15px] text-[var(--ink)]"
                />
                {isFetching && <span className="text-[12px] text-[var(--ink-2)]">…</span>}
              </div>
              {debounced.length >= 2 && matches.length > 0 && (
                <ul className="absolute z-20 left-0 right-0 mt-1.5 max-h-72 overflow-auto rounded-xl border border-[var(--rule-soft)] bg-[var(--white)] shadow-xl">
                  {matches.slice(0, 8).map((u) => (
                    <li key={u.id}>
                      <button
                        onClick={() => {
                          setPicked(u);
                          if (u.plan !== "free") setPlan(u.plan);
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-[var(--paper-2)] flex items-center justify-between gap-3 cursor-pointer"
                      >
                        <span className="min-w-0">
                          <span className="block text-[14px] font-semibold text-[var(--ink)] truncate">{u.name || "—"} <span className="text-[var(--ink-2)] font-normal">#{u.id}</span></span>
                          <span className="block text-[12px] text-[var(--ink-2)] truncate">{u.email || u.phone}</span>
                        </span>
                        <PlanBadge plan={u.plan} isAdmin={u.isAdmin} lang={lang} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {debounced.length >= 2 && !isFetching && matches.length === 0 && (
                <p className="mt-2 text-[13px] text-[var(--ink-2)]">
                  {L("Topilmadi. To'liq email yoki telefonni yozing.", "Не найдено. Введите полный email или телефон.", "No match. Type the full email or phone.")}
                </p>
              )}
            </>
          )}
        </div>
      )}

      {target?.isAdmin ? (
        <p className="rounded-xl bg-[var(--paper-2)] px-4 py-3 text-[14px] text-[var(--ink-2)]">
          {L("Bu admin hisobi — unda hamma narsa allaqachon ochiq.", "Это админ — у него уже всё открыто.", "This is an admin account — everything is already unlocked.")}
        </p>
      ) : (
        <>
          {/* 2 — plan */}
          <div>
            <p className="text-[13px] font-semibold text-[var(--ink-2)] mb-2">{L("Tarif", "Тариф", "Plan")}</p>
            <div className="grid grid-cols-3 gap-2">
              {PAID_PLANS.map((id) => (
                <button
                  key={id}
                  onClick={() => setPlan(id)}
                  className={`rounded-xl border p-3 text-left transition cursor-pointer ${
                    plan === id ? "border-[var(--anor)] bg-[var(--accent-soft)] ring-1 ring-[var(--anor)]" : "border-[var(--rule-soft)] bg-[var(--white)] hover:border-[var(--line-strong)]"
                  }`}
                >
                  <span className="flex items-center justify-between">
                    <span className="font-lux text-[15px] text-[var(--ink)]">{PLANS[id].name[lang]}</span>
                    {plan === id && <Check className="w-4 h-4 text-[var(--anor)]" />}
                  </span>
                  <span className="block mt-0.5 text-[12px] text-[var(--ink-2)] tabular">{PLANS[id].price.toLocaleString("ru-RU")} {L("so'm/oy", "сум/мес", "UZS/mo")}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3 — how long */}
          <div>
            <p className="text-[13px] font-semibold text-[var(--ink-2)] mb-2">{L("Muddat", "Срок", "Duration")}</p>
            <div className="flex flex-wrap gap-2">
              {DURATIONS.map((d) => (
                <button key={d.days} onClick={() => { setDays(d.days); setCustomDays(""); }} className={chip(!customDays && days === d.days)}>
                  {d[lang]}
                </button>
              ))}
              <label className={`${chip(!!customDays)} inline-flex items-center gap-1.5`}>
                <input
                  value={customDays}
                  onChange={(e) => setCustomDays(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder={L("boshqa", "другое", "other")}
                  inputMode="numeric"
                  className={`w-14 bg-transparent outline-none text-center ${customDays ? "text-white placeholder:text-white/70" : ""}`}
                />
                {L("kun", "дн.", "days")}
              </label>
            </div>
            {target && target.plan !== "free" && target.plan === plan && (
              <label className="mt-3 flex items-center gap-2 text-[13px] text-[var(--ink-2)] cursor-pointer">
                <input type="checkbox" checked={fromNow} onChange={(e) => setFromNow(e.target.checked)} />
                {L("Qolgan muddatga qo'shmasdan, bugundan hisoblash", "Считать с сегодняшнего дня, а не добавлять к остатку", "Count from today instead of adding to the time left")}
              </label>
            )}
          </div>

          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={200}
            placeholder={L("Izoh (ixtiyoriy): masalan, Click orqali to'ladi", "Комментарий (необязательно): например, оплатил через Click", "Note (optional): e.g. paid via Click")}
            className="w-full h-11 rounded-xl border border-[var(--rule-soft)] bg-[var(--white)] px-3.5 text-[14px] text-[var(--ink)] outline-none focus:border-[var(--anor)]"
          />

          {/* summary + actions */}
          <div className="rounded-xl bg-[var(--paper-2)] px-4 py-3 text-[14px] text-[var(--ink)]">
            <b>{PLANS[plan].name[lang]}</b> · {effectiveDays} {L("kun", "дн.", "days")} → {L("tugash sanasi", "до", "until")} <b>{fmtDate(previewUntil)}</b>
            {extending && <span className="text-[var(--ink-2)]"> · {L("qolgan muddatga qo'shiladi", "добавится к остатку", "added to the time left")}</span>}
            {losesTime && (
              <span className="block mt-1 text-[13px] text-[var(--warn)]">
                {L(
                  `Hozirgi ${PLANS[target!.plan].name.uz} tarifidagi ${daysLeft(target!.planExpiresAt)} kun almashtiriladi.`,
                  `Текущий тариф ${PLANS[target!.plan].name.ru} (${daysLeft(target!.planExpiresAt)} дн.) будет заменён.`,
                  `The current ${PLANS[target!.plan].name.en} plan (${daysLeft(target!.planExpiresAt)} days left) will be replaced.`
                )}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => grant.mutate(plan)}
              disabled={grant.isPending || (!target && query.trim().length < 3)}
              className="btn-primary h-11 px-6 text-[15px] disabled:opacity-50"
            >
              {grant.isPending ? "…" : L("Tarifni berish", "Выдать тариф", "Give plan")}
            </button>
            {target && target.plan !== "free" && (
              <button
                onClick={() => {
                  if (confirm(L(`${target.name || target.email}: tarifni bekor qilasizmi?`, `Отменить тариф для ${target.name || target.email}?`, `Cancel the plan for ${target.name || target.email}?`)))
                    grant.mutate("free");
                }}
                disabled={grant.isPending}
                className="btn-ghost h-11 px-5 text-[14px] text-[var(--warn)]"
              >
                {L("Tarifni bekor qilish", "Отменить тариф", "Cancel plan")}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export function PlanBadge({ plan: rawPlan, isAdmin, lang }: { plan: PlanId; isAdmin?: boolean; lang: "uz" | "ru" | "en" }) {
  const plan = safePlan(rawPlan);
  if (isAdmin) return <span className="h-6 px-2.5 rounded-full text-[11px] font-bold inline-flex items-center bg-[var(--ink)] text-[var(--paper)]">ADMIN</span>;
  if (plan === "free")
    return <span className="h-6 px-2.5 rounded-full text-[11px] font-semibold inline-flex items-center bg-[var(--paper-2)] text-[var(--ink-2)]">{PLANS.free.name[lang]}</span>;
  return (
    <span className="h-6 px-2.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1 bg-[var(--accent-soft)] text-[var(--anor)]">
      <Crown className="w-3 h-3" /> {PLANS[plan].name[lang]}
    </span>
  );
}

function UserChip({ u, onClear, L }: { u: AdminUserRow; onClear: () => void; L: (a: string, b: string, c: string) => string }) {
  const { language } = useTranslation();
  const lang = (language === "ru" || language === "en" ? language : "uz") as "uz" | "ru" | "en";
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--anor)] bg-[var(--accent-soft)] px-4 py-3">
      <div className="min-w-0">
        <p className="text-[15px] font-semibold text-[var(--ink)] truncate">
          {u.name || "—"} <span className="text-[var(--ink-2)] font-normal">#{u.id}</span>
        </p>
        <p className="text-[13px] text-[var(--ink-2)] truncate">
          {u.email || u.phone} ·{" "}
          {u.plan === "free"
            ? L("bepul tarifda", "на бесплатном", "on Free")
            : `${PLANS[safePlan(u.plan)].name[lang]} — ${fmtDate(u.planExpiresAt)} ${L("gacha", "", "")}`}
        </p>
      </div>
      <button onClick={onClear} aria-label="clear" className="w-8 h-8 rounded-full inline-flex items-center justify-center text-[var(--ink-2)] hover:bg-[var(--white)] cursor-pointer">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
