import { useState } from "react";
import SectionHeader from "./SectionHeader";
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
  Check,
  Zap,
  CreditCard,
  Gift,
  Eye,
  Sliders,
} from "../lib/icons";
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
    <section className="reveal max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-12 sm:my-20">
      <SectionHeader
        align="center"
        eyebrow={language === "uz" ? "Imkoniyatlar" : language === "ru" ? "Возможности" : "Features"}
        title={language === "uz" ? <>Sovg'a nimalarga <span className="text-gold-gradient">yordam beradi</span></> : language === "ru" ? <>Чем помогает <span className="text-gold-gradient">Sovg'a</span></> : <>What Sovg'a <span className="text-gold-gradient">helps with</span></>}
        subtitle={
          language === "uz"
            ? "Narxlarni solishtirish, to'g'ridan-to'g'ri buyurtma, rasm bo'yicha qidirish va to'y ro'yxatlari."
            : language === "ru"
            ? "Сравнение цен, заказ напрямую, поиск по фото и свадебные списки."
            : "Comparing prices, ordering directly, searching by photo and wedding registries."
        }
      />

      {/* Modern High-End Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6">
        {/* ── CARD 1 (Col 8): AUTONOMOUS PRICE ARBITRAGE TERMINAL ── */}
        <div className="surface-card is-interactive md:col-span-8 rounded-3xl p-7 sm:p-10 text-slate-950 dark:text-white overflow-hidden flex flex-col justify-between group">

          <div className="relative z-10">
            <div className="flex items-center justify-between gap-4 mb-6">
              <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                {language === "uz" ? "Narxlarni solishtirish" : language === "ru" ? "Сравнение цен" : "Price comparison"}
              </span>
              <span className="text-xs font-mono text-slate-600 dark:text-slate-400 font-bold">
                {language === "uz" ? "Do'konlar:" : language === "ru" ? "Магазинов:" : "Stores checked:"}{" "}
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                  {language === "uz" ? "6 ta" : language === "ru" ? "6" : "6"}
                </span>
              </span>
            </div>

            <h3 className="font-display font-bold text-xl sm:text-2xl text-slate-950 dark:text-white mb-2">
              {language === "uz" ? "Bitta mahsulot — bir nechta do'kon narxi" : language === "ru" ? "Один товар — цены нескольких магазинов" : "One product, every store's price"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed mb-6 font-medium">
              {language === "uz" ? "Uzum, Texnomart, MediaPark va boshqa do'konlardagi narxlarni yonma-yon ko'ring va rasmiy kafolatli eng arzonini tanlang." : language === "ru" ? "Смотрите цены Uzum, Texnomart, MediaPark и других магазинов рядом и выбирайте самый выгодный вариант с официальной гарантией." : "See prices from Uzum, Texnomart, MediaPark and others side by side, and pick the cheapest one with an official warranty."}
            </p>

            {/* Interactive Simulator Terminal */}
            <div className="bg-white/95 dark:bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-[var(--line)] dark:border-slate-800 space-y-4 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--line)] dark:border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100/80 dark:bg-slate-800 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold border border-[var(--line)] dark:border-slate-700">
                    ⚡
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-950 dark:text-white">Dyson Airwrap Multi-Styler Complete Long</h4>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      {language === "uz" ? "Rasmiy model · 2 yil kafolat" : language === "ru" ? "Официальная модель · гарантия 2 года" : "Official model · 2-year warranty"}
                    </span>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30">
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
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      selectedStoreIndex === i
                        ? "bg-amber-100/90 dark:bg-slate-800 border-amber-500 shadow-md"
                        : "bg-amber-50/50 dark:bg-slate-900/50 border-[var(--line)] dark:border-slate-800 hover:bg-amber-100/60 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{store.name}</span>
                      {store.isLowest && (
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-600 text-white px-1.5 py-0.2 rounded font-mono shadow-2xs">
                          {language === "uz" ? "Eng arzon" : language === "ru" ? "Дешевле всего" : "Lowest"}
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-bold text-slate-950 dark:text-white">{formatPrice(store.price)}</div>
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

          <div className="mt-6 pt-4 border-t border-[var(--line)] dark:border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              {language === "uz" ? "30 kunlik narx tarixi bilan" : language === "ru" ? "С историей цен за 30 дней" : "Includes 30-day price history"}
            </span>
            <Link
              href="/catalog"
              onClick={() => cyberSound.playClick()}
              className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300 flex items-center gap-1.5 transition"
            >
              <span>
                {language === "uz" ? "Barcha takliflar" : language === "ru" ? "Все предложения" : "See all deals"}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* ── CARD 2 (Col 4): IN-APP DIRECT CHECKOUT ── */}
        <div className="panel-ink ring-gold md:col-span-4 rounded-3xl p-7 sm:p-9 text-white overflow-hidden flex flex-col justify-between group">

          <div className="relative z-10">
            <div className="tile tile-sky mb-5">
              <ShoppingBag className="w-5 h-5" />
            </div>

            <div className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold border mb-4 bg-white/5 text-[#ead29a] border-[#e3c27a]/30">
              {language === "uz" ? "To'g'ridan-to'g'ri buyurtma" : language === "ru" ? "Заказ напрямую" : "Order directly"}
            </div>

            <h3 className="font-display font-bold text-2xl text-white mb-3">
              {language === "uz" ? "Shu yerning o'zida buyurtma bering" : language === "ru" ? "Оформите заказ прямо здесь" : "Order without leaving the site"}
            </h3>
            <p className="text-sm text-slate-300/80 leading-relaxed mb-6">
              {language === "uz" ? "Manzilni kiriting va Click, Payme yoki naqd pul bilan to'lang. Xohlasangiz, sovg'a qutisiga qadoqlab beramiz." : language === "ru" ? "Укажите адрес и оплатите через Click, Payme или наличными. По желанию упакуем в подарочную коробку." : "Enter your address and pay with Click, Payme or cash on delivery. Gift wrapping is available if you want it."}
            </p>

            {/* Feature Pills */}
            <div className="space-y-2.5 bg-white/[0.04] p-4 rounded-2xl border border-white/10 text-[13px] text-slate-200 font-medium">
              <div className="flex items-center gap-2">
                <span className="bullet-check is-emerald"><Check className="w-3 h-3" strokeWidth={3} /></span>
                <span>
                  {language === "uz" ? "Barcha 14 hududga yetkazish" : language === "ru" ? "Доставка во все 14 регионов" : "Delivery to all 14 regions"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bullet-check is-emerald"><Check className="w-3 h-3" strokeWidth={3} /></span>
                <span>
                  {language === "uz" ? "Click, Payme yoki naqd to'lov" : language === "ru" ? "Click, Payme или наличные" : "Click, Payme or cash on delivery"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bullet-check is-emerald"><Check className="w-3 h-3" strokeWidth={3} /></span>
                <span>
                  {language === "uz" ? "Sovg'a qutisi (+25 000 so'm)" : language === "ru" ? "Подарочная коробка (+25 000 сум)" : "Gift box (+25,000 UZS)"}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              cyberSound.playClick();
              setShowOrderModal(true);
            }}
            className="w-full mt-6 py-3 rounded-xl btn-gold text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>
              {language === "uz" ? "Buyurtma berish" : language === "ru" ? "Оформить заказ" : "Place an order"}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ── CARD 3 (Col 5): NEURAL VISION IMAGE MATCH ── */}
        <div className="surface-card is-interactive group md:col-span-5 rounded-3xl p-6 sm:p-7 text-slate-950 dark:text-white flex flex-col justify-between">
          <div>
            <div className="tile tile-violet mb-4">
              <Camera className="w-5 h-5" />
            </div>

            <div className="text-sm font-medium text-amber-700 dark:text-amber-400 mb-1">
              {language === "uz" ? "Rasm bo'yicha qidiruv" : language === "ru" ? "Поиск по фото" : "Photo search"}
            </div>

            <h3 className="font-display font-bold text-xl text-slate-950 dark:text-white mb-2">
              {language === "uz" ? "Rasm bo'yicha qidirish" : language === "ru" ? "Поиск по фото" : "Search by photo"}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6 font-medium">
              {language === "uz" ? "Mahsulot rasmini yuklang — biz modelni aniqlab, qaysi do'konda arzonroq ekanini ko'rsatamiz." : language === "ru" ? "Загрузите фото товара — мы определим модель и покажем, где он дешевле." : "Upload a photo of a product. We'll identify the model and show where it costs less."}
            </p>
          </div>

          <button
            onClick={() => {
              cyberSound.playClick();
              setShowImageModal(true);
            }}
            className="w-full h-11 rounded-lg btn-luxury-gold font-medium text-sm transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Camera className="w-4 h-4 text-white" />
            <span>
              {language === "uz" ? "Rasm yuklash" : language === "ru" ? "Загрузить фото" : "Upload a photo"}
            </span>
          </button>
        </div>

        {/* ── CARD 4 (Col 7): SOCIAL WEDDING & WISHLIST REGISTRY ── */}
        <div className="surface-card is-interactive group md:col-span-7 rounded-3xl p-6 sm:p-7 text-slate-950 dark:text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="tile tile-rose">
                <Heart className="w-5 h-5" />
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {language === "uz" ? "Takrorlanmas sovg'alar" : language === "ru" ? "Без повторов" : "No duplicate gifts"}
              </span>
            </div>

            <h3 className="font-display font-bold text-xl text-slate-950 dark:text-white mb-2">
              {language === "uz" ? "To'y va istaklar ro'yxati" : language === "ru" ? "Свадебный список и вишлист" : "Wedding registries and wishlists"}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6 font-medium">
              {language === "uz" ? "Ro'yxat tuzing va havolani mehmonlarga yuboring. Sovg'a band qilinganda boshqalar uni ko'radi, shuning uchun ikkita bir xil sovg'a kelmaydi." : language === "ru" ? "Составьте список и отправьте ссылку гостям. Забронированный подарок видят все, поэтому одинаковых подарков не будет." : "Make a list and share the link with guests. Once a gift is reserved everyone can see it, so nobody buys the same thing twice."}
            </p>

            {/* Registry Preview Card */}
            <div className="bg-[#f7f7fa] dark:bg-white/[0.03] rounded-xl p-4 border border-[var(--line)] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-700 font-bold text-sm">
                  💍
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-950 dark:text-white">
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
              {language === "uz" ? "Bitta havola orqali ulashing" : language === "ru" ? "Делитесь одной ссылкой" : "Share it with one link"}
            </span>
            <Link href="/wedding" className="text-rose-700 dark:text-rose-400 hover:text-rose-900 dark:hover:text-rose-300 font-bold flex items-center gap-1">
              <span>
                {language === "uz" ? "Ro'yxat yaratish" : language === "ru" ? "Создать список" : "Create a registry"}
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
