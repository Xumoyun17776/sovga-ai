import { useState, useEffect } from "react";
import { useTranslation } from "../lib/i18n";
import { cyberSound } from "../lib/cyberSound";
import NeuralDuelSimulator from "./NeuralDuelSimulator";
import AIPriceOracle from "./AIPriceOracle";
import LuxuryInstallmentSimulator from "./LuxuryInstallmentSimulator";
import LuxuryCulturalAdvisor from "./LuxuryCulturalAdvisor";
import LiveStoreRadar from "./LiveStoreRadar";
import TashkentHubRadar from "./TashkentHubRadar";
import {
  Swords,
  Sparkles,
  Wallet,
  BookOpen,
  Truck,
  Activity,
  Layers,
  Cpu,
  ShieldCheck,
  Zap,
  ArrowUpRight,
} from "lucide-react";

export type AILabTab = "duel" | "oracle" | "installment" | "cultural" | "logistics";

interface AILabStudioProps {
  currentTab?: AILabTab;
  onTabChange?: (tab: AILabTab) => void;
}

export default function AILabStudio({ currentTab, onTabChange }: AILabStudioProps) {
  const { language } = useTranslation();
  const [internalTab, setInternalTab] = useState<AILabTab>("duel");

  const activeTab = currentTab || internalTab;

  const handleTabClick = (tab: AILabTab) => {
    cyberSound.playClick();
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalTab(tab);
    }
  };

  const tabs = [
    {
      id: "duel" as AILabTab,
      shortcut: "1",
      labelUz: "AI Duel Qiyoslagich",
      labelRu: "AI Дуэль Сравнение",
      labelEn: "Neural Spec Duel",
      icon: Swords,
      badge: "VS",
      hintUz: "2 modelni boshma-bosh solishtirish",
      hintRu: "Очное сравнение моделей",
      hintEn: "Head-to-head comparison",
      summaryUz: "Ikkita raqobatchi mahsulot xususiyatlari, obro' balli va xolis AI g'oliblik xulosasi.",
      summaryRu: "Сравнение спецификаций, надежности и итоговый вердикт победителя от AI.",
      summaryEn: "Deep specification analysis, reliability scores, and definitive AI winner verdict.",
    },
    {
      id: "oracle" as AILabTab,
      shortcut: "2",
      labelUz: "Narx Bashoratchisi (Oracle)",
      labelRu: "Оракул Цен (Oracle)",
      labelEn: "Market Price Oracle",
      icon: Sparkles,
      badge: "AI",
      hintUz: "30 kunlik narx va qachon olish maslahati",
      hintRu: "30-дневный прогноз цен",
      hintEn: "30-day price trends & drops",
      summaryUz: "30 kunlik narx grafigi, bozor medianasi va qachon xarid qilish maqbulligi bashorati.",
      summaryRu: "30-дневная динамика, рыночная медиана и рекомендация оптимального времени покупки.",
      summaryEn: "30-day verified historical curve, median value, and optimal purchase timing advice.",
    },
    {
      id: "installment" as AILabTab,
      shortcut: "3",
      labelUz: "Nasiya & To'lov Simulyatori",
      labelRu: "Калькулятор Рассрочки",
      labelEn: "Installment Simulator",
      icon: Wallet,
      badge: "0%",
      hintUz: "Texnomart va Uzum Nasiya 0-0-12",
      hintRu: "Рассрочка без переплат",
      hintEn: "0-0-12 Halal installments",
      summaryUz: "Uzum Nasiya va Texnomart bo'yicha 3, 6 va 12 oylik muddatli to'lovlar shaffof hisoblagichi.",
      summaryRu: "Прозрачный калькулятор рассрочки на 3, 6 и 12 месяцев без скрытых надбавок.",
      summaryEn: "Transparent 3, 6, and 12-month installment payment schedule comparison.",
    },
    {
      id: "cultural" as AILabTab,
      shortcut: "4",
      labelUz: "Milliy Urf-odat & Odob AI",
      labelRu: "Этикет & Традиции AI",
      labelEn: "Cultural Etiquette AI",
      icon: BookOpen,
      badge: "UZ",
      hintUz: "Kelin salom, qudalar va duolar",
      hintRu: "Традиции, сватья и дуа",
      hintEn: "Traditions & national etiquette",
      summaryUz: "O'zbekona to'y va mehmondorchilik odoblari, taboolar hamda samimiy tilaklar.",
      summaryRu: "Национальные обычаи для свадеб и сватов, табу и формулы традиционных благословений.",
      summaryEn: "Traditional Uzbek celebration etiquette, gift taboos, and heartfelt prayers.",
    },
    {
      id: "logistics" as AILabTab,
      shortcut: "5",
      labelUz: "14 Viloyat & Do'konlar Radari",
      labelRu: "Радар Магазинов & PVZ",
      labelEn: "Stores & Logistics Radar",
      icon: Truck,
      badge: "GPS",
      hintUz: "Uzum PVZ, Texnomart va ekspress yetkazish",
      hintRu: "ПВЗ Uzum, Texnomart и доставка",
      hintEn: "Live store transit & pickup nodes",
      summaryUz: "O'zbekistonning 14 viloyati bo'yicha Uzum PVZ tarmoqlari, do'konlar va yetkazish vaqtlari.",
      summaryRu: "География пунктов выдачи Uzum, розничные сети и транзитные сроки по 14 регионам.",
      summaryEn: "Ground transit timeline, Uzum pickup nodes, and Texnomart store directory across 14 regions.",
    },
  ];

  const currentTabObj = tabs.find((t) => t.id === activeTab) || tabs[0];

  return (
    <section id="ai-lab-studio" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
      {/* ─── LAB HEADER CONTAINER ─────────────────────────── */}
      <div className="bg-gradient-to-br from-white via-[#fcfaf5] to-[#f6f0e2] dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 rounded-3xl p-6 sm:p-8 text-slate-900 dark:text-white border-2 border-amber-300/80 dark:border-slate-800 shadow-luxury relative overflow-hidden mb-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/20 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-amber-500/10 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* ─── LIVE TELEMETRY STRIP ─────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-6 border-b border-amber-200/80 dark:border-slate-800/80 text-[11px] font-mono text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">NEURAL ENGINE ACTIVE</span>
            <span className="text-amber-300 dark:text-slate-600">|</span>
            <span className="text-slate-700 dark:text-slate-300">GEMINI 3.8 FLASH GROUNDED</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 bg-white/80 dark:bg-slate-900 px-2.5 py-1 rounded-full border border-amber-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-2xs">
              <Cpu className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>LATENCY: ~22ms</span>
            </span>
            <span className="flex items-center gap-1.5 bg-white/80 dark:bg-slate-900 px-2.5 py-1 rounded-full border border-amber-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>UZUM · TEXNOMART · MEDIAPARK</span>
            </span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/90 dark:bg-amber-500/10 border border-amber-300/80 dark:border-amber-500/30 text-amber-900 dark:text-amber-400 text-xs font-mono font-bold tracking-wider uppercase mb-2 shadow-2xs">
              <Activity className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-pulse" />
              <span>
                {language === "uz"
                  ? "JONLI AI SINOV LABORATORIYASI"
                  : language === "ru"
                  ? "ЖИВАЯ ЛАБОРАТОРИЯ AI"
                  : "LIVE INTERACTIVE AI LAB"}
              </span>
              <span className="text-amber-400 dark:text-slate-600">•</span>
              <span className="text-amber-950 dark:text-slate-300 font-normal">
                {language === "uz"
                  ? "5 TA INTERAKTIV WIDGET"
                  : language === "ru"
                  ? "5 ИНТЕРАКТИВНЫХ ВИДЖЕТОВ"
                  : "5 INTERACTIVE WIDGETS"}
              </span>
            </div>

            <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">
              {language === "uz" ? (
                <>
                  Interaktiv Simulyatorlar & <span className="gold-gradient-text">Jonli AI Sinovlari</span>
                </>
              ) : language === "ru" ? (
                <>
                  Интерактивные Симуляторы & <span className="gold-gradient-text">Живые AI Инструменты</span>
                </>
              ) : (
                <>
                  Interactive Simulators & <span className="gold-gradient-text">Live AI Testbench</span>
                </>
              )}
            </h2>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-400 max-w-2xl mt-1.5 font-normal leading-relaxed">
              {language === "uz"
                ? "Bitta qulay boshqaruv panelida: mahsulotlarni boshma-bosh to'qnashtiring, 30 kunlik narx grafigini ko'ring yoki nasiya to'lovlarini hisoblang."
                : language === "ru"
                ? "В едином удобном интерфейсе: дуэль товаров, оракул 30-дневных цен, калькулятор рассрочки и логистика по Узбекистану."
                : "Switch effortlessly between live duel comparisons, price oracle predictions, installment calculators, and logistics radars."}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-700 dark:text-slate-400 bg-white/80 dark:bg-slate-900/90 px-3.5 py-2 rounded-2xl border border-amber-200/80 dark:border-slate-800 self-start md:self-auto shadow-2xs">
            <Layers className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>
              {language === "uz" ? "Rejimni tanlang:" : language === "ru" ? "Режим:" : "Select Mode:"}
            </span>
          </div>
        </div>

        {/* ─── INTERACTIVE TAB SWITCHER BAR ─────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 relative z-10">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            const label = language === "uz" ? tab.labelUz : language === "ru" ? tab.labelRu : tab.labelEn;
            const hint = language === "uz" ? tab.hintUz : language === "ru" ? tab.hintRu : tab.hintEn;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`p-3.5 rounded-2xl text-left transition-all duration-200 cursor-pointer border flex flex-col justify-between group ${
                  isActive
                    ? "bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white border-amber-400 shadow-lg scale-102"
                    : "bg-white/90 dark:bg-slate-900/60 hover:bg-amber-50/80 dark:hover:bg-slate-900 border-amber-200/80 dark:border-slate-800 hover:border-amber-400 dark:hover:border-slate-700 text-slate-700 dark:text-slate-400 hover:text-amber-950 dark:hover:text-slate-200 shadow-2xs"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                      isActive
                        ? "bg-white text-amber-700 font-bold shadow-xs"
                        : "bg-amber-100/70 dark:bg-slate-800 text-amber-800 dark:text-slate-400 group-hover:text-amber-600"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md ${
                        isActive
                          ? "bg-white/20 text-white border border-white/30"
                          : "bg-amber-100/70 dark:bg-slate-800 text-amber-900 dark:text-slate-500"
                      }`}
                    >
                      {tab.badge}
                    </span>
                  </div>
                </div>

                <div>
                  <h4
                    className={`font-bold text-xs leading-snug transition-colors line-clamp-1 ${
                      isActive ? "text-white font-extrabold" : "text-slate-900 dark:text-slate-300 group-hover:text-amber-900 dark:group-hover:text-white"
                    }`}
                  >
                    {label}
                  </h4>
                  <p className={`text-[10px] line-clamp-1 mt-0.5 ${isActive ? "text-amber-100" : "text-slate-500"}`}>{hint}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* ─── ACTIVE TOOL DESCRIPTOR STRIP ─────────────────── */}
        <div className="mt-5 pt-4 border-t border-amber-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <span className="font-semibold text-amber-950 dark:text-white">
              {language === "uz" ? currentTabObj.labelUz : language === "ru" ? currentTabObj.labelRu : currentTabObj.labelEn}:
            </span>
            <span className="text-slate-600 dark:text-slate-400">
              {language === "uz" ? currentTabObj.summaryUz : language === "ru" ? currentTabObj.summaryRu : currentTabObj.summaryEn}
            </span>
          </div>

          <span className="text-[10px] font-mono text-slate-500">
            {language === "uz" ? "Jonli hisob-kitoblar faol" : language === "ru" ? "Живые расчеты активны" : "Real-time calculation active"}
          </span>
        </div>
      </div>

      {/* ─── ACTIVE TOOL CONTAINER ─────────────────────────── */}
      <div className="transition-all duration-300 animate-fade-in">
        {activeTab === "duel" && (
          <div className="space-y-4">
            <NeuralDuelSimulator />
          </div>
        )}

        {activeTab === "oracle" && (
          <div className="space-y-4">
            <AIPriceOracle />
          </div>
        )}

        {activeTab === "installment" && (
          <div className="space-y-4">
            <LuxuryInstallmentSimulator />
          </div>
        )}

        {activeTab === "cultural" && (
          <div className="space-y-4">
            <LuxuryCulturalAdvisor />
          </div>
        )}

        {activeTab === "logistics" && (
          <div className="space-y-8">
            <LiveStoreRadar />
            <TashkentHubRadar />
          </div>
        )}
      </div>
    </section>
  );
}
