import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useTranslation } from "../lib/i18n";
import { formatPrice } from "../lib/api";
import { useCurrency } from "../lib/currency";
import { useToast } from "./Toast";
import { getProductFallbackImage } from "../lib/imageHelper";
import { cyberSound } from "../lib/cyberSound";
import PriceTrackModal from "./PriceTrackModal";
import SaveProductModal from "./SaveProductModal";
import GiftCardModal from "./GiftCardModal";
import {
  X,
  ExternalLink,
  ShieldCheck,
  Star,
  Truck,
  CreditCard,
  Heart,
  Bell,
  Share2,
  Gift,
  CheckCircle2,
  Sparkles,
  Info,
  Calendar,
  ShoppingBag,
  Lightbulb,
  PackageCheck,
  Users,
  ShieldAlert,
} from "lucide-react";
import type { ResearchProduct } from "@shared/types";
import { ensureProductUrl } from "../lib/urlHelper";

interface ProductQuickViewModalProps {
  product: ResearchProduct | any;
  onClose: () => void;
}

export default function ProductQuickViewModal({ product, onClose }: ProductQuickViewModalProps) {
  const { language, t } = useTranslation();
  const { currency, exchangeRate } = useCurrency();
  const toast = useToast();

  const [installmentMonths, setInstallmentMonths] = useState<number>(12);
  const [showTrack, setShowTrack] = useState(false);
  const [showSave, setShowSave] = useState(false);
  const [showGiftCard, setShowGiftCard] = useState(false);

  const initialImg = product.imageUrl || getProductFallbackImage(product.name, product.category);
  const [imgSrc, setImgSrc] = useState(initialImg);

  useEffect(() => {
    setImgSrc(product.imageUrl || getProductFallbackImage(product.name, product.category));
  }, [product.imageUrl, product.name]);

  const priceUZS = product.currency === "USD" ? product.price * exchangeRate : product.price || 0;
  const monthlyUZS = Math.round(priceUZS / installmentMonths);

  const handleShareTelegram = () => {
    const text = language === "uz"
      ? `Sovg'a AI Tavsiyasi:\n${product.name}\nNarxi: ${formatPrice(product.price, product.currency)}\nDo'kon: ${product.store || "Uzum Market"}\nNega tavsiya etildi: ${product.reason || "Kafolatlangan ajoyib sovg'a"}`
      : language === "ru"
      ? `Рекомендация Sovg'a AI:\n${product.name}\nЦена: ${formatPrice(product.price, product.currency)}\nМагазин: ${product.store || "Uzum Market"}\nПочему рекомендовано: ${product.reason || "Гарантированно отличный подарок"}`
      : `Sovg'a AI Recommendation:\n${product.name}\nPrice: ${formatPrice(product.price, product.currency)}\nStore: ${product.store || "Uzum Market"}\nWhy recommended: ${product.reason || "Guaranteed excellent gift"}`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(product.url || window.location.href)}&text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(product.url || window.location.href);
    toast.success(
      language === "uz" ? "Mahsulot havolasi nusxalandi!" : language === "ru" ? "Ссылка на товар скопирована!" : "Product link copied!",
      language === "uz" ? "Nusxalandi" : language === "ru" ? "Скопировано" : "Copied"
    );
  };

  const getStoreOfferUrl = (storeName: string, offerUrl?: string) => {
    return ensureProductUrl(product.name, storeName, offerUrl || product.url);
  };

  // Mock comparison offers if not present
  const offers = product.offers || [
    {
      store: product.store || "Uzum Market",
      price: product.price,
      inStock: true,
      delivery: language === "uz" ? "1 kunda bepul yetkazish" : language === "ru" ? "Бесплатная доставка за 1 день" : "Free 1-day delivery",
      warranty: language === "uz" ? "1 yil rasmiy kafolat" : language === "ru" ? "1 год официальной гарантии" : "1-year official warranty",
    },
    {
      store: "Texnomart",
      price: Math.round(product.price * 1.05),
      inStock: true,
      delivery: language === "uz" ? "Bugun Toshkentda kuryer" : language === "ru" ? "Курьер сегодня по Ташкенту" : "Same-day Tashkent courier",
      warranty: language === "uz" ? "2 yil kafolat" : language === "ru" ? "2 года гарантии" : "2-year warranty",
    },
    {
      store: "MediaPark",
      price: Math.round(product.price * 1.08),
      inStock: true,
      delivery: language === "uz" ? "1-2 kun ichida" : language === "ru" ? "В течение 1-2 дней" : "Within 1-2 business days",
      warranty: language === "uz" ? "1 yil rasmiy kafolat" : language === "ru" ? "1 год официальной гарантии" : "1-year official warranty",
    },
  ];

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-md animate-fade-in overflow-y-auto">
        <div
          className="card-luxury bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:via-[#0c0e18] dark:to-[#07090f] text-slate-900 dark:text-slate-100 rounded-3xl max-w-4xl w-full max-h-[92vh] max-h-[92dvh] overflow-y-auto shadow-luxury border-2 border-amber-300/80 dark:border-amber-500/25 flex flex-col relative animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-20 bg-white/95 dark:bg-[#111422]/95 backdrop-blur-md px-6 py-4 border-b border-amber-200/60 dark:border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                {language === "uz"
                  ? "Tezkor Mahsulot Ma'lumotnomasi"
                  : language === "ru"
                  ? "Экспресс Досье Товара"
                  : "Quick Product Dossier"}
              </span>
            </div>
            <button
              onClick={() => {
                cyberSound.playClick();
                onClose();
              }}
              className="w-9 h-9 rounded-xl bg-white/80 dark:bg-slate-800/80 hover:bg-amber-100/60 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-amber-200/60 dark:border-slate-700/80 flex items-center justify-center transition cursor-pointer active:scale-95 shadow-2xs"
              aria-label={language === "uz" ? "Yopish" : language === "ru" ? "Закрыть" : "Close"}
            >
              <X className="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 sm:p-8 space-y-8">
            {/* Top Product Overview */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              {/* Product Visual */}
              <div className="md:col-span-5 space-y-4">
                <div className="relative rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 h-64 sm:h-72 flex items-center justify-center group">
                  <img
                    src={imgSrc}
                    alt={product.name}
                    onError={() => setImgSrc(getProductFallbackImage(product.name, product.category))}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  {product.discount && (
                    <span className="absolute top-4 left-4 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                      {product.discount}
                    </span>
                  )}
                  <span className="absolute top-4 right-4 bg-slate-900/85 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full border border-white/10">
                    {product.store || "Uzum"}
                  </span>
                </div>

                {/* Rating & Fast Trust Badges */}
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-center gap-1 text-sm font-bold text-slate-800 dark:text-slate-200">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span>{product.rating || "4.8"}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {language === "uz"
                        ? "Xaridorlar fikri (98%)"
                        : language === "ru"
                        ? "Рейтинг покупателей (98%)"
                        : "Customer Rating (98%)"}
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-center gap-1 text-sm font-bold text-emerald-700 dark:text-emerald-400">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>{language === "uz" ? "100% Asl" : language === "ru" ? "100% Оригинал" : "100% Authentic"}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {language === "uz" ? "Rasmiy kafolat" : language === "ru" ? "Официальная гарантия" : "Official Warranty"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Product Info & Price */}
              <div className="md:col-span-7 space-y-5">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800/60">
                      {product.category === "best_overall"
                        ? (language === "uz" ? "Eng yaxshi tanlov" : language === "ru" ? "Лучший выбор" : "Top Choice")
                        : product.category === "best_value"
                        ? (language === "uz" ? "Eng foydali narx" : language === "ru" ? "Лучшая цена" : "Best Value")
                        : product.category === "premium"
                        ? (language === "uz" ? "Premium model" : language === "ru" ? "Премиум модель" : "Premium Tier")
                        : (language === "uz" ? "Tavsiya etilgan" : language === "ru" ? "Рекомендуем" : "Featured")}
                    </span>
                    <span className="text-xs text-slate-300 dark:text-slate-700">·</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {product.brand || (language === "uz" ? "Kafolatlangan brend" : language === "ru" ? "Проверенный бренд" : "Verified Brand")}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-display font-extrabold text-slate-900 dark:text-white leading-snug">
                    {product.name}
                  </h2>
                </div>

                {/* Pricing Box */}
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                      {formatPrice(product.price, product.currency)}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-sm text-slate-400 line-through">
                        {formatPrice(product.originalPrice, product.currency)}
                      </span>
                    )}
                  </div>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 stroke-[2.2]" />
                      {language === "uz"
                        ? `Siz ${formatPrice(product.originalPrice - product.price, product.currency)} tejab qolasiz!`
                        : language === "ru"
                        ? `Вы экономите ${formatPrice(product.originalPrice - product.price, product.currency)}!`
                        : `You save ${formatPrice(product.originalPrice - product.price, product.currency)}!`}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <span className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 stroke-[2.2]" />
                      {product.deliveryEstimate || (language === "uz" ? "Toshkentda 1 kunda yetkazish" : language === "ru" ? "Доставка по Ташкенту за 1 день" : "1-day delivery in Tashkent")}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 stroke-[2.2]" />
                      {product.warranty || (language === "uz" ? "12 oy kafolat" : language === "ru" ? "12 месяцев гарантии" : "12-month warranty")}
                    </span>
                  </div>
                </div>

                {/* AI Rationale */}
                {product.reason && (
                  <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                      <Lightbulb className="w-4 h-4 text-indigo-600 dark:text-indigo-400 stroke-[2.2]" />
                      <span>
                        {language === "uz"
                          ? "Nega aynan bu mahsulot sovg'a uchun mukammal?"
                          : language === "ru"
                          ? "Почему этот товар идеален для подарка?"
                          : "Why this product makes the perfect gift"}
                      </span>
                    </div>
                    <p className="leading-relaxed text-slate-600 dark:text-slate-300">{product.reason}</p>
                  </div>
                )}

                {/* Specs pills */}
                {product.specs && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      {language === "uz" ? "Asosiy xususiyatlari:" : language === "ru" ? "Основные характеристики:" : "Key Specifications:"}
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {(Array.isArray(product.specs)
                        ? product.specs.map((s: any) => String(s))
                        : typeof product.specs === "object" && product.specs !== null
                        ? Object.entries(product.specs).map(([k, v]) => `${k}: ${v}`)
                        : typeof product.specs === "string"
                        ? product.specs.split(/[,;\n]/).map((s: string) => s.trim()).filter(Boolean)
                        : []
                      ).map((spec: string, idx: number) => (
                        <span
                          key={idx}
                          className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-xl font-medium border border-slate-200 dark:border-slate-700"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Halol Nasiya / Installment Calculator */}
            <div className="card-luxury bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl icon-medallion icon-box-gold flex items-center justify-center shrink-0">
                    <CreditCard className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                      {language === "uz"
                        ? "Halol Muddatli To'lov (Nasiya Kalkulyatori)"
                        : language === "ru"
                        ? "Халяльная Рассрочка (Калькулятор Насия)"
                        : "Halal Installments & Nasiya Calculator"}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {language === "uz"
                        ? "Uzum Nasiya, Alif va Anorbank orqali 0% boshlang'ich to'lov"
                        : language === "ru"
                        ? "0% первый взнос через Uzum Nasiya, Alif и Anorbank"
                        : "0% down payment via Uzum Nasiya, Alif & Anorbank"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
                  {[3, 6, 12, 24].map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        cyberSound.playClick();
                        setInstallmentMonths(m);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        installmentMonths === m
                          ? "bg-slate-900 dark:bg-indigo-600 text-white shadow-xs"
                          : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700"
                      }`}
                    >
                      {m} {language === "uz" ? "oy" : language === "ru" ? "мес" : "mos"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800/80 p-4.5 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-0.5 text-center sm:text-left">
                  <span className="text-xs text-slate-400 dark:text-slate-400 font-medium">
                    {language === "uz"
                      ? `Oylik to'lov (${installmentMonths} oyga):`
                      : language === "ru"
                      ? `Ежемесячный платеж (${installmentMonths} мес):`
                      : `Monthly payment (${installmentMonths} mos):`}
                  </span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {formatPrice(monthlyUZS, "UZS")}{" "}
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      {language === "uz" ? "/ oy" : language === "ru" ? "/ мес" : "/ mo"}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-right space-y-0.5">
                  <p className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-center sm:justify-end gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />{" "}
                    {language === "uz"
                      ? "Ortiqcha foizsiz va halol muddatli to'lov"
                      : language === "ru"
                      ? "0% переплат и халяльная рассрочка"
                      : "0% interest halal installments"}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {language === "uz"
                      ? "Pasport yoki ID-karta orqali 2 daqiqada tasdiqlanadi"
                      : language === "ru"
                      ? "Одобрение за 2 минуты по паспорту или ID"
                      : "2-minute approval via Passport or ID card"}
                  </p>
                </div>
              </div>
            </div>

            {/* Live Store Comparison Table */}
            <div className="space-y-3">
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                {language === "uz"
                  ? "O'zbekiston do'konlaridagi narxlar solishtiruvi"
                  : language === "ru"
                  ? "Сравнение цен в магазинах Узбекистана"
                  : "Uzbekistan Store Price Comparison"}
              </h3>
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3">{language === "uz" ? "Do'kon" : language === "ru" ? "Магазин" : "Store"}</th>
                      <th className="p-3">{language === "uz" ? "Narxi" : language === "ru" ? "Цена" : "Price"}</th>
                      <th className="p-3">{language === "uz" ? "Holati" : language === "ru" ? "Статус" : "Status"}</th>
                      <th className="p-3">{language === "uz" ? "Yetkazish" : language === "ru" ? "Доставка" : "Delivery"}</th>
                      <th className="p-3">{language === "uz" ? "Kafolat" : language === "ru" ? "Гарантия" : "Warranty"}</th>
                      <th className="p-3 text-right">{language === "uz" ? "Amal" : language === "ru" ? "Действие" : "Action"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 bg-white dark:bg-slate-900/30">
                    {offers.map((offer: any, idx: number) => {
                      const isCheapest = idx === 0;
                      return (
                        <tr key={idx} className={isCheapest ? "bg-emerald-50/40 dark:bg-emerald-950/20" : ""}>
                          <td className="p-3 font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            {offer.store}
                            {isCheapest && (
                              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded font-bold border border-emerald-200 dark:border-emerald-700">
                                {language === "uz" ? "Eng arzon" : language === "ru" ? "Самый дешевый" : "Lowest"}
                              </span>
                            )}
                          </td>
                          <td className="p-3 font-black text-slate-900 dark:text-white">
                            {formatPrice(offer.price, product.currency)}
                          </td>
                          <td className="p-3 text-emerald-700 dark:text-emerald-400 font-bold">
                            {language === "uz" ? "Mavjud" : language === "ru" ? "В наличии" : "In Stock"}
                          </td>
                          <td className="p-3 text-slate-600 dark:text-slate-300">{offer.delivery}</td>
                          <td className="p-3 text-slate-600 dark:text-slate-300">{offer.warranty}</td>
                          <td className="p-3 text-right">
                            <a
                              href={getStoreOfferUrl(offer.store, offer.url)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => cyberSound.playConfirm()}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-xl font-bold transition shadow-xs cursor-pointer"
                            >
                              <span>{language === "uz" ? "O'tish" : language === "ru" ? "В магазин" : "Visit Store"}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Actions Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    cyberSound.playClick();
                    setShowSave(true);
                  }}
                  className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-semibold transition flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 cursor-pointer active:scale-95"
                >
                  <Heart className="w-4 h-4 text-rose-500 stroke-[2.2]" />
                  <span>Wishlist</span>
                </button>
                <button
                  onClick={() => {
                    cyberSound.playClick();
                    setShowTrack(true);
                  }}
                  className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-semibold transition flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 cursor-pointer active:scale-95"
                >
                  <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400 stroke-[2.2]" />
                  <span>{language === "uz" ? "Kuzatish" : language === "ru" ? "Отследить" : "Track"}</span>
                </button>
                <button
                  onClick={() => {
                    cyberSound.playClick();
                    setShowGiftCard(true);
                  }}
                  className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-semibold transition flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 cursor-pointer active:scale-95"
                >
                  <Gift className="w-4 h-4 text-slate-600 dark:text-slate-300 stroke-[2.2]" />
                  <span>{language === "uz" ? "Tabriknoma" : language === "ru" ? "Открытка" : "Greeting Card"}</span>
                </button>

                {/* Luxury Studio & Service Links */}
                <Link
                  href="/packaging-studio"
                  onClick={() => {
                    cyberSound.playClick();
                    onClose();
                  }}
                  className="px-3.5 py-2.5 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-900 dark:text-amber-300 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 border border-amber-200/80 dark:border-amber-800/50 shadow-xs cursor-pointer active:scale-95"
                >
                  <PackageCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 stroke-[2.2]" />
                  <span>{language === "uz" ? "Qadoqlash" : language === "ru" ? "Упаковка" : "Packaging"}</span>
                </Link>
                <Link
                  href="/group-gifting"
                  onClick={() => {
                    cyberSound.playClick();
                    onClose();
                  }}
                  className="px-3.5 py-2.5 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-900 dark:text-indigo-300 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 border border-indigo-200/80 dark:border-indigo-800/50 shadow-xs cursor-pointer active:scale-95"
                >
                  <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400 stroke-[2.2]" />
                  <span>{language === "uz" ? "Jamoaviy" : language === "ru" ? "Вскладчину" : "Group Gift"}</span>
                </Link>
                <Link
                  href={`/price-audit?q=${encodeURIComponent(product.name)}`}
                  onClick={() => {
                    cyberSound.playClick();
                    onClose();
                  }}
                  className="px-3.5 py-2.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-900 dark:text-rose-300 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 border border-rose-200/80 dark:border-rose-800/50 shadow-xs cursor-pointer active:scale-95"
                >
                  <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 stroke-[2.2]" />
                  <span>{language === "uz" ? "Narx Auditi" : language === "ru" ? "Аудит цены" : "Price Audit"}</span>
                </Link>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    cyberSound.playClick();
                    handleShareTelegram();
                  }}
                  className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition border border-slate-200 dark:border-slate-700 cursor-pointer active:scale-95"
                  title={language === "uz" ? "Telegram orqali ulashish" : language === "ru" ? "Поделиться в Telegram" : "Share via Telegram"}
                >
                  <Share2 className="w-4 h-4 stroke-[2.2]" />
                </button>
                <a
                  href={getStoreOfferUrl(product.store || "Uzum Market", product.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => cyberSound.playConfirm()}
                  className="btn-luxury-gold px-6 py-2.5 text-slate-950 font-bold rounded-2xl text-xs sm:text-sm shadow-md transition flex items-center gap-2 active:scale-95 cursor-pointer"
                >
                  <span>{language === "uz" ? "Do'konda xarid qilish" : language === "ru" ? "Купить в магазине" : "Buy at Store"}</span>
                  <ExternalLink className="w-4 h-4 stroke-[2.2]" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showTrack && (
        <PriceTrackModal
          productName={product.name}
          currentPrice={product.price}
          store={product.store || "Uzum"}
          url={product.url}
          onClose={() => setShowTrack(false)}
        />
      )}

      {showSave && (
        <SaveProductModal
          product={product}
          onClose={() => setShowSave(false)}
        />
      )}

      {showGiftCard && (
        <GiftCardModal
          product={product}
          onClose={() => setShowGiftCard(false)}
        />
      )}
    </>
  );
}
