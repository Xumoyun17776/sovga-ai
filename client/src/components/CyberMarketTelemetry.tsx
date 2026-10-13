import { TrendingDown } from "../lib/icons";
import { useTranslation } from "../lib/i18n";
import { useCurrency } from "../lib/currency";
import { useLivePriceBoard, useCheckedAgo } from "./LivePriceProof";

/**
 * Scrolling strip of real store discounts from the live price board.
 * Renders nothing when there is no live data, so it never shows made-up prices.
 */
export default function CyberMarketTelemetry() {
  const { language } = useTranslation();
  const { formatPrice } = useCurrency();
  const { data } = useLivePriceBoard();
  const { clock } = useCheckedAgo(data?.checkedAt, language);
  if (!data?.live) return null;
  const vs = language === "uz" ? "ga nisbatan" : language === "ru" ? "дешевле, чем" : "vs";
  // Prefer discounts the stores themselves report; otherwise show same-model price gaps between stores.
  const useDrops = data.drops.length >= 3;
  const drops = useDrops
    ? data.drops.map((d) => ({ url: d.url, store: d.store, title: d.title, price: d.price, pct: d.pct, note: "" }))
    : data.products.map((p) => ({
        url: p.offers[0].url,
        store: p.offers[0].store,
        title: p.name,
        price: p.lowest,
        pct: p.savingsPct,
        note: language === "ru" ? `${vs} ${p.offers[p.offers.length - 1].store}` : language === "uz" ? `${p.offers[p.offers.length - 1].store} ${vs}` : `${vs} ${p.offers[p.offers.length - 1].store}`,
      }));
  if (drops.length < 3) return null;

  const label = useDrops
    ? language === "uz" ? "Do'kon chegirmalari" : language === "ru" ? "Скидки магазинов" : "Store discounts"
    : language === "uz" ? "Bir model, turli narx" : language === "ru" ? "Одна модель — разные цены" : "Same model, different price";

  return (
    <div className="w-full bg-white/60 dark:bg-white/[0.02] backdrop-blur border-y border-[var(--line)] py-2.5 overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-4">
        <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 flex-shrink-0 pr-4 border-r border-[var(--line-strong)] inline-flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {label}
          <span className="hidden sm:inline font-normal text-slate-500 dark:text-slate-400 tabular-nums">· {clock}</span>
        </span>
        <div className="overflow-hidden flex-1 relative [mask-image:linear-gradient(to_right,transparent,black_24px,black_calc(100%-24px),transparent)]">
          <div className="animate-ticker flex items-center gap-8">
            {[...drops, ...drops].map((t, idx) => (
              <a
                key={idx}
                href={t.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-hidden={idx >= drops.length ? true : undefined}
                tabIndex={idx >= drops.length ? -1 : undefined}
                className="inline-flex items-center gap-2 text-xs py-0.5 flex-shrink-0 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <span className="text-slate-400 dark:text-slate-500">{t.store}</span>
                <span className="font-medium text-slate-800 dark:text-slate-200 max-w-[16rem] truncate">{t.title}</span>
                <span className="tabular-nums">{formatPrice(t.price)}</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-0.5">
                  <TrendingDown className="w-3 h-3" />−{t.pct}%
                </span>
                {t.note && <span className="text-slate-400 dark:text-slate-500">{t.note}</span>}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
