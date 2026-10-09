import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { research, formatPrice } from "../lib/api";
import { ensureProductUrl } from "../lib/urlHelper";
import { useTranslation } from "../lib/i18n";
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
} from "lucide-react";

export default function StoresDeliveryPage() {
  const { language } = useTranslation();
  const [selectedRegionId, setSelectedRegionId] = useState("tashkent-city");
  const [searchStoreQuery, setSearchStoreQuery] = useState("");

  const { data: deliveryData, isLoading } = useQuery({
    queryKey: ["delivery-info", selectedRegionId],
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
      tagline: "O'zbekistondagi eng yirik milliy marketpleys",
      delivery: "1 kunda bepul yetkazib berish (PVZ)",
      pvz: "Respublika bo'ylab 500+ tarqatish punkti",
      warranty: "14 kun nuqsonsiz qaytarish, kafolatli do'konlar",
      installment: "Uzum Nasiya (3, 6, 12 oy)",
      express: "Ertasiga 100% yetkazish",
      trustScore: "9.8 / 10",
      officialUrl: "https://uzum.uz",
      searchUrl: (q: string) => ensureProductUrl(q, "Uzum Market"),
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
      accentBorder: "border-purple-200/80 hover:border-purple-400",
    },
    {
      name: "Texnomart",
      tagline: "Maishiy texnika va elektronika rasmiy dileri",
      delivery: "Toshkentda 3 soatda ekspress / 1-2 kunda viloyatlar",
      pvz: "O'zbekiston bo'ylab 35+ katta shourumlar",
      warranty: "1 yildan 3 yilgacha rasmiy ishlab chiqaruvchi kafolati",
      installment: "Texnomart Muddatli to'lov (12-24 oy, 0% aksiyalar)",
      express: "3 soatda eshikkacha",
      trustScore: "9.6 / 10",
      officialUrl: "https://texnomart.uz",
      searchUrl: (q: string) => ensureProductUrl(q, "Texnomart"),
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
      accentBorder: "border-amber-200/80 hover:border-amber-400",
    },
    {
      name: "MediaPark",
      tagline: "Eng katta maishiy texnika gipermarketlari tarmog'i",
      delivery: "Toshkentda 24 soat, viloyatlarga 2-3 kun",
      pvz: "28+ gipermarket va servis markazlari",
      warranty: "Rasmiy servis kafolati va professional o'rnatib berish",
      installment: "Uzum Nasiya, Alif, Infinbank",
      express: "24 soat ichida",
      trustScore: "9.5 / 10",
      officialUrl: "https://mediapark.uz",
      searchUrl: (q: string) => ensureProductUrl(q, "MediaPark"),
      badgeColor: "bg-red-50 text-red-700 border-red-200",
      accentBorder: "border-red-200/80 hover:border-red-400",
    },
    {
      name: "Asaxiy Books & Tech",
      tagline: "Kitoblar, gadjetlar va qulay yetkazib berish",
      delivery: "Toshkentda 1 kun, viloyatlarga BTS/Fargo orqali 1-3 kun",
      pvz: "22+ qabul qilish maskanlari",
      warranty: "1 yil rasmiy kafolat",
      installment: "Asaxiy Nasiya, ZoodPay",
      express: "Kuryer orqali eshikkacha",
      trustScore: "9.4 / 10",
      officialUrl: "https://asaxiy.uz",
      searchUrl: (q: string) => ensureProductUrl(q, "Asaxiy"),
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      accentBorder: "border-blue-200/80 hover:border-blue-400",
    },
    {
      name: "Olcha.uz",
      tagline: "Smartfonlar, gadjetlar va rasmiy texnika yetakchisi",
      delivery: "Toshkentda 1 kun / Viloyatlarga 1-3 kun kuryer",
      pvz: "Respublika bo'ylab keng tarqatish shoxobchalari",
      warranty: "12-24 oy to'liq rasmiy brend kafolati",
      installment: "Olcha Nasiya (3, 6, 12, 24 oy 0% muddatli to'lov)",
      express: "Olcha Express: Toshkentda 1 kun ichida",
      trustScore: "9.7 / 10",
      officialUrl: "https://olcha.uz",
      searchUrl: (q: string) => ensureProductUrl(q, "Olcha"),
      badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
      accentBorder: "border-rose-200/80 hover:border-rose-400",
    },
  ];

  return (
    <div className="min-h-screen bg-[#fcfbf9] dark:bg-[#07080c] text-slate-900 dark:text-white py-10 px-4 sm:px-6 lg:px-8 transition-colors relative overflow-hidden animate-fade-in">
      {/* Artisanal Ambient Vignette & Warm Gold Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[min(1000px,100vw)] max-w-full h-[400px] bg-gradient-to-b from-amber-500/10 via-indigo-500/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-48 right-10 w-80 h-80 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-10 relative z-10">
        {/* Header */}
        <div className="text-center space-y-3.5 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 via-gold-500/20 to-amber-500/15 border border-gold-500/30 text-amber-900 dark:text-amber-300 text-xs font-black uppercase tracking-widest shadow-xs">
            <Truck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 stroke-[2.2]" />
            <span>O'zbekiston Bo'ylab Logistika & Do'konlar Xaritasi</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight font-display text-slate-900 dark:text-white">
            Do'konlar, PVZ Punktlari & <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 bg-clip-text text-transparent">Viloyatlar Yetkazishi</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed">
            Sovg'angiz o'z vaqtida yetib borishi uchun qaysi do'kon sizning shahringizga tezroq va arzonroq
            yetkazib berishini aniqlang. Barcha 14 ta hudud bo'yicha real muddatlar va PVZ ma'lumotlari.
          </p>
        </div>

        {/* Region Selector Interactive Panel */}
        <div className="bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:to-[#0a0c16] p-6 sm:p-8 rounded-3xl border-2 border-amber-200/80 dark:border-amber-500/20 shadow-luxury space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl icon-medallion icon-box-indigo flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-indigo-500 stroke-[2.2]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Viloyatingiz yoki Shahringizni Tanlang
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Tanlangan hudud bo'yicha yetkazib berish muddatlari va do'kon shartlari avtomatik yangilanadi.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Faol hudud:</span>
              <span className="px-3.5 py-1.5 rounded-xl bg-amber-500/15 text-amber-900 dark:text-amber-300 text-xs font-bold border border-amber-300/70 dark:border-amber-500/30">
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
                className={`py-2 px-2.5 rounded-2xl text-xs font-semibold transition border text-center cursor-pointer active:scale-95 ${
                  selectedRegionId === reg.regionId
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black border-amber-500 shadow-md shadow-amber-500/25 ring-2 ring-amber-400/30"
                    : "bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 border-amber-200/70 dark:border-slate-800 hover:bg-amber-50/50 dark:hover:bg-slate-800 hover:border-amber-400"
                }`}
              >
                {reg.name.replace(" viloyati", "").replace(" Respublikasi", "")}
              </button>
            ))}
          </div>

          {/* Region Detailed Metrics Box */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50/60 via-white to-amber-50/40 dark:from-[#131626] dark:via-[#0f1120] dark:to-[#0b0d18] border border-amber-200/70 dark:border-amber-500/20 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/60 dark:border-slate-800/80 pb-4">
              <div>
                <span className="text-[11px] font-mono uppercase text-amber-700 dark:text-amber-400 font-bold tracking-wider">
                  Logistika Pasporti
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {selectedRegion.name} — {selectedRegion.capitalCity}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {selectedRegion.expressAvailable ? (
                  <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-300/70 dark:border-emerald-500/30 flex items-center gap-1.5 shadow-2xs">
                    <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[2.2]" />
                    <span>Ekspress Yetkazish Mavjud</span>
                  </span>
                ) : (
                  <span className="px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700">
                    Standart Viloyat Kuryeri
                  </span>
                )}
              </div>
            </div>

            {/* 4 Feature Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
              <div className="p-4 rounded-xl bg-white/95 dark:bg-slate-900/90 border border-amber-200/60 dark:border-slate-800 shadow-2xs">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-semibold">Uzum Market PVZ</span>
                <span className="text-base font-black text-purple-700 dark:text-purple-400 block mt-0.5">
                  {selectedRegion.uzumDeliveryDays}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mt-1">
                  {selectedRegion.uzumPvzCount} {language === "uz" ? "ta bepul topshirish punkti" : language === "ru" ? "пунктов выдачи заказов" : "pickup points across region"}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white/95 dark:bg-slate-900/90 border border-amber-200/60 dark:border-slate-800 shadow-2xs">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-semibold">
                  {language === "uz" ? "Texnomart Yetkazish" : language === "ru" ? "Доставка Texnomart" : "Texnomart Delivery"}
                </span>
                <span className="text-base font-black text-amber-700 dark:text-amber-400 block mt-0.5">
                  {selectedRegion.texnomartOption}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mt-1">
                  {language === "uz" ? "Filiallardan bepul olib ketish" : language === "ru" ? "Бесплатный самовывоз из филиалов" : "Free pickup at branches"}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white/95 dark:bg-slate-900/90 border border-amber-200/60 dark:border-slate-800 shadow-2xs">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-semibold">MediaPark & Asaxiy</span>
                <span className="text-base font-black text-blue-700 dark:text-blue-400 block mt-0.5">
                  {selectedRegion.mediaParkDays}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mt-1">
                  {language === "uz" ? "Kuryerlik:" : language === "ru" ? "Курьер:" : "Courier:"} {formatPrice(selectedRegion.standardCourierCostUZS)}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white/95 dark:bg-slate-900/90 border border-amber-200/60 dark:border-slate-800 shadow-2xs">
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
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  O'zbekistonning Asosiy Xarid Tarmoqlari
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Har bir tarmoqning rasmiy kafolat shartlari, muddatli to'lov imkoniyatlari va qidiruv tizimi.
                </p>
              </div>
            </div>

            {/* Quick Live Search Box */}
            <div className="relative w-full sm:w-auto min-w-0 sm:min-w-[280px]">
              <Search className="w-4 h-4 text-amber-600/70 dark:text-amber-400/70 absolute left-3.5 top-1/2 -translate-y-1/2 stroke-[2.2]" />
              <input
                type="text"
                placeholder="Do'konda qidirish (masalan: termos, fen)..."
                value={searchStoreQuery}
                onChange={(e) => setSearchStoreQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/90 dark:bg-slate-900/90 border border-amber-200/80 dark:border-slate-800 rounded-2xl text-xs font-semibold outline-none text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/40 shadow-2xs transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {STORES.map((store) => (
              <div
                key={store.name}
                className="p-6 rounded-3xl bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:to-[#0a0c16] border-2 border-amber-200/80 dark:border-amber-500/20 shadow-luxury hover:border-amber-400 dark:hover:border-amber-500/40 transition flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">{store.name}</h3>
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
                      className="w-9 h-9 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-amber-200/80 dark:border-slate-800 hover:border-amber-400 hover:text-amber-500 text-slate-700 dark:text-slate-300 flex items-center justify-center transition cursor-pointer shadow-2xs active:scale-95"
                      title={language === "uz" ? "Do'konga o'tish" : language === "ru" ? "Перейти в магазин" : "Visit store"}
                    >
                      <ExternalLink className="w-4 h-4 stroke-[2.2]" />
                    </a>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-amber-100 dark:border-slate-800">
                    <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-amber-100/70 dark:border-slate-800/80">
                      <span className="text-[10px] text-slate-400 font-semibold block">
                        {language === "uz" ? "Yetkazib berish:" : language === "ru" ? "Доставка:" : "Delivery:"}
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block mt-0.5">{store.delivery}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-amber-100/70 dark:border-slate-800/80">
                      <span className="text-[10px] text-slate-400 font-semibold block">
                        {language === "uz" ? "Rasmiy kafolat:" : language === "ru" ? "Официальная гарантия:" : "Official warranty:"}
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block mt-0.5">{store.warranty}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-amber-100/70 dark:border-slate-800/80">
                      <span className="text-[10px] text-slate-400 font-semibold block">
                        {language === "uz" ? "Bo'lib to'lash (Nasiya):" : language === "ru" ? "Рассрочка (Насия):" : "Installments:"}
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block mt-0.5">{store.installment}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-amber-100/70 dark:border-slate-800/80">
                      <span className="text-[10px] text-slate-400 font-semibold block">
                        {language === "uz" ? "Filiallar & PVZ:" : language === "ru" ? "Филиалы и ПВЗ:" : "Branches & Pickup:"}
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block mt-0.5">{store.pvz}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-amber-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
                    <span>
                      {language === "uz" ? "Sovg'a AI bilan to'liq integratsiyalangan" : language === "ru" ? "Полная интеграция с Sovg'a AI" : "Fully integrated with Sovg'a AI"}
                    </span>
                  </div>

                  <a
                    href={searchStoreQuery ? store.searchUrl(searchStoreQuery) : store.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition"
                  >
                    <span>{searchStoreQuery ? `"${searchStoreQuery}" qidirish` : "Do'konga kirish"}</span>
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
