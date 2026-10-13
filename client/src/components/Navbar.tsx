import { PLANS, type PlanId } from "@shared/plans";
import BrandMark from "./BrandMark";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "../lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { auth } from "../lib/api";
import { useCurrency } from "../lib/currency";
import { useTheme } from "../lib/theme";
import { TOOL_GROUPS, MAIN_LINKS, pick } from "../lib/tools";
import AuthModal from "./AuthModal";
import UserProfileModal from "./UserProfileModal";
import AllServicesModal from "./AllServicesModal";
import ReferralModal from "./ReferralModal";
import { useToast } from "./Toast";
import { Crown, Gift, Menu, X, User, LogOut, Heart, Star, Bell, Search, Shield, ShoppingBag, DollarSign, ChevronDown, Sparkles, PackageCheck, Users, ShieldAlert, BookOpen, PenTool, Truck, ShieldCheck, Swords, Command, Box, HelpCircle, Sun, Moon, Volume2, VolumeX, SlidersHorizontal, Calculator, Zap, Store, Flame, Grid, Download, Clock } from "../lib/icons";
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
      {/* Top strip */}
      <div className="bg-[var(--anor)] text-white hidden lg:block">
        <div className="wrap flex items-center justify-between h-9 text-[13px] font-medium text-white/90">
          <span>
            {language === "uz"
              ? "Uzum · Olcha · Texnomart · MediaPark · Asaxiy — narxlar bir joyda"
              : language === "ru"
              ? "Uzum · Olcha · Texnomart · MediaPark · Asaxiy — цены в одном месте"
              : "Uzum · Olcha · Texnomart · MediaPark · Asaxiy — prices in one place"}
          </span>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("open-currency-converter"))}
            className="hover:text-white transition cursor-pointer tabular"
            title={language === "uz" ? "Valyuta kalkulyatori" : language === "ru" ? "Конвертер валют" : "Currency converter"}
          >
            1 USD = {exchangeRate.toLocaleString("ru-RU")} {language === "en" ? "UZS" : language === "ru" ? "сум" : "so'm"}
          </button>
        </div>
      </div>

      <div className="bg-[var(--paper)] rule-b">
        <nav className="wrap relative overflow-visible">
          <div className="flex items-center justify-between h-[72px]">
          {/* Logo & Uzbek Market Badge */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <BrandMark />
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-8">
            {MAIN_LINKS.map((l) => {
              const active = location === l.href || location.startsWith(l.href + "/");
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`py-2 text-[15px] whitespace-nowrap border-b transition-colors ${
                    active ? "text-[var(--ink)] border-[var(--anor)]" : "text-[var(--ink-2)] border-transparent hover:text-[var(--ink)]"
                  }`}
                >
                  {pick(l.title, language)}
                </Link>
              );
            })}

            {/* Everything else, grouped */}
            <div className="relative" onMouseLeave={() => setServicesDropdownOpen(false)}>
              <button
                onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
                onMouseEnter={() => setServicesDropdownOpen(true)}
                aria-expanded={servicesDropdownOpen}
                className={`flex items-center gap-1 py-2 text-[15px] border-b transition-colors cursor-pointer ${
                  servicesDropdownOpen ? "text-[var(--ink)] border-[var(--ink)]" : "text-[var(--ink-2)] border-transparent hover:text-[var(--ink)]"
                }`}
              >
                <span className="whitespace-nowrap">{language === "uz" ? "Barcha bo'limlar" : language === "ru" ? "Все разделы" : "Everything"}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${servicesDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {servicesDropdownOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 z-50">
                  <div className="w-[min(60rem,calc(100vw-2rem))] bg-[var(--white)] rounded-2xl overflow-hidden border border-[var(--rule-soft)] shadow-xl grid grid-cols-4 divide-x divide-[var(--rule-soft)]">
                    {TOOL_GROUPS.map((g, gi) => (
                      <div key={g.id} className="p-6">
                        <p className="label mb-4 px-2"><span className="text-[var(--anor)]">0{gi + 1}</span> — {pick(g.title, language)}</p>
                        <ul className="space-y-0.5">
                          {g.items.map((it) => {
                            const Icon = it.icon;
                            return (
                              <li key={it.href}>
                                <Link
                                  href={it.href}
                                  onClick={() => setServicesDropdownOpen(false)}
                                  className={`block px-2 py-2 hover:bg-[var(--paper)] transition ${location === it.href ? "bg-[var(--paper)]" : ""}`}
                                >
                                  <span className="min-w-0">
                                    <span className="block text-[15px] font-medium text-[var(--ink)] leading-snug">{pick(it.title, language)}</span>
                                    <span className="block text-xs text-slate-500 leading-snug mt-0.5">{pick(it.desc, language)}</span>
                                  </span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Action Area */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Language Switcher (Compact 1-Click Cycle) */}
            <button
              onClick={() => {
                cyberSound.playClick();
                const next = language === "uz" ? "ru" : language === "ru" ? "en" : "uz";
                setLanguage(next);
              }}
              className="flex items-center h-9 px-2.5 rounded-lg text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--paper-2)] transition cursor-pointer"
              title="Tilni almashtirish / Сменить язык / Change Language"
            >
              <span className="text-xs font-semibold uppercase">
                {language === "uz" ? "UZ" : language === "ru" ? "RU" : "EN"}
              </span>
            </button>

            {/* Night mode */}
            <button
              onClick={() => {
                cyberSound.playClick();
                toggleTheme();
              }}
              aria-label={isDark ? (language === "uz" ? "Kunduzgi rejim" : language === "ru" ? "Светлая тема" : "Light mode") : (language === "uz" ? "Tungi rejim" : language === "ru" ? "Тёмная тема" : "Night mode")}
              title={isDark ? (language === "uz" ? "Kunduzgi rejim" : language === "ru" ? "Светлая тема" : "Light mode") : (language === "uz" ? "Tungi rejim" : language === "ru" ? "Тёмная тема" : "Night mode")}
              className="flex items-center justify-center w-9 h-9 rounded-lg text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--paper-2)] transition cursor-pointer"
            >
              {isDark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
            </button>

            {/* Auth / Profile Area */}
            {user ? (
              <div className="relative pl-1">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-white/5 h-9 pl-1.5 pr-2.5 rounded-lg transition cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-full bg-[var(--ink)] text-[var(--paper)] font-lux text-sm flex items-center justify-center">
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
                    className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-[var(--rule-soft)] shadow-xl py-2 z-50"
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      {(() => {
                        const isSuper = user.email?.toLowerCase().trim() === "baxorasaidova@gmail.com";
                        const active = user.plan && PLANS[user.plan as PlanId] && user.planExpiresAt && new Date(user.planExpiresAt).getTime() > Date.now();
                        const pid: PlanId = active ? (user.plan as PlanId) : user.role === "pro" && !user.plan ? "plus" : "free";
                        const lang = (language === "ru" || language === "en" ? language : "uz") as "uz" | "ru" | "en";
                        return (
                          <Link
                            href="/subscription"
                            onClick={() => setProfileDropdownOpen(false)}
                            className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                              pid === "free" && !isSuper ? "bg-slate-100 text-slate-800 border-slate-200" : "bg-amber-50 text-amber-800 border-amber-200"
                            }`}
                          >
                            {isSuper ? "Super Admin" : `${PLANS[pid].name[lang]} ${language === "ru" ? "тариф" : language === "en" ? "plan" : "tarif"}`}
                            {pid === "free" && !isSuper && <span className="text-amber-600">· {language === "ru" ? "улучшить" : language === "en" ? "upgrade" : "oshirish"}</span>}
                          </Link>
                        );
                      })()}
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
                        <span>{language === "uz" ? "Profil va xavfsizlik" : language === "ru" ? "Профиль и безопасность" : "Profile & security"}</span>
                      </button>

                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          setShowReferralModal(true);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-amber-500 font-bold text-left cursor-pointer transition"
                      >
                        <Gift className="w-3.5 h-3.5 text-amber-500" />
                        <span>{language === "uz" ? "Do'stlarni taklif qilish" : language === "ru" ? "Пригласить друзей" : "Invite friends"}</span>
                      </button>

                      <Link
                        href="/wishlists"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-amber-500 font-semibold"
                      >
                        <Star className="w-3.5 h-3.5 text-yellow-400" />
                        <span>{language === "uz" ? "Istaklar ro'yxati" : language === "ru" ? "Списки желаний" : "Wishlists"}</span>
                      </Link>

                      <Link
                        href="/wedding"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-rose-600 font-semibold"
                      >
                        <Heart className="w-3.5 h-3.5 text-pink-500" />
                        <span>{language === "uz" ? "To'y ro'yxati" : language === "ru" ? "Свадебный список" : "Wedding registry"}</span>
                      </Link>

                      <Link
                        href="/reminders"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 font-semibold"
                      >
                        <Bell className="w-3.5 h-3.5 text-blue-500" />
                        <span>{language === "uz" ? "Eslatmalar" : language === "ru" ? "Напоминания" : "Reminders"}</span>
                      </Link>

                      {user.email?.toLowerCase().trim() === "baxorasaidova@gmail.com" && (
                        <Link
                          href="/admin"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-purple-700 hover:bg-purple-50 font-bold"
                        >
                          <Shield className="w-3.5 h-3.5" />
                          <span>{language === "uz" ? "Admin panel" : language === "ru" ? "Админ-панель" : "Admin"}</span>
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
                        <span>{language === "uz" ? "Chiqish" : language === "ru" ? "Выйти" : "Sign out"}</span>
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
                  className="h-10 px-3 text-[15px] whitespace-nowrap text-[var(--ink)] link-u cursor-pointer"
                >
                  {language === "uz" ? "Kirish" : language === "ru" ? "Войти" : "Sign in"}
                </button>
                <button
                  onClick={() => {
                    cyberSound.playConfirm();
                    setAuthModalMode("register");
                    setShowAuthModal(true);
                  }}
                  className="hidden sm:flex items-center h-10 px-5 text-sm btn-primary"
                >
                  <span className="whitespace-nowrap">{language === "uz" ? "Ro'yxatdan o'tish" : language === "ru" ? "Регистрация" : "Sign up"}</span>
                </button>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer"
              aria-label="Menu"
            >
              {open ? <X className="w-5 h-5 stroke-[2.2]" /> : <Menu className="w-5 h-5 stroke-[2.2]" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {open && (
          <div className="lg:hidden pb-5 pt-3 border-t border-[var(--line)] space-y-1 animate-fade-in max-h-[75vh] overflow-y-auto">
            {!user && (
              <div className="flex items-center gap-2 pb-2">
                <button
                  onClick={() => {
                    setOpen(false);
                    setAuthModalMode("login");
                    setShowAuthModal(true);
                  }}
                  className="flex-1 h-10 text-center text-sm font-medium text-slate-800 dark:text-slate-100 border border-[var(--line)] rounded-lg"
                >
                  {language === "uz" ? "Kirish" : language === "ru" ? "Войти" : "Sign in"}
                </button>
                <button
                  onClick={() => {
                    setOpen(false);
                    setAuthModalMode("register");
                    setShowAuthModal(true);
                  }}
                  className="flex-1 h-10 text-center text-sm font-medium text-white bg-slate-900 dark:bg-amber-500 dark:text-white rounded-lg"
                >
                  {language === "uz" ? "Ro'yxatdan o'tish" : language === "ru" ? "Регистрация" : "Sign up"}
                </button>
              </div>
            )}

            {/* Mobile Language & Currency Quick Bar */}
            <div className="flex items-center justify-between gap-2 py-2 mb-1 border-b border-[var(--line)]">
              <div className="flex items-center gap-1">
                {(
                  [
                    { code: "en", label: "EN" },
                    { code: "uz", label: "UZ" },
                    { code: "ru", label: "RU" },
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
                        ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold"
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
              </div>
            </div>
            {TOOL_GROUPS.map((g) => (
              <div key={g.id} className="pt-3">
                <p className="text-xs font-semibold text-slate-500 px-3 mb-1">{pick(g.title, language)}</p>
                {g.items.map((it) => {
                  const Icon = it.icon;
                  return (
                    <Link
                      key={it.href}
                      href={it.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm ${location === it.href ? "bg-[var(--surface-2)] text-slate-900 font-medium" : "text-slate-700 hover:bg-[var(--surface-2)]"}`}
                    >
                      <Icon className="w-4 h-4 text-[var(--accent)]" />
                      <span>{pick(it.title, language)}</span>
                    </Link>
                  );
                })}
              </div>
            ))}

            <div className="pt-3 mt-2 border-t border-[var(--line)]">
              <Link
                href="/subscription"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-slate-700 hover:bg-[var(--surface-2)]"
              >
                <span className="flex items-center gap-2.5">
                  <Crown className="w-4 h-4 text-[var(--accent)]" />
                  {language === "uz" ? "Tariflar" : language === "ru" ? "Тарифы" : "Plans"}
                </span>
                <span className="text-xs text-slate-400">{language === "uz" ? "14 999 so'mdan" : language === "ru" ? "от 14 999 сум" : "from 14,999 UZS"}</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  window.dispatchEvent(new CustomEvent("open-currency-converter"));
                }}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-slate-700 hover:bg-[var(--surface-2)] cursor-pointer w-full text-left"
              >
                <span className="flex items-center gap-2.5">
                  <DollarSign className="w-4 h-4 text-slate-400" />
                  {language === "uz" ? "Valyuta kalkulyatori" : language === "ru" ? "Конвертер валют" : "Currency converter"}
                </span>
                <span className="text-xs text-slate-400">USD/UZS</span>
              </button>
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

