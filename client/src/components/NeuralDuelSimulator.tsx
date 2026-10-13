import { useState } from "react";
import { Link } from "wouter";
import { Swords, Trophy, Zap, ArrowUpRight, ShieldCheck, Flame, Star, CheckCircle2, ArrowRight } from "../lib/icons";
import { formatPrice } from "../lib/api";
import { useTranslation } from "../lib/i18n";

interface DuelPreset {
  id: string;
  label: string;
  productA: {
    name: string;
    store: string;
    price: number;
    score: number;
    warranty: string;
    stats: { label: string; value: number }[];
    url: string;
    summary: string;
  };
  productB: {
    name: string;
    store: string;
    price: number;
    score: number;
    warranty: string;
    stats: { label: string; value: number }[];
    url: string;
    summary: string;
  };
  winner: "A" | "B";
  aiVerdict: string;
}

export default function NeuralDuelSimulator() {
  const { language } = useTranslation();
  const [selectedDuel, setSelectedDuel] = useState<string>("headphones");

  const duels: DuelPreset[] = [
    {
      id: "headphones",
      label: "AirPods Pro 2 vs Sony WH-1000XM5",
      productA: {
        name: "Apple AirPods Pro 2 (USB-C)",
        store: "Texnomart",
        price: 2750000,
        score: 9.4,
        warranty: language === "uz" ? "1 Yil Apple Care" : language === "ru" ? "1 Год Apple Care" : "1-Year Official Apple Care",
        stats: [
          { label: language === "uz" ? "Portativlik & Qulaylik" : language === "ru" ? "Портативность и Удобство" : "Portability & Comfort", value: 98 },
          { label: language === "uz" ? "Shovqin So'ndirish (ANC)" : language === "ru" ? "Шумоподавление (ANC)" : "Active Noise Cancellation", value: 92 },
          { label: language === "uz" ? "Ekologik Apple Aloqa" : language === "ru" ? "Экосистема Apple" : "iOS Ecosystem Synergy", value: 100 },
          { label: language === "uz" ? "Batareya Quvvati" : language === "ru" ? "Автономность" : "Battery Endurance", value: 85 },
        ],
        url: "https://texnomart.uz/katalog/apple-airpods-pro-2/",
        summary:
          language === "uz"
            ? "Kundalik yurish, sport va iPhone egalari uchun mukammal yengillik."
            : language === "ru"
            ? "Идеальная легкость для прогулок, спорта и владельцев iPhone."
            : "Ultra-compact form factor tailored for sport, calls, and instant Apple ecosystem sync.",
      },
      productB: {
        name: "Sony WH-1000XM5 ANC Flagship",
        store: "Texnomart",
        price: 3200000,
        score: 9.6,
        warranty: language === "uz" ? "12 Oy Rasmiy Sony" : language === "ru" ? "12 Месяцев Официально" : "12-Month Official Warranty",
        stats: [
          { label: language === "uz" ? "Portativlik & Qulaylik" : language === "ru" ? "Портативность и Удобство" : "Portability & Comfort", value: 84 },
          { label: language === "uz" ? "Shovqin So'ndirish (ANC)" : language === "ru" ? "Шумоподавление (ANC)" : "Active Noise Cancellation", value: 99 },
          { label: language === "uz" ? "Ovoz Sifati (Hi-Res)" : language === "ru" ? "Качество звука (Hi-Res)" : "Hi-Res Studio Fidelity", value: 98 },
          { label: language === "uz" ? "Batareya Quvvati (30h)" : language === "ru" ? "Батарея (30ч)" : "30-Hour Battery Life", value: 99 },
        ],
        url: "https://texnomart.uz/katalog/sony-wh-1000xm5/",
        summary:
          language === "uz"
            ? "Sayohat, samolyot va mutlaq akustik zavq izlovchilar uchun jahon yetakchisi."
            : language === "ru"
            ? "Мировой лидер для путешествий, самолетов и аудиофилов."
            : "World benchmark for aircraft noise isolation, LDAC wireless audio, and 30-hour flights.",
      },
      winner: "B",
      aiVerdict:
        language === "uz"
          ? "Agar asosiy mezon sof akustik sifat va 30 soatlik mustahkam batareya bo'lsa — Sony WH-1000XM5 g'olib. Biroq kundalik ixchamlik uchun AirPods Pro 2 yanada qulayroq."
          : language === "ru"
          ? "Если критерий — премиальный звук и 30 часов работы, побеждает Sony WH-1000XM5. Для повседневного карманного комфорта — AirPods Pro 2."
          : "For pure acoustic fidelity, flights, and unmatched 30-hour stamina, Sony WH-1000XM5 claims the trophy. For everyday pocket convenience and Siri integration, AirPods Pro 2 remains supreme.",
    },
    {
      id: "coffee",
      label: "De'Longhi Mini Me vs Korkmaz Kahvekolik",
      productA: {
        name: "De'Longhi Nescafé Dolce Gusto Mini Me",
        store: "Uzum Market",
        price: 650000,
        score: 9.3,
        warranty: language === "uz" ? "2 Yil Rasmiy Kafolat" : language === "ru" ? "2 Года Гарантии" : "2-Year Official Warranty",
        stats: [
          { label: language === "uz" ? "Tayyorlash Tezligi" : language === "ru" ? "Скорость готовки" : "Brewing Velocity", value: 95 },
          { label: language === "uz" ? "Retseptlar Xilma-xilligi" : language === "ru" ? "Разнообразие рецептов" : "Recipe Variety", value: 98 },
          { label: language === "uz" ? "Oshxonada Joy Tejamkorligi" : language === "ru" ? "Компактность" : "Countertop Compactness", value: 96 },
          { label: language === "uz" ? "Toshkentda Yetkazish" : language === "ru" ? "Доставка по Ташкенту" : "Fast Tashkent Delivery", value: 99 },
        ],
        url: "https://uzum.uz/uz/product/kofemashina-delonghi-mini-me-284912",
        summary:
          language === "uz"
            ? "15 bar bosim ostida kapuchino, latte va espresso tayyorlaydi."
            : language === "ru"
            ? "Готовит капучино, латте и эспрессо под давлением 15 бар."
            : "Brews velvety espresso, cappuccino, latte, and iced drinks at 15-bar pump pressure.",
      },
      productB: {
        name: "Korkmaz Kahvekolik Turkish Coffee Maker",
        store: "MediaPark",
        price: 520000,
        score: 8.9,
        warranty: language === "uz" ? "12 Oy Rasmiy Diler" : language === "ru" ? "12 Месяцев Дилер" : "12-Month Official Dealer",
        stats: [
          { label: language === "uz" ? "Turkcha An'anaviy Ta'm" : language === "ru" ? "Традиционный вкус" : "Traditional Turkish Foam", value: 100 },
          { label: language === "uz" ? "Avtomatik To'xtash" : language === "ru" ? "Авто-стоп" : "Overflow Auto-Stop", value: 90 },
          { label: language === "uz" ? "Xomashyo Tejamkorligi" : language === "ru" ? "Экономичность" : "Grounds Efficiency", value: 95 },
          { label: language === "uz" ? "Retseptlar Xilma-xilligi" : language === "ru" ? "Разнообразие" : "Recipe Variety", value: 75 },
        ],
        url: "https://mediapark.uz/products/view/korkmaz-kahvekolik",
        summary:
          language === "uz"
            ? "Haqiqiy qumda pishganidek ko'pikli sharqona qahva ishqibozlari uchun."
            : language === "ru"
            ? "Для любителей настоящего восточного кофе с густой пенкой."
            : "Authentic Turkish coffee brewed with thick crema and thermal sensor overflow prevention.",
      },
      winner: "A",
      aiVerdict:
        language === "uz"
          ? "Yosh oila va sovg'a sifatidagi universallik bo'yicha De'Longhi g'olib: 15 dan ortiq turdagi issiq va sovuq ichimliklar tayyorlay oladi."
          : language === "ru"
          ? "Как универсальный свадебный подарок побеждает De'Longhi: более 15 видов напитков."
          : "As a universal wedding gift and kitchen centerpiece, De'Longhi takes first place with 15+ hot and cold specialty beverages.",
    },
  ];

  const current = duels.find((d) => d.id === selectedDuel) || duels[0];

  return (
    <section className="relative overflow-hidden">
      <div className="card-luxury-elevated p-6 sm:p-10 bg-white border border-slate-200">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-6 border-b border-slate-100">
          <div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight">
              {language === "uz" ? "Ikki mahsulot yonma-yon" : language === "ru" ? "Два товара рядом" : "Two products side by side"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {language === "uz" ? "Qaysi biri o'z narxiga arziydi? Asosiy xususiyatlar bo'yicha solishtiring." : language === "ru" ? "Какой из них стоит своих денег? Сравните по главным характеристикам." : "Which one is worth the money? Compare them on the things that matter."}
            </p>
          </div>

          <div className="flex gap-2">
            {duels.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDuel(d.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedDuel === d.id
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-white/5 dark:hover:bg-white/10 dark:text-slate-300"
                }`}
              >
                {d.label.split(" vs ")[0]} vs ...
              </button>
            ))}
          </div>
        </div>

        {/* Duel Face-Off Arena */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
          {/* VS Center Badge */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-slate-950 text-amber-400 border border-amber-400/80 items-center justify-center font-display font-bold text-sm shadow-xl">
            VS
          </div>

          {/* Fighter A */}
          <div className={`p-6 rounded-2xl border transition-all ${
            current.winner === "A" ? "bg-[#eef0ff] dark:bg-amber-500/10 border-[#c7cbfe] dark:border-amber-500/30" : "bg-[#f7f7fa] dark:bg-white/[0.03] border-[var(--line)]"
          }`}>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-900 text-white font-bold">
                  {current.productA.store}
                </span>
                <h3 className="font-display font-bold text-lg text-slate-900 mt-1">
                  {current.productA.name}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-slate-900 block">
                  {formatPrice(current.productA.price)}
                </span>
                <span className="text-xs font-bold text-amber-600">
                  {current.productA.score} / 10 {language === "uz" ? "ball" : language === "ru" ? "баллов" : "pts"}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              {current.productA.summary}
            </p>

            {/* Stat Bars */}
            <div className="space-y-2.5 mb-6">
              {current.productA.stats.map((s, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                    <span>{s.label}</span>
                    <span className="font-mono">{s.value}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-900 rounded-full transition-all duration-200"
                      style={{ width: `${s.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <a
              href={current.productA.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full btn-luxury-primary py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>
                {language === "uz"
                  ? `${current.productA.store}da Xarid`
                  : language === "ru"
                  ? `Купить в ${current.productA.store}`
                  : `Buy on ${current.productA.store}`}
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-80" />
            </a>
          </div>

          {/* Fighter B */}
          <div className={`p-6 rounded-2xl border transition-all ${
            current.winner === "B" ? "bg-[#eef0ff] dark:bg-amber-500/10 border-[#c7cbfe] dark:border-amber-500/30" : "bg-[#f7f7fa] dark:bg-white/[0.03] border-[var(--line)]"
          }`}>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-900 text-white font-bold">
                  {current.productB.store}
                </span>
                <h3 className="font-display font-bold text-lg text-slate-900 mt-1">
                  {current.productB.name}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-slate-900 block">
                  {formatPrice(current.productB.price)}
                </span>
                <span className="text-xs font-bold text-amber-600">
                  {current.productB.score} / 10 {language === "uz" ? "ball" : language === "ru" ? "баллов" : "pts"}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              {current.productB.summary}
            </p>

            {/* Stat Bars */}
            <div className="space-y-2.5 mb-6">
              {current.productB.stats.map((s, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                    <span>{s.label}</span>
                    <span className="font-mono">{s.value}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-900 rounded-full transition-all duration-200"
                      style={{ width: `${s.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <a
              href={current.productB.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full btn-luxury-primary py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>
                {language === "uz"
                  ? `${current.productB.store}da Xarid`
                  : language === "ru"
                  ? `Купить в ${current.productB.store}`
                  : `Buy on ${current.productB.store}`}
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-80" />
            </a>
          </div>
        </div>

        {/* AI Final Verdict Banner */}
        <div className="mt-6 p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-amber-400 block tracking-wider">
                {language === "uz" ? "Xulosa" : language === "ru" ? "Вывод" : "Verdict"}
              </span>
              <p className="text-xs text-slate-200 font-medium leading-relaxed">
                {current.aiVerdict}
              </p>
            </div>
          </div>

          <Link
            href="/duel"
            className="px-4 py-2.5 rounded-xl btn-luxury-gold text-slate-950 font-semibold text-xs flex items-center justify-center gap-1.5 shrink-0 shadow-md transition whitespace-nowrap cursor-pointer"
          >
            <Swords className="w-3.5 h-3.5" />
            <span>
              {language === "uz" ? "O'z mahsulotlaringizni solishtiring" : language === "ru" ? "Сравнить свои товары" : "Compare your own products"}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
