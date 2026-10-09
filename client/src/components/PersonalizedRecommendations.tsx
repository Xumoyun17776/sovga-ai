import { useState, useEffect } from "react";
import {
  Sparkles,
  Zap,
  TrendingDown,
  ShoppingBag,
  ArrowRight,
  Star,
  CheckCircle2,
  ExternalLink,
  Flame,
  ShieldCheck,
  Eye,
} from "lucide-react";
import { useTranslation } from "../lib/i18n";
import { formatPrice } from "../lib/api";
import { cyberSound } from "../lib/cyberSound";
import PriceComparisonModal from "./PriceComparisonModal";
import ProductQuickViewModal from "./ProductQuickViewModal";

interface CuratedItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  originalPrice: number;
  discount: string;
  store: string;
  rating: number;
  reviewsCount: number;
  imageUrl: string;
  matchScore: number;
  aiReason: {
    uz: string;
    ru: string;
    en: string;
  };
  delivery: {
    uz: string;
    ru: string;
    en: string;
  };
}

const curatedCatalog: CuratedItem[] = [
  {
    id: "rec-1",
    name: "Sony WH-1000XM5 Wireless Noise Canceling Headphones",
    brand: "Sony",
    category: "Audio & Texnika",
    price: 3200000,
    originalPrice: 3800000,
    discount: "16% off",
    store: "Texnomart",
    rating: 4.9,
    reviewsCount: 290,
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop",
    matchScore: 98,
    aiReason: {
      uz: "O'zbekistonda eng mashhur premium shovqin so'ndiruvchi garnitura. Texnomartda eng arzon narxda.",
      ru: "Флагманские наушники с лучшим шумоподавлением. Самая низкая цена в Texnomart.",
      en: "Industry-leading ANC wireless headphones at lowest verified market price.",
    },
    delivery: {
      uz: "Bugun Toshkent bo'ylab bepul",
      ru: "Сегодня бесплатно по Ташкенту",
      en: "Free same-day Tashkent delivery",
    },
  },
  {
    id: "rec-2",
    name: "De'Longhi Nescafé Dolce Gusto Mini Me Capsule Coffee Machine",
    brand: "De'Longhi",
    category: "Oshxona & Uy",
    price: 650000,
    originalPrice: 790000,
    discount: "18% off",
    store: "Uzum Market",
    rating: 4.8,
    reviewsCount: 142,
    imageUrl: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&auto=format&fit=crop",
    matchScore: 96,
    aiReason: {
      uz: "Sovg'a va uy uchun 1-raqamli ixcham qahva mashinasi. 1 kunlik Uzum yetkazib berish.",
      ru: "Компактная капсульная кофемашина для дома и подарка. Доставка 1 день.",
      en: "Top-rated compact capsule coffee maker with 1-day express fulfillment.",
    },
    delivery: {
      uz: "1 ish kunida Uzum punktiga",
      ru: "1 день в пункт Uzum",
      en: "1 business day to Uzum pickup",
    },
  },
  {
    id: "rec-3",
    name: "Apple AirPods Pro 2nd Gen (USB-C MagSafe Case)",
    brand: "Apple",
    category: "Gadjetlar",
    price: 2750000,
    originalPrice: 3100000,
    discount: "11% off",
    store: "MediaPark",
    rating: 4.9,
    reviewsCount: 420,
    imageUrl: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=600&auto=format&fit=crop",
    matchScore: 95,
    aiReason: {
      uz: "Original USB-C model. Rasmiy 1 yillik O'zbekiston kafolati bilan tekshirildi.",
      ru: "Оригинальная модель USB-C с официальной гарантией 1 год в Узбекистане.",
      en: "Genuine USB-C version with 1-year verified official manufacturer warranty.",
    },
    delivery: {
      uz: "Ertaga yetkazib beriladi",
      ru: "Доставка завтра",
      en: "Delivery tomorrow",
    },
  },
  {
    id: "rec-4",
    name: "Xiaomi Mi Smart Air Fryer 3.5L (OLED Touch)",
    brand: "Xiaomi",
    category: "Aqlli Uy",
    price: 420000,
    originalPrice: 510000,
    discount: "18% off",
    store: "Texnomart",
    rating: 4.7,
    reviewsCount: 380,
    imageUrl: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&auto=format&fit=crop",
    matchScore: 92,
    aiReason: {
      uz: "Yog'siz sog'lom pishirish uchun eng ommabop model. Narx 30 kunlik minimumda.",
      ru: "Популярный аэрогриль для здорового питания. Цена на 30-дневном минимуме.",
      en: "Smart OLED air fryer with Mi Home integration at historic 30-day low.",
    },
    delivery: {
      uz: "Do'kondan olib ketish yoki kuryer",
      ru: "Самовывоз или курьер",
      en: "Store pickup or express courier",
    },
  },
];

export default function PersonalizedRecommendations() {
  const { language } = useTranslation();
  const [selectedProductForCompare, setSelectedProductForCompare] = useState<string | null>(null);
  const [selectedProductForQuickView, setSelectedProductForQuickView] = useState<any | null>(null);

  const handleCompare = (productName: string) => {
    cyberSound.playClick();
    setSelectedProductForCompare(productName);
  };

  const handleQuickView = (item: CuratedItem) => {
    cyberSound.playClick();
    setSelectedProductForQuickView({
      name: item.name,
      price: item.price,
      originalPrice: item.originalPrice,
      currency: "UZS",
      discount: item.discount,
      store: item.store,
      rating: item.rating,
      reviewCount: item.reviewsCount,
      imageUrl: item.imageUrl,
      reason: item.aiReason[language] || item.aiReason.uz,
      warranty: "1 yil rasmiy kafolat",
      deliveryEstimate: item.delivery[language] || item.delivery.uz,
    });
  };

  return (
    <section className="py-8 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/90 dark:bg-amber-500/10 border border-amber-300/80 dark:border-amber-500/20 text-amber-900 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>{language === "uz" ? "Shaxsiy AI Tavsiyalar" : language === "ru" ? "Персональные Рекомендации AI" : "Curated AI Recommendations"}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-black text-slate-900 dark:text-white tracking-tight">
              {language === "uz" ? "Siz Uchun Maxsus Saralangan Top Xaridlar" : language === "ru" ? "Специально Подобрано Для Вас" : "Curated Especially For You"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl font-normal leading-relaxed">
              {language === "uz"
                ? "Toshkent va viloyatlar bo'yicha narxi eng ko'p tushgan, kafolatlangan va haqiqiy xaridorlar tomonidan yuqori baholangan mahsulotlar."
                : language === "ru"
                ? "Товары с максимальными скидками и официальной гарантией в магазинах Узбекистана."
                : "Handpicked deals with the highest price drops and genuine manufacturer warranty in Uzbekistan."}
            </p>
          </div>

          <a
            href="/catalog"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 transition"
          >
            <span>{language === "uz" ? "Barcha 10,000+ mahsulotlar" : language === "ru" ? "Весь каталог 10 000+" : "Browse 10,000+ items"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* 4-Item Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {curatedCatalog.map((item) => (
            <div
              key={item.id}
              className="bg-gradient-to-b from-white via-[#fcfaf5] to-[#f7f2e4] dark:from-[#11131f] dark:to-[#080a11] rounded-3xl border-2 border-amber-200/80 dark:border-slate-800 p-4 shadow-luxury hover:shadow-2xl hover:border-amber-400 dark:hover:border-amber-500/60 transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                {/* Image Container with Badges */}
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-amber-50 dark:bg-slate-800/80 border border-amber-100 dark:border-slate-800">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-lg bg-rose-500 text-white font-mono font-black text-[10px] shadow-sm">
                      {item.discount}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold">
                      {item.store}
                    </span>
                  </div>

                  <div className="absolute bottom-2.5 right-2.5">
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-600/90 text-white font-mono text-[10px] font-bold flex items-center gap-1 shadow-xs">
                      <Zap className="w-3 h-3 text-amber-300" />
                      <span>{item.matchScore}% Match</span>
                    </span>
                  </div>
                </div>

                {/* Rating & Brand */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="font-bold text-amber-800/80 dark:text-slate-400 uppercase text-[10px] tracking-wider">
                    {item.brand} • {item.category}
                  </span>
                  <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    <span>{item.rating}</span>
                    <span className="text-slate-400 font-normal text-[10px]">({item.reviewsCount})</span>
                  </div>
                </div>

                {/* Title */}
                <h3
                  onClick={() => handleQuickView(item)}
                  className="font-display font-bold text-sm text-slate-900 dark:text-white line-clamp-2 hover:text-amber-600 transition cursor-pointer min-h-[2.5rem]"
                  title={item.name}
                >
                  {item.name}
                </h3>

                {/* AI Reason Insight */}
                <div className="p-2.5 rounded-xl bg-amber-50/80 dark:bg-slate-800/60 border border-amber-200/60 dark:border-slate-800 text-[11px] text-amber-950 dark:text-slate-300 line-clamp-2">
                  <span className="font-semibold text-amber-700 dark:text-amber-400">AI Xulosasi: </span>
                  <span>{item.aiReason[language] || item.aiReason.uz}</span>
                </div>
              </div>

              {/* Price & Actions */}
              <div className="pt-3 border-t border-amber-200/60 dark:border-slate-800/80 mt-3 space-y-2.5">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-lg font-black font-display text-slate-900 dark:text-white block">
                      {formatPrice(item.price)}
                    </span>
                    <span className="text-xs text-slate-400 line-through">
                      {formatPrice(item.originalPrice)}
                    </span>
                  </div>

                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Jonli Narx</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleCompare(item.name)}
                    className="py-2.5 px-3 rounded-xl bg-amber-100/70 hover:bg-amber-200/70 dark:bg-slate-800 dark:hover:bg-slate-700 border border-amber-200/80 dark:border-slate-700 text-amber-950 dark:text-slate-200 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
                  >
                    <span>Solishtirish</span>
                  </button>

                  <button
                    onClick={() => handleQuickView(item)}
                    className="py-2.5 px-3 rounded-xl btn-luxury-gold text-amber-200 hover:text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1 shadow-md hover:scale-102"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-300" />
                    <span>Ko'rish</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {selectedProductForCompare && (
        <PriceComparisonModal
          productName={selectedProductForCompare}
          onClose={() => setSelectedProductForCompare(null)}
        />
      )}

      {selectedProductForQuickView && (
        <ProductQuickViewModal
          product={selectedProductForQuickView}
          onClose={() => setSelectedProductForQuickView(null)}
        />
      )}
    </section>
  );
}
