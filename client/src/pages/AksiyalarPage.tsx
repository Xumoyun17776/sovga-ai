import PromoCodesHub from "../components/PromoCodesHub";
import { Sparkles, Gift, Tag, Flame } from "../lib/icons";
import { useTranslation } from "../lib/i18n";

export default function AksiyalarPage() {
  const { language } = useTranslation();

  return (
    <div className="min-h-screen animate-fade-in py-10 relative overflow-hidden">
      {/* Artisanal Ambient Vignette & Warm Gold Lighting */}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          {/* Imperial Crest Badge */}
          <h1 className="lux-title text-[2.4rem] sm:text-[3.2rem] text-slate-900 dark:text-white leading-[1.05]">
            {language === "uz" ? "Promokodlar" : language === "ru" ? "Промокоды" : "Promo codes"}
          </h1>

          <p className="text-base text-slate-500 dark:text-slate-400 mt-3 max-w-2xl mx-auto leading-relaxed">
            {language === "uz" ? "Uzum Market, Texnomart, MediaPark va boshqa do'konlarning amaldagi promokodlari. Haftada bir marta barabanni aylantirib qo'shimcha chegirma yutishingiz ham mumkin." : language === "ru" ? "Действующие промокоды Uzum Market, Texnomart, MediaPark и других магазинов. Раз в неделю можно крутить колесо и выиграть дополнительную скидку." : "Current promo codes from Uzum Market, Texnomart, MediaPark and other stores. Once a week you can also spin the wheel for an extra discount."}
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
