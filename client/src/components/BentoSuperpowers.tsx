import { useState } from "react";
import { Link } from "wouter";
import { useTranslation } from "../lib/i18n";
import { useCurrency } from "../lib/currency";
import {
  TrendingDown,
  ShoppingBag,
  Camera,
  Heart,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Zap,
  CreditCard,
  Gift,
  Eye,
  Sliders,
} from "lucide-react";
import ImageSearchModal from "./ImageSearchModal";
import DirectOrderModal from "./DirectOrderModal";
import { cyberSound } from "../lib/cyberSound";

export default function BentoSuperpowers() {
  const { language } = useTranslation();
  const { formatPrice } = useCurrency();
  const [showImageModal, setShowImageModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedStoreIndex, setSelectedStoreIndex] = useState(0);

  const sampleStores = [
    {
      name: "Uzum Market",
      price: 5950000,
      orig: 6800000,
      discount: "12% off",
      deliveryUz: "Ertaga (Bepul)",
      deliveryRu: "Завтра (Бесплатно)",
      deliveryEn: "Tomorrow (Free)",
      isLowest: true,
    },
    {
      name: "Texnomart",
      price: 6400000,
      orig: 7100000,
      discount: "10% off",
      deliveryUz: "Bugun olib ketish",
      deliveryRu: "Самовывоз сегодня",
      deliveryEn: "Same-day pickup",
      isLowest: false,
    },
    {
      name: "MediaPark",
      price: 6650000,
      orig: 7100000,
      discount: "6% off",
      deliveryUz: "1-2 kun",
      deliveryRu: "1-2 дня",
      deliveryEn: "1-2 days",
      isLowest: false,
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-12 sm:my-20">
      {/* Editorial Header */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold tracking-wider uppercase shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>
            {language === "uz"
              ? "YUKSAK IMKONIYATLAR"
              : language === "ru"
              ? "ПЕРЕДОВЫЕ ВОЗМОЖНОСТИ"
              : "NEXT-GENERATION CAPABILITIES"}
          </span>
        </div>
        <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-slate-900 dark:text-white tracking-tight leading-tight">
          {language === "uz" ? (
            <>
              O'zbekistondagi Eng Kuchli — <span className="gold-gradient-text">AI Xarid Super-Kuchlari</span>
            </>
          ) : language === "ru" ? (
            <>
              Создано для Совершенства — <span className="gold-gradient-text">AI Шопинг-Суперсилы</span>
            </>
          ) : (
            <>
              Engineered for Perfection — <span className="gold-gradient-text">AI Shopping Superpowers</span>
            </>
          )}
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-normal max-w-2xl mx-auto leading-relaxed">
          {language === "uz"
            ? "Bozor tahlili, soxta chegirmalar tekshiruvi va bir soniyada to'g'ridan-to'g'ri buyurtma berish imkoniyati."
            : language === "ru"
            ? "Анализ цен по маркетплейсам, проверка реальных скидок и оформление заказов в 1 клик."
            : "Live arbitrage across leading marketplaces, instant authentic in-app ordering, and neural image recognition in one unified platform."}
        </p>
      </div>

      {/* Modern High-End Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6">
        {/* ── CARD 1 (Col 8): AUTONOMOUS PRICE ARBITRAGE TERMINAL ── */}
        <div className="md:col-span-8 bg-gradient-to-br from-white via-[#fcfaf5] to-[#f6f0df] dark:from-slate-900 dark:via-[#0a0f1d] dark:to-slate-950 rounded-[2.5rem] p-7 sm:p-10 text-slate-950 dark:text-white border-2 border-amber-300/80 dark:border-white/10 shadow-2xl relative overflow-hidden flex flex-col justify-between group hover:border-amber-400 dark:hover:border-amber-500/40 transition-all duration-500">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-400/20 dark:bg-amber-500/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-amber-400/30 dark:group-hover:bg-amber-500/20 transition-all duration-700" />

          <div className="relative z-10">
            <div className="flex items-center justify-between gap-4 mb-6">
              <span className="text-[11px] font-mono font-black tracking-wider uppercase text-amber-950 dark:text-amber-400 bg-amber-100/90 dark:bg-amber-500/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-amber-300 dark:border-amber-500/20 flex items-center gap-2 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,1)]" />
                Live Arbitrage Radar
              </span>
              <span className="text-xs font-mono text-slate-600 dark:text-slate-400 font-bold">
                {language === "uz" ? "Skaner chuqurligi:" : language === "ru" ? "Глубина сканирования:" : "Grounding depth:"}{" "}
                <span className="text-emerald-700 dark:text-emerald-400 font-black">
                  {language === "uz" ? "6 ta Do'kon" : language === "ru" ? "6 Магазинов" : "6 Retailers"}
                </span>
              </span>
            </div>

            <h3 className="font-display font-black text-xl sm:text-2xl text-slate-950 dark:text-white mb-2">
              {language === "uz"
                ? "Avtonom Narx Arbitraji va Taqqoslash"
                : language === "ru"
                ? "Автономный Арбитраж и Сравнение Цен"
                : "Autonomous Live Price Arbitrage Engine"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed mb-6 font-medium">
              {language === "uz"
                ? "Sovg'a AI bir vaqtning o'zida Uzum, Texnomart va MediaPark omborlarini skanerlab, eng arzon va 100% rasmiy kafolatli narxni ajratib beradi."
                : language === "ru"
                ? "Sovg'a AI сканирует маркетплейсы Uzum, Texnomart и MediaPark, находя гарантированно лучшую цену с официальной гарантией."
                : "Sovg'a AI continuously crawls Uzbekistan's premier marketplaces to isolate the verified lowest price with genuine warranty."}
            </p>

            {/* Interactive Simulator Terminal */}
            <div className="bg-white/95 dark:bg-slate-900/90 rounded-2xl p-4 sm:p-5 border-2 border-amber-200/80 dark:border-slate-800 space-y-4 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/60 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100/80 dark:bg-slate-800 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold border border-amber-300/60 dark:border-slate-700">
                    ⚡
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-slate-950 dark:text-white">Dyson Airwrap Multi-Styler Complete Long</h4>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      {language === "uz"
                        ? "Rasmiy Yevropa Modeli • 2 Yillik Kafolat"
                        : language === "ru"
                        ? "Официальная Евроверсия • 2 Года Гарантии"
                        : "Official European Model • 2-Year Warranty"}
                    </span>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30">
                    {language === "uz"
                      ? `${formatPrice(700000)} tejash`
                      : language === "ru"
                      ? `Экономия ${formatPrice(700000)}`
                      : `Saves ${formatPrice(700000)} vs Retail`}
                  </span>
                </div>
              </div>

              {/* Retailer rows */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {sampleStores.map((store, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      cyberSound.playClick();
                      setSelectedStoreIndex(i);
                    }}
                    className={`p-3 rounded-xl border-2 transition-all cursor-pointer ${
                      selectedStoreIndex === i
                        ? "bg-amber-100/90 dark:bg-slate-800 border-amber-500 shadow-md"
                        : "bg-amber-50/50 dark:bg-slate-900/50 border-amber-200/70 dark:border-slate-800 hover:bg-amber-100/60 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{store.name}</span>
                      {store.isLowest && (
                        <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-600 text-white px-1.5 py-0.2 rounded font-mono shadow-2xs">
                          {language === "uz" ? "Eng Arzon" : language === "ru" ? "Лучшая Цена" : "Lowest"}
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-black text-slate-950 dark:text-white">{formatPrice(store.price)}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between mt-1 font-medium">
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold">{store.discount}</span>
                      <span>
                        {language === "uz"
                          ? store.deliveryUz
                          : language === "ru"
                          ? store.deliveryRu
                          : store.deliveryEn}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-amber-200/80 dark:border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              {language === "uz"
                ? "30 kunlik narxlar tarixi bilan tasdiqlangan"
                : language === "ru"
                ? "Проверено 30-дневной историей цен"
                : "Verified with 30-Day price history"}
            </span>
            <Link
              href="/catalog"
              onClick={() => cyberSound.playClick()}
              className="text-xs font-black text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300 flex items-center gap-1.5 transition"
            >
              <span>
                {language === "uz"
                  ? "Barcha aksiyalarni ko'rish"
                  : language === "ru"
                  ? "Все выгодные предложения"
                  : "Explore All Deals"}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* ── CARD 2 (Col 4): IN-APP DIRECT CHECKOUT ── */}
        <div className="md:col-span-4 bg-gradient-to-br from-[#fff7ed] via-[#ffedd5] to-[#fef3c7] dark:from-amber-900/40 dark:via-[#0f0a05] dark:to-slate-950 rounded-[2.5rem] p-7 sm:p-9 text-amber-950 dark:text-white border-2 border-amber-300 dark:border-amber-500/20 shadow-2xl relative overflow-hidden flex flex-col justify-between group hover:border-amber-500 dark:hover:border-amber-400/50 transition-all duration-500">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-amber-400/20 dark:bg-amber-500/20 rounded-full blur-[80px] pointer-events-none group-hover:bg-amber-400/30 dark:group-hover:bg-amber-500/30 transition-all duration-700" />

          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg shadow-amber-500/25">
              <ShoppingBag className="w-7 h-7" />
            </div>

            <div className="inline-block px-3 py-1 rounded-full text-[10px] font-black tracking-widest bg-amber-200/90 dark:bg-amber-500/20 text-amber-950 dark:text-amber-300 border border-amber-400 mb-4 shadow-xs">
              {language === "uz"
                ? "VOSITACHISIZ XARID"
                : language === "ru"
                ? "БЕЗ РЕДИРЕКТОВ"
                : "ZERO REDIRECT FRICTION"}
            </div>

            <h3 className="font-display font-black text-2xl text-slate-950 dark:text-white mb-3">
              {language === "uz"
                ? "Ilova Ichida To'g'ridan-To'g'ri Xarid"
                : language === "ru"
                ? "Прямой Заказ Прямо в Приложении"
                : "In-App Direct Checkout Protocol"}
            </h3>
            <p className="text-xs text-amber-950/80 dark:text-amber-100/70 leading-relaxed mb-6 font-medium">
              {language === "uz"
                ? "Tashqi do'kon qidiruvlarida adashmang. Manzilingizni kiriting va Click, Payme yoki Naqd to'lov bilan to'g'ridan-to'g'ri buyurtma bering."
                : language === "ru"
                ? "Не тратьте время на поиски. Укажите адрес и закажите напрямую с оплатой через Click, Payme или наличными при получении."
                : "Order any curated product directly with Click, Payme, or Cash on delivery. Complete with optional celebratory satin gift packaging."}
            </p>

            {/* Feature Pills */}
            <div className="space-y-2 bg-white/90 dark:bg-slate-900/80 p-3.5 rounded-2xl border border-amber-300/80 dark:border-slate-800 text-xs text-amber-950 dark:text-slate-300 shadow-xs font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span>
                  {language === "uz"
                    ? "O'zbekistonning 14 ta hududiga yetkazish"
                    : language === "ru"
                    ? "Доставка во все 14 регионов Узбекистана"
                    : "14 Regions in Uzbekistan supported"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span>
                  {language === "uz"
                    ? "Click, Payme va Yetkazilganda Naqd to'lov"
                    : language === "ru"
                    ? "Click, Payme и Оплата при получении"
                    : "Click, Payme & Cash on Delivery"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span>
                  {language === "uz"
                    ? "Atlas tasmali hashamatli sovg'a qutisi (+25 ming so'm)"
                    : language === "ru"
                    ? "Премиальная подарочная коробка с атласной лентой (+25 тыс сум)"
                    : "Satin ribbon luxury gift box (+25k UZS)"}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              cyberSound.playClick();
              setShowOrderModal(true);
            }}
            className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:brightness-105 text-white font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-500/25"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>
              {language === "uz"
                ? "Tezkor Buyurtma Berish"
                : language === "ru"
                ? "Оформить Прямой Заказ"
                : "Direct In-App Checkout"}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ── CARD 3 (Col 5): NEURAL VISION IMAGE MATCH ── */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#eef2ff] via-[#e0e7ff] to-[#f5f3ff] dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-950 rounded-3xl p-6 sm:p-7 text-slate-950 dark:text-white border-2 border-indigo-200 dark:border-indigo-500/20 shadow-xl flex flex-col justify-between group hover:border-indigo-400 dark:hover:border-indigo-400/50 transition-all duration-300">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-4 group-hover:scale-105 transition shadow-md shadow-indigo-500/25">
              <Camera className="w-6 h-6" />
            </div>

            <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 dark:bg-indigo-500/20 text-indigo-900 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-500/40 mb-3">
              GEMINI 3.8 VISION INSIDE
            </div>

            <h3 className="font-display font-black text-xl text-slate-950 dark:text-white mb-2">
              {language === "uz"
                ? "Rasm Orqali Qidirish (AI Lens)"
                : language === "ru"
                ? "Поиск по Фото (AI Lens)"
                : "Neural Vision Product Matcher"}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6 font-medium">
              {language === "uz"
                ? "Istalgan sovg'a yoki buyum rasmini yuklang — Gemini AI modelni aniqlaydi va O'zbekistonda eng arzon sotayotgan do'konni topib beradi."
                : language === "ru"
                ? "Сфотографируйте любой подарок или вещь — Gemini AI распознает точную модель и найдет лучшую цену в магазинах Узбекистана."
                : "Snap a photo of any luxury perfume, tech gadget, or homeware. Neural Vision pinpoints the exact brand, model, and lowest marketplace price."}
            </p>
          </div>

          <button
            onClick={() => {
              cyberSound.playClick();
              setShowImageModal(true);
            }}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-500/25"
          >
            <Camera className="w-4 h-4 text-white" />
            <span>
              {language === "uz"
                ? "Kamera orqali qidirish"
                : language === "ru"
                ? "Запустить AI-поиск по фото"
                : "Launch Camera AI Scanner"}
            </span>
          </button>
        </div>

        {/* ── CARD 4 (Col 7): SOCIAL WEDDING & WISHLIST REGISTRY ── */}
        <div className="md:col-span-7 bg-gradient-to-br from-[#fff1f2] via-[#ffe4e6] to-[#fdf2f8] dark:from-rose-950/30 dark:via-slate-900 dark:to-slate-950 rounded-3xl p-6 sm:p-7 text-slate-950 dark:text-white border-2 border-rose-300 dark:border-rose-500/20 shadow-xl flex flex-col justify-between group hover:border-rose-400 dark:hover:border-rose-400/50 transition-all duration-300">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center group-hover:scale-105 transition shadow-md shadow-rose-500/25">
                <Heart className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black text-rose-950 dark:text-rose-300 bg-rose-200/90 dark:bg-rose-500/20 px-2.5 py-0.5 rounded-full border border-rose-400 dark:border-rose-500/30">
                {language === "uz" ? "0% DUBLIKATLAR" : language === "ru" ? "0% ДУБЛИКАТОВ" : "ZERO DUPLICATES"}
              </span>
            </div>

            <h3 className="font-display font-black text-xl text-slate-950 dark:text-white mb-2">
              {language === "uz"
                ? "To'y va Istaklar Ro'yxati Protokoli"
                : language === "ru"
                ? "Свадебный Реестр и Список Желаний"
                : "Social Wedding & Wishlist Protocol"}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6 font-medium">
              {language === "uz"
                ? "Yaqinlaringizga nima sovg'a qilishni aniq biling. Mehmonlar bitta sovg'ani ikki marta olmasligi uchun band qilish va sayohat fondi to'plash imkoniyati."
                : language === "ru"
                ? "Создайте вишлист или свадебный реестр с функцией бронирования, чтобы подарки не повторялись, и соберите средства на медовый месяц."
                : "Create beautiful, shareable gift registries with real-time reservation locks to prevent duplicate gifts. Includes honeymoon cash fund collection via Payme & Click."}
            </p>

            {/* Registry Preview Card */}
            <div className="bg-white/95 dark:bg-slate-900/90 rounded-2xl p-4 border border-rose-200 dark:border-slate-800 flex items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-700 font-bold text-sm">
                  💍
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-950 dark:text-white">
                    {language === "uz"
                      ? "Ali va Madina to'y reyestri"
                      : language === "ru"
                      ? "Свадебный реестр Али и Мадины"
                      : "Ali & Madina's Wedding Registry"}
                  </h4>
                  <span className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">
                    {language === "uz"
                      ? "5 tadan 4 ta sovg'a band qilingan · 1.2M UZS Sayohat fondi"
                      : language === "ru"
                      ? "4 из 5 подарков забронировано · 1.2M UZS Фонд путешествия"
                      : "4 of 5 gifts reserved • 1.2M UZS Honeymoon Fund"}
                  </span>
                </div>
              </div>

              <Link
                href="/wedding/ali-madina"
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs"
              >
                <span>{language === "uz" ? "Ko'rish" : language === "ru" ? "Открыть" : "View"}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-rose-200 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
            <span>
              {language === "uz"
                ? "Bitta havola orqali ulashish mumkin"
                : language === "ru"
                ? "Легко поделиться одной ссылкой"
                : "Shareable with a single link"}
            </span>
            <Link href="/wedding" className="text-rose-700 dark:text-rose-400 hover:text-rose-900 dark:hover:text-rose-300 font-black flex items-center gap-1">
              <span>
                {language === "uz"
                  ? "Mening reyestrimni tuzish"
                  : language === "ru"
                  ? "Создать мой реестр"
                  : "Create My Registry"}
              </span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {showImageModal && <ImageSearchModal onClose={() => setShowImageModal(false)} />}
      {showOrderModal && (
        <DirectOrderModal
          product={{
            name: "De'Longhi Nescafé Dolce Gusto Mini Me",
            price: 650000,
            originalPrice: 790000,
            discount: "18% off",
            imageUrl: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&auto=format&fit=crop",
            currency: "UZS",
            store: "Uzum Market",
            url: "https://uzum.uz/uz/product/kofemashina-delonghi-mini-me-284912",
            rating: 4.8,
            reviewCount: 142,
            availability:
              language === "uz"
                ? "Mavjud (Omborda bor)"
                : language === "ru"
                ? "В наличии (На складе)"
                : "In Stock (Available)",
            category: "best_overall",
            reason:
              language === "uz"
                ? "To'y va bayramlar uchun xaridorgir italyancha kapsulali kofe mashinasi."
                : language === "ru"
                ? "Популярная итальянская капсульная кофемашина для свадеб и подарков."
                : "Popular Italian capsule coffee maker ideal for weddings and celebrations.",
            source: "Uzum Market",
            lastChecked: new Date().toISOString(),
            priceVerified: true,
            availabilityVerified: true,
            warranty:
              language === "uz"
                ? "2 Yil Rasmiy Kafolat"
                : language === "ru"
                ? "2 Года Официальной Гарантии"
                : "2-Year Official Warranty",
            deliveryEstimate:
              language === "uz"
                ? "Ertaga Toshkent va viloyatlarga yetkaziladi"
                : language === "ru"
                ? "Доставка завтра по Ташкенту и регионам"
                : "Delivered tomorrow across Tashkent and regions",
          }}
          isOpen={showOrderModal}
          onClose={() => setShowOrderModal(false)}
        />
      )}
    </section>
  );
}
