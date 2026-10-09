import { useState, useMemo, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  X,
  Search,
  Sparkles,
  Gift,
  Flame,
  ShoppingBag,
  Swords,
  Box,
  ShieldAlert,
  Heart,
  Calendar,
  PenTool,
  PackageCheck,
  Truck,
  ShieldCheck,
  Users,
  Store,
  ArrowRight,
  ExternalLink,
  Layers,
  Zap,
  Fingerprint,
  Clock,
} from "lucide-react";
import { cyberSound } from "../lib/cyberSound";
import { useTranslation } from "../lib/i18n";

export interface ServiceItem {
  id: string;
  titleUz: string;
  titleRu: string;
  titleEn: string;
  descUz: string;
  descRu: string;
  descEn: string;
  href: string;
  icon: any;
  category: "gifts" | "shopping" | "events" | "tools";
  badge?: string;
  badgeUz?: string;
  badgeRu?: string;
  badgeEn?: string;
  color: string;
}

export const ALL_SERVICES: ServiceItem[] = [
  // ─── Sovg'alar & Syurprizlar ───
  {
    id: "time-capsule",
    titleUz: "AI Vaqt Kapsulasi & Biometrik Qulf",
    titleRu: "AI Капсула Времени (2026-2035)",
    titleEn: "AI Time Capsule & Milestone Vault",
    descUz: "Kelajakdagi marosim, to'y yilligi yoki farzandning balog'atiga atalgan sovg'ani biometrik qulf bilan muhrlang.",
    descRu: "Запечатайте подарок или видео-письмо в будущее с открытием строго в назначенную дату.",
    descEn: "Cryptographic milestone vault locking future gifts, vows, and surprises until designated dates.",
    href: "/time-capsule",
    icon: Clock,
    category: "gifts",
    badgeUz: "FUTURISTIK",
    badgeRu: "ФУТУРИЗМ",
    badgeEn: "FUTURISTIC",
    color: "from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30",
  },
  {
    id: "gift-detective",
    titleUz: "AI Sovg'a Detektivi & Persona DNA",
    titleRu: "AI Детектив Подарков & DNA",
    titleEn: "AI Gift Detective & Persona DNA",
    descUz: "Inson ruhiy portreti, qiziqishlari, dopamin tetiklari va taqiqlangan sovg'alar chuqur tahlili.",
    descRu: "Глубокий психологический анализ, психотип и запрещенные подарки для 100% попадания.",
    descEn: "Psychological archetype profiling, dopamine triggers & forbidden red-flag gifts scanner.",
    href: "/gift-finder?mode=detective",
    icon: Fingerprint,
    category: "gifts",
    badgeUz: "VIP AI",
    badgeRu: "VIP AI",
    badgeEn: "VIP AI",
    color: "from-amber-500/20 to-rose-500/20 text-amber-500 border-amber-500/30",
  },
  {
    id: "gift-finder",
    titleUz: "AI Sovg'a Topuvchi",
    titleRu: "AI Подбор Подарка",
    titleEn: "AI Gift Finder Wizard",
    descUz: "Kimga, qanday byudjet va marosimga sovg'a kerakligini 4 savolda aniqlab, 10+ eng arzon variantni topadi.",
    descRu: "Умный подбор подарков за 4 вопроса по бюджету и поводам.",
    descEn: "Intelligent gift recommendation wizard grounded in live market prices.",
    href: "/gift-finder",
    icon: Gift,
    category: "gifts",
    badgeUz: "MASHHUR",
    badgeRu: "ПОПУЛЯРНО",
    badgeEn: "POPULAR",
    color: "from-amber-500/20 to-orange-500/20 text-amber-500 border-amber-500/30",
  },
  {
    id: "aksiyalar",
    titleUz: "Aksiyalar & Omad Barabani",
    titleRu: "Колесо Удачи и Промокоды",
    titleEn: "Lucky Wheel & Promo Hub",
    descUz: "Haftada 1 marta bepul barabanni aylantiring va Uzum, Texnomart uchun 70,000 UZS gacha promokodlarni yutib oling.",
    descRu: "Вращайте колесо фортуны (1 раз в неделю) и выигрывайте промокоды до 70 000 сум.",
    descEn: "Spin the weekly fortune wheel (1 free spin per week) for instant vouchers, cashback and coupons.",
    href: "/aksiyalar",
    icon: Flame,
    category: "gifts",
    badgeUz: "YANGI",
    badgeRu: "НОВОЕ",
    badgeEn: "NEW",
    color: "from-rose-500/20 to-pink-500/20 text-rose-500 border-rose-500/30",
  },
  {
    id: "mystery-box",
    titleUz: "AI Syurpriz Quti (Mystery Box)",
    titleRu: "AI Сюрприз-Бокс (3D)",
    titleEn: "AI Mystery Box (3D)",
    descUz: "Byudjetingizga mos sirli to'plam. 3D interaktiv unboxing tajribasi va har doim o'z qiymatidan qimmat tovarlar.",
    descRu: "Интерактивная 3D коробка сюрпризов с гарантированной ценностью выше цены.",
    descEn: "Interactive 3D unboxing experience with value guaranteed higher than price.",
    href: "/mystery-box",
    icon: Box,
    category: "gifts",
    badge: "3D",
    color: "from-purple-500/20 to-indigo-500/20 text-purple-400 border-purple-500/30",
  },
  {
    id: "gift-quiz",
    titleUz: "Sovg'a Testi & Ruletka",
    titleRu: "Тест подарка & Рулетка",
    titleEn: "Gift Personality Quiz",
    descUz: "Qabul qiluvchining fe'l-atvori bo'yicha interaktiv test va tasodifiy omad ruletkasi.",
    descRu: "Психологический тест вкусов и рулетка подарков.",
    descEn: "Recipient personality quiz matching the ideal surprise.",
    href: "/gift-quiz",
    icon: Sparkles,
    category: "gifts",
    color: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30",
  },

  // ─── Xarid & Narx Tahlili ───
  {
    id: "catalog",
    titleUz: "10,000+ Mahsulotlar Katalogi",
    titleRu: "Каталог 10 000+ Товаров",
    titleEn: "10,000+ Live Product Catalog",
    descUz: "Uzum, Texnomart, MediaPark, Asaxiy do'konlaridagi barcha tovarlar, filtrlar va 30 kunlik narxlar grafigi.",
    descRu: "Полный каталог товаров с живыми ценами и скидками крупнейших ритейлеров.",
    descEn: "Full verified store catalog with live price comparisons and arbitrage.",
    href: "/catalog",
    icon: ShoppingBag,
    category: "shopping",
    badge: "10K+",
    color: "from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30",
  },
  {
    id: "compare-duel",
    titleUz: "AI Qiyoslagich & Kiber Duel",
    titleRu: "AI Дуэль Сравнение",
    titleEn: "AI Spec Comparison Duel",
    descUz: "Ikkita mahsulotni yuzma-yuz solishtiring: kim kuchliroq, qaysi biri arzonroq va qaysi birini olish ma'qul.",
    descRu: "Битва двух гаджетов лицом к лицу с вердиктом искусственного интеллекта.",
    descEn: "Head-to-head battle comparing technical specs, value and reliability.",
    href: "/compare-duel",
    icon: Swords,
    category: "shopping",
    badge: "DUEL",
    color: "from-amber-500/20 to-yellow-500/20 text-amber-400 border-amber-500/30",
  },
  {
    id: "price-audit",
    titleUz: "AI Narx Auditori (Soxta Chegirmalar)",
    titleRu: "AI Аудит Цен и Фейковых Скидок",
    titleEn: "AI Price & Fake Discount Audit",
    descUz: "Do'kondagi chegirma haqiqiymi yoki sun'iy oshirilganmi? Tarixiy grafik bilan shaffof tekshiring.",
    descRu: "Проверка честности скидок: реальная выгода или искусственная наценка.",
    descEn: "Audit retail discounts to detect inflated base prices and verify deals.",
    href: "/price-audit",
    icon: ShieldAlert,
    category: "shopping",
    badge: "RADAR",
    color: "from-rose-500/20 to-red-500/20 text-rose-400 border-rose-500/30",
  },
  {
    id: "stores-delivery",
    titleUz: "Do'konlar & Yetkazish Xaritasi",
    titleRu: "Магазины и Доставка по Узб",
    titleEn: "Stores & Delivery Navigator",
    descUz: "14 viloyat bo'yicha Uzum, Texnomart, MediaPark kuryerlik muddatlari va tarqatish punktlari (PVZ).",
    descRu: "Карта и сроки доставки во все 14 регионов Узбекистана.",
    descEn: "Regional fulfillment, courier times, and pickup points across Uzbekistan.",
    href: "/stores-delivery",
    icon: Truck,
    category: "shopping",
    color: "from-teal-500/20 to-cyan-500/20 text-teal-400 border-teal-500/30",
  },

  // ─── Marosimlar & Rejalashtirish ───
  {
    id: "wedding-registry",
    titleUz: "To'y Sovg'alari Ro'yxati",
    titleRu: "Свадебный Список Подарков",
    titleEn: "Wedding Gift Registry",
    descUz: "Kelin-kuyovlar uchun shaxsiy ro'yxat sahifasi. Mehmonlar bir xil sovg'a olmasligi uchun bron qilish tizimi.",
    descRu: "Онлайн-реестр свадебных подарков для жениха и невесты с защитой от дублей.",
    descEn: "Curated wedding registry preventing duplicate gifts with reservation.",
    href: "/wedding-registry",
    icon: Heart,
    category: "events",
    badgeUz: "TO'Y",
    badgeRu: "СВАДЬБА",
    badgeEn: "WEDDING",
    color: "from-pink-500/20 to-rose-500/20 text-pink-400 border-pink-500/30",
  },
  {
    id: "wishlist",
    titleUz: "Istaklar Ro'yxati (Wishlist)",
    titleRu: "Список Желаний (Вишлист)",
    titleEn: "Wishlist Manager",
    descUz: "O'zingiz orzu qilgan sovg'alarni saqlang va yaqinlaringizga yuboring. Hech kim keraksiz sovg'a bermaydi.",
    descRu: "Персональный вишлист с возможностью делиться ссылкой в Telegram.",
    descEn: "Save dream products and share seamless links with friends and family.",
    href: "/wishlist",
    icon: Sparkles,
    category: "events",
    color: "from-indigo-500/20 to-violet-500/20 text-indigo-400 border-indigo-500/30",
  },
  {
    id: "reminders",
    titleUz: "Muhim Sanalar & Eslatmalar",
    titleRu: "Напоминания о Праздниках",
    titleEn: "Occasion Reminders",
    descUz: "Tug'ilgan kunlar, yilliklar va to'ylar esdan chiqmasligi uchun oldindan eslatuvchi AI taqvimi.",
    descRu: "Умные напоминания о днях рождения и юбилеях с подбором подарка заранее.",
    descEn: "Never miss a birthday or anniversary with timely automated reminders.",
    href: "/reminders",
    icon: Calendar,
    category: "events",
    color: "from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30",
  },
  {
    id: "secret-santa",
    titleUz: "Secret Santa (Yashirin Sovg'a)",
    titleRu: "Тайный Санта для Компаний",
    titleEn: "Secret Santa Gift Exchange",
    descUz: "Do'stlar yoki ofis xodimlari o'rtasida anonim sovg'a almashish o'yini tashkil qilish.",
    descRu: "Автоматическая жеребьевка и организация тайного санты.",
    descEn: "Automated secret gift exchange organizer for friends and teams.",
    href: "/secret-santa",
    icon: Gift,
    category: "events",
    color: "from-red-500/20 to-rose-500/20 text-red-400 border-red-500/30",
  },

  // ─── Studiya, Qadoqlash & Servis ───
  {
    id: "packaging-studio",
    titleUz: "3D Qadoqlash Studiyasi",
    titleRu: "3D Студия Упаковки",
    titleEn: "3D Packaging Atelier",
    descUz: "Nafis atlas lenta, mualliflik qutisi va mumli muhr dizaynini 3D da ko'rib buyurtma bering.",
    descRu: "3D конфигуратор люксовой упаковки с восковой печатью и шелковыми лентами.",
    descEn: "Custom gift wrapping studio with wax seal, ribbon, and paper selector in 3D.",
    href: "/packaging-studio",
    icon: PackageCheck,
    category: "tools",
    badge: "3D",
    color: "from-amber-500/20 to-yellow-500/20 text-amber-400 border-amber-500/30",
  },
  {
    id: "calligraphy-card",
    titleUz: "Kalligrafik Tabriknoma Generator",
    titleRu: "Каллиграфическая Открытка",
    titleEn: "Calligraphy Greeting Card AI",
    descUz: "O'zbekona nafis xattotlik uslubida samimiy tilaklar va tabrik matnlari yozish vositasi.",
    descRu: "Генератор авторских восточных открыток и каллиграфических поздравлений.",
    descEn: "Generate elegant oriental calligraphy greeting messages with AI.",
    href: "/calligraphy-card",
    icon: PenTool,
    category: "tools",
    color: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30",
  },
  {
    id: "warranty-vault",
    titleUz: "Kafolat & Cheklar Hamyoni",
    titleRu: "Хранилище Гарантий и Чеков",
    titleEn: "Warranty & Receipt Vault",
    descUz: "Kafolat muddati tugashini kuzatish, cheklarni saqlash va rasmiy servis markazlari ro'yxati.",
    descRu: "Контроль гарантийных сроков купленных товаров и адреса сервисных центров.",
    descEn: "Track warranty expirations and locate authorized service centers in UZ.",
    href: "/warranty-vault",
    icon: ShieldCheck,
    category: "tools",
    color: "from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30",
  },
  {
    id: "group-gifting",
    titleUz: "Jamoaviy Sovg'a & Payme/Click Splitter",
    titleRu: "Совместный Подарок & Сплиттер",
    titleEn: "Group Gifting & Splitter",
    descUz: "Katta sovg'aga do'stlar bilan pul yig'ish, har bir kishining hissasini hisoblash va Payme/Click havolasi.",
    descRu: "Сбор средств на общий подарок с автоматическим расчетом долей.",
    descEn: "Crowdfund larger gifts with friends and split costs effortlessly.",
    href: "/group-gifting",
    icon: Users,
    category: "tools",
    color: "from-indigo-500/20 to-purple-500/20 text-indigo-400 border-indigo-500/30",
  },
  {
    id: "merchant",
    titleUz: "Sotuvchi Kabineti (B2B Portal)",
    titleRu: "Кабинет Продавца (B2B)",
    titleEn: "Merchant Portal (B2B)",
    descUz: "Do'koningiz tovarlarini platformaga kiritish, narx monitoringi va yangi mijozlar oqimi.",
    descRu: "Панель для продавцов: добавление товаров, мониторинг и аналитика продаж.",
    descEn: "Retailer portal to list inventory, analyze market traction, and reach shoppers.",
    href: "/merchant",
    icon: Store,
    category: "tools",
    badge: "B2B",
    color: "from-amber-600/20 to-yellow-600/20 text-amber-500 border-amber-600/30",
  },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AllServicesModal({ isOpen, onClose }: Props) {
  const { language } = useTranslation();
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: ALL_SERVICES.length, gifts: 0, shopping: 0, events: 0, tools: 0 };
    ALL_SERVICES.forEach((svc) => {
      if (counts[svc.category] !== undefined) counts[svc.category]++;
    });
    return counts;
  }, []);

  const filtered = useMemo(() => {
    return ALL_SERVICES.filter((svc) => {
      const matchCat = activeCategory === "all" || svc.category === activeCategory;
      const q = search.toLowerCase().trim();
      if (!q) return matchCat;
      const title = (language === "uz" ? svc.titleUz : language === "ru" ? svc.titleRu : svc.titleEn).toLowerCase();
      const desc = (language === "uz" ? svc.descUz : language === "ru" ? svc.descRu : svc.descEn).toLowerCase();
      const matchSearch = title.includes(q) || desc.includes(q) || svc.id.includes(q);
      return matchCat && matchSearch;
    });
  }, [search, activeCategory, language]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="card-luxury bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:via-[#0c0e18] dark:to-[#07090f] text-slate-900 dark:text-slate-100 rounded-3xl w-full max-w-4xl max-h-[92vh] max-h-[92dvh] flex flex-col shadow-luxury border-2 border-amber-300/80 dark:border-amber-500/25 relative my-auto animate-scale-in overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Strip */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-white/10 relative">
          <button
            onClick={() => {
              cyberSound.playClick();
              onClose();
            }}
            className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition cursor-pointer active:scale-95 shadow-2xs"
          >
            <X className="w-4 h-4 stroke-[2.2]" />
          </button>

          <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold tracking-wider uppercase mb-1">
            <Sparkles className="w-4 h-4" />
            <span>
              {language === "uz"
                ? "Sovg'a AI · Barcha Xizmatlar & Funksiyalar Markazi"
                : language === "ru"
                ? "Sovg'a AI · Центр Всех Сервисов и Функций"
                : "Sovg'a AI · Master Services & Tools Suite"}
            </span>
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-white">
            {language === "uz"
              ? "Barcha 16 ta Xizmat va Imkoniyatlar"
              : language === "ru"
              ? "Все 16 сервисов и возможностей"
              : "All 16 Concierge Services & Features"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            {language === "uz"
              ? "Istalgan xizmatni tanlang va to'g'ridan-to'g'ri unga o'ting. Har bir funksiya O'zbekiston bozoriga to'liq moslashtirilgan."
              : language === "ru"
              ? "Выберите любой сервис для быстрого перехода. Все функции оптимизированы для рынка Узбекистана."
              : "Select any service for instant direct access. Every feature is tuned for Uzbekistan retail."}
          </p>

          {/* Search bar inside header */}
          <div className="mt-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                language === "uz"
                  ? "Xizmatlarni qidirish (masalan: baraban, duel, to'y, qadoqlash, narx)..."
                  : language === "ru"
                  ? "Поиск сервисов (например: рулетка, дуэль, свадьба, упаковка)..."
                  : "Search all features (e.g., lucky wheel, duel, wedding, packaging, audit)..."
              }
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/10 text-white placeholder-slate-400 text-xs sm:text-sm border border-white/20 focus:outline-hidden focus:border-amber-400 transition"
              autoFocus
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 px-5 sm:px-6 py-3 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none text-xs font-bold">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap cursor-pointer active:scale-95 ${
              activeCategory === "all"
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {language === "uz" ? "Barchasi" : language === "ru" ? "Все" : "All"} ({ALL_SERVICES.length})
          </button>
          <button
            onClick={() => setActiveCategory("gifts")}
            className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap cursor-pointer active:scale-95 ${
              activeCategory === "gifts"
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {language === "uz" ? "🎁 Sovg'alar & Baraban" : language === "ru" ? "🎁 Подарки & Рулетка" : "🎁 Gifts & Wheel"} ({categoryCounts.gifts})
          </button>
          <button
            onClick={() => setActiveCategory("shopping")}
            className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap cursor-pointer active:scale-95 ${
              activeCategory === "shopping"
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {language === "uz" ? "🛍️ Xarid & Narx Tahlili" : language === "ru" ? "🛍️ Анализ Цен & Покупки" : "🛍️ Shopping & Pricing"} ({categoryCounts.shopping})
          </button>
          <button
            onClick={() => setActiveCategory("events")}
            className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap cursor-pointer active:scale-95 ${
              activeCategory === "events"
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {language === "uz" ? "👑 Marosimlar & To'y" : language === "ru" ? "👑 Праздники & Свадьбы" : "👑 Events & Registry"} ({categoryCounts.events})
          </button>
          <button
            onClick={() => setActiveCategory("tools")}
            className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap cursor-pointer active:scale-95 ${
              activeCategory === "tools"
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {language === "uz" ? "⚡ Studiya & B2B" : language === "ru" ? "⚡ Студия & B2B" : "⚡ Studio & B2B"} ({categoryCounts.tools})
          </button>
        </div>

        {/* Services Grid */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-3 flex-1">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Search className="w-8 h-8 mx-auto opacity-40" />
              <p className="text-sm font-semibold">
                {language === "uz"
                  ? `"${search}" bo'yicha xizmat topilmadi`
                  : language === "ru"
                  ? `Ничего не найдено по запросу "${search}"`
                  : `No services found matching "${search}"`}
              </p>
              <p className="text-xs text-slate-500">
                {language === "uz"
                  ? "Filtrni tozalang yoki boshqa kalit so'z bilan qidiring."
                  : language === "ru"
                  ? "Очистите фильтр или попробуйте другой запрос."
                  : "Clear the filter or search with different keywords."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filtered.map((svc) => {
                const Icon = svc.icon;
                const title = language === "uz" ? svc.titleUz : language === "ru" ? svc.titleRu : svc.titleEn;
                const desc = language === "uz" ? svc.descUz : language === "ru" ? svc.descRu : svc.descEn;
                const badge = svc.badge || (language === "uz" ? svc.badgeUz : language === "ru" ? svc.badgeRu : svc.badgeEn);

                return (
                  <Link
                    key={svc.id}
                    href={svc.href}
                    onClick={() => {
                      cyberSound.playConfirm();
                      onClose();
                    }}
                    className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:border-amber-400/50 dark:hover:border-amber-400/40 transition duration-200 group flex items-start gap-3.5 text-left cursor-pointer shadow-xs hover:shadow-md active:scale-95"
                  >
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${svc.color} border flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-xs`}>
                      <Icon className="w-5 h-5 stroke-[2.2]" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 justify-between">
                        <h4 className="font-display font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors truncate">
                          {title}
                        </h4>
                        {badge && (
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-500 border border-amber-400/30 flex-shrink-0">
                            {badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {desc}
                      </p>
                    </div>

                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-400 group-hover:translate-x-1 transition-transform flex-shrink-0 mt-1 stroke-[2.2]" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-5 sm:px-6 py-3 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5 font-medium">
            <Zap className="w-3.5 h-3.5 text-amber-500 stroke-[2.2]" />
            <span>
              {language === "uz" ? (
                <>Tezkor ochish uchun klaviaturada <b>Ctrl + K</b> (yoki ⌘K) bosing</>
              ) : language === "ru" ? (
                <>Для быстрого вызова нажмите <b>Ctrl + K</b> (или ⌘K)</>
              ) : (
                <>Press <b>Ctrl + K</b> (or ⌘K) anywhere for quick launch</>
              )}
            </span>
          </span>
          <button
            onClick={() => {
              cyberSound.playClick();
              onClose();
            }}
            className="px-3 py-1 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold transition cursor-pointer active:scale-95"
          >
            {language === "uz" ? "Yopish (Esc)" : language === "ru" ? "Закрыть (Esc)" : "Close (Esc)"}
          </button>
        </div>
      </div>
    </div>
  );
}
