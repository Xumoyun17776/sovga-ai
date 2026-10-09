import { Link } from "wouter";
import { useTranslation } from "../lib/i18n";
import { useCurrency } from "../lib/currency";
import {
  Gift,
  Heart,
  Search,
  Star,
  Bell,
  ShieldCheck,
  Send,
  Sparkles,
  MapPin,
  ExternalLink,
  CreditCard,
  ShoppingBag,
  Zap,
} from "lucide-react";
import { cyberSound } from "../lib/cyberSound";

export default function Footer() {
  const { t, language, setLanguage } = useTranslation();
  const { currency, setCurrency, exchangeRate } = useCurrency();

  return (
    <footer className="bg-gradient-to-b from-[#faf6ec] via-[#f5edd7] to-[#ede3c5] dark:from-[#0a0d16] dark:via-[#030712] dark:to-[#02050c] text-slate-700 dark:text-slate-300 border-t-2 border-amber-300/90 dark:border-slate-800/80 pt-16 pb-12 mt-20 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-amber-500/50 dark:via-cyan-500/50 to-transparent pointer-events-none" />
      <div className="absolute -top-32 left-1/4 w-96 h-96 bg-amber-400/20 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10">
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-2xl icon-medallion icon-box-gold flex items-center justify-center shadow-md group-hover:scale-105 transition-all">
                <Gift className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="font-display font-black text-2xl text-slate-900 dark:text-white tracking-tight">
                Sovg'a<span className="text-amber-600 dark:text-amber-400">.ai</span>
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-200/80 dark:bg-amber-500/20 text-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 font-bold shadow-2xs">
                LUXURY UZ
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
              {language === "uz"
                ? "O'zbekistondagi 1-raqamli AI xarid tadqiqotchisi, to'y registri va aqlli sovg'a platformasi. Uzum Market, Texnomart, MediaPark va Asaxiy narxlarini jonli tahlil qiladi."
                : language === "ru"
                ? "Ведущий AI-консьерж покупок, свадебные списки и мониторинг цен в Узбекистане. Прямая интеграция с Uzum, Texnomart, MediaPark и Asaxiy."
                : "Uzbekistan's premier AI shopping intelligence, wedding registry & live price arbitrage platform. Real-time market telemetry across Uzum, Texnomart, MediaPark & Asaxiy with 100% verified authentic warranty."}
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 pt-1">
              <MapPin className="w-4 h-4 text-amber-600 dark:text-cyan-400 flex-shrink-0 stroke-[2.2]" />
              <span>Amir Temur Avenue, Tashkent, Uzbekistan</span>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <a
                href="https://t.me"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/80 dark:bg-slate-900 hover:bg-amber-100/80 dark:hover:bg-slate-800 text-amber-950 dark:text-cyan-300 hover:text-amber-950 dark:hover:text-white border border-amber-200/80 dark:border-slate-700/80 text-xs font-mono font-bold transition shadow-2xs active:scale-95"
              >
                <Send className="w-3.5 h-3.5 text-amber-600 dark:text-cyan-400 stroke-[2.2]" />
                <span>@sovga_ai_bot (Telegram Bot)</span>
              </a>
            </div>
          </div>

          {/* Col 2: Services Part 1 */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>{language === "uz" ? "Asosiy Xizmatlar" : language === "ru" ? "Основные Сервисы" : "Core Platform"}</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/catalog" className="hover:text-amber-700 dark:hover:text-amber-300 transition flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-amber-600 dark:text-slate-500" />
                  <span>{language === "uz" ? "Narxlar Katalogi" : language === "ru" ? "Каталог Цен" : "Deals & Catalog"}</span>
                </Link>
              </li>
              <li>
                <Link href="/gift-finder" className="hover:text-amber-700 dark:hover:text-amber-300 transition flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-amber-600 dark:text-slate-500" />
                  <span>{language === "uz" ? "AI Sovg'a Topuvchi" : language === "ru" ? "AI Подбор Подарка" : "AI Gift Concierge"}</span>
                </Link>
              </li>
              <li>
                <Link href="/wedding" className="hover:text-rose-600 dark:hover:text-rose-400 transition flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  <span>{language === "uz" ? "To'y Registri" : language === "ru" ? "Свадебный Реестр" : "Wedding Registry"}</span>
                </Link>
              </li>
              <li>
                <Link href="/wishlists" className="hover:text-amber-700 dark:hover:text-amber-300 transition flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-500" />
                  <span>{language === "uz" ? "Istaklar Ro'yxati" : language === "ru" ? "Список Желаний" : "Wishlists"}</span>
                </Link>
              </li>
              <li>
                <Link href="/group-gifting" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                  <span>{language === "uz" ? "Guruhli Sovg'a" : language === "ru" ? "Групповой Сбор" : "Group Gifting (Split)"}</span>
                </Link>
              </li>
              <li>
                <Link href="/reminders" className="hover:text-blue-600 dark:hover:text-blue-400 transition flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-blue-500" />
                  <span>{language === "uz" ? "Narx Kuzatuvi" : language === "ru" ? "Радар Снижения Цен" : "Price Drop Radar"}</span>
                </Link>
              </li>
              <li>
                <Link href="/analytics" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                  <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{language === "uz" ? "Jonli Tashriflar Analitikasi" : language === "ru" ? "Аналитика Посещений" : "Live Visitor Analytics"}</span>
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-amber-700 dark:hover:text-amber-300 transition flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>{language === "uz" ? "Admin Boshqaruv Paneli" : language === "ru" ? "Панель Администратора" : "Admin Dashboard"}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Luxury Studios & Tools */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-cyan-400" />
              <span>{language === "uz" ? "Eksklyuziv Studiyalar" : language === "ru" ? "Эксклюзивные Студии" : "AI Innovation Labs"}</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/mystery-box" className="hover:text-amber-700 dark:hover:text-amber-300 transition flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  <span>{language === "uz" ? "Mystery Box (Syurpriz)" : language === "ru" ? "Mystery Box Анбоксинг" : "Mystery Box Unboxing"}</span>
                </Link>
              </li>
              <li>
                <Link href="/packaging-studio" className="hover:text-rose-600 dark:hover:text-rose-400 transition flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  <span>{language === "uz" ? "3D Qadoqlash Studiyasi" : language === "ru" ? "3D Студия Упаковки" : "Packaging Studio"}</span>
                </Link>
              </li>
              <li>
                <Link href="/price-audit" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                  <span>{language === "uz" ? "AI Narx Auditi" : language === "ru" ? "AI Аудит Цен" : "AI Fake-Discount Audit"}</span>
                </Link>
              </li>
              <li>
                <Link href="/compare-duel" className="hover:text-purple-600 dark:hover:text-purple-400 transition flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                  <span>{language === "uz" ? "Mahsulotlar Duellari" : language === "ru" ? "Дуэль Товаров" : "Neural Duel Comparator"}</span>
                </Link>
              </li>
              <li>
                <Link href="/cultural-etiquette" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>{language === "uz" ? "O'zbek Sovg'a Odobi" : language === "ru" ? "Этикет Подарков" : "Cultural Etiquette Guide"}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Trust & Guarantees */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{language === "uz" ? "Ishonch Telemetriyasi" : language === "ru" ? "Гарантии и Надежность" : "Enterprise Trust"}</span>
            </h4>
            <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
              <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-2xl border border-amber-200/80 dark:border-slate-800 shadow-2xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{language === "uz" ? "100% Jonli Narxlar" : language === "ru" ? "100% Реальные Цены" : "100% Real Live Prices"}</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
                  {language === "uz"
                    ? "Soxta aksiyalar yoki eskirgan havolalar yo'q"
                    : language === "ru"
                    ? "Без фиктивных скидок и неработающих ссылок"
                    : "No fake promotions or dead external links"}
                </p>
              </div>

              <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-2xl border border-amber-200/80 dark:border-slate-800 shadow-2xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                  <CreditCard className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span>{language === "uz" ? "Ilova Ichida Yetkazish" : language === "ru" ? "Доставка Внутри Сервиса" : "Direct In-App Delivery"}</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
                  {language === "uz"
                    ? "Naqd, Click, Payme va Uzum Nasiya orqali"
                    : language === "ru"
                    ? "Наличными, Click, Payme и Uzum Nasiya"
                    : "Cash on delivery, Click, Payme & Uzum Nasiya"}
                </p>
              </div>

              <div className="text-[11px] text-amber-900 dark:text-amber-300 font-mono font-bold">
                {language === "uz" ? "MB Kursi" : language === "ru" ? "Курс ЦБ" : "CBU Rate"}: $1 = {exchangeRate.toLocaleString()} UZS
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright & settings bar */}
        <div className="pt-8 border-t border-amber-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-500 font-mono">
          <p>
            {language === "uz"
              ? "© 2026 Sovg'a AI. O'zbekiston bo'ylab barcha huquqlar himoyalangan."
              : language === "ru"
              ? "© 2026 Sovg'a AI. Все права защищены по всему Узбекистану."
              : "© 2026 Sovg'a AI. All rights reserved across Uzbekistan."}
          </p>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-amber-100/80 dark:bg-slate-900 p-1 rounded-xl border border-amber-200/80 dark:border-slate-800 shadow-2xs">
              {(["en", "uz", "ru"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    cyberSound.playClick();
                    setLanguage(lang);
                  }}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-bold uppercase transition cursor-pointer ${
                    language === lang
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs"
                      : "text-amber-950/80 dark:text-slate-400 hover:text-amber-950 dark:hover:text-white"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-amber-100/80 dark:bg-slate-900 p-1 rounded-xl border border-amber-200/80 dark:border-slate-800 shadow-2xs">
              {(["UZS", "USD"] as const).map((curr) => (
                <button
                  key={curr}
                  onClick={() => {
                    cyberSound.playClick();
                    setCurrency(curr);
                  }}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                    currency === curr
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs"
                      : "text-amber-950/80 dark:text-slate-400 hover:text-amber-950 dark:hover:text-white"
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
