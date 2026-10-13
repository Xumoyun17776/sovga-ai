import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useTranslation, trData } from "../lib/i18n";
import { formatPrice } from "../lib/api";
import { getProductFallbackImage } from "../lib/imageHelper";
import {
  ExternalLink,
  Heart,
  BarChart2,
  ChevronDown,
  ChevronUp,
  Star,
  AlertTriangle,
  Info,
  ShieldCheck,
  Send,
  Bell,
  Truck,
  Gift,
  Eye,
  CreditCard,
  ShoppingBag,
  Store,
  ArrowUpRight,
  PackageCheck,
  Users,
  Sparkles,
} from "../lib/icons";
import type { ResearchProduct } from "@shared/types";
import { ensureProductUrl } from "../lib/urlHelper";
import { cyberSound } from "../lib/cyberSound";
import PriceComparisonModal from "./PriceComparisonModal";
import SaveProductModal from "./SaveProductModal";
import PriceTrackModal from "./PriceTrackModal";
import GiftCardModal from "./GiftCardModal";
import ProductQuickViewModal from "./ProductQuickViewModal";
import DirectOrderModal from "./DirectOrderModal";

const categoryColors: Record<string, string> = {
  best_overall: "bg-slate-900 text-white",
  best_value: "bg-emerald-600 text-white",
  cheapest: "bg-blue-600 text-white",
  premium: "bg-indigo-600 text-white",
  most_unique: "bg-violet-600 text-white",
  alternative: "bg-slate-700 text-white",
};

const categoryGradients: Record<string, string> = {
  best_overall: "bg-slate-900",
  best_value: "bg-emerald-700",
  cheapest: "bg-blue-700",
  premium: "bg-indigo-800",
  most_unique: "bg-violet-800",
  alternative: "bg-slate-700",
};

const getStoreBadgeClass = (storeName: string) => {
  const s = (storeName || "").toLowerCase();
  if (s.includes("uzum")) return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/50";
  if (s.includes("olcha")) return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/50";
  if (s.includes("texnomart")) return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/50";
  if (s.includes("mediapark")) return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50";
  if (s.includes("asaxiy")) return "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/50";
  if (s.includes("idea")) return "bg-amber-50 text-amber-700 border-[var(--line)] dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50";
  if (s.includes("yandex")) return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/50";
  return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:border-white/10";
};

const getStoreDot = (storeName: string) => {
  const s = (storeName || "").toLowerCase();
  if (s.includes("uzum")) return "bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]";
  if (s.includes("olcha")) return "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]";
  if (s.includes("texnomart")) return "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]";
  if (s.includes("mediapark")) return "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]";
  if (s.includes("asaxiy")) return "bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.6)]";
  if (s.includes("idea")) return "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]";
  if (s.includes("yandex")) return "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]";
  return "bg-slate-500";
};

export default function ProductCard({
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

  return (
    <>
      <div
        className={`bg-white dark:bg-[#0b1224] card-luxury-elevated rounded-2xl overflow-hidden group flex flex-col justify-between border ${
          isBestPrice
            ? "ring-2 ring-emerald-500/80 border-emerald-500/60"
            : "border-[var(--line)] dark:border-white/10 hover:border-[var(--line-strong)] dark:hover:border-amber-500/30 shadow-sm hover:shadow-luxury-hover"
        }`}
      >
        <div>
          {/* Category badge + Image with refined aspect ratio and zoom */}
          <div
            onClick={() => setShowQuickView(true)}
            className={`h-52 ${
              categoryGradients[product.category] || categoryGradients.alternative
            } relative flex items-center justify-center overflow-hidden cursor-pointer`}
            title="Tezkor ma'lumotlarni ko'rish"
          >
            <img
              src={imgSrc}
              alt={product.name}
              loading="lazy"
              decoding="async"
              onError={() => setImgSrc(getProductFallbackImage(product.name, product.category))}
              className="w-full h-full object-cover transition-transform duration-200 ease-out"
            />

            {/* Category Badge */}
            <span
              className={`absolute top-3.5 left-3.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide ${
                categoryColors[product.category] || categoryColors.alternative
              } shadow-sm backdrop-blur-md border border-white/10 z-10`}
            >
              {categoryLabel}
            </span>

            {/* Glowing Best Price Ribbon Badge */}
            {isBestPrice && (
              <div className="absolute bottom-3 left-3 z-10 px-3 py-1 rounded-full bg-emerald-600/95 text-white font-bold text-[10px] uppercase tracking-wider shadow-lg flex items-center gap-1.5 border border-emerald-400 backdrop-blur-md">
                <Sparkles className="w-3 h-3 text-emerald-200 fill-emerald-200" />
                <span>
                  {language === "uz"
                    ? "Eng arzon bozor narxi"
                    : language === "ru"
                    ? "Лучшая цена на рынке"
                    : "Lowest Market Price"}
                </span>
              </div>
            )}

            {/* Direct Store Launch Pill on Top Right */}
            <a
              href={ensureProductUrl(product.name, product.store, product.url)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="absolute top-3.5 right-3.5 px-3 py-1 rounded-full bg-white/95 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100 text-[11px] font-bold shadow-sm backdrop-blur-md border border-slate-200/90 dark:border-white/10 flex items-center gap-1.5 transition-all z-10"
              title={`${product.store} do'konida to'g'ridan-to'g'ri ochish`}
            >
              <span className={`w-2 h-2 rounded-full ${getStoreDot(product.store)}`}></span>
              <span className="hidden sm:inline font-semibold">{product.store}</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            </a>

            {/* Hover quick view overlay */}
            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
              <span className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold px-3.5 py-2 rounded-full shadow-sm flex items-center gap-1.5 backdrop-blur-md border border-slate-200/60 dark:border-white/10 transform group-hover:scale-100 scale-95 transition-all duration-300">
                <Eye className="w-3.5 h-3.5 text-amber-500" />
                <span>{language === "uz" ? "Tezkor ko'rish" : language === "ru" ? "Быстрый просмотр" : "Quick View"}</span>
              </span>
            </div>
          </div>

          <div className="p-5 space-y-3.5">
            {/* Store & Rating row */}
            <div className="flex items-center justify-between text-xs">
              <span className={`font-semibold px-2.5 py-1 rounded-xl border flex items-center gap-2 dark:bg-slate-800/70 dark:border-white/10 dark:text-slate-200 ${getStoreBadgeClass(product.store)}`}>
                <span className={`w-2 h-2 rounded-full ${getStoreDot(product.store)}`}></span>
                <span>{product.store}</span>
              </span>
              <div className="flex items-center gap-1.5">
                {product.rating && (
                  <span className="text-xs text-slate-700 dark:text-slate-200 flex items-center gap-1 font-bold bg-slate-100/90 dark:bg-slate-800/80 px-2 py-0.5 rounded-lg border border-slate-200/70 dark:border-white/10">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    {product.rating}
                    {product.reviewCount ? ` (${product.reviewCount})` : ""}
                  </span>
                )}
                {product.priceVerified ? (
                  <span
                    className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg border border-emerald-200/60 dark:border-emerald-800/50 flex items-center gap-1"
                    title={language === "uz" ? "Narx va ombor tasdiqlangan" : language === "ru" ? "Цена и наличие проверены" : "Price and inventory verified"}
                  >
                    <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    {language === "uz" ? "Tasdiqlangan" : language === "ru" ? "Проверено" : "Verified"}
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-lg flex items-center gap-1 border border-[var(--line)] bg-[#f4f5f8] dark:bg-white/5 text-slate-600 dark:text-slate-300 border-[var(--line)]">
                    <AlertTriangle className="w-2.5 h-2.5" />
                    {t("results.priceNotVerified")}
                  </span>
                )}
              </div>
            </div>

            {/* Title */}
            <h3
              onClick={() => setShowQuickView(true)}
              className="font-display font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition cursor-pointer"
            >
              {product.name}
            </h3>

            {/* Price Row */}
            <div className="flex items-baseline gap-2.5 pt-0.5">
              <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {formatPrice(product.price, product.currency)}
              </span>
              {product.originalPrice && product.originalPrice > (product.price || 0) && (
                <span className="text-xs text-slate-400 dark:text-slate-500 line-through">
                  {formatPrice(product.originalPrice, product.currency)}
                </span>
              )}
              {product.discount && (
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/50 px-2 py-0.5 rounded-lg ml-auto">
                  {product.discount}
                </span>
              )}
            </div>

            {/* Installment & Halol Nasiya Chip */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold text-amber-950 dark:text-slate-200 bg-amber-50/70 dark:bg-slate-800/60 border border-[var(--line)] dark:border-white/10 px-3 py-1.5 rounded-xl flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" />
                  <span className="truncate">
                    {product.installment ||
                      (product.price
                        ? `${formatPrice(Math.round(product.price / 12), product.currency)}/mo (${
                            language === "uz" ? "Halol Nasiya" : language === "ru" ? "Халяль Рассрочка" : "0% Installments"
                          })`
                        : language === "uz"
                        ? "Muddatli to'lov mavjud"
                        : language === "ru"
                        ? "Рассрочка доступна"
                        : "Installments available")}
                  </span>
                </span>
              </div>
              {product.deliveryEstimate && (
                <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium flex items-center gap-1.5 px-1">
                  <Truck className="w-3.5 h-3.5 text-amber-600 dark:text-slate-500 flex-shrink-0" />
                  <span className="truncate">{trData(product.deliveryEstimate)}</span>
                </div>
              )}
            </div>

            {/* Specs Pills */}
            {product.specs && (
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {(Array.isArray(product.specs)
                  ? product.specs.slice(0, 3).map((s: any) => String(s))
                  : Object.entries(product.specs).slice(0, 3).map(([k, v]) => `${k}: ${v}`)
                ).map((specText: string, sIdx: number) => (
                  <span key={sIdx} className="text-[10px] dark:bg-slate-800/80 dark:text-slate-300 px-2.5 py-0.5 rounded-md font-bold border border-[var(--line)] dark:border-white/10 bg-[#f4f5f8] dark:bg-white/5 text-slate-600 dark:text-slate-300 border-[var(--line)]">
                    {specText}
                  </span>
                ))}
              </div>
            )}

            {/* Primary Action Row */}
            <div className="space-y-2 pt-3 border-t border-[var(--line)] dark:border-white/10">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    cyberSound.playClick();
                    setShowQuickView(true);
                  }}
                  title={language === "uz" ? "Tezkor ko'rish" : language === "ru" ? "Быстрый просмотр" : "Quick View"}
                  className="px-3 py-2.5 rounded-xl border border-[var(--line)] dark:border-white/10 hover:border-[var(--line-strong)] hover:bg-amber-100/70 dark:hover:bg-slate-800/80 text-amber-950 dark:text-slate-200 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
                >
                  <Eye className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500 stroke-[2.2]" />
                  <span>{language === "uz" ? "Ko'rish" : language === "ru" ? "Обзор" : "View"}</span>
                </button>

                <a
                  href={ensureProductUrl(product.name, product.store, product.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => cyberSound.playConfirm()}
                  title={language === "uz" ? `${product.store} do'konida ochish` : language === "ru" ? `Открыть в ${product.store}` : `Open on ${product.store}`}
                  className={`flex-1 min-w-0 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition shadow-sm cursor-pointer text-center ${
                    isBestPrice
                      ? "text-white shadow-md ring-1 ring-emerald-400/40 bg-emerald-600 hover:bg-emerald-500"
                      : "btn-luxury-gold"
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5 stroke-[2.2]" />
                  <span className="truncate">
                    {isBestPrice
                      ? language === "uz"
                        ? `${product.store}da eng arzonga olish`
                        : language === "ru"
                        ? `Купить выгодно в ${product.store}`
                        : `Buy lowest on ${product.store}`
                      : language === "uz"
                      ? `${product.store}da xarid qilish`
                      : language === "ru"
                      ? `Купить в ${product.store}`
                      : `Buy on ${product.store}`}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 shrink-0 opacity-80 stroke-[2.2]" />
                </a>

                <button
                  onClick={() => {
                    cyberSound.playClick();
                    setShowDirectOrder(true);
                  }}
                  title={language === "uz" ? "Ilovada tezkor buyurtma" : language === "ru" ? "Прямой заказ в приложении" : "Direct In-App Order"}
                  className="w-10 h-10 rounded-xl border border-slate-200 dark:border-white/10 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold text-xs transition flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <Truck className="w-4 h-4 stroke-[2.2]" />
                </button>
              </div>

              {/* Secondary Micro-Actions Tray */}
              <div className="flex items-center justify-between gap-1 pt-2 border-t border-slate-100/80 dark:border-white/10 text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      cyberSound.playClick();
                      setShowSave(true);
                    }}
                    title={language === "uz" ? "Istaklar ro'yxatiga saqlash" : language === "ru" ? "Сохранить в избранное" : "Save to wishlist"}
                    className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 border border-transparent hover:border-rose-200 dark:hover:border-rose-900/50 transition-all cursor-pointer"
                  >
                    <Heart className="w-3.5 h-3.5 stroke-[2.2]" />
                  </button>

                  <button
                    onClick={() => {
                      cyberSound.playClick();
                      setShowCompare(true);
                    }}
                    title={language === "uz" ? "Boshqa do'konlar narxlarini solishtirish" : language === "ru" ? "Сравнить цены в магазинах" : "Compare all store prices"}
                    className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 border border-transparent hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all cursor-pointer"
                  >
                    <BarChart2 className="w-3.5 h-3.5 stroke-[2.2]" />
                  </button>

                  <button
                    onClick={() => {
                      cyberSound.playClick();
                      setShowTrack(true);
                    }}
                    title={language === "uz" ? "Narx tushishini kuzatish" : language === "ru" ? "Отслеживать снижение цены" : "Track price drops"}
                    className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 border border-transparent hover:border-[var(--line-strong)] dark:hover:border-amber-900/50 transition-all cursor-pointer"
                  >
                    <Bell className="w-3.5 h-3.5 stroke-[2.2]" />
                  </button>

                  <Link
                    href="/packaging-studio"
                    onClick={() => cyberSound.playClick()}
                    title={language === "uz" ? "Qadoqlash Studiyasida bezash" : language === "ru" ? "Оформить в Студии Упаковки" : "Customize in Packaging Studio"}
                    className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 border border-transparent hover:border-[var(--line-strong)] dark:hover:border-amber-900/50 transition-all cursor-pointer"
                  >
                    <PackageCheck className="w-3.5 h-3.5 stroke-[2.2]" />
                  </Link>

                  <Link
                    href="/group-gifting"
                    onClick={() => cyberSound.playClick()}
                    title={language === "uz" ? "Do'stlar bilan ulush hisoblash" : language === "ru" ? "Разделить оплату с друзьями" : "Split cost with friends"}
                    className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-purple-50 dark:hover:bg-purple-950/40 text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 border border-transparent hover:border-purple-200 dark:hover:border-purple-900/50 transition-all cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5 stroke-[2.2]" />
                  </Link>

                  <button
                    onClick={() => {
                      cyberSound.playClick();
                      setShowGiftCard(true);
                    }}
                    title={language === "uz" ? "Tabriknoma yaratish" : language === "ru" ? "Создать открытку" : "Create greeting card"}
                    className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 border border-transparent hover:border-emerald-200 dark:hover:border-emerald-900/50 transition-all cursor-pointer"
                  >
                    <Gift className="w-3.5 h-3.5 stroke-[2.2]" />
                  </button>
                </div>

                <button
                  onClick={handleShareTelegram}
                  title={language === "uz" ? "Telegram orqali ulashish" : language === "ru" ? "Поделиться в Telegram" : "Share via Telegram"}
                  className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-sky-50 dark:hover:bg-sky-950/40 text-sky-500 hover:text-sky-600 dark:hover:text-sky-400 border border-transparent hover:border-sky-200 dark:hover:border-sky-900/50 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-sky-500 stroke-[2.2]" />
                </button>
              </div>
            </div>

            {/* Why recommended toggle */}
            <button
              onClick={() => setShowWhy(!showWhy)}
              className="w-full text-left text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1.5 pt-1 transition"
            >
              <Info className="w-3.5 h-3.5 text-amber-500" />
              <span>{t("results.whyRecommended")}</span>
              {showWhy ? <ChevronUp className="w-3 h-3 ml-auto text-amber-500" /> : <ChevronDown className="w-3 h-3 ml-auto text-slate-400" />}
            </button>

            {showWhy && (
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-xs text-slate-700 dark:text-slate-300 animate-fade-in leading-relaxed border border-slate-200/90 dark:border-white/10">
                <p>{product.reason}</p>
                <div className="mt-2 pt-2 border-t border-slate-200/80 dark:border-white/10 flex justify-between text-[10px] text-slate-400 dark:text-slate-500">
                  <span>{language === "uz" ? "Tekshirildi:" : language === "ru" ? "Проверено:" : "Verified:"} {new Date(product.lastChecked).toLocaleTimeString()}</span>
                  <span>{language === "uz" ? "Manba:" : language === "ru" ? "Источник:" : "Source:"} {product.source}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showCompare && (
        <PriceComparisonModal
          productName={product.name}
          currentPrice={product.price}
          currentStore={product.store}
          onClose={() => setShowCompare(false)}
        />
      )}

      {showSave && (
        <SaveProductModal
          product={product}
          onClose={() => setShowSave(false)}
        />
      )}

      {showTrack && (
        <PriceTrackModal
          product={product}
          onClose={() => setShowTrack(false)}
        />
      )}

      {showGiftCard && (
        <GiftCardModal
          product={product}
          onClose={() => setShowGiftCard(false)}
        />
      )}

      {showQuickView && (
        <ProductQuickViewModal
          product={product}
          onClose={() => setShowQuickView(false)}
        />
      )}

      {showDirectOrder && (
        <DirectOrderModal
          product={product}
          isOpen={showDirectOrder}
          onClose={() => setShowDirectOrder(false)}
        />
      )}
    </>
  );
}
