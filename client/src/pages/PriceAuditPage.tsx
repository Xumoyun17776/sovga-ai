import { useState, useEffect } from "react";
import { useTranslation, tr } from "../lib/i18n";
import confetti from "canvas-confetti";
import { formatPrice, research } from "../lib/api";
import { useToast } from "../components/Toast";
import { cyberSound } from "../lib/cyberSound";
import {
  TrendingDown,
  TrendingUp,
  ShieldAlert,
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Sliders,
  DollarSign,
  Clock,
  Sparkles,
  BarChart3,
  Layers,
  Store,
  Bell,
  Heart,
  Share2,
  Check,
  Info,
  Link as LinkIcon,
  X,
  Zap,
} from "../lib/icons";

interface AuditResult {
  productName: string;
  authenticityScore: number; // 0-100
  signal: "buy_now" | "fair" | "wait";
  currentBestPrice: number;
  marketMedianPrice: number;
  inflatedOriginalPrice: number;
  realDiscountPercent: number;
  claimedDiscountPercent: number;
  isFakeDiscount: boolean;
  verdictUz: string;
  storeComparison: {
    store: string;
    price: number;
    warranty: string;
    delivery: string;
    verified: boolean;
    url: string;
  }[];
  priceHistory: { date: string; price: number }[];
  marketNotes: string[];
}

const TRENDING_SEARCHES = [
  "DeLonghi Dolce Gusto Mini Me",
  "iPhone 16 Pro 128GB",
  "Dyson Airwrap Complete Long",
  "Sony WH-1000XM5",
  "Samsung Galaxy S24 Ultra",
  "Xiaomi Robot Vacuum X20+",
  "Artel HD 276 FN Muzlatgich",
  "MacBook Air M3 256GB",
];

// Helper to extract clean product name from marketplace URLs
function extractProductFromUrl(url: string): string | null {
  try {
    const trimmed = url.trim();
    if (!trimmed.includes("http://") && !trimmed.includes("https://") && !trimmed.includes(".uz")) {
      return null;
    }
    const cleanUrl = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
    const parsed = new URL(cleanUrl);
    const pathParts = parsed.pathname.split("/").filter(Boolean);
    if (pathParts.length === 0) return null;

    let slug = pathParts[pathParts.length - 1] || "";
    // strip query or html
    slug = slug.replace(/\.html$/i, "").replace(/-\d+$/, "").replace(/_/g, "-");
    const words = slug.split("-").filter((w) => w.length > 0 && !/^\d+$/.test(w));
    if (words.length >= 2) {
      // capitalize words
      return words
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
        .replace(/^(Smartfon|Telefon|Noutbuk|Kofemashina)\s+/i, "");
    }
  } catch {
    return null;
  }
  return null;
}

export default function PriceAuditPage() {
  const { language } = useTranslation();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState("DeLonghi Dolce Gusto Mini Me");
  const [isAuditing, setIsAuditing] = useState(false);
  const [detectedUrlProduct, setDetectedUrlProduct] = useState<string | null>(null);

  // Radar Alert Modal State
  const [showRadarModal, setShowRadarModal] = useState(false);
  const [radarTelegram, setRadarTelegram] = useState("");
  const [radarThreshold, setRadarThreshold] = useState("5"); // 5%, 10%, 15%
  const [radarSaved, setRadarSaved] = useState(false);

  // Wishlist state
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Filled from live store prices on first load (no made-up demo numbers)
  const [auditData, setAuditData] = useState<AuditResult>({
    productName: "",
    authenticityScore: 0,
    signal: "fair",
    currentBestPrice: 0,
    marketMedianPrice: 0,
    inflatedOriginalPrice: 0,
    realDiscountPercent: 0,
    claimedDiscountPercent: 0,
    isFakeDiscount: false,
    verdictUz: "",
    storeComparison: [],
    priceHistory: [],
    marketNotes: [],
  });

  useEffect(() => {
    executeAudit(searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Watch search query for marketplace links
  useEffect(() => {
    const extracted = extractProductFromUrl(searchQuery);
    setDetectedUrlProduct(extracted);
  }, [searchQuery]);

  const executeAudit = async (queryToRun: string) => {
    const cleanName = queryToRun.trim();
    if (!cleanName) return;

    setIsAuditing(true);
    cyberSound.playClick();

    try {
      const comp = await research.compare({ productName: cleanName });
      const offers: any[] = comp?.exactMatches || [];
      if (!offers.length) {
        toast.error(
          language === "ru" ? "Товар не найден в магазинах" : language === "en" ? "No store listing found" : "Do'konlarda topilmadi",
          language === "ru" ? "Уточните название (бренд и модель)" : language === "en" ? "Try the exact brand and model" : "Brend va modelni aniqroq yozing"
        );
        return;
      }
      const prices = offers.map((o) => o.price).filter((n) => n > 0).sort((a, b) => a - b);
      const bestPrice = prices[0];
      const median = prices[Math.floor(prices.length / 2)];
      const check = comp?.discountCheck || { claimedPercent: null, storeOldPrice: null, historyDays: 0, verdict: "unknown", note: "" };
      const ph = comp?.priceHistory;
      const historyDrop = ph && check.historyDays >= 7 && ph.price30DaysAgo > bestPrice
        ? Math.round(((ph.price30DaysAgo - bestPrice) / ph.price30DaysAgo) * 100)
        : 0;
      const isFake = check.verdict === "suspicious";
      // Simple index: genuine/no discount 90, not enough history yet 70, exaggerated discount 40
      const calculatedScore = isFake ? 40 : check.verdict === "unknown" ? 70 : 90;
      const advice = comp?.bestTimeBuyAdvice?.recommendation;

      setAuditData({
        productName: offers[0]?.name || cleanName,
        authenticityScore: calculatedScore,
        signal: advice === "buy_now" ? "buy_now" : advice === "wait" ? "wait" : "fair",
        currentBestPrice: bestPrice,
        marketMedianPrice: median,
        inflatedOriginalPrice: check.storeOldPrice || bestPrice,
        realDiscountPercent: historyDrop,
        claimedDiscountPercent: check.claimedPercent || 0,
        isFakeDiscount: isFake,
        verdictUz: [check.note, comp?.bestTimeBuyAdvice?.reason].filter(Boolean).join(" "),
        storeComparison: offers.map((m: any) => ({
          store: m.store,
          price: m.price,
          warranty: m.verified ? tr("Do'kon sahifasida", "На странице магазина", "On the store page") : "Tekshiring",
          delivery: m.availability || "—",
          verified: !!m.verified,
          url: m.url,
        })),
        priceHistory: (ph?.historyPoints || []).map((h: any) => ({ date: h.date, price: h.price })),
        marketNotes: [
          comp?.researchSummary || "",
          comp?.liveData
            ? tr("Narxlar Olcha va Texnomart do'konlarining jonli qidiruvidan olindi.", "Цены получены из живого поиска Olcha и Texnomart.", "Prices come from a live search of Olcha and Texnomart.")
            : tr("Bu mahsulot jonli qidiruvda topilmadi — narxlar taxminiy.", "Товар не найден в живом поиске — цены приблизительные.", "Not found in the live search — prices are estimates."),
          check.historyDays < 7
            ? tr(
              `Narx tarixi yig'ilmoqda: ${check.historyDays} kun. Chegirmani baholash uchun kamida 7 kun kerak.`,
              `История цен собирается: ${check.historyDays} дн. Для оценки скидки нужно минимум 7 дней.`,
              `Price history so far: ${check.historyDays} days. At least 7 days are needed to judge a discount.`
            )
            : tr(`Narx tarixi: ${check.historyDays} kun.`, `История цен: ${check.historyDays} дн.`, `Price history: ${check.historyDays} days.`),
        ].filter(Boolean),
      });

      if (calculatedScore >= 80) {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.65 },
          colors: ["#10b981", "#3b82f6", "#d9431f", "#d9431f"],
        });
        cyberSound.play("success");
      } else {
        cyberSound.play("chime");
      }

      toast.success(tr("Narx auditi muvaffaqiyatli yakunlandi!", "Проверка цены завершена", "Price check complete"), tr("Haqiqiy narxlar yuklandi", "Загружены реальные цены магазинов", "Real store prices loaded"));
    } catch (err: any) {
      toast.error(err.message || tr("Auditda xatolik yuz berdi", "Ошибка при проверке", "Something went wrong during the check"));
    } finally {
      setIsAuditing(false);
    }
  };

  const handleRunAudit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (detectedUrlProduct) {
      setSearchQuery(detectedUrlProduct);
      executeAudit(detectedUrlProduct);
    } else {
      executeAudit(searchQuery);
    }
  };

  const handleSelectTrending = (item: string) => {
    setSearchQuery(item);
    executeAudit(item);
  };

  const handleToggleWishlist = () => {
    cyberSound.playClick();
    setIsWishlisted(!isWishlisted);
    try {
      const saved = JSON.parse(localStorage.getItem("sovga_wishlist") || "[]");
      if (!isWishlisted) {
        saved.push({
          id: Date.now(),
          name: auditData.productName,
          price: auditData.currentBestPrice,
          store: auditData.storeComparison[0]?.store || "Uzum Market",
          url: auditData.storeComparison[0]?.url || "#",
          date: new Date().toLocaleDateString("uz-UZ"),
        });
        localStorage.setItem("sovga_wishlist", JSON.stringify(saved));
        toast.success(tr("Wishlistga qo'shildi!", "Добавлено в избранное", "Added to your wishlist"), tr("Saqlangan mahsulotlar ro'yxatida ko'rishingiz mumkin", "Его можно найти в списке сохранённых товаров", "You can find it in your saved products"));
      } else {
        const filtered = saved.filter((s: any) => s.name !== auditData.productName);
        localStorage.setItem("sovga_wishlist", JSON.stringify(filtered));
        toast.info(tr("Wishlistdan olib tashlandi", "Удалено из избранного", "Removed from your wishlist"));
      }
    } catch {}
  };

  const handleShareTelegram = () => {
    cyberSound.playConfirm();
    const text =
      `${tr("Narx tekshiruvi", "Проверка цены", "Price check")}: ${auditData.productName}\n` +
      `${tr("Eng past narx", "Самая низкая цена", "Lowest price")}: ${formatPrice(auditData.currentBestPrice)}\n` +
      `${tr("O'rtacha narx", "Средняя цена", "Average price")}: ${formatPrice(auditData.marketMedianPrice)}\n` +
      `${auditData.verdictUz}\n\n` +
      `Sovg'a.uz`;

    const url = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const handleSaveRadar = () => {
    if (!radarTelegram.trim()) {
      toast.error(tr("Telegram foydalanuvchi nomini kiriting (masalan: @username)", "Введите имя пользователя Telegram (например, @username)", "Enter your Telegram username (e.g. @username)"));
      return;
    }
    cyberSound.play("radar");
    setRadarSaved(true);
    setShowRadarModal(false);
    // Telegram delivery isn't connected yet, so don't promise a message
    toast.success(
      tr("Kuzatuv saqlandi", "Отслеживание сохранено", "Alert saved"),
      tr(
        "Telegram orqali xabar yuborish tez orada ishga tushadi. Hozircha narxni shu sahifada tekshiring.",
        "Отправка в Telegram скоро заработает. Пока проверяйте цену на этой странице.",
        "Telegram messages are coming soon. For now, check the price on this page."
      )
    );
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 animate-fade-in text-slate-900 dark:text-white">
      {/* Ambient background vignette glow */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
      </div>

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3.5">
        <h1 className="lux-title text-[2.4rem] sm:text-[3.2rem] text-slate-900 dark:text-white leading-[1.05]">
            {language === "uz" ? "Narx tekshiruvi" : language === "ru" ? "Проверка цены" : "Price check"}
          </h1>
        <p className="text-base text-slate-500 dark:text-slate-400 mt-3 max-w-2xl mx-auto leading-relaxed">
            {language === "uz" ? "Uzum, Texnomart, MediaPark va Asaxiy narxlarini solishtiring va chegirma haqiqiymi yoki narx oldin ko'tarilganmi — bilib oling." : language === "ru" ? "Сравните цены Uzum, Texnomart, MediaPark и Asaxiy и узнайте, настоящая ли скидка или цену сначала подняли." : "Compare prices on Uzum, Texnomart, MediaPark and Asaxiy, and find out whether a discount is real or the price was raised first."}
          </p>
      </div>

      {/* Search Input Bar with URL auto-detection */}
      <div className="max-w-3xl mx-auto space-y-3">
        <form onSubmit={handleRunAudit} className="bg-white dark:bg-[#0b1224] flex gap-2.5 p-1.5 rounded-2xl border border-[var(--line)] dark:border-amber-500/30 shadow-sm">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-amber-600/70 dark:text-amber-400/70 absolute left-4 top-1/2 -translate-y-1/2 stroke-[2.2]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={tr("Mahsulot nomi yoki do'kon havolasini kiriting (Uzum / Texnomart)...", "Название товара или ссылка на магазин (Uzum / Texnomart)...", "Product name or a store link (Uzum / Texnomart)...")}
              className="w-full pl-11 pr-4 py-3.5 bg-transparent rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-500/40 transition"
            />
          </div>
          <button
            type="submit"
            disabled={isAuditing}
            className="px-6 sm:px-8 py-3.5 text-white font-bold text-xs sm:text-sm rounded-2xl transition flex items-center gap-2 shadow-md disabled:opacity-50 cursor-pointer bg-amber-500 hover:bg-amber-400"
          >
            {isAuditing ? (
              <div className="w-4 h-4 border border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 text-slate-950 fill-current stroke-[2.2]" />
            )}
            <span>{isAuditing ? tr("Skan qilinmoqda...", "Проверяем...", "Checking...") : tr("Audit Qilish", "Проверить цену", "Check price")}</span>
          </button>
        </form>

        {/* URL detection chip banner */}
        {detectedUrlProduct && (
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-[var(--line)] dark:border-amber-500/30 text-amber-950 dark:text-amber-200 text-xs font-medium animate-fade-in shadow-xs">
            <div className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 stroke-[2.2]" />
              <span>
                {tr("Havoladan mahsulot modeli aniqlandi:", "Модель товара определена по ссылке:", "Product model detected from the link:")} <strong>{detectedUrlProduct}</strong>
              </span>
            </div>
            <button
              onClick={() => {
                setSearchQuery(detectedUrlProduct);
                executeAudit(detectedUrlProduct);
              }}
              className="px-3.5 py-1.5 text-white font-bold rounded-xl text-[11px] shadow-sm transition cursor-pointer bg-amber-500 hover:bg-amber-400"
            >
              {tr("Shuni Tekshirish", "Проверить это", "Check this")}
            </button>
          </div>
        )}

        {/* Trending Searches Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
          <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 whitespace-nowrap flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-500 stroke-[2.2]" />
            {tr("Ommabop:", "Популярное:", "Popular:")}
          </span>
          {TRENDING_SEARCHES.map((item) => (
            <button
              key={item}
              onClick={() => handleSelectTrending(item)}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/90 dark:bg-slate-900/80 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-700 dark:text-amber-200/90 hover:text-amber-900 dark:hover:text-amber-300 transition whitespace-nowrap border border-[var(--line)] dark:border-amber-500/20 hover:border-[var(--line-strong)] cursor-pointer shadow-xs"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Main Inspection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: True Authenticity Score Gauge & Radar */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-[#0b1224] rounded-2xl p-6 sm:p-7 border border-[var(--line)] dark:border-amber-500/25 shadow-sm space-y-6 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                {tr("Chegirma Asllik Indeksi", "Индекс честности скидки", "Discount honesty index")}
              </span>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border shadow-2xs ${
                  auditData.authenticityScore >= 80
                    ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40"
                    : auditData.authenticityScore >= 60
                    ? "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-[var(--line)] dark:border-amber-500/40"
                    : "bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-500/40"
                }`}
              >
                {!auditData.productName
                  ? (isAuditing ? tr("Tekshirilmoqda", "Проверяем", "Checking") : "—")
                  : auditData.authenticityScore >= 80
                  ? tr("ISHLONCHLI CHEGIRMA", "ЧЕСТНАЯ СКИДКА", "GENUINE")
                  : auditData.authenticityScore >= 60
                  ? tr("ODATIY NARX", "ПОКА НЕЯСНО", "NOT ENOUGH DATA")
                  : tr("SHUBHALI CHEGIRMA", "СОМНИТЕЛЬНАЯ СКИДКА", "QUESTIONABLE")}
              </span>
            </div>

            {/* Score Ring Display */}
            <div className="flex items-center justify-center py-4">
              <div className="bg-white dark:bg-[#0b1224] relative w-44 h-44 rounded-full flex flex-col items-center justify-center border-8 border-[var(--line)] dark:border-amber-500/20 shadow-inner">
                <span
                  className={`text-5xl font-bold ${
                    auditData.authenticityScore >= 80
                      ? "text-emerald-600 dark:text-emerald-400"
                      : auditData.authenticityScore >= 60
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {auditData.productName ? auditData.authenticityScore : "—"}
                </span>
                <span className="text-[10px] font-bold text-amber-800/70 dark:text-amber-400/80 uppercase tracking-wide mt-1">
                  {tr("100 Ballik Tizim", "Из 100 баллов", "Out of 100")}
                </span>
              </div>
            </div>

            {/* Fake Discount Fraud Radar Breakdown Box */}
            <div className="p-4.5 rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-[var(--line)] dark:border-amber-500/20 space-y-3 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                <span className="flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 stroke-[2.2]" />
                  <span>{tr("Chegirma Tahlili (Radar)", "Анализ скидки", "Discount check")}</span>
                </span>
                <span className="text-[11px] font-mono text-amber-700 dark:text-amber-400 font-bold">{tr("Real vs Vitrina", "Реальность и витрина", "Real vs advertised")}</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">{tr("Do'kon da'vo qilgan chegirma:", "Скидка, заявленная магазином:", "Discount the store claims:")}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">-{auditData.claimedDiscountPercent}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">{tr("Biz aniqlagan haqiqiy farq:", "Реальное снижение по истории цен:", "Real drop in our price history:")}</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">-{auditData.realDiscountPercent}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">{tr("Do'kon ko'rsatgan eski narx:", "Старая цена в магазине:", "Store's 'was' price:")}</span>
                  <span className={`font-bold ${auditData.claimedDiscountPercent ? "text-rose-600 dark:text-rose-400" : "text-slate-500"}`}>{auditData.claimedDiscountPercent ? formatPrice(auditData.inflatedOriginalPrice) : "—"}</span>
                </div>
              </div>
            </div>

            {/* Signal Recommendation Banner */}
            <div
              className={`p-4 rounded-2xl border flex items-start gap-3 text-xs ${
                auditData.signal === "buy_now"
                  ? "bg-emerald-50/90 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-200 shadow-xs"
                  : "bg-amber-50/90 dark:bg-amber-950/30 border-[var(--line)] dark:border-amber-500/30 text-amber-900 dark:text-amber-200 shadow-xs"
              }`}
            >
              {auditData.signal === "buy_now" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5 stroke-[2.2]" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5 stroke-[2.2]" />
              )}
              <div className="space-y-0.5">
                <span className="font-semibold uppercase text-[11px] block">
                  {auditData.signal === "buy_now"
                    ? tr("🟢 Xarid Uchun Qulay Fursat", "Хорошее время для покупки", "Good time to buy")
                    : auditData.signal === "wait"
                    ? tr("Kutib turish mumkin", "Можно подождать", "Maybe wait")
                    : auditData.isFakeDiscount
                    ? tr("Ehtiyot bo'ling", "Стоит присмотреться", "Worth a closer look")
                    : tr("Odatiy narx", "Обычная цена", "Fair price")}
                </span>
                <p className="leading-relaxed font-medium">{auditData.verdictUz}</p>
              </div>
            </div>

            {/* Pricing metrics */}
            <div className="grid grid-cols-2 gap-3 pt-1 text-center">
              <div className="bg-white/90 dark:bg-slate-900/80 p-3.5 rounded-2xl border border-[var(--line)] dark:border-amber-500/20 shadow-xs">
                <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 block">
                  {tr("Eng arzon real narx", "Самая низкая реальная цена", "Lowest real price")}
                </span>
                <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white block mt-0.5">
                  {formatPrice(auditData.currentBestPrice)}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">{auditData.storeComparison[0]?.store || "—"}</span>
              </div>

              <div className="bg-white/90 dark:bg-slate-900/80 p-3.5 rounded-2xl border border-[var(--line)] dark:border-amber-500/20 shadow-xs">
                <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 block">
                  {tr("Bozor medianasi", "Средняя цена", "Average price")}
                </span>
                <span className="text-base sm:text-lg font-bold text-slate-700 dark:text-slate-200 block mt-0.5">
                  {formatPrice(auditData.marketMedianPrice)}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">{tr("O'rtacha narx", "Средняя цена", "Average price")}</span>
              </div>
            </div>

            {/* Interactive Action Hub (Telegram Radar + Wishlist + Share) */}
            <div className="space-y-2.5 pt-2 border-t border-[var(--line)] dark:border-slate-800">
              <button
                onClick={() => {
                  cyberSound.playClick();
                  setShowRadarModal(true);
                }}
                className="w-full py-3.5 text-white rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md cursor-pointer bg-amber-500 hover:bg-amber-400"
              >
                <Bell className="w-4 h-4 text-slate-950 stroke-[2.2]" />
                <span>
                  {radarSaved ? tr("Kuzatuv saqlandi", "Отслеживание сохранено", "Alert saved") + " (" + radarTelegram + ")" : tr("Narx Tushganda Telegramda Bildirish", "Сообщить, когда цена снизится", "Tell me when the price drops")}
                </span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleToggleWishlist}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border cursor-pointer ${
                    isWishlisted
                      ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-500/40"
                      : "bg-white/90 dark:bg-slate-900/80 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-slate-700 dark:text-slate-300 border-[var(--line)] dark:border-slate-800"
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 stroke-[2.2] ${isWishlisted ? "fill-current text-rose-500" : ""}`} />
                  <span>{isWishlisted ? tr("Saqlangan", "Сохранено", "Saved") : tr("Saqlash", "Сохранить", "Save")}</span>
                </button>

                <button
                  onClick={handleShareTelegram}
                  className="py-2.5 px-3 bg-white/90 dark:bg-slate-900/80 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-slate-700 dark:text-slate-300 border border-[var(--line)] dark:border-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-sky-500 stroke-[2.2]" />
                  <span>{tr("Ulashish", "Поделиться", "Share")}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Store Comparison & History */}
        <div className="lg:col-span-7 space-y-6">
          {/* 30-Day History */}
          <div className="bg-white dark:bg-[#0b1224] rounded-2xl p-6 sm:p-7 border border-[var(--line)] dark:border-amber-500/20 shadow-sm space-y-4">
            <h2 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-600 dark:text-amber-400 stroke-[2.2]" />
              <span>{tr("30 Kunlik Narx Dinamikasi (O'zbekiston bozori)", "Динамика цены за 30 дней", "Price over the last 30 days")}</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {auditData.priceHistory.map((item, idx) => (
                <div key={idx} className="bg-white/90 dark:bg-slate-900/80 p-3.5 rounded-2xl border border-[var(--line)] dark:border-amber-500/20 text-center shadow-xs">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">{item.date}</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block mt-1">
                    {formatPrice(item.price)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Live Store Audit Table */}
          <div className="bg-white dark:bg-[#0b1224] rounded-2xl p-6 sm:p-7 border border-[var(--line)] dark:border-amber-500/20 shadow-sm space-y-4">
            <h2 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Store className="w-4 h-4 text-amber-600 dark:text-amber-400 stroke-[2.2]" />
              <span>{tr("O'zbekiston do'konlari narxlari auditi", "Цены в магазинах Узбекистана", "Prices in Uzbek stores")}</span>
            </h2>

            <div className="overflow-x-auto rounded-2xl border border-[var(--line)] dark:border-amber-500/20">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f5edd7] dark:bg-slate-900 text-slate-800 dark:text-amber-200 font-bold border-b border-[var(--line)] dark:border-amber-500/20">
                  <tr>
                    <th className="p-3">{tr("Do'kon", "Магазин", "Store")}</th>
                    <th className="p-3">{tr("Audit Narxi", "Цена", "Price")}</th>
                    <th className="p-3">{tr("Kafolat", "Гарантия", "Warranty")}</th>
                    <th className="p-3">{tr("Yetkazish", "Наличие", "Availability")}</th>
                    <th className="p-3 text-right">{tr("Tekshirish", "Открыть", "Open")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100/80 dark:divide-slate-800/60 bg-white/70 dark:bg-slate-950/40">
                  {auditData.storeComparison.map((st, i) => (
                    <tr key={i} className={i === 0 ? "bg-amber-50/60 dark:bg-amber-950/20 font-medium" : "hover:bg-amber-50/30 dark:hover:bg-slate-900/40 transition-colors"}>
                      <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        {st.store}
                        {i === 0 && (
                          <span className="text-[10px] text-white font-semibold px-2 py-0.5 rounded-full shadow-xs bg-emerald-600">
                            {tr("Eng Arzon", "Дешевле всего", "Cheapest")}
                          </span>
                        )}
                        {st.verified && (
                          <span title={tr("Rasmiy kafolat", "Официальная гарантия", "Official warranty")}>
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[2.2]" />
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-bold text-slate-900 dark:text-amber-300">{formatPrice(st.price)}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">{st.warranty}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">{st.delivery}</td>
                      <td className="p-3 text-right">
                        <a
                          href={st.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3.5 py-1.5 text-white dark:text-white rounded-xl font-bold transition shadow-xs hover:opacity-90 cursor-pointer bg-slate-900 dark:bg-amber-500"
                        >
                          <span>{tr("Ko'rish", "Открыть", "View")}</span>
                          <ExternalLink className="w-3 h-3 stroke-[2.2]" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit Notes */}
          <div className="bg-white dark:bg-[#0b1224] rounded-2xl p-5 border border-[var(--line)] dark:border-amber-500/20 space-y-2 shadow-xs">
            <span className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider block">
              {tr("AI Auditor Xulosalari:", "Выводы проверки:", "What we found:")}
            </span>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              {auditData.marketNotes.map((note, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5 stroke-[2.2]" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Telegram Price Drop Radar Modal */}
      {showRadarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-[#0b1224] rounded-2xl p-6 sm:p-8 max-w-md w-full border border-[var(--line)] dark:border-amber-500/25 shadow-sm space-y-5 animate-scale-in text-slate-900 dark:text-white my-auto max-h-[92vh] max-h-[92dvh] overflow-y-auto relative">
            {/* Ambient Top Glow */}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-center text-amber-700 dark:text-amber-400">
                  <Bell className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">{tr("Telegram Narx Radari", "Уведомление о цене", "Price alert")}</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{tr("Narx tushganda avtomatik xabar oling", "Получите сообщение, когда цена снизится", "Get a message when the price drops")}</p>
                </div>
              </div>
              <button
                onClick={() => setShowRadarModal(false)}
                className="w-8 h-8 rounded-xl bg-white/80 dark:bg-slate-800/80 hover:bg-amber-100/60 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-[var(--line)] dark:border-slate-700/80 flex items-center justify-center transition cursor-pointer shadow-2xs"
              >
                <X className="w-4 h-4 stroke-[2.2]" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Kuzatuv ob'ekti:</label>
                <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-[var(--line)] dark:border-slate-800 font-semibold text-slate-800 dark:text-slate-200 line-clamp-1 shadow-2xs">
                  {auditData.productName}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">{tr("Telegram foydalanuvchi nomi:", "Имя пользователя Telegram:", "Telegram username:")}</label>
                <input
                  type="text"
                  value={radarTelegram}
                  onChange={(e) => setRadarTelegram(e.target.value)}
                  placeholder={tr("@foydalanuvchi_nomi", "@username", "@username")}
                  className="w-full px-3.5 py-2.5 bg-white/90 dark:bg-slate-900/90 rounded-xl border border-[var(--line)] dark:border-slate-800 font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500/50 shadow-2xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">{tr("Xabar berish sharti:", "Когда сообщить:", "Notify me when:")}</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: "5", label: tr("5% tushsa", "Снижение на 5%", "5% drop") },
                    { val: "10", label: tr("10% tushsa", "Снижение на 10%", "10% drop") },
                    { val: "any", label: tr("Har qanday tushishda", "При любом снижении", "Any drop") },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      onClick={() => setRadarThreshold(opt.val)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                        radarThreshold === opt.val
                          ? "text-white border-amber-500 font-bold shadow-xs bg-amber-500"
                          : "bg-white/90 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 border-[var(--line)] dark:border-slate-800 hover:border-[var(--line-strong)]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveRadar}
              className="w-full py-3.5 text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-sm cursor-pointer bg-amber-500 hover:bg-amber-400"
            >
              <Zap className="w-4 h-4 text-slate-950 fill-current stroke-[2.2]" />
              <span>Radarni Yoqish</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
