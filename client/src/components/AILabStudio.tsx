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
} from "../lib/icons";

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
      labelUz: "Solishtirish",
      labelRu: "Сравнение",
      labelEn: "Compare",
      icon: Swords,
      badge: "VS",
      hintUz: "Ikki model yonma-yon",
      hintRu: "Две модели рядом",
      hintEn: "Two models side by side",
      summaryUz: "Ikki mahsulotning xususiyatlari, narxi va qaysi biri kimga mosroq ekani.",
      summaryRu: "Характеристики, цена и кому какой вариант подойдёт больше.",
      summaryEn: "Specs, price and which one suits whom.",
    },
    {
      id: "oracle" as AILabTab,
      shortcut: "2",
      labelUz: "Narx tarixi",
      labelRu: "История цен",
      labelEn: "Price history",
      icon: Sparkles,
      badge: "AI",
      hintUz: "30 kun va xarid vaqti",
      hintRu: "30 дней и когда покупать",
      hintEn: "30 days and when to buy",
      summaryUz: "30 kunlik narx o'zgarishi, o'rtacha narx va hozir olish kerakmi yoki kutish.",
      summaryRu: "Изменение цены за 30 дней, средняя цена и стоит ли покупать сейчас.",
      summaryEn: "How the price moved over 30 days, the typical price, and whether to buy now or wait.",
    },
    {
      id: "installment" as AILabTab,
      shortcut: "3",
      labelUz: "Muddatli to'lov",
      labelRu: "Рассрочка",
      labelEn: "Installments",
      icon: Wallet,
      badge: "0%",
      hintUz: "3, 6 yoki 12 oy",
      hintRu: "3, 6 или 12 месяцев",
      hintEn: "3, 6 or 12 months",
      summaryUz: "Uzum Nasiya va Texnomart shartlarida oylik to'lovni hisoblang.",
      summaryRu: "Рассчитайте ежемесячный платёж по условиям Uzum Nasiya и Texnomart.",
      summaryEn: "Work out the monthly payment on Uzum Nasiya and Texnomart terms.",
    },
    {
      id: "cultural" as AILabTab,
      shortcut: "4",
      labelUz: "Sovg'a odobi",
      labelRu: "Этикет",
      labelEn: "Etiquette",
      icon: BookOpen,
      badge: "UZ",
      hintUz: "Urf-odat va tilaklar",
      hintRu: "Традиции и пожелания",
      hintEn: "Customs and wishes",
      summaryUz: "To'y va mehmondorchilikda nima sovg'a qilinadi, nimadan qochiladi va qanday tilak aytiladi.",
      summaryRu: "Что дарят на свадьбу и в гости, чего избегать и какие пожелания говорить.",
      summaryEn: "What to bring to weddings and visits, what to avoid, and what to say.",
    },
    {
      id: "logistics" as AILabTab,
      shortcut: "5",
      labelUz: "Yetkazish",
      labelRu: "Доставка",
      labelEn: "Delivery",
      icon: Truck,
      badge: "GPS",
      hintUz: "Punktlar va muddatlar",
      hintRu: "Пункты и сроки",
      hintEn: "Pickup points and times",
      summaryUz: "14 hudud bo'yicha topshirish punktlari, do'konlar va yetkazish muddatlari.",
      summaryRu: "Пункты выдачи, магазины и сроки доставки по 14 регионам.",
      summaryEn: "Pickup points, stores and delivery times across all 14 regions.",
    },
  ];

  const currentTabObj = tabs.find((t) => t.id === activeTab) || tabs[0];

  return (
    <section id="ai-lab-studio" className="reveal max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
      {/* ─── LAB HEADER CONTAINER ─────────────────────────── */}
      <div className="surface-card rounded-3xl p-6 sm:p-8 text-slate-900 dark:text-white relative overflow-hidden mb-6">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
          <div className="max-w-2xl">
            <span className="eyebrow mb-3">{language === "uz" ? "Hisob-kitob" : language === "ru" ? "Расчёты" : "Workbench"}</span>
            <h2 className="font-display font-semibold text-[1.75rem] leading-tight sm:text-4xl tracking-[-0.035em] text-slate-900 dark:text-white">
              {language === "uz" ? <>Kalkulyatorlar va <span className="text-gold-gradient">qo'llanmalar</span></> : language === "ru" ? <>Калькуляторы и <span className="text-gold-gradient">справочники</span></> : <>Calculators <span className="text-gold-gradient">and guides</span></>}
            </h2>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              {language === "uz"
                ? "Ikki mahsulotni solishtiring, narx tarixini ko'ring, muddatli to'lovni hisoblang yoki yetkazish muddatini bilib oling."
                : language === "ru"
                ? "Сравните два товара, посмотрите историю цен, рассчитайте рассрочку или узнайте сроки доставки."
                : "Compare two products, look at price history, work out installments or check delivery times."}
            </p>
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
                className={`p-3.5 rounded-xl text-left transition cursor-pointer border flex flex-col justify-between group ${
                  isActive
                    ? "bg-slate-900 border-slate-900 dark:bg-white dark:border-white"
                    : "bg-white dark:bg-white/5 border-[var(--line)] hover:border-[var(--line-strong)]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isActive ? "bg-white/10 text-amber-400 dark:bg-slate-100 dark:text-slate-900" : "bg-[#f4f5f8] dark:bg-white/5 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div>
                  <h4
                    className={`font-semibold text-sm leading-snug line-clamp-1 ${
                      isActive ? "text-white dark:text-slate-900" : "text-slate-900 dark:text-slate-200"
                    }`}
                  >
                    {label}
                  </h4>
                  <p className={`text-xs line-clamp-1 mt-0.5 ${isActive ? "text-slate-300 dark:text-slate-600" : "text-slate-500"}`}>{hint}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* ─── ACTIVE TOOL DESCRIPTOR STRIP ─────────────────── */}
        <div className="mt-5 pt-4 border-t border-[var(--line)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-amber-950 dark:text-white">
              {language === "uz" ? currentTabObj.labelUz : language === "ru" ? currentTabObj.labelRu : currentTabObj.labelEn}:
            </span>
            <span className="text-slate-600 dark:text-slate-400">
              {language === "uz" ? currentTabObj.summaryUz : language === "ru" ? currentTabObj.summaryRu : currentTabObj.summaryEn}
            </span>
          </div>

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
