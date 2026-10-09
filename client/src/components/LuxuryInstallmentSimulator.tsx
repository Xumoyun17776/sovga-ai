import { useState } from "react";
import { Calculator, CreditCard, Check, ArrowRight, ShieldCheck, Sparkles, Building2 } from "lucide-react";
import { formatPrice } from "../lib/api";
import { useTranslation } from "../lib/i18n";

const installmentProviders = [
  {
    name: "Uzum Nasiya",
    badgeUz: "1 daqiqada tasdiqlash",
    badgeRu: "Одобрение за 1 минуту",
    badgeEn: "1-minute scoring",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    terms: [3, 6, 12],
    calcMonth: (amount: number, months: number) => {
      const rate = months === 3 ? 1.0 : months === 6 ? 1.15 : 1.28;
      return Math.round((amount * rate) / months);
    },
    prosUz: "Pasport va plastik karta kifoya, skoring 1 daqiqada.",
    prosRu: "Нужны только паспорт и карта, скоринг за 1 минуту.",
    prosEn: "Only national ID and card required, instant 1-min scoring.",
  },
  {
    name: "Texnomart Muddatli",
    badgeUz: "0% Aksiyalar mavjud",
    badgeRu: "Доступны акции 0%",
    badgeEn: "0% markup promos",
    color: "bg-rose-50 text-rose-700 border-rose-200",
    terms: [6, 12, 24],
    calcMonth: (amount: number, months: number) => {
      const rate = months === 6 ? 1.08 : months === 12 ? 1.22 : 1.38;
      return Math.round((amount * rate) / months);
    },
    prosUz: "Barcha maishiy texnika va smartfonlarga do'konda rasmiylashtirish.",
    prosRu: "Оформление на всю технику и смартфоны прямо в магазине.",
    prosEn: "In-store and online approval across all major electronics.",
  },
  {
    name: "Alif Nasiya",
    badgeUz: "Shariat standartlari",
    badgeRu: "Стандарты Шариата",
    badgeEn: "Sharia compliant",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    terms: [6, 12, 18],
    calcMonth: (amount: number, months: number) => {
      const rate = months === 6 ? 1.14 : months === 12 ? 1.26 : 1.36;
      return Math.round((amount * rate) / months);
    },
    prosUz: "Shariat kengashi tomonidan sertifikatlangan halol nasiya.",
    prosRu: "Сертифицированная исламская рассрочка (мурабаха).",
    prosEn: "Halal financing certified by official Islamic scholars.",
  },
  {
    name: "Anorbank / ZoodPay",
    badgeUz: "Karta orqali onlayn",
    badgeRu: "Онлайн по карте",
    badgeEn: "Online split-pay",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    terms: [4, 6, 12],
    calcMonth: (amount: number, months: number) => {
      const rate = months === 4 ? 1.0 : months === 6 ? 1.12 : 1.25;
      return Math.round((amount * rate) / months);
    },
    prosUz: "Ilovada 4 ta teng to'lovga 0% ortiqcha to'lovsiz bo'lib to'lash.",
    prosRu: "Оплата 4 равными частями без переплат в приложении.",
    prosEn: "Pay in 4 equal installments with zero markup.",
  },
];

export default function LuxuryInstallmentSimulator() {
  const { language } = useTranslation();
  const [amount, setAmount] = useState<number>(2500000);
  const [selectedMonths, setSelectedMonths] = useState<number>(12);

  const presets = [
    {
      labelUz: "650 ming (Kofe mashina)",
      labelRu: "650 тыс (Кофемашина)",
      labelEn: "650k UZS (Coffee Maker)",
      value: 650000,
    },
    {
      labelUz: "1.5 mln (Gril / Sovg'a)",
      labelRu: "1.5 млн (Гриль / Подарок)",
      labelEn: "1.5M UZS (Grill / Gift)",
      value: 1500000,
    },
    {
      labelUz: "2.8 mln (AirPods / Watch)",
      labelRu: "2.8 млн (AirPods / Часы)",
      labelEn: "2.8M UZS (AirPods / Watch)",
      value: 2800000,
    },
    {
      labelUz: "4.5 mln (Robot Pilesos)",
      labelRu: "4.5 млн (Робот-пылесос)",
      labelEn: "4.5M UZS (Robot Vacuum)",
      value: 4500000,
    },
    {
      labelUz: "7.0 mln (Dyson / Noutbuk)",
      labelRu: "7.0 млн (Dyson / Ноутбук)",
      labelEn: "7.0M UZS (Dyson / Laptop)",
      value: 7000000,
    },
  ];

  return (
    <section className="relative overflow-hidden">
      <div className="card-luxury-elevated p-6 sm:p-9 bg-white border border-slate-200">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full luxury-gold-chip text-xs font-bold uppercase tracking-wider mb-2">
              <Calculator className="w-3.5 h-3.5 text-amber-600" />
              <span>
                {language === "uz"
                  ? "Smart Nasiya & Muddatli To'lov Simulyatori"
                  : language === "ru"
                  ? "Симулятор Рассрочки и Насия"
                  : "Smart Installment & Nasiya Simulator"}
              </span>
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
              {language === "uz"
                ? "Qimmatbaho Sovg'ani Oson Va Shaffof Rejalashtiring"
                : language === "ru"
                ? "Планируйте Дорогие Подарки Прозрачно и Выгодно"
                : "Plan High-Ticket Gifts with Complete Transparency"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
              {language === "uz"
                ? "Uzum Nasiya, Texnomart va Alif bo'yicha real oylik to'lovlarni hisoblang. Yashirin komissiyalarsiz!"
                : language === "ru"
                ? "Рассчитайте ежемесячные выплаты через Uzum Nasiya, Texnomart и Alif без скрытых комиссий!"
                : "Calculate real monthly payments via Uzum Nasiya, Texnomart, and Alif without hidden fees!"}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              {language === "uz"
                ? "0% Ortiqcha To'lovli Aksiyalar Mavjud"
                : language === "ru"
                ? "Доступны акции 0% переплаты"
                : "0% Markup Installments Available"}
            </span>
          </div>
        </div>

        {/* Interactive Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-8">
          {/* Amount Slider and Presets */}
          <div className="lg:col-span-7 space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-600">
                  {language === "uz" ? "Sovg'a yoki tovar narxi:" : language === "ru" ? "Стоимость подарка или товара:" : "Gift or item price:"}
                </span>
                <span className="font-display font-black text-2xl text-slate-900">
                  {formatPrice(amount)}
                </span>
              </div>
              <input
                type="range"
                min="300000"
                max="10000000"
                step="100000"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>300,000 UZS</span>
                <span>5,000,000 UZS</span>
                <span>10,000,000 UZS</span>
              </div>
            </div>

            {/* Quick Amount Presets */}
            <div className="flex flex-wrap gap-2 pt-1">
              {presets.map((p, idx) => {
                const label = language === "uz" ? p.labelUz : language === "ru" ? p.labelRu : p.labelEn;
                return (
                  <button
                    key={idx}
                    onClick={() => setAmount(p.value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      amount === p.value
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Months Selector */}
            <div className="pt-2">
              <span className="text-xs font-bold text-slate-600 block mb-2">
                {language === "uz" ? "Muddat:" : language === "ru" ? "Срок:" : "Tenure:"}
              </span>
              <div className="flex gap-2">
                {[3, 6, 12, 24].map((m) => (
                  <button
                    key={m}
                    onClick={() => setSelectedMonths(m)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedMonths === m
                        ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                        : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    {m} {language === "uz" ? "oy" : language === "ru" ? "мес" : "mos"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Snapshot Card */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 p-6 rounded-3xl text-white shadow-xl space-y-4">
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 block">
              {language === "uz"
                ? "Hisoblangan O'rtacha Oylik"
                : language === "ru"
                ? "Средний Ежемесячный Платеж"
                : "Estimated Monthly Payment"}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-display font-black text-white">
                {formatPrice(Math.round((amount * 1.2) / selectedMonths))}
              </span>
              <span className="text-xs text-slate-400">
                {language === "uz" ? "/ oyiga" : language === "ru" ? "/ в месяц" : "/ month"}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {language === "uz"
                ? `${selectedMonths} oyga bo'linganda oylik maoshingizga ortiqcha og'irlik tushirmaydi.`
                : language === "ru"
                ? `При рассрочке на ${selectedMonths} мес. нагрузка на ваш ежемесячный доход минимальна.`
                : `Divided over ${selectedMonths} months with minimal impact on your monthly budget.`}
            </p>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>{language === "uz" ? "Boshlang'ich to'lov:" : language === "ru" ? "Первоначальный взнос:" : "Down payment:"}</span>
              <span className="font-bold text-emerald-400">
                {language === "uz" ? "0 UZS (Kerak emas)" : language === "ru" ? "0 UZS (Не требуется)" : "0 UZS (Zero Down)"}
              </span>
            </div>
          </div>
        </div>

        {/* 4 Providers Breakdown Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {installmentProviders.map((prov, idx) => {
            const monthly = prov.calcMonth(amount, selectedMonths);
            const badge = language === "uz" ? prov.badgeUz : language === "ru" ? prov.badgeRu : prov.badgeEn;
            const pros = language === "uz" ? prov.prosUz : language === "ru" ? prov.prosRu : prov.prosEn;
            return (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-slate-900">{prov.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${prov.color}`}>
                      {badge}
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">
                      {language === "uz" ? "Oylik to'lov:" : language === "ru" ? "Ежемесячный платеж:" : "Monthly payment:"}
                    </span>
                    <p className="font-display font-extrabold text-lg text-slate-900">
                      {formatPrice(monthly)}
                      <span className="text-[11px] font-normal text-slate-500">
                        {language === "uz" ? " /oy" : language === "ru" ? " /мес" : " /mo"}
                      </span>
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                    {pros}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center gap-1 text-[10px] font-bold text-indigo-600">
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>
                    {language === "uz"
                      ? "Pasport & Karta bilan"
                      : language === "ru"
                      ? "По паспорту и карте"
                      : "Instant ID & Card Approval"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
