import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation, useSearch, Link } from "wouter";
import { useTranslation, tr } from "../lib/i18n";
import { research } from "../lib/api";
import { cyberSound } from "../lib/cyberSound";
import SearchBar from "../components/SearchBar";
import ResearchResults, { ResearchSkeleton } from "../components/ResearchResults";
import CuteSearchAnimals from "../components/CuteSearchAnimals";
import {
  Sparkles,
  AlertCircle,
  Search,
  ArrowUpRight,
  RefreshCw,
  Zap,
  TrendingDown,
  CreditCard,
  Crown,
  Tag,
  ArrowUpDown,
  ShoppingBag,
} from "../lib/icons";

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
    chipClass: "bg-[var(--white)] text-[var(--ink)] border-[var(--rule-soft)] hover:border-[var(--line-hover)] hover:bg-[var(--paper-2)]",
    iconClass: "text-[var(--muted)]",
  },
  {
    labelEn: "Value & Budget Alternatives",
    labelUz: "Arzonroq muqobillar",
    labelRu: "Выгодные альтернативы",
    suffixEn: " affordable high-quality alternatives",
    suffixUz: " arzonroq sifatli variantlar",
    suffixRu: " доступные качественные альтернативы",
    icon: TrendingDown,
    chipClass: "bg-[var(--white)] text-[var(--ink)] border-[var(--rule-soft)] hover:border-[var(--line-hover)] hover:bg-[var(--paper-2)]",
    iconClass: "text-[var(--muted)]",
  },
  {
    labelEn: "0% Halol Installments (Nasiya)",
    labelUz: "Nasiya / Bo'lib to'lash",
    labelRu: "Рассрочка без переплат",
    suffixEn: " 0% installments Uzum Nasiya",
    suffixUz: " Uzum Nasiya bo'lib to'lash bilan",
    suffixRu: " в рассрочку без переплат Uzum Nasiya",
    icon: CreditCard,
    chipClass: "bg-[var(--white)] text-[var(--ink)] border-[var(--rule-soft)] hover:border-[var(--line-hover)] hover:bg-[var(--paper-2)]",
    iconClass: "text-[var(--muted)]",
  },
  {
    labelEn: "Ultra-Premium Tier",
    labelUz: "Premium variantlar",
    labelRu: "Премиум класс",
    suffixEn: " top-tier premium authentic flagship",
    suffixUz: " eng sifatli premium model",
    suffixRu: " премиум флагман оригинал",
    icon: Crown,
    chipClass: "bg-[var(--white)] text-[var(--ink)] border-[var(--rule-soft)] hover:border-[var(--line-hover)] hover:bg-[var(--paper-2)]",
    iconClass: "text-[var(--muted)]",
  },
  {
    labelEn: "Deepest Discounts & Promos",
    labelUz: "Katta chegirmalar",
    labelRu: "Максимальные скидки",
    suffixEn: " biggest verified sale discount",
    suffixUz: " eng katta chegirmadagi aksiya",
    suffixRu: " с максимальной скидкой по акции",
    icon: Tag,
    chipClass: "bg-[var(--white)] text-[var(--ink)] border-[var(--rule-soft)] hover:border-[var(--line-hover)] hover:bg-[var(--paper-2)]",
    iconClass: "text-[var(--muted)]",
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


  const L = (uz: string, ru: string, en: string) => (language === "uz" ? uz : language === "ru" ? ru : en);
  const selectWrap =
    "flex items-center gap-2 h-10 pl-3 pr-1.5 rounded-xl border border-[var(--rule-soft)] bg-[var(--white)] text-[14px] hover:border-[var(--line-hover)] focus-within:border-[var(--anor)] transition min-w-0";
  const selectCls = "flex-1 min-w-0 h-full bg-transparent font-semibold text-[var(--ink)] outline-none cursor-pointer";

  return (
    <div className="min-h-screen bg-[var(--paper)] py-6 sm:py-10 transition-colors">
      <div className="wrap space-y-8 animate-fade-in">
        {/* Search Header Bar */}
        <div className="max-w-3xl">
          <SearchBar
            initialQuery={query}
            onSearch={(newQ) => {
              setQuery(newQ);
              mutation.mutate(newQ);
            }}
          />
        </div>

        {/* Loading state */}
        {mutation.isPending && (
          <div className="space-y-6">
            <div className="max-w-3xl rounded-2xl border border-[var(--rule-soft)] bg-[var(--white)] p-5 sm:p-7">
              <p className="inline-flex items-center gap-2 text-[13px] font-semibold text-[var(--anor)]">
                <span className="relative flex w-2 h-2">
                  <span className="absolute inset-0 rounded-full bg-[var(--anor)] animate-ping opacity-50" />
                  <span className="relative w-2 h-2 rounded-full bg-[var(--anor)]" />
                </span>
                {L("Jonli Bozor Skaneri Ishga Tushirildi", "Сканирование Рынка Запущено", "Live Market Scanner Activated")}
              </p>
              <h2 className="mt-2 font-lux text-[1.5rem] sm:text-[1.9rem] leading-tight text-[var(--ink)]">
                {L("AI Xarid Tadqiqoti Olib Borilmoqda", "Выполняется исследование рынка", "Searching stores…")}
              </h2>
              <p className="mt-2 text-[15px] leading-relaxed text-[var(--ink-2)] max-w-2xl">
                {L(
                  `Uzum Market, Texnomart, MediaPark, Asaxiy va Toshkent omborlari tekshirilmoqda: “${query}”`,
                  `Сканируются склады Uzum Market, Texnomart, MediaPark, Asaxiy: «${query}»`,
                  `Scanning live stock, pricing & warranties across Uzum, Texnomart, MediaPark, Asaxiy & Tashkent hubs: “${query}”`
                )}
              </p>

              <div className="mt-5">
                <CuteSearchAnimals />
              </div>

              <p className="mt-4 text-[13px] text-[var(--ink-2)]">
                {L(
                  "Haqiqiy UZS narxlari, 30 kunlik dinamika va yetkazib berish muddati tahlil qilinmoqda...",
                  "Анализ реальных цен UZS, 30-дневной динамики и сроков доставки...",
                  "Verifying authentic UZS quotes, 30-day price trends, and express delivery SLAs..."
                )}
              </p>
            </div>

            <ResearchSkeleton />
          </div>
        )}

        {/* Results header: title, count, category tabs, refinements, filters */}
        {mutation.isSuccess && filteredData && (
          <div className="space-y-6">
            <div className="space-y-5 pb-6 border-b border-[var(--rule-soft)]">
              <div>
                <nav className="flex items-center gap-1.5 text-[13px] text-[var(--ink-2)] mb-2">
                  <Link href="/" className="hover:text-[var(--anor)] transition">
                    {L("Asosiy", "Главная", "Home")}
                  </Link>
                  <span className="text-[var(--muted)]">/</span>
                  <span>{L("Qidiruv", "Поиск", "Search")}</span>
                </nav>
                <h1 className="font-lux text-[1.75rem] sm:text-[2.5rem] leading-[1.1] text-[var(--ink)] break-words">
                  {L(`Natijalar: “`, `Результаты: «`, `Results for “`)}
                  <span className="text-[var(--anor)]">{query}</span>
                  {language === "ru" ? "»" : "”"}
                </h1>
                <p className="mt-2 inline-flex items-center gap-1.5 text-[14px] text-[var(--ink-2)]">
                  <TrendingDown className="w-4 h-4 text-[var(--ok)]" />
                  {L(
                    `Eng arzonidan boshlab tartiblangan (${filteredData.products.length} ta mahsulot)`,
                    `Отсортировано по возрастанию цены (${filteredData.products.length} товаров)`,
                    `Sorted from lowest price (${filteredData.products.length} products)`
                  )}
                </p>
              </div>

              {/* Category filter pills */}
              <div className="-mx-6 px-6 sm:mx-0 sm:px-0 flex gap-2 overflow-x-auto no-scrollbar sm:flex-wrap">
                {[
                  { key: "all", label: L("Barchasi", "Все", "All Results") },
                  { key: "best_overall", label: L("Top Tanlov", "Лучший выбор", "Best Overall") },
                  { key: "best_value", label: L("Eng Foydali", "Выгодный", "Best Value") },
                  { key: "cheapest", label: L("Hamyonbop", "Самый доступный", "Lowest Price") },
                  { key: "premium", label: L("Premium", "Премиум", "Luxury Tier") },
                  { key: "most_unique", label: L("Noyob", "Уникальный", "Unique") },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => {
                      cyberSound.playClick();
                      setActiveFilter(tab.key);
                    }}
                    className={`shrink-0 h-9 px-4 rounded-full border text-[14px] font-medium transition cursor-pointer ${
                      activeFilter === tab.key
                        ? "bg-[var(--ink)] border-[var(--ink)] text-[var(--paper)]"
                        : "bg-[var(--white)] border-[var(--rule-soft)] text-[var(--ink-2)] hover:text-[var(--ink)] hover:border-[var(--line-hover)]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Refinement suggestions */}
              <div className="space-y-2">
                <p className="flex items-center gap-1.5 text-[13px] font-semibold text-[var(--ink-2)]">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--anor)]" />
                  {L("AI Aniqlashtirish:", "AI Уточнение:", "AI Refine:")}
                </p>
                <div className="-mx-6 px-6 sm:mx-0 sm:px-0 flex gap-2 overflow-x-auto no-scrollbar sm:flex-wrap">
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
                        className={`shrink-0 inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[13px] font-medium border transition cursor-pointer ${item.chipClass}`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${item.iconClass}`} />
                        <span className="whitespace-nowrap">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Filter & sort controls */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center gap-2">
                <label className={`${selectWrap} sm:w-auto`}>
                  <span className="text-[var(--ink-2)] shrink-0">{L("Do'kon:", "Магазин:", "Store:")}</span>
                  <select
                    value={selectedStore}
                    onChange={(e) => {
                      cyberSound.playClick();
                      setSelectedStore(e.target.value);
                    }}
                    className={selectCls}
                  >
                    <option value="all">{L("Barcha do'konlar", "Все магазины", "All Stores")}</option>
                    <option value="uzum">Uzum Market</option>
                    <option value="olcha">Olcha</option>
                    <option value="texnomart">Texnomart</option>
                    <option value="mediapark">MediaPark</option>
                    <option value="asaxiy">Asaxiy</option>
                    <option value="idea">Idea Store</option>
                    <option value="istore">iStore Tashkent</option>
                    <option value="craft bazaar">Craft Bazaar</option>
                  </select>
                </label>

                <label className={`${selectWrap} sm:w-auto`}>
                  <span className="text-[var(--ink-2)] shrink-0">{L("Narx:", "Цена:", "Price:")}</span>
                  <select
                    value={priceBracket}
                    onChange={(e) => {
                      cyberSound.playClick();
                      setPriceBracket(e.target.value);
                    }}
                    className={selectCls}
                  >
                    <option value="all">{L("Barcha narxlar", "Все диапазоны", "All Price Ranges")}</option>
                    <option value="under_1m">&lt; 1,000,000 UZS</option>
                    <option value="1m_3m">1,000,000 - 3,000,000 UZS</option>
                    <option value="3m_7m">3,000,000 - 7,000,000 UZS</option>
                    <option value="7m_15m">7,000,000 - 15,000,000 UZS</option>
                    <option value="over_15m">&gt; 15,000,000 UZS</option>
                  </select>
                </label>

                <label className={`${selectWrap} col-span-2 sm:col-span-1 sm:ml-auto`}>
                  <ArrowUpDown className="w-3.5 h-3.5 text-[var(--muted)] shrink-0" />
                  <span className="text-[var(--ink-2)] shrink-0">{L("Tartib:", "Сортировка:", "Sort:")}</span>
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      cyberSound.playClick();
                      setSortBy(e.target.value);
                    }}
                    className={selectCls}
                  >
                    <option value="price_asc">
                      {L("Arzondan qimmatga (Eng arzon)", "Сначала дешёвые", "Price: Low to High (Cheapest First)")}
                    </option>
                    <option value="ai_relevance">{L("AI Tavsiyasi", "Рекомендация AI", "AI Optimal Match")}</option>
                    <option value="price_desc">{L("Qimmatdan arzonga", "Сначала дорогие", "Price: High to Low (Premium)")}</option>
                    <option value="discount">{L("Eng katta chegirma", "Самая большая скидка", "Highest % Discount")}</option>
                    <option value="rating">{L("Mijozlar reytingi", "Рейтинг покупателей", "Customer Rating (High to Low)")}</option>
                  </select>
                </label>
              </div>
            </div>

            {filteredData.products.length === 0 ? (
              <div className="max-w-lg mx-auto rounded-2xl border border-[var(--rule-soft)] bg-[var(--white)] p-6 sm:p-10 text-center space-y-4 animate-fade-in">
                <span className="tile mx-auto">
                  <ShoppingBag />
                </span>
                <div className="space-y-1.5">
                  <h3 className="font-lux text-[1.25rem] text-[var(--ink)]">
                    {L(
                      "Tanlangan filtrlarga mos mahsulot topilmadi",
                      "Товары по выбранным фильтрам не найдены",
                      "No products matched the current filters"
                    )}
                  </h3>
                  <p className="text-[14px] text-[var(--ink-2)] max-w-sm mx-auto leading-relaxed">
                    {L(
                      "Do'kon yoki narx chegaralarini kengaytiring yoki barcha filtrlarni qayta tiklang.",
                      "Попробуйте расширить диапазон цен или сбросить фильтры.",
                      "Try expanding your price range or resetting store filters to see full market inventory."
                    )}
                  </p>
                </div>
                {selectedStore === "all" && priceBracket === "all" && activeFilter === "all" && (
                  <div className="space-y-2.5">
                    <p className="text-[14px] text-[var(--ink-2)]">
                      {tr(
                        "Olcha va Texnomart'da bu mahsulot topilmadi. Boshqa do'konlarda qidirib ko'ring:",
                        "В Olcha и Texnomart этого товара нет. Поищите в других магазинах:",
                        "Olcha and Texnomart don't have this right now. Try searching other stores:"
                      )}
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {[
                        ["Uzum Market", `https://uzum.uz/uz/search?query=${encodeURIComponent(qParam)}`],
                        ["Asaxiy", `https://asaxiy.uz/product?key=${encodeURIComponent(qParam)}`],
                        ["MediaPark", `https://mediapark.uz/search?q=${encodeURIComponent(qParam)}`],
                        ["Olcha", `https://olcha.uz/oz/search?q=${encodeURIComponent(qParam)}`],
                      ].map(([name, href]) => (
                        <a
                          key={name}
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 h-9 px-3.5 rounded-full border border-[var(--rule-soft)] bg-[var(--white)] text-[13px] font-semibold text-[var(--ink)] hover:border-[var(--line-hover)] transition"
                        >
                          {name} <ArrowUpRight className="w-3.5 h-3.5 text-[var(--anor)]" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                <button
                  onClick={() => {
                    cyberSound.playClick();
                    setSelectedStore("all");
                    setPriceBracket("all");
                    setActiveFilter("all");
                  }}
                  className="btn-primary h-11 px-6 text-[14px]"
                >
                  {L("Filtrlarni tozalash", "Сбросить фильтры", "Reset All Filters")}
                </button>
              </div>
            ) : (
              <ResearchResults result={filteredData} />
            )}
          </div>
        )}

        {/* Error State */}
        {mutation.isError && (
          <div className="max-w-md mx-auto rounded-2xl border border-[var(--rule-soft)] bg-[var(--white)] p-6 sm:p-8 text-center space-y-4 animate-fade-in">
            <span className="mx-auto w-11 h-11 rounded-xl bg-[var(--rose-soft)] text-[var(--rose)] inline-flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </span>
            <div className="space-y-1.5">
              <h3 className="font-lux text-[1.25rem] text-[var(--ink)]">
                {L("Tadqiqotda Kutilmagan Uzilish", "Ошибка при поиске", "Research Stream Interrupted")}
              </h3>
              <p className="text-[14px] text-[var(--ink-2)] leading-relaxed">
                {(mutation.error as any)?.message ||
                  L(
                    "Qidiruv serveriga ulanishda xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.",
                    "Произошла ошибка при обращении к серверу поиска. Пожалуйста, попробуйте снова.",
                    "An error occurred contacting live retail scanners. Please check connectivity and retry."
                  )}
              </p>
            </div>
            <button
              onClick={() => {
                cyberSound.playClick();
                mutation.mutate(query);
              }}
              className="btn-primary h-11 px-6 text-[14px] mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{L("Qaytadan tadqiq qilish", "Повторить поиск", "Rerun Research Query")}</span>
            </button>
          </div>
        )}

        {/* Empty Initial State */}
        {!mutation.isPending && !mutation.data && !mutation.isError && (
          <div className="max-w-md py-12 sm:py-16 space-y-4">
            <span className="tile">
              <Search />
            </span>
            <div className="space-y-1.5">
              <h3 className="font-lux text-[1.5rem] text-[var(--ink)]">
                {L("AI Xarid Tadqiqotini Boshlang", "Начните AI исследование покупок", "Search")}
              </h3>
              <p className="text-[15px] leading-relaxed text-[var(--ink-2)]">
                {L(
                  'Yuqoridagi qidiruv paneliga istalgan mahsulot nomini kiriting: masalan, "AirPods Pro", "Kofe mashinasi", yoki "To\'y sovg\'asi 700 ming gacha".',
                  'Введите любой запрос в строку выше: например, "AirPods Pro", "Кофемашина" или "Свадебный подарок до 700 тыс".',
                  'Enter any item in the search field above: e.g. "AirPods Pro", "Espresso Machine", or "Wedding gift under 700k".'
                )}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
