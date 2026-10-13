import { useState } from "react";
import { Navigation, Clock, ShieldCheck, MapPin, Truck, CheckCircle2, ArrowUpRight, Zap } from "../lib/icons";
import { Link } from "wouter";
import { useTranslation } from "../lib/i18n";

interface HubNode {
  id: string;
  name: string;
  district: string;
  coverage: string;
  eta: string;
  status: "active" | "high_traffic";
  specialty: string;
  officialRetailer: string;
}

export default function TashkentHubRadar() {
  const { language } = useTranslation();
  const [activeHub, setActiveHub] = useState<string>("sergeli");

  const hubs: HubNode[] = [
    {
      id: "sergeli",
      name: language === "uz" ? "Uzum Sergeli Markaziy Logistika Markazi" : language === "ru" ? "Центральный логистический хаб Uzum Сергели" : "Uzum Sergeli Central Fulfillment Hub",
      district: language === "uz" ? "Sergeli tumani, Toshkent" : language === "ru" ? "Сергелийский район, Ташкент" : "Sergeli District, Tashkent",
      coverage: language === "uz" ? "Toshkent shahri va barcha 14 ta viloyat" : language === "ru" ? "Ташкент и все 14 областей" : "All Tashkent districts & 14 regional hubs",
      eta: language === "uz" ? "Ertaga 100% yetkazish" : language === "ru" ? "100% доставка назавтра" : "Next-day 100% guaranteed",
      status: "active",
      specialty: language === "uz" ? "500,000+ tovarlar yagona saralash markazi" : language === "ru" ? "Единый сортировочный центр 500,000+ товаров" : "500,000+ SKU automated sorting facility",
      officialRetailer: "Uzum Market",
    },
    {
      id: "chilonzor",
      name: language === "uz" ? "Texnomart Chilonzor Flagman Gipermarketi" : language === "ru" ? "Флагманский гипермаркет Texnomart Чиланзар" : "Texnomart Chilonzor Flagship Hypercenter",
      district: language === "uz" ? "Chilonzor tumani, Toshkent" : language === "ru" ? "Чиланзарский район, Ташкент" : "Chilonzor District, Tashkent",
      coverage: language === "uz" ? "Toshkent bo'ylab ekspress kuryer" : language === "ru" ? "Экспресс-курьер по Ташкенту" : "Express door-to-door courier across Tashkent",
      eta: language === "uz" ? "3 soatda eshikkacha" : language === "ru" ? "До двери за 3 часа" : "3-Hour express delivery",
      status: "active",
      specialty: language === "uz" ? "Rasmiy Apple, Samsung, Sony servis dilerligi" : language === "ru" ? "Официальный дилер Apple, Samsung, Sony" : "Authorized Apple, Samsung & Sony fulfillment center",
      officialRetailer: "Texnomart",
    },
    {
      id: "qoratosh",
      name: language === "uz" ? "MediaPark Qoratosh Mega Markazi" : language === "ru" ? "Мега-центр MediaPark Караташ" : "MediaPark Qoratosh Mega Hub",
      district: language === "uz" ? "Shayxontohur tumani, Toshkent" : language === "ru" ? "Шайхантахурский район, Ташкент" : "Shaykhantakhur District, Tashkent",
      coverage: language === "uz" ? "Toshkent va Toshkent viloyati" : language === "ru" ? "Ташкент и Ташкентская область" : "Greater Tashkent Metropolitan Area",
      eta: language === "uz" ? "24 soat ichida" : language === "ru" ? "В течение 24 часов" : "Within 24 hours",
      status: "active",
      specialty: language === "uz" ? "Yirik maishiy texnika va kafolatli o'rnatish" : language === "ru" ? "Крупная бытовая техника с установкой" : "Major home appliances with professional setup",
      officialRetailer: "MediaPark",
    },
    {
      id: "olcha_hub",
      name: language === "uz" ? "Olcha Express & Smartfonlar Hubi" : language === "ru" ? "Хаб Olcha Express и Смартфонов" : "Olcha Express & Smartphone Hub",
      district: language === "uz" ? "Toshkent markazi va viloyatlar" : language === "ru" ? "Центр Ташкента и регионы" : "Central Tashkent & Nationwide",
      coverage: language === "uz" ? "Olcha Express kuryerlik tarmog'i" : language === "ru" ? "Курьерская сеть Olcha Express" : "Olcha Express Courier Network",
      eta: language === "uz" ? "Toshkentda 1 kun / Viloyatlarga 1-3 kun" : language === "ru" ? "1 день по Ташкенту / 1-3 дня по регионам" : "1 Day Tashkent / 1-3 Days Nationwide",
      status: "active",
      specialty: language === "uz" ? "Smartfonlar (iPhone, Samsung), noutbuklar va 0% Nasiya" : language === "ru" ? "Смартфоны (iPhone, Samsung), ноутбуки и 0% рассрочка" : "Smartphones (iPhone, Samsung), laptops & 0% installments",
      officialRetailer: "Olcha.uz",
    },
  ];

  const current = hubs.find((h) => h.id === activeHub) || hubs[0];

  return (
    <section className="relative overflow-hidden">
      <div className="card-luxury-elevated p-6 sm:p-10 bg-white border border-slate-200">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-6 border-b border-slate-100">
          <div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight">
              {language === "uz"
                ? "Real Vaqt Rejimida Ombor & Kuryer Telemetriyasi"
                : language === "ru"
                ? "Телеметрия Складов и Курьеров в Реальном Времени"
                : "Warehouses and couriers"}
            </h2>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>
              {language === "uz"
                ? "Barcha Hublar 100% Faol"
                : language === "ru"
                ? "Все Хабы 100% Активны"
                : "All Hubs 100% Operational"}
            </span>
          </div>
        </div>

        {/* 4 Interactive Hub Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
          {hubs.map((hub) => {
            const isSelected = hub.id === activeHub;
            return (
              <button
                key={hub.id}
                onClick={() => setActiveHub(hub.id)}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between h-36 cursor-pointer ${
                  isSelected
                    ? "bg-slate-900 text-white border-slate-900 shadow-md scale-102"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-md ${
                    isSelected ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                  }`}>
                    {hub.officialRetailer}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>ONLINE</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-display font-bold text-xs truncate leading-snug">
                    {hub.name.split(" ")[0]} {hub.name.split(" ")[1]}
                  </h4>
                  <p className={`text-[11px] font-bold mt-1 ${isSelected ? "text-amber-300" : "text-slate-900"}`}>
                    ETA: {hub.eta}
                  </p>
                  <p className={`text-[10px] truncate mt-0.5 ${isSelected ? "text-slate-300" : "text-slate-400"}`}>
                    {hub.district}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Hub Telemetry Detail Box */}
        <div className="p-6 rounded-2xl text-white border border-slate-800 space-y-4 bg-slate-900">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <h3 className="font-display font-bold text-lg text-white">{current.name}</h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{current.district}</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/20 px-3 py-1.5 rounded-xl border border-amber-500/30">
                {current.eta}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="text-slate-400 text-[10px] block">
                {language === "uz" ? "Qamrov Hududi:" : language === "ru" ? "Зона покрытия:" : "Fulfillment Coverage:"}
              </span>
              <span className="font-semibold text-slate-200 block mt-0.5">{current.coverage}</span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="text-slate-400 text-[10px] block">
                {language === "uz" ? "Ixtisoslashuv:" : language === "ru" ? "Специализация:" : "Core Specialization:"}
              </span>
              <span className="font-semibold text-slate-200 block mt-0.5">{current.specialty}</span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="text-slate-400 text-[10px] block">
                {language === "uz" ? "Kafolat & Xavfsizlik:" : language === "ru" ? "Гарантия & Безопасность:" : "Transit Insurance & Security:"}
              </span>
              <span className="font-semibold text-emerald-400 block mt-0.5">
                {language === "uz" ? "100% Sug'urtalangan kuryerlik" : language === "ru" ? "100% Застрахованная доставка" : "100% Insured Priority Transit"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
