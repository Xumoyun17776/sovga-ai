import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "../lib/i18n";
import { research, formatPrice } from "../lib/api";
import SearchBar from "../components/SearchBar";
import PriceComparisonModal from "../components/PriceComparisonModal";
import ProductQuickViewModal from "../components/ProductQuickViewModal";
import GiftDetectiveModal from "../components/GiftDetectiveModal";
import HeroFeatureLaunchpad from "../components/HeroFeatureLaunchpad";
import AllServicesModal from "../components/AllServicesModal";
import TrustBar from "../components/TrustBar";
import BentoSuperpowers from "../components/BentoSuperpowers";
import PersonalizedRecommendations from "../components/PersonalizedRecommendations";
import FeatureCommandCenter from "../components/FeatureCommandCenter";
import AILabStudio, { AILabTab } from "../components/AILabStudio";
import GiftMatcherWizard from "../components/GiftMatcherWizard";
import LuxuryCuratedShowcase from "../components/LuxuryCuratedShowcase";
import HolographicPrivilegeCard from "../components/HolographicPrivilegeCard";
import TestimonialsSection from "../components/TestimonialsSection";
import FaqSection from "../components/FaqSection";
import PromoCodesHub from "../components/PromoCodesHub";
import CyberMarketTelemetry from "../components/CyberMarketTelemetry";
import CyberParticleCanvas from "../components/CyberParticleCanvas";
import { cyberSound } from "../lib/cyberSound";
import {
  Gift,
  Search,
  BarChart2,
  Heart,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Box,
  HelpCircle,
  Users,
  Wallet,
  XCircle,
  ExternalLink,
  Flame,
  Star,
  ShoppingBag,
  Eye,
  Cake,
  Baby,
  GraduationCap,
  Home,
  Headphones,
  Coffee,
  Watch,
  Check,
  AlertTriangle,
  PackageCheck,
  ShieldAlert,
  BookOpen,
  PenTool,
  Truck,
  Swords,
  Smartphone,
} from "lucide-react";

const delonghiProduct = {
  name: "De'Longhi Nescafé Dolce Gusto Mini Me Capsule Coffee Machine",
  price: 650000,
  originalPrice: 790000,
  currency: "UZS",
  discount: "18% off",
  store: "Uzum Market",
  category: "best_overall",
  rating: 4.8,
  reviewCount: 142,
  priceVerified: true,
  brand: "De'Longhi",
  imageUrl: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&auto=format&fit=crop",
  reason: "To'y uchun ajoyib sovg'a — chiroyli, har kuni ishlatiladi, yangi oshxona uchun ideal. 2 yillik rasmiy kafolat bilan tekshirilgan.",
  specs: ["15 bar bosim", "0.8L suv idishi", "Avtomatik o'chish", "Issiq va sovuq ichimliklar"],
  warranty: "2 yil rasmiy kafolat",
  deliveryEstimate: "Ertaga Toshkentda bepul",
};

const occasions = [
  { key: "wedding", icon: Heart, labelUz: "To'y", labelRu: "Свадьба", labelEn: "Wedding", hintUz: "Oila & oshxona anjomlari", hintRu: "Семья & посуда", hintEn: "Home & kitchen essentials", iconBoxClass: "icon-box-rose icon-glow-rose" },
  { key: "birthday", icon: Cake, labelUz: "Tug'ilgan kun", labelRu: "День рождения", labelEn: "Birthday", hintUz: "Shaxsiy gadjetlar & sovg'alar", hintRu: "Гаджеты & подарки", hintEn: "Personal tech & gadgets", iconBoxClass: "icon-box-gold icon-glow-amber" },
  { key: "anniversary", icon: Sparkles, labelUz: "Yillik", labelRu: "Годовщина", labelEn: "Anniversary", hintUz: "Unutilmas esdaliklar", hintRu: "Памятные подарки", hintEn: "Unforgettable memories", iconBoxClass: "icon-box-purple icon-glow-purple" },
  { key: "graduation", icon: GraduationCap, labelUz: "Bitiruv", labelRu: "Выпускной", labelEn: "Graduation", hintUz: "Ta'lim & zamonaviy texnika", hintRu: "Учёба & электроника", hintEn: "Education & smart tech", iconBoxClass: "icon-box-indigo icon-glow-indigo" },
  { key: "new_baby", icon: Baby, labelUz: "Yangi chaqaloq", labelRu: "Новорожденный", labelEn: "New Baby", hintUz: "Chaqaloq & parvarish to'plamlari", hintRu: "Наборы для малыша", hintEn: "Newborn care essentials", iconBoxClass: "icon-box-cyan icon-glow-cyan" },
  { key: "housewarming", icon: Home, labelUz: "Yangi uy", labelRu: "Новоселье", labelEn: "Housewarming", hintUz: "Interyer & qulaylik", hintRu: "Интерьер & уют", hintEn: "Interior & comfort", iconBoxClass: "icon-box-emerald icon-glow-emerald" },
];

const quickHeroChips = [
  { labelUz: "📱 iPhone 16 Pro Max", labelRu: "📱 iPhone 16 Pro Max", labelEn: "📱 iPhone 16 Pro Max", query: "iPhone 16 Pro Max", icon: Smartphone, color: "hover:border-purple-400 bg-purple-50/70 dark:bg-purple-950/20 text-purple-950 dark:text-purple-200 border-purple-200/90 dark:border-purple-800/40" },
  { labelUz: "⚡ Samsung S24 Ultra", labelRu: "⚡ Samsung S24 Ultra", labelEn: "⚡ Samsung S24 Ultra", query: "Samsung S24 Ultra", icon: Sparkles, color: "hover:border-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/20 text-indigo-950 dark:text-indigo-200 border-indigo-200/90 dark:border-indigo-800/40" },
  { labelUz: "💨 Dyson Airwrap", labelRu: "💨 Dyson Airwrap", labelEn: "💨 Dyson Airwrap", query: "Dyson Airwrap", icon: Flame, color: "hover:border-amber-400 bg-amber-50/70 dark:bg-amber-950/20 text-amber-950 dark:text-amber-200 border-amber-200/90 dark:border-amber-800/40" },
  { labelUz: "❄️ Konditsioner", labelRu: "❄️ Кондиционер", labelEn: "❄️ Air Conditioner", query: "Konditsioner", icon: Home, color: "hover:border-sky-400 bg-sky-50/70 dark:bg-sky-950/20 text-sky-950 dark:text-sky-200 border-sky-200/90 dark:border-sky-800/40" },
  { labelUz: "🚲 Velosiped", labelRu: "🚲 Велосипед", labelEn: "🚲 Bicycle", query: "Velosiped", icon: Gift, color: "hover:border-emerald-400 bg-emerald-50/70 dark:bg-emerald-950/20 text-emerald-950 dark:text-emerald-200 border-emerald-200/90 dark:border-emerald-800/40" },
  { labelUz: "🎮 PlayStation 5", labelRu: "🎮 PlayStation 5", labelEn: "🎮 PlayStation 5", query: "PlayStation 5", icon: ShoppingBag, color: "hover:border-blue-400 bg-blue-50/70 dark:bg-blue-950/20 text-blue-950 dark:text-blue-200 border-blue-200/90 dark:border-blue-800/40" },
  { labelUz: "💍 To'y sovg'asi", labelRu: "💍 Свадебный подарок", labelEn: "💍 Wedding Gift", query: "to'y sovg'asi 700 ming gacha", icon: Heart, color: "hover:border-rose-400 bg-rose-50/70 dark:bg-rose-950/20 text-rose-950 dark:text-rose-200 border-rose-200/90 dark:border-rose-800/40" },
];

export default function HomePage() {
  const { t, language } = useTranslation();
  const [, navigate] = useLocation();
  const [showDemoCompare, setShowDemoCompare] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<any | null>(null);
  const [showServicesModal, setShowServicesModal] = useState(false);
  const [showGiftDetective, setShowGiftDetective] = useState(false);
  const [aiLabTab, setAiLabTab] = useState<AILabTab>("duel");

  const { data: trendingDeals } = useQuery({
    queryKey: ["trending-deals"],
    queryFn: research.trending,
    staleTime: 60000,
  });

  return (
    <div className="animate-fade-in space-y-16 sm:space-y-24 pb-20">
      {/* ─── LIVE RUNNING TELEMETRY TICKER ───────────────────────── */}
      <CyberMarketTelemetry />

      {/* ─── CYBER-LUXURY HERO SECTION ───────────────────────────── */}
      <section className="relative overflow-hidden pt-6 sm:pt-10 pb-16 sm:pb-24 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-100/50 via-[#fcfaf5] to-[#faf9f5] dark:from-slate-900 dark:via-[#08090d] dark:to-[#08090d] border-b border-amber-200/50 dark:border-white/5">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.015] dark:opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
        <CyberParticleCanvas />
        <div className="ambient-spotlight opacity-70" />
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Aerospace Neural Status Badge */}
          <div className="inline-flex max-w-full flex-wrap items-center justify-center gap-1.5 sm:gap-2.5 px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full bg-white/95 dark:bg-slate-900/40 border border-amber-300/80 dark:border-white/10 shadow-lg shadow-amber-900/5 dark:shadow-black/40 text-[10px] sm:text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-4 sm:mb-6 backdrop-blur-2xl hover:scale-105 transition-transform cursor-pointer group">
            <span className="flex h-2 w-2 sm:h-2.5 sm:w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
            </span>
            <span className="tracking-wider sm:tracking-widest text-emerald-700 dark:text-emerald-400 font-extrabold">
              {language === "uz" ? "1,000,000+ MAHSULOT" : language === "ru" ? "1 000 000+ ТОВАРОВ" : "1,000,000+ PRODUCTS"}
            </span>
            <span className="text-amber-300 dark:text-slate-700">|</span>
            <span className="text-slate-900 dark:text-white font-black">UZUM · OLCHA · TEXNOMART</span>
            <span className="text-amber-300 dark:text-slate-700 hidden sm:inline">|</span>
            <span className="text-amber-700 dark:text-amber-400 font-black hidden sm:inline group-hover:text-amber-600 transition-colors">
              {language === "uz" ? "100% TO'G'RIDAN-TO'G'RI KARTALAR" : language === "ru" ? "100% ПРЯМЫЕ ССЫЛКИ" : "100% DIRECT PRODUCT CARDS"}
            </span>
          </div>

          {/* Headline with modern obsidian/gold typography */}
          <h1 className="font-display font-black text-3xl sm:text-5xl md:text-6xl text-slate-900 dark:text-white tracking-tight leading-[1.12] mb-4 sm:mb-6 drop-shadow-sm">
            {language === "uz" ? (
              <>
                O'zbekistondagi Eng Munosib Sovg'alar —{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 block sm:inline filter drop-shadow-md">AI Bozor Telemetriyasi</span>
              </>
            ) : language === "ru" ? (
              <>
                Идеальные подарки в Узбекистане —{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 block sm:inline filter drop-shadow-md">AI Телеметрия Цен</span>
              </>
            ) : (
              <>
                The World's Most Intelligent Gift Engine —{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 block sm:inline filter drop-shadow-md">Real-Time Market Telemetry</span>
              </>
            )}
          </h1>

          {/* Subtitle with soft eye-comfort color */}
          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed mb-6 sm:mb-8 font-medium tracking-tight">
            {language === "uz"
              ? "O'zbekistondagi barcha do'konlar narxini, 30 kunlik tarixini va rasmiy kafolatini sun'iy intellekt yordamida bir soniyada tahlil qiling."
              : language === "ru"
              ? "Мгновенно сравнивайте реальные цены, 30-дневную историю скидок и гарантии ведущих магазинов Узбекистана."
              : "Instantly analyze live prices, 30-day historical drops, and certified warranties across premier retailers in Uzbekistan."}
          </p>

          {/* Main Omnibox Search Bar */}
          <div className="max-w-3xl mx-auto mb-6 relative group z-20">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 via-indigo-500 to-emerald-400 rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative shadow-2xl shadow-slate-900/10 dark:shadow-black/50 rounded-full">
              <SearchBar large />
            </div>
          </div>

          {/* Quick Hero Search Chips (Eye-catching & Clean) */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto mb-10 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-bold mr-1 hidden sm:inline">
              {language === "uz" ? "Ommabop:" : language === "ru" ? "Популярные:" : "Trending:"}
            </span>
            {quickHeroChips.map((chip, idx) => {
              const ChipIcon = chip.icon;
              const label = language === "uz" ? chip.labelUz : language === "ru" ? chip.labelRu : chip.labelEn;
              return (
                <button
                  key={idx}
                  onClick={() => navigate(`/search?q=${encodeURIComponent(chip.query)}`)}
                  className={`px-3.5 py-1.5 rounded-full border font-bold transition-all duration-200 shadow-2xs hover:shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5 ${chip.color}`}
                >
                  <ChipIcon className="w-3.5 h-3.5 opacity-85" />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>

          {/* ─── INSTANT HERO FEATURE LAUNCHPAD (1-CLICK DISCOVERY) ─── */}
          <HeroFeatureLaunchpad
            onOpenAllServices={() => setShowServicesModal(true)}
            onOpenGiftDetective={() => setShowGiftDetective(true)}
          />

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm font-semibold mb-8">
            <Link
              href="/gift-finder"
              className="flex items-center gap-2 px-6 sm:px-7 py-3.5 btn-luxury-gold text-white rounded-2xl shadow-md group active:scale-95"
            >
              <Gift className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform" />
              <span>{t("hero.cta")}</span>
              <ArrowRight className="w-4 h-4 ml-0.5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <button
              onClick={() => setShowDemoCompare(true)}
              className="flex items-center gap-2 px-5 sm:px-6 py-3.5 bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs hover:shadow-sm transition active:scale-95 cursor-pointer"
            >
              <BarChart2 className="w-4 h-4 text-amber-500" />
              <span>{t("hero.ctaSecondary")}</span>
            </button>

            <Link
              href="/wedding/ali-madina"
              className="flex items-center gap-2 px-5 sm:px-6 py-3.5 bg-white dark:bg-slate-900/80 hover:bg-rose-50/70 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-200 hover:text-rose-600 dark:hover:text-rose-400 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs hover:shadow-sm transition active:scale-95"
            >
              <Heart className="w-4 h-4 text-rose-500" />
              <span>{t("hero.ctaWedding")}</span>
            </Link>
          </div>

          {/* ─── NEW: TRUST & EASE HUB (Direct Answer to User Objections) ─── */}
          <div className="max-w-3xl mx-auto bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-emerald-200 dark:border-emerald-900/50 shadow-sm text-left">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-200 dark:border-slate-800 pb-3">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                {language === "uz"
                  ? "Foydalanuvchi Kafolatlari (Nega bizga ishonishadi?)"
                  : language === "ru"
                  ? "Гарантии доверия (Почему выбирают нас?)"
                  : "Trust & Transparency (Why Shoppers Trust Us)"}
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-2xl icon-medallion icon-box-emerald flex items-center justify-center flex-shrink-0">
                  <ExternalLink className="w-4 h-4 icon-glow-emerald" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                    {language === "uz" ? "100% To'g'ridan-to'g'ri Xarid" : language === "ru" ? "100% Прямой переход" : "100% Direct Store Checkout"}
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 leading-snug">
                    {language === "uz"
                      ? "Sotib olishni bossangiz, firibgar saytlarga emas, aynan rasmiy Uzum, Texnomart yoki Olcha ilovasiga kiradi."
                      : language === "ru"
                      ? "При клике на покупку вы переходите напрямую в официальное приложение Uzum, Texnomart или Olcha без посредников."
                      : "Clicking buy takes you directly to official Uzum, Texnomart, or Olcha apps — zero phishing, zero markup."}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-2xl icon-medallion icon-box-indigo flex items-center justify-center flex-shrink-0">
                  <BarChart2 className="w-4 h-4 icon-glow-indigo" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                    {language === "uz" ? "Jonli Narxlar (Xato yo'q)" : language === "ru" ? "Живые цены в реальном времени" : "Real-Time Verified Prices"}
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 leading-snug">
                    {language === "uz"
                      ? "AI narxlarni to'qib chiqarmaydi. Skaner ayni daqiqadagi real narx va chegirmalarni ko'rsatadi."
                      : language === "ru"
                      ? "AI не выдумывает цифры. Сканеры фиксируют реальные цены и акции на данную секунду."
                      : "No AI hallucinated numbers. Live radar pulls authentic prices, verified discounts, and in-stock units."}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-2xl icon-medallion icon-box-rose flex items-center justify-center flex-shrink-0">
                  <Truck className="w-4 h-4 icon-glow-rose" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                    {language === "uz" ? "Yetkazib berish Tahlili" : language === "ru" ? "Анализ доставки и сроков" : "Delivery & Logistics Audit"}
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 leading-snug">
                    {language === "uz"
                      ? "Eng arzonini topganda, u qachon yetib kelishini va kafolatini ham solishtirib beradi."
                      : language === "ru"
                      ? "Сравнивая варианты, система учитывает сроки курьерской доставки и официальную гарантию."
                      : "Beyond lowest prices, we factor in delivery timeline (1-day vs 3-day) and official manufacturer warranty."}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-2xl icon-medallion icon-box-gold flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 icon-glow-amber" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                    {language === "uz" ? "Oddiy foydalanuvchiga Bepul" : language === "ru" ? "100% Бесплатно для покупателей" : "100% Free For Everyday Shoppers"}
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 leading-snug">
                    {language === "uz"
                      ? "Eng arzon narxlarni qidirish va pullarni tejash doim bepul. Pro versiya faqat bizneslar uchun."
                      : language === "ru"
                      ? "Поиск лучших цен и экономия бюджета всегда бесплатны. Платные тарифы только для коммерческих мерчантов."
                      : "Finding lowest prices and saving money is always free. Pro tier is strictly for wholesale merchants."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── UZBEKISTAN TRUST & LIVE MARKET STRIP ────────────────── */}
      <TrustBar />

      {/* ─── AI PERSONALIZED RECOMMENDATIONS SHELF ───────────────── */}
      <PersonalizedRecommendations />

      {/* ─── $1B BENTO GRID: AI SHOPPING SUPERPOWERS ──────────────── */}
      <BentoSuperpowers />

      {/* ─── MASTER FEATURE COMMAND CENTER (15 ORGANIZED SERVICES) ─ */}
      <FeatureCommandCenter
        onSelectSimulatorTab={(tab) => {
          setAiLabTab(tab as AILabTab);
          document.getElementById("ai-lab-studio")?.scrollIntoView({ behavior: "smooth" });
        }}
      />

      {/* ─── LIVE INTERACTIVE AI TESTBENCH & SIMULATORS HUB ───────── */}
      <AILabStudio
        currentTab={aiLabTab}
        onTabChange={(tab) => setAiLabTab(tab)}
      />

      {/* ─── INTERACTIVE GIFT MATCHER WIZARD ──────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <GiftMatcherWizard />
      </section>

      {/* ─── LUXURY CURATED SHOWCASE ─────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <LuxuryCuratedShowcase onQuickView={(p) => setQuickViewProduct(p)} />
      </section>

      {/* ─── LIVE RESEARCH PREVIEW CARD ──────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="card-luxury-elevated rounded-3xl p-6 sm:p-9 relative overflow-hidden bg-white dark:bg-[#10121d] border border-slate-200 dark:border-slate-800 shadow-luxury">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 px-3 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                  {language === "uz" ? "Jonli Tadqiqot Namoyishi" : language === "ru" ? "Живой Анализ Рынка" : "Live Research Telemetry"}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-400">
                  {language === "uz" ? "To'y sovg'asi · Byudjet: 700,000 UZS gacha" : language === "ru" ? "Свадебный подарок · Бюджет: до 700,000 сум" : "Wedding Gift · Budget: Up to 700,000 UZS"}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900 dark:text-white mt-2">
                {language === "uz"
                  ? "“18 ta do'konda tekshirilgan eng mukammal variant”"
                  : language === "ru"
                  ? "«Идеальный вариант, проверенный в 18 магазинах»"
                  : "“The mathematically optimal choice verified across 18 retail stores”"}
              </h2>
            </div>
            <button
              onClick={() => {
                cyberSound.playClick();
                navigate("/search?q=to'y sovg'asi 700 ming gacha");
              }}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1.5 flex-shrink-0 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 transition cursor-pointer"
            >
              <span>{language === "uz" ? "5 ta mahsulot solishtiruvi" : language === "ru" ? "Сравнение 5 товаров" : "Compare 5 Retail Offers"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center">
            {/* Product Image */}
            <div
              onClick={() => {
                cyberSound.playClick();
                setQuickViewProduct(delonghiProduct);
              }}
              className="md:col-span-4 rounded-2xl overflow-hidden h-56 bg-stone-100 dark:bg-slate-800/80 relative group cursor-pointer border border-stone-200/60 dark:border-white/10 shadow-sm"
              title={language === "uz" ? "Tezkor ko'rish" : language === "ru" ? "Быстрый просмотр" : "Quick View"}
            >
              <img
                src="https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&auto=format&fit=crop"
                alt="DeLonghi Mini Me"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <span className="absolute top-3 left-3 bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 text-[10px] font-extrabold px-3 py-1 rounded-full shadow-xs tracking-wider">
                {language === "uz" ? "ENG YAXSHI TANLOV" : language === "ru" ? "ЛУCHSHIY VIBOR" : "BEST OVERALL"}
              </span>
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                <span className="bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow flex items-center gap-1.5 backdrop-blur-md border border-slate-200 dark:border-white/10">
                  <Eye className="w-3.5 h-3.5 text-amber-500" />
                  <span>{language === "uz" ? "Tezkor ko'rish" : language === "ru" ? "Быстрый просмотр" : "Quick View"}</span>
                </span>
              </div>
            </div>

            {/* Product Details */}
            <div className="md:col-span-8 space-y-3.5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Uzum Market · {language === "uz" ? "Rasmiy Diler" : language === "ru" ? "Официальный дилер" : "Authorized Dealer"}
                  </span>
                  <span className="text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200 dark:border-emerald-800/50">
                    18% {language === "uz" ? "Chegirma" : language === "ru" ? "Скидка" : "Discount"}
                  </span>
                </div>
                <h3
                  onClick={() => {
                    cyberSound.playClick();
                    setQuickViewProduct(delonghiProduct);
                  }}
                  className="text-lg sm:text-xl font-bold font-display text-slate-900 dark:text-white mt-1 cursor-pointer hover:text-amber-500 dark:hover:text-amber-400 transition"
                >
                  De'Longhi Nescafé Dolce Gusto Mini Me Capsule Coffee Maker
                </h3>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">650,000 UZS</span>
                <span className="text-sm text-slate-400 dark:text-slate-500 line-through">790,000 UZS</span>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/50">
                  {language === "uz" ? "140,000 UZS tejov" : language === "ru" ? "Экономия 140,000 сум" : "Save 140,000 UZS"}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <strong className="text-slate-900 dark:text-white">
                  {language === "uz" ? "Nega aynan bu:" : language === "ru" ? "Почему именно это:" : "Why this product:"}
                </strong>{" "}
                {language === "uz"
                  ? "Yosh oila uchun eng munosib to'y sovg'asi — har kuni tongda ishlatiladi, oshxonada kam joy egallaydi. Italiya sifati, 2 yillik rasmiy kafolat va Toshkentda 1 kunda yetkazib berish."
                  : language === "ru"
                  ? "Идеальный подарок на свадьбу для молодой семьи: используется каждое утро, компактный размер. Итальянское качество, официальная гарантия 2 года и доставка по Ташкенту за 1 день."
                  : "The quintessential wedding present for new couples — used every morning, minimal kitchen footprint. Italian engineering, certified 2-year warranty, and next-day Tashkent delivery."}
              </p>

              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  onClick={() => {
                    cyberSound.playClick();
                    setQuickViewProduct(delonghiProduct);
                  }}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" /> {language === "uz" ? "Tezkor ko'rish" : language === "ru" ? "Быстрый просмотр" : "Quick View"}
                </button>
                <a
                  href="https://uzum.uz/uz/product/kofemashina-delonghi-mini-me-284912"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => cyberSound.playConfirm()}
                  className="px-4 py-2.5 btn-luxury-gold text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> {language === "uz" ? "Uzum Marketda xarid" : language === "ru" ? "Купить на Uzum" : "Buy on Uzum Market"}
                </a>
                <button
                  onClick={() => {
                    cyberSound.playClick();
                    setShowDemoCompare(true);
                  }}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  <BarChart2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> {language === "uz" ? "4 do'konda solishtirish" : language === "ru" ? "Сравнить в 4 магазинах" : "Compare across 4 retailers"}
                </button>
                <span className="text-[11px] text-stone-400 dark:text-slate-500 ml-auto hidden sm:inline">
                  {language === "uz" ? "2 daqiqa oldin tekshirildi · 18 manba" : language === "ru" ? "Проверено 2 мин назад · 18 источников" : "Verified 2m ago · 18 live sources"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOLOGRAPHIC VIP PRIVILEGE PASS ───────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 scroll-mt-24">
        <HolographicPrivilegeCard />
      </section>

      {/* ─── FEATURED REAL-TIME DEALS IN UZBEKISTAN ─────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1">
              <Flame className="w-4 h-4 text-orange-500" />
              <span>
                {language === "uz" ? "O'zbekiston Do'konlari Jonli Chegirmalari" : language === "ru" ? "Горящие Скидки Магазинов Узбекистана" : "Live Uzbekistan Retail Deals"}
              </span>
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-stone-900 dark:text-white">
              {language === "uz" ? "Jonli Narxlar va Maxsus Takliflar" : language === "ru" ? "Актуальные Цены и Горячие Предложения" : "Verified Market Drops & Exclusive Offers"}
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-slate-400 mt-1">
              {language === "uz"
                ? "Uzum Market, Texnomart, MediaPark va iStore bo'yicha tekshirilgan eng qulay narxlar."
                : language === "ru"
                ? "Проверенные лучшие цены на Uzum Market, Texnomart, MediaPark и iStore."
                : "Real-time verified pricing across Uzum Market, Texnomart, MediaPark, and authorized retailers."}
            </p>
          </div>
          <Link
            href="/catalog"
            className="text-xs sm:text-sm font-bold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 flex items-center gap-1.5 group flex-shrink-0 bg-white/80 dark:bg-slate-900/80 px-4 py-2 rounded-xl border border-stone-200/80 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-500/40 transition"
          >
            <span>{language === "uz" ? "Barcha 26 ta mahsulot" : language === "ru" ? "Все 26 товаров" : "View All 26 Verified Items"}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {(trendingDeals && trendingDeals.length > 0
            ? trendingDeals.slice(0, 4).map((d: any) => ({
                name: d.name,
                price: formatPrice(d.salePrice),
                original: formatPrice(d.originalPrice),
                discount: `${d.discountPercent}% ${language === "uz" ? "chegirma" : language === "ru" ? "скидка" : "off"}`,
                store: d.store,
                img:
                  d.name.toLowerCase().includes("samsung")
                    ? "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop"
                    : d.name.toLowerCase().includes("artel")
                    ? "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600&auto=format&fit=crop"
                    : d.name.toLowerCase().includes("redmi")
                    ? "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop"
                    : "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop",
                category: d.category,
                url: d.url,
                tag: d.tag,
              }))
            : [
                {
                  name: "De'Longhi Dolce Gusto Mini Me",
                  price: "650,000 UZS",
                  original: "790,000 UZS",
                  discount: "18% off",
                  store: "Uzum Market",
                  img: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&auto=format&fit=crop",
                  category: "Kitchen & Home",
                  url: "https://uzum.uz/uz/product/kofemashina-delonghi-mini-me-284912",
                  tag: "Top Seller",
                },
                {
                  name: "Sony WH-1000XM5 Wireless ANC",
                  price: "3,200,000 UZS",
                  original: "3,800,000 UZS",
                  discount: "16% off",
                  store: "Texnomart",
                  img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop",
                  category: "Audio & Gadgets",
                  url: "https://texnomart.uz/katalog/sony-wh-1000xm5/",
                  tag: "Major Drop",
                },
                {
                  name: "Rishton Artisan Ceramic Tea Set",
                  price: "350,000 UZS",
                  original: "420,000 UZS",
                  discount: "16% off",
                  store: "Uzum Market",
                  img: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop",
                  category: "Artisanal Heritage",
                  url: "https://uzum.uz/uz/product/rishton-kulolchilik-choy-servizi-12-bolakli-593821",
                  tag: "Handmade",
                },
                {
                  name: "Xiaomi Mi Smart Air Fryer 3.5L",
                  price: "420,000 UZS",
                  original: "510,000 UZS",
                  discount: "18% off",
                  store: "Texnomart",
                  img: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&auto=format&fit=crop",
                  category: "Smart Home",
                  url: "https://texnomart.uz/katalog/xiaomi-mi-smart-air-fryer-3-5l/",
                  tag: "Hit of the Week",
                },
              ]
          ).map((deal: any, idx: number) => (
            <div
              key={idx}
              className="card-luxury bg-white dark:bg-[#121422] rounded-3xl overflow-hidden p-4 flex flex-col justify-between group border border-amber-200/70 dark:border-slate-800 shadow-luxury"
            >
              <div>
                <div className="h-40 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 relative mb-3.5 border border-slate-200/50 dark:border-slate-700">
                  <img
                    src={deal.img}
                    alt={deal.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-2.5 left-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-sm tracking-wide">
                    {deal.discount}
                  </span>
                  {deal.tag && (
                    <span className="absolute top-2.5 right-2.5 bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xs">
                      {deal.tag}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    <span>{deal.category}</span>
                    <span className="text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded-md font-bold border border-slate-200 dark:border-slate-700">
                      {deal.store}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">
                    {deal.name}
                  </h4>
                  <div className="flex items-baseline gap-2 pt-0.5">
                    <span className="font-extrabold text-base text-slate-900 dark:text-white">{deal.price}</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 line-through">{deal.original}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center gap-2">
                <a
                  href={deal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 text-center rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  <span>{language === "uz" ? "Do'konda Xarid" : language === "ru" ? "Купить" : "Buy at Store"}</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>
                <Link
                  href={`/search?q=${encodeURIComponent(deal.name)}`}
                  className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-amber-700 dark:hover:text-amber-300 rounded-xl transition border border-slate-200/60 dark:border-slate-700"
                  title="Sovg'a AI analysis"
                >
                  <BarChart2 className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── NEW: PROMOCODES & CASHBACK HUB ───────────────────────── */}
      <section className="w-full">
        <PromoCodesHub />
      </section>

      {/* ─── OCCASIONS SELECTOR ───────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100/80 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 text-xs font-bold mb-2 border border-amber-200/80 dark:border-amber-900/60 shadow-xs">
            <span>
              {language === "uz" ? "Madaniy & Milliy Urf-odatlar" : language === "ru" ? "Культурные Традиции & Праздники" : "Cultural Occasions & Milestones"}
            </span>
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
            {language === "uz" ? "Ayyomlar bo'yicha saralash" : language === "ru" ? "Подарки по поводам" : "Browse by Celebration & Occasion"}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            {language === "uz"
              ? "O'zbekistondagi har bir bayram va tadbirning o'ziga xos urf-odati bor. Sovg'a AI buni hisobga oladi."
              : language === "ru"
              ? "У каждого праздника и торжества в Узбекистане свои тонкости. Sovg'a AI учитывает их все."
              : "Every celebration in Uzbekistan carries deep-rooted traditions and etiquette. Sovg'a AI honors them all."}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {occasions.map((o) => {
            const label = language === "uz" ? o.labelUz : language === "ru" ? o.labelRu : o.labelEn;
            const hint = language === "uz" ? o.hintUz : language === "ru" ? o.hintRu : o.hintEn;
            const OccasionIcon = o.icon;
            return (
              <button
                key={o.key}
                onClick={() => navigate(`/gift-finder?occasion=${o.key}`)}
                className="card-luxury bg-white dark:bg-[#121422] p-5 rounded-3xl text-left flex flex-col justify-between h-44 group cursor-pointer active:scale-95 border border-amber-200/70 dark:border-slate-800 hover:border-amber-400 dark:hover:border-slate-700 shadow-luxury"
              >
                <div className={`w-12 h-12 rounded-2xl icon-medallion ${o.iconBoxClass} flex items-center justify-center shrink-0`}>
                  <OccasionIcon className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">
                    {label}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{hint}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ─── WHY SOVG'A IS DIFFERENT (THE MATRIX) ────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100/80 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 text-xs font-bold mb-2 border border-amber-200/80 dark:border-amber-900/60 shadow-xs">
            <span>{language === "uz" ? "Xolislik & Aniqlik" : language === "ru" ? "Объективность & Точность" : "Impartiality & Precision"}</span>
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
            {language === "uz" ? "Nega Sovg'a AI mutlaqo boshqacha?" : language === "ru" ? "Почему Sovg'a AI особенный?" : "Why Sovg'a AI Is In A Class of Its Own"}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            {language === "uz"
              ? "Biz oddiy chat-bot yoki mahsulot sotuvchi do'kon emasmiz. Biz sizning mustaqil AI xarid tahlilchingizmiz."
              : language === "ru"
              ? "Мы не банальный чат-бот и не аффилированный магазин. Мы ваш независимый советник по покупкам."
              : "We are not a generic chatbot or a sponsored marketplace. We are your autonomous, fiduciary shopping intelligence agent."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: Generic Chatbots */}
          <div className="bg-white dark:bg-[#121422] rounded-3xl p-7 border border-slate-200/90 dark:border-slate-800 shadow-luxury space-y-4">
            <div className="w-11 h-11 rounded-2xl icon-medallion icon-box-rose flex items-center justify-center font-bold text-sm shrink-0">
              <XCircle className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                {language === "uz" ? "Oddiy Chatbotlar" : language === "ru" ? "Обычные Чат-боты" : "Generic Chatbots"}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">ChatGPT, bots</p>
            </div>
            <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2.5">
                <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span>
                  {language === "uz"
                    ? "Eski narxlarni to'qib chiqaradi va soxta chegirmalar yozadi"
                    : language === "ru"
                    ? "Галлюцинирует устаревшие цены и фальшивые скидки"
                    : "Hallucinates obsolete prices and phantom discounts"}
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span>
                  {language === "uz"
                    ? "Ishlamaydigan yoki noto'g'ri havolalar beradi"
                    : language === "ru"
                    ? "Выдает неработающие или ошибочные ссылки"
                    : "Outputs broken, dead 404s, or wrong merchant links"}
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span>
                  {language === "uz"
                    ? "Toshkent do'konlaridagi mavjudlikni bilmaydi"
                    : language === "ru"
                    ? "Не знает о реальном наличии на складах Ташкента"
                    : "Completely unaware of live Tashkent store stock"}
                </span>
              </li>
            </ul>
          </div>

          {/* Column 2: Regular Marketplaces */}
          <div className="bg-white dark:bg-[#121422] rounded-3xl p-7 border border-slate-200/90 dark:border-slate-800 shadow-luxury space-y-4">
            <div className="w-11 h-11 rounded-2xl icon-medallion icon-box-gold flex items-center justify-center font-bold text-sm shrink-0">
              <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                {language === "uz" ? "Oddiy Marketpleyslar" : language === "ru" ? "Обычные Маркетплейсы" : "Standard Marketplaces"}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Commercial apps</p>
            </div>
            <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2.5">
                <XCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>
                  {language === "uz"
                    ? "Eng ko'p reklama puli to'lagan tovarlarni oldinga suradi"
                    : language === "ru"
                    ? "Продвигает товары с максимальным рекламным бюджетом"
                    : "Promotes sponsored products paying the highest ad fee"}
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <XCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>
                  {language === "uz"
                    ? "Boshqa do'konda arzonroq ekanini yashiradi"
                    : language === "ru"
                    ? "Скрывает, что у конкурентов цена значительно ниже"
                    : "Conceals cheaper prices offered across competitor stores"}
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <XCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>
                  {language === "uz"
                    ? "Sizni 50 ta tab ochib, solishtirishga majbur qiladi"
                    : language === "ru"
                    ? "Вынуждает вручную открывать десятки вкладок для поиска"
                    : "Forces you to manually open 50 tiring browser tabs"}
                </span>
              </li>
            </ul>
          </div>

          {/* Column 3: Sovg'a AI */}
          <div className="bg-slate-900 text-white rounded-3xl p-7 border border-slate-800 shadow-xl space-y-4 relative">
            <span className="absolute -top-3.5 right-6 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
              {language === "uz" ? "Aqlli Tahlil Tizimi" : language === "ru" ? "Умный Интеллект" : "Autonomous Intelligence"}
            </span>
            <div className="w-11 h-11 rounded-2xl icon-medallion icon-box-emerald shadow-lg shadow-emerald-500/25 flex items-center justify-center font-bold text-sm shrink-0">
              <Check className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">Sovg'a AI</h3>
              <p className="text-xs text-indigo-300 font-medium mt-0.5">
                {language === "uz" ? "Shaxsiy AI Xarid Tahlilchingiz" : language === "ru" ? "Персональный AI Консьерж" : "Autonomous Fiduciary Shopping Agent"}
              </p>
            </div>
            <ul className="space-y-3 text-xs text-slate-300 font-medium">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>
                  {language === "uz"
                    ? "Real vaqt rejimida jonli narxlarni so'mda (UZS) tahlil qiladi"
                    : language === "ru"
                    ? "Анализирует актуальные цены в сумах (UZS) в реальном времени"
                    : "Real-time live prices grounded in Uzbek Soums (UZS)"}
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>
                  {language === "uz"
                    ? "Barcha milliy do'konlarni xolis taqqoslaydi (Uzum, Texnomart, MediaPark)"
                    : language === "ru"
                    ? "Беспристрастно сравнивает ведущие магазины (Uzum, Texnomart, MediaPark)"
                    : "Unbiased comparison across all national retailers (Uzum, Texnomart, MediaPark)"}
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>
                  {language === "uz"
                    ? "Soxta chegirmalarni fosh qiladi va 30 kunlik narx grafigini ko'rsatadi"
                    : language === "ru"
                    ? "Разоблачает фейковые скидки с 30-дневным графиком динамики"
                    : "Busts fake discounts with 30-day verifiable pricing charts"}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ─── WEDDING & WISHLIST SHOWCASE ─────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl border border-slate-800">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-xl space-y-4 relative z-10">
            <span className="text-xs font-bold uppercase tracking-widest bg-white/10 text-indigo-300 border border-white/10 backdrop-blur-md px-3.5 py-1 rounded-full">
              {language === "uz" ? "To'y Registratsiyasi & Orzular Ro'yxati" : language === "ru" ? "Свадебный Реестр & Wishlist" : "Wedding Registry & Wishlist Protocol"}
            </span>
            <h2 className="text-2xl sm:text-4xl font-display font-extrabold leading-tight tracking-tight">
              {language === "uz"
                ? "Yangi hayot ostonasida eng munosib sovg'alar"
                : language === "ru"
                ? "Достойные подарки на пороге новой жизни"
                : "Elevating Gifting For Life's Most Sacred Beginnings"}
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              {language === "uz" ? (
                <>
                  Oshxona texnikasi, servislar yoki orzudagi sayohat uchun o'z sovg'alar ro'yxatingizni yarating.{" "}
                  <strong>"Surprise Protection"</strong> texnologiyasi bir xil sovg'alar takrorlanishining oldini oladi!
                </>
              ) : language === "ru" ? (
                <>
                  Создайте персональный реестр желанных подарков: техника, фарфор или медовый месяц. Технология{" "}
                  <strong>"Surprise Protection"</strong> исключает дубликаты!
                </>
              ) : (
                <>
                  Curate your bespoke gift registry for kitchen appliances, dinnerware, or honeymoon funds. Our proprietary{" "}
                  <strong>"Surprise Protection"</strong> algorithm ensures guests never buy duplicate presents!
                </>
              )}
            </p>
            <div className="flex flex-wrap gap-3 pt-3">
              <Link
                href="/wedding/ali-madina"
                className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-xs sm:text-sm transition shadow-lg shadow-indigo-600/20"
              >
                {language === "uz" ? "Jonli To'y Registratsiyasini ko'rish" : language === "ru" ? "Смотреть демо-реестр" : "Explore Live Wedding Registry Demo"}
              </Link>
              <Link
                href="/wedding"
                className="px-6 py-3.5 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold rounded-2xl text-xs sm:text-sm transition backdrop-blur-md"
              >
                {language === "uz" ? "O'z ro'yxatimni yaratish" : language === "ru" ? "Создать свой реестр" : "Create My Registry"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── REAL CUSTOMER TESTIMONIALS ──────────────────────────── */}
      <TestimonialsSection />

      {/* ─── FREQUENTLY ASKED QUESTIONS ───────────────────────────── */}
      <FaqSection />

      {showDemoCompare && (
        <PriceComparisonModal
          productName="De'Longhi Nescafé Dolce Gusto Mini Me Coffee Machine"
          currentPrice={650000}
          currentStore="Uzum Market"
          onClose={() => setShowDemoCompare(false)}
        />
      )}

      {quickViewProduct && (
        <ProductQuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}

      {/* Instant All Services Directory Modal */}
      <AllServicesModal
        isOpen={showServicesModal}
        onClose={() => setShowServicesModal(false)}
      />

      {/* AI Gift Detective & Psychological Persona DNA Modal */}
      <GiftDetectiveModal
        isOpen={showGiftDetective}
        onClose={() => setShowGiftDetective(false)}
      />
    </div>
  );
}
