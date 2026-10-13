import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  Command,
  Swords,
  PackageCheck,
  CreditCard,
  Volume2,
  VolumeX,
  TrendingUp,
  Sparkles,
  DollarSign,
  Compass,
  Sun,
  Moon,
  SlidersHorizontal,
} from "../lib/icons";
import { cyberSound } from "../lib/cyberSound";
import { useCurrency } from "../lib/currency";
import { useTranslation } from "../lib/i18n";
import { useTheme } from "../lib/theme";

interface FloatingCyberDockProps {
  onOpenCommandPalette: () => void;
}

export default function FloatingCyberDock({ onOpenCommandPalette }: FloatingCyberDockProps) {
  const { language, setLanguage } = useTranslation();
  const { theme, isDark, toggleTheme } = useTheme();
  const [location, navigate] = useLocation();
  const [soundEnabled, setSoundEnabled] = useState(() => cyberSound.isEnabled());
  const { currency, setCurrency, exchangeRate } = useCurrency();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const toggleSound = () => {
    const newState = cyberSound.toggle();
    setSoundEnabled(newState);
  };

  const scrollToVip = () => {
    cyberSound.playHoloChime();
    if (location !== "/") {
      navigate("/");
      setTimeout(() => {
        document.getElementById("vip-card-section")?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    } else {
      document.getElementById("vip-card-section")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToOracle = () => {
    cyberSound.playConfirm();
    if (location !== "/") {
      navigate("/");
      setTimeout(() => {
        document.getElementById("ai-oracle-section")?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    } else {
      document.getElementById("ai-oracle-section")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToFeaturesHub = () => {
    cyberSound.playConfirm();
    if (location !== "/") {
      navigate("/");
      setTimeout(() => {
        document.getElementById("features-hub-section")?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    } else {
      document.getElementById("features-hub-section")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="hidden lg:flex fixed bottom-5 left-1/2 -translate-x-1/2 z-40 px-3 py-2 bg-slate-950/95 backdrop-blur-xs border border-slate-700/80 rounded-full shadow-2xl items-center gap-1.5 sm:gap-2 transition-all hover:border-slate-600">
      {/* Tooltip Pill */}
      {hoveredItem && (
        <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-slate-900 text-amber-300 text-[11px] font-mono font-bold px-3 py-1 rounded-full border border-slate-700/80 shadow-lg pointer-events-none whitespace-nowrap animate-fade-in">
          {hoveredItem}
        </div>
      )}

      {/* Spotlight Trigger */}
      <button
        onClick={() => {
          cyberSound.playConfirm();
          onOpenCommandPalette();
        }}
        onMouseEnter={() =>
          setHoveredItem(
            language === "uz" ? "Spotlight Qidiruv (Ctrl+K)" : language === "ru" ? "Поиск Spotlight (Ctrl+K)" : "Global Command Center (Ctrl+K)"
          )
        }
        onMouseLeave={() => setHoveredItem(null)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-[var(--line-strong)] text-xs font-mono font-bold transition group cursor-pointer"
      >
        <Command className="w-3.5 h-3.5 text-amber-400 transition" />
        <span className="hidden sm:inline text-slate-300">Spotlight</span>
        <kbd className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.2 rounded-xs border border-slate-700">⌘K</kbd>
      </button>

      <div className="w-px h-5 bg-slate-800" />

      {/* Feature Command Center / All Services */}
      <button
        onClick={() => {
          cyberSound.playConfirm();
          window.dispatchEvent(new CustomEvent("open-all-services"));
        }}
        onMouseEnter={() =>
          setHoveredItem(
            language === "uz" ? "Barcha 16 ta Xizmatlar Markazi" : language === "ru" ? "Центр Всех 16 Услуг" : "All 16 Services Hub"
          )
        }
        onMouseLeave={() => setHoveredItem(null)}
        className="p-2 rounded-full text-slate-400 hover:text-amber-400 hover:bg-slate-900 transition flex items-center justify-center cursor-pointer"
      >
        <SlidersHorizontal className="w-4 h-4" />
      </button>

      {/* Duel Arena */}
      <Link
        href="/compare-duel"
        onClick={() => cyberSound.playConfirm()}
        onMouseEnter={() =>
          setHoveredItem(
            language === "uz" ? "Kiber Duel Taqqoslagich" : language === "ru" ? "Кибер-Дуэль Сравнение" : "Cyber Duel & Spec Arena"
          )
        }
        onMouseLeave={() => setHoveredItem(null)}
        className={`p-2 rounded-full transition flex items-center justify-center ${
          location === "/compare-duel"
            ? "bg-amber-400 text-white shadow-md"
            : "text-slate-400 hover:text-white hover:bg-slate-900"
        }`}
      >
        <Swords className="w-4 h-4" />
      </Link>

      {/* 3D Packaging Studio */}
      <Link
        href="/packaging-studio"
        onClick={() => cyberSound.playConfirm()}
        onMouseEnter={() =>
          setHoveredItem(
            language === "uz" ? "3D Qadoqlash Studiyasi" : language === "ru" ? "3D Студия Упаковки" : "Gift wrapping"
          )
        }
        onMouseLeave={() => setHoveredItem(null)}
        className={`p-2 rounded-full transition flex items-center justify-center ${
          location === "/packaging-studio"
            ? "bg-amber-400 text-white shadow-md"
            : "text-slate-400 hover:text-white hover:bg-slate-900"
        }`}
      >
        <PackageCheck className="w-4 h-4" />
      </Link>

      {/* AI Price Oracle */}
      <button
        onClick={scrollToOracle}
        onMouseEnter={() =>
          setHoveredItem(
            language === "uz" ? "AI Bozor Narx Bashoratchisi" : language === "ru" ? "AI Оракул Цен" : "Neural Price Oracle"
          )
        }
        onMouseLeave={() => setHoveredItem(null)}
        className="p-2 rounded-full text-slate-400 hover:text-cyan-300 hover:bg-slate-900 transition flex items-center justify-center cursor-pointer"
      >
        <TrendingUp className="w-4 h-4" />
      </button>

      {/* VIP Holographic Pass */}
      <button
        onClick={scrollToVip}
        onMouseEnter={() =>
          setHoveredItem(
            language === "uz" ? "3D Golografik VIP Karta" : language === "ru" ? "3D VIP Карта" : "Sovereign VIP Black Card"
          )
        }
        onMouseLeave={() => setHoveredItem(null)}
        className="p-2 rounded-full text-slate-400 hover:text-amber-300 hover:bg-slate-900 transition flex items-center justify-center cursor-pointer"
      >
        <CreditCard className="w-4 h-4" />
      </button>

      <div className="w-px h-5 bg-slate-800" />

      {/* Language Switcher */}
        <button
          onClick={() => {
            cyberSound.playClick();
            const nextLang = language === "uz" ? "ru" : language === "ru" ? "en" : "uz";
            setLanguage(nextLang as any);
          }}
          onMouseEnter={() => setHoveredItem("Til / Language")}
          onMouseLeave={() => setHoveredItem(null)}
          className="px-2 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-[11px] font-bold text-indigo-300 border border-slate-700/80 hover:border-indigo-400/40 transition cursor-pointer uppercase"
        >
          {language}
        </button>

        {/* Currency Switcher */}
      <button
        onClick={() => {
          cyberSound.playClick(1400);
          setCurrency(currency === "UZS" ? "USD" : "UZS");
        }}
        onMouseEnter={() =>
          setHoveredItem(
            language === "uz"
              ? `Valyuta: ${currency} (MB: ${exchangeRate.toLocaleString()} UZS)`
              : language === "ru"
              ? `Валюта: ${currency} (ЦБ: ${exchangeRate.toLocaleString()} сум)`
              : `Currency: ${currency} (CBU: ${exchangeRate.toLocaleString()} UZS)`
          )
        }
        onMouseLeave={() => setHoveredItem(null)}
        className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-[11px] font-mono font-bold text-amber-300 border border-slate-700/80 hover:border-[var(--line-strong)] transition cursor-pointer"
      >
        {currency}
      </button>

      {/* Theme Toggle Button */}
      <button
        onClick={() => toggleTheme()}
        onMouseEnter={() =>
          setHoveredItem(
            isDark
              ? language === "uz"
                ? "Yorug' Rejimga o'tish (D)"
                : language === "ru"
                ? "Переключить на светлую тему (D)"
                : "Switch to Light Mode (D)"
              : language === "uz"
              ? "Tungi Rejimga o'tish (D)"
              : language === "ru"
              ? "Переключить на темную тему (D)"
              : "Switch to Cyber Dark Mode (D)"
          )
        }
        onMouseLeave={() => setHoveredItem(null)}
        className="p-2 rounded-full text-slate-400 hover:text-amber-300 hover:bg-slate-900 transition flex items-center justify-center cursor-pointer group"
      >
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400 transition-transform" />
        ) : (
          <Moon className="w-4 h-4 text-indigo-400 transition-transform" />
        )}
      </button>

      {/* Audio Sound FX Toggle */}
      <button
        onClick={toggleSound}
        onMouseEnter={() =>
          setHoveredItem(
            soundEnabled
              ? language === "uz" ? "Tovush: Yoqilgan" : language === "ru" ? "Звук: Включен" : "Audio FX: Active"
              : language === "uz" ? "Tovush: O'chirilgan" : language === "ru" ? "Звук: Отключен" : "Audio FX: Muted"
          )
        }
        onMouseLeave={() => setHoveredItem(null)}
        className={`p-2 rounded-full transition flex items-center justify-center cursor-pointer ${
          soundEnabled
            ? "text-emerald-400 hover:bg-emerald-950/40"
            : "text-slate-500 hover:text-slate-300 hover:bg-slate-900"
        }`}
      >
        {soundEnabled ? (
          <div className="flex items-center gap-1">
            <Volume2 className="w-4 h-4 text-emerald-400" />
            <span className="flex gap-0.5 items-end h-3">
              <span className="w-0.5 h-1.5 bg-emerald-400 animate-pulse"></span>
              <span className="w-0.5 h-3 bg-emerald-400 animate-pulse delay-75"></span>
              <span className="w-0.5 h-2 bg-emerald-400 animate-pulse delay-150"></span>
            </span>
          </div>
        ) : (
          <VolumeX className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}

