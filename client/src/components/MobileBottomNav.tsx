import { Link, useLocation } from "wouter";
import {
  Home,
  Gift,
  ShoppingBag,
  Flame,
  Grid,
} from "lucide-react";
import { cyberSound } from "../lib/cyberSound";
import { useTranslation } from "../lib/i18n";

export default function MobileBottomNav() {
  const [location] = useLocation();
  const { language } = useTranslation();

  const handleOpenServices = () => {
    cyberSound.playConfirm();
    window.dispatchEvent(new CustomEvent("open-all-services"));
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#fcfbf9]/95 dark:bg-[#07080c]/95 backdrop-blur-xl border-t border-amber-300/70 dark:border-amber-500/20 shadow-luxury px-2 py-1.5 safe-area-pb transition-colors">
      <div className="flex items-center justify-around max-w-md mx-auto">
        <Link
          href="/"
          onClick={() => cyberSound.playClick()}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-2xl transition-all cursor-pointer active:scale-95 ${
            location === "/"
              ? "text-amber-600 dark:text-amber-400 font-bold"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <div className={`p-1.5 rounded-xl transition-all ${
            location === "/"
              ? "icon-medallion icon-box-gold scale-105 shadow-xs"
              : "hover:bg-amber-100/60 dark:hover:bg-slate-800"
          }`}>
            <Home className="w-4 h-4 stroke-[2.2]" />
          </div>
          <span className="text-[10px] tracking-tight">
            {language === "uz" ? "Bosh" : language === "ru" ? "Главная" : "Home"}
          </span>
        </Link>

        <Link
          href="/gift-finder"
          onClick={() => cyberSound.playClick()}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-2xl transition-all cursor-pointer active:scale-95 ${
            location === "/gift-finder"
              ? "text-amber-600 dark:text-amber-400 font-bold"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <div className={`p-1.5 rounded-xl transition-all ${
            location === "/gift-finder"
              ? "icon-medallion icon-box-gold scale-105 shadow-xs"
              : "hover:bg-amber-100/60 dark:hover:bg-slate-800"
          }`}>
            <Gift className="w-4 h-4 stroke-[2.2]" />
          </div>
          <span className="text-[10px] tracking-tight">
            {language === "uz" ? "Sovg'a AI" : language === "ru" ? "Подбор" : "Gift AI"}
          </span>
        </Link>

        <Link
          href="/catalog"
          onClick={() => cyberSound.playClick()}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-2xl transition-all cursor-pointer active:scale-95 ${
            location === "/catalog"
              ? "text-amber-600 dark:text-amber-400 font-bold"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <div className={`p-1.5 rounded-xl transition-all ${
            location === "/catalog"
              ? "icon-medallion icon-box-gold scale-105 shadow-xs"
              : "hover:bg-amber-100/60 dark:hover:bg-slate-800"
          }`}>
            <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
          </div>
          <span className="text-[10px] tracking-tight">
            {language === "uz" ? "Katalog" : language === "ru" ? "Каталог" : "Catalog"}
          </span>
        </Link>

        <Link
          href="/aksiyalar"
          onClick={() => cyberSound.playClick()}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-2xl transition-all cursor-pointer active:scale-95 ${
            location === "/aksiyalar"
              ? "text-amber-600 dark:text-amber-400 font-bold"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <div className={`p-1.5 rounded-xl transition-all ${
            location === "/aksiyalar"
              ? "icon-medallion icon-box-gold scale-105 shadow-xs"
              : "hover:bg-amber-100/60 dark:hover:bg-slate-800"
          }`}>
            <Flame className="w-4 h-4 stroke-[2.2]" />
          </div>
          <span className="text-[10px] tracking-tight">
            {language === "uz" ? "Aksiyalar" : language === "ru" ? "Акции" : "Deals"}
          </span>
        </Link>

        <button
          onClick={handleOpenServices}
          className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-2xl transition text-slate-500 dark:text-slate-400 hover:text-amber-600 cursor-pointer active:scale-95"
        >
          <div className="p-1.5 rounded-xl relative hover:bg-amber-100/60 dark:hover:bg-slate-800 transition-all">
            <Grid className="w-4 h-4 stroke-[2.2]" />
            <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          </div>
          <span className="text-[10px] tracking-tight">
            {language === "uz" ? "Xizmatlar" : language === "ru" ? "Услуги" : "Services"}
          </span>
        </button>
      </div>
    </div>
  );
}
