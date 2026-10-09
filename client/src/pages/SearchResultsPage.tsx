import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation, useSearch, Link } from "wouter";
import { useTranslation } from "../lib/i18n";
import { research } from "../lib/api";
import { cyberSound } from "../lib/cyberSound";
import SearchBar from "../components/SearchBar";
import ResearchResults, { ResearchSkeleton } from "../components/ResearchResults";
import CuteSearchAnimals from "../components/CuteSearchAnimals";
import {
  Sparkles,
  ArrowLeft,
  Filter,
  AlertCircle,
  RefreshCw,
  Zap,
  TrendingDown,
  CreditCard,
  Crown,
  Tag,
  ArrowUpDown,
  ShoppingBag,
} from "lucide-react";

interface RefinementItem {
  labelEn: string;
  labelUz: string;
  labelRu: string;
  suffixEn: string;
  suffixUz: string;
  suffixRu: string;
  icon: any;
  chipClass: string;
  iconClass: string;
}

const refinementSuggestions: RefinementItem[] = [
  {
    labelEn: "Express Delivery in Tashkent",
    labelUz: "Toshkentda tez yetkazish",
    labelRu: "Быстрая доставка в Ташкенте",
    suffixEn: " express 1-day delivery in Tashkent",
    suffixUz: " Toshkentda 1 kunda yetkazib berish",
    suffixRu: " быстрая доставка в Ташкенте за 1 день",
    icon: Zap,
    chipClass: "bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60",
    iconClass: "text-amber-600 dark:text-amber-400",
  },
  {
    labelEn: "Value & Budget Alternatives",
    labelUz: "Arzonroq muqobillar",
    labelRu: "Выгодные альтернативы",
    suffixEn: " affordable high-quality alternatives",
    suffixUz: " arzonroq sifatli variantlar",
    suffixRu: " доступные качественные альтернативы",
    icon: TrendingDown,
    chipClass: "bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60",
    iconClass: "text-emerald-600 dark:text-emerald-400",
  },
  {
    labelEn: "0% Halol Installments (Nasiya)",
    labelUz: "Nasiya / Bo'lib to'lash",
    labelRu: "Рассрочка без переплат",
    suffixEn: " 0% installments Uzum Nasiya",
    suffixUz: " Uzum Nasiya bo'lib to'lash bilan",
    suffixRu: " в рассрочку без переплат Uzum Nasiya",
    icon: CreditCard,
    chipClass: "bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/40 text-cyan-900 dark:text-cyan-300 border-cyan-200/80 dark:border-cyan-800/60",
    iconClass: "text-cyan-600 dark:text-cyan-400",
  },
  {
    labelEn: "Ultra-Premium Tier",
    labelUz: "Premium variantlar",
    labelRu: "Премиум класс",
    suffixEn: " top-tier premium authentic flagship",
    suffixUz: " eng sifatli premium model",
    suffixRu: " премиум флагман оригинал",
    icon: Crown,
    chipClass: "bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 text-purple-900 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/60",
    iconClass: "text-purple-600 dark:text-purple-400",
  },
  {
    labelEn: "Deepest Discounts & Promos",
    labelUz: "Katta chegirmalar",
    labelRu: "Максимальные скидки",
    suffixEn: " biggest verified sale discount",
    suffixUz: " eng katta chegirmadagi aksiya",
    suffixRu: " с максимальной скидкой по акции",
    icon: Tag,
    chipClass: "bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-900 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/60",
    iconClass: "text-rose-600 dark:text-rose-400",
  },
];

export default function SearchResultsPage() {
  const { t, language } = useTranslation();
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString || (typeof window !== "undefined" ? window.location.search : ""));
  const qParam = searchParams.get("q") || "";
  const [query, setQuery] = useState(qParam);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [selectedStore, setSelectedStore] = useState<string>("all");
  const [priceBracket, setPriceBracket] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("price_asc");

  const mutation = useMutation({
    mutationFn: (q: string) => research.search({ query: q }),
  });

  useEffect(() => {
    if (qParam) {
      setQuery(qParam);
      mutation.mutate(qParam);
    }
  }, [qParam]);

  const handleRefine = (suffix: string) => {
    const base = query.replace(/\s+(Toshkentda|arzonroq|Uzum Nasiya|eng sifatli|eng katta|express|affordable|installments|premium|biggest|быстрая|доступные|рассрочку|премиум|максимальной).*/i, "").trim();
    const newQuery = (base + suffix).trim();
    setQuery(newQuery);
    setLocation(`/search?q=${encodeURIComponent(newQuery)}`);
    mutation.mutate(newQuery);
  };

  // Filter and sort products
  let processedProducts = mutation.data?.products ? [...mutation.data.products] : [];

  if (activeFilter !== "all") {
    processedProducts = processedProducts.filter((p: any) => p.category === activeFilter);
  }

  if (selectedStore !== "all") {
    processedProducts = processedProducts.filter((p: any) =>
      p.store?.toLowerCase().includes(selectedStore.toLowerCase())
    );
  }

  if (priceBracket !== "all") {
    processedProducts = processedProducts.filter((p: any) => {
      const price = p.price || 0;
      if (priceBracket === "under_1m") return price < 1000000;
      if (priceBracket === "1m_3m") return price >= 1000000 && price <= 3000000;
      if (priceBracket === "3m_7m") return price > 3000000 && price <= 7000000;
      if (priceBracket === "7m_15m") return price > 7000000 && price <= 15000000;
      if (priceBracket === "over_15m") return price > 15000000;
      return true;
    });
  }

  if (sortBy === "price_asc") {
    processedProducts.sort((a: any, b: any) => (a.price || 0) - (b.price || 0));
  } else if (sortBy === "price_desc") {
    processedProducts.sort((a: any, b: any) => (b.price || 0) - (a.price || 0));
  } else if (sortBy === "discount") {
    processedProducts.sort((a: any, b: any) => {
      const da = a.discount ? parseInt(a.discount) : 0;
      const db = b.discount ? parseInt(b.discount) : 0;
      return db - da;
    });
  } else if (sortBy === "rating") {
    processedProducts.sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0));
  }

  const filteredData = mutation.data
    ? {
        ...mutation.data,
        products: processedProducts,
      }
    : null;

  return (
    <div className="min-h-screen bg-[#fcfbf9] dark:bg-[#07080c] py-8 transition-colors relative overflow-hidden">
      {/* Ambient luxury vignette glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[min(1000px,100vw)] max-w-full h-[400px] bg-gradient-to-b from-amber-500/10 via-amber-400/5 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8 animate-fade-in relative z-10">
        {/* Search Header Bar */}
      <div className="max-w-3xl mx-auto">
        <SearchBar
          initialQuery={query}
          onSearch={(newQ) => {
            setQuery(newQ);
            mutation.mutate(newQ);
          }}
        />
      </div>

      {/* Loading state with animated pipeline simulation */}
      {mutation.isPending && (
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="card-luxury radar-sweep-indicator bg-white dark:bg-[#10121d] rounded-3xl p-7 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-luxury text-center space-y-5 relative overflow-hidden">
            <div className="w-16 h-16 bg-slate-900 dark:bg-slate-800 text-amber-400 rounded-2xl flex items-center justify-center mx-auto shadow-lg relative z-10">
              <Sparkles className="w-8 h-8 animate-spin" style={{ animationDuration: "6s" }} />
            </div>

            <div className="space-y-1.5 relative z-10">
              <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800 uppercase tracking-widest">
                {language === "uz"
                  ? "Jonli Bozor Skaneri Ishga Tushirildi"
                  : language === "ru"
                  ? "Сканирование Рынка Запущено"
                  : "Live Market Scanner Activated"}
              </span>
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
                {language === "uz"
                  ? "AI Xarid Tadqiqoti Olib Borilmoqda"
                  : language === "ru"
                  ? "Выполняется исследование рынка"
                  : "Neural Shopping Intelligence in Progress"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto">
                {language === "uz"
                  ? `Uzum Market, Texnomart, MediaPark, Asaxiy va Toshkent omborlari tekshirilmoqda: “${query}”`
                  : language === "ru"
                  ? `Сканируются склады Uzum Market, Texnomart, MediaPark, Asaxiy: «${query}»`
                  : `Scanning live stock, pricing & warranties across Uzum, Texnomart, MediaPark, Asaxiy & Tashkent hubs: “${query}”`}
              </p>
            </div>

            {/* Stepper live store badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 max-w-xl mx-auto relative z-10 text-xs">
              <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/60 text-purple-950 dark:text-purple-300 font-semibold flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping" />
                <span>Uzum Market</span>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800/60 text-rose-950 dark:text-rose-300 font-semibold flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                <span>Texnomart</span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-950 dark:text-emerald-300 font-semibold flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                <span>MediaPark</span>
              </div>
              <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-800/60 text-sky-950 dark:text-sky-300 font-semibold flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-600 animate-ping" />
                <span>Asaxiy.uz</span>
              </div>
            </div>

            <div className="flex justify-center items-center gap-2 pt-1 text-xs text-slate-500 dark:text-slate-400 font-medium relative z-10">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>
                {language === "uz"
                  ? "Haqiqiy UZS narxlari, 30 kunlik dinamika va yetkazib berish muddati tahlil qilinmoqda..."
                  : language === "ru"
                  ? "Анализ реальных цен UZS, 30-дневной динамики и сроков доставки..."
                  : "Verifying authentic UZS quotes, 30-day price trends, and express delivery SLAs..."}
              </span>
            </div>
          </div>

          <CuteSearchAnimals />
          
          <ResearchSkeleton />
        </div>
      )}

      {/* Results Header with Category Filter Tabs & Refinement Chips */}
      {mutation.isSuccess && filteredData && (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  <Link href="/" className="hover:text-amber-600 dark:hover:text-amber-400 transition">
                    {language === "uz" ? "Asosiy" : language === "ru" ? "Главная" : "Home"}
                  </Link>
                  <span>/</span>
                  <span>{language === "uz" ? "Qidiruv" : language === "ru" ? "Поиск" : "Search"}</span>
                </div>
                <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">
                  {language === "uz"
                    ? `Tadqiqot natijalari: “`
                    : language === "ru"
                    ? `Результаты исследования: «`
                    : `Research Results for: “`}
                  <span className="text-amber-600 dark:text-amber-400">{query}</span>
                  {language === "ru" ? "»" : "”"}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <TrendingDown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    {language === "uz"
                      ? `Eng arzonidan boshlab tartiblangan (${filteredData.products.length} ta mahsulot)`
                      : language === "ru"
                      ? `Отсортировано по возрастанию цены (${filteredData.products.length} товаров)`
                      : `Sorted from Lowest Price First (${filteredData.products.length} verified products)`}
                  </span>
                </div>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex flex-wrap gap-1.5 bg-amber-100/70 dark:bg-slate-800/80 p-1 rounded-2xl text-xs font-bold border border-amber-300/70 dark:border-slate-700">
                {[
                  {
                    key: "all",
                    label: language === "uz" ? "Barchasi" : language === "ru" ? "Все" : "All Results",
                  },
                  {
                    key: "best_overall",
                    label: language === "uz" ? "Top Tanlov" : language === "ru" ? "Лучший выбор" : "Best Overall",
                  },
                  {
                    key: "best_value",
                    label: language === "uz" ? "Eng Foydali" : language === "ru" ? "Выгодный" : "Best Value",
                  },
                  {
                    key: "cheapest",
                    label: language === "uz" ? "Hamyonbop" : language === "ru" ? "Самый доступный" : "Lowest Price",
                  },
                  {
                    key: "premium",
                    label: language === "uz" ? "Premium" : language === "ru" ? "Премиум" : "Luxury Tier",
                  },
                  {
                    key: "most_unique",
                    label: language === "uz" ? "Noyob" : language === "ru" ? "Уникальный" : "Unique",
                  },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => {
                      cyberSound.playClick();
                      setActiveFilter(tab.key);
                    }}
                    className={`px-3 py-1.5 rounded-xl transition cursor-pointer active:scale-95 ${
                      activeFilter === tab.key
                        ? "bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white shadow-xs font-black"
                        : "text-amber-950 dark:text-slate-300 hover:text-black dark:hover:text-white hover:bg-amber-200/50 dark:hover:bg-slate-700/50"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Research Refinement Chips */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{language === "uz" ? "AI Aniqlashtirish:" : language === "ru" ? "AI Уточнение:" : "AI Refine:"}</span>
              </span>
              {refinementSuggestions.map((item, idx) => {
                const Icon = item.icon;
                const label = language === "uz" ? item.labelUz : language === "ru" ? item.labelRu : item.labelEn;
                const suffix = language === "uz" ? item.suffixUz : language === "ru" ? item.suffixRu : item.suffixEn;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      cyberSound.playClick();
                      handleRefine(suffix);
                    }}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition shadow-xs hover:scale-105 active:scale-95 cursor-pointer ${item.chipClass}`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${item.iconClass}`} />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>

            {/* Filter & Sort Controls Toolbar */}
            <div className="card-luxury bg-gradient-to-b from-white via-[#fcfaf5] to-[#f7f2e4] dark:from-[#10121d] dark:to-[#090b12] p-3.5 rounded-2xl border-2 border-amber-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs shadow-luxury">
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Store Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-700 dark:text-slate-400 font-bold">
                    {language === "uz" ? "Do'kon:" : language === "ru" ? "Магазин:" : "Store:"}
                  </span>
                  <select
                    value={selectedStore}
                    onChange={(e) => {
                      cyberSound.playClick();
                      setSelectedStore(e.target.value);
                    }}
                    className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-amber-300/80 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-amber-500/30 cursor-pointer"
                  >
                    <option value="all">
                      {language === "uz" ? "Barcha do'konlar" : language === "ru" ? "Все магазины" : "All Stores"}
                    </option>
                    <option value="uzum">Uzum Market</option>
                    <option value="olcha">Olcha</option>
                    <option value="texnomart">Texnomart</option>
                    <option value="mediapark">MediaPark</option>
                    <option value="asaxiy">Asaxiy</option>
                    <option value="idea">Idea Store</option>
                    <option value="istore">iStore Tashkent</option>
                    <option value="craft bazaar">Craft Bazaar</option>
                  </select>
                </div>

                {/* Price Bracket Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-700 dark:text-slate-400 font-bold">
                    {language === "uz" ? "Narx:" : language === "ru" ? "Цена:" : "Price:"}
                  </span>
                  <select
                    value={priceBracket}
                    onChange={(e) => {
                      cyberSound.playClick();
                      setPriceBracket(e.target.value);
                    }}
                    className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-amber-300/80 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-amber-500/30 cursor-pointer"
                  >
                    <option value="all">
                      {language === "uz" ? "Barcha narxlar" : language === "ru" ? "Все диапазоны" : "All Price Ranges"}
                    </option>
                    <option value="under_1m">&lt; 1,000,000 UZS</option>
                    <option value="1m_3m">1,000,000 - 3,000,000 UZS</option>
                    <option value="3m_7m">3,000,000 - 7,000,000 UZS</option>
                    <option value="7m_15m">7,000,000 - 15,000,000 UZS</option>
                    <option value="over_15m">&gt; 15,000,000 UZS</option>
                  </select>
                </div>
              </div>

              {/* Sort By */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-700 dark:text-slate-400 font-bold flex items-center gap-1">
                  <ArrowUpDown className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  <span>{language === "uz" ? "Tartib:" : language === "ru" ? "Сортировка:" : "Sort:"}</span>
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    cyberSound.playClick();
                    setSortBy(e.target.value);
                  }}
                  className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-amber-300/80 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-amber-500/30 cursor-pointer"
                >
                  <option value="price_asc">
                    {language === "uz"
                      ? "Arzondan qimmatga (Eng arzon)"
                      : language === "ru"
                      ? "Сначала дешёвые"
                      : "Price: Low to High (Cheapest First)"}
                  </option>
                  <option value="ai_relevance">
                    {language === "uz" ? "AI Tavsiyasi" : language === "ru" ? "Рекомендация AI" : "AI Optimal Match"}
                  </option>
                  <option value="price_desc">
                    {language === "uz"
                      ? "Qimmatdan arzonga"
                      : language === "ru"
                      ? "Сначала дорогие"
                      : "Price: High to Low (Premium)"}
                  </option>
                  <option value="discount">
                    {language === "uz"
                      ? "Eng katta chegirma"
                      : language === "ru"
                      ? "Самая большая скидка"
                      : "Highest % Discount"}
                  </option>
                  <option value="rating">
                    {language === "uz"
                      ? "Mijozlar reytingi"
                      : language === "ru"
                      ? "Рейтинг покупателей"
                      : "Customer Rating (High to Low)"}
                  </option>
                </select>
              </div>
            </div>
          </div>

          {filteredData.products.length === 0 ? (
            <div className="bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:via-[#0c0e18] dark:to-[#07090f] rounded-3xl p-10 sm:p-12 text-center border-2 border-amber-300/80 dark:border-amber-500/25 max-w-md mx-auto space-y-4 shadow-luxury animate-fade-in">
              <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/40 border border-amber-300/60 dark:border-amber-800 rounded-2xl flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400">
                <ShoppingBag className="w-8 h-8 stroke-[2.2]" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-black text-slate-900 dark:text-white text-lg">
                  {language === "uz"
                    ? "Tanlangan filtrlarga mos mahsulot topilmadi"
                    : language === "ru"
                    ? "Товары по выбранным фильтрам не найдены"
                    : "No products matched the current filters"}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                  {language === "uz"
                    ? "Do'kon yoki narx chegaralarini kengaytiring yoki barcha filtrlarni qayta tiklang."
                    : language === "ru"
                    ? "Попробуйте расширить диапазон цен или сбросить фильтры."
                    : "Try expanding your price range or resetting store filters to see full market inventory."}
                </p>
              </div>
              <button
                onClick={() => {
                  cyberSound.playClick();
                  setSelectedStore("all");
                  setPriceBracket("all");
                  setActiveFilter("all");
                }}
                className="px-6 py-2.5 btn-luxury-gold text-slate-950 font-black rounded-xl text-xs transition shadow-md active:scale-95 cursor-pointer"
              >
                {language === "uz" ? "Filtrlarni tozalash" : language === "ru" ? "Сбросить фильтры" : "Reset All Filters"}
              </button>
            </div>
          ) : (
            <ResearchResults result={filteredData} />
          )}
        </div>
      )}

      {/* Error State */}
      {mutation.isError && (
        <div className="max-w-md mx-auto text-center py-12 bg-gradient-to-br from-white via-[#fff8f8] to-[#fcf2f2] dark:from-[#180f14] dark:via-[#140b10] dark:to-[#0d070a] rounded-3xl border-2 border-rose-300/80 dark:border-rose-500/30 p-8 space-y-4 shadow-luxury animate-fade-in">
          <div className="w-14 h-14 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto border border-rose-200 dark:border-rose-800">
            <AlertCircle className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white">
              {language === "uz"
                ? "Tadqiqotda Kutilmagan Uzilish"
                : language === "ru"
                ? "Ошибка при поиске"
                : "Research Stream Interrupted"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {(mutation.error as any)?.message ||
                (language === "uz"
                  ? "Qidiruv serveriga ulanishda xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring."
                  : language === "ru"
                  ? "Произошла ошибка при обращении к серверу поиска. Пожалуйста, попробуйте снова."
                  : "An error occurred contacting live retail scanners. Please check connectivity and retry.")}
            </p>
          </div>
          <button
            onClick={() => {
              cyberSound.playClick();
              mutation.mutate(query);
            }}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 text-xs font-black rounded-xl transition flex items-center gap-2 mx-auto shadow-md cursor-pointer active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>{language === "uz" ? "Qaytadan tadqiq qilish" : language === "ru" ? "Повторить поиск" : "Rerun Research Query"}</span>
          </button>
        </div>
      )}

      {/* Empty Initial State */}
      {!mutation.isPending && !mutation.data && !mutation.isError && (
        <div className="text-center py-20 text-slate-400 space-y-4">
          <div className="w-16 h-16 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-3xl flex items-center justify-center mx-auto border border-indigo-100 dark:border-indigo-900 text-indigo-500 dark:text-indigo-400">
            <Sparkles className="w-8 h-8 stroke-[2.2]" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="font-display font-bold text-xl text-slate-700 dark:text-slate-200">
              {language === "uz"
                ? "AI Xarid Tadqiqotini Boshlang"
                : language === "ru"
                ? "Начните AI исследование покупок"
                : "Launch AI Retail Telemetry"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === "uz"
                ? 'Yuqoridagi qidiruv paneliga istalgan mahsulot nomini kiriting: masalan, "AirPods Pro", "Kofe mashinasi", yoki "To\'y sovg\'asi 700 ming gacha".'
                : language === "ru"
                ? 'Введите любой запрос в строку выше: например, "AirPods Pro", "Кофемашина" или "Свадебный подарок до 700 тыс".'
                : 'Enter any item in the search field above: e.g. "AirPods Pro", "Espresso Machine", or "Wedding gift under 700k".'}
            </p>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
