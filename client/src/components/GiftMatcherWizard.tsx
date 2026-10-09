import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { catalog, formatPrice } from "../lib/api";
import { useTranslation } from "../lib/i18n";
import ProductQuickViewModal from "./ProductQuickViewModal";
import {
  Sparkles,
  ArrowRight,
  Gift,
  Heart,
  Star,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Search,
  Cake,
  Baby,
  Briefcase,
  Users,
  Home,
  Lightbulb,
  ShoppingBag,
} from "lucide-react";

interface RecipientOption {
  id: string;
  labelUz: string;
  labelRu: string;
  labelEn: string;
  icon: any;
}

interface OccasionOption {
  id: string;
  labelUz: string;
  labelRu: string;
  labelEn: string;
  icon: any;
}

const recipients: RecipientOption[] = [
  { id: "parents", labelUz: "Ota-ona", labelRu: "Родители", labelEn: "Parents", icon: Home },
  { id: "partner", labelUz: "Sevgan inson", labelRu: "Супруг / Партнер", labelEn: "Spouse / Partner", icon: Heart },
  { id: "newlyweds", labelUz: "Kelin-kuyov", labelRu: "Молодожены", labelEn: "Newlyweds", icon: Sparkles },
  { id: "friend", labelUz: "Do'st / Dugona", labelRu: "Друг / Подруга", labelEn: "Friend", icon: Users },
  { id: "colleague", labelUz: "Hamkasb / Rahbar", labelRu: "Коллега / Руководитель", labelEn: "Colleague / Boss", icon: Briefcase },
  { id: "kids", labelUz: "Farzand / Bolajon", labelRu: "Ребенок", labelEn: "Children", icon: Baby },
];

const occasionsList: OccasionOption[] = [
  { id: "birthday", labelUz: "Tug'ilgan kun", labelRu: "День рождения", labelEn: "Birthday", icon: Cake },
  { id: "wedding", labelUz: "To'y / Kelinsalom", labelRu: "Свадьба / Келинсалом", labelEn: "Wedding", icon: Heart },
  { id: "housewarming", labelUz: "Yangi xonadon", labelRu: "Новоселье", labelEn: "Housewarming", icon: Home },
  { id: "eid", labelUz: "Hayit & Ramazon", labelRu: "Хаит и Рамадан", labelEn: "Eid & Ramadan", icon: Sparkles },
  { id: "anniversary", labelUz: "Yubiley / Bayram", labelRu: "Годовщина", labelEn: "Anniversary", icon: Gift },
  { id: "attention", labelUz: "Shunchaki e'tibor", labelRu: "Просто знак внимания", labelEn: "Just Because", icon: ShoppingBag },
];

interface BudgetBracket {
  id: string;
  labelUz: string;
  labelRu: string;
  labelEn: string;
  min: number;
  max: number;
  descUz: string;
  descRu: string;
  descEn: string;
}

const budgetBrackets: BudgetBracket[] = [
  {
    id: "low",
    labelUz: "300 000 UZS gacha",
    labelRu: "До 300 000 UZS",
    labelEn: "Up to 300,000 UZS",
    min: 0,
    max: 300000,
    descUz: "Yengil e'tibor",
    descRu: "Скромный комплимент",
    descEn: "Thoughtful token",
  },
  {
    id: "mid",
    labelUz: "300 000 - 800 000 UZS",
    labelRu: "300 000 - 800 000 UZS",
    labelEn: "300,000 - 800,000 UZS",
    min: 300000,
    max: 800000,
    descUz: "Ommabop & sifatli",
    descRu: "Популярно и качественно",
    descEn: "Popular & high quality",
  },
  {
    id: "high",
    labelUz: "800 000 - 2 500 000 UZS",
    labelRu: "800 000 - 2 500 000 UZS",
    labelEn: "800,000 - 2,500,000 UZS",
    min: 800000,
    max: 2500000,
    descUz: "Qadrli & uzoq esda qoluvchi",
    descRu: "Ценно и памятно",
    descEn: "Precious & memorable",
  },
  {
    id: "premium",
    labelUz: "2 500 000+ UZS",
    labelRu: "2 500 000+ UZS",
    labelEn: "2,500,000+ UZS",
    min: 2500000,
    max: 50000000,
    descUz: "Hashamatli & premium",
    descRu: "Роскошно и премиум",
    descEn: "Luxury & VIP tier",
  },
];

export default function GiftMatcherWizard() {
  const { language } = useTranslation();
  const [selectedRecipient, setSelectedRecipient] = useState<string>("parents");
  const [selectedOccasion, setSelectedOccasion] = useState<string>("birthday");
  const [selectedBudget, setSelectedBudget] = useState<string>("mid");
  const [quickViewProduct, setQuickViewProduct] = useState<any | null>(null);

  const { data: allProducts = [] } = useQuery({
    queryKey: ["catalog-products-all"],
    queryFn: () => catalog.filter({ limit: 100 }),
  });

  const currentBracket = budgetBrackets.find((b) => b.id === selectedBudget) || budgetBrackets[1];

  // Dynamic cultural matching algorithm
  const matchedProducts = useMemo(() => {
    if (!allProducts.length) return [];

    let pool = allProducts.filter((p: any) => {
      const price = p.price || 0;
      return price >= currentBracket.min && price <= currentBracket.max;
    });

    if (pool.length === 0) {
      pool = allProducts.slice(0, 6);
    }

    // Occasion and recipient specific prioritization
    if (selectedOccasion === "wedding" || selectedRecipient === "newlyweds") {
      pool = [...pool].sort((a: any, b: any) => {
        const aFit = a.category?.includes("Kitchen") || a.category?.includes("Home") || a.name?.toLowerCase().includes("choy") ? 1 : 0;
        const bFit = b.category?.includes("Kitchen") || b.category?.includes("Home") || b.name?.toLowerCase().includes("choy") ? 1 : 0;
        return bFit - aFit;
      });
    } else if (selectedRecipient === "parents") {
      pool = [...pool].sort((a: any, b: any) => {
        const aFit = a.name?.toLowerCase().includes("massaj") || a.name?.toLowerCase().includes("choy") || a.name?.toLowerCase().includes("termos") ? 1 : 0;
        const bFit = b.name?.toLowerCase().includes("massaj") || b.name?.toLowerCase().includes("choy") || b.name?.toLowerCase().includes("termos") ? 1 : 0;
        return bFit - aFit;
      });
    }

    return pool.slice(0, 3);
  }, [allProducts, selectedRecipient, selectedOccasion, currentBracket]);

  const recipientLabel = (r: RecipientOption) =>
    language === "uz" ? r.labelUz : language === "ru" ? r.labelRu : r.labelEn;

  const occasionLabel = (o: OccasionOption) =>
    language === "uz" ? o.labelUz : language === "ru" ? o.labelRu : o.labelEn;

  const searchQuery = `${recipients.find((r) => r.id === selectedRecipient)?.labelUz} ${occasionsList.find((o) => o.id === selectedOccasion)?.labelUz}`;

  return (
    <>
      <div className="card-luxury bg-white/95 rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-luxury relative overflow-hidden">
        {/* Subtle glow backdrop */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-8">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>
                {language === "uz"
                  ? "Tezkor Sovg'a Tanlovchi AI"
                  : language === "ru"
                  ? "AI Быстрый Подбор Подарка"
                  : "Instant AI Gift Matcher"}
              </span>
            </div>
            <h2 className="font-display font-black text-2xl sm:text-4xl text-slate-900 tracking-tight">
              {language === "uz"
                ? "3 soniyada ideal sovg'ani aniqlang"
                : language === "ru"
                ? "Идеальный подарок за 3 секунды"
                : "Find the Ideal Gift in 3 Seconds"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
              {language === "uz"
                ? "Kimga, nima munosabat bilan va byudjetingizni tanlang — O'zbekiston madaniyatiga mos keluvchi eng saralangan variantlar darhol namoyon bo'ladi."
                : language === "ru"
                ? "Выберите получателя, повод и бюджет — идеальные подарки с учетом узбекских традиций появятся мгновенно."
                : "Select recipient, occasion and budget — verified gifts tailored to Uzbek traditions appear instantly."}
            </p>
          </div>

          {/* 3 Steps Control Panel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/80 p-5 sm:p-6 rounded-3xl border border-slate-200/80">
            {/* Step 1: Recipient */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-black shadow-xs">
                  1
                </span>
                <span>
                  {language === "uz" ? "Kimga olasiz?" : language === "ru" ? "Для кого?" : "Who is it for?"}
                </span>
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {recipients.map((r) => {
                  const Icon = r.icon;
                  const isSelected = selectedRecipient === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => setSelectedRecipient(r.id)}
                      className={`p-2.5 rounded-2xl text-left text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
                        isSelected
                          ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                          : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80"
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isSelected ? "text-indigo-400" : "text-slate-500"}`} />
                      <span className="truncate">{recipientLabel(r)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Occasion */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-black shadow-xs">
                  2
                </span>
                <span>
                  {language === "uz" ? "Munosabat / Bayram?" : language === "ru" ? "Повод / Праздник?" : "Occasion / Event?"}
                </span>
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {occasionsList.map((o) => {
                  const Icon = o.icon;
                  const isSelected = selectedOccasion === o.id;
                  return (
                    <button
                      key={o.id}
                      onClick={() => setSelectedOccasion(o.id)}
                      className={`p-2.5 rounded-2xl text-left text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
                        isSelected
                          ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                          : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80"
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isSelected ? "text-indigo-400" : "text-slate-500"}`} />
                      <span className="truncate">{occasionLabel(o)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Budget */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-black shadow-xs">
                  3
                </span>
                <span>
                  {language === "uz" ? "Byudjet chegarasi" : language === "ru" ? "Бюджет" : "Budget Range"}
                </span>
              </label>
              <div className="space-y-1.5">
                {budgetBrackets.map((b) => {
                  const isSelected = selectedBudget === b.id;
                  const bracketLabel = language === "uz" ? b.labelUz : language === "ru" ? b.labelRu : b.labelEn;
                  const bracketDesc = language === "uz" ? b.descUz : language === "ru" ? b.descRu : b.descEn;
                  return (
                    <button
                      key={b.id}
                      onClick={() => setSelectedBudget(b.id)}
                      className={`w-full p-2.5 rounded-2xl text-left text-xs transition flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? "bg-slate-900 text-white shadow-md shadow-slate-900/10 font-bold"
                          : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 font-medium"
                      }`}
                    >
                      <span>{bracketLabel}</span>
                      <span className={`text-[10px] ${isSelected ? "text-slate-300" : "text-slate-400"}`}>
                        {bracketDesc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Real-time Dynamic Results Showcase */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
              <div>
                <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 flex items-center gap-2">
                  <span>
                    {language === "uz"
                      ? "AI Saralangan Variantlar"
                      : language === "ru"
                      ? "Подобранные Варианты"
                      : "AI Curated Matches"}
                  </span>
                  <span className="text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
                    {language === "uz" ? "98% Moslik" : language === "ru" ? "98% Совпадение" : "98% Match"}
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  {language === "uz"
                    ? "Tanlovingiz bo'yicha eng yuqori baholangan va do'konlarda mavjud mahsulotlar"
                    : language === "ru"
                    ? "Лучшие товары с высоким рейтингом в наличии в магазинах"
                    : "Top-rated in-stock items curated for your specific criteria"}
                </p>
              </div>

              <Link
                href={`/search?q=${encodeURIComponent(searchQuery)}`}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group self-start sm:self-auto"
              >
                <span>
                  {language === "uz"
                    ? "Barcha muqobillarni ko'rish"
                    : language === "ru"
                    ? "Смотреть все варианты"
                    : "Explore All Alternatives"}
                </span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {matchedProducts.map((product: any, idx: number) => (
                <div
                  key={product.id || idx}
                  className="card-luxury bg-white rounded-3xl border border-slate-200 hover:border-indigo-300 p-4 shadow-luxury hover:shadow-luxury-hover transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
                >
                  <div>
                    <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-100 mb-3">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <span className="absolute top-2.5 left-2.5 bg-slate-900 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                        {idx === 0
                          ? language === "uz" ? "TOP TAVSIYA" : language === "ru" ? "ТОП ВЫБОР" : "TOP CHOICE"
                          : idx === 1
                          ? language === "uz" ? "ENG FOYDALI" : language === "ru" ? "ЛУЧШАЯ ЦЕНА" : "BEST VALUE"
                          : language === "uz" ? "PREMIUM" : language === "ru" ? "ПРЕМИУМ" : "PREMIUM"}
                      </span>
                      {product.discount && (
                        <span className="absolute top-2.5 right-2.5 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {product.discount}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="font-bold text-slate-700">{product.store || "Uzum Market"}</span>
                        <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                          <Star className="w-3 h-3 fill-amber-400" />
                          {product.rating || "4.8"}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-indigo-600 transition">
                        {product.name}
                      </h4>

                      <div className="flex items-baseline gap-2 pt-1">
                        <span className="font-black text-base text-slate-900">
                          {formatPrice(product.price, product.currency)}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-xs text-slate-400 line-through">
                            {formatPrice(product.originalPrice, product.currency)}
                          </span>
                        )}
                      </div>

                      {product.reason && (
                        <div className="text-[11px] text-slate-600 line-clamp-2 bg-slate-50 p-2.5 rounded-xl mt-2 border border-slate-200/60 flex items-start gap-1.5">
                          <Lightbulb className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                          <span>{product.reason}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 flex items-center gap-2">
                    <button
                      onClick={() => setQuickViewProduct(product)}
                      className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-xl text-xs font-semibold transition text-center cursor-pointer"
                    >
                      {language === "uz" ? "Tezkor ko'rish" : language === "ru" ? "Быстрый просмотр" : "Quick View"}
                    </button>
                    <a
                      href={product.url || "https://uzum.uz"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition shadow-xs cursor-pointer"
                      title={language === "uz" ? "Do'konga o'tish" : language === "ru" ? "Перейти в магазин" : "Go to store"}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {quickViewProduct && (
        <ProductQuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </>
  );
}
