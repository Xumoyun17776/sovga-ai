import { Link } from "wouter";
import {
  Gift,
  Flame,
  Swords,
  Box,
  ShoppingBag,
  Heart,
  PenTool,
  ShieldAlert,
  SlidersHorizontal,
  PackageCheck,
  Calendar,
  Sparkles,
  ArrowRight,
  Fingerprint,
  Zap,
  Clock,
} from "lucide-react";
import { cyberSound } from "../lib/cyberSound";
import { useTranslation } from "../lib/i18n";

interface Props {
  onOpenAllServices: () => void;
  onOpenGiftDetective?: () => void;
}

export default function HeroFeatureLaunchpad({ onOpenAllServices, onOpenGiftDetective }: Props) {
  const { language } = useTranslation();

  const heroFeatures = [
    {
      titleUz: "AI Sovg'a Topuvchi",
      titleRu: "AI Подбор Подарка",
      titleEn: "Gift Finder AI",
      badgeUz: "AI Sehrgar",
      badgeRu: "AI Мастер",
      badgeEn: "AI Wizard",
      href: "/gift-finder",
      icon: Gift,
      iconBoxClass: "icon-box-gold icon-glow-amber",
    },
    {
      titleUz: "Omad Barabani",
      titleRu: "Колесо Удачи",
      titleEn: "Lucky Wheel",
      badgeUz: "-70k Promokod",
      badgeRu: "-70к Промокод",
      badgeEn: "-70k Promo",
      href: "/aksiyalar",
      icon: Flame,
      iconBoxClass: "icon-box-rose icon-glow-rose",
    },
    {
      titleUz: "Kiber Duel & Qiyoslagich",
      titleRu: "AI Дуэль Сравнение",
      titleEn: "Spec Duel",
      badgeUz: "2 Mahsulot",
      badgeRu: "2 Товара",
      badgeEn: "2 Products",
      href: "/compare-duel",
      icon: Swords,
      iconBoxClass: "icon-box-cyan icon-glow-cyan",
    },
    {
      titleUz: "Syurpriz Quti",
      titleRu: "Mystery Box 3D",
      titleEn: "Mystery Box",
      badgeUz: "3D Ochish",
      badgeRu: "3D Анбоксинг",
      badgeEn: "3D Unbox",
      href: "/mystery-box",
      icon: Box,
      iconBoxClass: "icon-box-purple icon-glow-purple",
    },
    {
      titleUz: "10k+ Narxlar Katalogi",
      titleRu: "Каталог 10 000+",
      titleEn: "Live Catalog",
      badgeUz: "Jonli Narxlar",
      badgeRu: "Живые Цены",
      badgeEn: "Live Prices",
      href: "/catalog",
      icon: ShoppingBag,
      iconBoxClass: "icon-box-indigo icon-glow-indigo",
    },
    {
      titleUz: "To'y & Istaklar Ro'yxati",
      titleRu: "Свадебный Реестр",
      titleEn: "Wedding Registry",
      badgeUz: "Sovg'a Ro'yxati",
      badgeRu: "Реестр",
      badgeEn: "Registry",
      href: "/wedding-registry",
      icon: Heart,
      iconBoxClass: "icon-box-rose icon-glow-rose",
    },
    {
      titleUz: "Kalligrafik Tabriknoma",
      titleRu: "Открытка AI & Голос",
      titleEn: "Voice Calligraphy",
      badgeUz: "🎵 Ney & Ovoz",
      badgeRu: "🎵 Голос & Ней",
      badgeEn: "🎵 Voice & Music",
      href: "/calligraphy-card",
      icon: PenTool,
      iconBoxClass: "icon-box-emerald icon-glow-emerald",
    },
    {
      titleUz: "AI Vaqt Kapsulasi",
      titleRu: "Капсула Времени 2027",
      titleEn: "Time Capsule",
      badgeUz: "Biometrik Qulf",
      badgeRu: "Био-Замок",
      badgeEn: "Bio-Lock",
      href: "/time-capsule",
      icon: Clock,
      iconBoxClass: "icon-box-cyan icon-glow-cyan",
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto my-8 space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <h3 className="font-display font-black text-xs sm:text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider truncate">
            {language === "uz" ? (
              <>
                <span className="sm:hidden">⚡ Tezkor Xizmatlar</span>
                <span className="hidden sm:inline">⚡ Tezkor Xizmatlar & Imkoniyatlar (1-bosishda ochish)</span>
              </>
            ) : language === "ru" ? (
              <>
                <span className="sm:hidden">⚡ Быстрые Сервисы</span>
                <span className="hidden sm:inline">⚡ Быстрый Доступ ко Всем Сервисам</span>
              </>
            ) : (
              <>
                <span className="sm:hidden">⚡ Quick Tools</span>
                <span className="hidden sm:inline">⚡ Instant Feature Launchpad</span>
              </>
            )}
          </h3>
        </div>

        <button
          onClick={() => {
            cyberSound.playConfirm();
            onOpenAllServices();
          }}
          className="flex items-center gap-1 sm:gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 transition cursor-pointer group flex-shrink-0"
        >
          <span className="whitespace-nowrap">
            {language === "uz" ? "Barcha 16 ta" : language === "ru" ? "Все 16" : "All 16"}
            <span className="hidden sm:inline"> {language === "uz" ? "Xizmat" : language === "ru" ? "Сервисов" : "Tools"}</span>
          </span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* ─── VIP HIGHLIGHT: AI GIFT DETECTIVE & PERSONA DNA BANNER ─── */}
      {onOpenGiftDetective && (
        <button
          onClick={() => {
            cyberSound.playConfirm();
            onOpenGiftDetective();
          }}
          className="w-full text-left p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-amber-100/90 via-rose-50/80 to-amber-50/90 dark:from-amber-500/15 dark:via-rose-500/10 dark:to-indigo-500/15 border-2 border-amber-300/80 dark:border-amber-400/30 hover:border-amber-500 shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-between gap-3 group relative overflow-hidden cursor-pointer"
        >
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-2xl icon-medallion icon-box-gold flex items-center justify-center shrink-0">
              <Fingerprint className="w-5 h-5 text-amber-950 dark:text-amber-300 icon-glow-amber animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black text-slate-950 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {language === "uz"
                    ? "🕵️‍♂️ AI Sovg'a Detektivi & Psixologik DNA Scanner"
                    : language === "ru"
                    ? "🕵️‍♂️ AI Детектив Подарков & Психологический ДНК Сканер"
                    : "🕵️‍♂️ AI Gift Detective & Psychological DNA Scanner"}
                </span>
                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-mono shadow-xs">
                  {language === "uz" ? "YANGI AI" : language === "ru" ? "NEW AI" : "NEW AI"}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium line-clamp-1 mt-0.5">
                {language === "uz"
                  ? "Inson ruhiy portreti, dopamin tetiklari va taqiqlangan sovg'alar tahlili bilan 100% nishonga teguvchi sovg'a"
                  : language === "ru"
                  ? "Глубокий анализ характера, триггеров дофамина и анти-подарков с точностью до 100%"
                  : "Psychological archetype scanner, dopamine triggers & forbidden anti-gifts analysis"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-400 flex-shrink-0 relative z-10">
            <span className="hidden sm:inline">{language === "uz" ? "Ochish" : language === "ru" ? "Открыть" : "Open"}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </div>
        </button>
      )}

      {/* Feature Badges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {heroFeatures.map((feat, idx) => {
          const Icon = feat.icon;
          const title = language === "uz" ? feat.titleUz : language === "ru" ? feat.titleRu : feat.titleEn;
          const badge = language === "uz" ? feat.badgeUz : language === "ru" ? feat.badgeRu : feat.badgeEn;

          return (
            <Link
              key={idx}
              href={feat.href}
              onClick={() => cyberSound.playClick()}
              className="group p-3 sm:p-3.5 rounded-2xl bg-gradient-to-b from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-slate-900/90 dark:to-slate-950/90 backdrop-blur-md border border-amber-200/80 dark:border-white/10 hover:border-amber-400 dark:hover:border-amber-400/50 shadow-xs hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-200 flex flex-col justify-between text-left hover:-translate-y-0.5 cursor-pointer relative overflow-hidden"
            >
              <div className="flex items-center justify-between gap-1 mb-2">
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl icon-medallion ${feat.iconBoxClass} flex items-center justify-center shrink-0`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100/70 dark:bg-slate-800 text-amber-950 dark:text-slate-300 border border-amber-200/70 dark:border-slate-700/60 font-mono">
                  {badge}
                </span>
              </div>

              <div>
                <h4 className="font-extrabold text-xs text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
                  {title}
                </h4>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
