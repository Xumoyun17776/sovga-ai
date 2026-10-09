import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "../lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { auth } from "../lib/api";
import { useCurrency } from "../lib/currency";
import { useTheme } from "../lib/theme";
import AuthModal from "./AuthModal";
import UserProfileModal from "./UserProfileModal";
import AllServicesModal from "./AllServicesModal";
import ReferralModal from "./ReferralModal";
import { useToast } from "./Toast";
import { Gift, Menu, X, User, LogOut, Heart, Star, Bell, Search, Shield, ShoppingBag, DollarSign, ChevronDown, Sparkles, PackageCheck, Users, ShieldAlert, BookOpen, PenTool, Truck, ShieldCheck, Swords, Command, Box, HelpCircle, Sun, Moon, Volume2, VolumeX, SlidersHorizontal, Calculator, Zap, Store, Flame, Grid, Download, Clock } from "lucide-react";
import { cyberSound } from "../lib/cyberSound";

export default function Navbar() {
  const { t, language, setLanguage } = useTranslation();
  const toast = useToast();
  const { currency, setCurrency, exchangeRate } = useCurrency();
  const { theme, isDark, toggleTheme } = useTheme();
  const [soundEnabled, setSoundEnabled] = useState(() => cyberSound.isEnabled());
  const [open, setOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("login");
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [showAllServicesModal, setShowAllServicesModal] = useState(false);
  const [location] = useLocation();
  const { data: user } = useQuery({ queryKey: ["me"], queryFn: auth.me });

  useEffect(() => {
    const handleOpen = () => setShowAllServicesModal(true);
    window.addEventListener("open-all-services", handleOpen);

    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("open-all-services", handleOpen);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallPWA = () => {
    cyberSound.playConfirm();
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => setDeferredPrompt(null));
    } else {
      toast.info(
        language === "uz"
          ? "Mobil ilovani o'rnatish uchun brauzeringiz menyusidan 'Bosh ekranga qo'shish' (Add to Home screen) ni tanlang."
          : language === "ru"
          ? "Чтобы установить приложение, выберите 'Добавить на главный экран' в меню вашего браузера."
          : "To install the app, tap 'Add to Home Screen' from your browser menu.",
        "Sovg'a AI App"
      );
    }
  };

  const toggleSound = () => {
    const next = cyberSound.toggle();
    setSoundEnabled(next);
  };

  const links = [
    { href: "/", label: t("nav.home") || "Bosh Sahifa", icon: Search },
    { href: "/gift-finder", label: language === "uz" ? "Sovg'a Topuvchi" : language === "ru" ? "Подбор Подарка" : "Gift Finder", icon: Gift },
    { href: "/catalog", label: t("nav.deals") || "Katalog (10k+)", icon: ShoppingBag },
    { href: "/aksiyalar", label: language === "uz" ? "Aksiyalar & Baraban" : language === "ru" ? "Колесо & Промо" : "Promos & Wheel", icon: Flame },
  ];

  const isActive = (href: string) => location === href;

  return (
    <header className="sticky top-0 z-50 transition-all">
      {/* Ultra-Luxury Mini Ticker Strip */}
      <div className="bg-slate-950 text-slate-300 text-[11px] py-1 px-4 border-b border-slate-800/90 hidden xl:block">
        <div className="w-full max-w-[1800px] mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-amber-300 font-bold">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>
                {language === "uz"
                  ? "O'zbekiston Milliy AI Shopping Tahlilchisi"
                  : language === "ru"
                  ? "Национальный AI-аналитик покупок в Узбекистане"
                  : "National AI Shopping Intelligence & Arbitrage"}
              </span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">
              {language === "uz"
                ? "Uzum · Olcha · Texnomart · MediaPark · Asaxiy narxlari va kafolati jonli taqqoslanadi"
                : language === "ru"
                ? "Сравнение цен в реальном времени: Uzum · Olcha · Texnomart · MediaPark · Asaxiy"
                : "Real-time market grounding: Uzum · Olcha · Texnomart · MediaPark · Asaxiy"}
            </span>
          </div>
          <div className="flex items-center gap-3.5 text-slate-400 font-medium">
            <button
              type="button"
              onClick={() => {
                cyberSound.playClick();
                window.dispatchEvent(new CustomEvent("open-currency-converter"));
              }}
              className="hover:text-amber-300 transition flex items-center gap-1.5 cursor-pointer underline decoration-dotted underline-offset-2"
              title="Valyuta konvertori kalkulyatorini ochish (1-bosish)"
            >
              <DollarSign className="w-3 h-3 text-amber-400" />
              <span>
                {language === "uz"
                  ? `MB Rasmiy kursi: 1 USD = ${exchangeRate.toLocaleString()} UZS`
                  : language === "ru"
                  ? `Официальный курс ЦБ: 1 USD = ${exchangeRate.toLocaleString()} UZS`
                  : `Official CBU Rate: 1 USD = ${exchangeRate.toLocaleString()} UZS`}
              </span>
            </button>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {language === "uz" ? "Jonli skaner faol" : language === "ru" ? "Сканеры активны" : "Live Grounding Radar Active"}
            </span>
          </div>
        </div>
      </div>

      <div className="w-[98%] max-w-[1800px] mx-auto px-1 sm:px-2 lg:px-4 mt-3 mb-2 transition-all">
        <nav className="glass-crystal rounded-[2rem] border border-amber-200/70 dark:border-slate-700/50 shadow-2xl shadow-amber-950/5 dark:shadow-black/40 px-4 sm:px-6 relative overflow-visible backdrop-blur-3xl bg-[#faf8f4]/90 dark:bg-slate-900/80">
          <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Uzbek Market Badge */}
          <Link href="/" className="flex items-center gap-3 group ml-1">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 dark:from-slate-950 dark:via-slate-900 dark:to-amber-950 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/25 border-2 border-amber-300 dark:border-amber-400/50 group-hover:scale-105 group-hover:-rotate-3 transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/25 to-transparent pointer-events-none" />
              <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-white dark:text-amber-300 icon-glow-amber relative z-10 transition-transform group-hover:rotate-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-xl sm:text-2xl text-slate-900 dark:text-white tracking-tight">
                  Sovg'a<span className="text-amber-600 dark:text-amber-400">.ai</span>
                </span>
                <span className="text-[10px] font-black tracking-widest uppercase luxury-gold-chip px-1.5 py-0.5 rounded-md border hidden sm:inline-block">
                  LUXURY UZ
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 tracking-wide font-medium hidden xl:block">
                {language === "uz"
                  ? "O'zbekiston AI Shopping Concierge"
                  : language === "ru"
                  ? "AI Шопинг-консьерж Узбекистана"
                  : "Uzbekistan AI Shopping Concierge"}
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1 bg-amber-100/60 dark:bg-slate-900/90 p-1 xl:p-1.5 rounded-2xl border border-amber-200/70 dark:border-slate-800 shadow-inner">
            {links.map((l) => {
              const Icon = l.icon;
              const active = isActive(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`flex items-center gap-1 xl:gap-1.5 px-2 xl:px-3 py-1.5 xl:py-2 rounded-xl text-[10px] xl:text-xs 2xl:text-sm font-bold transition-all ${
                    active
                      ? "bg-white dark:bg-slate-800 text-amber-950 dark:text-white shadow-xs border border-amber-200/60 dark:border-transparent font-extrabold"
                      : "text-slate-700 dark:text-slate-400 hover:text-amber-950 dark:hover:text-white hover:bg-amber-200/50 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className={`w-3 h-3 xl:w-3.5 xl:h-3.5 ${active ? "text-amber-600 dark:text-amber-400" : "text-slate-500 dark:text-slate-400"}`} />
                  <span className="whitespace-nowrap">{l.label}</span>
                </Link>
              );
            })}


            {/* Luxury Services Dropdown */}
            <div className="relative">
              <button
                onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  servicesDropdownOpen ||
                  ["/packaging-studio", "/group-gifting", "/price-audit", "/cultural-etiquette", "/secret-santa"].includes(location)
                    ? "bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white dark:from-amber-400 dark:to-gold-500 dark:text-slate-950 shadow-md font-extrabold"
                    : "text-slate-700 dark:text-slate-300 hover:text-amber-950 dark:hover:text-white hover:bg-amber-200/50 dark:hover:bg-slate-800/60"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                <span>{language === "uz" ? "Xizmatlar" : language === "ru" ? "Услуги" : "VIP Suite"}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {servicesDropdownOpen && (
                <div
                  className="absolute left-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-fade-in"
                  onMouseLeave={() => setServicesDropdownOpen(false)}
                >
                  <div className="px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800">
                    {language === "uz" ? "Eksklyuziv AI Xizmatlari" : language === "ru" ? "Эксклюзивные AI Сервисы" : "Exclusive AI Concierge Suite"}
                  </div>
                  <Link
                    href="/#features-hub-section"
                    onClick={() => {
                      setServicesDropdownOpen(false);
                      cyberSound.playConfirm();
                      document.getElementById("features-hub-section")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50/70 dark:bg-amber-950/30 hover:bg-amber-100/70 dark:hover:bg-amber-950/50 transition border-b border-amber-200/50 dark:border-amber-800/40"
                  >
                    <SlidersHorizontal className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <div>
                      <span className="block font-bold">
                        {language === "uz" ? "Barcha 16 ta Xizmatlar Markazi" : language === "ru" ? "Центр Всех 16 Услуг" : "All 16 Services Hub"}
                      </span>
                      <span className="text-[10px] text-amber-600/80 dark:text-amber-400/80 font-normal">
                        {language === "uz" ? "Filtrlar & interaktiv qidiruv" : language === "ru" ? "Каталог с фильтрами" : "Directory & Filters"}
                      </span>
                    </div>
                  </Link>
                  <Link
                    href="/aksiyalar"
                    onClick={() => setServicesDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    <Flame className="w-4 h-4 text-amber-500" />
                    <div>
                      <span className="block font-bold">
                        {language === "uz" ? "Aksiyalar & Omad Barabani" : language === "ru" ? "Колесо Удачи & Промокоды" : "Lucky Wheel & Promos"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {language === "uz" ? "Haftada 1 marta bepul aylantirish & promokodlar" : language === "ru" ? "1 бесплатный спин в неделю и промокоды" : "1 free weekly spin & vouchers"}
                      </span>
                    </div>
                  </Link>
                  <Link
                    href="/packaging-studio"
                    onClick={() => setServicesDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    <PackageCheck className="w-4 h-4 text-amber-500" />
                    <div>
                      <span className="block font-bold">
                        {language === "uz" ? "Qadoqlash Studiyasi" : language === "ru" ? "Студия Упаковки 3D" : "3D Packaging Atelier"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {language === "uz" ? "Ipak lenta & mumli muhr" : language === "ru" ? "Шелковые ленты & сургуч" : "Silk ribbons & wax seal"}
                      </span>
                    </div>
                  </Link>
                  <Link
                    href="/mystery-box"
                    onClick={() => setServicesDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    <Box className="w-4 h-4 text-amber-500" />
                    <div>
                      <span className="block font-bold">
                        {language === "uz" ? "AI Syurpriz Quti (Mystery Box)" : language === "ru" ? "AI Сюрприз-Бокс (3D)" : "AI Mystery Box (3D)"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {language === "uz" ? "Byudjetli quti & unboxing" : language === "ru" ? "3D анбоксинг и подбор" : "Budget sets & 3D unboxing"}
                      </span>
                    </div>
                  </Link>
                  <Link
                    href="/gift-quiz"
                    onClick={() => setServicesDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    <HelpCircle className="w-4 h-4 text-amber-500" />
                    <div>
                      <span className="block font-bold">
                        {language === "uz" ? "Sovg'a Testi & Ruletka" : language === "ru" ? "Тест Подарка & Рулетка" : "Gift Quiz & Wheel"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {language === "uz" ? "4-savolli test & omad g'ildiragi" : language === "ru" ? "Тест вкусов и колесо удачи" : "4-question quiz & wheel"}
                      </span>
                    </div>
                  </Link>
                  <Link
                    href="/group-gifting"
                    onClick={() => setServicesDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    <Users className="w-4 h-4 text-amber-500" />
                    <div>
                      <span className="block font-bold">
                        {language === "uz" ? "Jamoaviy Sovg'a & Splitter" : language === "ru" ? "Групповой Сбор & Сплиттер" : "Group Gifting & Splitter"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {language === "uz" ? "Payme/Click ulushi hisoblagichi" : language === "ru" ? "Расчет долей через Payme/Click" : "Payme/Click cost splitting"}
                      </span>
                    </div>
                  </Link>
                  <Link
                    href="/price-audit"
                    onClick={() => setServicesDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    <ShieldAlert className="w-4 h-4 text-amber-500" />
                    <div>
                      <span className="block font-bold">
                        {language === "uz" ? "AI Narx Auditori" : language === "ru" ? "AI Аудитор Цен" : "AI Price & Discount Auditor"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {language === "uz" ? "Soxta chegirmalar foshi" : language === "ru" ? "Проверка честности скидок" : "Detect fake markups"}
                      </span>
                    </div>
                  </Link>
                  <Link
                    href="/cultural-etiquette"
                    onClick={() => setServicesDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    <BookOpen className="w-4 h-4 text-amber-500" />
                    <div>
                      <span className="block font-bold">
                        {language === "uz" ? "O'zbek Sovg'a Odobi" : language === "ru" ? "Узбекский Этикет Подарков" : "Uzbek Gift Etiquette Advisor"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {language === "uz" ? "Urf-odat va nozikliklar" : language === "ru" ? "Национальные обычаи и табу" : "Cultural etiquette & traditions"}
                      </span>
                    </div>
                  </Link>
                  <Link
                    href="/secret-santa"
                    onClick={() => setServicesDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    <Gift className="w-4 h-4 text-amber-500" />
                    <div>
                      <span className="block font-bold">
                        {language === "uz" ? "Secret Santa Xonasi" : language === "ru" ? "Тайный Санта" : "Secret Santa Exchange"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {language === "uz" ? "Anonim sovg'a almashish" : language === "ru" ? "Анонимный обмен подарками" : "Anonymous group gift draw"}
                      </span>
                    </div>
                  </Link>
                  <Link
                    href="/calligraphy-card"
                    onClick={() => setServicesDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    <PenTool className="w-4 h-4 text-amber-500" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="block font-bold">
                          {language === "uz" ? "Kalligrafik Ovozli Tabriknoma" : language === "ru" ? "Каллиграфия & Озвучка" : "Voice Calligraphy Card"}
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-bold">
                          🎵 NEY
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {language === "uz" ? "Sharqona ney & AI qiroati" : language === "ru" ? "Восточный ней и чтение ИИ" : "Ney soundtrack & AI voice"}
                      </span>
                    </div>
                  </Link>
                  <Link
                    href="/time-capsule"
                    onClick={() => setServicesDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="block font-bold">
                          {language === "uz" ? "AI Vaqt Kapsulasi 2027" : language === "ru" ? "Капсула Времени 2027" : "Time Capsule 2027"}
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-black">
                          YANGI
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {language === "uz" ? "Biometrik qulf & xronometr" : language === "ru" ? "Био-замок и хронометр" : "Bio-lock & chronometer"}
                      </span>
                    </div>
                  </Link>
                  <Link
                    href="/stores-delivery"
                    onClick={() => setServicesDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    <Truck className="w-4 h-4 text-amber-500" />
                    <div>
                      <span className="block font-bold">
                        {language === "uz" ? "Do'konlar & Yetkazish" : language === "ru" ? "Магазины и Доставка" : "Stores & Logistics Navigator"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {language === "uz" ? "14 viloyat PVZ va kuryer" : language === "ru" ? "ПВЗ и курьер по 14 регионам" : "14 provinces PVZ & delivery"}
                      </span>
                    </div>
                  </Link>
                  <Link
                    href="/warranty-vault"
                    onClick={() => setServicesDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-500" />
                    <div>
                      <span className="block font-bold">
                        {language === "uz" ? "Kafolat & Chek Hamyoni" : language === "ru" ? "Хранилище Гарантий и Чеков" : "Warranty & Receipt Vault"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {language === "uz" ? "Rasmiy servis markazlari" : language === "ru" ? "Официальные сервисные центры" : "Authorized service centers"}
                      </span>
                    </div>
                  </Link>
                  <Link
                    href="/compare-duel"
                    onClick={() => setServicesDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    <Swords className="w-4 h-4 text-amber-500" />
                    <div>
                      <span className="block font-bold">
                        {language === "uz" ? "AI Qiyoslagich & Duel" : language === "ru" ? "AI Дуэль & Сравнение" : "AI Spec Comparison Duel"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {language === "uz" ? "2 mahsulot to'qnashuvi" : language === "ru" ? "Битва двух моделей" : "Head-to-head model comparison"}
                      </span>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Action Area */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Spotlight HUD Trigger Button (Desktop only) */}
            <button
              onClick={() => {
                cyberSound.playConfirm();
                window.dispatchEvent(new CustomEvent("open-command-palette"));
              }}
              className="hidden xl:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-amber-400 text-xs font-mono font-bold transition shadow-xs cursor-pointer group"
              title="Spotlight HUD Qidiruv & Buyruqlar (1-bosishda ochish)"
            >
              <Command className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition" />
              <span className="text-[11px] text-slate-300 hidden sm:inline">Spotlight</span>
              <kbd className="text-[9px] text-slate-400 bg-slate-800 px-1 py-0.5 rounded-xs border border-slate-700 hidden lg:inline">⌘K</kbd>
            </button>

            {/* Language Switcher (Compact 1-Click Cycle) */}
            <button
              onClick={() => {
                cyberSound.playClick();
                const next = language === "uz" ? "ru" : language === "ru" ? "en" : "uz";
                setLanguage(next);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400/50 text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 text-xs font-bold transition cursor-pointer shadow-xs"
              title="Tilni almashtirish / Сменить язык / Change Language"
            >
              <span className="text-[11px] font-black tracking-wider uppercase">
                {language === "uz" ? "🇺🇿 UZB" : language === "ru" ? "🇷🇺 РУС" : "🇬🇧 ENG"}
              </span>
            </button>

            {/* Theme Toggle Button (Light / Dark) */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-amber-300 border border-slate-200 dark:border-slate-800 transition cursor-pointer flex items-center justify-center shadow-xs group active:scale-95"
              title={isDark ? "Switch to Light Mode (D)" : "Switch to Cyber Dark Mode (D)"}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-300 stroke-[2.2]" />
              ) : (
                <Moon className="w-4 h-4 text-amber-500 group-hover:-rotate-12 transition-transform duration-300 stroke-[2.2]" />
              )}
            </button>

            {/* Audio Sound FX Toggle (Desktop only) */}
            <button
              onClick={toggleSound}
              className={`hidden sm:flex w-9 h-9 sm:w-10 sm:h-10 rounded-xl border transition cursor-pointer items-center justify-center shadow-xs active:scale-95 ${
                soundEnabled
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60"
                  : "bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
              title={soundEnabled ? "Audio FX: Active (Mute)" : "Audio FX: Muted (Unmute)"}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 stroke-[2.2]" />
              ) : (
                <VolumeX className="w-4 h-4 stroke-[2.2]" />
              )}
            </button>

            {/* Auth / Profile Area */}
            {user ? (
              <div className="relative pl-1">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 py-1.5 px-3 rounded-2xl transition cursor-pointer group"
                >
                  <div className="w-6 h-6 rounded-lg bg-slate-900 dark:bg-amber-400 text-white dark:text-slate-950 font-bold text-xs flex items-center justify-center shadow-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[90px] truncate hidden sm:inline-block">
                    {user.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition" />
                </button>

                {/* Profile Dropdown Menu */}
                {profileDropdownOpen && (
                  <div
                    onMouseLeave={() => setProfileDropdownOpen(false)}
                    className="absolute right-0 mt-2 w-56 card-luxury bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-slide-up"
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                        {user.email?.toLowerCase().trim() === "xumoyunravshanov166@gmail.com"
                          ? "Super Admin"
                          : user.role === "pro"
                          ? "VIP Pro"
                          : language === "uz"
                          ? "Foydalanuvchi"
                          : language === "ru"
                          ? "Пользователь"
                          : "Member"}
                      </span>
                    </div>

                    <div className="py-1 text-xs">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          setProfileModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-amber-500 font-bold text-left cursor-pointer transition"
                      >
                        <User className="w-3.5 h-3.5 text-amber-500" />
                        <span>{language === "uz" ? "Mening Profilim & Xavfsizlik" : language === "ru" ? "Мой профиль и безопасность" : "My Profile & Security"}</span>
                      </button>

                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          setShowReferralModal(true);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-amber-500 font-bold text-left cursor-pointer transition"
                      >
                        <Gift className="w-3.5 h-3.5 text-amber-500" />
                        <span>{language === "uz" ? "Do'stni Taklif Qilish & Keshbek" : language === "ru" ? "Пригласить друга & Кэшбэк" : "Invite Friends & Cashback"}</span>
                      </button>

                      <Link
                        href="/wishlists"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-amber-500 font-semibold"
                      >
                        <Star className="w-3.5 h-3.5 text-amber-500" />
                        <span>{language === "uz" ? "Mening Istaklarim" : language === "ru" ? "Мой список желаний" : "My Wishlists"}</span>
                      </Link>

                      <Link
                        href="/wedding"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-rose-600 font-semibold"
                      >
                        <Heart className="w-3.5 h-3.5 text-pink-500" />
                        <span>{language === "uz" ? "To'y Reyestri" : language === "ru" ? "Свадебный реестр" : "Wedding Registry"}</span>
                      </Link>

                      <Link
                        href="/reminders"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 font-semibold"
                      >
                        <Bell className="w-3.5 h-3.5 text-blue-500" />
                        <span>{language === "uz" ? "Narx Monitoringi" : language === "ru" ? "Мониторинг цен" : "Price Alerts"}</span>
                      </Link>

                      {user.email?.toLowerCase().trim() === "xumoyunravshanov166@gmail.com" && (
                        <Link
                          href="/admin"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-purple-700 hover:bg-purple-50 font-bold"
                        >
                          <Shield className="w-3.5 h-3.5" />
                          <span>{language === "uz" ? "Admin Boshqaruvi" : language === "ru" ? "Панель администратора" : "Admin Dashboard"}</span>
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={async () => {
                          try {
                            await auth.logout();
                          } catch (e) {
                            console.error("Logout error:", e);
                          }
                          window.location.href = "/";
                        }}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{language === "uz" ? "Tizimdan chiqish" : language === "ru" ? "Выйти из системы" : "Sign Out"}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={() => {
                    cyberSound.playClick();
                    setAuthModalMode("login");
                    setShowAuthModal(true);
                  }}
                  className="px-2.5 sm:px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer active:scale-95"
                >
                  {language === "uz" ? "Kirish" : language === "ru" ? "Войти" : "Sign In"}
                </button>
                <button
                  onClick={() => {
                    cyberSound.playConfirm();
                    setAuthModalMode("register");
                    setShowAuthModal(true);
                  }}
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold btn-luxury-gold rounded-xl transition shadow-xs cursor-pointer active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 stroke-[2.2]" />
                  <span>{language === "uz" ? "Ro'yxatdan o'tish" : language === "ru" ? "Регистрация" : "Get Started"}</span>
                </button>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-100/60 dark:hover:bg-slate-800 transition cursor-pointer active:scale-95"
            >
              {open ? <X className="w-5 h-5 stroke-[2.2]" /> : <Menu className="w-5 h-5 stroke-[2.2]" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {open && (
          <div className="lg:hidden pb-5 pt-2 border-t border-slate-200 space-y-1.5 animate-fade-in">
            {!user && (
              <div className="flex items-center gap-2 p-2 bg-slate-100 rounded-2xl mb-2">
                <button
                  onClick={() => {
                    setOpen(false);
                    setAuthModalMode("login");
                    setShowAuthModal(true);
                  }}
                  className="flex-1 py-2 text-center text-xs font-bold text-slate-800 bg-white rounded-xl shadow-xs"
                >
                  {language === "uz" ? "Kirish" : language === "ru" ? "Войти" : "Log In"}
                </button>
                <button
                  onClick={() => {
                    setOpen(false);
                    setAuthModalMode("register");
                    setShowAuthModal(true);
                  }}
                  className="flex-1 py-2 text-center text-xs font-bold text-white bg-slate-900 rounded-xl shadow-xs"
                >
                  {language === "uz" ? "Ro'yxatdan o'tish" : language === "ru" ? "Регистрация" : "Sign Up"}
                </button>
              </div>
            )}

            {/* Mobile Language & Currency Quick Bar */}
            <div className="flex items-center justify-between gap-2 p-2 bg-slate-100/80 dark:bg-slate-900/80 rounded-2xl mb-2">
              <div className="flex items-center gap-1">
                {(
                  [
                    { code: "en", label: "ENG" },
                    { code: "uz", label: "O'ZB" },
                    { code: "ru", label: "РУС" },
                  ] as const
                ).map(({ code, label }) => (
                  <button
                    key={code}
                    onClick={() => {
                      cyberSound.playClick();
                      setLanguage(code);
                    }}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition ${
                      language === code
                        ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-black"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    cyberSound.playClick();
                    setCurrency(currency === "UZS" ? "USD" : "UZS");
                  }}
                  className="px-2 py-1 text-[11px] font-mono font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg shadow-xs"
                >
                  {currency}
                </button>
                <button
                  onClick={toggleSound}
                  className={`p-1.5 rounded-lg transition ${
                    soundEnabled
                      ? "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40"
                      : "text-slate-400 bg-white dark:bg-slate-800"
                  }`}
                  title="Audio FX"
                >
                  {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            {links.map((l) => {
              const Icon = l.icon;
              const active = isActive(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-sm font-semibold transition ${
                    active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-indigo-400" : "text-slate-400"}`} />
                  <span>{l.label}</span>
                </Link>
              );
            })}

            <div className="pt-2 border-t border-slate-100 px-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                {language === "uz" ? "Eksklyuziv Xizmatlar:" : language === "ru" ? "Эксклюзивные Услуги:" : "Exclusive Concierge Suite:"}
              </span>
              <div className="grid grid-cols-1 gap-1">
                {/* 1-Click Fast Spotlight Command Palette Trigger for Mobile */}
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    cyberSound.playConfirm();
                    window.dispatchEvent(new CustomEvent("open-command-palette"));
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-900 border border-slate-700/80 mb-1 cursor-pointer w-full text-left"
                >
                  <div className="flex items-center gap-2">
                    <Command className="w-3.5 h-3.5 text-amber-400" />
                    <span>
                      {language === "uz" ? "Spotlight Buyruqlar Palitrasi" : language === "ru" ? "Командная Палитра Spotlight" : "Spotlight Command Palette"}
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded font-mono">
                    {language === "uz" ? "1-bosish" : language === "ru" ? "1-клик" : "1-click"}
                  </span>
                </button>

                {/* 1-Click Fast Currency Converter for Mobile */}
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    cyberSound.playClick();
                    window.dispatchEvent(new CustomEvent("open-currency-converter"));
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/40 mb-1 cursor-pointer w-full text-left"
                >
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>
                      {language === "uz" ? "Valyuta & MB Kursi Konvertori" : language === "ru" ? "Конвертер Валют & Курс ЦБ" : "Currency & CBU Rate Converter"}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">USD/UZS</span>
                </button>

                <Link
                  href="/#features-hub-section"
                  onClick={() => {
                    setOpen(false);
                    document.getElementById("features-hub-section")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="flex items-center gap-2 p-2 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 mb-1"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500" />
                  <span>
                    {language === "uz" ? "Barcha 16 ta Xizmatlar Markazi" : language === "ru" ? "Центр Всех 16 Услуг" : "All 16 Services Hub"}
                  </span>
                </Link>
                <Link
                  href="/aksiyalar"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-100"
                >
                  <Flame className="w-3.5 h-3.5 text-rose-500" />
                  <span>
                    {language === "uz" ? "Aksiyalar & Omad Barabani" : language === "ru" ? "Колесо Удачи & Промокоды" : "Lucky Wheel & Promos"}
                  </span>
                </Link>
                <Link
                  href="/packaging-studio"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-100"
                >
                  <PackageCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>
                    {language === "uz" ? "Qadoqlash Studiyasi (3D)" : language === "ru" ? "Студия Упаковки (3D)" : "3D Packaging Atelier"}
                  </span>
                </Link>
                <Link
                  href="/mystery-box"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-100"
                >
                  <Box className="w-3.5 h-3.5 text-amber-500" />
                  <span>
                    {language === "uz" ? "AI Syurpriz Quti (Mystery Box)" : language === "ru" ? "AI Сюрприз-Бокс (3D)" : "AI Mystery Box (3D)"}
                  </span>
                </Link>
                <Link
                  href="/gift-quiz"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-100"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                  <span>
                    {language === "uz" ? "Sovg'a Testi & Ruletka" : language === "ru" ? "Тест Подарка & Рулетка" : "Gift Quiz & Wheel"}
                  </span>
                </Link>
                <Link
                  href="/group-gifting"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-100"
                >
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  <span>
                    {language === "uz" ? "Jamoaviy Sovg'a & Splitter" : language === "ru" ? "Групповой Сбор & Сплиттер" : "Group Gifting & Splitter"}
                  </span>
                </Link>
                <Link
                  href="/price-audit"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-100"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />
                  <span>
                    {language === "uz" ? "AI Narx Auditori" : language === "ru" ? "AI Аудитор Цен" : "AI Price & Discount Auditor"}
                  </span>
                </Link>
                <Link
                  href="/cultural-etiquette"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-100"
                >
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                  <span>
                    {language === "uz" ? "O'zbek Sovg'a Odobi" : language === "ru" ? "Узбекский Этикет Подарков" : "Uzbek Gift Etiquette Advisor"}
                  </span>
                </Link>
                <Link
                  href="/secret-santa"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-100"
                >
                  <Gift className="w-3.5 h-3.5 text-indigo-600" />
                  <span>
                    {language === "uz" ? "Secret Santa Xonasi" : language === "ru" ? "Тайный Санта" : "Secret Santa Exchange"}
                  </span>
                </Link>
                <Link
                  href="/calligraphy-card"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-100"
                >
                  <PenTool className="w-3.5 h-3.5 text-indigo-600" />
                  <span>
                    {language === "uz" ? "Kalligrafik Ovozli Tabriknoma" : language === "ru" ? "Каллиграфическая Открытка" : "Calligraphy Greeting Card"}
                  </span>
                </Link>
                <Link
                  href="/time-capsule"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-xl text-xs font-bold text-cyan-700 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/30"
                >
                  <Clock className="w-3.5 h-3.5 text-cyan-500" />
                  <div className="flex items-center gap-1.5">
                    <span>
                      {language === "uz" ? "AI Vaqt Kapsulasi 2027" : language === "ru" ? "Капсула Времени 2027" : "Time Capsule 2027"}
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-400 font-bold">
                      YANGI
                    </span>
                  </div>
                </Link>
                <Link
                  href="/stores-delivery"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-100"
                >
                  <Truck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>
                    {language === "uz" ? "Do'konlar & Yetkazish" : language === "ru" ? "Магазины и Доставка" : "Stores & Logistics Navigator"}
                  </span>
                </Link>
                <Link
                  href="/warranty-vault"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-100"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>
                    {language === "uz" ? "Kafolat & Chek Hamyoni" : language === "ru" ? "Хранилище Гарантий и Чеков" : "Warranty & Receipt Vault"}
                  </span>
                </Link>
                <Link
                  href="/compare-duel"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-100"
                >
                  <Swords className="w-3.5 h-3.5 text-indigo-600" />
                  <span>
                    {language === "uz" ? "AI Qiyoslagich & Duel" : language === "ru" ? "AI Дуэль & Сравнение" : "AI Spec Comparison Duel"}
                  </span>
                </Link>
              </div>
            </div>
          </div>
        )}
        </nav>
      </div>

      {/* Global Instant Login / Register Modal */}
      <AuthModal
        isOpen={showAuthModal}
        initialMode={authModalMode}
        onClose={() => setShowAuthModal(false)}
      />

      {/* User Account & Security Center Modal */}
      {user && (
        <UserProfileModal
          isOpen={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          user={user}
        />
      )}

      {/* All 16 Concierge Services Mega Directory Modal */}
      <AllServicesModal
        isOpen={showAllServicesModal}
        onClose={() => setShowAllServicesModal(false)}
      />

      {/* Viral Referral & Cashback Modal */}
      <ReferralModal
        isOpen={showReferralModal}
        onClose={() => setShowReferralModal(false)}
      />
    </header>
  );
}

