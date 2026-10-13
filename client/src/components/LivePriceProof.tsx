import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { prices, type LivePriceBoard, type LiveBoardProduct } from "../lib/api";
import { useTranslation } from "../lib/i18n";
import { useCurrency } from "../lib/currency";
import { Clock, ExternalLink, ArrowRight, TrendingDown, CheckCircle, Info } from "../lib/icons";

type Lang = "uz" | "ru" | "en";
const L = (lang: string, uz: string, ru: string, en: string) => (lang === "uz" ? uz : lang === "ru" ? ru : en);

/** Shared query for the homepage: proof card, stats, ticker and price-drop cards all read the same check. */
export function useLivePriceBoard() {
  return useQuery<LivePriceBoard>({
    queryKey: ["live-board"],
    queryFn: prices.liveBoard,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    retry: 1,
  });
}

/** "4 min ago" that keeps itself current. */
export function useCheckedAgo(checkedAt: string | null | undefined, lang: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, []);
  if (!checkedAt) return { ago: "", clock: "" };
  const t = new Date(checkedAt).getTime();
  const mins = Math.max(0, Math.floor((now - t) / 60_000));
  let ago: string;
  if (mins < 1) ago = L(lang, "hozirgina tekshirildi", "проверено только что", "checked just now");
  else if (mins < 60) ago = L(lang, `${mins} daqiqa oldin tekshirildi`, `проверено ${mins} мин назад`, `checked ${mins} min ago`);
  else {
    const h = Math.floor(mins / 60);
    ago = L(lang, `${h} soat oldin tekshirildi`, `проверено ${h} ч назад`, `checked ${h} h ago`);
  }
  let clock = "";
  try {
    clock = new Date(checkedAt).toLocaleTimeString(lang === "ru" ? "ru-RU" : lang === "uz" ? "uz-UZ" : "en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Tashkent",
    });
  } catch {
    clock = new Date(checkedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return { ago, clock };
}

/** Shown only when the stores can't be reached. Clearly labelled as an example, never as live data. */
const EXAMPLE: LiveBoardProduct = {
  id: "example",
  name: "Samsung Galaxy A55 8/128GB",
  short: "Galaxy A55",
  image: null,
  offers: [
    { store: "Texnomart", title: "Samsung Galaxy A55 8/128GB", price: 4_184_000, oldPrice: null, url: "" },
    { store: "Olcha", title: "Samsung Galaxy A55 8/128GB", price: 4_553_800, oldPrice: null, url: "" },
  ],
  lowest: 4_184_000,
  highest: 4_553_800,
  savings: 369_800,
  savingsPct: 8,
};

function CardSkeleton() {
  return (
    <div className="live-proof surface-card rounded-3xl p-5 sm:p-6" aria-busy="true">
      <div className="h-6 w-40 rounded-full bg-slate-200/70 dark:bg-white/[0.06] animate-pulse" />
      <div className="mt-6 flex gap-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-200/70 dark:bg-white/[0.06] animate-pulse" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 w-3/4 rounded bg-slate-200/70 dark:bg-white/[0.06] animate-pulse" />
          <div className="h-3 w-1/2 rounded bg-slate-200/70 dark:bg-white/[0.06] animate-pulse" />
        </div>
      </div>
      <div className="mt-6 h-10 w-1/2 rounded bg-slate-200/70 dark:bg-white/[0.06] animate-pulse" />
      <div className="mt-5 space-y-3">
        <div className="h-9 rounded-xl bg-slate-200/70 dark:bg-white/[0.06] animate-pulse" />
        <div className="h-9 rounded-xl bg-slate-200/70 dark:bg-white/[0.06] animate-pulse" />
      </div>
    </div>
  );
}

export function LivePriceCard() {
  const { language } = useTranslation();
  const lang = language as Lang;
  const { formatPrice } = useCurrency();
  const { data, isLoading } = useLivePriceBoard();
  const isLive = !!data?.live && data.products.length > 0;
  const products = isLive ? data!.products : [EXAMPLE];
  const [idx, setIdx] = useState(0);
  const [pinned, setPinned] = useState(false);
  const { ago, clock } = useCheckedAgo(isLive ? data!.checkedAt : null, lang);

  // Gentle rotation through the checked products until the visitor picks one.
  useEffect(() => {
    if (pinned || products.length < 2) return;
    const id = window.setInterval(() => setIdx((i) => (i + 1) % products.length), 7000);
    return () => window.clearInterval(id);
  }, [pinned, products.length]);

  const p = products[Math.min(idx, products.length - 1)];
  const best = p.offers[0];
  const others = p.offers.slice(1);
  const worst = p.offers[p.offers.length - 1];

  const shortPrice = useMemo(() => (n: number) => formatPrice(n).replace(/\s?UZS$/, ""), [formatPrice]);
  const unit = formatPrice(1).endsWith("UZS") ? L(lang, "so'm", "сум", "UZS") : "";

  if (isLoading && !data) return <CardSkeleton />;

  return (
    <div
      className="live-proof relative bg-[var(--white)] !rounded-[24px] border border-[var(--rule-soft)] shadow-[0_24px_60px_-24px_rgba(var(--shadow-color),.28)] p-5 sm:p-7 text-left"
      onMouseEnter={() => setPinned(true)}
      onFocusCapture={() => setPinned(true)}
    >
      {/* status row */}
      <div className="flex items-center justify-between gap-3">
        {isLive ? (
          <span className="inline-flex items-center gap-2 h-7 px-3 rounded-full bg-[var(--ok-soft)] text-[13px] font-semibold text-[var(--ok)]">
            <span className="relative flex w-2 h-2"><span className="absolute inset-0 rounded-full bg-[var(--ok)] animate-ping opacity-60" /><span className="relative w-2 h-2 rounded-full bg-[var(--ok)]" /></span>
            {L(lang, "Jonli narx", "Живая цена", "Live price check")}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full bg-[var(--paper-2)] text-[13px] font-semibold text-[var(--ink-2)]">
            <Info className="w-3.5 h-3.5" />
            {L(lang, "Namuna", "Пример", "Example")}
          </span>
        )}
        {isLive && (
          <span className="label inline-flex items-center gap-1.5 !normal-case !tracking-normal" title={clock}>
            {ago}
          </span>
        )}
      </div>

      {/* product switcher */}
      {products.length > 1 && (
        <div className="mt-5 -mx-1 flex gap-2 overflow-x-auto no-scrollbar px-1 [mask-image:linear-gradient(to_right,black_85%,transparent)]" role="tablist" aria-label={L(lang, "Mahsulotlar", "Товары", "Products")}>
          {products.map((pr, i) => (
            <button
              key={pr.id}
              role="tab"
              aria-selected={i === idx}
              onClick={() => {
                setIdx(i);
                setPinned(true);
              }}
              className={`proof-pill flex-shrink-0 h-8 px-3.5 text-[13px] font-medium transition cursor-pointer ${
                i === idx
                  ? "is-active"
                  : "text-[var(--ink-2)] hover:text-[var(--ink)] hover:border-[var(--line-strong)]"
              }`}
            >
              {pr.short}
            </button>
          ))}
        </div>
      )}

      <div key={p.id} className="proof-swap">
        {/* product */}
        <div className="mt-6 flex items-center gap-4">
          <div className="w-[72px] h-[72px] rounded-2xl bg-[var(--img-well)] flex items-center justify-center overflow-hidden flex-shrink-0">
            {p.image ? (
              <img src={p.image} alt="" className="w-full h-full object-contain p-1.5" loading="lazy" />
            ) : (
              <span className="text-[10px] font-semibold text-slate-400 text-center leading-tight px-1">{p.short}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-lux text-[1.2rem] leading-snug text-[var(--ink)] line-clamp-2">{p.name}</p>
            <p className="text-[13px] text-[var(--ink-2)] mt-1">
              {L(lang, `Bir xil model · ${p.offers.length} do'kon`, `Одна и та же модель · ${p.offers.length} магазина`, `Same model · ${p.offers.length} stores`)}
            </p>
          </div>
        </div>

        {/* lowest price */}
        <div className="mt-6 rounded-2xl bg-[var(--paper-2)] px-5 py-4">
          <p className="text-[13px] font-medium text-[var(--ink-2)]">
            {L(lang, "Eng past narx", "Самая низкая цена", "Lowest price")}
          </p>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="price text-[2.5rem] sm:text-[2.75rem] leading-none text-[var(--ink)]">
              {shortPrice(best.price)}
            </span>
            {unit && <span className="text-[15px] font-semibold text-[var(--ink-2)]">{unit}</span>}
            <span className="inline-flex items-center gap-1 ml-auto h-7 px-3 rounded-full bg-[var(--white)] border border-[var(--rule-soft)] text-[13px] font-semibold text-[var(--anor)]">
              {best.store}
            </span>
          </div>
        </div>

        {/* store rows */}
        <ul className="mt-4">
          {p.offers.map((o, i) => {
            const isBest = i === 0;
            const w = Math.max(6, Math.round((o.price / p.highest) * 100));
            return (
              <li key={o.store} className="py-2.5">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className={isBest ? "font-semibold text-[var(--ink)]" : "text-[var(--ink-2)]"}>{o.store}</span>
                  <span className="flex items-baseline gap-2 tabular-nums">
                    {!isBest && (
                      <span className="text-[12px] font-medium text-[var(--warn)]">+{shortPrice(o.price - best.price)}</span>
                    )}
                    <span className={isBest ? "font-semibold text-[var(--ink)]" : "text-[var(--ink-2)]"}>{formatPrice(o.price)}</span>
                  </span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-[var(--paper-2)] overflow-hidden">
                  <div className={`h-full rounded-full proof-bar ${isBest ? "is-best" : ""}`} style={{ width: `${w}%` }} />
                </div>
              </li>
            );
          })}
        </ul>

        {/* savings */}
        {others.length > 0 && (
          <div className="mt-3 flex items-start gap-2.5 rounded-xl bg-[var(--ok-soft)] px-4 py-3 text-[14px] leading-snug text-[var(--ok-ink)]">
            <TrendingDown className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>
              {L(
                lang,
                `${best.store}da olsangiz, ${worst.store}ga nisbatan ${formatPrice(p.savings)} (${p.savingsPct}%) tejaysiz.`,
                `В ${best.store} дешевле, чем в ${worst.store}, на ${formatPrice(p.savings)} (${p.savingsPct}%).`,
                `Save ${formatPrice(p.savings)} (${p.savingsPct}%) at ${best.store} compared with ${worst.store}.`
              )}
            </span>
          </div>
        )}

        {/* actions */}
        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          {isLive && best.url ? (
            <a href={best.url} target="_blank" rel="noopener noreferrer" className="btn-primary w-full sm:w-auto sm:flex-1 h-12 text-sm">
              {L(lang, `${best.store}da ochish`, `Открыть в ${best.store}`, `Open at ${best.store}`)}
              <ExternalLink className="w-4 h-4" />
            </a>
          ) : null}
          <Link href={`/search?q=${encodeURIComponent(p.name)}`} className="btn-ghost w-full sm:w-auto sm:flex-1 h-12 text-sm">
            {L(lang, "Barcha narxlar", "Все цены", "Compare all prices")}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* provenance */}
      <p className="mt-4 text-xs leading-relaxed text-[var(--ink-2)]">
        {isLive
          ? L(
              lang,
              `Narxlar do'konlar saytidan olindi, ${clock} da tekshirildi (Toshkent vaqti). Narxlar o'zgarishi mumkin.`,
              `Цены взяты с сайтов магазинов, проверены в ${clock} (по Ташкенту). Цены могут меняться.`,
              `Prices taken from the stores' websites, checked at ${clock} Tashkent time. Prices can change.`
            )
          : L(
              lang,
              "Bu taqqoslash qanday ishlashini ko'rsatuvchi namuna. Jonli tekshiruv hozircha mavjud emas.",
              "Это пример того, как работает сравнение. Живая проверка сейчас недоступна.",
              "This is an example of how the comparison works. The live check isn't available right now."
            )}
      </p>
    </div>
  );
}

/** Four numbers that come from the same live check (hidden when there's no live data). */
export function LiveProofStats() {
  const { language } = useTranslation();
  const lang = language as Lang;
  const { data } = useLivePriceBoard();
  const { clock } = useCheckedAgo(data?.checkedAt, lang);
  if (!data?.live) return null;
  const maxGap = data.products.reduce((m, p) => Math.max(m, p.savingsPct), 0);
  const stats = [
    { n: String(data.storesChecked.length), l: L(lang, "do'kon jonli tekshirildi", "магазина проверено вживую", "stores checked live") },
    { n: data.listingsScanned.toLocaleString("en-US"), l: L(lang, "e'lon ko'rib chiqildi", "предложений просмотрено", "listings checked") },
    { n: maxGap > 0 ? `${maxGap}%` : "—", l: L(lang, "bir model narxidagi eng katta farq", "макс. разница цен на одну модель", "biggest gap on the same model") },
    { n: clock, l: L(lang, "oxirgi tekshiruv (Toshkent)", "последняя проверка (Ташкент)", "last check (Tashkent time)") },
  ];
  return (
    <dl className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((s) => (
        <div key={s.l} className="flex flex-col-reverse justify-end rounded-2xl bg-white border border-[var(--rule-soft)] px-5 py-4">
          <dt className="mt-2 text-[13px] leading-snug text-[var(--ink-2)]">{s.l}</dt>
          <dd className="font-lux text-[1.75rem] leading-none text-[var(--ink)] tabular">{s.n}</dd>
        </div>
      ))}
    </dl>
  );
}
