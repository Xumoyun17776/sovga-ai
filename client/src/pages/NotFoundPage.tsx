import { Link } from "wouter";
import {
  Compass,
  Home,
  ArrowLeft,
  Search,
  Sparkles,
  PackageSearch,
  Gift,
  Tag,
  Box,
} from "lucide-react";
import { useTranslation } from "../lib/i18n";
import { cyberSound } from "../lib/cyberSound";

export default function NotFoundPage() {
  const { language } = useTranslation();

  const quickLinks = [
    {
      href: "/catalog",
      labelUz: "Mahsulotlar Katalogi",
      labelRu: "Каталог товаров",
      labelEn: "Product Catalog",
      icon: PackageSearch,
    },
    {
      href: "/aksiyalar",
      labelUz: "Chegirmalar & Aksiyalar",
      labelRu: "Скидки и акции",
      labelEn: "Deals & Discounts",
      icon: Tag,
    },
    {
      href: "/mystery-box",
      labelUz: "AI Mystery Box",
      labelRu: "AI Mystery Box",
      labelEn: "AI Mystery Box",
      icon: Gift,
    },
    {
      href: "/packaging-studio",
      labelUz: "Qadoqlash Studiyasi",
      labelRu: "Студия упаковки",
      labelEn: "Packaging Studio",
      icon: Box,
    },
  ];

  return (
    <div className="min-h-screen bg-[#fcfbf9] dark:bg-[#07080c] text-slate-900 dark:text-white flex items-center justify-center p-6 relative overflow-hidden transition-colors">
      {/* Artisanal Ambient Vignette */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(900px,100vw)] max-w-full h-[500px] bg-gradient-to-b from-amber-500/10 via-amber-400/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-20 right-10 w-72 h-72 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-xl w-full text-center space-y-8 animate-fade-in">
        {/* Floating Medallion */}
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 mx-auto">
          <div className="absolute inset-0 bg-amber-400/20 dark:bg-amber-400/10 rounded-full animate-pulse blur-xl" />
          <div className="w-full h-full bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:to-[#0a0c16] border-2 border-amber-300/80 dark:border-amber-500/30 rounded-3xl flex items-center justify-center shadow-luxury relative z-10 transform -rotate-6 hover:rotate-0 transition-transform duration-500">
            <Compass className="w-14 h-14 sm:w-16 sm:h-16 text-amber-600 dark:text-amber-400 stroke-[2.2] animate-spin-slow" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-100/90 dark:bg-amber-500/10 text-amber-900 dark:text-amber-400 border border-amber-300/80 dark:border-amber-500/20 text-xs font-bold uppercase tracking-wider shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 stroke-[2.2]" />
            <span>404 · Navigatsiya Xatosi</span>
          </div>

          <h1 className="text-6xl sm:text-8xl font-display font-black text-transparent bg-clip-text bg-gradient-to-br from-amber-700 via-amber-600 to-yellow-600 dark:from-amber-200 dark:via-yellow-300 dark:to-amber-500 tracking-tight">
            404
          </h1>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {language === "uz"
              ? "Sahifa Topilmadi yoki Ko'chirilgan"
              : language === "ru"
              ? "Страница не найдена или перемещена"
              : "Page Not Found or Relocated"}
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed font-normal">
            {language === "uz"
              ? "Siz qidirayotgan mahsulot yoki sahifa manzili o'zgargan bo'lishi mumkin. Qidiruvdan foydalaning yoki mashhur bo'limlarga o'ting."
              : language === "ru"
              ? "Страница или товар, который вы ищете, изменил адрес. Воспользуйтесь поиском или перейдите в популярные разделы."
              : "The product or page you are looking for may have moved. Explore our popular shopping directories below."}
          </p>
        </div>

        {/* Quick Discovery Navigation Chips */}
        <div className="bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:to-[#0a0c16] p-4.5 rounded-2xl border-2 border-amber-200/80 dark:border-amber-500/20 shadow-luxury space-y-2.5 text-left">
          <span className="text-[11px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider block">
            {language === "uz" ? "Tavsiya etilgan yo'nalishlar:" : language === "ru" ? "Рекомендуемые разделы:" : "Recommended Destinations:"}
          </span>
          <div className="grid grid-cols-2 gap-2">
            {quickLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => cyberSound.playClick()}
                  className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/80 hover:bg-amber-50 dark:hover:bg-slate-800 border border-amber-200/70 dark:border-slate-800 flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 transition shadow-2xs cursor-pointer active:scale-95"
                >
                  <Icon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 stroke-[2.2] shrink-0" />
                  <span className="truncate">
                    {language === "uz" ? item.labelUz : language === "ru" ? item.labelRu : item.labelEn}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => {
              cyberSound.playClick();
              window.history.back();
            }}
            className="w-full sm:w-auto px-6 py-3.5 bg-white/90 dark:bg-slate-900/90 hover:bg-amber-50 dark:hover:bg-slate-800 text-slate-800 dark:text-white rounded-2xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 border-2 border-amber-200/80 dark:border-slate-800 shadow-2xs cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
            <span>
              {language === "uz" ? "Orqaga qaytish" : language === "ru" ? "Назад" : "Go Back"}
            </span>
          </button>
          <Link
            href="/"
            onClick={() => cyberSound.playConfirm()}
            className="w-full sm:w-auto px-7 py-3.5 btn-luxury-gold text-slate-950 rounded-2xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer active:scale-95"
          >
            <Home className="w-4 h-4 stroke-[2.2]" />
            <span>
              {language === "uz" ? "Bosh sahifaga" : language === "ru" ? "На главную" : "Return Home"}
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
