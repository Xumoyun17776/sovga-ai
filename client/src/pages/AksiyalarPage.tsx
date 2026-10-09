import PromoCodesHub from "../components/PromoCodesHub";
import { Sparkles, Gift, Tag, Flame } from "lucide-react";
import { useTranslation } from "../lib/i18n";

export default function AksiyalarPage() {
  const { language } = useTranslation();

  return (
    <div className="min-h-screen bg-[#fcfbf9] dark:bg-[#07080c] animate-fade-in py-10 relative overflow-hidden">
      {/* Artisanal Ambient Vignette & Warm Gold Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[min(1000px,100vw)] max-w-full h-[450px] bg-gradient-to-b from-amber-500/10 via-indigo-500/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-40 right-10 w-96 h-96 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-80 left-10 w-96 h-96 bg-lapis-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          {/* Imperial Crest Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 via-gold-500/20 to-amber-500/15 border border-gold-500/30 text-amber-900 dark:text-amber-300 text-xs font-black uppercase tracking-widest shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-gold-500 animate-pulse stroke-[2.2]" />
            <span>
              {language === "uz"
                ? "Rasmiy Dilerlik & Eksklyuziv Aksiyalar"
                : language === "ru"
                ? "Официальные Акции и Дилерские Скидки"
                : "Official Retail Promotions & Promocodes"}
            </span>
          </div>

          <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl text-slate-900 dark:text-white tracking-tight">
            {language === "uz" ? "Aksiyalar Markazi & " : language === "ru" ? "Центр Акций и " : "Promo Codes Hub & "}
            <span className="bg-gradient-to-r from-amber-600 via-gold-500 to-amber-500 bg-clip-text text-transparent">
              {language === "uz" ? "Omad Barabani" : language === "ru" ? "Колесо Удачи" : "Fortune Wheel"}
            </span>
          </h1>

          <p className="text-xs sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal max-w-2xl mx-auto">
            {language === "uz"
              ? "O'zbekistondagi Uzum Market, Texnomart, MediaPark va yetakchi brendlarning tekshirilgan promokodlari hamda har hafta 1 marta bepul aylantirish mumkin bo'lgan Omad Barabani."
              : language === "ru"
              ? "Проверенные промокоды ведущих брендов Узбекистана (Uzum Market, Texnomart, MediaPark) и Колесо Удачи с 1 бесплатным вращением в неделю."
              : "Verified retail promotional codes from Uzum Market, Texnomart, MediaPark, and Uzbekistan's top merchants, paired with our weekly complimentary Fortune Wheel."}
          </p>

          {/* Quick Value Pillars */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-[11px] font-bold text-slate-600 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs">
              <Gift className="w-3.5 h-3.5 text-amber-500 stroke-[2.2]" />
              <span>
                {language === "uz" ? "100% Haqiqiy Vaucherlar" : language === "ru" ? "100% Настоящие Ваучеры" : "100% Verified Vouchers"}
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500 stroke-[2.2]" />
              <span>
                {language === "uz" ? "Haftada 1 Marta Bepul" : language === "ru" ? "1 Раз в Неделю Бесплатно" : "1 Free Spin Weekly"}
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs">
              <Tag className="w-3.5 h-3.5 text-indigo-500 stroke-[2.2]" />
              <span>
                {language === "uz" ? "70,000 UZS gacha Chegirmalar" : language === "ru" ? "Скидки до 70 000 UZS" : "Up to 70,000 UZS Savings"}
              </span>
            </span>
          </div>
        </div>

        {/* The Full Promo Codes & Wheel Hub */}
        <PromoCodesHub />
      </div>
    </div>
  );
}
