import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { research, formatPrice } from "../lib/api";
import { ensureProductUrl } from "../lib/urlHelper";
import { useTranslation, tr } from "../lib/i18n";
import {
  Truck,
  MapPin,
  Clock,
  ShieldCheck,
  Building2,
  ExternalLink,
  Search,
  CheckCircle2,
  Navigation,
  CreditCard,
  PhoneCall,
  Sparkles,
  Zap,
} from "../lib/icons";

export default function StoresDeliveryPage() {
  const { language } = useTranslation();
  const [selectedRegionId, setSelectedRegionId] = useState("tashkent-city");
  const [searchStoreQuery, setSearchStoreQuery] = useState("");

  const { data: deliveryData, isLoading } = useQuery({
    queryKey: ["delivery-info", selectedRegionId, language],
    queryFn: () => research.deliveryInfo(selectedRegionId),
  });

  const regionPayload = (deliveryData as any)?.data || deliveryData;
  const selectedRegion = regionPayload?.selectedRegion || {
    regionId: "tashkent-city",
    name: "Toshkent shahri",
    capitalCity: "Toshkent",
    uzumDeliveryDays: "1 kun (bepul PVZ)",
    uzumPvzCount: 160,
    texnomartOption: "3-5 soatda ekspress yoki do'kondan olib ketish",
    mediaParkDays: "1 kunda bepul",
    asaxiyDeliveryDays: "1 kun kuryer",
    expressAvailable: true,
    standardCourierCostUZS: 25000,
    bestStoreRecommended: "Texnomart & Uzum Market",
    logisticsTip: "Shahar bo'ylab 3 soatlik tezkor yetkazish xizmatidan foydalanish mumkin.",
  };

  const allRegions = regionPayload?.allRegions || [];

  const STORES = [
    {
      name: "Uzum Market",
      tagline: tr("O'zbekistondagi eng yirik milliy marketpleys", "Крупнейший маркетплейс Узбекистана", "Uzbekistan's largest marketplace"),
      delivery: tr("1 kunda bepul yetkazib berish (PVZ)", "Бесплатная доставка в пункт выдачи за 1 день", "Free delivery to a pickup point in 1 day"),
      pvz: tr("Respublika bo'ylab 500+ tarqatish punkti", "500+ пунктов выдачи по стране", "500+ pickup points nationwide"),
      warranty: tr("14 kun nuqsonsiz qaytarish, kafolatli do'konlar", "Возврат в течение 14 дней, проверенные продавцы", "14-day returns, verified sellers"),
      installment: tr("Uzum Nasiya (3, 6, 12 oy)", "Uzum Nasiya (3, 6, 12 мес.)", "Uzum Nasiya (3, 6, 12 months)"),
      express: tr("Ertasiga 100% yetkazish", "Доставка на следующий день", "Next-day delivery"),
      trustScore: "9.8 / 10",
      officialUrl: "https://uzum.uz",
      searchUrl: (q: string) => ensureProductUrl(q, "Uzum Market"),
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
      accentBorder: "border-purple-200/80 hover:border-purple-400",
    },
    {
      name: "Texnomart",
      tagline: tr("Maishiy texnika va elektronika rasmiy dileri", "Официальный дилер техники и электроники", "Official appliance and electronics dealer"),
      delivery: tr("Toshkentda 3 soatda ekspress / 1-2 kunda viloyatlar", "Ташкент — экспресс за 3 часа, регионы — 1–2 дня", "Tashkent: express in 3 hours; regions: 1–2 days"),
      pvz: tr("O'zbekiston bo'ylab 35+ katta shourumlar", "35+ шоурумов по стране", "35+ showrooms nationwide"),
      warranty: tr("1 yildan 3 yilgacha rasmiy ishlab chiqaruvchi kafolati", "Официальная гарантия производителя от 1 до 3 лет", "Official manufacturer warranty, 1–3 years"),
      installment: tr("Texnomart Muddatli to'lov (12-24 oy, 0% aksiyalar)", "Рассрочка Texnomart (12–24 мес., акции 0%)", "Texnomart installments (12–24 months, 0% offers)"),
      express: tr("3 soatda eshikkacha", "До двери за 3 часа", "To your door in 3 hours"),
      trustScore: "9.6 / 10",
      officialUrl: "https://texnomart.uz",
      searchUrl: (q: string) => ensureProductUrl(q, "Texnomart"),
      badgeColor: "bg-amber-50 text-amber-700 border-[var(--line)]",
      accentBorder: "border-amber-200/80 hover:border-amber-400",
    },
    {
      name: "MediaPark",
      tagline: tr("Eng katta maishiy texnika gipermarketlari tarmog'i", "Крупнейшая сеть гипермаркетов техники", "Largest chain of appliance hypermarkets"),
      delivery: tr("Toshkentda 24 soat, viloyatlarga 2-3 kun", "Ташкент — 24 часа, регионы — 2–3 дня", "Tashkent: 24 hours; regions: 2–3 days"),
      pvz: tr("28+ gipermarket va servis markazlari", "28+ гипермаркетов и сервисных центров", "28+ hypermarkets and service centres"),
      warranty: tr("Rasmiy servis kafolati va professional o'rnatib berish", "Официальная сервисная гарантия и установка", "Official service warranty and installation"),
      installment: "Uzum Nasiya, Alif, Infinbank",
      express: tr("24 soat ichida", "В течение 24 часов", "Within 24 hours"),
      trustScore: "9.5 / 10",
      officialUrl: "https://mediapark.uz",
      searchUrl: (q: string) => ensureProductUrl(q, "MediaPark"),
      badgeColor: "bg-red-50 text-red-700 border-red-200",
      accentBorder: "border-red-200/80 hover:border-red-400",
    },
    {
      name: "Asaxiy Books & Tech",
      tagline: tr("Kitoblar, gadjetlar va qulay yetkazib berish", "Книги, гаджеты и удобная доставка", "Books, gadgets and easy delivery"),
      delivery: tr("Toshkentda 1 kun, viloyatlarga BTS/Fargo orqali 1-3 kun", "Ташкент — 1 день, регионы — 1–3 дня через BTS/Fargo", "Tashkent: 1 day; regions: 1–3 days via BTS/Fargo"),
      pvz: tr("22+ qabul qilish maskanlari", "22+ пункта выдачи", "22+ pickup points"),
      warranty: tr("1 yil rasmiy kafolat", "Официальная гарантия 1 год", "1-year official warranty"),
      installment: "Asaxiy Nasiya, ZoodPay",
      express: tr("Kuryer orqali eshikkacha", "Курьером до двери", "Courier to your door"),
      trustScore: "9.4 / 10",
      officialUrl: "https://asaxiy.uz",
      searchUrl: (q: string) => ensureProductUrl(q, "Asaxiy"),
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      accentBorder: "border-blue-200/80 hover:border-blue-400",
    },
    {
      name: "Olcha.uz",
      tagline: tr("Smartfonlar, gadjetlar va rasmiy texnika yetakchisi", "Смартфоны, гаджеты и официальная техника", "Phones, gadgets and official electronics"),
      delivery: tr("Toshkentda 1 kun / Viloyatlarga 1-3 kun kuryer", "Ташкент — 1 день, регионы — 1–3 дня курьером", "Tashkent: 1 day; regions: 1–3 days by courier"),
      pvz: tr("Respublika bo'ylab keng tarqatish shoxobchalari", "Пункты выдачи по всей стране", "Pickup points across the country"),
      warranty: tr("12-24 oy to'liq rasmiy brend kafolati", "Официальная гарантия бренда 12–24 мес.", "12–24 month official brand warranty"),
      installment: tr("Olcha Nasiya (3, 6, 12, 24 oy 0% muddatli to'lov)", "Olcha Nasiya (3, 6, 12, 24 мес., рассрочка 0%)", "Olcha Nasiya (3, 6, 12, 24 months, 0% installments)"),
      express: tr("Olcha Express: Toshkentda 1 kun ichida", "Olcha Express: по Ташкенту за 1 день", "Olcha Express: 1 day in Tashkent"),
      trustScore: "9.7 / 10",
      officialUrl: "https://olcha.uz",
      searchUrl: (q: string) => ensureProductUrl(q, "Olcha"),
      badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
      accentBorder: "border-rose-200/80 hover:border-rose-400",
    },
  ];

  return (
    <div className="min-h-screen text-slate-900 dark:text-white py-10 px-4 sm:px-6 lg:px-8 transition-colors relative overflow-hidden animate-fade-in">
      {/* Artisanal Ambient Vignette & Warm Gold Lighting */}

      <div className="max-w-6xl mx-auto space-y-10 relative z-10">
        {/* Header */}
        <div className="text-center space-y-3.5 max-w-3xl mx-auto">
          <h1 className="lux-title text-[2.4rem] sm:text-[3.2rem] text-slate-900 dark:text-white leading-[1.05]">
            {language === "uz" ? "Do'konlar va yetkazish" : language === "ru" ? "Магазины и доставка" : "Stores and delivery"}
          </h1>
          <p className="text-base text-slate-500 dark:text-slate-400 mt-3 max-w-2xl mx-auto leading-relaxed">
            {language === "uz" ? "Qaysi do'kon shahringizga tezroq va arzonroq yetkazishini bilib oling: 14 hudud bo'yicha muddatlar va topshirish punktlari." : language === "ru" ? "Узнайте, какой магазин быстрее и дешевле доставит в ваш город: сроки и пункты выдачи по 14 регионам." : "Find out which store delivers to your city faster and cheaper: times and pickup points for all 14 regions."}
          </p>
        </div>

        {/* Region Selector Interactive Panel */}
        <div className="bg-white dark:bg-[#0b1224] p-6 sm:p-8 rounded-2xl border border-[var(--line)] dark:border-amber-500/20 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl icon-medallion icon-box-indigo flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-indigo-500 stroke-[2.2]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {tr("Viloyatingiz yoki Shahringizni Tanlang", "Выберите вашу область или город", "Choose your region or city")}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {tr("Tanlangan hudud bo'yicha yetkazib berish muddatlari va do'kon shartlari avtomatik yangilanadi.", "Сроки доставки и условия магазинов обновятся для выбранного региона.", "Delivery times and store terms update for the region you choose.")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{tr("Faol hudud:", "Выбранный регион:", "Selected region:")}</span>
              <span className="px-3.5 py-1.5 rounded-xl bg-amber-500/15 text-amber-900 dark:text-amber-300 text-xs font-bold border border-[var(--line)] dark:border-amber-500/30">
                {selectedRegion.name}
              </span>
            </div>
          </div>

          {/* Region Buttons Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {allRegions.map((reg: any) => (
              <button
                key={reg.regionId}
                onClick={() => setSelectedRegionId(reg.regionId)}
                className={`py-2 px-2.5 rounded-2xl text-xs font-semibold transition border text-center cursor-pointer ${
                  selectedRegionId === reg.regionId
                    ? "text-white font-bold border-amber-500 shadow-md ring-2 ring-amber-400/30 bg-amber-500"
                    : "bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 border-[var(--line)] dark:border-slate-800 hover:bg-amber-50/50 dark:hover:bg-slate-800 hover:border-[var(--line-strong)]"
                }`}
              >
                {reg.name.replace(" viloyati", "").replace(" Respublikasi", "")}
              </button>
            ))}
          </div>

          {/* Region Detailed Metrics Box */}
          <div className="bg-white dark:bg-[#0b1224] p-6 rounded-2xl border border-[var(--line)] dark:border-amber-500/20 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--line)] dark:border-slate-800/80 pb-4">
              <div>
                <span className="text-[11px] font-mono uppercase text-amber-700 dark:text-amber-400 font-bold tracking-wider">
                  Logistika Pasporti
                </span>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {selectedRegion.name} — {selectedRegion.capitalCity}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {selectedRegion.expressAvailable ? (
                  <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-300/70 dark:border-emerald-500/30 flex items-center gap-1.5 shadow-2xs">
                    <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[2.2]" />
                    <span>{tr("Ekspress Yetkazish Mavjud", "Есть экспресс-доставка", "Express delivery available")}</span>
                  </span>
                ) : (
                  <span className="px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700">
                    {tr("Standart Viloyat Kuryeri", "Обычная курьерская доставка", "Standard courier delivery")}
                  </span>
                )}
              </div>
            </div>

            {/* 4 Feature Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
              <div className="p-4 rounded-xl bg-white/95 dark:bg-slate-900/90 border border-[var(--line)] dark:border-slate-800 shadow-2xs">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-semibold">Uzum Market PVZ</span>
                <span className="text-base font-bold text-purple-700 dark:text-purple-400 block mt-0.5">
                  {selectedRegion.uzumDeliveryDays}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mt-1">
                  {selectedRegion.uzumPvzCount} {language === "uz" ? "ta bepul topshirish punkti" : language === "ru" ? "пунктов выдачи заказов" : "pickup points across region"}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white/95 dark:bg-slate-900/90 border border-[var(--line)] dark:border-slate-800 shadow-2xs">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-semibold">
                  {language === "uz" ? "Texnomart Yetkazish" : language === "ru" ? "Доставка Texnomart" : "Texnomart Delivery"}
                </span>
                <span className="text-base font-bold text-amber-700 dark:text-amber-400 block mt-0.5">
                  {selectedRegion.texnomartOption}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mt-1">
                  {language === "uz" ? "Filiallardan bepul olib ketish" : language === "ru" ? "Бесплатный самовывоз из филиалов" : "Free pickup at branches"}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white/95 dark:bg-slate-900/90 border border-[var(--line)] dark:border-slate-800 shadow-2xs">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-semibold">MediaPark & Asaxiy</span>
                <span className="text-base font-bold text-blue-700 dark:text-blue-400 block mt-0.5">
                  {selectedRegion.mediaParkDays}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mt-1">
                  {language === "uz" ? "Kuryerlik:" : language === "ru" ? "Курьер:" : "Courier:"} {formatPrice(selectedRegion.standardCourierCostUZS)}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white/95 dark:bg-slate-900/90 border border-[var(--line)] dark:border-slate-800 shadow-2xs">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-semibold">
                  {language === "uz" ? "AI Ekspert Maslahati" : language === "ru" ? "Совет AI Эксперта" : "AI Logistics Advice"}
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white block mt-0.5">
                  Tavsiya: {selectedRegion.bestStoreRecommended}
                </span>
                <span className="text-[11px] text-slate-600 dark:text-slate-400 block mt-1 leading-snug">
                  {selectedRegion.logisticsTip}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Retail Directory */}
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl icon-medallion icon-box-gold flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-amber-500 stroke-[2.2]" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {tr("O'zbekistonning Asosiy Xarid Tarmoqlari", "Основные магазины Узбекистана", "Main stores in Uzbekistan")}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {tr("Har bir tarmoqning rasmiy kafolat shartlari, muddatli to'lov imkoniyatlari va qidiruv tizimi.", "Гарантия, рассрочка и поиск по каждому магазину.", "Warranty, installments and search for each store.")}
                </p>
              </div>
            </div>

            {/* Quick Live Search Box */}
            <div className="relative w-full sm:w-auto min-w-0 sm:min-w-[280px]">
              <Search className="w-4 h-4 text-amber-600/70 dark:text-amber-400/70 absolute left-3.5 top-1/2 -translate-y-1/2 stroke-[2.2]" />
              <input
                type="text"
                placeholder={tr("Do'konda qidirish (masalan: termos, fen)...", "Искать в магазине (например: термос, фен)...", "Search the store (e.g. thermos, hair dryer)...")}
                value={searchStoreQuery}
                onChange={(e) => setSearchStoreQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/90 dark:bg-slate-900/90 border border-[var(--line)] dark:border-slate-800 rounded-2xl text-xs font-semibold outline-none text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/40 shadow-2xs transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {STORES.map((store) => (
              <div
                key={store.name}
                className="bg-white dark:bg-[#0b1224] p-6 rounded-2xl border border-[var(--line)] dark:border-amber-500/20 shadow-sm hover:border-[var(--line-strong)] dark:hover:border-amber-500/40 transition flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{store.name}</h3>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${store.badgeColor}`}>
                          Reyting: {store.trustScore}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{store.tagline}</p>
                    </div>

                    <a
                      href={searchStoreQuery ? store.searchUrl(searchStoreQuery) : store.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-[var(--line)] dark:border-slate-800 hover:border-[var(--line-strong)] hover:text-amber-500 text-slate-700 dark:text-slate-300 flex items-center justify-center transition cursor-pointer shadow-2xs"
                      title={language === "uz" ? "Do'konga o'tish" : language === "ru" ? "Перейти в магазин" : "Visit store"}
                    >
                      <ExternalLink className="w-4 h-4 stroke-[2.2]" />
                    </a>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-[var(--line)] dark:border-slate-800">
                    <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-[var(--line)] dark:border-slate-800/80">
                      <span className="text-[10px] text-slate-400 font-semibold block">
                        {language === "uz" ? "Yetkazib berish:" : language === "ru" ? "Доставка:" : "Delivery:"}
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block mt-0.5">{store.delivery}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-[var(--line)] dark:border-slate-800/80">
                      <span className="text-[10px] text-slate-400 font-semibold block">
                        {language === "uz" ? "Rasmiy kafolat:" : language === "ru" ? "Официальная гарантия:" : "Official warranty:"}
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block mt-0.5">{store.warranty}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-[var(--line)] dark:border-slate-800/80">
                      <span className="text-[10px] text-slate-400 font-semibold block">
                        {language === "uz" ? "Bo'lib to'lash (Nasiya):" : language === "ru" ? "Рассрочка (Насия):" : "Installments:"}
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block mt-0.5">{store.installment}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-[var(--line)] dark:border-slate-800/80">
                      <span className="text-[10px] text-slate-400 font-semibold block">
                        {language === "uz" ? "Filiallar & PVZ:" : language === "ru" ? "Филиалы и ПВЗ:" : "Branches & Pickup:"}
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block mt-0.5">{store.pvz}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-[var(--line)] dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
                    <span>
                      {/^(Olcha|Texnomart)/.test(store.name)
                        ? tr("Narxlar Sovg'a qidiruvida jonli tekshiriladi", "Цены проверяются в поиске Sovg'a в реальном времени", "Live prices in Sovg'a search")
                        : tr("Sovg'a qidiruvidan havola orqali", "Через ссылку из поиска Sovg'a", "Linked from Sovg'a search")}
                    </span>
                  </div>

                  <a
                    href={searchStoreQuery ? store.searchUrl(searchStoreQuery) : store.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition"
                  >
                    <span>{searchStoreQuery ? `"${searchStoreQuery}" qidirish` : tr("Do'konga kirish", "Открыть магазин", "Open store")}</span>
                    <ExternalLink className="w-3.5 h-3.5 stroke-[2.2]" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
