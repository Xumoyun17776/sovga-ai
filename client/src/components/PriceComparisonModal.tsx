import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import confetti from "canvas-confetti";
import { research, formatPrice } from "../lib/api";
import { cyberSound } from "../lib/cyberSound";
import { useTranslation, trData } from "../lib/i18n";
import {
  X,
  ExternalLink,
  TrendingDown,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  CreditCard,
  Zap,
  Copy,
  Check,
  Shield,
  ArrowDownRight,
  Clock,
  CheckCircle2,
} from "../lib/icons";
import type { ComparisonResult } from "@shared/types";
import { copyText } from "../lib/clipboard";

interface Props {
  productName: string;
  currentPrice?: number | null;
  currentStore?: string;
  onClose: () => void;
}

export default function PriceComparisonModal({ productName, currentPrice, currentStore, onClose }: Props) {
  const { language } = useTranslation();
  const [isBargaining, setIsBargaining] = useState(false);
  const [bargainStep, setBargainStep] = useState(0);
  const [bargainResult, setBargainResult] = useState<any | null>(null);
  const [copiedPromo, setCopiedPromo] = useState(false);

  const { data: comparison, isLoading, isError } = useQuery<ComparisonResult>({
    queryKey: ["price-compare", productName],
    queryFn: () =>
      research.compare({
        productName,
        currentPrice: currentPrice || undefined,
        currentStore,
      }),
  });

  const handleStartBargain = async () => {
    try {
      setIsBargaining(true);
      setBargainStep(1);
      cyberSound.playScan();

      const timer1 = setTimeout(() => {
        setBargainStep(2);
      }, 800);

      const timer2 = setTimeout(() => {
        setBargainStep(3);
      }, 1600);

      const effectivePrice = comparison?.priceHistory?.currentPrice || currentPrice || 1000000;
      const effectiveStore = comparison?.exactMatches?.[0]?.store || currentStore || "Texnomart";

      const res = await research.bargain({
        productName,
        store: effectiveStore,
        price: effectivePrice,
        language,
      });

      clearTimeout(timer1);
      clearTimeout(timer2);
      setBargainStep(4);
      setBargainResult(res);
      setIsBargaining(false);
      cyberSound.playSuccess();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (_) {}
    } catch (e) {
      setIsBargaining(false);
      setBargainStep(0);
    }
  };

  const handleCopyCode = (code: string) => {
    copyText(code);
    setCopiedPromo(true);
    cyberSound.playConfirm();
    setTimeout(() => setCopiedPromo(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-[#0b1224] text-slate-900 dark:text-slate-100 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-sm relative my-auto border border-[var(--line)] dark:border-amber-500/25 max-h-[92vh] max-h-[92dvh] overflow-y-auto animate-scale-in">
        {/* Ambient Top Glow */}

        {/* Close Button */}
        <button
          onClick={() => {
            cyberSound.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 w-9 h-9 rounded-xl bg-white/80 dark:bg-slate-800/80 hover:bg-amber-100/60 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-[var(--line)] dark:border-slate-700/80 flex items-center justify-center transition cursor-pointer shadow-2xs"
          aria-label="Yopish"
        >
          <X className="w-4 h-4 stroke-[2.2]" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-2xl icon-medallion icon-box-gold flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900 dark:text-white">
              {language === "uz"
                ? "Narxlarni solishtirish"
                : language === "ru"
                ? "Анализ Цен в Реальном Времени"
                : "Price comparison"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-1">{productName}</p>
          </div>
        </div>

        {isLoading && (
          <div className="py-16 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {language === "uz"
                ? "O'zbekiston do'konlari bo'ylab narxlar tahlil qilinmoqda..."
                : language === "ru"
                ? "Анализ цен по магазинам Узбекистана..."
                : "Scanning real-time prices across verified stores in Uzbekistan..."}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {language === "uz"
                ? "Uzum Market, Texnomart, MediaPark va Asaxiy omborlari tekshirilmoqda"
                : language === "ru"
                ? "Проверка каталогов Uzum Market, Texnomart, MediaPark и Asaxiy"
                : "Checking live inventories at Uzum Market, Texnomart, MediaPark and Asaxiy"}
            </p>
          </div>
        )}

        {isError && (
          <div className="py-12 text-center text-red-500">
            <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-60" />
            <p>
              {language === "uz"
                ? "Taqqoslash ma'lumotlarini yuklab bo'lmadi. Qaytadan urinib ko'ring."
                : language === "ru"
                ? "Не удалось загрузить данные сравнения. Пожалуйста, попробуйте снова."
                : "Failed to load price comparison telemetry. Please try again."}
            </p>
          </div>
        )}

        {comparison && (
          <div className="space-y-6 mt-4 animate-fade-in">
            {/* Price Trend & Best Time to Buy Advice */}
            <div className="space-y-3">
              <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 uppercase tracking-wide">
                    {language === "uz" ? "30 Kunlik Narx Trendi" : language === "ru" ? "Тренд Цены за 30 Дней" : "30-Day Price Trend"}
                  </p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl font-bold text-slate-900 dark:text-white">{formatPrice(comparison.priceHistory?.currentPrice || 0)}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {language === "uz"
                        ? `vs 30 kun oldin (${formatPrice(comparison.priceHistory?.price30DaysAgo || 0)})`
                        : language === "ru"
                        ? `vs 30 дней назад (${formatPrice(comparison.priceHistory?.price30DaysAgo || 0)})`
                        : `vs 30 days ago (${formatPrice(comparison.priceHistory?.price30DaysAgo || 0)})`}
                    </span>
                  </div>
                </div>
                <div
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold ${
                    comparison.priceHistory?.trend === "down"
                      ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                      : "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                  }`}
                >
                  {comparison.priceHistory?.trend === "down" ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                  {comparison.priceHistory?.changePercent ?? 0}%
                </div>
              </div>

              {comparison.bestTimeBuyAdvice && (
                <div className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 ${
                  comparison.bestTimeBuyAdvice.recommendation === "buy_now"
                    ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300"
                    : comparison.bestTimeBuyAdvice.recommendation === "wait"
                    ? "bg-amber-50 dark:bg-amber-950/40 border-[var(--line)] dark:border-amber-800 text-amber-900 dark:text-amber-300"
                    : "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-300"
                }`}>
                  <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-500" />
                  <div>
                    <span className="font-bold uppercase tracking-wider block text-[11px]">
                      {language === "uz" ? "AI Xarid Tavsiyasi: " : language === "ru" ? "Совет AI: " : "AI Purchasing Advice: "}
                      {comparison.bestTimeBuyAdvice.recommendation === "buy_now"
                        ? language === "uz" ? "HOZIR XARID QILING (ENG QULAY VAQT)" : language === "ru" ? "ПОКУПАЙТЕ СЕЙЧАС (ЛУЧШЕЕ ВРЕМЯ)" : "BUY NOW (PRIME WINDOW)"
                        : comparison.bestTimeBuyAdvice.recommendation === "wait"
                        ? language === "uz" ? "CHEGIRMA KUTISH TAVSIYA ETILADI" : language === "ru" ? "РЕКОМЕНДУЕТСЯ ПОДОЖДАТЬ СКИДКИ" : "WAIT FOR FURTHER DISCOUNT"
                        : language === "uz" ? "BOZORNING O'RTACHA NARXI" : language === "ru" ? "СРЕДНЯЯ РЫНОЧНАЯ ЦЕНА" : "FAIR MARKET AVERAGE"}
                    </span>
                    <p className="text-xs mt-0.5 leading-relaxed">{comparison.bestTimeBuyAdvice.reason}</p>
                  </div>
                </div>
              )}
            </div>

            {/* ─── AI NEURAL AUTO-BARGAIN & MARGIN SQUEEZER ─── */}
            <div className="rounded-2xl p-4 sm:p-5 border border-[var(--line)] dark:border-amber-500/30 shadow-sm relative overflow-hidden bg-amber-500/10">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-11 h-11 rounded-2xl icon-medallion icon-box-gold flex items-center justify-center flex-shrink-0 shadow-inner">
                    <Zap className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{language === "uz" ? "AI Bozor Savdolashishi" : language === "ru" ? "AI Авто-Торг с Магазином" : "Find a better price"}</span>
                      <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500 text-white">
                        {language === "uz" ? "MARJA SIQUVCHI" : language === "ru" ? "СКИДКА ДО 14%" : "MARGIN SQUEEZER"}
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {language === "uz"
                        ? "Do'kon va distribyutor marjasini tahlil qilib, AI orqali qo'shimcha maxfiy chegirma olish"
                        : language === "ru"
                        ? "Анализ маржи продавца и генерация эксклюзивной скрытой скидки"
                        : "Squeeze vendor margin and unlock a secret verified discount voucher"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Idle State: Action Trigger */}
              {!isBargaining && !bargainResult && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-200/70 dark:border-white/10">
                  <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>
                      {language === "uz"
                        ? "O'rtacha 6% - 14% gacha qo'shimcha tejash imkoniyati mavjud"
                        : language === "ru"
                        ? "Доступна дополнительная скидка от 6% до 14%"
                        : "Potential direct savings between 6% and 14% unlocked"}
                    </span>
                  </div>
                  <button
                    onClick={handleStartBargain}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-white font-bold text-xs shadow-md hover:scale-[1.02] transition-all cursor-pointer flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600"
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    <span>
                      {language === "uz" ? "AI Bilan Savdolashish" : language === "ru" ? "Торговаться с Магазином" : "Squeeze Margin Now"}
                    </span>
                  </button>
                </div>
              )}

              {/* Negotiating State: Live Radar Progress */}
              {isBargaining && (
                <div className="py-3 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border border-amber-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                    <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                      {bargainStep === 1 && (language === "uz" ? "1/4: Rasmiy dilerlik omborlari marjasi tekshirilmoqda..." : language === "ru" ? "1/4: Сканирование маржи дилера..." : "1/4: Checking official dealer warehouse margins...")}
                      {bargainStep === 2 && (language === "uz" ? "2/4: Kiber-arbitraj: barcha do'konlar solishtirilmoqda..." : language === "ru" ? "2/4: Кросс-маркет арбитраж..." : "2/4: Cross-market arbitrage: comparing every store...")}
                      {bargainStep === 3 && (language === "uz" ? "3/4: Yashirin ulgurji vaucher qo'llanmoqda..." : language === "ru" ? "3/4: Применение скрытого ваучера..." : "3/4: Applying hidden wholesale voucher...")}
                      {bargainStep === 4 && (language === "uz" ? "4/4: Bitim yakunlandi!" : language === "ru" ? "4/4: Сделка оформлена!" : "4/4: Deal locked in!")}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full transition-all duration-200 rounded-full bg-amber-500"
                      style={{ width: `${(bargainStep / 4) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Result State: Negotiated Deal & Voucher */}
              {bargainResult && (
                <div className="pt-2 space-y-3 animate-fade-in">
                  <div className="p-3.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-emerald-400/60 dark:border-emerald-500/40 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        {language === "uz" ? "Savdolashish Muvaffaqiyatli!" : language === "ru" ? "Успешный Торг!" : "Margin Squeezed!"}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {bargainResult.certificateId}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                      <div>
                        <span className="text-xs text-slate-400 line-through mr-2">
                          {formatPrice(bargainResult.originalPrice)}
                        </span>
                        <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                          {formatPrice(bargainResult.bargainedPrice)}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-mono font-bold text-xs">
                        -{bargainResult.discountPercent}% ({formatPrice(bargainResult.savingsAmount)} {language === "uz" ? "tejaldi" : language === "ru" ? "сэкономлено" : "saved"})
                      </span>
                    </div>

                    {/* Secret Promo Box */}
                    <div className="mt-3 flex items-center justify-between gap-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-[var(--line)] dark:border-amber-800/60">
                      <div>
                        <span className="text-[10px] text-amber-800 dark:text-amber-300 font-medium block">
                          {language === "uz" ? "Shaxsiy Chegirma Promokodingiz:" : language === "ru" ? "Ваш Персональный Промокод:" : "Your Personal Promo Code:"}
                        </span>
                        <span className="font-mono font-bold text-sm text-slate-900 dark:text-white tracking-wide">
                          {bargainResult.promoCode}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopyCode(bargainResult.promoCode)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                      >
                        {copiedPromo ? <Check className="w-3.5 h-3.5 text-slate-950" /> : <Copy className="w-3.5 h-3.5 text-slate-950" />}
                        <span>{copiedPromo ? (language === "uz" ? "Nusxalandi!" : language === "ru" ? "Скопировано!" : "Copied!") : (language === "uz" ? "Nusxa Olish" : language === "ru" ? "Копировать" : "Copy")}</span>
                      </button>
                    </div>

                    {/* Step telemetry summary */}
                    <div className="mt-2 text-[10px] text-slate-500 dark:text-slate-400 space-y-0.5">
                      {bargainResult.steps?.map((st: string, sIdx: number) => (
                        <p key={sIdx} className="line-clamp-1">✓ {st}</p>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Exact Store Matches */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500 stroke-[2.2]" />
                {language === "uz"
                  ? "O'zbekiston Do'konlari Solishtiruvi (Aynan Shu Mahsulot)"
                  : language === "ru"
                  ? "Сравнение Магазинов Узбекистана (Именно Этот Товар)"
                  : "Uzbekistan Verified Retailers Comparison (Exact SKU)"}
              </h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                {(comparison.exactMatches || []).map((offer, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 transition ${
                      offer.isLowestPrice ? "bg-emerald-50/50 dark:bg-emerald-950/20" : "bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900 dark:text-white">{offer.store}</span>
                        {offer.isLowestPrice && (
                          <span className="text-[10px] font-bold bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full font-mono">
                            {language === "uz" ? "ENG ARZON" : language === "ru" ? "ЛУЧШАЯ ЦЕНА" : "LOWEST"}
                          </span>
                        )}
                        {offer.discount && (
                          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                            {offer.discount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {trData(offer.availability)}{offer.deliveryTime ? ` · ${trData(offer.deliveryTime)}` : ""}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-base font-bold text-slate-900 dark:text-white">{formatPrice(offer.price, offer.currency)}</span>
                        {offer.originalPrice && offer.originalPrice > offer.price && (
                          <p className="text-xs text-slate-400 line-through">{formatPrice(offer.originalPrice, offer.currency)}</p>
                        )}
                      </div>
                      <a
                        href={offer.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => cyberSound.playConfirm()}
                        className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
                          offer.isLowestPrice
                            ? "bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white shadow-xs"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                      >
                        <ExternalLink className="w-3.5 h-3.5 stroke-[2.2]" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Installment Options in Uzbekistan */}
            {comparison.installmentOptions && comparison.installmentOptions.length > 0 && (
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 stroke-[2.2]" />
                  <span>
                    {language === "uz"
                      ? "Halol Muddatli To'lov / Nasiya (Oylik to'lovlar UZS)"
                      : language === "ru"
                      ? "Рассрочка и Насия (Ежемесячные выплаты UZS)"
                      : "Verified Installments & Nasiya (Monthly in UZS)"}
                  </span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {comparison.installmentOptions.map((inst, iIdx) => (
                    <div key={iIdx} className="bg-white dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{inst.provider}</span>
                        <span className="block text-[11px] text-slate-400">{inst.store}</span>
                      </div>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                        {formatPrice(inst.monthlyPayment)} {language === "uz" ? "/ oy" : language === "ru" ? "/ мес" : "/ mo"} ({inst.months} {language === "uz" ? "oy" : language === "ru" ? "мес" : "mos"})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Equivalent Alternatives with Spec & Savings Analysis */}
            {comparison.equivalentAlternatives && comparison.equivalentAlternatives.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-3 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[2.2]" />
                  {language === "uz"
                    ? "Ekvivalent Muqobil Variantlar (Sifatni yo'qotmasdan tejash)"
                    : language === "ru"
                    ? "Эквивалентные Альтернативы (Экономия без потери качества)"
                    : "Equivalent Alternatives (Save without compromise)"}
                </h3>
                <div className="space-y-3">
                  {comparison.equivalentAlternatives.map((alt, idx) => (
                    <div key={idx} className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="font-semibold text-sm text-slate-900 dark:text-white">{alt.name}</span>
                          <span className="block text-xs text-slate-500 dark:text-slate-400">{alt.store}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">{formatPrice(alt.price, alt.currency)}</span>
                          <span className="block text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            {formatPrice(alt.savingsAmount)} {language === "uz" ? "tejash" : language === "ru" ? "экономия" : "savings"} ({alt.savingsPercent}%)
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs">
                        {alt.isTrulyEquivalent ? (
                          <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle className="w-3 h-3" />
                            {language === "uz" ? "To'liq ekvivalent model" : language === "ru" ? "Полностью эквивалентная модель" : "Direct equivalent model"}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-[var(--line)] dark:border-amber-800">
                            <AlertCircle className="w-3 h-3" />
                            {language === "uz" ? "Farqlarga e'tibor bering" : language === "ru" ? "Обратите внимание на различия" : "Note key differences"}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                        {alt.equivalenceExplanation}
                      </p>

                      <div className="space-y-1 pt-1">
                        {(alt.specificationDifferences || []).map((diff, dIdx) => (
                          <p key={dIdx} className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-amber-400" />
                            {diff}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Research Footnote */}
            <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center pt-2 border-t border-slate-200 dark:border-slate-800">
              {comparison.researchSummary} · {language === "uz" ? "Tekshirildi:" : language === "ru" ? "Проверено:" : "Verified:"} {new Date(comparison.lastChecked).toLocaleTimeString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
