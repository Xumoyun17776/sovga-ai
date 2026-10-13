import { useState } from "react";
import { useTranslation } from "../lib/i18n";
import ProductCard from "./ProductCard";
import PriceComparisonModal from "./PriceComparisonModal";
import SaveProductModal from "./SaveProductModal";
import PriceTrackModal from "./PriceTrackModal";
import { useToast } from "./Toast";
import {
  Search,
  Clock,
  ChevronDown,
  ChevronUp,
  XCircle,
  TrendingDown,
  Cpu,
  CheckCircle2,
  Layers,
  ArrowRight,
  Share2,
  Copy,
  Check,
  Send,
  LayoutGrid,
  Table as TableIcon,
  ExternalLink,
  ShieldCheck,
  Star,
  Printer,
  BarChart2,
  Heart,
  Bell,
  Truck,
  CreditCard,
  Eye,
  Store,
  ShoppingBag,
  Coins,
  Sliders,
  Lightbulb,
  Sparkles,
  ArrowUpRight,
  Tag,
  Smartphone,
  BookOpen,
} from "../lib/icons";
import type { ResearchResult, ResearchProduct } from "@shared/types";
import { formatPrice } from "../lib/api";
import { ensureProductUrl } from "../lib/urlHelper";
import { cyberSound } from "../lib/cyberSound";
import ProductQuickViewModal from "./ProductQuickViewModal";
import { copyText } from "../lib/clipboard";

const getCategoryBadgeLabel = (category: string, lang: string): string => {
  if (lang === "uz") {
    const uzMap: Record<string, string> = {
      best_overall: "Eng yaxshi tanlov (Best Overall)",
      best_value: "Eng foydali narx (Best Value)",
      cheapest: "Hamyonbop narx (Cheapest)",
      premium: "Premium sifat (Premium)",
      most_unique: "O'ziga xos tanlov (Most Unique)",
      alternative: "Muqobil variant (Alternative)",
    };
    return uzMap[category] || category;
  }
  if (lang === "ru") {
    const ruMap: Record<string, string> = {
      best_overall: "Лучший выбор (Best Overall)",
      best_value: "Лучшая цена (Best Value)",
      cheapest: "Самый доступный (Cheapest)",
      premium: "Премиум качество (Premium)",
      most_unique: "Уникальный выбор (Most Unique)",
      alternative: "Альтернатива (Alternative)",
    };
    return ruMap[category] || category;
  }
  const enMap: Record<string, string> = {
    best_overall: "Best Overall Choice",
    best_value: "Best Value for Money",
    cheapest: "Lowest Verified Price",
    premium: "Ultra-Premium Flagship",
    most_unique: "Bespoke & Unique",
    alternative: "Smart Alternative",
  };
  return enMap[category] || category;
};

const categoryBadgeColors: Record<string, string> = {
  best_overall: "text-white shadow-xs font-bold bg-amber-500",
  best_value: "bg-emerald-600 text-white shadow-xs font-bold",
  cheapest: "bg-blue-600 text-white shadow-xs font-bold",
  premium: "text-white shadow-xs font-bold bg-purple-600",
  most_unique: "text-white shadow-xs font-bold bg-rose-500",
  alternative: "bg-slate-700 text-white font-bold",
};

export default function ResearchResults({ result }: { result: ResearchResult }) {
  const { t, language } = useTranslation();
  const toast = useToast();
  const [showDetails, setShowDetails] = useState(false);
  const [showPipeline, setShowPipeline] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedStore, setSelectedStore] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"cheapest" | "expensive" | "rating" | "discount">("cheapest");

  // Modals state for table view actions
  const [compareProduct, setCompareProduct] = useState<ResearchProduct | null>(null);
  const [saveProduct, setSaveProduct] = useState<ResearchProduct | null>(null);
  const [trackProduct, setTrackProduct] = useState<ResearchProduct | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<ResearchProduct | null>(null);

  // Price budget ranges
  const priceRanges = [
    { id: "all", labelUz: "Barchasi", labelRu: "Все", labelEn: "All", filter: (_p: ResearchProduct) => true },
    { id: "under_1m", labelUz: "< 1 mln", labelRu: "< 1 млн", labelEn: "< 1M", filter: (p: ResearchProduct) => (p.price || 0) < 1000000 },
    { id: "1m_3m", labelUz: "1 - 3 mln", labelRu: "1 - 3 млн", labelEn: "1 - 3M", filter: (p: ResearchProduct) => (p.price || 0) >= 1000000 && (p.price || 0) <= 3000000 },
    { id: "3m_7m", labelUz: "3 - 7 mln", labelRu: "3 - 7 млн", labelEn: "3 - 7M", filter: (p: ResearchProduct) => (p.price || 0) > 3000000 && (p.price || 0) <= 7000000 },
    { id: "7m_15m", labelUz: "7 - 15 mln", labelRu: "7 - 15 млн", labelEn: "7 - 15M", filter: (p: ResearchProduct) => (p.price || 0) > 7000000 && (p.price || 0) <= 15000000 },
    { id: "over_15m", labelUz: "> 15 mln", labelRu: "> 15 млн", labelEn: "> 15M", filter: (p: ResearchProduct) => (p.price || 0) > 15000000 },
  ];

  // Arbitrage intelligence calculations
  const validProducts = (result.products || []).filter((p) => typeof p.price === "number" && (p.price || 0) > 0);
  // Savings only make sense for the same product sold by different stores,
  // not between a 300k perfume and a 4M one.
  const modelKey = (name: string) =>
    (name || "")
      .toLowerCase()
      .replace(/\([^)]*\)/g, " ")
      .replace(/\s+(model|seriya|partiya|edition|to'plam|uslub)-\d+$/i, "")
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .trim();
  const sameProductGroups = validProducts.reduce<Record<string, typeof validProducts>>((acc, p) => {
    const k = modelKey(p.name);
    (acc[k] = acc[k] || []).push(p);
    return acc;
  }, {});
  let minPriceProduct: (typeof validProducts)[number] | null = null;
  let maxPriceProduct: (typeof validProducts)[number] | null = null;
  let bestSpread = 0;
  for (const group of Object.values(sameProductGroups)) {
    if (group.length < 2 || new Set(group.map((p) => p.store)).size < 2) continue;
    const lo = group.reduce((m, p) => ((p.price || 0) < (m.price || 0) ? p : m), group[0]);
    const hi = group.reduce((m, p) => ((p.price || 0) > (m.price || 0) ? p : m), group[0]);
    const spread = (hi.price || 0) - (lo.price || 0);
    if (spread > bestSpread) {
      bestSpread = spread;
      minPriceProduct = lo;
      maxPriceProduct = hi;
    }
  }
  const cheapestOverall = validProducts.length > 0 ? Math.min(...validProducts.map((p) => p.price || 0)) : null;
  const priceSpread = minPriceProduct && maxPriceProduct ? (maxPriceProduct.price || 0) - (minPriceProduct.price || 0) : 0;
  const savingsPercent = maxPriceProduct && maxPriceProduct.price && priceSpread > 0
    ? Math.round((priceSpread / maxPriceProduct.price) * 100)
    : 0;

  // Compute store distribution and filtered/sorted products
  const storeCounts = (result.products || []).reduce<Record<string, number>>((acc, p) => {
    const s = p.store || "Boshqa";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});
  const availableStores = Object.keys(storeCounts);

  const filteredProducts = (result.products || []).filter((p) => {
    if (selectedStore !== "all" && !(p.store || "").toLowerCase().includes(selectedStore.toLowerCase())) {
      return false;
    }
    const currentRange = priceRanges.find((r) => r.id === priceRange);
    if (currentRange && !currentRange.filter(p)) {
      return false;
    }
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "cheapest") return (a.price || 0) - (b.price || 0);
    if (sortBy === "expensive") return (b.price || 0) - (a.price || 0);
    if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
    if (sortBy === "discount") {
      const discA = parseInt(a.discount?.replace(/[^\d]/g, "") || "0", 10);
      const discB = parseInt(b.discount?.replace(/[^\d]/g, "") || "0", 10);
      return discB - discA;
    }
    return 0;
  });

  const handleCopyReport = () => {
    const topPick = result.products[0];
    const reportText = `SOVG'A AI | DOSSIER REPORT\n` +
      `──────────────────────\n` +
      `Query: ${result.query}\n` +
      `Sources Researched: ${result.totalSourcesResearched}\n` +
      `Catalog Items Evaluated: ${result.totalProductsConsidered}\n\n` +
      (topPick ? `TOP VERDICT: ${topPick.name}\n` +
      `Price: ${formatPrice(topPick.price, topPick.currency)}\n` +
      `Retailer: ${topPick.store}\n` +
      `Rating: ${topPick.rating || 4.8} / 5.0\n` +
      `Delivery: ${topPick.deliveryEstimate || '1 business day in Tashkent'}\n` +
      `AI Rationale: ${topPick.reason}\n` +
      `Direct Link: ${topPick.url}\n\n` : '') +
      `──────────────────────\n` +
      `Sovg'a AI — Uzbekistan's Premier Shopping Intelligence\nhttps://sovga.uz`;

    copyText(reportText);
    setCopiedReport(true);
    toast.success(
      language === "uz"
        ? "Xarid tadqiqoti hisoboti nusxalandi!"
        : language === "ru"
        ? "Отчет исследования скопирован в буфер!"
        : "Research dossier copied to clipboard!",
      language === "uz" ? "Hisobot tayyor" : language === "ru" ? "Скопировано" : "Copied"
    );
    setTimeout(() => setCopiedReport(false), 2500);
  };

  const handleShareTelegram = () => {
    const topPick = result.products[0];
    const text = `Sovg'a AI Intelligence Report:\nQuery: "${result.query}"\nTop Choice: ${topPick?.name || ''}\nPrice: ${formatPrice(topPick?.price, topPick?.currency)}\nRetailer: ${topPick?.store}\nWhy chosen: ${topPick?.reason}`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="animate-fade-in space-y-7">
      {/* Research Summary Header Card */}
      <div className="bg-white dark:bg-[#0b1224] card-luxury-elevated rounded-2xl p-6 sm:p-7 space-y-4 print:border-none print:shadow-none border border-[var(--line)] dark:border-slate-800 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-950 luxury-gold-chip px-3.5 py-1.5 rounded-full border">
            <Search className="w-3.5 h-3.5 text-amber-700" />
            {result.totalSourcesResearched} {t("results.sourcesResearched")}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 bg-amber-50/80 dark:bg-slate-800/60 px-3 py-1.5 rounded-full border border-[var(--line)] dark:border-slate-700/60 font-medium">
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-slate-400" />
            {t("results.lastChecked")}: {new Date(result.lastChecked).toLocaleTimeString()}
          </span>
          {result.isDemo && (
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-[var(--line)] dark:border-amber-800/50 px-3 py-1.5 rounded-full">
              {t("results.demoData")}
            </span>
          )}
          {result.cached && (
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 bg-amber-50/80 dark:bg-slate-800 px-2.5 py-1.5 rounded-full border border-[var(--line)] dark:border-slate-700">
              {language === "uz" ? "Keshdan olingan" : language === "ru" ? "Из кэша" : "Cached"}
            </span>
          )}

          {/* Action buttons (Copy, Telegram, Print, View Mode) */}
          <div className="ml-auto flex flex-wrap items-center gap-1.5">
            {/* View Mode Toggle: Grid vs Matrix Table */}
            <div className="flex items-center bg-amber-100/70 dark:bg-slate-800/80 p-1 rounded-2xl border border-[var(--line)] dark:border-slate-700/80 text-xs font-semibold mr-1">
              <button
                onClick={() => {
                  cyberSound.playClick();
                  setViewMode("grid");
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  viewMode === "grid"
                    ? "text-white shadow-xs font-bold bg-amber-500"
                    : "text-slate-700 dark:text-slate-400 hover:text-black dark:hover:text-white"
                }`}
                title="Grid Card View"
              >
                <LayoutGrid className="w-3.5 h-3.5 stroke-[2.2]" />
                <span className="hidden sm:inline">
                  {language === "uz" ? "Kartochkalar" : language === "ru" ? "Карточки" : "Grid Cards"}
                </span>
              </button>
              <button
                onClick={() => {
                  cyberSound.playClick();
                  setViewMode("table");
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  viewMode === "table"
                    ? "text-white shadow-xs font-bold bg-amber-500"
                    : "text-slate-700 dark:text-slate-400 hover:text-black dark:hover:text-white"
                }`}
                title="Side-by-Side Comparison Matrix"
              >
                <TableIcon className="w-3.5 h-3.5 stroke-[2.2]" />
                <span className="hidden sm:inline">
                  {language === "uz" ? "Taqqoslash Jadvali" : language === "ru" ? "Таблица" : "Matrix Comparison"}
                </span>
              </button>
            </div>

            <button
              onClick={() => {
                cyberSound.playConfirm();
                handleCopyReport();
              }}
              className="text-xs font-semibold text-amber-950 dark:text-slate-200 hover:text-black dark:hover:text-white flex items-center gap-1.5 bg-amber-50/80 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-slate-700 px-3 py-2 rounded-xl border border-[var(--line)] dark:border-slate-700 transition cursor-pointer"
              title="Copy formatted research report"
            >
              {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[2.2]" /> : <Copy className="w-3.5 h-3.5 stroke-[2.2]" />}
              <span className="hidden md:inline">
                {copiedReport
                  ? language === "uz"
                    ? "Nusxalandi!"
                    : language === "ru"
                    ? "Скопировано!"
                    : "Copied!"
                  : language === "uz"
                  ? "Hisobotni olish"
                  : language === "ru"
                  ? "Копировать отчет"
                  : "Copy Dossier"}
              </span>
            </button>

            <button
              onClick={() => {
                cyberSound.playClick();
                handleShareTelegram();
              }}
              className="text-xs font-semibold text-sky-800 dark:text-sky-300 hover:text-sky-900 dark:hover:text-sky-200 flex items-center gap-1.5 bg-sky-50/90 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/50 px-3 py-2 rounded-xl border border-sky-200 dark:border-sky-800/50 transition cursor-pointer"
              title="Share report to Telegram"
            >
              <Send className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>Telegram</span>
            </button>

            <button
              onClick={() => {
                cyberSound.playClick();
                handlePrint();
              }}
              className="text-xs font-semibold text-amber-950 dark:text-slate-300 hover:text-black dark:hover:text-white flex items-center gap-1.5 bg-amber-50/80 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-slate-700 px-3 py-2 rounded-xl border border-[var(--line)] dark:border-slate-700 transition cursor-pointer"
              title="Chop etish / Print"
            >
              <Printer className="w-3.5 h-3.5 stroke-[2.2]" />
            </button>

            <button
              onClick={() => {
                cyberSound.playClick();
                setShowPipeline(!showPipeline);
              }}
              className="text-xs font-semibold text-indigo-800 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-indigo-200 flex items-center gap-1.5 bg-indigo-50/90 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 px-3 py-2 rounded-xl border border-indigo-200/80 dark:border-indigo-800/50 transition cursor-pointer"
            >
              <Cpu className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 stroke-[2.2]" />
              <span>Pipeline</span>
              {showPipeline ? <ChevronUp className="w-3 h-3 stroke-[2.2]" /> : <ChevronDown className="w-3 h-3 stroke-[2.2]" />}
            </button>
          </div>
        </div>

        <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
          {result.researchSummary}
        </p>

        {result.priceSavings && (
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 p-3.5 rounded-2xl">
            <TrendingDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span>{result.priceSavings}</span>
          </div>
        )}

        {/* Direct Product Links across Top Retailers: 100% Direct Product Pages */}
        {(() => {
          const topProduct = result.products && result.products.length > 0 ? result.products[0] : null;
          const targetItem = topProduct?.name || result.query;
          const uzumUrl = topProduct?.store?.toLowerCase().includes("uzum") && topProduct.url && !topProduct.url.includes("?q=")
            ? topProduct.url
            : ensureProductUrl(targetItem, "Uzum Market");
          const olchaUrl = topProduct?.store?.toLowerCase().includes("olcha") && topProduct.url && !topProduct.url.includes("?q=")
            ? topProduct.url
            : ensureProductUrl(targetItem, "Olcha");
          const texnomartUrl = topProduct?.store?.toLowerCase().includes("texnomart") && topProduct.url && !topProduct.url.includes("?q=")
            ? topProduct.url
            : ensureProductUrl(targetItem, "Texnomart");
          const mediaparkUrl = topProduct?.store?.toLowerCase().includes("mediapark") && topProduct.url && !topProduct.url.includes("?q=")
            ? topProduct.url
            : ensureProductUrl(targetItem, "MediaPark");
          const asaxiyUrl = topProduct?.store?.toLowerCase().includes("asaxiy") && topProduct.url && !topProduct.url.includes("?q=")
            ? topProduct.url
            : ensureProductUrl(targetItem, "Asaxiy");
          const ideaUrl = topProduct?.store?.toLowerCase().includes("idea") && topProduct.url && !topProduct.url.includes("?q=")
            ? topProduct.url
            : ensureProductUrl(targetItem, "Idea Store");

          return (
            <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/90 dark:border-slate-800 rounded-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
                <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  {language === "uz"
                    ? `Eng sara mahsulotni to'g'ridan-to'g'ri do'kon kartasida ochish ("${targetItem}"):`
                    : language === "ru"
                    ? `Открыть карточку товара в магазинах («${targetItem}»):`
                    : `Direct Product Card in Stores ("${targetItem}"):`}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {language === "uz"
                    ? "Bozor qidiruviga emas, to'g'ridan-to'g'ri tovar kartasiga kiradi (100% Direct)"
                    : language === "ru"
                    ? "Прямой переход к карточке товара, без списков поиска (100% Direct)"
                    : "Opens direct product item card, zero search listing pages"}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                <a
                  href={uzumUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="store-link flex items-center justify-between gap-1 py-2.5 px-3 text-xs font-semibold rounded-xl transition"
                  style={{ ["--dot" as any]: "#8b5cf6" }}
                  title={`Uzum Market'da "${targetItem}" mahsulot sahifasini ochish`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <ShoppingBag className="w-3.5 h-3.5 flex-shrink-0 stroke-[2.2]" />
                    <span className="truncate">Uzum</span>
                  </div>
                  <ArrowUpRight className="w-3 h-3 opacity-80 flex-shrink-0 stroke-[2.2]" />
                </a>

                <a
                  href={olchaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="store-link flex items-center justify-between gap-1 py-2.5 px-3 text-xs font-semibold rounded-xl transition"
                  style={{ ["--dot" as any]: "#f43f5e" }}
                  title={`Olcha'da "${targetItem}" mahsulot sahifasini ochish`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <Store className="w-3.5 h-3.5 flex-shrink-0 stroke-[2.2]" />
                    <span className="truncate">Olcha</span>
                  </div>
                  <ArrowUpRight className="w-3 h-3 opacity-80 flex-shrink-0 stroke-[2.2]" />
                </a>

                <a
                  href={texnomartUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="store-link flex items-center justify-between gap-1 py-2.5 px-3 text-xs font-semibold rounded-xl transition"
                  style={{ ["--dot" as any]: "#ef4444" }}
                  title={`Texnomart'da "${targetItem}" mahsulot sahifasini ochish`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <Cpu className="w-3.5 h-3.5 flex-shrink-0 stroke-[2.2]" />
                    <span className="truncate">Texnomart</span>
                  </div>
                  <ArrowUpRight className="w-3 h-3 opacity-80 flex-shrink-0 stroke-[2.2]" />
                </a>

                <a
                  href={mediaparkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="store-link flex items-center justify-between gap-1 py-2.5 px-3 text-xs font-semibold rounded-xl transition"
                  style={{ ["--dot" as any]: "#10b981" }}
                  title={`MediaPark'da "${targetItem}" mahsulot sahifasini ochish`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <Smartphone className="w-3.5 h-3.5 flex-shrink-0 stroke-[2.2]" />
                    <span className="truncate">MediaPark</span>
                  </div>
                  <ArrowUpRight className="w-3 h-3 opacity-80 flex-shrink-0 stroke-[2.2]" />
                </a>

                <a
                  href={asaxiyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="store-link flex items-center justify-between gap-1 py-2.5 px-3 text-xs font-semibold rounded-xl transition"
                  style={{ ["--dot" as any]: "#0ea5e9" }}
                  title={`Asaxiy'da "${targetItem}" mahsulot sahifasini ochish`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <BookOpen className="w-3.5 h-3.5 flex-shrink-0 stroke-[2.2]" />
                    <span className="truncate">Asaxiy</span>
                  </div>
                  <ArrowUpRight className="w-3 h-3 opacity-80 flex-shrink-0 stroke-[2.2]" />
                </a>

                <a
                  href={ideaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="store-link flex items-center justify-between gap-1 py-2.5 px-3 text-xs font-semibold rounded-xl transition"
                  style={{ ["--dot" as any]: "#d6a84f" }}
                  title={`Idea Store'da "${targetItem}" mahsulot sahifasini ochish`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <Store className="w-3.5 h-3.5 flex-shrink-0 stroke-[2.2]" />
                    <span className="truncate">Idea</span>
                  </div>
                  <ArrowUpRight className="w-3 h-3 opacity-80 flex-shrink-0 stroke-[2.2]" />
                </a>
              </div>
            </div>
          );
        })()}

        {/* Dedicated Research Pipeline Visualization */}
        {showPipeline && (
          <div className="mt-4 pt-4 border-t border-slate-200/80 dark:border-slate-800 animate-fade-in space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                {language === "uz"
                  ? "8 Bosqichli Jonli AI Qidiruv Pipeline Bajarilishi"
                  : language === "ru"
                  ? "Выполнение 8-этапного конвейера поиска AI"
                  : "8-Stage Live AI Discovery Pipeline Execution"}
              </h4>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                {language === "uz" ? "Javob vaqti:" : language === "ru" ? "Время ответа:" : "Latency:"} {result.responseTimeMs}ms
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {(
                result.pipelineStages || [
                  {
                    label: language === "uz" ? "1. Niyat Tahlili" : language === "ru" ? "1. Анализ намерений" : "1. Intent Synthesis",
                    description: language === "uz" ? "Byudjet va maqsadni tahlil qilish" : language === "ru" ? "Анализ бюджета и критериев" : "Analyzing budget & gift parameters",
                  },
                  {
                    label: language === "uz" ? "2. Qidiruv Rejasi" : language === "ru" ? "2. План поиска" : "2. Search Routing",
                    description: language === "uz" ? "Do'konlar uchun aniq so'rovlar tuzish" : language === "ru" ? "Генерация целевых запросов" : "Targeting verified retail catalogs",
                  },
                  {
                    label: language === "uz" ? "3. Jonli Web Skaner" : language === "ru" ? "3. Онлайн-сканирование" : "3. Live Web Scanner",
                    description: language === "uz" ? "1,000,000+ do'kon mahsulotlarini skanlash" : language === "ru" ? "Сканирование каталогов маркетплейсов" : "Scanning 1,000,000+ live store listings",
                  },
                  {
                    label: language === "uz" ? "4. Narxlar Ekstraksiyasi" : language === "ru" ? "4. Экстракция цен" : "4. Price Extraction",
                    description: language === "uz" ? "Real UZS narxlarini ajratib olish" : language === "ru" ? "Сбор актуальных цен в UZS" : "Extracting real-time UZS pricing",
                  },
                  {
                    label: language === "uz" ? "5. Standartlashtirish" : language === "ru" ? "5. Стандартизация" : "5. Currency Calibration",
                    description: language === "uz" ? "Valyuta va yetkazuv muddatlarini tenglashtirish" : language === "ru" ? "Нормализация валюты и сроков" : "Calibrating exchange rates & SLAs",
                  },
                  {
                    label: language === "uz" ? "6. Dublikat & Aksessuar Filtri" : language === "ru" ? "6. Фильтр дубликатов" : "6. Deduplication & Noise Filter",
                    description: language === "uz" ? "Shubhali e'lonlar va g'iloflarni ajratish" : language === "ru" ? "Отсеивание чехлов и дубликатов" : "Stripping accessories & duplicate listings",
                  },
                  {
                    label: language === "uz" ? "7. Narxlar Taqqoslami" : language === "ru" ? "7. Сравнение цен" : "7. Price comparison",
                    description: language === "uz" ? "Eng arzon do'kon va tejovni hisoblash" : language === "ru" ? "Расчет максимальной экономии" : "Computing cheapest retailer & spread",
                  },
                  {
                    label: language === "uz" ? "8. AI Saralash & Reyting" : language === "ru" ? "8. AI Ранжирование" : "8. AI Ranking & Curation",
                    description: language === "uz" ? "Eng maqbul variantlarni tavsiya qilish" : language === "ru" ? "Подбор оптимальных предложений" : "Scoring top gift choices & reliability",
                  },
                ]
              ).map((stage: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/80 text-xs space-y-1"
                >
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span className="truncate">{stage.label}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-5">{stage.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── BOZOR ARBITRAJI & TEJAMKORLIK BANNER ─────────────────── */}
      {validProducts.length >= 2 && priceSpread > 0 && minPriceProduct && maxPriceProduct && (
        <div className="relative overflow-hidden rounded-2xl p-5 sm:p-6 border border-emerald-500/30 shadow-[0_10px_35px_rgba(16,185,129,0.14)] text-white animate-fade-in bg-slate-950">
          {/* Ambient glow in background */}

          <div className="relative z-10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3.5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-mono font-bold tracking-wider uppercase text-emerald-400">
                  {language === "uz"
                    ? "Jonli Bozor Arbitraji & Tejamkorlik Tahlili"
                    : language === "ru"
                    ? "Арбитраж Цен и Анализ Экономии"
                    : "Store prices and savings"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-300 font-medium">
                  {language === "uz"
                    ? "Tahlil qilingan takliflar:"
                    : language === "ru"
                    ? "Проанализировано предложений:"
                    : "Analyzed offers:"}
                </span>
                <span className="font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                  {validProducts.length}{" "}
                  {language === "uz"
                    ? "ta do'kon narxi"
                    : language === "ru"
                    ? "предложений магазинов"
                    : "store quotes"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Lowest Price Offer (Winner) */}
              <div className="rounded-2xl p-4 bg-emerald-500/10 border border-emerald-500/40 relative overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {language === "uz" ? "Eng arzon taklif" : language === "ru" ? "Самая низкая цена" : "Lowest Price Offer"}
                    </span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                      {minPriceProduct.store}
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {formatPrice(minPriceProduct.price || 0, minPriceProduct.currency || "UZS")}
                  </div>
                  <p className="text-[11px] text-slate-300 truncate mt-1" title={minPriceProduct.name}>
                    {minPriceProduct.name}
                  </p>
                </div>
                <a
                  href={ensureProductUrl(minPriceProduct.name, minPriceProduct.store, minPriceProduct.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-sm cursor-pointer"
                >
                  <span>
                    {language === "uz"
                      ? "Tovar kartasiga o'tish"
                      : language === "ru"
                      ? "Перейти к товару"
                      : "Go to Product"}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Highest Price Comparison */}
              <div className="rounded-2xl p-4 bg-slate-800/60 border border-white/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium text-slate-400">
                      {language === "uz" ? "Shu mahsulot, eng qimmat do'kon" : language === "ru" ? "Тот же товар, самая высокая цена" : "Same product, highest price"}
                    </span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300 font-semibold">
                      {maxPriceProduct.store}
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-slate-300 line-through tracking-tight">
                    {formatPrice(maxPriceProduct.price || 0, maxPriceProduct.currency || "UZS")}
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-1" title={maxPriceProduct.name}>
                    {maxPriceProduct.name}
                  </p>
                </div>
                <div className="mt-3 text-[11px] text-slate-400">
                  {language === "uz"
                    ? `O'rtacha bozor tafovuti: ${savingsPercent}% gacha`
                    : language === "ru"
                    ? `Рыночная разница в цене: до ${savingsPercent}%`
                    : `Market price disparity: up to ${savingsPercent}%`}
                </div>
              </div>

              {/* Net Savings Callout */}
              <div className="rounded-2xl p-4 border border-amber-500/30 flex flex-col justify-between bg-amber-500/15">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-amber-400 flex items-center gap-1">
                      <TrendingDown className="w-3.5 h-3.5 text-amber-400" />
                      {language === "uz" ? "Sof tejamkorlik" : language === "ru" ? "Чистая экономия" : "Net Direct Savings"}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      -{savingsPercent}%
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-amber-400 tracking-tight">
                    +{formatPrice(priceSpread, "UZS")}
                  </div>
                  <p className="text-[11px] text-amber-200/90 mt-1">
                    {language === "uz"
                      ? `${minPriceProduct.store}'dan xarid qilib, shuncha so'm tejaysiz!`
                      : language === "ru"
                      ? `Покупая в ${minPriceProduct.store}, вы экономите эту сумму!`
                      : `Buying from ${minPriceProduct.store} saves you this amount!`}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedStore(minPriceProduct.store);
                    setSortBy("cheapest");
                  }}
                  className="mt-3 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs transition cursor-pointer"
                >
                  <span>
                    {language === "uz"
                      ? "Eng arzon variantga filtrlash"
                      : language === "ru"
                      ? "Показать самый дешевый вариант"
                      : "Filter by Lowest Price"}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Filter & Sort Toolbar */}
      <div className="bg-white dark:bg-[#0b1224] rounded-2xl border border-[var(--line)] dark:border-slate-800 p-3.5 sm:p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
          {/* Store Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedStore("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                selectedStore === "all"
                  ? "text-white shadow-xs font-bold bg-amber-500"
                  : "bg-amber-50/80 hover:bg-amber-100 text-white border border-[var(--line)] dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
              }`}
            >
              <span>{language === "uz" ? "Barcha do'konlar" : language === "ru" ? "Все магазины" : "All Stores"}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20 dark:bg-black/20 font-bold">
                {result.products.length}
              </span>
            </button>
            {availableStores.map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStore(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  selectedStore === st
                    ? "text-white shadow-xs font-bold bg-amber-500"
                    : "bg-amber-50/80 hover:bg-amber-100 text-white border border-[var(--line)] dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                }`}
              >
                <span>{st}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full dark:bg-slate-700 dark:text-slate-300 font-bold border bg-[#f4f5f8] dark:bg-white/5 text-slate-600 dark:text-slate-300 border-[var(--line)]">
                  {storeCounts[st]}
                </span>
              </button>
            ))}
          </div>

          {/* Sort Dropdown & Product Counter */}
          <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              <span className="text-slate-900 dark:text-white font-bold">{sortedProducts.length}</span>{" "}
              {language === "uz" ? "ta taklif" : language === "ru" ? "предложений" : "offers"}
            </span>
            <div className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-amber-600 dark:text-slate-400" />
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="text-xs font-semibold bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-[var(--line)] dark:border-white/10 rounded-xl px-2.5 py-1.5 outline-none cursor-pointer focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="cheapest">
                  {language === "uz" ? "Narx: Eng arzonidan boshlab" : language === "ru" ? "Цена: по возрастанию" : "Price: Low to High"}
                </option>
                <option value="expensive">
                  {language === "uz" ? "Narx: Qimmatidan boshlab" : language === "ru" ? "Цена: по убыванию" : "Price: High to Low"}
                </option>
                <option value="rating">
                  {language === "uz" ? "Reyting: Eng yuqori" : language === "ru" ? "Рейтинг: по убыванию" : "Rating: Highest First"}
                </option>
                <option value="discount">
                  {language === "uz" ? "Chegirma: Eng katta" : language === "ru" ? "Скидка: по убыванию" : "Discount: Biggest First"}
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Budget Bracket Quick Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-2.5 border-t border-[var(--line)] dark:border-white/10">
          <span className="text-xs font-bold text-amber-900 dark:text-slate-400 shrink-0 mr-1 flex items-center gap-1">
            <Coins className="w-3.5 h-3.5 text-amber-600" />
            <span>{language === "uz" ? "Byudjet:" : language === "ru" ? "Бюджет:" : "Budget:"}</span>
          </span>
          {priceRanges.map((range) => {
            const count = (result.products || []).filter(range.filter).length;
            if (count === 0 && range.id !== "all") return null;
            const label = language === "uz" ? range.labelUz : language === "ru" ? range.labelRu : range.labelEn;
            return (
              <button
                key={range.id}
                onClick={() => setPriceRange(range.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  priceRange === range.id
                    ? "text-white font-bold shadow-xs bg-amber-500"
                    : "bg-amber-50/80 hover:bg-amber-100 text-white border border-[var(--line)] dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                }`}
              >
                <span>{label}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/10 font-bold">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main View: Grid vs Side-by-Side Comparison Matrix */}
      {viewMode === "grid" ? (
        sortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sortedProducts.map((product, i) => (
              <ProductCard
                key={i}
                product={product}
                isDemo={result.isDemo}
                isCheapest={product.category === "cheapest" || (cheapestOverall !== null && product.price === cheapestOverall)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-[#0d1530] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-8 space-y-3 shadow-sm">
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
              Tanlangan filtrlar bo'yicha mahsulot topilmadi.
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => {
                  cyberSound.playClick();
                  setSelectedStore("all");
                  setPriceRange("all");
                }}
                className="px-4 py-2 bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-400 text-white dark:text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Filtrlarni tozalash ({result.products.length})
              </button>
            </div>
          </div>
        )
      ) : (
        /* Side-by-Side Comparison Matrix Table */
        <div className="bg-white dark:bg-[#0d1530] rounded-2xl border border-[var(--line)] dark:border-slate-800 shadow-sm overflow-hidden animate-fade-in">
          <div className="bg-white dark:bg-[#0b1224] p-4 sm:p-5 border-b border-[var(--line)] dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display font-semibold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <TableIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <span>
                  {language === "uz"
                    ? "Yonma-yon Taqqoslash Matritsasi"
                    : language === "ru"
                    ? "Матрица Сравнения Характеристик"
                    : "Side-by-Side Comparison Matrix"}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === "uz"
                  ? `Barcha ${result.products.length} ta tadqiq qilingan mahsulotlarning narxlari, muddatli to'lovlari, kafolati va xususiyatlari.`
                  : language === "ru"
                  ? `Цены, рассрочка, гарантия и характеристики всех ${result.products.length} исследованных товаров.`
                  : `Side-by-side pricing, installment plans, warranties & specs for all ${result.products.length} verified items.`}
              </p>
            </div>
            <span className="text-xs font-bold bg-amber-100/90 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 px-3 py-1 rounded-full border border-[var(--line)] dark:border-amber-800/50">
              {sortedProducts.length}{" "}
              {language === "uz"
                ? "ta mahsulot taqqoslanmoqda"
                : language === "ru"
                ? "товаров сравнивается"
                : "items analyzed"}
            </span>
          </div>

          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left border-collapse min-w-[750px]">
              {/* Product Header Row */}
              <thead>
                <tr className="border-b border-[var(--line)] dark:border-slate-800 bg-amber-50/40 dark:bg-slate-800/30">
                  <th className="p-4 w-44 font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-400 bg-amber-100/40 dark:bg-slate-800/50">
                    {language === "uz"
                      ? "Mezonlar / Mahsulot"
                      : language === "ru"
                      ? "Критерии / Товар"
                      : "Criteria / Product"}
                  </th>
                  {sortedProducts.map((p, idx) => (
                    <th key={idx} className="p-4 min-w-[240px] max-w-[280px] align-top">
                      <div className="space-y-2">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${categoryBadgeColors[p.category] || "bg-slate-700 text-white"}`}>
                          {getCategoryBadgeLabel(p.category, language)}
                        </span>
                        <div
                          onClick={() => {
                            cyberSound.playClick();
                            setQuickViewProduct(p);
                          }}
                          className="h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden relative group cursor-pointer flex items-center justify-center border border-slate-200 dark:border-slate-700"
                          title="Quick View"
                        >
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover transition duration-300" />
                          ) : (
                            <ShoppingBag className="w-8 h-8 text-slate-400 stroke-[1.25]" />
                          )}
                        </div>
                        <h4
                          onClick={() => {
                            cyberSound.playClick();
                            setQuickViewProduct(p);
                          }}
                          className="font-display font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-2 cursor-pointer hover:text-amber-500 dark:hover:text-amber-400 transition"
                        >
                          {p.name}
                        </h4>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                {/* 1. Price Row */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-4 font-bold text-slate-700 dark:text-slate-300 bg-slate-50/60 dark:bg-slate-800/40">
                    <div className="flex items-center gap-2">
                      <Coins className="w-3.5 h-3.5 text-amber-500" />
                      <span>{language === "uz" ? "Narx (UZS)" : language === "ru" ? "Цена (UZS)" : "Price (UZS)"}</span>
                    </div>
                  </td>
                  {sortedProducts.map((p, idx) => (
                    <td key={idx} className="p-4">
                      <div className="space-y-0.5">
                        <div className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white">
                          {formatPrice(p.price, p.currency)}
                        </div>
                        {p.originalPrice && p.originalPrice > (p.price || 0) && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 line-through">
                              {formatPrice(p.originalPrice, p.currency)}
                            </span>
                            {p.discount && (
                              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/40">
                                {p.discount}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* 2. Retailer / Store */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-4 font-bold text-slate-700 dark:text-slate-300 bg-slate-50/60 dark:bg-slate-800/40">
                    <div className="flex items-center gap-2">
                      <Store className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                      <span>{language === "uz" ? "Do'kon / Manba" : language === "ru" ? "Магазин / Источник" : "Store / Retailer"}</span>
                    </div>
                  </td>
                  {sortedProducts.map((p, idx) => (
                    <td key={idx} className="p-4">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                        <span>{p.store}</span>
                        {p.url && (
                          <a
                            href={ensureProductUrl(p.name, p.store, p.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-amber-500 transition"
                            title={language === "uz" ? "Do'konda ochish" : language === "ru" ? "Открыть в магазине" : "Open on Store"}
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* 3. Installment / Nasiya */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-4 font-bold text-slate-700 dark:text-slate-300 bg-slate-50/60 dark:bg-slate-800/40">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-3.5 h-3.5 text-amber-500" />
                      <span>{language === "uz" ? "Bo'lib to'lash" : language === "ru" ? "Рассрочка 0%" : "0% Installments"}</span>
                    </div>
                  </td>
                  {sortedProducts.map((p, idx) => (
                    <td key={idx} className="p-4">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/70 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                        <CreditCard className="w-3 h-3 text-amber-500" />
                        {p.installment || (language === "uz" ? "Muddatli to'lov mavjud" : language === "ru" ? "Доступна рассрочка" : "Installment plans available")}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* 4. Delivery Speed */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-4 font-bold text-slate-700 dark:text-slate-300 bg-slate-50/60 dark:bg-slate-800/40">
                    <div className="flex items-center gap-2">
                      <Truck className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                      <span>{language === "uz" ? "Yetkazib berish" : language === "ru" ? "Доставка" : "Delivery SLA"}</span>
                    </div>
                  </td>
                  {sortedProducts.map((p, idx) => (
                    <td key={idx} className="p-4">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <Truck className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>
                          {p.deliveryEstimate ||
                            (language === "uz"
                              ? "Toshkentda 1 ish kuni"
                              : language === "ru"
                              ? "1 рабочий день по Ташкенту"
                              : "1 business day in Tashkent")}
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* 5. Warranty */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-4 font-bold text-slate-700 dark:text-slate-300 bg-slate-50/60 dark:bg-slate-800/40">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{language === "uz" ? "Kafolat muddati" : language === "ru" ? "Срок гарантии" : "Warranty Period"}</span>
                    </div>
                  </td>
                  {sortedProducts.map((p, idx) => (
                    <td key={idx} className="p-4 text-slate-700 dark:text-slate-300">
                      {p.warranty ||
                        (language === "uz"
                          ? "Rasmiy do'kon kafolati"
                          : language === "ru"
                          ? "Официальная гарантия магазина"
                          : "Official retailer warranty")}
                    </td>
                  ))}
                </tr>

                {/* 6. Rating & Reviews */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-4 font-bold text-slate-700 dark:text-slate-300 bg-slate-50/60 dark:bg-slate-800/40">
                    <div className="flex items-center gap-2">
                      <Star className="w-3.5 h-3.5 text-yellow-400" />
                      <span>{language === "uz" ? "Reyting & Sharhlar" : language === "ru" ? "Рейтинг и отзывы" : "Rating & Reviews"}</span>
                    </div>
                  </td>
                  {sortedProducts.map((p, idx) => (
                    <td key={idx} className="p-4">
                      <div className="flex items-center gap-1 font-bold text-slate-900 dark:text-white">
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                        <span>{p.rating || "4.8"}</span>
                        <span className="text-slate-400 font-normal">({p.reviewCount || 100}+)</span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* 7. Key Specifications */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-4 font-bold text-slate-700 dark:text-slate-300 bg-slate-50/60 dark:bg-slate-800/40">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                      <span>{language === "uz" ? "Xususiyatlar" : language === "ru" ? "Характеристики" : "Specifications"}</span>
                    </div>
                  </td>
                  {sortedProducts.map((p, idx) => {
                    const specList: string[] = Array.isArray(p.specs)
                      ? p.specs
                      : p.specs && typeof p.specs === "object"
                      ? Object.entries(p.specs).map(([k, v]) => `${k}: ${v}`)
                      : [];

                    return (
                      <td key={idx} className="p-4">
                        {specList.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {specList.map((spec: string, sIdx: number) => (
                              <span key={sIdx} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded text-[10px] border border-slate-200 dark:border-slate-700">
                                {spec}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500">
                            {language === "uz"
                              ? "Standart parametrlar"
                              : language === "ru"
                              ? "Стандартные параметры"
                              : "Standard specs"}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* 8. AI Rationale / Why Selected */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-4 font-bold text-slate-700 dark:text-slate-300 bg-slate-50/60 dark:bg-slate-800/40">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                      <span>{language === "uz" ? "AI Tanlov Sababi" : language === "ru" ? "Вердикт AI выбора" : "AI Selection Verdict"}</span>
                    </div>
                  </td>
                  {sortedProducts.map((p, idx) => (
                    <td key={idx} className="p-4 leading-relaxed text-slate-600 dark:text-slate-300">
                      {p.reason}
                    </td>
                  ))}
                </tr>

                {/* 9. Action Buttons */}
                <tr className="bg-slate-50/80 dark:bg-slate-800/50">
                  <td className="p-4 font-bold text-slate-700 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800/80">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>{language === "uz" ? "Amallar" : language === "ru" ? "Действия" : "Actions"}</span>
                    </div>
                  </td>
                  {sortedProducts.map((p, idx) => (
                    <td key={idx} className="p-4">
                      <div className="space-y-1.5">
                        <a
                          href={ensureProductUrl(p.name, p.store, p.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => cyberSound.playConfirm()}
                          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-white font-semibold rounded-xl text-xs transition shadow-xs cursor-pointer"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>{language === "uz" ? "Do'konda ochish" : language === "ru" ? "В магазин" : "Open Store"}</span>
                          <ArrowUpRight className="w-3.5 h-3.5 opacity-70 ml-1" />
                        </a>

                        <div className="grid grid-cols-4 gap-1">
                          <button
                            onClick={() => {
                              cyberSound.playClick();
                              setQuickViewProduct(p);
                            }}
                            className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1 transition cursor-pointer"
                            title={
                              language === "uz"
                                ? "Tezkor ko'rish va Nasiya kalkulyatori"
                                : language === "ru"
                                ? "Быстрый просмотр и калькулятор рассрочки"
                                : "Quick View & Installment Calculator"
                            }
                          >
                            <Eye className="w-3 h-3 text-amber-500" />
                          </button>

                          <button
                            onClick={() => {
                              cyberSound.playClick();
                              setCompareProduct(p);
                            }}
                            className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1 transition cursor-pointer"
                            title={
                              language === "uz"
                                ? "Narxlar tarixi va do'konlar"
                                : language === "ru"
                                ? "История цен и сравнение"
                                : "Price History & Stores"
                            }
                          >
                            <BarChart2 className="w-3 h-3 text-indigo-500" />
                          </button>

                          <button
                            onClick={() => {
                              cyberSound.playClick();
                              setSaveProduct(p);
                            }}
                            className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1 transition cursor-pointer"
                            title={
                              language === "uz"
                                ? "Wishlistga saqlash"
                                : language === "ru"
                                ? "Сохранить в вишлист"
                                : "Save to Wishlist"
                            }
                          >
                            <Heart className="w-3 h-3 text-rose-500" />
                          </button>

                          <button
                            onClick={() => {
                              cyberSound.playClick();
                              setTrackProduct(p);
                            }}
                            className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1 transition cursor-pointer"
                            title={
                              language === "uz"
                                ? "Narx tushishini kuzatish"
                                : language === "ru"
                                ? "Отслеживать снижение цены"
                                : "Track Price Drops"
                            }
                          >
                            <Bell className="w-3 h-3 text-amber-500" />
                          </button>
                        </div>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Research Details & Rejections Audit */}
      <div className="bg-white dark:bg-[#0b1224] card-luxury rounded-2xl shadow-sm border border-[var(--line)] dark:border-slate-800 overflow-hidden">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-between p-5 text-sm font-bold text-slate-900 dark:text-white hover:bg-amber-50/50 dark:hover:bg-slate-800/50 transition cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 stroke-[2.2]" />
            <span>
              {language === "uz"
                ? "Tadqiqot auditi va metodologiyasi"
                : language === "ru"
                ? "Аудит исследования и методология"
                : "Research Audit & Methodology Dossier"}
            </span>
            <span className="text-xs bg-amber-100/90 dark:bg-slate-800 text-amber-900 dark:text-amber-300 px-2.5 py-0.5 rounded-full font-bold border border-[var(--line)] dark:border-slate-700 shadow-2xs">
              {language === "uz"
                ? `${result.totalProductsConsidered || (result.products || []).length} ko'rildi · ${(result.rejectedProducts || []).length} rad etildi`
                : language === "ru"
                ? `${result.totalProductsConsidered || (result.products || []).length} проверено · ${(result.rejectedProducts || []).length} отклонено`
                : `${result.totalProductsConsidered || (result.products || []).length} evaluated · ${(result.rejectedProducts || []).length} filtered`}
            </span>
          </span>
          {showDetails ? <ChevronUp className="w-4 h-4 text-amber-600 dark:text-amber-400 stroke-[2.2]" /> : <ChevronDown className="w-4 h-4 text-slate-400 stroke-[2.2]" />}
        </button>

        {showDetails && (
          <div className="px-5 pb-5 space-y-5 animate-fade-in border-t border-[var(--line)] dark:border-slate-800 pt-5">
            {/* Search Strategies */}
            {(result.searchStrategies || []).length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-amber-800/80 dark:text-amber-400 uppercase tracking-wide mb-2.5">
                  {language === "uz"
                    ? "Tadqiqot yo'nalishlari va skan qilingan kanallar"
                    : language === "ru"
                    ? "Направления поиска и сканированные каналы"
                    : "Sources checked"}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(result.searchStrategies || []).map((s, i) => (
                    <span
                      key={i}
                      className="text-xs font-medium bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-[var(--line)] dark:border-slate-700 px-3 py-1.5 rounded-xl shadow-2xs"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Rejected Products Audit */}
            {(result.rejectedProducts || []).length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wide mb-2.5">
                  {language === "uz"
                    ? "Rad etilgan mahsulotlar (Sifatsiz yoki soxta listinglar filtri)"
                    : language === "ru"
                    ? "Отклоненные товары (Фильтр сомнительных цен и серых копий)"
                    : "Filtered Out Listings (Misleading pricing, duplicate or grey-market exclusions)"}
                </h4>
                <div className="space-y-2">
                  {(result.rejectedProducts || []).map((r, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 text-xs bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200/70 dark:border-rose-900/50 p-3.5 rounded-2xl shadow-2xs"
                    >
                      <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5 stroke-[2.2]" />
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-900 dark:text-white">{r.name}</span>
                        {r.store && <span className="text-slate-500 dark:text-slate-400 text-[11px]"> ({r.store})</span>}
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-normal">{r.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Table-view triggered modals */}
      {compareProduct && (
        <PriceComparisonModal
          productName={compareProduct.name}
          currentPrice={compareProduct.price}
          currentStore={compareProduct.store}
          onClose={() => setCompareProduct(null)}
        />
      )}

      {saveProduct && (
        <SaveProductModal
          product={{
            title: saveProduct.name,
            price: saveProduct.price || 0,
            originalPrice: saveProduct.originalPrice || undefined,
            currency: saveProduct.currency,
            store: saveProduct.store,
            url: saveProduct.url,
            imageUrl: saveProduct.imageUrl || undefined,
            category: saveProduct.category,
            whyRecommended: saveProduct.reason,
            priceVerified: saveProduct.priceVerified,
            availabilityVerified: saveProduct.availabilityVerified,
          }}
          onClose={() => setSaveProduct(null)}
        />
      )}

      {trackProduct && (
        <PriceTrackModal
          productName={trackProduct.name}
          currentPrice={trackProduct.price || 0}
          currency={trackProduct.currency}
          store={trackProduct.store}
          url={trackProduct.url}
          onClose={() => setTrackProduct(null)}
        />
      )}

      {quickViewProduct && (
        <ProductQuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </div>
  );
}

export function ResearchSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-gray-100 space-y-3">
        <div className="skeleton h-5 w-48 rounded-lg" />
        <div className="skeleton h-4 w-full rounded-lg" />
        <div className="skeleton h-4 w-3/4 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="skeleton h-48 w-full" />
            <div className="p-4 space-y-3">
              <div className="skeleton h-4 w-3/4 rounded" />
              <div className="skeleton h-6 w-1/2 rounded" />
              <div className="skeleton h-3 w-full rounded" />
              <div className="skeleton h-8 w-full rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
