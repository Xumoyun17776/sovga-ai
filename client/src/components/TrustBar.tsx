import { ShieldCheck, Truck, CreditCard, Award, ArrowUpRight, ShoppingBag, Store, BookOpen, Cpu, Smartphone, Tag, Sparkles, Scale, CheckCircle2 } from "lucide-react";
import { useCurrency } from "../lib/currency";
import { useTranslation } from "../lib/i18n";
import { cyberSound } from "../lib/cyberSound";

const partnerStores = [
  { name: "Uzum Market", tagEn: "1-day delivery", tagRu: "Доставка за 1 день", tagUz: "1 kunda yetkazish", icon: ShoppingBag, dot: "bg-purple-500", color: "bg-purple-50/70 dark:bg-purple-950/40 border-purple-200/80 dark:border-purple-800/60 text-purple-950 dark:text-purple-300 hover:bg-purple-100/70 dark:hover:bg-purple-900/50", url: "https://uzum.uz" },
  { name: "Yandex Market", tagEn: "Express shipping", tagRu: "Экспресс-доставка", tagUz: "Tezkor yetkazuv", icon: Store, dot: "bg-rose-500", color: "bg-rose-50/70 dark:bg-rose-950/40 border-rose-200/80 dark:border-rose-800/60 text-rose-950 dark:text-rose-300 hover:bg-rose-100/70 dark:hover:bg-rose-900/50", url: "https://market.yandex.uz" },
  { name: "Asaxiy.uz", tagEn: "Books & Tech", tagRu: "Книги & Техника", tagUz: "Kitob & Texnika", icon: BookOpen, dot: "bg-sky-500", color: "bg-sky-50/70 dark:bg-sky-950/40 border-sky-200/80 dark:border-sky-800/60 text-sky-950 dark:text-sky-300 hover:bg-sky-100/70 dark:hover:bg-sky-900/50", url: "https://asaxiy.uz" },
  { name: "Texnomart", tagEn: "Official Warranty", tagRu: "0% Рассрочка & Гарантия", tagUz: "0% Nasiya & Kafolat", icon: Cpu, dot: "bg-red-500", color: "bg-red-50/70 dark:bg-red-950/40 border-red-200/80 dark:border-red-800/60 text-red-950 dark:text-red-300 hover:bg-red-100/70 dark:hover:bg-red-900/50", url: "https://texnomart.uz" },
  { name: "Olcha.uz", tagEn: "Smartphones & Tech", tagRu: "Смартфоны & Гаджеты", tagUz: "Smartfonlar & Gadjetlar", icon: Smartphone, dot: "bg-rose-500", color: "bg-rose-50/70 dark:bg-rose-950/40 border-rose-200/80 dark:border-rose-800/60 text-rose-950 dark:text-rose-300 hover:bg-rose-100/70 dark:hover:bg-rose-900/50", url: "https://olcha.uz" },
];

export default function TrustBar() {
  const { exchangeRate } = useCurrency();
  const { language } = useTranslation();

  return (
    <div className="space-y-4 my-6">
      {/* Trust Badges Bar */}
      <div className="border-y border-amber-200/80 dark:border-slate-800 bg-[#fffdf9]/95 dark:bg-[#0c0e17]/90 backdrop-blur-md py-5 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 items-center">
            {/* Trust 1: CBU & Real Prices */}
            <div className="flex items-center gap-3.5 group">
              <div className="w-11 h-11 rounded-2xl icon-medallion icon-box-gold flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5 icon-glow-amber" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                  {language === "uz" ? "100% Asl Narxlar" : language === "ru" ? "100% Реальные цены" : "100% Verified Prices"}
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  {language === "uz"
                    ? `MB kursi: $1 = ${exchangeRate.toLocaleString()} UZS`
                    : language === "ru"
                    ? `Курс ЦБ: $1 = ${exchangeRate.toLocaleString()} UZS`
                    : `CBU Rate: $1 = ${exchangeRate.toLocaleString()} UZS`}
                </p>
              </div>
            </div>

            {/* Trust 2: Fast Delivery */}
            <div className="flex items-center gap-3.5 group">
              <div className="w-11 h-11 rounded-2xl icon-medallion icon-box-emerald flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5 icon-glow-emerald" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                  {language === "uz" ? "1 Kunda Yetkazish" : language === "ru" ? "Доставка за 1 день" : "1-Day Fast Delivery"}
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  {language === "uz" ? "Uzum Market & Toshkent ekspress" : language === "ru" ? "Uzum Market & Экспресс Ташкент" : "Uzum Market & Tashkent express"}
                </p>
              </div>
            </div>

            {/* Trust 3: Halol Nasiya */}
            <div className="flex items-center gap-3.5 group">
              <div className="w-11 h-11 rounded-2xl icon-medallion icon-box-indigo flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-5 h-5 icon-glow-indigo" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                  {language === "uz" ? "Halol Muddatli To'lov" : language === "ru" ? "Рассрочка 0%" : "0% Interest Installments"}
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  {language === "uz" ? "Uzum Nasiya, Alif va Anorbank" : language === "ru" ? "Uzum Nasiya, Alif и Anorbank" : "Uzum Nasiya, Alif & Anorbank"}
                </p>
              </div>
            </div>

            {/* Trust 4: Verified Stores */}
            <div className="flex items-center gap-3.5 group">
              <div className="w-11 h-11 rounded-2xl icon-medallion icon-box-purple flex items-center justify-center flex-shrink-0">
                <Award className="w-5 h-5 icon-glow-purple" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                  {language === "uz" ? "Rasmiy Hamkorlar" : language === "ru" ? "Официальные партнеры" : "Official Retail Partners"}
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">Texnomart, MediaPark, Asaxiy</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Connected Uzbekistan Marketplaces Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
        <div className="p-5 rounded-3xl bg-gradient-to-b from-white via-[#fcfaf5] to-[#f8f3e5] dark:from-[#10121d] dark:to-[#080a11] border-2 border-amber-200/80 dark:border-slate-800 shadow-luxury">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {language === "uz"
                  ? "Ulangan O'zbekiston Online Do'konlari"
                  : language === "ru"
                  ? "Подключенные Онлайн-Магазины Узбекистана"
                  : "Connected Uzbekistan Online Marketplaces"}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {language === "uz"
                ? "Barcha do'konlarga to'g'ridan-to'g'ri integratsiya"
                : language === "ru"
                ? "Прямая интеграция со всеми ритейлерами"
                : "Direct live integration with all verified retailers"}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {partnerStores.map((store, idx) => {
              const tag = language === "uz" ? store.tagUz : language === "ru" ? store.tagRu : store.tagEn;
              return (
                <a
                  key={idx}
                  href={store.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => cyberSound.playClick()}
                  className={`p-2.5 rounded-xl border transition-all hover:scale-102 hover:shadow-xs group flex items-center justify-between ${store.color}`}
                >
                  <div className="truncate">
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <span className={`w-2 h-2 rounded-full ${store.dot}`}></span>
                      <span className="truncate">{store.name}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium truncate">{tag}</p>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-1" />
                </a>
              );
            })}
          </div>
        </div>

        {/* ── UNBIASED CONSUMER ADVOCATE BADGE ── */}
        <div className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-amber-100/90 via-[#fffdf9] to-amber-50 dark:from-amber-950/40 dark:via-slate-900/50 dark:to-indigo-950/30 border-2 border-amber-300/80 dark:border-amber-500/30 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl icon-medallion icon-box-gold flex items-center justify-center flex-shrink-0">
              <Scale className="w-4 h-4 icon-glow-amber" />
            </div>
            <span className="font-extrabold text-amber-950 dark:text-slate-100">
              {language === "uz" ? "Nega Sovg'a AI?" : language === "ru" ? "Почему Sovg'a AI?" : "Why Sovg'a AI?"}
            </span>
            <span className="text-amber-400 dark:text-slate-500 hidden md:inline">·</span>
            <span className="text-slate-700 dark:text-slate-300 hidden md:inline font-medium">
              {language === "uz"
                ? "Do'konlar faqat o'z tovarini maqtaydi — Sovg'a AI esa 18+ do'kondan eng arzon va 100% originalini siz uchun mustaqil taqqoslaydi."
                : language === "ru"
                ? "Маркетплейсы хвалят только свои товары — Sovg'a AI беспристрастно находит минимальные цены среди 18+ магазинов."
                : "Single marketplaces only promote their own items — Sovg'a AI is Uzbekistan's independent shopping intelligence auditor."}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-bold text-amber-800 dark:text-amber-400 flex-shrink-0">
            <span className="flex items-center gap-1 bg-white/80 dark:bg-white/5 px-2.5 py-0.5 rounded-md border border-amber-200/80 dark:border-white/10 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              {language === "uz" ? "Soxta aksiyalarsiz" : language === "ru" ? "Без фейковых скидок" : "Zero Fake Markups"}
            </span>
            <span className="flex items-center gap-1 bg-white/80 dark:bg-white/5 px-2.5 py-0.5 rounded-md border border-amber-200/80 dark:border-white/10 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              {language === "uz" ? "0% Nasiya" : language === "ru" ? "0% Рассрочка" : "0% Installments"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
