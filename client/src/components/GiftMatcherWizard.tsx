import SectionHeader from "./SectionHeader";
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
} from "../lib/icons";

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
    queryFn: () => catalog.filter({ limit: 300 }),
  });

  const currentBracket = budgetBrackets.find((b) => b.id === selectedBudget) || budgetBrackets[1];

  // Category preferences per recipient and occasion (live catalog categories).
  const RECIPIENT_PREF: Record<string, string[]> = {
    parents: ["Kitchen", "Home", "TV", "Beauty", "Wearables"],
    partner: ["Beauty", "Wearables", "Audio", "Smartphones", "Kitchen"],
    newlyweds: ["Kitchen", "Home", "TV"],
    friend: ["Audio", "Wearables", "Gaming", "Beauty"],
    colleague: ["Audio", "Kitchen", "Wearables"],
    kids: ["Gaming", "Tablets", "Audio", "Wearables"],
  };
  const OCCASION_PREF: Record<string, string[]> = {
    wedding: ["Kitchen", "Home", "TV"],
    housewarming: ["Home", "Kitchen", "TV"],
    birthday: [],
    eid: ["Kitchen", "Home"],
    anniversary: ["Beauty", "Wearables", "Audio"],
    attention: ["Audio", "Beauty", "Kitchen"],
  };

  // Pick three products in budget from the most fitting categories, one per category where possible.
  const matchedProducts = useMemo(() => {
    if (!allProducts.length) return [];
    const inBudget = allProducts.filter((p: any) => {
      const price = p.price || 0;
      return price >= currentBracket.min && price <= currentBracket.max;
    });
    const pool = inBudget.length ? inBudget : allProducts;
    const prefs = [...(OCCASION_PREF[selectedOccasion] || []), ...(RECIPIENT_PREF[selectedRecipient] || [])];
    const rank = (p: any) => {
      const i = prefs.indexOf(p.category);
      return i === -1 ? 99 : i;
    };
    const sorted = [...pool].sort(
      (a: any, b: any) => rank(a) - rank(b) || (b.reviewCount || 0) - (a.reviewCount || 0) || (b.rating || 0) - (a.rating || 0)
    );
    const picks: any[] = [];
    const usedCats = new Set<string>();
    for (const p of sorted) {
      if (picks.length === 3) break;
      if (usedCats.has(p.category)) continue;
      picks.push(p);
      usedCats.add(p.category);
    }
    for (const p of sorted) {
      if (picks.length === 3) break;
      if (!picks.includes(p)) picks.push(p);
    }
    return picks;
  }, [allProducts, selectedRecipient, selectedOccasion, currentBracket]);

  const recipientLabel = (r: RecipientOption) =>
    language === "uz" ? r.labelUz : language === "ru" ? r.labelRu : r.labelEn;

  const occasionLabel = (o: OccasionOption) =>
    language === "uz" ? o.labelUz : language === "ru" ? o.labelRu : o.labelEn;

  const searchQuery = `${recipients.find((r) => r.id === selectedRecipient)?.labelUz} ${occasionsList.find((o) => o.id === selectedOccasion)?.labelUz}`;

  return (
    <>
      <div className="relative">
        <div className="relative space-y-12">
          <SectionHeader
            kicker={language === "uz" ? "Tezkor tanlash" : language === "ru" ? "Быстрый подбор" : "Quick picker"}
            title={language === "uz" ? "Uchta savol — tayyor g'oyalar" : language === "ru" ? "Три вопроса — готовые идеи" : "Three questions, ready ideas"}
            subtitle={language === "uz" ? "Kimga, qanday bayram va qancha byudjet — uchtasini tanlang, mos variantlar shu yerda chiqadi." : language === "ru" ? "Кому, какой повод и бюджет — выберите три пункта, и варианты появятся здесь же." : "Who, which occasion, what budget — pick three things and the options appear right here."}
            className="!mb-0"
          />

          {/* 3 Steps Control Panel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 rounded-3xl bg-white border border-[var(--rule-soft)] p-5 sm:p-8 shadow-sm">
            {/* Step 1: Recipient */}
            <div className="space-y-2.5">
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-900 dark:bg-amber-500 text-white dark:text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
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
                          ? "bg-slate-900 dark:bg-amber-500 text-white dark:text-white shadow-md"
                          : "bg-white dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/10"
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isSelected ? "text-indigo-400 dark:text-slate-950" : "text-slate-500 dark:text-slate-400"}`} />
                      <span className="truncate">{recipientLabel(r)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Occasion */}
            <div className="space-y-2.5">
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-900 dark:bg-amber-500 text-white dark:text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                  2
                </span>
                <span>
                  {language === "uz" ? "Qanday bayram?" : language === "ru" ? "Какой повод?" : "What's the occasion?"}
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
                          ? "bg-slate-900 dark:bg-amber-500 text-white dark:text-white shadow-md"
                          : "bg-white dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/10"
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isSelected ? "text-indigo-400 dark:text-slate-950" : "text-slate-500 dark:text-slate-400"}`} />
                      <span className="truncate">{occasionLabel(o)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Budget */}
            <div className="space-y-2.5">
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-900 dark:bg-amber-500 text-white dark:text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                  3
                </span>
                <span>
                  {language === "uz" ? "Byudjet" : language === "ru" ? "Бюджет" : "Budget"}
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
                          ? "bg-slate-900 dark:bg-amber-500 text-white dark:text-white shadow-md font-bold"
                          : "bg-white dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/10 font-medium"
                      }`}
                    >
                      <span>{bracketLabel}</span>
                      <span className={`text-[10px] ${isSelected ? "text-slate-300 dark:text-slate-900/70" : "text-slate-400 dark:text-slate-500"}`}>
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
                <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <span>
                    {language === "uz" ? "Mos variantlar" : language === "ru" ? "Подходящие варианты" : "Matching gifts"}
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  {language === "uz" ? "Tanlovingizga mos, sotuvda bor va yaxshi baholangan mahsulotlar" : language === "ru" ? "Товары в наличии с хорошими отзывами под ваш выбор" : "In-stock, well-reviewed products that match what you picked"}
                </p>
              </div>

              <Link
                href={`/search?q=${encodeURIComponent(searchQuery)}`}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group self-start sm:self-auto"
              >
                <span>
                  {language === "uz" ? "Ko'proq variantlar" : language === "ru" ? "Больше вариантов" : "See more options"}
                </span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {matchedProducts.map((product: any, idx: number) => (
                <div
                  key={product.id || idx}
                  className="card-luxury bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 p-4 shadow-sm hover:shadow-luxury-hover transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative h-44 rounded-2xl overflow-hidden bg-[var(--img-well)] mb-3">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-full object-contain p-4 mix-blend-multiply transition duration-500 group-hover:scale-105"
                      />
                      <span className="absolute top-2.5 left-2.5 bg-slate-900 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                        {idx === 0
                          ? language === "uz" ? "Eng yaxshi" : language === "ru" ? "Лучший" : "Top pick"
                          : idx === 1
                          ? language === "uz" ? "Narxi qulay" : language === "ru" ? "Выгодно" : "Best value"
                          : language === "uz" ? "Premium" : language === "ru" ? "Премиум" : "Premium"}
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
                          <Star className="w-3 h-3 fill-yellow-400" />
                          {product.rating || "4.8"}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-indigo-600 transition">
                        {product.name}
                      </h4>

                      <div className="flex items-baseline gap-2 pt-1">
                        <span className="font-bold text-base text-slate-900">
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
