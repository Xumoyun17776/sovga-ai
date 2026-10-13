import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import {
  Search,
  Sparkles,
  Command,
  ArrowRight,
  Gift,
  Swords,
  PackageCheck,
  ShieldCheck,
  CreditCard,
  Radar,
  X,
  Compass,
  DollarSign,
  TrendingUp,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Box,
  HelpCircle,
  Users,
  ShieldAlert,
  BookOpen,
  PenTool,
  SlidersHorizontal,
  Flame,
  Grid,
  Heart,
} from "../lib/icons";
import { cyberSound } from "../lib/cyberSound";
import { useCurrency } from "../lib/currency";
import { useTranslation } from "../lib/i18n";
import { useTheme } from "../lib/theme";

interface CommandItem {
  id: string;
  title: string;
  category: "feature" | "product" | "store" | "action";
  subtitle?: string;
  badge?: string;
  icon: any;
  action: () => void;
}

interface CyberCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CyberCommandPalette({ isOpen, onClose }: CyberCommandPaletteProps) {
  const { language } = useTranslation();
  const { isDark, toggleTheme } = useTheme();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [, navigate] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const { exchangeRate } = useCurrency();

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      cyberSound.playRadarBlip();
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) { e.preventDefault(); onClose(); } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open triggered from parent or global handler
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const defaultItems: CommandItem[] = [
    {
      id: "toggle-sound-fx",
      title: cyberSound.isEnabled() ? "Turn sound off" : "Turn sound on",
      category: "action",
      subtitle: "Native Web Audio haptic feedback on clicks and transitions",
      badge: "AUDIO",
      icon: cyberSound.isEnabled() ? VolumeX : Volume2,
      action: () => {
        cyberSound.toggle();
        onClose();
      },
    },
    {
      id: "currency-converter",
      title:
        language === "uz"
          ? "Valyuta & Markaziy Bank Konvertori (USD / UZS)"
          : language === "ru"
          ? "Конвертер Валют ЦБ РУз (USD / UZS)"
          : "Currency & CBU Rate Converter (USD / UZS)",
      category: "action",
      subtitle:
        language === "uz"
          ? "MB rasmiy kursi bo'yicha jonli ikki tomonlama dollar/so'm kalkulyatori"
          : language === "ru"
          ? "Двусторонний расчет по официальному курсу ЦБ Узбекистана"
          : "Live dual USD/UZS calculator based on official CBU rates",
      badge: "CBU RATE",
      icon: DollarSign,
      action: () => {
        onClose();
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("open-currency-converter"));
        }, 120);
      },
    },
    {
      id: "ai-search",
      title: language === "uz" ? "AI Qidiruv & Narx Tahlili" : language === "ru" ? "AI Поиск и Анализ Цен" : "Search products and prices",
      category: "feature",
      subtitle: language === "uz" ? "Uzum, Texnomart, MediaPark bo'yicha eng past narxni topish" : language === "ru" ? "Поиск лучшей цены на Uzum, Texnomart, MediaPark" : "Find lowest verified prices across Uzum, Texnomart, and MediaPark",
      badge: "AI v3.8",
      icon: Sparkles,
      action: () => {
        if (query.trim()) navigate(`/search?q=${encodeURIComponent(query)}`);
        else navigate("/gift-finder");
        onClose();
      },
    },
    {
      id: "aksiyalar-baraban",
      title:
        language === "uz"
          ? "Aksiyalar & Omad Barabani (Fortune Wheel)"
          : language === "ru"
          ? "Колесо Фортуны и Промокоды"
          : "Promos & Lucky Wheel (Fortune Wheel)",
      category: "feature",
      subtitle:
        language === "uz"
          ? "Haftada 1 marta bepul aylantirish, Uzum va Texnomart uchun 70,000 UZS gacha promokodlar"
          : language === "ru"
          ? "Еженедельное колесо удачи (1 раз в неделю) и скидочные промокоды"
          : "Weekly free spin (1x per week), coupons up to 70,000 UZS for Uzum & Texnomart",
      badge: "PROMO WHEEL",
      icon: Flame,
      action: () => {
        navigate("/aksiyalar");
        onClose();
      },
    },
    {
      id: "all-services-modal",
      title:
        language === "uz"
          ? "Barcha 16 ta Xizmatlar & Imkoniyatlar Katalogi"
          : language === "ru"
          ? "Каталог Всех 16 Сервисов"
          : "All 16 Services & Tools Directory",
      category: "feature",
      subtitle:
        language === "uz"
          ? "Barcha AI vositalar, o'yinlar, kalkulyatorlar va xizmatlar katalogi"
          : language === "ru"
          ? "Полный каталог всех инструментов платформы"
          : "Complete directory of all AI tools, games, calculators and services",
      badge: "ALL SERVICES",
      icon: Grid,
      action: () => {
        onClose();
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("open-all-services"));
        }, 120);
      },
    },
    {
      id: "feature-hub",
      title:
        language === "uz"
          ? "Barcha 16 ta Xizmatlar Markazi"
          : language === "ru"
          ? "Центр Всех 16 Услуг (Command Hub)"
          : "All tools",
      category: "feature",
      subtitle:
        language === "uz"
          ? "Barcha AI vositalar, o'yinlar, mumli muhr studiyasi va moliya xizmatlari"
          : language === "ru"
          ? "Полный каталог всех сервисов платформы с поиском"
          : "Searchable catalog of all platform tools and features",
      badge: "HUB",
      icon: SlidersHorizontal,
      action: () => {
        navigate("/");
        onClose();
        setTimeout(() => {
          document.getElementById("features-hub-section")?.scrollIntoView({ behavior: "smooth" });
        }, 150);
      },
    },
    {
      id: "mystery-box",
      title:
        language === "uz"
          ? "AI Syurpriz Quti (Mystery Box & Unboxing)"
          : language === "ru"
          ? "AI Коробка-Сюрприз (Mystery Box)"
          : "AI Mystery Box & 3D Unboxing",
      category: "feature",
      subtitle:
        language === "uz"
          ? "3D virtual ochish fizikasi va byudjetli syurpriz to'plami"
          : language === "ru"
          ? "Виртуальный 3D анбоксинг и подбор набора подарков"
          : "3D unboxing physics and budget mystery gift bundle",
      badge: "3D UNBOX",
      icon: Box,
      action: () => {
        navigate("/mystery-box");
        onClose();
      },
    },
    {
      id: "gift-quiz",
      title:
        language === "uz"
          ? "Psixometrik Sovg'a Testi & Omad Ruletkasi"
          : language === "ru"
          ? "Тест Подарка & Колесо Фортуны"
          : "Gift Personality Quiz & Fortune Wheel",
      category: "feature",
      subtitle:
        language === "uz"
          ? "4 ta savol bilan shaxsiyat tahlili va interaktiv ruletka"
          : language === "ru"
          ? "4 вопроса для поиска подарка и колесо удачи"
          : "4-question personality quiz and interactive wheel",
      badge: "QUIZ & WHEEL",
      icon: HelpCircle,
      action: () => {
        navigate("/gift-quiz");
        onClose();
      },
    },
    {
      id: "group-gifting",
      title:
        language === "uz"
          ? "Jamoaviy Sovg'a & Payme Splitter"
          : language === "ru"
          ? "Групповой Сбор & Payme Splitter"
          : "Group Gifting & Payme/Click Splitter",
      category: "feature",
      subtitle:
        language === "uz"
          ? "Do'stlar va hamkasblar bilan katta sovg'aga pul to'plash"
          : language === "ru"
          ? "Совместный сбор средств на большой подарок"
          : "Crowdfund larger gifts with friends and split costs",
      badge: "CROWDFUND",
      icon: Users,
      action: () => {
        navigate("/group-gifting");
        onClose();
      },
    },
    {
      id: "price-audit",
      title:
        language === "uz"
          ? "AI Narx Auditori & Soxta Chegirma Foshi"
          : language === "ru"
          ? "AI Аудитор Цен и Фальшивых Скидок"
          : "AI Price & Fake Discount Audit",
      category: "feature",
      subtitle:
        language === "uz"
          ? "30 kunlik narx grafigi va bozor medianasi auditi"
          : language === "ru"
          ? "Разоблачение фейковых скидок и график цен"
          : "Audit discounts with 30-day price history curve",
      badge: "FINTECH AUDIT",
      icon: ShieldAlert,
      action: () => {
        navigate("/price-audit");
        onClose();
      },
    },
    {
      id: "cultural-etiquette",
      title:
        language === "uz"
          ? "O'zbek Sovg'a Odobi & Urf-odat AI"
          : language === "ru"
          ? "Узбекский Этикет Подарков & Традиции"
          : "Uzbek Gift Etiquette & Traditions Advisor",
      category: "feature",
      subtitle:
        language === "uz"
          ? "Qudalar, kelin salom va xonadonlar uchun milliy nozikliklar"
          : language === "ru"
          ? "Национальные обычаи, табу и дуа"
          : "In-laws etiquette, kelin salom, taboos, and blessings",
      badge: "HERITAGE AI",
      icon: BookOpen,
      action: () => {
        navigate("/cultural-etiquette");
        onClose();
      },
    },
    {
      id: "calligraphy-card",
      title:
        language === "uz"
          ? "Kalligrafik Tabriknoma & Zardo'zlik"
          : language === "ru"
          ? "Каллиграфические Открытки & Дуа"
          : "Calligraphy Greeting Card & Gold Script",
      category: "feature",
      subtitle:
        language === "uz"
          ? "Buxoro zarhalli va Samarqand feruza xattotlik kartochkalari"
          : language === "ru"
          ? "Открытки в стиле бухарского золота"
          : "Bukhara gold-foil and Samarkand turquoise card designer",
      badge: "CALLIGRAPHY",
      icon: PenTool,
      action: () => {
        navigate("/calligraphy-card");
        onClose();
      },
    },
    {
      id: "warranty-vault",
      title:
        language === "uz"
          ? "Raqamli Kafolat & Cheklar Hamyoni (Vault)"
          : language === "ru"
          ? "Кошелек Гарантий & Чек-Локер"
          : "Digital Warranty & Receipt Vault",
      category: "feature",
      subtitle:
        language === "uz"
          ? "Texnikalar kafolat taymeri va rasmiy servislar"
          : language === "ru"
          ? "Учет сроков гарантии и контакты сервисов"
          : "Track warranty expirations and official service center contacts",
      badge: "VAULT",
      icon: ShieldCheck,
      action: () => {
        navigate("/warranty-vault");
        onClose();
      },
    },
    {
      id: "duel",
      title: language === "uz" ? "Kiber Duel & Taqqoslagich" : language === "ru" ? "Кибер-Дуэль и Сравнение" : "Compare two products",
      category: "feature",
      subtitle: language === "uz" ? "2 ta mahsulotni yuzma-yuz solishtirish (AirPods vs Sony)" : language === "ru" ? "Сравнение 2 товаров лицом к лицу" : "Head-to-head AI product duel & spec comparison",
      badge: "LIVE DUEL",
      icon: Swords,
      action: () => {
        navigate("/compare-duel");
        onClose();
      },
    },
    {
      id: "packaging",
      title: language === "uz" ? "3D Qadoqlash Studiyasi" : language === "ru" ? "3D Студия Упаковки" : "3D Luxury Packaging Studio",
      category: "feature",
      subtitle: language === "uz" ? "Shoxona quti, ipak lenta va mumli muhr dizayneri" : language === "ru" ? "Роскошные коробки, шелковые ленты и сургучная печать" : "Bespoke royal gift boxes, silk ribbons & wax seal studio",
      badge: "3D STUDIO",
      icon: PackageCheck,
      action: () => {
        navigate("/packaging-studio");
        onClose();
      },
    },
    {
      id: "card",
      title: language === "uz" ? "Sovg'a Pro" : language === "ru" ? "Sovg'a Pro" : "Sovg'a Pro",
      category: "feature",
      subtitle: language === "uz" ? "Shaxsiy giroskopik konsyerj kartasini ochish" : language === "ru" ? "Открыть карту персонального консьержа" : "Open your personalized gyroscopic luxury concierge pass",
      badge: "BLACK CARD",
      icon: CreditCard,
      action: () => {
        navigate("/");
        onClose();
        setTimeout(() => {
          document.getElementById("vip-card-section")?.scrollIntoView({ behavior: "smooth" });
        }, 150);
      },
    },
    {
      id: "logistics",
      title: language === "uz" ? "Toshkent Logistika Radari" : language === "ru" ? "Радар Логистики Ташкента" : "Delivery hubs in Tashkent",
      category: "feature",
      subtitle: language === "uz" ? "Sergeli Hub, Chilonzor va Malika omborlari monitoringi" : language === "ru" ? "Мониторинг хабов Сергели, Чиланзар и Малика" : "Live telemetry for Sergeli Hub, Chilonzor & Malika warehouses",
      badge: "35 MIN",
      icon: Radar,
      action: () => {
        navigate("/stores-delivery");
        onClose();
      },
    },
    {
      id: "wedding-registry",
      title: language === "uz" ? "To'y & Marosim Sovg'alari Ro'yxati" : language === "ru" ? "Свадебный Реестр Подарков" : "Wedding & Ceremony Registry",
      category: "feature",
      subtitle: language === "uz" ? "Kelin-kuyovlar uchun aqlli sovg'alar reyestri va mehmonlar bron qilish tizimi" : language === "ru" ? "Умный свадебный вишлист и бронирование гостями" : "Curated wedding gift registry with guest reservation system",
      badge: "WEDDING",
      icon: Gift,
      action: () => {
        navigate("/wedding-registry");
        onClose();
      },
    },
    {
      id: "merchant-portal",
      title: language === "uz" ? "B2B Savdogarlar & Do'konlar Portali" : language === "ru" ? "B2B Кабинет Продавца" : "B2B Merchant Portal & Store Hub",
      category: "feature",
      subtitle: language === "uz" ? "Mahsulotlar joylash, narxlarni sinxronlash va sotuvlar statistikasi" : language === "ru" ? "Добавление товаров, синхронизация цен и статистика" : "Manage merchant products, sync live pricing, and analytics",
      badge: "MERCHANT",
      icon: Grid,
      action: () => {
        navigate("/merchant");
        onClose();
      },
    },
    {
      id: "my-wishlist",
      title: language === "uz" ? "Mening Istaklar Ro'yxatim (Wishlist)" : language === "ru" ? "Мой Список Желаний (Вишлист)" : "My Personal Wishlist & Registry",
      category: "feature",
      subtitle: language === "uz" ? "Saqlangan orzudagi sovg'alar va do'stlar bilan ulashish havolasi" : language === "ru" ? "Сохраненные подарки и ссылка для друзей" : "Saved dream gifts and shareable public link for friends",
      badge: "WISHLIST",
      icon: Heart,
      action: () => {
        navigate("/wishlist");
        onClose();
      },
    },
    {
      id: "time-capsule",
      title: language === "uz" ? "Kelajak Uchun Vaqt Kapsulasi" : language === "ru" ? "Капсула Времени" : "Future Time Capsule & Sealed Memory",
      category: "feature",
      subtitle: language === "uz" ? "Kelajakdagi sanada ochiladigan raqamli xabar va sovg'alar" : language === "ru" ? "Запечатанное поздравление и подарок на будущую дату" : "Time-locked gift dedication unlocking on a future date",
      badge: "CAPSULE",
      icon: Box,
      action: () => {
        navigate("/time-capsule");
        onClose();
      },
    },
    {
      id: "pro-subscription",
      title: language === "uz" ? "Sovg'a AI VIP & Pro Obuna" : language === "ru" ? "Подписка Sovg'a AI Pro VIP" : "Sovg'a AI Pro VIP Membership",
      category: "feature",
      subtitle: language === "uz" ? "Cheksiz AI tahlil, chek skaneri va eksklyuziv imtiyozlar" : language === "ru" ? "Безлимитный AI поиск, сканер чеков и VIP привилегии" : "Unlimited AI research, instant receipt scanner & VIP perks",
      badge: "VIP PRO",
      icon: Sparkles,
      action: () => {
        navigate("/subscription");
        onClose();
      },
    },
    {
      id: "prod-iphone",
      title: "iPhone 16 Pro Max 256GB — Live Price Comparison",
      category: "product",
      subtitle: "Uzum: 16.49M · Texnomart: 16.89M · MediaPark: 16.65M UZS",
      badge: language === "uz" ? "ENG ARZON" : language === "ru" ? "ЛУЧШАЯ ЦЕНА" : "LOWEST",
      icon: Gift,
      action: () => {
        navigate("/search?q=iPhone 16 Pro Max");
        onClose();
      },
    },
    {
      id: "prod-dyson",
      title: "Dyson Airwrap Complete Long — Official Warranty",
      category: "product",
      subtitle: language === "uz" ? "O'zbekiston rasmiy kafolati va to'g'ridan-to'g'ri do'kon havolalari" : language === "ru" ? "Официальная гарантия и прямые ссылки на магазины" : "Official Uzbekistan warranty & direct verified merchant links",
      badge: "PREMIUM",
      icon: Gift,
      action: () => {
        navigate("/search?q=Dyson Airwrap");
        onClose();
      },
    },
    {
      id: "prod-zardozi",
      title: language === "uz" ? "Buxoro Zardo'zi Shoxona Chopon" : language === "ru" ? "Бухарский Золотошвейный Чапан" : "Bukhara Handcrafted Gold Zardozi Robe",
      category: "product",
      subtitle: language === "uz" ? "To'y va marosimlar uchun milliy qo'l mehnati shoh asari" : language === "ru" ? "Шедевр ручной работы для свадеб и торжеств" : "National luxury artisan masterpiece for weddings & gala ceremonies",
      badge: "HERITAGE",
      icon: Gift,
      action: () => {
        navigate("/search?q=zardozi");
        onClose();
      },
    },
  ];

  // Currency computation if query is numeric
  const numericVal = parseFloat(query.replace(/[^\d.]/g, ""));
  let currencyConversionItem: CommandItem | null = null;
  if (!isNaN(numericVal) && numericVal > 0) {
    const cbuSubtitle =
      language === "uz"
        ? `Markaziy Bank rasmiy kursi (1 USD = ${exchangeRate.toLocaleString()} UZS)`
        : language === "ru"
        ? `Официальный курс ЦБ РУз (1 USD = ${exchangeRate.toLocaleString()} UZS)`
        : `Official CBU exchange rate (1 USD = ${exchangeRate.toLocaleString()} UZS)`;
    const cbuBadge = language === "uz" ? "MB KURSI" : language === "ru" ? "КУРС ЦБ" : "CBU RATE";

    if (numericVal < 10000) {
      // Treat as USD -> convert to UZS
      const uzs = Math.round(numericVal * exchangeRate);
      currencyConversionItem = {
        id: "curr-usd-to-uzs",
        title: `$${numericVal.toLocaleString()} = ${uzs.toLocaleString()} UZS`,
        category: "feature",
        subtitle: cbuSubtitle,
        badge: cbuBadge,
        icon: DollarSign,
        action: () => {},
      };
    } else {
      // Treat as UZS -> convert to USD
      const usd = (numericVal / exchangeRate).toFixed(2);
      currencyConversionItem = {
        id: "curr-uzs-to-usd",
        title: `${numericVal.toLocaleString()} UZS = $${usd}`,
        category: "feature",
        subtitle: cbuSubtitle,
        badge: cbuBadge,
        icon: DollarSign,
        action: () => {},
      };
    }
  }

  const filteredItems = [
    ...(currencyConversionItem ? [currencyConversionItem] : []),
    ...defaultItems.filter((item) => {
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q))
      );
    }),
  ];

  const handleKeyDownModal = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      cyberSound.playClick(1000);
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      cyberSound.playClick(1000);
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        cyberSound.playConfirm();
        filteredItems[selectedIndex].action();
      } else if (query.trim()) {
        cyberSound.playConfirm();
        navigate(`/search?q=${encodeURIComponent(query)}`);
        onClose();
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-6 sm:pt-16 p-3 sm:px-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto" onClick={onClose}>
      <div
        className="bg-white dark:bg-[#0b1224] w-full max-w-2xl border border-[var(--line)] dark:border-amber-500/25 rounded-2xl shadow-sm overflow-hidden text-slate-900 dark:text-slate-100 flex flex-col max-h-[85vh] max-h-[85dvh] relative animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDownModal}
      >
        {/* Top ambient glow */}

        {/* Header Search Field */}
        <div className="relative flex items-center px-5 py-4 border-b border-[var(--line)] dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/40 backdrop-blur-md">
          <Search className="w-5 h-5 text-amber-500 dark:text-amber-400 mr-3 shrink-0 stroke-[2.2]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder={
              language === "uz"
                ? "Sovg'a, mahsulot, xizmat yoki valyuta hisoblash..."
                : language === "ru"
                ? "Поиск подарка, товара, услуги или расчет валюты..."
                : "Search gifts, products, services, or convert currency..."
            }
            className="w-full bg-transparent text-base sm:text-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none font-medium"
          />
          {query ? (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-amber-100/60 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4 stroke-[2.2]" />
            </button>
          ) : (
            <div className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400 dark:bg-slate-800/80 px-2 py-0.5 rounded-lg border border-[var(--line)] dark:border-slate-700 bg-[#f4f5f8] dark:bg-white/5 text-slate-600 dark:text-slate-300 border-[var(--line)]">
              <span>ESC</span>
            </div>
          )}
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 space-y-1 divide-y divide-amber-100/50 dark:divide-slate-800/40">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <Compass className="w-8 h-8 mx-auto mb-2 text-amber-500/70 animate-spin stroke-[2.2]" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {language === "uz" ? "Bunday so'rov bo'yicha natija topilmadi." : language === "ru" ? "Ничего не найдено." : "No results matching this query."}
              </p>
              <button
                onClick={() => {
                  navigate(`/search?q=${encodeURIComponent(query)}`);
                  onClose();
                }}
                className="mt-3 px-4 py-2 btn-luxury-gold text-slate-950 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                {language === "uz" ? `“${query}” bo'yicha AI qidiruvni boshlash →` : language === "ru" ? `Запустить AI поиск для «${query}» →` : `Launch AI search for “${query}” →`}
              </button>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    cyberSound.playConfirm();
                    item.action();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? "bg-amber-100/80 dark:bg-slate-800/90 text-slate-900 dark:text-white border border-amber-400/60 dark:border-amber-500/30 shadow-xs"
                      : "text-slate-700 dark:text-slate-300 hover:bg-amber-50/60 dark:hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition ${
                        isSelected
                          ? "bg-amber-400/25 border-amber-400/60 text-amber-700 dark:text-amber-300 shadow-2xs"
                          : "bg-white/80 dark:bg-slate-800/80 border-[var(--line)] dark:border-slate-700 text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      <Icon className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm truncate text-slate-900 dark:text-white">{item.title}</span>
                        {item.badge && (
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md font-bold uppercase ${
                              isSelected
                                ? "bg-amber-400 text-white font-bold shadow-2xs"
                                : "bg-amber-50 dark:bg-slate-800 text-amber-800 dark:text-slate-400 border border-[var(--line)] dark:border-slate-700"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.subtitle && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{item.subtitle}</p>
                      )}
                    </div>
                  </div>
                  <ArrowRight
                    className={`w-4 h-4 stroke-[2.2] transition-transform ${
                      isSelected ? "translate-x-1 text-amber-600 dark:text-amber-400 opacity-100" : "opacity-0"
                    }`}
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Footer Indicator */}
        <div className="px-5 py-3 border-t border-[var(--line)] dark:border-slate-800 bg-amber-50/50 dark:bg-slate-950/70 text-slate-600 dark:text-slate-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span>
              <kbd className="bg-white dark:bg-slate-800 border border-[var(--line)] dark:border-slate-700 px-1.5 py-0.5 rounded-md text-slate-700 dark:text-slate-300 shadow-2xs font-bold">↑</kbd>{" "}
              <kbd className="bg-white dark:bg-slate-800 border border-[var(--line)] dark:border-slate-700 px-1.5 py-0.5 rounded-md text-slate-700 dark:text-slate-300 shadow-2xs font-bold">↓</kbd> {language === "uz" ? "Harakat" : language === "ru" ? "Навигация" : "Navigate"}
            </span>
            <span>
              <kbd className="bg-white dark:bg-slate-800 border border-[var(--line)] dark:border-slate-700 px-1.5 py-0.5 rounded-md text-slate-700 dark:text-slate-300 shadow-2xs font-bold">↵</kbd> {language === "uz" ? "Tanlash" : language === "ru" ? "Выбрать" : "Select"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-400 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 stroke-[2.2]" />
            <span>SOVG'A AI SPOTLIGHT HUD</span>
          </div>
        </div>
      </div>
    </div>
  );
}

