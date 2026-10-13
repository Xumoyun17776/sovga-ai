import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useTranslation, trData } from "../lib/i18n";
import { getProductFallbackImage } from "../lib/imageHelper";
import GiftCardModal from "./GiftCardModal";
import DirectOrderModal from "./DirectOrderModal";
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
  AlertTriangle,
  Info,
  Users,
  Gift,
  PackageCheck,
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
  best_overall: "bg-[var(--accent-soft)] text-[var(--anor)]",
  best_value: "bg-[var(--ok-soft)] text-[var(--ok-ink)]",
  cheapest: "bg-[var(--ok-soft)] text-[var(--ok-ink)]",
  premium: "bg-[var(--paper-2)] text-[var(--ink)]",
  most_unique: "bg-[var(--paper-2)] text-[var(--ink)]",
  alternative: "bg-[var(--paper-2)] text-[var(--ink-2)]",
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
      (topPick.rating ? `Rating: ${topPick.rating} / 5.0\n` : "") +
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

  const L = (uz: string, ru: string, en: string) => (language === "uz" ? uz : language === "ru" ? ru : en);

  // Shared quiet styles
  const pill = (active: boolean) =>
    `shrink-0 inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full border text-[13px] font-medium transition cursor-pointer ${
      active
        ? "bg-[var(--ink)] border-[var(--ink)] text-[var(--paper)]"
        : "bg-[var(--white)] border-[var(--rule-soft)] text-[var(--ink-2)] hover:text-[var(--ink)] hover:border-[var(--line-hover)]"
    }`;
  const pillCount = (active: boolean) =>
    `tabular text-[12px] font-semibold ${active ? "opacity-70" : "text-[var(--muted)]"}`;
  const iconBtn =
    "inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl border border-[var(--rule-soft)] bg-[var(--white)] text-[13px] font-semibold text-[var(--ink)] hover:bg-[var(--paper-2)] hover:border-[var(--line-hover)] transition cursor-pointer";
  const tinyIconBtn =
    "h-9 rounded-lg border border-[var(--rule-soft)] bg-[var(--white)] text-[var(--ink-2)] hover:text-[var(--anor)] hover:border-[var(--line-hover)] flex items-center justify-center transition cursor-pointer";

  // Rows of the comparison view (rendered as a table on wide screens, as stacked rows on phones)
  const comparisonRows: { key: string; icon: any; label: string; cell: (p: ResearchProduct) => JSX.Element | string }[] = [
    {
      key: "price",
      icon: Coins,
      label: L("Narx (UZS)", "Цена (UZS)", "Price (UZS)"),
      cell: (p) => (
        <div className="space-y-1">
          <div className="price text-[1.1rem] leading-none text-[var(--ink)] whitespace-nowrap">{formatPrice(p.price, p.currency)}</div>
          {p.originalPrice && p.originalPrice > (p.price || 0) && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[12px] text-[var(--ink-2)] line-through whitespace-nowrap">{formatPrice(p.originalPrice, p.currency)}</span>
              {p.discount && (
                <span className="h-5 px-1.5 rounded-md bg-[var(--ok)] text-white text-[11px] font-bold inline-flex items-center">{p.discount}</span>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "store",
      icon: Store,
      label: L("Do'kon / Manba", "Магазин / Источник", "Store / Retailer"),
      cell: (p) => (
        <div className="flex items-center gap-1.5 font-semibold text-[var(--anor)]">
          <span>{p.store}</span>
          {p.url && (
            <a
              href={ensureProductUrl(p.name, p.store, p.url)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--muted)] hover:text-[var(--anor)] transition"
              title={L("Do'konda ochish", "Открыть в магазине", "Open on Store")}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      ),
    },
    {
      key: "installment",
      icon: CreditCard,
      label: L("Bo'lib to'lash", "Рассрочка 0%", "0% Installments"),
      cell: (p) =>
        p.installment || L("Muddatli to'lov mavjud", "Доступна рассрочка", "Installment plans available"),
    },
    {
      key: "delivery",
      icon: Truck,
      label: L("Yetkazib berish", "Доставка", "Delivery SLA"),
      cell: (p) =>
        p.deliveryEstimate || L("Toshkentda 1 ish kuni", "1 рабочий день по Ташкенту", "1 business day in Tashkent"),
    },
    {
      key: "warranty",
      icon: ShieldCheck,
      label: L("Kafolat muddati", "Срок гарантии", "Warranty Period"),
      cell: (p) => p.warranty || L("Rasmiy do'kon kafolati", "Официальная гарантия магазина", "Official retailer warranty"),
    },
    {
      key: "rating",
      icon: Star,
      label: L("Reyting & Sharhlar", "Рейтинг и отзывы", "Rating & Reviews"),
      cell: (p) => (
        <div className="flex items-center gap-1 font-semibold text-[var(--ink)]">
          <Star className="w-3.5 h-3.5 text-[#E8A317] fill-[#E8A317]" />
          <span>{p.rating ? p.rating : "—"}</span>
          {p.reviewCount ? <span className="text-[var(--ink-2)] font-normal">({p.reviewCount})</span> : null}
        </div>
      ),
    },
    {
      key: "specs",
      icon: Sliders,
      label: L("Xususiyatlar", "Характеристики", "Specifications"),
      cell: (p) => {
        const specList: string[] = Array.isArray(p.specs)
          ? p.specs
          : p.specs && typeof p.specs === "object"
          ? Object.entries(p.specs).map(([k, v]) => `${k}: ${v}`)
          : [];
        return specList.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {specList.map((spec: string, sIdx: number) => (
              <span key={sIdx} className="bg-[var(--paper-2)] text-[var(--ink-2)] px-2 py-0.5 rounded-md text-[12px]">
                {spec}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-[var(--muted)]">{L("Standart parametrlar", "Стандартные параметры", "Standard specs")}</span>
        );
      },
    },
    {
      key: "reason",
      icon: Lightbulb,
      label: L("AI Tanlov Sababi", "Вердикт AI выбора", "AI Selection Verdict"),
      cell: (p) => <span className="leading-relaxed text-[var(--ink-2)]">{p.reason}</span>,
    },
  ];

  const rowActions = (p: ResearchProduct) => (
    <div className="space-y-2">
      <a
        href={ensureProductUrl(p.name, p.store, p.url)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => cyberSound.playConfirm()}
        className="btn-primary w-full h-10 px-3 text-[13px]"
      >
        <ShoppingBag className="w-3.5 h-3.5" />
        <span>{L("Do'konda ochish", "В магазин", "Open Store")}</span>
        <ArrowUpRight className="w-3.5 h-3.5 opacity-80" />
      </a>
      <div className="grid grid-cols-4 gap-1.5">
        <button
          onClick={() => {
            cyberSound.playClick();
            setQuickViewProduct(p);
          }}
          className={tinyIconBtn}
          title={L("Tezkor ko'rish va Nasiya kalkulyatori", "Быстрый просмотр и калькулятор рассрочки", "Quick View & Installment Calculator")}
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => {
            cyberSound.playClick();
            setCompareProduct(p);
          }}
          className={tinyIconBtn}
          title={L("Narxlar tarixi va do'konlar", "История цен и сравнение", "Price History & Stores")}
        >
          <BarChart2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => {
            cyberSound.playClick();
            setSaveProduct(p);
          }}
          className={tinyIconBtn}
          title={L("Wishlistga saqlash", "Сохранить в вишлист", "Save to Wishlist")}
        >
          <Heart className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => {
            cyberSound.playClick();
            setTrackProduct(p);
          }}
          className={tinyIconBtn}
          title={L("Narx tushishini kuzatish", "Отслеживать снижение цены", "Track Price Drops")}
        >
          <Bell className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );

  const storeLinks = (() => {
    const topProduct = result.products && result.products.length > 0 ? result.products[0] : null;
    const targetItem = topProduct?.name || result.query;
    const direct = (key: string, storeName: string) =>
      topProduct?.store?.toLowerCase().includes(key) && topProduct.url && !topProduct.url.includes("?q=")
        ? topProduct.url
        : ensureProductUrl(targetItem, storeName);
    return {
      targetItem,
      links: [
        { name: "Uzum", full: "Uzum Market", href: direct("uzum", "Uzum Market") },
        { name: "Olcha", full: "Olcha", href: direct("olcha", "Olcha") },
        { name: "Texnomart", full: "Texnomart", href: direct("texnomart", "Texnomart") },
        { name: "MediaPark", full: "MediaPark", href: direct("mediapark", "MediaPark") },
        { name: "Asaxiy", full: "Asaxiy", href: direct("asaxiy", "Asaxiy") },
        { name: "Idea", full: "Idea Store", href: direct("idea", "Idea Store") },
      ],
    };
  })();

  return (
    <div className="animate-fade-in space-y-6">
      {/* Research summary */}
      <section className="rounded-2xl border border-[var(--rule-soft)] bg-[var(--white)] p-4 sm:p-6 space-y-4 print:border-none">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px] text-[var(--ink-2)]">
            <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--ink)]">
              <Search className="w-3.5 h-3.5 text-[var(--anor)]" />
              {result.totalSourcesResearched} {t("results.sourcesResearched")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[var(--muted)]" />
              {t("results.lastChecked")}: {new Date(result.lastChecked).toLocaleTimeString()}
            </span>
            {result.isDemo && (
              <span className="h-6 px-2.5 rounded-full bg-[var(--paper-2)] text-[12px] font-semibold text-[var(--warn)] inline-flex items-center">
                {t("results.demoData")}
              </span>
            )}
            {result.cached && (
              <span className="h-6 px-2.5 rounded-full bg-[var(--paper-2)] text-[12px] font-semibold text-[var(--ink-2)] inline-flex items-center">
                {L("Keshdan olingan", "Из кэша", "Cached")}
              </span>
            )}
          </div>

          {/* View toggle + actions */}
          <div className="lg:ml-auto flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center p-1 rounded-xl bg-[var(--paper-2)] text-[13px] font-semibold">
              <button
                onClick={() => {
                  cyberSound.playClick();
                  setViewMode("grid");
                }}
                className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg transition cursor-pointer ${
                  viewMode === "grid" ? "bg-[var(--white)] text-[var(--ink)] shadow-[0_1px_2px_rgba(var(--shadow-color),.12)]" : "text-[var(--ink-2)] hover:text-[var(--ink)]"
                }`}
                title="Grid Card View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>{L("Kartochkalar", "Карточки", "Grid Cards")}</span>
              </button>
              <button
                onClick={() => {
                  cyberSound.playClick();
                  setViewMode("table");
                }}
                className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg transition cursor-pointer ${
                  viewMode === "table" ? "bg-[var(--white)] text-[var(--ink)] shadow-[0_1px_2px_rgba(var(--shadow-color),.12)]" : "text-[var(--ink-2)] hover:text-[var(--ink)]"
                }`}
                title="Side-by-Side Comparison Matrix"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>{L("Taqqoslash Jadvali", "Таблица", "Matrix Comparison")}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  cyberSound.playConfirm();
                  handleCopyReport();
                }}
                className={iconBtn}
                title="Copy formatted research report"
              >
                {copiedReport ? <Check className="w-3.5 h-3.5 text-[var(--ok)]" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden md:inline">
                  {copiedReport
                    ? L("Nusxalandi!", "Скопировано!", "Copied!")
                    : L("Hisobotni olish", "Копировать отчет", "Copy Dossier")}
                </span>
              </button>
              <button
                onClick={() => {
                  cyberSound.playClick();
                  handleShareTelegram();
                }}
                className={iconBtn}
                title="Share report to Telegram"
              >
                <Send className="w-3.5 h-3.5 text-[var(--anor)]" />
                <span className="hidden sm:inline">Telegram</span>
              </button>
              <button
                onClick={() => {
                  cyberSound.playClick();
                  handlePrint();
                }}
                className={`${iconBtn} w-9 px-0`}
                title="Chop etish / Print"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  cyberSound.playClick();
                  setShowPipeline(!showPipeline);
                }}
                className={iconBtn}
                aria-expanded={showPipeline}
              >
                <Cpu className="w-3.5 h-3.5 text-[var(--ink-2)]" />
                <span>Pipeline</span>
                {showPipeline ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>

        <p className="text-[15px] sm:text-[16px] leading-relaxed text-[var(--ink)]">{result.researchSummary}</p>

        {result.priceSavings && (
          <div className="flex items-start gap-2.5 rounded-xl bg-[var(--ok-soft)] px-4 py-3 text-[14px] font-medium leading-snug text-[var(--ok-ink)]">
            <TrendingDown className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{result.priceSavings}</span>
          </div>
        )}

        {/* Direct product links across stores */}
        <div className="rounded-xl bg-[var(--paper-2)] p-4">
          <p className="text-[14px] font-semibold text-[var(--ink)] leading-snug">
            {L(
              `Eng sara mahsulotni to'g'ridan-to'g'ri do'kon kartasida ochish ("${storeLinks.targetItem}"):`,
              `Открыть карточку товара в магазинах («${storeLinks.targetItem}»):`,
              `Direct Product Card in Stores ("${storeLinks.targetItem}"):`
            )}
          </p>
          <p className="mt-0.5 text-[13px] text-[var(--ink-2)]">
            {L(
              "Bozor qidiruviga emas, to'g'ridan-to'g'ri tovar kartasiga kiradi (100% Direct)",
              "Прямой переход к карточке товара, без списков поиска (100% Direct)",
              "Opens direct product item card, zero search listing pages"
            )}
          </p>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {storeLinks.links.map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-1 h-10 px-3 rounded-xl border border-[var(--rule-soft)] bg-[var(--white)] text-[13px] font-semibold text-[var(--ink)] hover:border-[var(--line-hover)] hover:text-[var(--anor)] transition"
                title={`${s.full}'da "${storeLinks.targetItem}" mahsulot sahifasini ochish`}
              >
                <span className="truncate">{s.name}</span>
                <ArrowUpRight className="w-3.5 h-3.5 flex-shrink-0 text-[var(--anor)]" />
              </a>
            ))}
          </div>
        </div>

        {/* Research pipeline */}
        {showPipeline && (
          <div className="pt-4 border-t border-[var(--rule-soft)] animate-fade-in space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="flex items-center gap-1.5 text-[14px] font-semibold text-[var(--ink)]">
                <Layers className="w-4 h-4 text-[var(--anor)]" />
                {L(
                  "8 Bosqichli Jonli AI Qidiruv Pipeline Bajarilishi",
                  "Выполнение 8-этапного конвейера поиска AI",
                  "8-Stage Live AI Discovery Pipeline Execution"
                )}
              </h4>
              <span className="text-[12px] text-[var(--ink-2)] tabular">
                {L("Javob vaqti:", "Время ответа:", "Latency:")} {result.responseTimeMs}ms
              </span>
            </div>

            <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {(
                result.pipelineStages || [
                  {
                    label: L("1. Niyat Tahlili", "1. Анализ намерений", "1. Intent Synthesis"),
                    description: L("Byudjet va maqsadni tahlil qilish", "Анализ бюджета и критериев", "Analyzing budget & gift parameters"),
                  },
                  {
                    label: L("2. Qidiruv Rejasi", "2. План поиска", "2. Search Routing"),
                    description: L("Do'konlar uchun aniq so'rovlar tuzish", "Генерация целевых запросов", "Targeting verified retail catalogs"),
                  },
                  {
                    label: L("3. Jonli Web Skaner", "3. Онлайн-сканирование", "3. Live Web Scanner"),
                    description: L("1,000,000+ do'kon mahsulotlarini skanlash", "Сканирование каталогов маркетплейсов", "Scanning 1,000,000+ live store listings"),
                  },
                  {
                    label: L("4. Narxlar Ekstraksiyasi", "4. Экстракция цен", "4. Price Extraction"),
                    description: L("Real UZS narxlarini ajratib olish", "Сбор актуальных цен в UZS", "Extracting real-time UZS pricing"),
                  },
                  {
                    label: L("5. Standartlashtirish", "5. Стандартизация", "5. Currency Calibration"),
                    description: L("Valyuta va yetkazuv muddatlarini tenglashtirish", "Нормализация валюты и сроков", "Calibrating exchange rates & SLAs"),
                  },
                  {
                    label: L("6. Dublikat & Aksessuar Filtri", "6. Фильтр дубликатов", "6. Deduplication & Noise Filter"),
                    description: L("Shubhali e'lonlar va g'iloflarni ajratish", "Отсеивание чехлов и дубликатов", "Stripping accessories & duplicate listings"),
                  },
                  {
                    label: L("7. Narxlar Taqqoslami", "7. Сравнение цен", "7. Price comparison"),
                    description: L("Eng arzon do'kon va tejovni hisoblash", "Расчет максимальной экономии", "Computing cheapest retailer & spread"),
                  },
                  {
                    label: L("8. AI Saralash & Reyting", "8. AI Ранжирование", "8. AI Ranking & Curation"),
                    description: L("Eng maqbul variantlarni tavsiya qilish", "Подбор оптимальных предложений", "Scoring top gift choices & reliability"),
                  },
                ]
              ).map((stage: any, idx: number) => (
                <li key={idx} className="flex items-start gap-2 rounded-xl border border-[var(--rule-soft)] p-3">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-[var(--ok)] flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-[var(--ink)]">{stage.label}</p>
                    <p className="mt-0.5 text-[12px] leading-snug text-[var(--ink-2)]">{stage.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}
      </section>

      {/* Same product, different stores: savings */}
      {validProducts.length >= 2 && priceSpread > 0 && minPriceProduct && maxPriceProduct && (
        <section className="rounded-2xl border border-[var(--rule-soft)] bg-[var(--white)] overflow-hidden animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 py-4 border-b border-[var(--rule-soft)]">
            <h3 className="flex items-center gap-2 font-lux text-[1.1rem] text-[var(--ink)]">
              <span className="w-2 h-2 rounded-full bg-[var(--ok)]" />
              {L("Jonli Bozor Arbitraji & Tejamkorlik Tahlili", "Арбитраж Цен и Анализ Экономии", "Store prices and savings")}
            </h3>
            <span className="text-[13px] text-[var(--ink-2)]">
              {L("Tahlil qilingan takliflar:", "Проанализировано предложений:", "Analyzed offers:")}{" "}
              <span className="font-semibold text-[var(--ink)]">
                {validProducts.length} {L("ta do'kon narxi", "предложений магазинов", "store quotes")}
              </span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[var(--rule-soft)]">
            {/* Lowest */}
            <div className="p-4 sm:p-6 flex flex-col">
              <div className="flex items-center justify-between gap-2 text-[13px]">
                <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--ok)]">
                  <ShieldCheck className="w-4 h-4" />
                  {L("Eng arzon taklif", "Самая низкая цена", "Lowest Price Offer")}
                </span>
                <span className="font-semibold text-[var(--anor)]">{minPriceProduct.store}</span>
              </div>
              <div className="mt-2 price text-[1.6rem] leading-none text-[var(--ink)]">
                {formatPrice(minPriceProduct.price || 0, minPriceProduct.currency || "UZS")}
              </div>
              <p className="mt-2 text-[13px] text-[var(--ink-2)] line-clamp-2" title={minPriceProduct.name}>
                {minPriceProduct.name}
              </p>
              <a
                href={ensureProductUrl(minPriceProduct.name, minPriceProduct.store, minPriceProduct.url)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary mt-4 h-10 px-4 text-[14px] md:mt-auto md:self-start"
              >
                <span>{L("Tovar kartasiga o'tish", "Перейти к товару", "Go to Product")}</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>

            {/* Highest */}
            <div className="p-4 sm:p-6 flex flex-col">
              <div className="flex items-center justify-between gap-2 text-[13px]">
                <span className="text-[var(--ink-2)]">
                  {L("Shu mahsulot, eng qimmat do'kon", "Тот же товар, самая высокая цена", "Same product, highest price")}
                </span>
                <span className="font-semibold text-[var(--ink-2)]">{maxPriceProduct.store}</span>
              </div>
              <div className="mt-2 price text-[1.6rem] leading-none text-[var(--ink-2)] line-through decoration-2">
                {formatPrice(maxPriceProduct.price || 0, maxPriceProduct.currency || "UZS")}
              </div>
              <p className="mt-2 text-[13px] text-[var(--ink-2)] line-clamp-2" title={maxPriceProduct.name}>
                {maxPriceProduct.name}
              </p>
              <p className="mt-3 md:mt-auto text-[13px] text-[var(--ink-2)]">
                {L(
                  `O'rtacha bozor tafovuti: ${savingsPercent}% gacha`,
                  `Рыночная разница в цене: до ${savingsPercent}%`,
                  `Market price disparity: up to ${savingsPercent}%`
                )}
              </p>
            </div>

            {/* Net savings */}
            <div className="p-4 sm:p-6 flex flex-col bg-[var(--ok-soft)]">
              <div className="flex items-center justify-between gap-2 text-[13px]">
                <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--ok-ink)]">
                  <TrendingDown className="w-4 h-4" />
                  {L("Sof tejamkorlik", "Чистая экономия", "Net Direct Savings")}
                </span>
                <span className="h-6 px-2 rounded-md bg-[var(--ok)] text-white text-[12px] font-bold inline-flex items-center tabular">
                  -{savingsPercent}%
                </span>
              </div>
              <div className="mt-2 price text-[1.6rem] leading-none text-[var(--ok-ink)]">+{formatPrice(priceSpread, "UZS")}</div>
              <p className="mt-2 text-[13px] text-[var(--ok-ink)]">
                {L(
                  `${minPriceProduct.store}'dan xarid qilib, shuncha so'm tejaysiz!`,
                  `Покупая в ${minPriceProduct.store}, вы экономите эту сумму!`,
                  `Buying from ${minPriceProduct.store} saves you this amount!`
                )}
              </p>
              <button
                onClick={() => {
                  setSelectedStore(minPriceProduct.store);
                  setSortBy("cheapest");
                }}
                className="btn-ghost mt-4 md:mt-auto md:self-start h-10 px-4 text-[14px]"
              >
                <span>{L("Eng arzon variantga filtrlash", "Показать самый дешевый вариант", "Filter by Lowest Price")}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Store / sort / budget toolbar */}
      <section className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="-mx-6 px-6 sm:mx-0 sm:px-0 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button onClick={() => setSelectedStore("all")} className={pill(selectedStore === "all")}>
              <span>{L("Barcha do'konlar", "Все магазины", "All Stores")}</span>
              <span className={pillCount(selectedStore === "all")}>{result.products.length}</span>
            </button>
            {availableStores.map((st) => (
              <button key={st} onClick={() => setSelectedStore(st)} className={pill(selectedStore === st)}>
                <span>{st}</span>
                <span className={pillCount(selectedStore === st)}>{storeCounts[st]}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
            <span className="text-[14px] text-[var(--ink-2)] whitespace-nowrap shrink-0">
              <span className="font-semibold text-[var(--ink)] tabular">{sortedProducts.length}</span>{" "}
              {L("ta taklif", "предложений", "offers")}
            </span>
            <label className="flex flex-1 md:flex-none min-w-0 max-w-[16rem] md:max-w-none items-center gap-2 h-10 pl-3 pr-1.5 rounded-xl border border-[var(--rule-soft)] bg-[var(--white)] text-[14px] hover:border-[var(--line-hover)] focus-within:border-[var(--anor)] transition">
              <Sliders className="w-3.5 h-3.5 text-[var(--muted)] shrink-0" />
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="flex-1 min-w-0 h-full bg-transparent font-semibold text-[var(--ink)] outline-none cursor-pointer"
              >
                <option value="cheapest">{L("Narx: Eng arzonidan boshlab", "Цена: по возрастанию", "Price: Low to High")}</option>
                <option value="expensive">{L("Narx: Qimmatidan boshlab", "Цена: по убыванию", "Price: High to Low")}</option>
                <option value="rating">{L("Reyting: Eng yuqori", "Рейтинг: по убыванию", "Rating: Highest First")}</option>
                <option value="discount">{L("Chegirma: Eng katta", "Скидка: по убыванию", "Discount: Biggest First")}</option>
              </select>
            </label>
          </div>
        </div>

        {/* Budget brackets */}
        <div className="-mx-6 px-6 sm:mx-0 sm:px-0 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="shrink-0 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--ink-2)] mr-1">
            <Coins className="w-3.5 h-3.5 text-[var(--muted)]" />
            {L("Byudjet:", "Бюджет:", "Budget:")}
          </span>
          {priceRanges.map((range) => {
            const count = (result.products || []).filter(range.filter).length;
            if (count === 0 && range.id !== "all") return null;
            const label = language === "uz" ? range.labelUz : language === "ru" ? range.labelRu : range.labelEn;
            return (
              <button
                key={range.id}
                onClick={() => setPriceRange(range.id)}
                className={`${pill(priceRange === range.id)} h-8 px-3`}
              >
                <span>{label}</span>
                <span className={pillCount(priceRange === range.id)}>{count}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main view: cards or comparison */}
      {viewMode === "grid" ? (
        sortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {sortedProducts.map((product, i) => (
              <ResultCard
                key={i}
                product={product}
                isDemo={result.isDemo}
                isCheapest={product.category === "cheapest" || (cheapestOverall !== null && product.price === cheapestOverall)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-[var(--rule-soft)] bg-[var(--white)] p-8 text-center space-y-4">
            <p className="text-[15px] text-[var(--ink-2)]">Tanlangan filtrlar bo'yicha mahsulot topilmadi.</p>
            <button
              onClick={() => {
                cyberSound.playClick();
                setSelectedStore("all");
                setPriceRange("all");
              }}
              className="btn-primary h-10 px-5 text-[14px]"
            >
              Filtrlarni tozalash ({result.products.length})
            </button>
          </div>
        )
      ) : (
        <section className="rounded-2xl border border-[var(--rule-soft)] bg-[var(--white)] overflow-hidden animate-fade-in">
          <div className="p-4 sm:p-6 border-b border-[var(--rule-soft)] flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-lux text-[1.15rem] sm:text-[1.3rem] text-[var(--ink)]">
                {L("Yonma-yon Taqqoslash Matritsasi", "Матрица Сравнения Характеристик", "Side-by-Side Comparison Matrix")}
              </h3>
              <p className="mt-1 text-[13px] text-[var(--ink-2)]">
                {L(
                  `Barcha ${result.products.length} ta tadqiq qilingan mahsulotlarning narxlari, muddatli to'lovlari, kafolati va xususiyatlari.`,
                  `Цены, рассрочка, гарантия и характеристики всех ${result.products.length} исследованных товаров.`,
                  `Side-by-side pricing, installment plans, warranties & specs for all ${result.products.length} verified items.`
                )}
              </p>
            </div>
            <span className="h-7 px-3 rounded-full bg-[var(--paper-2)] text-[13px] font-semibold text-[var(--ink-2)] inline-flex items-center">
              {sortedProducts.length} {L("ta mahsulot taqqoslanmoqda", "товаров сравнивается", "items analyzed")}
            </span>
          </div>

          {/* Phones: one block per product */}
          <ul className="md:hidden divide-y divide-[var(--rule-soft)]">
            {sortedProducts.map((p, idx) => (
              <li key={idx} className="p-4 space-y-3">
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      cyberSound.playClick();
                      setQuickViewProduct(p);
                    }}
                    className="w-20 h-20 shrink-0 rounded-xl bg-[var(--img-well)] overflow-hidden flex items-center justify-center cursor-pointer"
                    title="Quick View"
                  >
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} loading="lazy" className="w-full h-full object-contain p-1.5 mix-blend-multiply" />
                    ) : (
                      <ShoppingBag className="w-6 h-6 text-[#8D99B3]" />
                    )}
                  </button>
                  <div className="min-w-0">
                    <span className={`inline-flex h-6 px-2 rounded-full text-[12px] font-semibold items-center ${categoryBadgeColors[p.category] || categoryBadgeColors.alternative}`}>
                      {getCategoryBadgeLabel(p.category, language)}
                    </span>
                    <h4
                      onClick={() => {
                        cyberSound.playClick();
                        setQuickViewProduct(p);
                      }}
                      className="mt-1.5 text-[15px] font-semibold leading-snug text-[var(--ink)] line-clamp-2 cursor-pointer"
                    >
                      {p.name}
                    </h4>
                  </div>
                </div>
                <dl className="grid grid-cols-[minmax(0,7.5rem)_minmax(0,1fr)] gap-x-3 gap-y-2.5 text-[14px]">
                  {comparisonRows.map((row) => (
                    <div key={row.key} className="contents">
                      <dt className="text-[13px] text-[var(--ink-2)] pt-px">{row.label}</dt>
                      <dd className="min-w-0 text-[var(--ink)] break-words">{row.cell(p)}</dd>
                    </div>
                  ))}
                </dl>
                {rowActions(p)}
              </li>
            ))}
          </ul>

          {/* Wider screens: table */}
          <div className="hidden md:block overflow-x-auto scrollbar-thin">
            <table className="w-full text-left border-collapse min-w-[720px] text-[14px]">
              <thead>
                <tr className="border-b border-[var(--rule-soft)]">
                  <th className="sticky left-0 z-10 p-4 w-40 align-bottom bg-[var(--paper-2)] text-[13px] font-semibold text-[var(--ink-2)]">
                    {L("Mezonlar / Mahsulot", "Критерии / Товар", "Criteria / Product")}
                  </th>
                  {sortedProducts.map((p, idx) => (
                    <th key={idx} className="p-4 min-w-[220px] max-w-[260px] align-top font-normal">
                      <div className="space-y-2.5">
                        <div
                          onClick={() => {
                            cyberSound.playClick();
                            setQuickViewProduct(p);
                          }}
                          className="h-32 rounded-xl bg-[var(--img-well)] overflow-hidden group cursor-pointer flex items-center justify-center"
                          title="Quick View"
                        >
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.name} loading="lazy" className="w-full h-full object-contain p-3 mix-blend-multiply transition-transform duration-300 group-hover:scale-[1.04]" />
                          ) : (
                            <ShoppingBag className="w-8 h-8 text-[#8D99B3]" />
                          )}
                        </div>
                        <span className={`inline-flex h-6 px-2 rounded-full text-[12px] font-semibold items-center ${categoryBadgeColors[p.category] || categoryBadgeColors.alternative}`}>
                          {getCategoryBadgeLabel(p.category, language)}
                        </span>
                        <h4
                          onClick={() => {
                            cyberSound.playClick();
                            setQuickViewProduct(p);
                          }}
                          className="text-[14px] font-semibold leading-snug text-[var(--ink)] line-clamp-2 cursor-pointer hover:text-[var(--anor)] transition"
                        >
                          {p.name}
                        </h4>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-[var(--rule-soft)]">
                {comparisonRows.map((row) => {
                  const Icon = row.icon;
                  return (
                    <tr key={row.key} className="hover:bg-[var(--paper-2)]/50">
                      <td className="sticky left-0 z-10 p-4 align-top bg-[var(--paper-2)] text-[13px] font-semibold text-[var(--ink-2)]">
                        <span className="flex items-center gap-2">
                          <Icon className="w-3.5 h-3.5 text-[var(--muted)] flex-shrink-0" />
                          {row.label}
                        </span>
                      </td>
                      {sortedProducts.map((p, idx) => (
                        <td key={idx} className="p-4 align-top text-[var(--ink)]">
                          {row.cell(p)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
                <tr>
                  <td className="sticky left-0 z-10 p-4 align-top bg-[var(--paper-2)] text-[13px] font-semibold text-[var(--ink-2)]">
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-[var(--muted)]" />
                      {L("Amallar", "Действия", "Actions")}
                    </span>
                  </td>
                  {sortedProducts.map((p, idx) => (
                    <td key={idx} className="p-4 align-top">
                      {rowActions(p)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Research details & rejections */}
      <section className="rounded-2xl border border-[var(--rule-soft)] bg-[var(--white)] overflow-hidden">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-between gap-3 p-4 sm:p-5 text-left hover:bg-[var(--paper-2)] transition cursor-pointer"
          aria-expanded={showDetails}
        >
          <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span className="inline-flex items-center gap-2 text-[15px] font-semibold text-[var(--ink)]">
              <ShieldCheck className="w-4 h-4 text-[var(--anor)]" />
              {L("Tadqiqot auditi va metodologiyasi", "Аудит исследования и методология", "Research Audit & Methodology Dossier")}
            </span>
            <span className="text-[13px] text-[var(--ink-2)]">
              {L(
                `${result.totalProductsConsidered || (result.products || []).length} ko'rildi · ${(result.rejectedProducts || []).length} rad etildi`,
                `${result.totalProductsConsidered || (result.products || []).length} проверено · ${(result.rejectedProducts || []).length} отклонено`,
                `${result.totalProductsConsidered || (result.products || []).length} evaluated · ${(result.rejectedProducts || []).length} filtered`
              )}
            </span>
          </span>
          {showDetails ? <ChevronUp className="w-4 h-4 text-[var(--ink-2)] shrink-0" /> : <ChevronDown className="w-4 h-4 text-[var(--ink-2)] shrink-0" />}
        </button>

        {showDetails && (
          <div className="px-4 sm:px-5 pb-5 pt-4 space-y-5 border-t border-[var(--rule-soft)] animate-fade-in">
            {(result.searchStrategies || []).length > 0 && (
              <div>
                <h4 className="text-[14px] font-semibold text-[var(--ink)] mb-2.5">
                  {L(
                    "Tadqiqot yo'nalishlari va skan qilingan kanallar",
                    "Направления поиска и сканированные каналы",
                    "Sources checked"
                  )}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(result.searchStrategies || []).map((s, i) => (
                    <span key={i} className="text-[13px] bg-[var(--paper-2)] text-[var(--ink)] px-3 py-1.5 rounded-lg">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {(result.rejectedProducts || []).length > 0 && (
              <div>
                <h4 className="text-[14px] font-semibold text-[var(--ink)] mb-2.5">
                  {L(
                    "Rad etilgan mahsulotlar (Sifatsiz yoki soxta listinglar filtri)",
                    "Отклоненные товары (Фильтр сомнительных цен и серых копий)",
                    "Filtered Out Listings (Misleading pricing, duplicate or grey-market exclusions)"
                  )}
                </h4>
                <ul className="space-y-2">
                  {(result.rejectedProducts || []).map((r, i) => (
                    <li key={i} className="flex items-start gap-3 rounded-xl border border-[var(--rule-soft)] p-3.5 text-[14px]">
                      <XCircle className="w-4 h-4 mt-0.5 text-[var(--rose)] flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="font-semibold text-[var(--ink)]">{r.name}</span>
                        {r.store && <span className="text-[13px] text-[var(--ink-2)]"> ({r.store})</span>}
                        <p className="mt-0.5 text-[13px] leading-relaxed text-[var(--ink-2)]">{r.reason}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>

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

/**
 * Result card in the HomePage product-card style. Same actions as components/ProductCard
 * (quick view, buy link, direct order, save, compare, track, packaging, group gift, greeting card, Telegram, why).
 */
function ResultCard({
  product,
  isDemo = false,
  isCheapest = false,
}: {
  product: ResearchProduct;
  isDemo?: boolean;
  isCheapest?: boolean;
}) {
  const { t, language } = useTranslation();
  const [showWhy, setShowWhy] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [showSave, setShowSave] = useState(false);
  const [showTrack, setShowTrack] = useState(false);
  const [showGiftCard, setShowGiftCard] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const [showDirectOrder, setShowDirectOrder] = useState(false);
  void isDemo;

  const isBestPrice = isCheapest || product.category === "cheapest";

  const initialImage = product.imageUrl || getProductFallbackImage(product.name, product.category);
  const [imgSrc, setImgSrc] = useState(initialImage);

  useEffect(() => {
    setImgSrc(product.imageUrl || getProductFallbackImage(product.name, product.category));
  }, [product.imageUrl, product.name]);

  const categoryLabel = t(
    `results.${
      product.category === "best_overall"
        ? "bestOverall"
        : product.category === "best_value"
        ? "bestValue"
        : product.category === "cheapest"
        ? "cheapest"
        : product.category === "premium"
        ? "premium"
        : product.category === "most_unique"
        ? "mostUnique"
        : "bestOverall"
    }`
  );

  const handleShareTelegram = () => {
    const text =
      language === "uz"
        ? `Sovg'a AI Tavsiyasi:\n${product.name}\nNarxi: ${formatPrice(product.price, product.currency)}\nDo'kon: ${product.store}\nNega tavsiya etildi: ${product.reason}`
        : language === "ru"
        ? `Рекомендация Sovg'a AI:\n${product.name}\nЦена: ${formatPrice(product.price, product.currency)}\nМагазин: ${product.store}\nПочему рекомендовано: ${product.reason}`
        : `Sovg'a AI Recommendation:\n${product.name}\nPrice: ${formatPrice(product.price, product.currency)}\nStore: ${product.store}\nReason: ${product.reason}`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(product.url || window.location.href)}&text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const L = (uz: string, ru: string, en: string) => (language === "uz" ? uz : language === "ru" ? ru : en);
  const storeUrl = ensureProductUrl(product.name, product.store, product.url);
  const specTexts: string[] = product.specs
    ? Array.isArray(product.specs)
      ? product.specs.slice(0, 3).map((s: any) => String(s))
      : Object.entries(product.specs).slice(0, 3).map(([k, v]) => `${k}: ${v}`)
    : [];
  const microBtn =
    "w-9 h-9 rounded-lg flex items-center justify-center text-[var(--ink-2)] hover:text-[var(--anor)] hover:bg-[var(--paper-2)] transition cursor-pointer";

  return (
    <>
      <article
        className={`card group flex flex-col p-3 sm:p-4 hover:border-[var(--line-hover)] hover:shadow-[0_12px_32px_-12px_rgba(var(--shadow-color),.35)] ${
          isBestPrice ? "!border-[var(--ok)]" : ""
        }`}
      >
        <div className="flex gap-3 sm:flex-col sm:gap-0">
          {/* Image well */}
          <div
            onClick={() => setShowQuickView(true)}
            className="relative w-28 h-28 sm:w-auto sm:h-auto sm:aspect-[4/3] shrink-0 rounded-xl bg-[var(--img-well)] overflow-hidden cursor-pointer"
            title="Tezkor ma'lumotlarni ko'rish"
          >
            <img
              src={imgSrc}
              alt={product.name}
              loading="lazy"
              decoding="async"
              onError={() => setImgSrc(getProductFallbackImage(product.name, product.category))}
              className="absolute inset-0 w-full h-full object-contain p-2 sm:p-6 mix-blend-multiply transition-transform duration-300 group-hover:scale-[1.04]"
            />

            {product.discount && (
              <span className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 h-6 px-2 rounded-md bg-[var(--ok)] text-white text-[12px] font-bold inline-flex items-center tabular">
                {product.discount}
              </span>
            )}

            {/* Direct store link */}
            <a
              href={storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="hidden sm:inline-flex absolute top-2.5 right-2.5 h-7 px-2.5 items-center gap-1 rounded-full bg-[#fff] text-[#0E1A36] text-[12px] font-semibold border border-[#DCE3EF] hover:border-[#9AA7C0] transition"
              title={`${product.store} do'konida to'g'ridan-to'g'ri ochish`}
            >
              {product.store}
              <ArrowUpRight className="w-3.5 h-3.5 text-[#1F4CA8]" />
            </a>

            {/* Hover quick view */}
            <span className="hidden sm:inline-flex absolute bottom-2.5 left-1/2 -translate-x-1/2 h-8 px-3 items-center gap-1.5 rounded-full bg-[#fff] text-[#0E1A36] text-[12px] font-semibold shadow-[0_4px_12px_-4px_rgba(14,26,54,.3)] opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition">
              <Eye className="w-3.5 h-3.5" />
              {L("Tezkor ko'rish", "Быстрый просмотр", "Quick View")}
            </span>
          </div>

          {/* Text */}
          <div className="min-w-0 flex-1 sm:mt-4">
            <div className="flex items-center gap-1.5 text-[12px] sm:text-[13px] min-w-0">
              <span className="font-semibold text-[var(--anor)] shrink-0 max-w-[70%] truncate">{product.store}</span>
              <span className="text-[var(--muted)]">·</span>
              <span className="text-[var(--ink-2)] truncate">{categoryLabel}</span>
            </div>

            <h3
              onClick={() => setShowQuickView(true)}
              className="mt-1 text-[14px] sm:text-[15px] font-medium leading-snug text-[var(--ink)] line-clamp-2 sm:min-h-[2.6em] cursor-pointer hover:text-[var(--anor)] transition"
            >
              {product.name}
            </h3>

            <div className="mt-2 sm:mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="price text-[1.2rem] sm:text-[1.4rem] leading-none text-[var(--ink)] whitespace-nowrap">
                {formatPrice(product.price, product.currency)}
              </span>
              {product.originalPrice && product.originalPrice > (product.price || 0) && (
                <span className="text-[12px] sm:text-[13px] text-[var(--ink-2)] line-through whitespace-nowrap">
                  {formatPrice(product.originalPrice, product.currency)}
                </span>
              )}
            </div>

            {isBestPrice && (
              <span className="mt-2 inline-flex items-center gap-1 h-6 px-2 rounded-full bg-[var(--ok-soft)] text-[12px] font-semibold text-[var(--ok-ink)]">
                <TrendingDown className="w-3.5 h-3.5" />
                {L("Eng arzon bozor narxi", "Лучшая цена на рынке", "Lowest Market Price")}
              </span>
            )}

            {/* Meta: rating, verification */}
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px]">
              {product.rating && (
                <span className="inline-flex items-center gap-1 font-semibold text-[var(--ink)]">
                  <Star className="w-3 h-3 text-[#E8A317] fill-[#E8A317]" />
                  {product.rating}
                  {product.reviewCount ? <span className="font-normal text-[var(--ink-2)]">({product.reviewCount})</span> : null}
                </span>
              )}
              {product.priceVerified ? (
                <span
                  className="inline-flex items-center gap-1 font-medium text-[var(--ok)]"
                  title={L("Narx va ombor tasdiqlangan", "Цена и наличие проверены", "Price and inventory verified")}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {L("Tasdiqlangan", "Проверено", "Verified")}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[var(--ink-2)]">
                  <AlertTriangle className="w-3 h-3" />
                  {t("results.priceNotVerified")}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Small muted lines: installment, delivery, specs */}
        <div className="mt-3 space-y-1 text-[12px] sm:text-[13px] text-[var(--ink-2)]">
          <p className="flex items-center gap-1.5 min-w-0">
            <CreditCard className="w-3.5 h-3.5 shrink-0 text-[var(--muted)]" />
            <span className="truncate">
              {product.installment || L("Muddatli to'lov: do'kon saytida tekshiring", "Рассрочка: уточните на сайте магазина", "Installments: check on the store's site")}
            </span>
          </p>
          {product.deliveryEstimate && (
            <p className="flex items-center gap-1.5 min-w-0">
              <Truck className="w-3.5 h-3.5 shrink-0 text-[var(--muted)]" />
              <span className="truncate">{trData(product.deliveryEstimate)}</span>
            </p>
          )}
        </div>
        {specTexts.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1">
            {specTexts.map((specText, sIdx) => (
              <span key={sIdx} className="max-w-full truncate text-[11px] sm:text-[12px] px-2 py-0.5 rounded-md bg-[var(--paper-2)] text-[var(--ink-2)]">
                {specText}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="mt-auto pt-4 space-y-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                cyberSound.playClick();
                setShowQuickView(true);
              }}
              title={L("Tezkor ko'rish", "Быстрый просмотр", "Quick View")}
              className="btn-ghost h-10 w-10 sm:w-auto px-0 sm:px-3 text-[13px] shrink-0"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="sr-only sm:not-sr-only">{L("Ko'rish", "Обзор", "View")}</span>
            </button>

            <a
              href={storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => cyberSound.playConfirm()}
              title={L(`${product.store} do'konida ochish`, `Открыть в ${product.store}`, `Open on ${product.store}`)}
              className="btn-primary flex-1 min-w-0 h-10 px-3 text-[13px]"
            >
              <span className="truncate">
                {isBestPrice
                  ? L(`${product.store}da eng arzonga olish`, `Купить выгодно в ${product.store}`, `Buy lowest on ${product.store}`)
                  : L(`${product.store}da xarid qilish`, `Купить в ${product.store}`, `Buy on ${product.store}`)}
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
            </a>

            <button
              onClick={() => {
                cyberSound.playClick();
                setShowDirectOrder(true);
              }}
              title={L("Ilovada tezkor buyurtma", "Прямой заказ в приложении", "Direct In-App Order")}
              className="btn-ghost w-10 h-10 px-0 shrink-0"
            >
              <Truck className="w-4 h-4" />
            </button>
          </div>

          {/* Secondary actions */}
          <div className="flex items-center justify-between -mx-1">
            <div className="flex items-center">
              <button
                onClick={() => {
                  cyberSound.playClick();
                  setShowSave(true);
                }}
                title={L("Istaklar ro'yxatiga saqlash", "Сохранить в избранное", "Save to wishlist")}
                className={microBtn}
              >
                <Heart className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  cyberSound.playClick();
                  setShowCompare(true);
                }}
                title={L("Boshqa do'konlar narxlarini solishtirish", "Сравнить цены в магазинах", "Compare all store prices")}
                className={microBtn}
              >
                <BarChart2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  cyberSound.playClick();
                  setShowTrack(true);
                }}
                title={L("Narx tushishini kuzatish", "Отслеживать снижение цены", "Track price drops")}
                className={microBtn}
              >
                <Bell className="w-4 h-4" />
              </button>
              <Link
                href="/packaging-studio"
                onClick={() => cyberSound.playClick()}
                title={L("Qadoqlash Studiyasida bezash", "Оформить в Студии Упаковки", "Customize in Packaging Studio")}
                className={microBtn}
              >
                <PackageCheck className="w-4 h-4" />
              </Link>
              <Link
                href="/group-gifting"
                onClick={() => cyberSound.playClick()}
                title={L("Do'stlar bilan ulush hisoblash", "Разделить оплату с друзьями", "Split cost with friends")}
                className={microBtn}
              >
                <Users className="w-4 h-4" />
              </Link>
              <button
                onClick={() => {
                  cyberSound.playClick();
                  setShowGiftCard(true);
                }}
                title={L("Tabriknoma yaratish", "Создать открытку", "Create greeting card")}
                className={microBtn}
              >
                <Gift className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={handleShareTelegram}
              title={L("Telegram orqali ulashish", "Поделиться в Telegram", "Share via Telegram")}
              className={microBtn}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Why recommended */}
          <button
            onClick={() => setShowWhy(!showWhy)}
            className="w-full flex items-center gap-1.5 pt-2 border-t border-[var(--rule-soft)] text-left text-[13px] font-medium text-[var(--ink-2)] hover:text-[var(--anor)] transition cursor-pointer"
            aria-expanded={showWhy}
          >
            <Info className="w-3.5 h-3.5" />
            <span>{t("results.whyRecommended")}</span>
            {showWhy ? <ChevronUp className="w-3.5 h-3.5 ml-auto" /> : <ChevronDown className="w-3.5 h-3.5 ml-auto" />}
          </button>

          {showWhy && (
            <div className="rounded-xl bg-[var(--paper-2)] p-3 text-[13px] leading-relaxed text-[var(--ink)] animate-fade-in">
              <p>{product.reason}</p>
              <div className="mt-2 pt-2 border-t border-[var(--rule-soft)] flex flex-wrap justify-between gap-x-3 gap-y-0.5 text-[12px] text-[var(--ink-2)]">
                <span>
                  {L("Tekshirildi:", "Проверено:", "Verified:")} {new Date(product.lastChecked).toLocaleTimeString()}
                </span>
                <span>
                  {L("Manba:", "Источник:", "Source:")} {product.source}
                </span>
              </div>
            </div>
          )}
        </div>
      </article>

      {showCompare && (
        <PriceComparisonModal
          productName={product.name}
          currentPrice={product.price}
          currentStore={product.store}
          onClose={() => setShowCompare(false)}
        />
      )}

      {showSave && <SaveProductModal product={product} onClose={() => setShowSave(false)} />}

      {showTrack && <PriceTrackModal product={product} onClose={() => setShowTrack(false)} />}

      {showGiftCard && <GiftCardModal product={product} onClose={() => setShowGiftCard(false)} />}

      {showQuickView && <ProductQuickViewModal product={product} onClose={() => setShowQuickView(false)} />}

      {showDirectOrder && (
        <DirectOrderModal product={product} isOpen={showDirectOrder} onClose={() => setShowDirectOrder(false)} />
      )}
    </>
  );
}

export function ResearchSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true">
      <div className="rounded-2xl border border-[var(--rule-soft)] bg-[var(--white)] p-5 sm:p-6 space-y-3">
        <div className="skeleton h-5 w-48" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-3/4" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-[var(--rule-soft)] bg-[var(--white)] p-3 sm:p-4">
            <div className="flex gap-3 sm:flex-col sm:gap-0">
              <div className="skeleton w-28 h-28 sm:w-auto sm:h-auto sm:aspect-[4/3] shrink-0" />
              <div className="flex-1 space-y-2.5 sm:mt-4">
                <div className="skeleton h-3 w-1/3" />
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-6 w-1/2" />
              </div>
            </div>
            <div className="skeleton mt-4 h-10 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
