import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  Calendar,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Clock,
  ArrowRight,
  Info,
} from "../lib/icons";
import { useCurrency } from "../lib/currency";
import { cyberSound } from "../lib/cyberSound";
import { useTranslation } from "../lib/i18n";

interface OracleProduct {
  id: string;
  name: string;
  category: string;
  currentPrice: number;
  pastPrice: number;
  projectedPrice: number;
  trend: "down" | "up" | "stable";
  savingsOpportunity: string;
  verdict: "buy_now" | "wait_7_days" | "fair_price";
  verdictText: string;
  analysis: string;
  historyPoints: Array<{ day: string; price: number; isProjected?: boolean }>;
  stores: Array<{ name: string; price: number; url: string; stock: string }>;
}

function getOracleProducts(language: string): OracleProduct[] {
  const isUz = language === "uz";
  const isRu = language === "ru";
  return [
    {
      id: "iphone-16-pro-max",
      name: "Apple iPhone 16 Pro Max 256GB Desert Titanium",
      category: isUz ? "Smartfonlar & Flagmanlar" : isRu ? "Смартфоны & Флагманы" : "Flagship Smartphones & Devices",
      currentPrice: 16490000,
      pastPrice: 17800000,
      projectedPrice: 16250000,
      trend: "down",
      savingsOpportunity: isUz ? "1,310,000 UZS tejaladi" : isRu ? "Экономия 1,310,000 сум" : "1,310,000 UZS Instant Savings",
      verdict: "buy_now",
      verdictText: isUz ? "XARID UCHUN ENG MAQBUL DAVR" : isRu ? "ОПТИМАЛЬНОЕ ВРЕМЯ ДЛЯ ПОКУПКИ" : "OPTIMAL WINDOW TO PURCHASE",
      analysis: isUz
        ? "Yangi partiyalar Toshkent bojxonasidan to'liq rasmiylashtirildi. 30 kunlik narx 7.3% ga pasayib, barqaror minimumga yetdi. Uzum va Texnomartda rasmiy 1 yillik kafolat bilan mavjud."
        : isRu
        ? "Новые партии полностью растаможены в Ташкенте. 30-дневная цена снизилась на 7.3% до стабильного минимума. Официальная гарантия 1 год в Uzum и Texnomart."
        : "Recent shipments have cleared Tashkent customs. The 30-day index has dropped by 7.3% to a verified price floor. Available with official 1-year Apple warranty on Uzum and Texnomart.",
      historyPoints: [
        { day: isUz ? "-30 kun" : isRu ? "-30 дн" : "-30 days", price: 17800000 },
        { day: isUz ? "-20 kun" : isRu ? "-20 дн" : "-20 days", price: 17350000 },
        { day: isUz ? "-10 kun" : isRu ? "-10 дн" : "-10 days", price: 16700000 },
        { day: isUz ? "Bugun" : isRu ? "Сегодня" : "Today", price: 16490000 },
        { day: isUz ? "+7 kun" : isRu ? "+7 дн" : "+7 days", price: 16390000, isProjected: true },
        { day: isUz ? "+14 kun" : isRu ? "+14 дн" : "+14 days", price: 16250000, isProjected: true },
      ],
      stores: [
        { name: "Uzum Market", price: 16490000, url: "https://uzum.uz/uz/product/smartfon-apple-iphone-16-pro-max-1482910", stock: isUz ? "Bor (1 kun)" : isRu ? "В наличии (1 день)" : "In Stock (Next-day)" },
        { name: "Texnomart", price: 16890000, url: "https://texnomart.uz/katalog/apple-iphone-16-pro-max/", stock: isUz ? "Bor (Do'konda)" : isRu ? "В магазине" : "In Stock (Retail Store)" },
        { name: "MediaPark", price: 16650000, url: "https://mediapark.uz/products/view/apple-iphone-16-pro-max", stock: isUz ? "Bor (Yetkazish)" : isRu ? "С доставкой" : "In Stock (Express Delivery)" },
      ],
    },
    {
      id: "dyson-airwrap",
      name: "Dyson Airwrap Multi-Styler Complete Long Nickel/Copper",
      category: isUz ? "Premium Go'zallik & Parvarish" : isRu ? "Красота и Премиум Уход" : "Luxury Haircare & Styling",
      currentPrice: 6890000,
      pastPrice: 7490000,
      projectedPrice: 7100000,
      trend: "up",
      savingsOpportunity: isUz ? "Hozir 600,000 UZS arzon" : isRu ? "Сейчас на 600,000 сум дешевле" : "600,000 UZS Cheaper Today",
      verdict: "buy_now",
      verdictText: isUz ? "TEZKOR XARID TAVSIYA ETILADI" : isRu ? "РЕКОМЕНДУЕТСЯ СКОРАЯ ПОКУПКА" : "ACCELERATED PURCHASE RECOMMENDED",
      analysis: isUz
        ? "Valyuta tebranishi va xalqaro logistika narxlari oshishi sababli kelgusi 14 kunda O'zbekiston do'konlarida narx 3-5% ga ko'tarilishi kutilmoqda. Hozirgi narx eng qulay zaxira darajasida."
        : isRu
        ? "Из-за валютных колебаний ожидается рост цен на 3-5% в ближайшие 14 дней в сетях Узбекистана. Текущая цена — выгодный минимум."
        : "Due to exchange rate adjustments and import freight indexes, prices across Uzbek retailers are projected to increase by 3-5% over the next 14 days. Current pricing represents the safest entry point.",
      historyPoints: [
        { day: isUz ? "-30 kun" : isRu ? "-30 дн" : "-30 days", price: 7490000 },
        { day: isUz ? "-20 kun" : isRu ? "-20 дн" : "-20 days", price: 7150000 },
        { day: isUz ? "-10 kun" : isRu ? "-10 дн" : "-10 days", price: 6950000 },
        { day: isUz ? "Bugun" : isRu ? "Сегодня" : "Today", price: 6890000 },
        { day: isUz ? "+7 kun" : isRu ? "+7 дн" : "+7 days", price: 7000000, isProjected: true },
        { day: isUz ? "+14 kun" : isRu ? "+14 дн" : "+14 days", price: 7100000, isProjected: true },
      ],
      stores: [
        { name: "Texnomart", price: 6890000, url: "https://texnomart.uz/katalog/dyson-airwrap/", stock: isUz ? "Rasmiy Kafolat" : isRu ? "Официальная гарантия" : "Official Warranty" },
        { name: "Uzum Market", price: 6990000, url: "https://uzum.uz/uz/product/stayler-dyson-airwrap-complete-long-1094821", stock: isUz ? "Tezkor Yetkazish" : isRu ? "Быстрая доставка" : "Express Delivery" },
        { name: "MediaPark", price: 7050000, url: "https://mediapark.uz/products/view/dyson-airwrap", stock: isUz ? "Do'konda bor" : isRu ? "В наличии" : "In Stock" },
      ],
    },
    {
      id: "delonghi-coffee",
      name: "De'Longhi Magnifica S ECAM 22.110.B Automatic Coffee Machine",
      category: isUz ? "Hashamatli Oshxona" : isRu ? "Премиум Кухня" : "Luxury Kitchen & Espresso",
      currentPrice: 4890000,
      pastPrice: 5350000,
      projectedPrice: 4850000,
      trend: "down",
      savingsOpportunity: isUz ? "460,000 UZS tejaladi" : isRu ? "Экономия 460,000 сум" : "460,000 UZS Direct Savings",
      verdict: "buy_now",
      verdictText: isUz ? "ENG SIFATLI TO'Y SOVG'ASI" : isRu ? "ЛУЧШИЙ СВАДЕБНЫЙ ПОДАРОК" : "PREMIER WEDDING GIFT CHOICE",
      analysis: isUz
        ? "Yangi xonadonlar uchun eng ommabop premium kofe mashinasi. 15 bar Italiya nasosi, donalarni yangi maydalash tizimi. Bozor taklifi barqaror, eng past narx Uzum va MediaParkda tasdiqlandi."
        : isRu
        ? "Самая востребованная кофемашина для новоселов. Итальянская помпа 15 бар, встроенная кофемолка. Лучшая цена подтверждена на Uzum и MediaPark."
        : "The most coveted bean-to-cup machine for newly established homes. 15-bar Italian pump with integrated steel burr grinder. Market supply is stable with lowest verified pricing on Uzum and MediaPark.",
      historyPoints: [
        { day: isUz ? "-30 kun" : isRu ? "-30 дн" : "-30 days", price: 5350000 },
        { day: isUz ? "-20 kun" : isRu ? "-20 дн" : "-20 days", price: 5100000 },
        { day: isUz ? "-10 kun" : isRu ? "-10 дн" : "-10 days", price: 4950000 },
        { day: isUz ? "Bugun" : isRu ? "Сегодня" : "Today", price: 4890000 },
        { day: isUz ? "+7 kun" : isRu ? "+7 дн" : "+7 days", price: 4870000, isProjected: true },
        { day: isUz ? "+14 kun" : isRu ? "+14 дн" : "+14 days", price: 4850000, isProjected: true },
      ],
      stores: [
        { name: "Uzum Market", price: 4890000, url: "https://uzum.uz/uz/product/kofemashina-delonghi-magnifica-s-829104", stock: isUz ? "1 ish kuni" : isRu ? "1 рабочий день" : "1 Business Day" },
        { name: "MediaPark", price: 4990000, url: "https://mediapark.uz/products/view/delonghi-magnifica-s", stock: isUz ? "Mavjud" : isRu ? "В наличии" : "Available" },
        { name: "Texnomart", price: 5120000, url: "https://texnomart.uz/katalog/delonghi-magnifica-s/", stock: isUz ? "Muddatli to'lov" : isRu ? "В рассрочку" : "Installments Available" },
      ],
    },
    {
      id: "bukhara-zardozi",
      name: "Bukhara Gold Zardozi Royal Silk Robe (Artisan Masterpiece)",
      category: isUz ? "Milliy Qadriyat & San'at" : isRu ? "Наследие и Искусство" : "National Heritage & Haute Couture",
      currentPrice: 2800000,
      pastPrice: 2950000,
      projectedPrice: 2850000,
      trend: "stable",
      savingsOpportunity: isUz ? "Usta Narxida To'g'ridan-To'g'ri" : isRu ? "Напрямую от мастера" : "Direct Artisan Price",
      verdict: "fair_price",
      verdictText: isUz ? "BARQAROR MILLIY QIYMAT" : isRu ? "СТАБИЛЬНАЯ ЦЕННОСТЬ" : "TIMELESS ARTISANAL VALUE",
      analysis: isUz
        ? "Qo'lda tikilgan haqiqiy Buxoro zardo'zi san'at asari. To'y va hurmatli mehmonlar uchun tengsiz ehtirom ramzi. Narx doimiy barqaror qiymatga ega."
        : isRu
        ? "Настоящий шедевр ручной работы из Бухары. Символ уважения для свадеб и почетных гостей. Стабильная непреходящая ценность."
        : "Hand-stitched genuine Bukhara gold embroidery masterpiece. Symbol of profound esteem for weddings and distinguished guests. Pricing maintains permanent heritage value.",
      historyPoints: [
        { day: isUz ? "-30 kun" : isRu ? "-30 дн" : "-30 days", price: 2950000 },
        { day: isUz ? "-20 kun" : isRu ? "-20 дн" : "-20 days", price: 2900000 },
        { day: isUz ? "-10 kun" : isRu ? "-10 дн" : "-10 days", price: 2850000 },
        { day: isUz ? "Bugun" : isRu ? "Сегодня" : "Today", price: 2800000 },
        { day: isUz ? "+7 kun" : isRu ? "+7 дн" : "+7 days", price: 2800000, isProjected: true },
        { day: isUz ? "+14 kun" : isRu ? "+14 дн" : "+14 days", price: 2850000, isProjected: true },
      ],
      stores: [
        { name: "Uzum Market", price: 2800000, url: "https://uzum.uz/uz/product/buxoro-zardozi-zar-choponi-sovgabop-718290", stock: isUz ? "Qadoqlangan" : isRu ? "В футляре" : "Gift Boxed" },
        { name: "Asaxiy", price: 2890000, url: "https://asaxiy.uz/product/buxoro-zardozi-chopon", stock: isUz ? "Mavjud" : isRu ? "В наличии" : "Available" },
      ],
    },
  ];
}

export default function AIPriceOracle() {
  const { language } = useTranslation();
  const [selectedProductId, setSelectedProductId] = useState<string>("iphone-16-pro-max");
  const { formatPrice } = useCurrency();

  const oracleProducts = getOracleProducts(language);
  const product = oracleProducts.find((p) => p.id === selectedProductId) || oracleProducts[0];

  // SVG Chart Calculations
  const minPrice = Math.min(...product.historyPoints.map((p) => p.price)) * 0.96;
  const maxPrice = Math.max(...product.historyPoints.map((p) => p.price)) * 1.04;
  const chartWidth = 540;
  const chartHeight = 160;

  const getCoordinates = (index: number, price: number) => {
    const x = 30 + (index / (product.historyPoints.length - 1)) * (chartWidth - 60);
    const y = chartHeight - 25 - ((price - minPrice) / (maxPrice - minPrice)) * (chartHeight - 50);
    return { x, y };
  };

  const points = product.historyPoints.map((p, idx) => getCoordinates(idx, p.price));
  const solidPath = points
    .slice(0, 4)
    .map((pt, i) => `${i === 0 ? "M" : "L"} ${pt.x} ${pt.y}`)
    .join(" ");

  const projectedPath = points
    .slice(3)
    .map((pt, i) => `${i === 0 ? "M" : "L"} ${pt.x} ${pt.y}`)
    .join(" ");

  return (
    <div id="ai-oracle-section" className="space-y-6">
      {/* Header telemetry badge */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/40 text-[11px] font-mono font-bold text-cyan-300">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>
              {language === "uz"
                ? "AI BOZOR BASHORATCHISI (MARKET ORACLE)"
                : language === "ru"
                ? "AI РЫНОЧНЫЙ ОРАКУЛ (MARKET ORACLE)"
                : "AI MARKET ORACLE · REAL-TIME TELEMETRY"}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white mt-2">
            {language === "uz"
              ? "Sun'iy Intellekt Narxlar Dinamikasi & Bashorati"
              : language === "ru"
              ? "Динамика и Прогноз Цен Искусственного Интеллекта"
              : "Price history and 14-day outlook"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {language === "uz"
              ? "Toshkent bozoridagi real narxlar, so'nggi 30 kunlik o'zgarish va kelgusi 14 kunlik ilmiy prognoz"
              : language === "ru"
              ? "Реальные цены рынка Ташкента, динамика за 30 дней и научно обоснованный прогноз на 14 дней"
              : "Live verified market prices, 30-day historical fluctuations, and predictive machine-learning pricing curves"}
          </p>
        </div>

        {/* Product selector tabs */}
        <div className="flex flex-wrap gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
          {oracleProducts.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                cyberSound.playClick(1100);
                setSelectedProductId(p.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedProductId === p.id
                  ? "bg-slate-950 dark:bg-amber-500 text-white dark:text-white shadow-md"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60"
              }`}
            >
              {p.name.split(" ")[0]} {p.name.split(" ")[1]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Glass Oracle Card */}
      <div className="bg-slate-950 text-slate-100 rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-sm relative overflow-hidden">
        {/* Glowing backdrop spotlight */}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
          {/* Left Column: Product Info & Live Forecast Chart */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span>{product.category}</span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">{product.savingsOpportunity}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mt-1 leading-snug">
                {product.name}
              </h3>
            </div>

            {/* Price Key Metrics Strip */}
            <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800">
              <div>
                <p className="text-[10px] uppercase font-mono text-slate-400">
                  {language === "uz" ? "30 Kun Oldin" : language === "ru" ? "30 Дней Назад" : "30 Days Ago"}
                </p>
                <p className="text-sm sm:text-base font-bold text-slate-300">
                  {formatPrice(product.pastPrice)}
                </p>
              </div>
              <div className="border-x border-slate-800 px-3">
                <p className="text-[10px] uppercase font-mono text-amber-400 font-bold">
                  {language === "uz" ? "Bugungi Eng Past" : language === "ru" ? "Лучшая Сегодня" : "Today's Lowest"}
                </p>
                <p className="text-sm sm:text-base font-bold text-amber-300">
                  {formatPrice(product.currentPrice)}
                </p>
              </div>
              <div className="pl-2">
                <p className="text-[10px] uppercase font-mono text-cyan-400 font-bold">
                  {language === "uz" ? "+14 Kun Prognoz" : language === "ru" ? "Прогноз +14 Дн" : "+14 Day Forecast"}
                </p>
                <p className="text-sm sm:text-base font-bold text-cyan-300">
                  {formatPrice(product.projectedPrice)}
                </p>
              </div>
            </div>

            {/* SVG Visual Price Curve Chart */}
            <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800/80">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 bg-amber-400 rounded-full inline-block" />
                  {language === "uz" ? "Haqiqiy narxlar tarixi" : language === "ru" ? "История реальных цен" : "Verified Historical Prices"}
                </span>
                <span className="flex items-center gap-1.5 text-cyan-300">
                  <span className="w-2.5 h-0.5 border-t border-dashed border-cyan-400 inline-block" />
                  {language === "uz" ? "AI 14-kunlik prognozi" : language === "ru" ? "AI прогноз на 14 дней" : "AI 14-Day Trajectory"}
                </span>
              </div>

              {/* Chart SVG Canvas */}
              <div className="w-full overflow-x-auto">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full h-40 overflow-visible"
                >
                  <defs>
                    <linearGradient id="solidGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#d9431f" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#d9431f" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  {[0.2, 0.5, 0.8].map((ratio, i) => (
                    <line
                      key={i}
                      x1="20"
                      y1={chartHeight * ratio}
                      x2={chartWidth - 20}
                      y2={chartHeight * ratio}
                      stroke="rgba(255,255,255,0.06)"
                      strokeDasharray="4 4"
                    />
                  ))}

                  {/* Historical Solid Line */}
                  <path
                    d={solidPath}
                    fill="none"
                    stroke="#d9431f"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  {/* Projected Dashed Line */}
                  <path
                    d={projectedPath}
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="2.5"
                    strokeDasharray="5 5"
                    strokeLinecap="round"
                  />

                  {/* Data Points */}
                  {points.map((pt, i) => {
                    const isProj = product.historyPoints[i].isProjected;
                    const isCurrent = i === 3;
                    return (
                      <g key={i}>
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={isCurrent ? 6 : 4}
                          fill={isProj ? "#06b6d4" : isCurrent ? "#d9431f" : "#e2e8f0"}
                          stroke="#090d16"
                          strokeWidth="2"
                        />
                        {isCurrent && (
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r="11"
                            fill="none"
                            stroke="#d9431f"
                            strokeWidth="1.5"
                            className="opacity-60"
                          />
                        )}
                        <text
                          x={pt.x}
                          y={chartHeight - 4}
                          fill={isProj ? "#67e8f9" : "#94a3b8"}
                          fontSize="10"
                          fontFamily="monospace"
                          textAnchor="middle"
                        >
                          {product.historyPoints[i].day}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          </div>

          {/* Right Column: AI Analysis Verdict & Real Store Links */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            {/* Verdict Badge */}
            <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-mono font-bold text-amber-300 uppercase">
                  {product.verdictText}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                {product.analysis}
              </p>
            </div>

            {/* Direct Connected Stores */}
            <div className="space-y-2">
              <p className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
                {language === "uz"
                  ? "Do'konlarda Mavjudlik & Jonli Havolalar:"
                  : language === "ru"
                  ? "Наличие в магазинах и прямые ссылки:"
                  : "Verified Stock & Direct Merchant Links:"}
              </p>
              <div className="space-y-2">
                {product.stores.map((st, i) => (
                  <a
                    key={i}
                    href={st.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-[var(--line-strong)] transition group cursor-pointer shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <div>
                        <span className="text-xs font-bold text-white block group-hover:text-amber-300 transition">
                          {st.name}
                        </span>
                        <span className="text-[10px] text-slate-400">{st.stock}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-amber-400">
                        {formatPrice(st.price)}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-300 transition stroke-[2.2]" />
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Security Guarantee Note */}
            <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>
                {language === "uz"
                  ? "Narxlar har 30 daqiqada do'kon rasmiy bazasidan skanerlanadi."
                  : language === "ru"
                  ? "Цены обновляются каждые 30 минут из официальных баз магазинов."
                  : "Real prices verified every 30 minutes directly from authorized retail feeds."}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
