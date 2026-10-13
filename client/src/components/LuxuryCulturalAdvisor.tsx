import { useState } from "react";
import { BookOpen, Heart, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Quote } from "../lib/icons";
import { Link } from "wouter";
import { useTranslation } from "../lib/i18n";

interface ProtocolCategory {
  id: string;
  title: string;
  titleRu: string;
  titleEn: string;
  icon: string;
  audience: string;
  recommended: string[];
  taboos: string[];
  blessingTemplate: string;
  aiAdvice: string;
}

const protocols: ProtocolCategory[] = [
  {
    id: "quda",
    title: "Quda-Andalar & Sovchilik Odobi",
    titleRu: "Этикет Сватовства и Куда",
    titleEn: "In-Laws & Matchmaking Etiquette",
    icon: "🤝",
    audience: "Bo'lajak qudalar, to'y oldi tashriflar",
    recommended: [
      "Zardo'zi beqasam to'n va tabiiy ipak ro'mol",
      "Sifatli chinni idishlar (Luminarc yoki Rishton kulolchiligi)",
      "Kofe mashinasi yoki premium oshxona kombayni",
      "Elita holva, pista-bodom va samarqand nisholdasi to'plami",
    ],
    taboos: [
      "O'tkir tig'li buyumlar (pichoq, qaychi — rishtalarni uzish timsoli hisoblanadi)",
      "Juda arzon yoki sertifikatsiz qalbaki parfyum",
      "Diniy yoki madaniy e'tiqodga zid ramzlar",
    ],
    blessingTemplate: "Qudachiligimiz ming yillik, rishtalarimiz mustahkam, yoshlarimiz qo'sha-qari bo'lsin!",
    aiAdvice: "O'zbek xalqida qudalarga taqdim etiladigan sovg'a birinchi navbatda oilaning ehtiromi va yuksak madaniyatini ko'rsatadi. Milliy zardo'zi va sifatli chinni idishlar eng yuksak ehtirom belgisidir.",
  },
  {
    id: "kelin",
    title: "Kelin Salom & Yangi Xonadon",
    titleRu: "Келин Салом и Молодая Семья",
    titleEn: "Kelin Salom & New Household",
    icon: "👰",
    audience: "Kelin tushgan xonadon, yosh oila",
    recommended: [
      "Dyson Airwrap yoki soch parvarishi flagmani",
      "Sadafli yong'oq zargarlik sandiqchasi",
      "Oshxona uchun havo qovurgichi (Air Fryer) yoki multivarka",
      "Misr paxtasidan qirollik o'rin-ko'rpa to'plami",
    ],
    taboos: [
      "Eski modifikatsiyadagi maishiy texnika",
      "Tozalash vositalari (dastlabki kunlarda berish nojoiz)",
    ],
    blessingTemplate: "Yangi qadamingiz qutlug' kelsin, xonadoningiz doimo fayz-u baraka, quvonch va chaqaloqlar kulgusiga to'lsin!",
    aiAdvice: "Kelin salom sovg'asi yosh kelinning yangi uyda o'zini qulay va qadrli his qilishiga xizmat qilishi lozim. Shaxsiy go'zallik va qulaylik gadjetlari eng sevimli tanlovdir.",
  },
  {
    id: "otaona",
    title: "Ota-Onaga Ehtirom & Duoli Sovg'alar",
    titleRu: "Уважение Родителям и Благословение",
    titleEn: "Honoring Parents & Blessings",
    icon: "🤲",
    audience: "Otalar, onalar va nuroniy bobo-bovilar",
    recommended: [
      "Buxoro zardo'zi qo'lda tikilgan ipak ro'mol",
      "Ortopedik massaj yostig'i va salomatlik gadjetlari",
      "Yengil issiq ushlovchi zanglamas po'lat termos (Stanley/Biostal)",
      "Katta formatli nafis Qur'on yoki ma'naviy kitoblar to'plami",
    ],
    taboos: [
      "Murakkab va kichik tugmali tushunarsiz texnologiyalar",
      "Og'ir yuklama keltiruvchi qiyin anjomlar",
    ],
    blessingTemplate: "Boshimizdagi baland tog'imiz, duogo'yimiz — umringiz uzoq, taningiz doimo sog' bo'lsin!",
    aiAdvice: "Ota-onaga sovg'a tanlashda ularning salomatligi, iliqligi va qulayligiga xizmat qiluvchi narsalar eng aziz hisoblanadi. Har bir sovg'a samimiy duo bilan bezalishi shart.",
  },
  {
    id: "rahbar",
    title: "Rahbarlar & Hamkasblar Odobi",
    titleRu: "Этикет Руководителей и Коллег",
    titleEn: "Colleagues and managers",
    icon: "💼",
    audience: "Biznes hamkorlar, direktorlar, jamoa",
    recommended: [
      "Keychron K2 Pro mexanik simsiz klaviatura",
      "Sony WH-1000XM5 shovqin so'ndiruvchi naushnik",
      "Kindle Paperwhite elektron kitob mutolaa plansheti",
      "Charm g'ilofli premium xattotlik qalami va bloknot",
    ],
    taboos: [
      "Haddan tashqari shaxsiy buyumlar (kiyim-kechak, qimmatbaho atirlar)",
      "Qimmatligi bois pora sifatida qabul qilinishi mumkin bo'lgan haddan oshiq hadyalar",
    ],
    blessingTemplate: "Faoliyatingizda yangi yuksak marralar, bardavom muvaffaqiyat va yuksak ehtirom tilaymiz!",
    aiAdvice: "Ishbilarmonlik etiketida betaraf, foydali va intellektual xarakterdagi texnologiyalar hamda qulay kitob o'quvchi uskunalar eng yuqori professional maqomga ega.",
  },
];

export default function LuxuryCulturalAdvisor() {
  const { language } = useTranslation();
  const [activeId, setActiveId] = useState<string>("quda");
  const current = protocols.find((p) => p.id === activeId) || protocols[0];

  return (
    <section className="relative overflow-hidden">
      <div className="card-luxury-elevated p-6 sm:p-9 bg-white dark:bg-[#11131f] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-slate-100 dark:border-white/10">
          <div>
            <h2 className="font-display font-semibold text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">
              {language === "uz"
                ? "Har Bir Tantananing O'ziga Xos Nozik Odobi Bor"
                : language === "ru"
                ? "Каждое Торжество Требует Своего Этикета"
                : "Every Celebration Honors Its Own Bespoke Etiquette"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              {language === "uz"
                ? "Milliy mentalitetimizda qaysi vaziyatda nima berish munosib, nimalar esa noo'rin? Sovg'a AI sun'iy intellekti buni aniq biladi."
                : language === "ru"
                ? "Что уместно дарить в узбекских традициях, а чего стоит избегать? Советник Sovg'a AI знает все тонкости."
                : "What is auspicious to gift in Uzbek culture and what taboos should you avoid? Sovg'a AI guides you with precision."}
            </p>
          </div>

          <Link
            href="/cultural-etiquette"
            className="text-xs font-bold text-amber-700 dark:text-amber-300 hover:text-amber-800 flex items-center gap-2 self-start md:self-auto bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 px-4 py-2.5 rounded-xl border border-[var(--line)] dark:border-amber-500/20 transition cursor-pointer shadow-xs"
          >
            <span>
              {language === "uz"
                ? "To'liq Odob Qoidalari"
                : language === "ru"
                ? "Все Правила Этикета"
                : "Explore All Etiquette Rules"}
            </span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.2]" />
          </Link>
        </div>

        {/* 4 Protocol Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-8">
          {protocols.map((p) => {
            const isSelected = p.id === activeId;
            const tabTitle = language === "uz" ? p.title.split("&")[0] : language === "ru" ? p.titleRu : p.titleEn;
            return (
              <button
                key={p.id}
                onClick={() => setActiveId(p.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                  isSelected
                    ? "bg-slate-900 dark:bg-amber-400 text-white dark:text-white border-slate-900 dark:border-amber-400 shadow-md font-bold"
                    : "bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-white/10"
                }`}
              >
                <span className="text-xl">{p.icon}</span>
                <span className="text-xs font-bold truncate">{tabTitle}</span>
              </button>
            );
          })}
        </div>

        {/* Protocol Detail Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Recommendations & Taboos */}
          <div className="lg:col-span-7 space-y-5">
            {/* AI Advice Summary */}
            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-[var(--line)] dark:border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 leading-relaxed shadow-xs">
              <div className="flex items-center gap-2 font-bold mb-1 text-amber-950 dark:text-amber-300">
                <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 stroke-[2.2]" />
                <span>
                  {language === "uz"
                    ? "AI Madaniy Tavsiyasi:"
                    : language === "ru"
                    ? "Культурный Совет AI:"
                    : "AI Cultural Insight:"}
                </span>
              </div>
              <p>{current.aiAdvice}</p>
            </div>

            {/* Dos (Recommended) */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[2.2]" />
                <span>
                  {language === "uz"
                    ? "Eng munosib va qadrli sovg'alar:"
                    : language === "ru"
                    ? "Наиболее подходящие и ценные подарки:"
                    : "Recommended & Auspicious Gifts:"}
                </span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {current.recommended.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/10 text-xs text-slate-700 dark:text-slate-300 font-medium flex items-start gap-2 shadow-2xs"
                  >
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Don'ts (Taboos) */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-rose-800 dark:text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 stroke-[2.2]" />
                <span>
                  {language === "uz"
                    ? "Ushbu vaziyatda tavsiya etilmaydigan buyumlar:"
                    : language === "ru"
                    ? "Предметы, которых следует избегать:"
                    : "Cultural Taboos & Items to Avoid:"}
                </span>
              </span>
              <div className="space-y-1.5">
                {current.taboos.map((taboo, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 text-xs text-rose-900 dark:text-rose-200 flex items-center gap-2 shadow-2xs"
                  >
                    <span className="text-rose-500 dark:text-rose-400 font-bold">✕</span>
                    <span>{taboo}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Cultural Blessing Box */}
          <div className="lg:col-span-5 p-6 sm:p-7 rounded-2xl text-white shadow-sm space-y-4 border border-white/10 bg-slate-900">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Quote className="w-4 h-4 stroke-[2.2]" />
              <span>
                {language === "uz"
                  ? "Samimiy Duo & Tabrik Matni"
                  : language === "ru"
                  ? "Искреннее Дуа и Благословение"
                  : "Traditional Blessing & Best Wishes"}
              </span>
            </div>
            <p className="font-display font-medium text-base sm:text-lg leading-relaxed text-amber-100 italic">
              “{current.blessingTemplate}”
            </p>
            <p className="text-xs text-slate-400">
              {language === "uz"
                ? "Ushbu tabrik so'zlarini xattotlik kartochkasi orqali sovg'a qutisiga qo'shib topshirish eng yuksak ehtirom belgisidir."
                : language === "ru"
                ? "Приложить эти слова в каллиграфической открытке к подарку — высший знак почтения."
                : "Adding these traditional warm wishes via a gold-script calligraphy card is a mark of utmost esteem."}
            </p>
            <div className="pt-2">
              <Link
                href="/calligraphy-card"
                className="btn-luxury-gold w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>
                  {language === "uz"
                    ? "Xattotlik Kartochkasiga Joylash"
                    : language === "ru"
                    ? "Создать Каллиграфическую Открытку"
                    : "Design Calligraphy Card"}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
